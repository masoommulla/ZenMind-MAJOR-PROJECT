import mongoose from 'mongoose';

// Helper to fetch user from request (assumes auth middleware sets req.userId)
export const getUser = async (userId) => {
  const User = mongoose.model('User');
  return await User.findById(userId);
};

// Helper to get Indian Standard Time (IST) now
const getISTNow = () => {
  const now = new Date();
  const istOffset = 330; // minutes
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc + istOffset * 60000);
};

// Helper to get most recent Sunday 00:00 IST
const getLastSundayIST = () => {
  const istNow = getISTNow();
  const day = istNow.getUTCDay(); // 0 = Sunday
  const diff = day; // days since last Sunday
  const lastSunday = new Date(istNow);
  lastSunday.setUTCDate(istNow.getUTCDate() - diff);
  lastSunday.setUTCHours(0, 0, 0, 0);
  return lastSunday;
};

// Reset weekly credits if needed and handle subscription expiration
const handleUserReset = async (user) => {
  const nowIST = getISTNow();
  const lastSundayIST = getLastSundayIST();
  if (!user.lastCreditReset || user.lastCreditReset < lastSundayIST) {
    let weeklyLimit = 0;
    switch (user.subscriptionTier) {
      case 'free':
        weeklyLimit = 10;
        break;
      case 'silver':
        weeklyLimit = 150;
        break;
      case 'gold':
        weeklyLimit = 250;
        break;
      case 'platinum':
        weeklyLimit = Infinity;
        break;
      default:
        weeklyLimit = 0;
    }
    user.aiWeeklyCredits = weeklyLimit === Infinity ? 0 : weeklyLimit;
    user.lastCreditReset = nowIST;
    await user.save();
  }
  if (user.subscriptionExpiresAt) {
    const expiry = new Date(user.subscriptionExpiresAt);
    if (nowIST >= expiry) {
      user.subscriptionTier = 'free';
      user.subscriptionExpiresAt = null;
      user.aiWeeklyCredits = 10;
      await user.save();
    }
  }
};


// Middleware to require a minimum subscription tier
const tierOrder = ['free', 'silver', 'gold', 'platinum'];
export const requireTier = (minTier) => {
  return async (req, res, next) => {
    if (!req.userId) return res.status(401).json({ error: 'Unauthenticated' });
    const user = await getUser(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    // Perform resets and expiry handling
    await handleUserReset(user);
    if (tierOrder.indexOf(user.subscriptionTier) >= tierOrder.indexOf(minTier)) {
      req.user = user; // attach full user object for later use
      return next();
    }
    return res.status(403).json({ error: `${minTier} tier required` });
  };
};

// Middleware to deduct a single AI credit
export const deductAICredit = async (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthenticated' });
  if (req.user.aiCreditsRemaining <= 0) {
    return res.status(403).json({ error: 'No AI credits remaining' });
  }
  req.user.aiCreditsRemaining -= 1;
  await req.user.save();
  next();
};

export default { requireTier, deductAICredit };
