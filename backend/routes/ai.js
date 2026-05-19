const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");
const Candidate = require("../models/Candidate");
const { protect } = require("../middleware/auth");

// @route   POST /api/ai/shortlist
// @desc    AI-based candidate shortlisting using OpenRouter
router.post("/shortlist", protect, async (req, res) => {
  try {
    const { requiredSkills, minExperience, preferredSkills, jobTitle, jobDescription } = req.body;

    if (!requiredSkills || requiredSkills.length === 0) {
      return res.status(400).json({ message: "Please provide required skills" });
    }

    const candidates = await Candidate.find();

    if (candidates.length === 0) {
      return res.json({
        success: true,
        message: "No candidates found",
        aiResponse: "No candidates available to analyze."
      });
    }

    // Build candidate list for AI prompt
    const candidateList = candidates
      .map((c, i) => `${i + 1}. ${c.name} - Skills: ${c.skills.join(", ")} - Experience: ${c.experience} years${c.bio ? ` - Bio: ${c.bio}` : ""}`)
      .join("\n");

    const prompt = `You are an expert HR recruiter and technical hiring specialist.

Job Requirements:
- Title: ${jobTitle || "Software Developer"}
- Required Skills: ${requiredSkills.join(", ")}
- Minimum Experience: ${minExperience || 0} years
- Preferred Skills: ${preferredSkills ? preferredSkills.join(", ") : "None"}
${jobDescription ? `- Job Description: ${jobDescription}` : ""}

Candidates:
${candidateList}

Please analyze each candidate and:
1. Rank them from best fit to least fit
2. Give each candidate a match percentage (0-100%)
3. Explain why each candidate is or isn't suitable
4. Highlight key strengths and gaps
5. Suggest top 3 candidates with detailed reasoning

Format your response clearly with sections for each candidate.`;

    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey || apiKey === "your_openrouter_api_key_here") {
      return res.status(400).json({
        success: false,
        message: "OpenRouter API key not configured. Please add your API key in backend/.env file."
      });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:5173",
        "X-Title": "Candidate Shortlisting System"
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenRouter API error:", errorData);
      return res.status(response.status).json({
        success: false,
        message: "AI API error",
        error: errorData.error?.message || "Unknown AI error"
      });
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || "No response from AI";

    res.json({
      success: true,
      aiResponse,
      model: data.model,
      usage: data.usage
    });
  } catch (error) {
    console.error("AI shortlist error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   POST /api/ai/interview-questions
// @desc    Generate AI interview questions for a candidate
router.post("/interview-questions", protect, async (req, res) => {
  try {
    const { candidateId, jobTitle, requiredSkills } = req.body;

    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey || apiKey === "your_openrouter_api_key_here") {
      return res.status(400).json({
        success: false,
        message: "OpenRouter API key not configured."
      });
    }

    const prompt = `Generate 10 targeted interview questions for the following candidate applying for ${jobTitle || "a software developer"} role.

Candidate Profile:
- Name: ${candidate.name}
- Skills: ${candidate.skills.join(", ")}
- Experience: ${candidate.experience} years
- Bio: ${candidate.bio || "Not provided"}

Job Required Skills: ${requiredSkills ? requiredSkills.join(", ") : candidate.skills.join(", ")}

Generate a mix of:
- Technical questions (based on their skills)
- Experience-based questions
- Problem-solving questions
- Behavioral questions

Format each question with its type and difficulty level.`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:5173",
        "X-Title": "Candidate Shortlisting System"
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1500,
        temperature: 0.8
      })
    });

    const data = await response.json();
    const questions = data.choices[0]?.message?.content || "Could not generate questions";

    res.json({ success: true, candidateName: candidate.name, questions });
  } catch (error) {
    console.error("Interview questions error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
