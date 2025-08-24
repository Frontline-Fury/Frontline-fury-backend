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

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected Successfully"))
.catch((err) => {
  console.log("MongoDB Connection Error:", err);
  console.log("Connection string:", process.env.MONGO_URI);
});

// Routes: require routes first
const authRoutes = require("./routes/authRoutes");
const preBookingRoutes = require("./routes/preBookingRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");

// Debug: check what each route exports
console.log("authRoutes:", typeof authRoutes);
console.log("preBookingRoutes:", typeof preBookingRoutes);
console.log("feedbackRoutes:", typeof feedbackRoutes);

// Test route - YE ADD KARO
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
    databaseState: dbStatus
  });
});

// Root route - YE BHI ADD KARO
app.get("/", (req, res) => {
  res.json({ 
    message: "Frontline Fury Backend API", 
    endpoints: {
      test: "/api/test",
      feedback: "/api/feedback",
      auth: "/api/auth",
      prebooking: "/api/prebooking"
    }
  });
});

// Routes use
app.use("/api/auth", authRoutes);
app.use("/api/prebooking", preBookingRoutes);
app.use("/api/feedback", feedbackRoutes);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Test URL: http://localhost:${PORT}/api/test`);
});