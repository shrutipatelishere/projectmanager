import { useState, useEffect } from 'react';
import {
  FiPlus,
  FiSearch,
  FiMoreVertical,
  FiEdit2,
  FiTrash2,
  FiMail,
  FiX,
  FiUser,
  FiCheckCircle,
  FiFolder,
  FiTag,
  FiBarChart2,
} from 'react-icons/fi';
import { getTeam, getProjects, getTasks, addTeamMember, updateTeamMember, deleteTeamMember, getRoles, addRole, deleteRole } from '../utils/localStorage';
import MemberPerformance from '../components/MemberPerformance';
import './Team.css';

const Team = () => {
  const [team, setTeam] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [roles, setRoles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);
  const [newRoleName, setNewRoleName] = useState('');
  const [useCustomRole, setUseCustomRole] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Developer',
    customRole: '',
    phone: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setTeam(getTeam());
    setProjects(getProjects());
    setTasks(getTasks());
    setRoles(getRoles());
  };

  const getMemberStats = (memberId) => {
    const memberTasks = tasks.filter(t => t.assigneeId === memberId);
    const completedTasks = memberTasks.filter(t => t.status === 'completed').length;
    const memberProjects = projects.filter(p => p.teamMembers?.includes(memberId));
    return {
      totalTasks: memberTasks.length,
      completedTasks,
      projectCount: memberProjects.length,
    };
  };

  // Get unique roles from team + saved roles
  const getAllRoles = () => {
    const teamRoles = team.map(m => m.role);
    const allRoles = [...new Set([...roles, ...teamRoles])];
    return allRoles.sort();
  };

  const filteredTeam = team.filter((member) => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'all' || member.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const roleToUse = useCustomRole && formData.customRole.trim()
      ? formData.customRole.trim()
      : formData.role;

    const memberData = {
      name: formData.name,
      email: formData.email,
      role: roleToUse,
      phone: formData.phone,
    };

    if (editingMember) {
      updateTeamMember(editingMember.id, memberData);
    } else {
      addTeamMember(memberData);
    }

    // Save custom role if it's new
    if (useCustomRole && formData.customRole.trim() && !roles.includes(formData.customRole.trim())) {
      addRole(formData.customRole.trim());
    }

    loadData();
    closeModal();
  };

  const handleEdit = (member) => {
    setEditingMember(member);
    const isExistingRole = roles.includes(member.role);
    setUseCustomRole(!isExistingRole && !['Project Manager', 'Developer', 'Designer', 'QA Engineer', 'DevOps', 'Analyst'].includes(member.role));
    setFormData({
      name: member.name,
      email: member.email,
      role: isExistingRole ? member.role : 'Developer',
      customRole: !isExistingRole ? member.role : '',
      phone: member.phone || '',
    });
    setShowModal(true);
    setOpenMenu(null);
  };

  const handleDelete = (id) => {
    const memberTasks = tasks.filter(t => t.assigneeId === id);
    if (memberTasks.length > 0) {
      alert('Cannot delete team member with assigned tasks. Please reassign their tasks first.');
      setOpenMenu(null);
      return;
    }
    if (window.confirm('Are you sure you want to remove this team member?')) {
      deleteTeamMember(id);
      loadData();
    }
    setOpenMenu(null);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingMember(null);
    setUseCustomRole(false);
    setFormData({
      name: '',
      email: '',
      role: 'Developer',
      customRole: '',
      phone: '',
    });
  };

  const handleAddRole = (e) => {
    e.preventDefault();
    if (newRoleName.trim()) {
      addRole(newRoleName.trim());
      setNewRoleName('');
      loadData();
    }
  };

  const handleDeleteRole = (role) => {
    const membersWithRole = team.filter(m => m.role === role);
    if (membersWithRole.length > 0) {
      alert(`Cannot delete role "${role}" - ${membersWithRole.length} team member(s) have this role.`);
      return;
    }
    if (window.confirm(`Are you sure you want to delete the role "${role}"?`)) {
      deleteRole(role);
      loadData();
    }
  };

  const getRoleColor = (role) => {
    const colors = {
      'Project Manager': '#667eea',
      'Developer': '#10b981',
      'Designer': '#ec4899',
      'QA Engineer': '#f59e0b',
      'DevOps': '#06b6d4',
      'Analyst': '#8b5cf6',
    };
    return colors[role] || '#64748b';
  };

  const defaultRoles = ['Project Manager', 'Developer', 'Designer', 'QA Engineer', 'DevOps', 'Analyst'];

  return (
    <div className="team-page">
      <div className="page-header">
        <div>
          <h1>Team</h1>
          <p>Manage your team members</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary-outline" onClick={() => setShowRoleModal(true)}>
            <FiTag /> Manage Roles
          </button>
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <FiPlus /> Add Member
          </button>
        </div>
      </div>

      <div className="filters-bar">
        <div className="search-box">
          <FiSearch />
          <input
            type="text"
            placeholder="Search team members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
          <option value="all">All Roles</option>
          {getAllRoles().map((role) => (
            <option key={role} value={role}>{role}</option>
          ))}
        </select>
      </div>

      <div className="team-stats">
        <div className="stat-item">
          <span className="stat-number">{team.length}</span>
          <span className="stat-label">Total Members</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{team.filter(m => m.role === 'Developer').length}</span>
          <span className="stat-label">Developers</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{projects.length}</span>
          <span className="stat-label">Active Projects</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{tasks.filter(t => t.status !== 'completed').length}</span>
          <span className="stat-label">Open Tasks</span>
        </div>
      </div>

      <div className="team-grid">
        {filteredTeam.map((member) => {
          const stats = getMemberStats(member.id);

          return (
            <div key={member.id} className="member-card">
              <div className="member-header">
                <div className="member-avatar" style={{ background: getRoleColor(member.role) }}>
                  {member.avatar}
                </div>
                <div className="menu-container">
                  <button
                    className="menu-trigger"
                    onClick={() => setOpenMenu(openMenu === member.id ? null : member.id)}
                  >
                    <FiMoreVertical />
                  </button>
                  {openMenu === member.id && (
                    <div className="dropdown-menu">
                      <button onClick={() => { setSelectedMember(member); setOpenMenu(null); }}>
                        <FiBarChart2 /> Performance
                      </button>
                      <button onClick={() => handleEdit(member)}>
                        <FiEdit2 /> Edit
                      </button>
                      <button className="delete-action" onClick={() => handleDelete(member.id)}>
                        <FiTrash2 /> Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="member-info">
                <h3>{member.name}</h3>
                <span
                  className="role-badge"
                  style={{ background: `${getRoleColor(member.role)}15`, color: getRoleColor(member.role) }}
                >
                  {member.role}
                </span>
              </div>

              <div className="member-contact">
                <a href={`mailto:${member.email}`} className="contact-item">
                  <FiMail />
                  <span>{member.email}</span>
                </a>
              </div>

              <div className="member-stats">
                <div className="member-stat">
                  <FiFolder />
                  <span>{stats.projectCount} Projects</span>
                </div>
                <div className="member-stat">
                  <FiCheckCircle />
                  <span>{stats.completedTasks}/{stats.totalTasks} Tasks</span>
                </div>
              </div>

              {stats.totalTasks > 0 && (
                <div className="task-progress">
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${(stats.completedTasks / stats.totalTasks) * 100}%` }}
                    />
                  </div>
                  <span className="progress-text">
                    {Math.round((stats.completedTasks / stats.totalTasks) * 100)}% complete
                  </span>
                </div>
              )}

              <button
                className="view-performance-btn"
                onClick={() => setSelectedMember(member)}
              >
                <FiBarChart2 /> View Performance
              </button>
            </div>
          );
        })}
      </div>

      {filteredTeam.length === 0 && (
        <div className="empty-state">
          <FiUser className="empty-icon" />
          <p>No team members found</p>
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            Add your first team member
          </button>
        </div>
      )}

      {/* Member Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingMember ? 'Edit Team Member' : 'Add Team Member'}</h2>
              <button className="close-btn" onClick={closeModal}>
                <FiX />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter email address"
                  required
                />
              </div>

              <div className="form-group">
                <label>Role *</label>
                <div className="role-selection">
                  <div className="role-toggle">
                    <button
                      type="button"
                      className={!useCustomRole ? 'active' : ''}
                      onClick={() => setUseCustomRole(false)}
                    >
                      Select Role
                    </button>
                    <button
                      type="button"
                      className={useCustomRole ? 'active' : ''}
                      onClick={() => setUseCustomRole(true)}
                    >
                      Custom Role
                    </button>
                  </div>

                  {!useCustomRole ? (
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      required
                    >
                      {getAllRoles().length > 0 ? (
                        getAllRoles().map((role) => (
                          <option key={role} value={role}>{role}</option>
                        ))
                      ) : (
                        defaultRoles.map((role) => (
                          <option key={role} value={role}>{role}</option>
                        ))
                      )}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={formData.customRole}
                      onChange={(e) => setFormData({ ...formData, customRole: e.target.value })}
                      placeholder="Enter custom role (e.g., Team Lead, Intern)"
                      required={useCustomRole}
                    />
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Enter phone number"
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingMember ? 'Update Member' : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Roles Modal */}
      {showRoleModal && (
        <div className="modal-overlay" onClick={() => setShowRoleModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Manage Roles</h2>
              <button className="close-btn" onClick={() => setShowRoleModal(false)}>
                <FiX />
              </button>
            </div>

            <form onSubmit={handleAddRole} className="add-role-form">
              <input
                type="text"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                placeholder="Enter new role name..."
              />
              <button type="submit" className="btn-primary" disabled={!newRoleName.trim()}>
                <FiPlus /> Add
              </button>
            </form>

            <div className="roles-list">
              <h4>Default Roles</h4>
              <div className="roles-grid">
                {defaultRoles.map((role) => (
                  <div key={role} className="role-item default">
                    <span className="role-color" style={{ background: getRoleColor(role) }} />
                    <span className="role-name">{role}</span>
                    <span className="role-count">
                      {team.filter(m => m.role === role).length} members
                    </span>
                  </div>
                ))}
              </div>

              {roles.filter(r => !defaultRoles.includes(r)).length > 0 && (
                <>
                  <h4>Custom Roles</h4>
                  <div className="roles-grid">
                    {roles.filter(r => !defaultRoles.includes(r)).map((role) => (
                      <div key={role} className="role-item custom">
                        <span className="role-color" style={{ background: getRoleColor(role) }} />
                        <span className="role-name">{role}</span>
                        <span className="role-count">
                          {team.filter(m => m.role === role).length} members
                        </span>
                        <button
                          className="delete-role-btn"
                          onClick={() => handleDeleteRole(role)}
                          title="Delete role"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowRoleModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Performance Modal */}
      {selectedMember && (
        <MemberPerformance
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
        />
      )}
    </div>
  );
};

export default Team;
