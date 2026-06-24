const mongoose = require('mongoose');

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is required');
  }

  const dbName = process.env.MONGO_DB_NAME || 'note-app-db';

  await mongoose.connect(process.env.MONGO_URI, { dbName });
  console.log(`MongoDB connected to database: ${mongoose.connection.name}`);
};

module.exports = connectDB;
