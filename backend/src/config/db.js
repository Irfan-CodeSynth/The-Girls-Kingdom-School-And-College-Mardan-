const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const env = require('./env');

let mongoMemoryServer = null;

const isTestEnv = process.env.NODE_ENV === 'test' || process.argv.some(a => a.includes('test'));

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  const mongoUri = process.env.MONGO_URI || env.MONGO_URI;
  if (!mongoUri) {
    console.warn('⚠️ MONGO_URI is not defined. Will attempt embedded MongoDB fallback...');
  }

  // Try to connect to the configured MongoDB URI first
  if (mongoUri) {
    try {
      const conn = await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 6000,
        connectTimeoutMS: 6000,
      });
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      return conn;
    } catch (error) {
      console.error(`❌ MongoDB connection failed: ${error.message}`);
      if (process.env.VERCEL) {
        throw new Error(`MongoDB connection failed (${error.message}). Please check that Atlas Network Access allows 0.0.0.0/0.`);
      }
    }
  }

  // Fallback: embedded MongoMemoryServer (development only, not suitable for Vercel/serverless)
  if (!process.env.VERCEL) {
    try {
      console.warn('🔄 Starting embedded MongoDB (in-memory dev fallback)...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      if (!mongoMemoryServer) {
        const dbPath = path.resolve(__dirname, '../../.mongo-data');
        if (!fs.existsSync(dbPath)) {
          fs.mkdirSync(dbPath, { recursive: true });
        }
        mongoMemoryServer = await MongoMemoryServer.create({
          instance: { dbPath, storageEngine: 'wiredTiger' }
        });
      }
      const memoryUri = mongoMemoryServer.getUri();
      const conn = await mongoose.connect(memoryUri);
      console.log(`✅ Embedded MongoDB Connected: ${conn.connection.host}`);
      return conn;
    } catch (innerError) {
      console.error('❌ Failed to launch embedded MongoDB:', innerError.message);
      throw innerError;
    }
  }

  throw new Error('MONGO_URI is missing or unreachable on Vercel.');
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
