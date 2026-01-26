import { useState, useEffect } from 'react';
import {
  FiX,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiTrendingUp,
  FiTrendingDown,
  FiFolder,
  FiCalendar,
  FiAward,
  FiTarget,
  FiActivity,
  FiPieChart,
} from 'react-icons/fi';
import { getTasks, getProjects, getComments } from '../utils/localStorage';
import { format, parseISO, differenceInDays, isAfter, isBefore, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import './MemberPerformance.css';

const MemberPerformance = ({ member, onClose }) => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [timeRange, setTimeRange] = useState('all'); // 'all', 'month', '3months'

  useEffect(() => {
    loadData();
  }, [member]);

  const loadData = () => {
    const allTasks = getTasks().filter(t => t.assigneeId === member.id);
    const allProjects = getProjects().filter(p => p.teamMembers?.includes(member.id));
    setTasks(allTasks);
    setProjects(allProjects);
  };

  // Filter tasks by time range
  const getFilteredTasks = () => {
    if (timeRange === 'all') return tasks;

    const now = new Date();
    let startDate;

    if (timeRange === 'month') {
      startDate = startOfMonth(now);
    } else if (timeRange === '3months') {
      startDate = startOfMonth(subMonths(now, 2));
    }

    return tasks.filter(t => {
      if (!t.createdAt) return true;
      return isAfter(parseISO(t.createdAt), startDate);
    });
  };

  const filteredTasks = getFilteredTasks();

  // Calculate performance metrics
  const metrics = {
    totalTasks: filteredTasks.length,
    completedTasks: filteredTasks.filter(t => t.status === 'completed').length,
    inProgressTasks: filteredTasks.filter(t => t.status === 'in-progress').length,
    todoTasks: filteredTasks.filter(t => t.status === 'todo').length,
    overdueTasks: filteredTasks.filter(t => {
      if (!t.dueDate || t.status === 'completed') return false;
      return isAfter(new Date(), parseISO(t.dueDate));
    }).length,
    highPriorityCompleted: filteredTasks.filter(t => t.priority === 'high' && t.status === 'completed').length,
    highPriorityTotal: filteredTasks.filter(t => t.priority === 'high').length,
  };

  const completionRate = metrics.totalTasks > 0
    ? Math.round((metrics.completedTasks / metrics.totalTasks) * 100)
    : 0;

  // High priority completion rate (100% if no high priority tasks - shouldn't penalize)
  const highPriorityRate = metrics.highPriorityTotal > 0
    ? Math.round((metrics.highPriorityCompleted / metrics.highPriorityTotal) * 100)
    : 100; // If no high priority tasks, consider it 100% (not applicable)

  // Calculate on-time completion rate
  const completedTasks = filteredTasks.filter(t => t.status === 'completed');
  const onTimeCompleted = completedTasks.filter(t => {
    if (!t.dueDate) return true;
    // Assuming task was completed on time if it's completed
    return true; // In a real app, you'd track completion date
  }).length;
  const onTimeRate = completedTasks.length > 0
    ? Math.round((onTimeCompleted / completedTasks.length) * 100)
    : 100; // If no completed tasks yet, don't penalize

  // Calculate average tasks per project
  const avgTasksPerProject = projects.length > 0
    ? Math.round(metrics.totalTasks / projects.length)
    : 0;

  // Get task distribution by priority
  const priorityDistribution = {
    high: filteredTasks.filter(t => t.priority === 'high').length,
    medium: filteredTasks.filter(t => t.priority === 'medium').length,
    low: filteredTasks.filter(t => t.priority === 'low').length,
  };

  // Get recent activity (last 5 completed tasks)
  const recentCompleted = filteredTasks
    .filter(t => t.status === 'completed')
    .slice(-5)
    .reverse();

  // Calculate comment activity
  const totalComments = tasks.reduce((sum, task) => {
    const taskComments = getComments(task.id).filter(c => c.authorId === member.id);
    return sum + taskComments.length;
  }, 0);

  // Overdue penalty rate (100 = no overdue tasks)
  const noOverdueRate = metrics.totalTasks > 0
    ? 100 - Math.round((metrics.overdueTasks / metrics.totalTasks) * 100)
    : 100; // If no tasks, no overdue penalty

  // Performance score calculation:
  // - 50% based on task completion rate (most important)
  // - 25% based on high priority task handling (if applicable)
  // - 25% based on not having overdue tasks
  // If person has no tasks, score is 0 (no data to calculate)
  let performanceScore = 0;
  if (metrics.totalTasks > 0) {
    performanceScore = Math.round(
      (completionRate * 0.5) +
      (highPriorityRate * 0.25) +
      (noOverdueRate * 0.25)
    );
  }

  const getPerformanceLevel = (score, hasTasks) => {
    if (!hasTasks) return { label: 'No Data', color: '#94a3b8' };
    if (score >= 80) return { label: 'Excellent', color: '#10b981' };
    if (score >= 60) return { label: 'Good', color: '#3b82f6' };
    if (score >= 40) return { label: 'Average', color: '#f59e0b' };
    return { label: 'Needs Improvement', color: '#ef4444' };
  };

  const performanceLevel = getPerformanceLevel(performanceScore, metrics.totalTasks > 0);

  const getProjectById = (id) => getProjects().find(p => p.id === id);

  return (
    <div className="performance-overlay" onClick={onClose}>
      <div className="performance-modal" onClick={(e) => e.stopPropagation()}>
        <div className="performance-header">
          <div className="member-profile">
            <div className="member-avatar-large">{member.avatar}</div>
            <div className="member-details">
              <h2>{member.name}</h2>
              <span className="member-role">{member.role}</span>
              <span className="member-email">{member.email}</span>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <div className="time-filter">
          <button
            className={timeRange === 'all' ? 'active' : ''}
            onClick={() => setTimeRange('all')}
          >
            All Time
          </button>
          <button
            className={timeRange === '3months' ? 'active' : ''}
            onClick={() => setTimeRange('3months')}
          >
            Last 3 Months
          </button>
          <button
            className={timeRange === 'month' ? 'active' : ''}
            onClick={() => setTimeRange('month')}
          >
            This Month
          </button>
        </div>

        <div className="performance-content">
          {/* Performance Score */}
          <div className="performance-score-card">
            <div className="score-circle" style={{ '--score-color': performanceLevel.color }}>
              <svg viewBox="0 0 100 100">
                <circle className="score-bg" cx="50" cy="50" r="45" />
                <circle
                  className="score-fill"
                  cx="50"
                  cy="50"
                  r="45"
                  style={{
                    strokeDasharray: `${performanceScore * 2.83} 283`,
                    stroke: performanceLevel.color
                  }}
                />
              </svg>
              <div className="score-value">
                <span className="score-number">{performanceScore}</span>
                <span className="score-label">Score</span>
              </div>
            </div>
            <div className="score-info">
              <span className="performance-level" style={{ color: performanceLevel.color }}>
                <FiAward /> {performanceLevel.label}
              </span>
              <p>
                {metrics.totalTasks > 0
                  ? 'Based on task completion (50%), priority handling (25%), and deadline adherence (25%)'
                  : 'No tasks assigned yet to calculate performance'}
              </p>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-icon blue">
                <FiTarget />
              </div>
              <div className="metric-info">
                <span className="metric-value">{metrics.totalTasks}</span>
                <span className="metric-label">Total Tasks</span>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon green">
                <FiCheckCircle />
              </div>
              <div className="metric-info">
                <span className="metric-value">{metrics.completedTasks}</span>
                <span className="metric-label">Completed</span>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon orange">
                <FiClock />
              </div>
              <div className="metric-info">
                <span className="metric-value">{metrics.inProgressTasks}</span>
                <span className="metric-label">In Progress</span>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon red">
                <FiAlertCircle />
              </div>
              <div className="metric-info">
                <span className="metric-value">{metrics.overdueTasks}</span>
                <span className="metric-label">Overdue</span>
              </div>
            </div>
          </div>

          {/* Progress Bars */}
          <div className="progress-section">
            <h3>Performance Breakdown</h3>

            <div className="progress-item">
              <div className="progress-header">
                <span>Task Completion Rate</span>
                <span className="progress-value">{completionRate}%</span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill green"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            </div>

            <div className="progress-item">
              <div className="progress-header">
                <span>High Priority Completion</span>
                <span className="progress-value">
                  {metrics.highPriorityTotal > 0 ? `${highPriorityRate}%` : 'N/A'}
                </span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill red"
                  style={{ width: `${metrics.highPriorityTotal > 0 ? highPriorityRate : 0}%` }}
                />
              </div>
              <span className="progress-detail">
                {metrics.highPriorityTotal > 0
                  ? `${metrics.highPriorityCompleted} of ${metrics.highPriorityTotal} high priority tasks`
                  : 'No high priority tasks assigned'}
              </span>
            </div>

            <div className="progress-item">
              <div className="progress-header">
                <span>On-Time Delivery</span>
                <span className="progress-value">{onTimeRate}%</span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill blue"
                  style={{ width: `${onTimeRate}%` }}
                />
              </div>
            </div>
          </div>

          {/* Task Distribution */}
          <div className="distribution-section">
            <h3>Task Priority Distribution</h3>
            <div className="priority-bars">
              <div className="priority-bar-item">
                <div className="priority-label">
                  <span className="priority-dot high" />
                  <span>High</span>
                </div>
                <div className="priority-bar">
                  <div
                    className="priority-fill high"
                    style={{ width: `${metrics.totalTasks > 0 ? (priorityDistribution.high / metrics.totalTasks) * 100 : 0}%` }}
                  />
                </div>
                <span className="priority-count">{priorityDistribution.high}</span>
              </div>
              <div className="priority-bar-item">
                <div className="priority-label">
                  <span className="priority-dot medium" />
                  <span>Medium</span>
                </div>
                <div className="priority-bar">
                  <div
                    className="priority-fill medium"
                    style={{ width: `${metrics.totalTasks > 0 ? (priorityDistribution.medium / metrics.totalTasks) * 100 : 0}%` }}
                  />
                </div>
                <span className="priority-count">{priorityDistribution.medium}</span>
              </div>
              <div className="priority-bar-item">
                <div className="priority-label">
                  <span className="priority-dot low" />
                  <span>Low</span>
                </div>
                <div className="priority-bar">
                  <div
                    className="priority-fill low"
                    style={{ width: `${metrics.totalTasks > 0 ? (priorityDistribution.low / metrics.totalTasks) * 100 : 0}%` }}
                  />
                </div>
                <span className="priority-count">{priorityDistribution.low}</span>
              </div>
            </div>
          </div>

          {/* Projects Overview */}
          <div className="projects-section">
            <h3>Projects ({projects.length})</h3>
            {projects.length > 0 ? (
              <div className="projects-list">
                {projects.map(project => {
                  const projectTasks = filteredTasks.filter(t => t.projectId === project.id);
                  const projectCompleted = projectTasks.filter(t => t.status === 'completed').length;
                  const projectProgress = projectTasks.length > 0
                    ? Math.round((projectCompleted / projectTasks.length) * 100)
                    : 0;

                  return (
                    <div key={project.id} className="project-item">
                      <div className="project-color" style={{ background: project.color }} />
                      <div className="project-info">
                        <h4>{project.name}</h4>
                        <span className={`status-badge ${project.status}`}>
                          {project.status.replace('-', ' ')}
                        </span>
                      </div>
                      <div className="project-stats">
                        <div className="project-progress">
                          <div className="progress-bar-mini">
                            <div
                              className="progress-fill-mini"
                              style={{ width: `${projectProgress}%`, background: project.color }}
                            />
                          </div>
                          <span>{projectProgress}%</span>
                        </div>
                        <span className="task-count">{projectCompleted}/{projectTasks.length} tasks</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="no-data">No projects assigned</p>
            )}
          </div>

          {/* Activity Summary */}
          <div className="activity-section">
            <h3>Activity Summary</h3>
            <div className="activity-stats">
              <div className="activity-stat">
                <FiFolder />
                <span>{projects.length} Projects</span>
              </div>
              <div className="activity-stat">
                <FiCheckCircle />
                <span>{metrics.completedTasks} Tasks Done</span>
              </div>
              <div className="activity-stat">
                <FiActivity />
                <span>{totalComments} Comments</span>
              </div>
              <div className="activity-stat">
                <FiPieChart />
                <span>{avgTasksPerProject} Avg Tasks/Project</span>
              </div>
            </div>
          </div>

          {/* Recent Completed Tasks */}
          <div className="recent-section">
            <h3>Recently Completed</h3>
            {recentCompleted.length > 0 ? (
              <div className="recent-tasks">
                {recentCompleted.map(task => {
                  const project = getProjectById(task.projectId);
                  return (
                    <div key={task.id} className="recent-task-item">
                      <FiCheckCircle className="check-icon" />
                      <div className="task-info">
                        <span className="task-title">{task.title}</span>
                        {project && (
                          <span className="task-project" style={{ color: project.color }}>
                            {project.name}
                          </span>
                        )}
                      </div>
                      <span className={`priority-tag ${task.priority}`}>
                        {task.priority}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="no-data">No completed tasks yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberPerformance;
