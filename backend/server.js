const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const itemRoutes = require('./routes/itemRoutes');
const requestRoutes = require('./routes/requestRoutes');
const authRoutes = require('./routes/authRoutes');

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB Atlas
connectDB();

const app = express();

// Middleware
// 1. CORS: Allows requests from our React frontend (http://localhost:5173)
app.use(cors());

// 2. Body Parser: Enables Express to parse JSON data sent in request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Route: Test that server is up and responsive
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'ReUseHUB Backend API is running successfully!',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/requests', requestRoutes);

// Error handling middleware (must be registered after all routes)
app.use(notFound);
app.use(errorHandler);

// Define Server Port (defaults to 5000 if not specified in .env)
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
