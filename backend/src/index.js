import 'dotenv/config';
import { setDefaultResultOrder } from 'dns';
// Force IPv4 DNS resolution — prevents ENETUNREACH on Render (IPv6 not routable to smtp.gmail.com)
setDefaultResultOrder('ipv4first');
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import http from 'http';
import { Server } from 'socket.io';

import authRoutes from './routes/auth.js';
import meRoutes from './routes/me.js';

import adminRoutes from './routes/admin.js';
import publicRoutes from './routes/public.js';
import Admin from './models/Admin.js';
import Story from './models/Story.js';
import SiteSettings from './models/SiteSettings.js';
import { Therapist } from './models/Therapist.js';
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

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads folder is served
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/me', meRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/public', publicRoutes);
import therapistRoutes from './routes/therapist.js';
app.use('/api/therapist', therapistRoutes);
import sessionRoutes from './routes/session.js';
app.use('/api/sessions', sessionRoutes);
import supportRoutes from './routes/support.js';
app.use('/api/support', supportRoutes);
import chatRoutes from './routes/chat.js';
app.use('/api/chat', chatRoutes);
import zenChatRoute from './routes/zenChat.js';
app.use('/api/zen-chat', zenChatRoute);
import zenSessionsRoute from './routes/zenSessions.js';
app.use('/api/zen-sessions', zenSessionsRoute);
import communityStoriesRoute from './routes/communityStories.js';
app.use('/api/community-stories', communityStoriesRoute);
import zenProgressRoute from './routes/zenProgress.js';
app.use('/api/zen-progress', zenProgressRoute);

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

// Seed default Stories
const storyCount = await Story.countDocuments();
if (storyCount === 0) {
  await Story.insertMany([
    { story: "I felt lost and alone until I found ZenMind. The chatbot helped me understand that my feelings were valid, and the stories inspired me to keep going.", author: "Sarah, 16", rating: 5, category: 'loneliness', isApproved: true },
    { story: "The therapy sessions changed my life. Having someone who truly understands what I'm going through made all the difference.", author: "Michael, 17", rating: 5, category: 'depression', isApproved: true },
    { story: "I love how the platform shares stories when I need them most. It's like having a friend who always knows what to say.", author: "Emma, 15", rating: 5, category: 'anxiety', isApproved: true },
    { story: "I started journaling after each chat and now I can actually notice my progress week by week. It feels empowering.", author: "Aarav, 16", rating: 5, category: 'stress', isApproved: true },
    { story: "The stories made me feel less alone. I realized so many teens are dealing with the same thoughts and emotions.", author: "Noah, 15", rating: 5, category: 'loneliness', isApproved: true },
    { story: "Whenever I feel overwhelmed, ZenMind gives me practical coping steps immediately. It helps me calm down fast.", author: "Mia, 17", rating: 5, category: 'anxiety', isApproved: true },
    { story: "Exam season used to break me every year. After talking to Zeni about it, I realized it was burnout, not weakness. I rested and came back stronger.", author: "Rohan, 17", rating: 5, category: 'exam_pressure', isApproved: true },
    { story: "I was bullied for two years and never told anyone. Opening up here was the hardest thing I've done — and the most freeing.", author: "Priya, 15", rating: 5, category: 'bullying', isApproved: true },
    { story: "My parents' fights used to keep me up at night. Talking about it helped me see that their problems aren't mine to carry.", author: "Arjun, 16", rating: 5, category: 'family_issues', isApproved: true },
    { story: "I never felt good enough — not smart enough, not pretty enough. Slowly I'm learning that I am enough, just as I am.", author: "Divya, 14", rating: 5, category: 'self_esteem', isApproved: true }
  ]);
  console.log('Default Stories seeded');
} else {
  // Migrate existing stories: mark admin-seeded ones as approved if not already
  await Story.updateMany({ userId: null, isApproved: false }, { $set: { isApproved: true } });
}

// Seed default Site Settings
const settingsCount = await SiteSettings.countDocuments();
if (settingsCount === 0) {
  await SiteSettings.create({
    activeUsers: '50000',
    satisfactionRate: '98',
    therapistsCount: '1000',
    supportAvailable: '24'
  });
  console.log('Default Site Settings seeded');
}

