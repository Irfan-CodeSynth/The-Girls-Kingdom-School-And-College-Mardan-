require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const env = require('./config/env');

process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

const User = require('./modules/users/user.model');
const { ROLES } = require('./utils/constants');

connectDB().then(async () => {
  // Ensure default admin exists for immediate access
  try {
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

    // Ensure initial demo records exist if database is empty
    const seedInitialDataIfEmpty = require('../seeds/initialSeed');
    await seedInitialDataIfEmpty();
  } catch (seedErr) {
    console.warn('Auto-seed check notice:', seedErr.message);
  }

  const server = app.listen(env.PORT, () => {
    console.log(`Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
  });

  process.on('unhandledRejection', err => {
    console.log('UNHANDLED REJECTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    server.close(() => {
      process.exit(1);
    });
  });
});
