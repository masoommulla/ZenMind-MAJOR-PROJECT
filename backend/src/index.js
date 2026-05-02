import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/auth.js';
import meRoutes from './routes/me.js';

import adminRoutes from './routes/admin.js';
import Admin from './models/Admin.js';
import bcrypt from 'bcryptjs';

const app = express();

app.use(helmet());

const allowedOrigin = process.env.FRONTEND_URL;
app.use(cors({
  origin: allowedOrigin
    ? (origin, cb) => {
        // Allow requests with no origin (same-origin, Postman) or matching origin
        if (!origin || origin === allowedOrigin) return cb(null, true);
        cb(new Error(`CORS: origin ${origin} not allowed`));
      }
    : true, // dev fallback — allow everything
  credentials: true
}));
app.use(cookieParser());
app.use(express.json({ limit: '5mb' }));

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/me', meRoutes);
app.use('/api/admin', adminRoutes);

const port = process.env.PORT || 5000;
const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  throw new Error('Missing MONGODB_URI in env');
}

await mongoose.connect(mongoUri);
// eslint-disable-next-line no-console
console.log('MongoDB connected');

// Seed default Admin
const adminCount = await Admin.countDocuments();
if (adminCount === 0) {
  const passwordHash = await bcrypt.hash('adminZEN', 10);
  await Admin.create({ username: 'AdminZ', passwordHash });
  console.log('Default Admin created: AdminZ / adminZEN');
}

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on port ${port}`);
});