// Seed exactly 12 Therapists (7 online, 5 offline)
const therapistCount = await Therapist.countDocuments();
if (therapistCount !== 12) {
  console.log('Resetting therapists database to exactly 12...');
  await Therapist.deleteMany({});
  
  const firstNames = ['Amit', 'Sneha', 'Rahul', 'Neha', 'Vikram', 'Pooja', 'Suresh', 'Kavita', 'Ramesh', 'Anjali', 'Karan', 'Meera'];
  const lastNames = ['Singh', 'Patel', 'Kumar', 'Gupta', 'Desai', 'Joshi', 'Reddy', 'Rao', 'Iyer', 'Nair', 'Das', 'Sen'];
  const specs = ['Clinical Psychologist', 'Adolescent & Teen Therapist', 'Anxiety & Depression Specialist', 'Cognitive Behavioural Therapist', 'Trauma & PTSD Specialist', 'Relationship Counsellor', 'Child Psychologist'];
  const cities = ['Bangalore', 'Delhi', 'Mumbai', 'Chennai', 'Hyderabad'];

  const generated = [];
  for (let i = 0; i < 12; i++) {
    const fn = firstNames[i];
    const ln = lastNames[i];
    const city = cities[i % cities.length];
    const spec = specs[i % specs.length];
    const isOffline = i >= 7; // First 7 are online, remaining 5 are offline

    generated.push({
      name: `Dr. ${fn} ${ln}`,
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}@zenmind.com`,
      password: 'therapist123',
      phone: '+91 ' + Math.floor(6000000000 + Math.random() * 3999999999),
      specialization: spec,
      experience: Math.floor(Math.random() * 15) + 2,
      education: `M.D. Psychiatry or Ph.D., ${city} University`,
      clinicAddress: `Clinic ${Math.floor(Math.random()*100)}, Wellness St, ${city}`,
      sessionTime: Math.random() > 0.5 ? 45 : 60,
      sessionCost: Math.floor(Math.random() * 15 + 5) * 100,
      sessionType: isOffline ? 'offline' : 'online'
    });
  }

  for (const data of generated) {
    const t = new Therapist(data);
    await t.save();
  }
  console.log('Generated exactly 12 therapists (7 Online, 5 Offline).');
}

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigin
      ? (origin, cb) => {
          if (!origin || origin === allowedOrigin) return cb(null, true);
          cb(new Error(`CORS: origin ${origin} not allowed`));
        }
      : true,
    credentials: true
  }
});


io.on('connection', (socket) => {
  console.log('User connected to socket:', socket.id);

  // --- Chat Logic ---

  socket.on('join-chat', (chatId) => {
    socket.join(`chat_${chatId}`);
  });

  socket.on('send-chat-message', (data) => {
    // data: { chatId, message }
    socket.to(`chat_${data.chatId}`).emit('receive-chat-message', data.message);
  });

  socket.on('delete-chat-message', (data) => {
    // data: { chatId, messageId, deletedForEveryone, deletedBy }
    socket.to(`chat_${data.chatId}`).emit('chat-message-deleted', data);
  });
  // ------------------

  // --- Video Conference Logic ---
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    socket.roomId = roomId;
    socket.to(roomId).emit('user-connected', socket.id);
  });

  socket.on('offer', (data, roomId) => {
    socket.to(roomId).emit('offer', data);
  });

  socket.on('answer', (data, roomId) => {
    socket.to(roomId).emit('answer', data);
  });

  socket.on('ice-candidate', (data, roomId) => {
    socket.to(roomId).emit('ice-candidate', data);
  });

  socket.on('disconnect', async () => {
    console.log('User disconnected:', socket.id);
    // Video disconnect logic
    if (socket.roomId) {
      socket.to(socket.roomId).emit('user-disconnected', socket.id);
    }
  });
});

server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`API and Socket.IO listening on port ${port}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Port ${port} is already in use. Kill the process using that port and restart.\n`);
    process.exit(1);
  } else {
    throw err;
  }
});
