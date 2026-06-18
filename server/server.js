require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const connectDB = require('./config/db');
const passport = require('./config/passport');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const { initSocket } = require('./services/socketService');

const app = express();
const server = http.createServer(app);

// --- Security & core middleware ---
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// Razorpay webhook needs the RAW request body to verify the signature, so it is
// mounted with express.raw BEFORE the JSON body parser.
app.post(
  '/api/payments/webhook',
  express.raw({ type: 'application/json' }),
  require('./controllers/paymentController').webhook
);

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// --- Lightweight in-memory rate limiter (no extra deps) ---
const rateWindowMs = 60 * 1000;
const rateMax = Number(process.env.RATE_LIMIT_MAX) || 200;
const hits = new Map();
app.use('/api', (req, res, next) => {
  const key = req.ip;
  const now = Date.now();
  const entry = hits.get(key) || { count: 0, reset: now + rateWindowMs };
  if (now > entry.reset) {
    entry.count = 0;
    entry.reset = now + rateWindowMs;
  }
  entry.count += 1;
  hits.set(key, entry);
  if (entry.count > rateMax) {
    return res.status(429).json({ success: false, message: 'Too many requests, slow down' });
  }
  next();
});

// --- Health check ---
app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'ok', time: new Date().toISOString() });
});

// --- Routes ---
app.use('/api/auth', require('./routes/auth'));
app.use('/api/spots', require('./routes/spots'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/uploads', require('./routes/uploads'));
app.use('/api/support', require('./routes/support'));

// --- Errors ---
app.use(notFound);
app.use(errorHandler);

// --- Real-time ---
initSocket(server, process.env.CLIENT_URL);

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  server.listen(PORT, () => {
    console.log(`🚀 ParkEase API running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
  });
};

// Only auto-start when run directly (keeps the app importable for tests)
if (require.main === module) {
  start().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}

module.exports = { app, server };
