const express = require("express");
const router = express.Router();
const Candidate = require("../models/Candidate");
const SavedShortlist = require("../models/SavedShortlist");
const { protect } = require("../middleware/auth");

// Core matching function
function matchCandidates(candidates, job) {
  const { requiredSkills, minExperience, preferredSkills = [] } = job;

  return candidates
    .map((candidate) => {
      const candidateSkillsLower = candidate.skills.map((s) => s.toLowerCase());
      const requiredLower = requiredSkills.map((s) => s.toLowerCase());
      const preferredLower = preferredSkills.map((s) => s.toLowerCase());

      // Required skill match
      const matchedRequired = requiredLower.filter((skill) =>
        candidateSkillsLower.includes(skill)
      );
      const requiredScore = requiredSkills.length > 0
        ? matchedRequired.length / requiredSkills.length
        : 0;

      // Preferred skill match (bonus)
      const matchedPreferred = preferredLower.filter((skill) =>
        candidateSkillsLower.includes(skill)
      );
      const preferredScore = preferredSkills.length > 0
        ? matchedPreferred.length / preferredSkills.length
        : 0;

      // Experience score
      const expMet = candidate.experience >= (minExperience || 0);

      // Final weighted score
      const finalScore = (requiredScore * 0.7) + (preferredScore * 0.2) + (expMet ? 0.1 : 0);

      // Determine match tier
      let matchTier;
      if (finalScore >= 0.75 && expMet) matchTier = "High";
      else if (finalScore >= 0.4) matchTier = "Partial";
      else matchTier = "Low";

      return {
        _id: candidate._id,
        name: candidate.name,
        email: candidate.email,
        skills: candidate.skills,
        experience: candidate.experience,
        bio: candidate.bio,
        projects: candidate.projects,
        matchScore: Math.round(finalScore * 100),
        matchedSkills: matchedRequired.map((s) =>
          candidate.skills.find((cs) => cs.toLowerCase() === s) || s
        ),
        matchedPreferredSkills: matchedPreferred.map((s) =>
          candidate.skills.find((cs) => cs.toLowerCase() === s) || s
        ),
        experienceMet: expMet,
        matchTier
      };
    })
    .filter((c) => c.matchScore > 0 || c.experienceMet)
    .sort((a, b) => b.matchScore - a.matchScore);
}

// @route   POST /api/match
// @desc    Shortlist candidates based on job requirements
router.post("/", protect, async (req, res) => {
  try {
    const { requiredSkills, minExperience, preferredSkills } = req.body;

    if (!requiredSkills || requiredSkills.length === 0) {
      return res.status(400).json({ message: "Please provide required skills" });
    }

    const candidates = await Candidate.find();

    if (candidates.length === 0) {
      return res.json({
        success: true,
        message: "No candidates found in database",
        shortlisted: []
      });
    }

    const shortlisted = matchCandidates(candidates, {
      requiredSkills,
      minExperience: minExperience || 0,
      preferredSkills: preferredSkills || []
    });

    res.json({
      success: true,
      total: shortlisted.length,
      shortlisted
    });
  } catch (error) {
    console.error("Match error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   POST /api/match/save
// @desc    Save a shortlist
router.post("/save", protect, async (req, res) => {
  try {
    const { title, jobRequirements, candidates, aiRecommendation } = req.body;

    const saved = await SavedShortlist.create({
      title,
      jobRequirements,
      candidates,
      aiRecommendation: aiRecommendation || "",
      savedBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: "Shortlist saved successfully",
      shortlist: saved
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/match/saved
// @desc    Get all saved shortlists
router.get("/saved", protect, async (req, res) => {
  try {
    const shortlists = await SavedShortlist.find({ savedBy: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, shortlists });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   DELETE /api/match/saved/:id
// @desc    Delete a saved shortlist
router.delete("/saved/:id", protect, async (req, res) => {
  try {
    await SavedShortlist.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Shortlist deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
