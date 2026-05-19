const express = require("express");
const router = express.Router();
const Candidate = require("../models/Candidate");
const { protect } = require("../middleware/auth");

// @route   POST /api/candidates
// @desc    Add a new candidate
router.post("/", protect, async (req, res) => {
  try {
    const { name, email, skills, experience, bio, projects } = req.body;

    if (!name || !email || !skills || experience === undefined) {
      return res.status(400).json({ message: "Please provide name, email, skills, and experience" });
    }

    const existingCandidate = await Candidate.findOne({ email });
    if (existingCandidate) {
      return res.status(400).json({ message: "Candidate with this email already exists" });
    }

    // Normalize skills to lowercase for consistent matching
    const normalizedSkills = skills.map((s) => s.trim());

    const candidate = await Candidate.create({
      name,
      email,
      skills: normalizedSkills,
      experience,
      bio: bio || "",
      projects: projects || [],
      addedBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: "Candidate added successfully",
      candidate
    });
  } catch (error) {
    console.error("Add candidate error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/candidates
// @desc    Get all candidates with optional search/filter
router.get("/", protect, async (req, res) => {
  try {
    const { search, skill, minExp, maxExp } = req.query;

    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { bio: { $regex: search, $options: "i" } }
      ];
    }

    if (skill) {
      query.skills = { $in: [new RegExp(skill, "i")] };
    }

    if (minExp !== undefined || maxExp !== undefined) {
      query.experience = {};
      if (minExp !== undefined) query.experience.$gte = Number(minExp);
      if (maxExp !== undefined) query.experience.$lte = Number(maxExp);
    }

    const candidates = await Candidate.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: candidates.length,
      candidates
    });
  } catch (error) {
    console.error("Get candidates error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/candidates/:id
// @desc    Get single candidate
router.get("/:id", protect, async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }
    res.json({ success: true, candidate });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   PUT /api/candidates/:id
// @desc    Update candidate
router.put("/:id", protect, async (req, res) => {
  try {
    const candidate = await Candidate.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }
    res.json({ success: true, message: "Candidate updated", candidate });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   DELETE /api/candidates/:id
// @desc    Delete candidate
router.delete("/:id", protect, async (req, res) => {
  try {
    const candidate = await Candidate.findByIdAndDelete(req.params.id);
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }
    res.json({ success: true, message: "Candidate deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
