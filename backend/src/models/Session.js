import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  therapist: { type: mongoose.Schema.Types.ObjectId, ref: 'Therapist', required: true },
  therapistName: { type: String, required: true },
  date: { type: Date, required: true },
  amountPaid: { type: Number, required: true },
  status: { type: String, enum: ['booked', 'completed', 'cancelled'], default: 'booked' },
  rating: { type: Number, min: 1, max: 5 },
  review: { type: String, default: '' }
}, { timestamps: true });

export const Session = mongoose.model('Session', sessionSchema);
