const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const cron = require('node-cron');
const User = require('./models/User');

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/students', require('./routes/students'));
app.use('/api/faculty', require('./routes/faculty'));
app.use('/api/branches', require('./routes/branches'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/results', require('./routes/results'));
app.use('/api/timetable', require('./routes/timetable'));
app.use('/api/assignments', require('./routes/assignments'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/analytics', require('./routes/analytics'));

// Basic Route
app.get('/', (req, res) => {
    res.send('Collage Management System API is running...');
});

// Database & Server Startup
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/collage_management_fresh';

console.log('--- SYSTEM INITIALIZATION ---');
console.log(`Connecting to MongoDB at: ${MONGO_URI.split('@').pop()}...`);

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('✅ SUCCESS: Connected to MongoDB Database');
        
        const server = app.listen(PORT, () => {
            console.log(`🚀 SUCCESS: Backend Server is now running on port: ${PORT}`);
            console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
            console.log('------------------------------');
        });

        server.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.error(`❌ CRITICAL: Port ${PORT} is already in use.`);
            } else {
                console.error('❌ CRITICAL: Server error:', err);
            }
        });
    })
    .catch(err => {
        console.error('❌ FAILURE: MongoDB Connection Error');
        console.error('Details:', err.message);
        console.log('------------------------------');
        process.exit(1);
    });

// Cron Job for OTP Cleanup
cron.schedule("*/5 * * * *", async () => {
  try {
    await User.updateMany(
      { otpExpiry: { $lt: new Date() } },
      { $set: { otp: null, otpExpiry: null } }
    );
  } catch (error) {
    console.error("Cron Job Error:", error);
  }
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('🚨 UNHANDLED ERROR:', err.stack);
    res.status(500).send({ error: 'Internal Server Error', message: err.message });
});

module.exports = app;
