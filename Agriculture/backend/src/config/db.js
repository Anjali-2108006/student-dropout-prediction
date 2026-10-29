const mongoose = require('mongoose');

/**
 * Connect to MongoDB instance using connection URI from environment.
 * Gracefully handles connection failures without crashing the Express server.
 */
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/agrilink';

    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of hanging
    });
    
    console.log(`MongoDB connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    console.log('Server continuing in offline/demo mode. To persist data, start MongoDB locally or update MONGODB_URI in backend/.env');
    return null;
  }
};

module.exports = connectDB;
