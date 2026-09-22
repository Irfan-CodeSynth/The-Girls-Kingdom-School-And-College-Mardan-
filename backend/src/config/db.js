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

  if (!env.MONGO_URI) {
    console.warn('⚠️ MONGO_URI environment variable is not defined.');
  }

  try {
    const conn = await mongoose.connect(env.MONGO_URI || 'mongodb://localhost:27017/girls-kingdom-college', {
      serverSelectionTimeoutMS: 8000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    if ((env.NODE_ENV === 'development' || process.env.NODE_ENV !== 'production') && !process.env.VERCEL) {
      console.warn(`Local MongoDB at ${env.MONGO_URI} not detected. Starting embedded MongoDB engine...`);
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        if (isTestEnv) {
          mongoMemoryServer = await MongoMemoryServer.create();
        } else {
          const dbPath = path.resolve(__dirname, '../../.mongo-data');
          if (!fs.existsSync(dbPath)) {
            fs.mkdirSync(dbPath, { recursive: true });
          }
          mongoMemoryServer = await MongoMemoryServer.create({
            instance: {
              dbPath,
              storageEngine: 'wiredTiger'
            }
          });
        }
        const memoryUri = mongoMemoryServer.getUri();
        const conn = await mongoose.connect(memoryUri);
        console.log(`Embedded Development MongoDB Connected: ${conn.connection.host} (Persistent: ${!isTestEnv})`);
        return conn;
      } catch (innerError) {
        console.error('Failed to launch embedded MongoDB:', innerError.message);
      }
    }
    console.error(`MongoDB Connection Error: ${error.message}`);
    if (!process.env.VERCEL) {
      process.exit(1);
    }
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
