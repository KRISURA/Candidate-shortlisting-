import { useState } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";
import "./AIShortlist.css";

export default function AIShortlist() {
  const [form, setForm] = useState({
    jobTitle: "",
    jobDescription: "",
    requiredSkillInput: "",
    requiredSkills: [],
    preferredSkillInput: "",
    preferredSkills: [],
    minExperience: ""
  });
  const [aiResponse, setAiResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [interviewMode, setInterviewMode] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState("");
  const [interviewQuestions, setInterviewQuestions] = useState("");
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  const addSkill = (type) => {
    const key = type === "required" ? "requiredSkillInput" : "preferredSkillInput";
    const listKey = type === "required" ? "requiredSkills" : "preferredSkills";
    const skill = form[key].trim();
    if (!skill) return;
    if (form[listKey].includes(skill)) {
      toast.error("Skill already added");
      return;
    }
    setForm({ ...form, [listKey]: [...form[listKey], skill], [key]: "" });
  };

  const removeSkill = (type, skill) => {
    const listKey = type === "required" ? "requiredSkills" : "preferredSkills";
    setForm({ ...form, [listKey]: form[listKey].filter((s) => s !== skill) });
  };

  const handleKeyDown = (e, type) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill(type);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.requiredSkills.length === 0) {
      toast.error("Please add at least one required skill");
      return;
    }
    setLoading(true);
    setAiResponse("");
    try {
      const res = await api.post("/ai/shortlist", {
        jobTitle: form.jobTitle,
        jobDescription: form.jobDescription,
        requiredSkills: form.requiredSkills,
        minExperience: form.minExperience ? Number(form.minExperience) : 0,
        preferredSkills: form.preferredSkills
      });
      setAiResponse(res.data.aiResponse);
      toast.success("AI analysis complete!");
    } catch (err) {
      const msg = err.response?.data?.message || "AI request failed";
      toast.error(msg);
      if (err.response?.data?.message?.includes("API key")) {
        setAiResponse("⚠️ OpenRouter API key not configured.\n\nTo use AI features:\n1. Get your API key from https://openrouter.ai\n2. Open backend/.env file\n3. Replace 'your_openrouter_api_key_here' with your actual key\n4. Restart the backend server");
      }
    } finally {
      setLoading(false);
    }
  };

  const loadCandidatesForInterview = async () => {
    try {
      const res = await api.get("/candidates");
      setCandidates(res.data.candidates);
      setInterviewMode(true);
    } catch (err) {
      toast.error("Failed to load candidates");
    }
  };

  const generateInterviewQuestions = async () => {
    if (!selectedCandidate) {
      toast.error("Please select a candidate");
      return;
    }
    setLoadingQuestions(true);
    setInterviewQuestions("");
    try {
      const res = await api.post("/ai/interview-questions", {
        candidateId: selectedCandidate,
        jobTitle: form.jobTitle,
        requiredSkills: form.requiredSkills
      });
      setInterviewQuestions(res.data.questions);
      toast.success("Interview questions generated!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to generate questions");
    } finally {
      setLoadingQuestions(false);
    }
  };

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <div>
          <h1>🤖 AI-Powered Shortlisting</h1>
          <p className="page-subtitle">Let AI analyze and rank candidates intelligently</p>
        </div>
      </div>

      <div className="ai-layout">
        {/* Form */}
        <div className="form-card">
          <form onSubmit={handleSubmit}>
            <div className="form-section">
              <h3 className="section-title">Job Details</h3>

              <div className="form-group">
                <label>Job Title</label>
                <input
                  type="text"
                  placeholder="e.g. Senior React Developer"
                  value={form.jobTitle}
                  onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Job Description (Optional)</label>
                <textarea
                  placeholder="Describe the role, responsibilities..."
                  value={form.jobDescription}
                  onChange={(e) => setForm({ ...form, jobDescription: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label>Required Skills *</label>
                <div className="tag-input-row">
                  <input
                    type="text"
                    placeholder="e.g. React, Node.js..."
                    value={form.requiredSkillInput}
                    onChange={(e) => setForm({ ...form, requiredSkillInput: e.target.value })}
                    onKeyDown={(e) => handleKeyDown(e, "required")}
                    className="tag-input"
                  />
                  <button type="button" className="btn-add" onClick={() => addSkill("required")}>Add</button>
                </div>
                <div className="tags-container">
                  {form.requiredSkills.length === 0 ? (
                    <span className="tags-placeholder">No required skills added</span>
                  ) : (
                    form.requiredSkills.map((s, i) => (
                      <span key={i} className="tag-item">
                        {s}
                        <button type="button" className="tag-remove" onClick={() => removeSkill("required", s)}>×</button>
                      </span>
                    ))
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Preferred Skills</label>
                <div className="tag-input-row">
                  <input
                    type="text"
                    placeholder="e.g. AWS, Docker..."
                    value={form.preferredSkillInput}
                    onChange={(e) => setForm({ ...form, preferredSkillInput: e.target.value })}
                    onKeyDown={(e) => handleKeyDown(e, "preferred")}
                    className="tag-input"
                  />
                  <button type="button" className="btn-add" onClick={() => addSkill("preferred")}>Add</button>
                </div>
                <div className="tags-container">
                  {form.preferredSkills.length === 0 ? (
                    <span className="tags-placeholder">No preferred skills</span>
                  ) : (
                    form.preferredSkills.map((s, i) => (
                      <span key={i} className="tag-item" style={{ background: "#1a2744", color: "#93c5fd" }}>
                        {s}
                        <button type="button" className="tag-remove" onClick={() => removeSkill("preferred", s)}>×</button>
                      </span>
                    ))
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Minimum Experience (years)</label>
                <input
                  type="number"
                  placeholder="e.g. 2"
                  value={form.minExperience}
                  onChange={(e) => setForm({ ...form, minExperience: e.target.value })}
                  min="0"
                />
              </div>

              <button type="submit" className="btn-primary ai-submit-btn" disabled={loading}>
                {loading ? (
                  <span className="btn-loading">
                    <span className="spinner"></span> AI is analyzing...
                  </span>
                ) : (
                  "🤖 Analyze with AI"
                )}
              </button>
            </div>
          </form>

          {/* Interview Questions Section */}
          <div className="interview-section">
            <h3 className="section-title">🎤 Generate Interview Questions</h3>
            <p className="section-desc">AI will generate targeted interview questions for a specific candidate</p>
            {!interviewMode ? (
              <button className="btn-secondary" onClick={loadCandidatesForInterview}>
                Load Candidates
              </button>
            ) : (
              <div className="interview-form">
                <select
                  value={selectedCandidate}
                  onChange={(e) => setSelectedCandidate(e.target.value)}
                  className="form-select"
                >
                  <option value="">Select a candidate...</option>
                  {candidates.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} - {c.skills.slice(0, 3).join(", ")}
                    </option>
                  ))}
                </select>
                <button
                  className="btn-primary"
                  onClick={generateInterviewQuestions}
                  disabled={loadingQuestions}
                >
                  {loadingQuestions ? (
                    <span className="btn-loading"><span className="spinner"></span> Generating...</span>
                  ) : (
                    "Generate Questions"
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* AI Response */}
        <div className="ai-response-panel">
          {loading && (
            <div className="ai-loading">
              <div className="ai-loading-icon">🤖</div>
              <div className="ai-loading-text">AI is analyzing candidates...</div>
              <div className="ai-loading-dots">
                <span></span><span></span><span></span>
              </div>
            </div>
          )}

          {aiResponse && !loading && (
            <div className="ai-response fade-in">
              <div className="ai-response-header">
                <span className="ai-badge">🤖 AI Analysis</span>
              </div>
              <div className="ai-response-content">
                {aiResponse.split("\n").map((line, i) => (
                  <p key={i} className={line.startsWith("#") ? "ai-heading" : "ai-line"}>
                    {line || <br />}
                  </p>
                ))}
              </div>
            </div>
          )}

          {interviewQuestions && (
            <div className="ai-response fade-in" style={{ marginTop: "1rem" }}>
              <div className="ai-response-header">
                <span className="ai-badge">🎤 Interview Questions</span>
              </div>
              <div className="ai-response-content">
                {interviewQuestions.split("\n").map((line, i) => (
                  <p key={i} className="ai-line">{line || <br />}</p>
                ))}
              </div>
            </div>
          )}

          {!aiResponse && !loading && !interviewQuestions && (
            <div className="ai-placeholder">
              <div className="ai-placeholder-icon">🤖</div>
              <h3>AI Ready</h3>
              <p>Fill in the job requirements and click "Analyze with AI" to get intelligent candidate rankings and explanations.</p>
              <div className="ai-features">
                <div className="ai-feature">✅ Intelligent ranking beyond keyword matching</div>
                <div className="ai-feature">✅ Detailed explanation for each candidate</div>
                <div className="ai-feature">✅ Top candidate recommendations</div>
                <div className="ai-feature">✅ AI-generated interview questions</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
