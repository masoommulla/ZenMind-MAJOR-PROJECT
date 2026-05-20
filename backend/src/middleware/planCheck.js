import mongoose from 'mongoose';

// Helper to fetch user from request (assumes auth middleware sets req.userId)
export const getUser = async (userId) => {
  const User = mongoose.model('User');
  return await User.findById(userId);
};

// Middleware to require a minimum subscription tier
const tierOrder = ['free', 'silver', 'gold', 'platinum'];
export const requireTier = (minTier) => {
  return async (req, res, next) => {
    if (!req.userId) return res.status(401).json({ error: 'Unauthenticated' });
    const user = await getUser(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
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
