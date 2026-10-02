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

const PORT = process.env.PORT || env.PORT || 5000;

// On Vercel / serverless, Vercel provides the HTTP server wrapper.
// Only call app.listen() when running locally or on a traditional container/VPS.
let server = null;
if (!process.env.VERCEL && require.main === module) {
  server = app.listen(PORT, () => {
    console.log(`Server running in ${env.NODE_ENV || 'production'} mode on port ${PORT}`);
  });
}

// Initialize DB connection in background if not already connected
if (!process.env.VERCEL) {
  connectDB().then(async () => {
    try {
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
      console.warn('Auto-seed notice:', seedErr.message);
    }
  }).catch(err => {
    console.warn('Database initialization notice:', err.message);
  });
}

process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION! 💥', err.name, err.message);
  if (!process.env.VERCEL && server) {
    server.close(() => {
      process.exit(1);
    });
  }
});

module.exports = app;
module.exports.server = server;
