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

const app = express();

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const connectDB = require('./config/db');

app.use(generalLimiter);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

let isSeeded = false;

// Ensure database connection is ready for API requests (especially on Serverless/Vercel)
app.use('/api', async (req, res, next) => {
  if (req.path === '/health') return next();
  try {
    await connectDB();
    if (!isSeeded) {
      isSeeded = true;
      try {
        const User = require('./modules/users/user.model');
        const { ROLES } = require('./utils/constants');
        const adminExists = await User.findOne({ role: ROLES.ADMIN });
        if (!adminExists) {
          const adminEmail = process.env.ADMIN_EMAIL || 'admin@girlskingdom.edu';
          const adminPass = process.env.ADMIN_PASSWORD || 'Admin@123456';
          await User.create({
            fullName: process.env.ADMIN_NAME || 'System Administrator',
            email: adminEmail,
            password: adminPass,
            role: ROLES.ADMIN,
            isActive: true
          });
          console.log(`Default administrator seeded: ${adminEmail} / ${adminPass}`);
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
      message: 'Database connection failed. Please verify MONGO_URI in Vercel Environment Variables and ensure MongoDB Atlas Network Access is set to 0.0.0.0/0.'
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

app.use((req, res, next) => {
  next(ApiError.notFound(`Can't find ${req.originalUrl} on this server!`));
});

app.use(errorHandler);

module.exports = app;
