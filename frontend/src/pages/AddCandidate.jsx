import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";
import "./AddCandidate.css";

export default function AddCandidate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    experience: "",
    bio: "",
    skillInput: "",
    skills: [],
    projectInput: "",
    projects: []
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addSkill = () => {
    const skill = form.skillInput.trim();
    if (!skill) return;
    if (form.skills.includes(skill)) {
      toast.error("Skill already added");
      return;
    }
    setForm({ ...form, skills: [...form.skills, skill], skillInput: "" });
  };

  const removeSkill = (skill) => {
    setForm({ ...form, skills: form.skills.filter((s) => s !== skill) });
  };

  const addProject = () => {
    const project = form.projectInput.trim();
    if (!project) return;
    setForm({ ...form, projects: [...form.projects, project], projectInput: "" });
  };

  const removeProject = (project) => {
    setForm({ ...form, projects: form.projects.filter((p) => p !== project) });
  };

  const handleSkillKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };

  const handleProjectKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addProject();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.experience) {
      toast.error("Please fill all required fields");
      return;
    }
    if (form.skills.length === 0) {
      toast.error("Please add at least one skill");
      return;
    }
    setLoading(true);
    try {
      await api.post("/candidates", {
        name: form.name,
        email: form.email,
        experience: Number(form.experience),
        bio: form.bio,
        skills: form.skills,
        projects: form.projects
      });
      toast.success("Candidate added successfully!");
      navigate("/candidates");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add candidate");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <div>
          <h1>Add Candidate</h1>
          <p className="page-subtitle">Fill in the candidate's profile details</p>
        </div>
      </div>

      <div className="form-card">
        <form onSubmit={handleSubmit} className="candidate-form">
          {/* Basic Info */}
          <div className="form-section">
            <h3 className="section-title">Basic Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. Rahul Sharma"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  name="email"
                  placeholder="e.g. rahul@gmail.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Experience (years) *</label>
                <input
                  type="number"
                  name="experience"
                  placeholder="e.g. 2"
                  value={form.experience}
                  onChange={handleChange}
                  min="0"
                  max="50"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Bio / Summary</label>
              <textarea
                name="bio"
                placeholder="Brief description about the candidate..."
                value={form.bio}
                onChange={handleChange}
                rows={3}
              />
            </div>
          </div>

          {/* Skills */}
          <div className="form-section">
            <h3 className="section-title">Skills *</h3>
            <div className="tag-input-row">
              <input
                type="text"
                placeholder="Type a skill and press Enter or Add"
                value={form.skillInput}
                onChange={(e) => setForm({ ...form, skillInput: e.target.value })}
                onKeyDown={handleSkillKeyDown}
                className="tag-input"
              />
              <button type="button" className="btn-add" onClick={addSkill}>
                Add
              </button>
            </div>
            <div className="tags-container">
              {form.skills.length === 0 ? (
                <span className="tags-placeholder">No skills added yet</span>
              ) : (
                form.skills.map((skill, i) => (
                  <span key={i} className="tag-item">
                    {skill}
                    <button type="button" onClick={() => removeSkill(skill)} className="tag-remove">
                      ×
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Projects */}
          <div className="form-section">
            <h3 className="section-title">Projects (Optional)</h3>
            <div className="tag-input-row">
              <input
                type="text"
                placeholder="Type a project name and press Enter or Add"
                value={form.projectInput}
                onChange={(e) => setForm({ ...form, projectInput: e.target.value })}
                onKeyDown={handleProjectKeyDown}
                className="tag-input"
              />
              <button type="button" className="btn-add" onClick={addProject}>
                Add
              </button>
            </div>
            <div className="tags-container">
              {form.projects.length === 0 ? (
                <span className="tags-placeholder">No projects added yet</span>
              ) : (
                form.projects.map((project, i) => (
                  <span key={i} className="tag-item project-tag-item">
                    {project}
                    <button type="button" onClick={() => removeProject(project)} className="tag-remove">
                      ×
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => navigate("/candidates")}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? (
                <span className="btn-loading">
                  <span className="spinner"></span> Adding...
                </span>
              ) : (
                "Add Candidate"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
