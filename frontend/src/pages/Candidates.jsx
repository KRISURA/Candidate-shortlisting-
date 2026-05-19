import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";
import "./Candidates.css";

export default function Candidates() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [skillFilter, setSkillFilter] = useState("");
  const [minExp, setMinExp] = useState("");
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async (params = {}) => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (params.search) query.append("search", params.search);
      if (params.skill) query.append("skill", params.skill);
      if (params.minExp) query.append("minExp", params.minExp);

      const res = await api.get(`/candidates?${query.toString()}`);
      setCandidates(res.data.candidates);
    } catch (err) {
      toast.error("Failed to fetch candidates");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCandidates({ search, skill: skillFilter, minExp });
  };

  const handleReset = () => {
    setSearch("");
    setSkillFilter("");
    setMinExp("");
    fetchCandidates();
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete ${name}? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await api.delete(`/candidates/${id}`);
      toast.success(`${name} deleted`);
      setCandidates((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      toast.error("Failed to delete candidate");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <div>
          <h1>Candidates</h1>
          <p className="page-subtitle">{candidates.length} candidates in pool</p>
        </div>
        <Link to="/candidates/add" className="btn-primary">+ Add Candidate</Link>
      </div>

      {/* Search & Filter */}
      <div className="filter-card">
        <form onSubmit={handleSearch} className="filter-form">
          <input
            type="text"
            placeholder="Search by name, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="filter-input"
          />
          <input
            type="text"
            placeholder="Filter by skill (e.g. React)"
            value={skillFilter}
            onChange={(e) => setSkillFilter(e.target.value)}
            className="filter-input"
          />
          <input
            type="number"
            placeholder="Min experience (yrs)"
            value={minExp}
            onChange={(e) => setMinExp(e.target.value)}
            className="filter-input filter-input-sm"
            min="0"
          />
          <button type="submit" className="btn-primary">Search</button>
          <button type="button" className="btn-secondary" onClick={handleReset}>Reset</button>
        </form>
      </div>

      {/* Candidates Grid */}
      {loading ? (
        <div className="loading-state">
          <div className="spinner-large"></div>
          <p>Loading candidates...</p>
        </div>
      ) : candidates.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <h3>No candidates found</h3>
          <p>Try adjusting your search or add new candidates</p>
          <Link to="/candidates/add" className="btn-primary" style={{ marginTop: "1rem" }}>
            Add First Candidate
          </Link>
        </div>
      ) : (
        <div className="candidates-grid">
          {candidates.map((c) => (
            <div className="candidate-card" key={c._id}>
              <div className="candidate-header">
                <div className="candidate-avatar">
                  {c.name.charAt(0).toUpperCase()}
                </div>
                <div className="candidate-info">
                  <h3>{c.name}</h3>
                  <p className="candidate-email">{c.email}</p>
                </div>
                <div className="exp-badge">{c.experience} yrs</div>
              </div>

              {c.bio && <p className="candidate-bio">{c.bio}</p>}

              <div className="candidate-skills">
                {c.skills.map((s, i) => (
                  <span key={i} className="skill-tag">{s}</span>
                ))}
              </div>

              {c.projects && c.projects.length > 0 && (
                <div className="candidate-projects">
                  <span className="projects-label">Projects:</span>
                  {c.projects.slice(0, 2).map((p, i) => (
                    <span key={i} className="project-tag">{p}</span>
                  ))}
                </div>
              )}

              <div className="candidate-actions">
                <button
                  className="btn-danger"
                  onClick={() => handleDelete(c._id, c.name)}
                  disabled={deleting === c._id}
                >
                  {deleting === c._id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
