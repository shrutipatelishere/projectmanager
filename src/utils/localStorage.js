// localStorage utility functions for Project Manager

const STORAGE_KEYS = {
  PROJECTS: 'pm_projects',
  TASKS: 'pm_tasks',
  TEAM: 'pm_team',
};

// Initialize with demo data if empty
const initializeData = () => {
  if (!localStorage.getItem(STORAGE_KEYS.TEAM)) {
    const demoTeam = [
      { id: 't1', name: 'John Doe', email: 'john@example.com', role: 'Project Manager', avatar: 'JD', status: 'active' },
      { id: 't2', name: 'Jane Smith', email: 'jane@example.com', role: 'Developer', avatar: 'JS', status: 'active' },
      { id: 't3', name: 'Mike Johnson', email: 'mike@example.com', role: 'Designer', avatar: 'MJ', status: 'active' },
      { id: 't4', name: 'Sarah Wilson', email: 'sarah@example.com', role: 'Developer', avatar: 'SW', status: 'active' },
    ];
    localStorage.setItem(STORAGE_KEYS.TEAM, JSON.stringify(demoTeam));
  }

  if (!localStorage.getItem(STORAGE_KEYS.PROJECTS)) {
    const demoProjects = [
      { id: 'p1', name: 'Website Redesign', description: 'Redesign company website with modern UI', status: 'in-progress', priority: 'high', startDate: '2024-01-15', dueDate: '2024-03-30', teamMembers: ['t1', 't2', 't3'], color: '#667eea' },
      { id: 'p2', name: 'Mobile App', description: 'Develop cross-platform mobile application', status: 'planning', priority: 'medium', startDate: '2024-02-01', dueDate: '2024-06-30', teamMembers: ['t2', 't4'], color: '#10b981' },
      { id: 'p3', name: 'API Integration', description: 'Integrate third-party APIs for payment processing', status: 'completed', priority: 'high', startDate: '2024-01-01', dueDate: '2024-02-15', teamMembers: ['t2'], color: '#f59e0b' },
    ];
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(demoProjects));
  }

  if (!localStorage.getItem(STORAGE_KEYS.TASKS)) {
    const demoTasks = [
      { id: 'tk1', title: 'Design homepage mockup', description: 'Create wireframes and high-fidelity mockups', projectId: 'p1', assigneeId: 't3', status: 'completed', priority: 'high', dueDate: '2024-01-25', createdAt: '2024-01-15' },
      { id: 'tk2', title: 'Implement navigation', description: 'Build responsive navigation component', projectId: 'p1', assigneeId: 't2', status: 'in-progress', priority: 'medium', dueDate: '2024-02-10', createdAt: '2024-01-20' },
      { id: 'tk3', title: 'Setup database schema', description: 'Design and implement database structure', projectId: 'p2', assigneeId: 't4', status: 'todo', priority: 'high', dueDate: '2024-02-15', createdAt: '2024-02-01' },
      { id: 'tk4', title: 'User authentication', description: 'Implement login and registration', projectId: 'p2', assigneeId: 't2', status: 'todo', priority: 'high', dueDate: '2024-02-20', createdAt: '2024-02-01' },
      { id: 'tk5', title: 'Payment gateway setup', description: 'Configure Stripe payment integration', projectId: 'p3', assigneeId: 't2', status: 'completed', priority: 'high', dueDate: '2024-02-10', createdAt: '2024-01-05' },
      { id: 'tk6', title: 'Write API documentation', description: 'Document all API endpoints', projectId: 'p3', assigneeId: 't2', status: 'completed', priority: 'medium', dueDate: '2024-02-14', createdAt: '2024-01-10' },
    ];
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(demoTasks));
  }
};

// Projects
export const getProjects = () => {
  initializeData();
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.PROJECTS) || '[]');
};

export const getProjectById = (id) => {
  const projects = getProjects();
  return projects.find(p => p.id === id);
};

export const addProject = (project) => {
  const projects = getProjects();
  const newProject = { ...project, id: `p${Date.now()}` };
  projects.push(newProject);
  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  return newProject;
};

export const updateProject = (id, updates) => {
  const projects = getProjects();
  const index = projects.findIndex(p => p.id === id);
  if (index !== -1) {
    projects[index] = { ...projects[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  }
  return projects[index];
};

export const deleteProject = (id) => {
  const projects = getProjects().filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  // Also delete associated tasks
  const tasks = getTasks().filter(t => t.projectId !== id);
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
};

// Tasks
export const getTasks = () => {
  initializeData();
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.TASKS) || '[]');
};

export const getTaskById = (id) => {
  const tasks = getTasks();
  return tasks.find(t => t.id === id);
};

export const getTasksByProject = (projectId) => {
  return getTasks().filter(t => t.projectId === projectId);
};

export const getTasksByAssignee = (assigneeId) => {
  return getTasks().filter(t => t.assigneeId === assigneeId);
};

export const addTask = (task) => {
  const tasks = getTasks();
  const newTask = { ...task, id: `tk${Date.now()}`, createdAt: new Date().toISOString().split('T')[0] };
  tasks.push(newTask);
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  return newTask;
};

