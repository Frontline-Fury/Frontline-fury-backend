const mongoose = require("mongoose");

const FeedbackSchema = new mongoose.Schema({
  rating: Number,
  thoughts: String,
  visit_frequency: String,
  game_mode_request: String,
  arena_upgrade: String,
  custom_request: String,
}, { timestamps: true });

module.exports = mongoose.model("Feedback", FeedbackSchema);