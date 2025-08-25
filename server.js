const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

console.log("MONGO_URI:", process.env.MONGO_URI);
console.log("JWT_SECRET:", process.env.JWT_SECRET);

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB Connection caching
let isConnected = false;

const connectWithRetry = () => {
  console.log('Connecting to MongoDB...');
  
  mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 3000, // 3 seconds timeout
    socketTimeoutMS: 30000,
    maxPoolSize: 10, // Better connection pooling
    minPoolSize: 2,
  })
  .then(() => {
    console.log("✅ MongoDB Connected Successfully");
    isConnected = true;
  })
  .catch((err) => {
    console.log("❌ MongoDB Connection Error:", err.message);
    console.log("Retrying connection in 5 seconds...");
    setTimeout(connectWithRetry, 5000);
  });
};

// Initial connection
connectWithRetry();

// MongoDB Connection events
mongoose.connection.on('connected', () => {
  console.log('✅ Mongoose connected to MongoDB Atlas');
  isConnected = true;
});

mongoose.connection.on('error', (err) => {
  console.log('❌ Mongoose connection error:', err.message);
  isConnected = false;
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ Mongoose disconnected');
  isConnected = false;
});

// Connection health middleware
app.use((req, res, next) => {
  if (!isConnected) {
    return res.status(503).json({ 
      error: "Database connecting...", 
      message: "Please try again in a few seconds" 
    });
  }
  next();
});

// Routes
const authRoutes = require("./routes/authRoutes");
const preBookingRoutes = require("./routes/preBookingRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");

// Routes use
app.use("/api/auth", authRoutes);
app.use("/api/prebooking", preBookingRoutes);
app.use("/api/feedback", feedbackRoutes);

// Test route
app.get("/api/test", (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  let statusText = "Unknown";
  
  switch(dbStatus) {
    case 0: statusText = "Disconnected"; break;
    case 1: statusText = "Connected"; break;
    case 2: statusText = "Connecting"; break;
    case 3: statusText = "Disconnecting"; break;
  }
  
  res.json({ 
    message: "Backend is working!", 
    timestamp: new Date().toISOString(),
    database: statusText,
    databaseState: dbStatus,
    environment: process.env.NODE_ENV || 'development',
    connectionCached: isConnected
  });
});

// Health check route for Render (Fast response)
app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "OK", 
    message: "Server is running",
    timestamp: new Date().toISOString(),
    database: isConnected ? "Connected" : "Connecting",
    responseTime: "fast"
  });
});

// Quick health check for ping services (very fast)
app.get("/ping", (req, res) => {
  res.status(200).send("OK");
});

// Root route
app.get("/", (req, res) => {
  res.json({ 
    message: "Frontline Fury Backend API", 
    status: "Running",
    timestamp: new Date().toISOString(),
    endpoints: {
      health: "/health",
      ping: "/ping",
      test: "/api/test",
      feedback: "/api/feedback",
      prebooking: "/api/prebooking",
      auth: "/api/auth"
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: "Internal server error",
    message: process.env.NODE_ENV === 'production' ? "Something went wrong" : err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await mongoose.connection.close();
  process.exit(0);
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Test URL: http://localhost:${PORT}/api/test`);
  console.log(`❤️ Health Check: http://localhost:${PORT}/health`);
  console.log(`🏓 Ping: http://localhost:${PORT}/ping`);
});