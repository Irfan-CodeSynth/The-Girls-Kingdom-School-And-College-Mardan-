const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const env = require('./env');

let mongoMemoryServer = null;

const isTestEnv = process.env.NODE_ENV === 'test' || process.argv.some(a => a.includes('test'));

let cachedPromise = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (mongoose.connection.readyState === 2 && cachedPromise) {
    return cachedPromise;
  }

  const mongoUri = process.env.MONGO_URI || env.MONGO_URI;
  if (!mongoUri) {
    console.warn('⚠️ MONGO_URI is not defined.');
    throw new Error('MONGO_URI environment variable is missing.');
  }

  try {
    cachedPromise = mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 8000,
    });
    const conn = await cachedPromise;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    cachedPromise = null;
    console.error(`❌ MongoDB connection failed: ${error.message}`);
    throw error;
  }
};

mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to DB.');
});

mongoose.connection.on('error', (err) => {
  console.log('Mongoose connection error: ' + err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected.');
});

const disconnectDB = async () => {
  if (isTestEnv) {
    try {
      await mongoose.connection.dropDatabase();
    } catch {
      // ignore in test shutdown
    }
  }
  await mongoose.disconnect();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
    mongoMemoryServer = null;
  }
};

module.exports = connectDB;
module.exports.disconnectDB = disconnectDB;
