const express = require("express");
const PreBooking = require("../models/PreBooking");
const router = express.Router();

// GET all pre-bookings
router.get("/", async (req, res) => {
  try {
    const preBookings = await PreBooking.find().sort({ createdAt: -1 });
    res.json(preBookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single pre-booking by ID
router.get("/:id", async (req, res) => {
  try {
    const preBooking = await PreBooking.findById(req.params.id);
    if (!preBooking) {
      return res.status(404).json({ error: "Pre-booking not found" });
    }
    res.json(preBooking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create new pre-booking
router.post("/", async (req, res) => {
  try {
    const preBooking = new PreBooking(req.body);
    await preBooking.save();
    res.status(201).json({ message: "Pre-booking submitted successfully", data: preBooking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update pre-booking
router.put("/:id", async (req, res) => {
  try {
    const preBooking = await PreBooking.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!preBooking) {
      return res.status(404).json({ error: "Pre-booking not found" });
    }
    res.json({ message: "Pre-booking updated successfully", data: preBooking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE pre-booking
router.delete("/:id", async (req, res) => {
  try {
    const preBooking = await PreBooking.findByIdAndDelete(req.params.id);
    if (!preBooking) {
      return res.status(404).json({ error: "Pre-booking not found" });
    }
    res.json({ message: "Pre-booking deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;