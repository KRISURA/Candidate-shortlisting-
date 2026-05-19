import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import "./Dashboard.css";

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, avgExp: 0, topSkills: [] });
  const [recentCandidates, setRecentCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get("/candidates");
      const candidates = res.data.candidates;

      // Calculate stats
      const total = candidates.length;
      const avgExp = total > 0
        ? (candidates.reduce((sum, c) => sum + c.experience, 0) / total).toFixed(1)
        : 0;

      // Top skills
      const skillCount = {};
      candidates.forEach((c) => {
        c.skills.forEach((s) => {
          skillCount[s] = (skillCount[s] || 0) + 1;
        });
      });
      const topSkills = Object.entries(skillCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([skill, count]) => ({ skill, count }));

      setStats({ total, avgExp, topSkills });
      setRecentCandidates(candidates.slice(0, 5));
    } catch (err) {
      console.error("Stats error:", err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: "Total Candidates", value: stats.total, icon: "👥", color: "#6366f1" },
    { label: "Avg Experience", value: `${stats.avgExp} yrs`, icon: "📅", color: "#22d3ee" },
    { label: "Skills Tracked", value: stats.topSkills.length, icon: "🛠️", color: "#22c55e" },
    { label: "Active Recruiter", value: user?.name?.split(" ")[0], icon: "👤", color: "#f59e0b" }
  ];

  const quickActions = [
    { label: "Add Candidate", path: "/candidates/add", icon: "➕", desc: "Add new candidate profile" },
    { label: "Shortlist", path: "/shortlist", icon: "🎯", desc: "Match candidates to job" },
    { label: "AI Match", path: "/ai-shortlist", icon: "🤖", desc: "AI-powered ranking" },
    { label: "View All", path: "/candidates", icon: "👥", desc: "Browse all candidates" }
  ];

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-state">
          <div className="spinner-large"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <div>
          <h1>Welcome back, {user?.name?.split(" ")[0]} 👋</h1>
          <p className="page-subtitle">Here's your recruitment overview</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        {statCards.map((card, i) => (
          <div className="stat-card" key={i} style={{ "--accent": card.color }}>
            <div className="stat-icon">{card.icon}</div>
            <div className="stat-info">
              <div className="stat-value">{card.value}</div>
              <div className="stat-label">{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        {/* Quick Actions */}
        <div className="dashboard-card">
          <h2 className="card-title">Quick Actions</h2>
          <div className="quick-actions">
            {quickActions.map((action, i) => (
              <Link to={action.path} className="quick-action-btn" key={i}>
                <span className="qa-icon">{action.icon}</span>
                <div>
                  <div className="qa-label">{action.label}</div>
                  <div className="qa-desc">{action.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Top Skills */}
        <div className="dashboard-card">
          <h2 className="card-title">Top Skills in Pool</h2>
          {stats.topSkills.length === 0 ? (
            <p className="empty-state-text">No candidates added yet</p>
          ) : (
            <div className="skills-chart">
              {stats.topSkills.map(({ skill, count }, i) => (
                <div className="skill-bar-item" key={i}>
                  <div className="skill-bar-label">
                    <span>{skill}</span>
                    <span className="skill-count">{count}</span>
                  </div>
                  <div className="skill-bar-track">
                    <div
                      className="skill-bar-fill"
                      style={{
                        width: `${(count / stats.total) * 100}%`,
                        background: `hsl(${i * 40 + 220}, 70%, 60%)`
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Candidates */}
      <div className="dashboard-card">
        <div className="card-header-row">
          <h2 className="card-title">Recent Candidates</h2>
          <Link to="/candidates" className="view-all-link">View All →</Link>
        </div>
        {recentCandidates.length === 0 ? (
          <div className="empty-state">
            <p>No candidates yet.</p>
            <Link to="/candidates/add" className="btn-primary">Add First Candidate</Link>
          </div>
        ) : (
          <div className="candidates-table">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Experience</th>
                  <th>Skills</th>
                </tr>
              </thead>
              <tbody>
                {recentCandidates.map((c) => (
                  <tr key={c._id}>
                    <td className="td-name">{c.name}</td>
                    <td className="td-email">{c.email}</td>
                    <td>{c.experience} yrs</td>
                    <td>
                      <div className="skill-tags">
                        {c.skills.slice(0, 3).map((s, i) => (
                          <span key={i} className="skill-tag">{s}</span>
                        ))}
                        {c.skills.length > 3 && (
                          <span className="skill-tag more">+{c.skills.length - 3}</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
