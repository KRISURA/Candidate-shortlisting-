import { useState } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import { Bar } from "react-chartjs-2";
import "./Shortlist.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Shortlist() {
  const [form, setForm] = useState({
    requiredSkillInput: "",
    requiredSkills: [],
    preferredSkillInput: "",
    preferredSkills: [],
    minExperience: ""
  });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveTitle, setSaveTitle] = useState("");
  const [showSaveModal, setShowSaveModal] = useState(false);

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
    try {
      const res = await api.post("/match", {
        requiredSkills: form.requiredSkills,
        minExperience: form.minExperience ? Number(form.minExperience) : 0,
        preferredSkills: form.preferredSkills
      });
      setResults(res.data.shortlisted);
      setSearched(true);
      if (res.data.shortlisted.length === 0) {
        toast("No matching candidates found", { icon: "ℹ️" });
      } else {
        toast.success(`Found ${res.data.shortlisted.length} candidates`);
      }
    } catch (err) {
      toast.error("Shortlisting failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!saveTitle.trim()) {
      toast.error("Please enter a title");
      return;
    }
    setSaving(true);
    try {
      await api.post("/match/save", {
        title: saveTitle,
        jobRequirements: {
          requiredSkills: form.requiredSkills,
          minExperience: form.minExperience ? Number(form.minExperience) : 0,
          preferredSkills: form.preferredSkills
        },
        candidates: results
      });
      toast.success("Shortlist saved!");
      setShowSaveModal(false);
      setSaveTitle("");
    } catch (err) {
      toast.error("Failed to save shortlist");
    } finally {
      setSaving(false);
    }
  };

  const getTierColor = (tier) => {
    if (tier === "High") return "#22c55e";
    if (tier === "Partial") return "#f59e0b";
    return "#ef4444";
  };

  const getTierBg = (tier) => {
    if (tier === "High") return "#14532d";
    if (tier === "Partial") return "#451a03";
    return "#450a0a";
  };

  // Chart data
  const chartData = {
    labels: results.slice(0, 10).map((c) => c.name.split(" ")[0]),
    datasets: [
      {
        label: "Match Score (%)",
        data: results.slice(0, 10).map((c) => c.matchScore),
        backgroundColor: results.slice(0, 10).map((c) =>
          c.matchTier === "High" ? "rgba(34,197,94,0.7)" :
          c.matchTier === "Partial" ? "rgba(245,158,11,0.7)" :
          "rgba(239,68,68,0.7)"
        ),
        borderColor: results.slice(0, 10).map((c) =>
          c.matchTier === "High" ? "#22c55e" :
          c.matchTier === "Partial" ? "#f59e0b" :
          "#ef4444"
        ),
        borderWidth: 1,
        borderRadius: 6
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "Candidate Match Scores",
        color: "#94a3b8",
        font: { size: 14 }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: { color: "#64748b" },
        grid: { color: "#334155" }
      },
      x: {
        ticks: { color: "#64748b" },
        grid: { display: false }
      }
    }
  };

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <div>
          <h1>Shortlist Candidates</h1>
          <p className="page-subtitle">Match candidates based on job requirements</p>
        </div>
      </div>

      {/* Job Requirements Form */}
      <div className="form-card" style={{ marginBottom: "1.5rem" }}>
        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <h3 className="section-title">Job Requirements</h3>

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

            <div className="form-row">
              <div className="form-group">
                <label>Preferred Skills (Bonus)</label>
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
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? (
                  <span className="btn-loading"><span className="spinner"></span> Matching...</span>
                ) : (
                  "🎯 Find Matches"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Results */}
      {searched && (
        <div className="fade-in">
          {results.length > 0 && (
            <>
              {/* Chart */}
              <div className="chart-card">
                <Bar data={chartData} options={chartOptions} />
              </div>

              {/* Save Button */}
              <div className="results-header">
                <h2>Results ({results.length} candidates)</h2>
                <button className="btn-primary" onClick={() => setShowSaveModal(true)}>
                  ⭐ Save Shortlist
                </button>
              </div>

              {/* Legend */}
              <div className="tier-legend">
                <span className="tier-badge" style={{ background: "#14532d", color: "#22c55e" }}>🟢 High Match (75%+)</span>
                <span className="tier-badge" style={{ background: "#451a03", color: "#f59e0b" }}>🟡 Partial Match (40-74%)</span>
                <span className="tier-badge" style={{ background: "#450a0a", color: "#ef4444" }}>🔴 Low Match (&lt;40%)</span>
              </div>

              {/* Candidate Cards */}
              <div className="shortlist-results">
                {results.map((c, i) => (
                  <div className="result-card" key={c._id}>
                    <div className="result-rank">#{i + 1}</div>
                    <div className="result-body">
                      <div className="result-header">
                        <div className="candidate-avatar">{c.name.charAt(0)}</div>
                        <div className="result-info">
                          <h3>{c.name}</h3>
                          <p>{c.email}</p>
                        </div>
                        <div className="result-score-section">
                          <div
                            className="match-score"
                            style={{ color: getTierColor(c.matchTier) }}
                          >
                            {c.matchScore}%
                          </div>
                          <span
                            className="tier-badge"
                            style={{ background: getTierBg(c.matchTier), color: getTierColor(c.matchTier) }}
                          >
                            {c.matchTier}
                          </span>
                        </div>
                      </div>

                      <div className="result-details">
                        <div className="detail-item">
                          <span className="detail-label">Experience:</span>
                          <span className={c.experienceMet ? "exp-met" : "exp-not-met"}>
                            {c.experience} yrs {c.experienceMet ? "✓" : "✗"}
                          </span>
                        </div>

                        <div className="detail-item">
                          <span className="detail-label">Matched Skills:</span>
                          <div className="skill-tags">
                            {c.matchedSkills.map((s, j) => (
                              <span key={j} className="skill-tag matched">{s}</span>
                            ))}
                            {c.matchedSkills.length === 0 && <span className="no-match">None</span>}
                          </div>
                        </div>

                        {c.matchedPreferredSkills?.length > 0 && (
                          <div className="detail-item">
                            <span className="detail-label">Preferred Skills:</span>
                            <div className="skill-tags">
                              {c.matchedPreferredSkills.map((s, j) => (
                                <span key={j} className="skill-tag preferred">{s}</span>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="detail-item">
                          <span className="detail-label">All Skills:</span>
                          <div className="skill-tags">
                            {c.skills.map((s, j) => (
                              <span key={j} className="skill-tag">{s}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {results.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <h3>No matching candidates</h3>
              <p>Try adjusting your skill requirements or add more candidates</p>
            </div>
          )}
        </div>
      )}

      {/* Save Modal */}
      {showSaveModal && (
        <div className="modal-overlay" onClick={() => setShowSaveModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Save Shortlist</h3>
            <p>Give this shortlist a name to save it for later</p>
            <input
              type="text"
              placeholder="e.g. React Developer - May 2025"
              value={saveTitle}
              onChange={(e) => setSaveTitle(e.target.value)}
              className="modal-input"
              autoFocus
            />
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowSaveModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
