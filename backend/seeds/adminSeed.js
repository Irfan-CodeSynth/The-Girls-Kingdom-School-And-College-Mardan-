require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/modules/users/user.model');
const { ROLES } = require('../src/utils/constants');

const connectDB = require('../src/config/db');

const seedAdmin = async () => {
  try {
    await connectDB();

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminExists = await User.findOne({ email: adminEmail });

    if (adminExists) {
      console.log('Admin user already exists.');
    } else {
      await User.create({
        fullName: process.env.ADMIN_NAME,
        email: adminEmail,
        password: process.env.ADMIN_PASSWORD,
        role: ROLES.ADMIN
      });
      console.log('Admin user created successfully.');
    }

    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
