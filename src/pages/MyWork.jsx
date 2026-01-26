import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiFolder,
  FiCalendar,
  FiTrendingUp,
  FiMessageCircle,
  FiPaperclip,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { getTasks, getProjects, updateTask, getComments, getAttachments } from '../utils/localStorage';
import { format, isAfter, parseISO } from 'date-fns';
import TaskDetail from '../components/TaskDetail';
import './MyWork.css';

const MyWork = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [filter, setFilter] = useState('all');
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = () => {
    if (!user) return;

    const allTasks = getTasks();
    const allProjects = getProjects();

    // Get tasks assigned to current user
    const myTasks = allTasks.filter(t => t.assigneeId === user.id);
    setTasks(myTasks);

    // Get projects where user is a team member
    const myProjects = allProjects.filter(p => p.teamMembers?.includes(user.id));
    setProjects(myProjects);
  };

  const handleStatusChange = (taskId, newStatus) => {
    updateTask(taskId, { status: newStatus });
    loadData();
  };

  const getProject = (projectId) => {
    return getProjects().find(p => p.id === projectId);
  };

  const isOverdue = (dueDate, status) => {
    if (!dueDate || status === 'completed') return false;
    return isAfter(new Date(), parseISO(dueDate));
  };

  const getPriorityStyle = (priority) => {
    const styles = {
      high: { bg: '#fee2e2', color: '#dc2626' },
      medium: { bg: '#fef3c7', color: '#d97706' },
      low: { bg: '#dcfce7', color: '#16a34a' },
    };
    return styles[priority] || styles.medium;
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  const stats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'todo').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    overdue: tasks.filter(t => isOverdue(t.dueDate, t.status)).length,
  };

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <div className="mywork-page">
      <div className="page-header">
        <div className="user-welcome">
          <div className="user-avatar-large">{user?.avatar}</div>
          <div>
            <h1>My Work</h1>
            <p>Welcome back, {user?.name}!</p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="mywork-stats">
        <div className="stat-card">
          <div className="stat-icon blue">
            <FiFolder />
          </div>
          <div className="stat-info">
            <span className="stat-value">{projects.length}</span>
            <span className="stat-label">My Projects</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange">
            <FiClock />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.inProgress}</span>
            <span className="stat-label">In Progress</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">
            <FiCheckCircle />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.completed}</span>
            <span className="stat-label">Completed</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple">
            <FiTrendingUp />
          </div>
          <div className="stat-info">
            <span className="stat-value">{completionRate}%</span>
            <span className="stat-label">Completion</span>
          </div>
        </div>
      </div>

      {/* Overdue Alert */}
      {stats.overdue > 0 && (
        <div className="overdue-alert">
          <FiAlertCircle />
          <span>You have {stats.overdue} overdue task{stats.overdue > 1 ? 's' : ''}</span>
        </div>
      )}

      <div className="mywork-content">
        {/* My Projects */}
        <div className="mywork-section">
          <h2>My Projects</h2>
          {projects.length > 0 ? (
            <div className="projects-list">
              {projects.map(project => {
                const projectTasks = tasks.filter(t => t.projectId === project.id);
                const completedTasks = projectTasks.filter(t => t.status === 'completed').length;
                const progress = projectTasks.length > 0 ? (completedTasks / projectTasks.length) * 100 : 0;

                return (
                  <div key={project.id} className="project-card-small">
                    <div className="project-color" style={{ background: project.color }} />
                    <div className="project-info">
                      <h4>{project.name}</h4>
                      <span className={`status-badge ${project.status}`}>
                        {project.status.replace('-', ' ')}
                      </span>
                    </div>
                    <div className="project-progress-mini">
                      <div className="progress-bar-mini">
                        <div className="progress-fill-mini" style={{ width: `${progress}%` }} />
                      </div>
                      <span>{completedTasks}/{projectTasks.length} tasks</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state-small">
              <p>You're not assigned to any projects yet.</p>
            </div>
          )}
        </div>

        {/* My Tasks */}
        <div className="mywork-section tasks-section">
          <div className="section-header">
            <h2>My Tasks</h2>
            <div className="task-filters">
              <button
                className={filter === 'all' ? 'active' : ''}
                onClick={() => setFilter('all')}
              >
                All ({stats.total})
              </button>
              <button
                className={filter === 'todo' ? 'active' : ''}
                onClick={() => setFilter('todo')}
              >
                To Do ({stats.todo})
              </button>
              <button
                className={filter === 'in-progress' ? 'active' : ''}
                onClick={() => setFilter('in-progress')}
              >
                In Progress ({stats.inProgress})
              </button>
              <button
                className={filter === 'completed' ? 'active' : ''}
                onClick={() => setFilter('completed')}
              >
                Completed ({stats.completed})
              </button>
            </div>
          </div>

          {filteredTasks.length > 0 ? (
            <div className="tasks-list">
              {filteredTasks.map(task => {
                const project = getProject(task.projectId);
                const priorityStyle = getPriorityStyle(task.priority);
                const overdue = isOverdue(task.dueDate, task.status);
                const commentCount = getComments(task.id).length;
                const attachmentCount = getAttachments(task.id).length;

                return (
                  <div key={task.id} className={`task-card ${task.status}`}>
                    <div className="task-checkbox">
                      <input
                        type="checkbox"
                        checked={task.status === 'completed'}
                        onChange={() => handleStatusChange(
                          task.id,
                          task.status === 'completed' ? 'todo' : 'completed'
                        )}
                      />
                    </div>
                    <div className="task-content" onClick={() => setSelectedTask(task)}>
                      <div className="task-header">
                        <h4 className={task.status === 'completed' ? 'completed' : ''}>
                          {task.title}
                        </h4>
                        <span
                          className="priority-badge"
                          style={{ background: priorityStyle.bg, color: priorityStyle.color }}
                        >
                          {task.priority}
                        </span>
                      </div>
                      {task.description && (
                        <p className="task-description">{task.description}</p>
                      )}
                      <div className="task-meta">
                        {project && (
                          <span className="task-project" style={{ color: project.color }}>
                            <FiFolder /> {project.name}
                          </span>
                        )}
                        {task.dueDate && (
                          <span className={`task-due ${overdue ? 'overdue' : ''}`}>
                            <FiCalendar />
                            {format(parseISO(task.dueDate), 'MMM dd, yyyy')}
                          </span>
                        )}
                        {commentCount > 0 && (
                          <span className="task-indicator">
                            <FiMessageCircle /> {commentCount}
                          </span>
                        )}
                        {attachmentCount > 0 && (
                          <span className="task-indicator">
                            <FiPaperclip /> {attachmentCount}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="task-status-select">
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id, e.target.value)}
                      >
                        <option value="todo">To Do</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state-small">
              <FiCheckCircle className="empty-icon" />
              <p>
                {filter === 'all'
                  ? "You don't have any tasks assigned yet."
                  : `No ${filter.replace('-', ' ')} tasks.`}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetail
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={() => {
            loadData();
            setSelectedTask(getTasks().find(t => t.id === selectedTask.id));
          }}
          currentUser={user}
        />
      )}
    </div>
  );
};

export default MyWork;
