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

// MongoDB Connection with better options
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
.then(() => console.log("✅ MongoDB Connected Successfully"))
.catch((err) => {
  console.log("❌ MongoDB Connection Error:", err.message);
});

// MongoDB Connection events for better debugging
mongoose.connection.on('connected', () => {
  console.log('✅ Mongoose connected to MongoDB Atlas');
});

mongoose.connection.on('error', (err) => {
  console.log('❌ Mongoose connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ Mongoose disconnected');
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
    environment: process.env.NODE_ENV || 'development'
  });
});

// Health check route for Render
app.get("/health", (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  
  res.status(200).json({ 
    status: "OK", 
    message: "Server is running",
    timestamp: new Date().toISOString(),
    database: dbStatus === 1 ? "Connected" : "Disconnected",
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root route
app.get("/", (req, res) => {
  res.json({ 
    message: "Frontline Fury Backend API", 
    status: "Running",
    timestamp: new Date().toISOString(),
    endpoints: {
      health: "/health",
      test: "/api/test",
      feedback: "/api/feedback",
      prebooking: "/api/prebooking",
      auth: "/api/auth"
    }
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Test URL: http://localhost:${PORT}/api/test`);
  console.log(`❤️ Health Check: http://localhost:${PORT}/health`);
});