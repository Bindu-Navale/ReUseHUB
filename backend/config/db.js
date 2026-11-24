const mongoose = require('mongoose');

/**
 * Connect to MongoDB Atlas database using Mongoose
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1); // Stop the server if database connection fails
  }
};

module.exports = connectDB;
