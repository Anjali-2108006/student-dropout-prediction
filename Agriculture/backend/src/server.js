require('dotenv').config();
const express = require('express');
const cors = require('cors');
const coonect DB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Import Route Handlers
const userRoutes = require('./routes/userRoutes');
const marketPriceRoutes = require('./routes/marketPriceRoutes');
const buyerDemandRoutes = require('./routes/buyerDemandRoutes');
const lotRoutes = require('./routes/lotRoutes');
const offerRoutes = require('./routes/offerRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const logisticsRoutes = require('./routes/logisticsRoutes');
const grievanceRoutes = require('./routes/grievanceRoutes');
const adminRoutes = require('./routes/adminRoutes');
const marketIntelligenceRoutes = require('./routes/marketIntelligenceRoutes');

const app = express();

// Initialize MongoDB Connection
connectDB();

// CORS Configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive in development
    },
    credentials: true,
  })
);

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root Route
app.get('/', (req, res) => {
  res.json({
    message: 'AgriLink backend is running',
    version: '1.0.0',
    documentation: '/api/health',
  });
});

// Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'AgriLink API is running',
    timestamp: new Date().toISOString(),
  });
});

// Mount Resource Routes
app.use('/api/users', userRoutes);
app.use('/api/market-prices', marketPriceRoutes);
app.use('/api/buyer-demands', buyerDemandRoutes);
app.use('/api/lots', lotRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/logistics', logisticsRoutes);
app.use('/api/grievances', grievanceRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/market-intelligence', marketIntelligenceRoutes);

// Centralized Error Handling
app.use(notFound);
app.use(errorHandler);

// Port Configuration & Server Startup
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`AgriLink backend server running on port ${PORT}`);
  console.log(`Health Check: http://localhost:${PORT}/api/health`);
});
