import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiFolder,
  FiCheckSquare,
  FiUsers,
  FiTrendingUp,
  FiArrowRight,
  FiClock,
  FiAlertCircle,
} from 'react-icons/fi';
import { getDashboardStats, getProjects, getTasks, getTeam } from '../utils/localStorage';
import { format, isAfter, parseISO } from 'date-fns';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({});
  const [recentProjects, setRecentProjects] = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [team, setTeam] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setStats(getDashboardStats());

    const projects = getProjects();
    setRecentProjects(projects.slice(0, 3));

    const tasks = getTasks();
    const teamMembers = getTeam();
    setTeam(teamMembers);

    // Get upcoming/overdue tasks
    const today = new Date();
    const pending = tasks
      .filter(t => t.status !== 'completed')
      .map(t => ({
        ...t,
        assignee: teamMembers.find(m => m.id === t.assigneeId),
        project: projects.find(p => p.id === t.projectId),
        isOverdue: isAfter(today, parseISO(t.dueDate)),
      }))
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 5);
    setUpcomingTasks(pending);
  };

  const getTeamMember = (id) => team.find(m => m.id === id);

  const statCards = [
    {
      title: 'Total Projects',
      value: stats.totalProjects || 0,
      icon: FiFolder,
      color: '#667eea',
      bgColor: '#eff6ff',
      link: '/projects',
    },
    {
      title: 'Active Tasks',
      value: stats.inProgressTasks || 0,
      icon: FiCheckSquare,
      color: '#10b981',
      bgColor: '#ecfdf5',
      link: '/tasks',
    },
    {
      title: 'Team Members',
      value: stats.teamSize || 0,
      icon: FiUsers,
      color: '#f59e0b',
      bgColor: '#fffbeb',
      link: '/team',
    },
    {
      title: 'Completion Rate',
      value: `${stats.taskCompletionRate || 0}%`,
      icon: FiTrendingUp,
      color: '#8b5cf6',
      bgColor: '#f5f3ff',
      link: '/tasks',
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'in-progress': return '#3b82f6';
      case 'planning': return '#f59e0b';
      default: return '#64748b';
    }
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      high: { bg: '#fee2e2', color: '#dc2626' },
      medium: { bg: '#fef3c7', color: '#d97706' },
      low: { bg: '#dcfce7', color: '#16a34a' },
    };
    return colors[priority] || colors.medium;
  };

  return (
    <div className="dashboard">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome back! Here's your project overview.</p>
        </div>
        <Link to="/projects" className="btn-primary">
          <FiFolder /> New Project
        </Link>
      </div>

      <div className="stats-grid">
        {statCards.map((card, index) => (
          <Link key={index} to={card.link} className="stat-card">
            <div
              className="stat-icon"
              style={{ background: card.bgColor, color: card.color }}
            >
              <card.icon size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-value">{card.value}</span>
              <span className="stat-title">{card.title}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Progress Overview */}
      <div className="progress-card">
        <h3>Task Progress</h3>
        <div className="progress-stats">
          <div className="progress-item">
            <span className="progress-label">To Do</span>
            <span className="progress-value">{stats.todoTasks || 0}</span>
          </div>
          <div className="progress-item">
            <span className="progress-label">In Progress</span>
            <span className="progress-value">{stats.inProgressTasks || 0}</span>
          </div>
          <div className="progress-item">
            <span className="progress-label">Completed</span>
            <span className="progress-value">{stats.completedTasks || 0}</span>
          </div>
        </div>
        <div className="progress-bar-container">
          <div className="progress-bar">
            <div
              className="progress-segment todo"
              style={{ width: `${stats.totalTasks ? (stats.todoTasks / stats.totalTasks) * 100 : 0}%` }}
            />
            <div
              className="progress-segment in-progress"
              style={{ width: `${stats.totalTasks ? (stats.inProgressTasks / stats.totalTasks) * 100 : 0}%` }}
            />
            <div
              className="progress-segment completed"
              style={{ width: `${stats.totalTasks ? (stats.completedTasks / stats.totalTasks) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Recent Projects */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Recent Projects</h3>
            <Link to="/projects" className="view-all">
              View All <FiArrowRight />
            </Link>
          </div>
          <div className="card-content">
            {recentProjects.length > 0 ? (
              <div className="projects-list">
                {recentProjects.map((project) => (
                  <Link key={project.id} to={`/projects/${project.id}`} className="project-item">
                    <div
                      className="project-color"
                      style={{ background: project.color }}
                    />
                    <div className="project-info">
                      <span className="project-name">{project.name}</span>
                      <span className="project-meta">
                        {project.teamMembers?.length || 0} members
                      </span>
                    </div>
                    <span
                      className="project-status"
                      style={{ color: getStatusColor(project.status) }}
                    >
                      {project.status.replace('-', ' ')}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="empty-state">No projects yet</div>
            )}
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Upcoming Tasks</h3>
            <Link to="/tasks" className="view-all">
              View All <FiArrowRight />
            </Link>
          </div>
          <div className="card-content">
            {upcomingTasks.length > 0 ? (
              <div className="tasks-list">
                {upcomingTasks.map((task) => (
                  <div key={task.id} className="task-item">
                    <div className="task-info">
                      <span className="task-title">{task.title}</span>
                      <span className="task-project">{task.project?.name}</span>
                    </div>
                    <div className="task-meta">
                      <span
                        className="task-priority"
                        style={getPriorityBadge(task.priority)}
                      >
                        {task.priority}
                      </span>
                      <span className={`task-due ${task.isOverdue ? 'overdue' : ''}`}>
                        {task.isOverdue ? <FiAlertCircle /> : <FiClock />}
                        {format(parseISO(task.dueDate), 'MMM dd')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state success">All tasks completed!</div>
            )}
          </div>
        </div>
      </div>

      {/* Team Overview */}
      <div className="team-overview">
        <div className="card-header">
          <h3>Team Members</h3>
          <Link to="/team" className="view-all">
            View All <FiArrowRight />
          </Link>
        </div>
        <div className="team-avatars">
          {team.slice(0, 6).map((member) => (
            <div key={member.id} className="team-avatar" title={member.name}>
              {member.avatar}
            </div>
          ))}
          {team.length > 6 && (
            <div className="team-avatar more">+{team.length - 6}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
