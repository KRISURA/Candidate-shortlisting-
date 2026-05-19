const mongoose = require("mongoose");

const SavedShortlistSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  jobRequirements: {
    requiredSkills: [String],
    minExperience: Number,
    preferredSkills: [String]
  },
  candidates: [
    {
      candidateId: { type: mongoose.Schema.Types.ObjectId, ref: "Candidate" },
      name: String,
      email: String,
      skills: [String],
      experience: Number,
      matchScore: Number,
      matchedSkills: [String]
    }
  ],
  aiRecommendation: {
    type: String,
    default: ""
  },
  savedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("SavedShortlist", SavedShortlistSchema);
