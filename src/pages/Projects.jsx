import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiPlus,
  FiSearch,
  FiMoreVertical,
  FiEdit2,
  FiTrash2,
  FiUsers,
  FiCalendar,
  FiX,
} from 'react-icons/fi';
import { getProjects, getTeam, getTasks, addProject, updateProject, deleteProject } from '../utils/localStorage';
import { format } from 'date-fns';
import './Projects.css';

const Projects = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [team, setTeam] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'planning',
    priority: 'medium',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    dueDate: '',
    teamMembers: [],
    color: '#667eea',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setProjects(getProjects());
    setTeam(getTeam());
  };

  const getTaskStats = (projectId) => {
    const tasks = getTasks().filter(t => t.projectId === projectId);
    const completed = tasks.filter(t => t.status === 'completed').length;
    return { total: tasks.length, completed };
  };

  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingProject) {
      updateProject(editingProject.id, formData);
    } else {
      addProject(formData);
    }
    loadData();
    closeModal();
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      description: project.description,
      status: project.status,
      priority: project.priority,
      startDate: project.startDate,
      dueDate: project.dueDate,
      teamMembers: project.teamMembers || [],
      color: project.color,
    });
    setShowModal(true);
    setOpenMenu(null);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this project? All associated tasks will also be deleted.')) {
      deleteProject(id);
      loadData();
    }
    setOpenMenu(null);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProject(null);
    setFormData({
      name: '',
      description: '',
      status: 'planning',
      priority: 'medium',
      startDate: format(new Date(), 'yyyy-MM-dd'),
      dueDate: '',
      teamMembers: [],
      color: '#667eea',
    });
  };

  const toggleTeamMember = (memberId) => {
    setFormData(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.includes(memberId)
        ? prev.teamMembers.filter(id => id !== memberId)
        : [...prev.teamMembers, memberId],
    }));
  };

  const getTeamMember = (id) => team.find(m => m.id === id);

  const colors = ['#667eea', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

  return (
    <div className="projects-page">
      <div className="page-header">
        <div>
          <h1>Projects</h1>
          <p>Manage and track all your projects</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <FiPlus /> New Project
        </button>
      </div>

      <div className="filters-bar">
        <div className="search-box">
          <FiSearch />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="all">All Status</option>
          <option value="planning">Planning</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="on-hold">On Hold</option>
        </select>
      </div>

      <div className="projects-grid">
        {filteredProjects.map((project) => {
          const taskStats = getTaskStats(project.id);
          const progress = taskStats.total > 0 ? (taskStats.completed / taskStats.total) * 100 : 0;

          return (
            <div key={project.id} className="project-card">
              <div className="project-card-header">
                <div className="project-color-bar" style={{ background: project.color }} />
                <div className="project-title-section">
                  <h3 onClick={() => navigate(`/projects/${project.id}`)}>{project.name}</h3>
                  <span className={`status-badge ${project.status}`}>
                    {project.status.replace('-', ' ')}
                  </span>
                </div>
                <div className="menu-container">
                  <button
                    className="menu-trigger"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenu(openMenu === project.id ? null : project.id);
                    }}
                  >
                    <FiMoreVertical />
                  </button>
                  {openMenu === project.id && (
                    <div className="dropdown-menu">
                      <button onClick={() => handleEdit(project)}>
                        <FiEdit2 /> Edit
                      </button>
                      <button className="delete-action" onClick={() => handleDelete(project.id)}>
                        <FiTrash2 /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <p className="project-description">{project.description}</p>

              <div className="project-progress">
                <div className="progress-header">
                  <span>Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${progress}%` }} />
                </div>
                <span className="task-count">{taskStats.completed}/{taskStats.total} tasks</span>
              </div>

              <div className="project-footer">
                <div className="project-team">
                  {project.teamMembers?.slice(0, 3).map((memberId) => {
                    const member = getTeamMember(memberId);
                    return member ? (
                      <div key={memberId} className="team-avatar-small" title={member.name}>
                        {member.avatar}
                      </div>
                    ) : null;
                  })}
                  {project.teamMembers?.length > 3 && (
                    <div className="team-avatar-small more">
                      +{project.teamMembers.length - 3}
                    </div>
                  )}
                </div>
                <div className="project-dates">
                  <FiCalendar />
                  <span>Due {project.dueDate ? format(new Date(project.dueDate), 'MMM dd') : 'N/A'}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredProjects.length === 0 && (
        <div className="empty-state">
          <FiPlus className="empty-icon" />
          <p>No projects found</p>
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            Create your first project
          </button>
        </div>
      )}

      {/* Project Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingProject ? 'Edit Project' : 'New Project'}</h2>
              <button className="close-btn" onClick={closeModal}>
                <FiX />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Project Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter project name"
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter project description"
                  rows={3}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="planning">Planning</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="on-hold">On Hold</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Due Date</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Color</label>
                <div className="color-picker">
                  {colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`color-option ${formData.color === color ? 'selected' : ''}`}
                      style={{ background: color }}
                      onClick={() => setFormData({ ...formData, color })}
                    />
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Team Members</label>
                <div className="team-selector">
                  {team.map((member) => (
                    <label
                      key={member.id}
                      className={`team-option ${formData.teamMembers.includes(member.id) ? 'selected' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.teamMembers.includes(member.id)}
                        onChange={() => toggleTeamMember(member.id)}
                      />
                      <span className="member-avatar">{member.avatar}</span>
                      <span className="member-name">{member.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingProject ? 'Update Project' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
