const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const env = require('./config/env');
const corsOptions = require('./config/cors');
const { generalLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('./modules/auth/auth.routes');
const classRoutes = require('./modules/classes/class.routes');
const studentRoutes = require('./modules/students/student.routes');
const teacherRoutes = require('./modules/teachers/teacher.routes');
const quizRoutes = require('./modules/quizzes/quiz.routes');
const notificationRoutes = require('./modules/notifications/notification.routes');
const feeRoutes = require('./modules/fees/fee.routes');
const salaryRoutes = require('./modules/salary/salary.routes');
const expenseRoutes = require('./modules/expenses/expense.routes');
const ApiError = require('./utils/ApiError');
const connectDB = require('./config/db');

const app = express();

// Trust reverse proxy (Vercel, Render, Nginx) so client IP is accurately extracted
app.set('trust proxy', 1);

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Immediate health check routes
app.get('/api/health', (req, res) => res.status(200).json({ status: 'ok', message: 'API is running' }));
app.get('/health', (req, res) => res.status(200).json({ status: 'ok', message: 'API is running' }));

app.use(generalLimiter);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

let isSeeded = false;

// Ensure database connection is ready for API requests (especially on Serverless/Vercel)
app.use('/api', async (req, res, next) => {
  if (req.path === '/health' || req.path === '/system-status') return next();
  try {
    await connectDB();
    if (!isSeeded) {
      isSeeded = true;
      try {
        const User = require('./modules/users/user.model');
        const { ROLES } = require('./utils/constants');
        const adminEmail = (process.env.ADMIN_EMAIL || 'admin@girlskingdom.edu').trim().toLowerCase();
        const adminPass = process.env.ADMIN_PASSWORD || 'Admin@123456';
        let adminUser = await User.findOne({ email: adminEmail }).select('+password');
        if (!adminUser) {
          adminUser = await User.create({
            fullName: process.env.ADMIN_NAME || 'System Administrator',
            email: adminEmail,
            password: adminPass,
            role: ROLES.ADMIN,
            isActive: true
          });
          console.log(`Default administrator seeded: ${adminEmail} / ${adminPass}`);
        } else {
          const matches = await adminUser.comparePassword(adminPass);
          if (!matches || !adminUser.isActive || adminUser.role !== ROLES.ADMIN) {
            adminUser.password = adminPass;
            adminUser.isActive = true;
            adminUser.role = ROLES.ADMIN;
            await adminUser.save();
            console.log(`Default administrator credentials synced: ${adminEmail} / ${adminPass}`);
          }
        }
        const seedInitialDataIfEmpty = require('../seeds/initialSeed');
        await seedInitialDataIfEmpty();
      } catch (seedErr) {
        console.warn('Auto-seed check notice:', seedErr.message);
      }
    }
    next();
  } catch (err) {
    console.error('Database connection error on API request:', err.message);
    return res.status(503).json({
      status: 'error',
      message: err.message,
      detail: err.name
    });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/salary', salaryRoutes);
app.use('/api/expenses', expenseRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API is running' });
});

app.get('/api/system-status', async (req, res) => {
  const mongoose = require('mongoose');
  const dbStatus = ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState] || 'unknown';
  let dbError = null;
  let counts = { admin: 0, teacher: 0, student: 0 };
  
  try {
    const connectDB = require('./config/db');
    await connectDB();
    const User = require('./modules/users/user.model');
    const { ROLES } = require('./utils/constants');
    const [adminCount, teacherCount, studentCount] = await Promise.all([
      User.countDocuments({ role: ROLES.ADMIN }),
      User.countDocuments({ role: ROLES.TEACHER }),
      User.countDocuments({ role: ROLES.STUDENT })
    ]);
    counts = { admin: adminCount, teacher: teacherCount, student: studentCount };
  } catch (err) {
    dbError = err.message;
  }

  return res.json({
    status: 'ok',
    database: {
      state: dbStatus,
      host: mongoose.connection.host || null,
      error: dbError,
      hasMongoUri: Boolean(process.env.MONGO_URI || require('./config/env').MONGO_URI)
    },
    users: counts,
    timestamp: new Date().toISOString()
  });
});

app.use((req, res, next) => {
  next(ApiError.notFound(`Can't find ${req.originalUrl} on this server!`));
});

app.use(errorHandler);

module.exports = app;
module.exports.default = app;