export const updateTask = (id, updates) => {
  const tasks = getTasks();
  const index = tasks.findIndex(t => t.id === id);
  if (index !== -1) {
    tasks[index] = { ...tasks[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  }
  return tasks[index];
};

export const deleteTask = (id) => {
  const tasks = getTasks().filter(t => t.id !== id);
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
};

// Team
export const getTeam = () => {
  initializeData();
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.TEAM) || '[]');
};

export const getTeamMemberById = (id) => {
  const team = getTeam();
  return team.find(m => m.id === id);
};

export const addTeamMember = (member) => {
  const team = getTeam();
  const initials = member.name.split(' ').map(n => n[0]).join('').toUpperCase();
  const newMember = { ...member, id: `t${Date.now()}`, avatar: initials, status: 'active' };
  team.push(newMember);
  localStorage.setItem(STORAGE_KEYS.TEAM, JSON.stringify(team));
  return newMember;
};

export const updateTeamMember = (id, updates) => {
  const team = getTeam();
  const index = team.findIndex(m => m.id === id);
  if (index !== -1) {
    team[index] = { ...team[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.TEAM, JSON.stringify(team));
  }
  return team[index];
};

export const deleteTeamMember = (id) => {
  const team = getTeam().filter(m => m.id !== id);
  localStorage.setItem(STORAGE_KEYS.TEAM, JSON.stringify(team));
};

// Roles
const DEFAULT_ROLES = ['Project Manager', 'Developer', 'Designer', 'QA Engineer', 'DevOps', 'Analyst'];

export const getRoles = () => {
  const customRoles = JSON.parse(localStorage.getItem('pm_roles') || '[]');
  return [...DEFAULT_ROLES, ...customRoles];
};

export const addRole = (role) => {
  if (DEFAULT_ROLES.includes(role)) return; // Don't add default roles
  const customRoles = JSON.parse(localStorage.getItem('pm_roles') || '[]');
  if (!customRoles.includes(role)) {
    customRoles.push(role);
    localStorage.setItem('pm_roles', JSON.stringify(customRoles));
  }
};

export const deleteRole = (role) => {
  if (DEFAULT_ROLES.includes(role)) return; // Can't delete default roles
  const customRoles = JSON.parse(localStorage.getItem('pm_roles') || '[]');
  const filtered = customRoles.filter(r => r !== role);
  localStorage.setItem('pm_roles', JSON.stringify(filtered));
};

// Dashboard Stats
// Comments / Discussions
export const getComments = (taskId) => {
  const allComments = JSON.parse(localStorage.getItem('pm_comments') || '{}');
  return allComments[taskId] || [];
};

export const addComment = (taskId, comment) => {
  const allComments = JSON.parse(localStorage.getItem('pm_comments') || '{}');
  if (!allComments[taskId]) {
    allComments[taskId] = [];
  }
  const newComment = {
    id: `c${Date.now()}`,
    ...comment,
    createdAt: new Date().toISOString(),
  };
  allComments[taskId].push(newComment);
  localStorage.setItem('pm_comments', JSON.stringify(allComments));
  return newComment;
};

export const deleteComment = (taskId, commentId) => {
  const allComments = JSON.parse(localStorage.getItem('pm_comments') || '{}');
  if (allComments[taskId]) {
    allComments[taskId] = allComments[taskId].filter(c => c.id !== commentId);
    localStorage.setItem('pm_comments', JSON.stringify(allComments));
  }
};

// Attachments (stored as base64 data URLs)
export const getAttachments = (taskId) => {
  const allAttachments = JSON.parse(localStorage.getItem('pm_attachments') || '{}');
  return allAttachments[taskId] || [];
};

export const addAttachment = (taskId, attachment) => {
  const allAttachments = JSON.parse(localStorage.getItem('pm_attachments') || '{}');
  if (!allAttachments[taskId]) {
    allAttachments[taskId] = [];
  }
  const newAttachment = {
    id: `a${Date.now()}`,
    ...attachment,
    uploadedAt: new Date().toISOString(),
  };
  allAttachments[taskId].push(newAttachment);
  localStorage.setItem('pm_attachments', JSON.stringify(allAttachments));
  return newAttachment;
};

export const deleteAttachment = (taskId, attachmentId) => {
  const allAttachments = JSON.parse(localStorage.getItem('pm_attachments') || '{}');
  if (allAttachments[taskId]) {
    allAttachments[taskId] = allAttachments[taskId].filter(a => a.id !== attachmentId);
    localStorage.setItem('pm_attachments', JSON.stringify(allAttachments));
  }
};

// Dashboard Stats
export const getDashboardStats = () => {
  const projects = getProjects();
  const tasks = getTasks();
  const team = getTeam();

  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
  const todoTasks = tasks.filter(t => t.status === 'todo').length;

  const activeProjects = projects.filter(p => p.status === 'in-progress').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;

  return {
    totalProjects: projects.length,
    activeProjects,
    completedProjects,
    totalTasks: tasks.length,
    completedTasks,
    inProgressTasks,
    todoTasks,
    teamSize: team.length,
    taskCompletionRate: tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0,
  };
};
