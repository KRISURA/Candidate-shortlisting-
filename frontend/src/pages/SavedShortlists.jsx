import { useState, useEffect } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";
import "./SavedShortlists.css";

export default function SavedShortlists() {
  const [shortlists, setShortlists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    fetchShortlists();
  }, []);

  const fetchShortlists = async () => {
    try {
      const res = await api.get("/match/saved");
      setShortlists(res.data.shortlists);
    } catch (err) {
      toast.error("Failed to load saved shortlists");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"?`)) return;
    try {
      await api.delete(`/match/saved/${id}`);
      toast.success("Shortlist deleted");
      setShortlists((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  const getTierColor = (score) => {
    if (score >= 75) return "#22c55e";
    if (score >= 40) return "#f59e0b";
    return "#ef4444";
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-state">
          <div className="spinner-large"></div>
          <p>Loading saved shortlists...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <div>
          <h1>⭐ Saved Shortlists</h1>
          <p className="page-subtitle">{shortlists.length} saved shortlists</p>
        </div>
      </div>

      {shortlists.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">⭐</div>
          <h3>No saved shortlists</h3>
          <p>Run a shortlist and save it to see it here</p>
        </div>
      ) : (
        <div className="shortlists-list">
          {shortlists.map((sl) => (
            <div className="shortlist-item" key={sl._id}>
              <div
                className="shortlist-header"
                onClick={() => setExpanded(expanded === sl._id ? null : sl._id)}
              >
                <div className="shortlist-title-section">
                  <h3>{sl.title}</h3>
                  <div className="shortlist-meta">
                    <span>📅 {new Date(sl.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                    <span>👥 {sl.candidates.length} candidates</span>
                    {sl.jobRequirements?.requiredSkills?.length > 0 && (
                      <span>🛠️ {sl.jobRequirements.requiredSkills.join(", ")}</span>
                    )}
                  </div>
                </div>
                <div className="shortlist-actions">
                  <button
                    className="btn-danger"
                    onClick={(e) => { e.stopPropagation(); handleDelete(sl._id, sl.title); }}
                  >
                    Delete
                  </button>
                  <span className="expand-icon">{expanded === sl._id ? "▲" : "▼"}</span>
                </div>
              </div>

              {expanded === sl._id && (
                <div className="shortlist-body fade-in">
                  {/* Job Requirements */}
                  <div className="job-req-section">
                    <h4>Job Requirements</h4>
                    <div className="req-details">
                      <div className="req-item">
                        <span className="req-label">Required Skills:</span>
                        <div className="skill-tags">
                          {sl.jobRequirements?.requiredSkills?.map((s, i) => (
                            <span key={i} className="skill-tag">{s}</span>
                          ))}
                        </div>
                      </div>
                      {sl.jobRequirements?.preferredSkills?.length > 0 && (
                        <div className="req-item">
                          <span className="req-label">Preferred Skills:</span>
                          <div className="skill-tags">
                            {sl.jobRequirements.preferredSkills.map((s, i) => (
                              <span key={i} className="skill-tag" style={{ background: "#1a2744", color: "#93c5fd" }}>{s}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="req-item">
                        <span className="req-label">Min Experience:</span>
                        <span>{sl.jobRequirements?.minExperience || 0} years</span>
                      </div>
                    </div>
                  </div>

                  {/* Candidates */}
                  <div className="saved-candidates">
                    <h4>Shortlisted Candidates</h4>
                    {sl.candidates.map((c, i) => (
                      <div className="saved-candidate-row" key={i}>
                        <div className="sc-rank">#{i + 1}</div>
                        <div className="sc-avatar">{c.name?.charAt(0)}</div>
                        <div className="sc-info">
                          <div className="sc-name">{c.name}</div>
                          <div className="sc-email">{c.email}</div>
                          <div className="skill-tags" style={{ marginTop: "0.3rem" }}>
                            {c.skills?.slice(0, 4).map((s, j) => (
                              <span key={j} className="skill-tag">{s}</span>
                            ))}
                          </div>
                        </div>
                        <div className="sc-score" style={{ color: getTierColor(c.matchScore) }}>
                          {c.matchScore}%
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* AI Recommendation */}
                  {sl.aiRecommendation && (
                    <div className="ai-rec-section">
                      <h4>🤖 AI Recommendation</h4>
                      <p>{sl.aiRecommendation}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
