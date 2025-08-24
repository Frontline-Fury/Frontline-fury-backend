const express = require("express");
const Feedback = require("../models/Feedback");
const router = express.Router();

// GET all feedbacks
router.get("/", async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single feedback by ID
router.get("/:id", async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ error: "Feedback not found" });
    }
    res.json(feedback);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create new feedback
router.post("/", async (req, res) => {
  try {
    const feedback = new Feedback(req.body);
    await feedback.save();
    res.status(201).json({ message: "Feedback submitted successfully", data: feedback });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update feedback
router.put("/:id", async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!feedback) {
      return res.status(404).json({ error: "Feedback not found" });
    }
    res.json({ message: "Feedback updated successfully", data: feedback });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE feedback
router.delete("/:id", async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndDelete(req.params.id);
    if (!feedback) {
      return res.status(404).json({ error: "Feedback not found" });
    }
    res.json({ message: "Feedback deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;