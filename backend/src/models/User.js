import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, required: true, unique: true, trim: true },
  age: { type: Number, required: true, min: 1, max: 120 },
  gender: { type: String, enum: ['male','female','other'], required: true },
  passwordHash: { type: String, required: true },
  isSuspended: { type: Boolean, default: false },
  suspendedUntil: { type: Date, default: null }, // null = permanent when isSuspended=true
  avatar: {
    mime: { type: String },
    data: { type: String } // base64 (no local storage)
  },
  isOnline: { type: Boolean, default: false },
  lastSeen: { type: Date, default: Date.now },
  favouriteResources: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Resource' }],
  onboardingDone: { type: Boolean, default: false },
  onboardingData: {
    goals: { type: [String], default: [] },
    currentMood: { type: Number, default: null }, // 1–5
    stressLevel: { type: Number, default: null }, // 1–5
    completedAt: { type: Date, default: null },
  },
  shareProgressWithTherapist: { type: Boolean, default: false },
  // Subscription & monetization fields
  subscriptionTier: { type: String, enum: ['free','silver','gold','platinum'], default: 'free' },
  aiCreditsRemaining: { type: Number, default: 0 },
  aiWeeklyCredits: { type: Number, default: 0 }, // remaining credits for current week
  lastCreditReset: { type: Date, default: null }, // timestamp of last weekly reset
  subscriptionExpiresAt: { type: Date, default: null }, // subscription end datetime
});

export default mongoose.model('User', userSchema);
