const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Database connection with SRV pre-check and retry to avoid transient DNS timeouts
const dns = require('dns').promises;

const resolveSrvWithTimeout = async (name, timeoutMs = 10000) => {
  return Promise.race([
    dns.resolveSrv(name),
    new Promise((_, reject) => setTimeout(() => reject(new Error('DNS SRV lookup timeout')), timeoutMs)),
  ]);
};

const connectWithRetry = async (uri, attempts = 3) => {
  for (let i = 1; i <= attempts; i++) {
    try {
      // Try a SRV resolution first to catch DNS issues early for mongodb+srv URIs
      if (uri && uri.startsWith('mongodb+srv://')) {
        // Extract the hostname portion from the Mongo URI (strip credentials and path)
        const extractHostFromMongoUri = (u) => {
          try {
            let s = u.replace(/^mongodb(\+srv)?:\/\//, '');
            if (s.includes('@')) s = s.split('@').pop();
            s = s.split('/')[0];
            s = s.split('?')[0];
            return s;
          } catch (e) {
            return u;
          }
        };

        const host = extractHostFromMongoUri(uri);
        const srvName = '_mongodb._tcp.' + host;
        try {
          await resolveSrvWithTimeout(srvName, 10000);
        } catch (dnsErr) {
          console.warn(`SRV lookup attempt ${i} failed:`, dnsErr.message);
          if (i < attempts) {
            await new Promise((r) => setTimeout(r, 2000));
            continue;
          }
        }
      }

      await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      console.log('MongoDB connected successfully');
      return;
    } catch (err) {
      console.log(`MongoDB connection attempt ${i} failed:`, err.message || err);
      if (i === attempts) {
        console.log('All MongoDB connection attempts failed. Exiting.');
        process.exit(1);
      }
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
};

// Start connection attempts
connectWithRetry(process.env.MONGO_URI).catch((err) => {
  console.error('Unexpected MongoDB connection error:', err);
  process.exit(1);
});

// Routes
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/parking-spots', require('./src/routes/parkingSpotRoutes'));
app.use('/api/bookings', require('./src/routes/bookingRoutes'));
app.use('/api/users', require('./src/routes/userRoutes'));
app.use('/api/payments', require('./src/routes/paymentRoutes'));
app.use('/api/seed', require('./src/routes/seedRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    status: err.status || 500,
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

server.on('error', (err) => {
  if (err && err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Try setting a different PORT or kill the process using it.`);
    process.exit(1);
  } else {
    throw err;
  }
});

module.exports = app;
