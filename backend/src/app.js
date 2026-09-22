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
const ApiError = require('./utils/ApiError');

const app = express();

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const connectDB = require('./config/db');

app.use(generalLimiter);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Ensure database connection is ready for API requests (especially on Serverless/Vercel)
app.use('/api', async (req, res, next) => {
  if (req.path === '/health') return next();
  try {
    await connectDB();
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

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API is running' });
});

app.use((req, res, next) => {
  next(ApiError.notFound(`Can't find ${req.originalUrl} on this server!`));
});

app.use(errorHandler);

module.exports = app;
