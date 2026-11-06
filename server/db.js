const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/newsguessr';

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`Connected to MongoDB at ${MONGODB_URI}`);
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    console.warn('Ensure MongoDB is running (e.g. `mongod --dbpath ./data/db`)');
  }
}

module.exports = { connectDB, mongoose };
