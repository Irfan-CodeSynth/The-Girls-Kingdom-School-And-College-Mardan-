const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const env = require('./env');

let mongoMemoryServer = null;

const isTestEnv = process.env.NODE_ENV === 'test' || process.argv.some(a => a.includes('test'));

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.MONGO_URI, {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    if (env.NODE_ENV === 'development' || process.env.NODE_ENV !== 'production') {
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
        return;
      } catch (innerError) {
        console.error('Failed to launch embedded MongoDB:', innerError.message);
      }
    }
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
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
