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
        serverSelectionTimeoutMS: 15000,
        connectTimeoutMS: 15000,
      });
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      return conn;
    } catch (error) {
      console.error(`❌ MongoDB connection failed: ${error.message}`);
      console.warn('⚡ Falling back to embedded MongoDB...');
    }
  }

  // Fallback: embedded MongoMemoryServer (works on any environment including Vercel)
  try {
    console.warn('🔄 Starting embedded MongoDB (in-memory)...');
    const { MongoMemoryServer } = require('mongodb-memory-server');
    if (!mongoMemoryServer) {
      if (!isTestEnv && (env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'production')) {
        // Persistent storage in dev
        const dbPath = path.resolve(__dirname, '../../.mongo-data');
        if (!fs.existsSync(dbPath)) {
          fs.mkdirSync(dbPath, { recursive: true });
        }
        mongoMemoryServer = await MongoMemoryServer.create({
          instance: { dbPath, storageEngine: 'wiredTiger' }
        });
      } else {
        mongoMemoryServer = await MongoMemoryServer.create();
      }
    }
    const memoryUri = mongoMemoryServer.getUri();
    const conn = await mongoose.connect(memoryUri);
    console.log(`✅ Embedded MongoDB Connected: ${conn.connection.host}`);
    console.warn('⚠️  NOTE: Using in-memory MongoDB — data will NOT persist between restarts!');
    console.warn('⚠️  Set MONGO_URI in Vercel Environment Variables for persistent storage.');
    return conn;
  } catch (innerError) {
    console.error('❌ Failed to launch embedded MongoDB:', innerError.message);
    throw innerError;
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
