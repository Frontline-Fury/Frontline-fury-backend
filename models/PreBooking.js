const mongoose = require("mongoose");

const PreBookingSchema = new mongoose.Schema({
  name: String,
  email: String,
  mobile: String,
  city: String,
  otherCity: String,
  comments: String,
  agreeTerms: Boolean,
}, { timestamps: true });

module.exports = mongoose.model("PreBooking", PreBookingSchema);
