import { useState, useEffect } from 'react';
import {
  FiPlus,
  FiSearch,
  FiFilter,
  FiMoreVertical,
  FiEdit2,
  FiTrash2,
  FiX,
  FiCalendar,
  FiUser,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiEye,
} from 'react-icons/fi';
import { getTasks, getProjects, getTeam, addTask, updateTask, deleteTask } from '../utils/localStorage';
import { useAuth } from '../context/AuthContext';
import { format, isAfter, parseISO } from 'date-fns';
import TaskDetail from '../components/TaskDetail';
import './Tasks.css';

const Tasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [team, setTeam] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterProject, setFilterProject] = useState('all');
  const [filterAssignee, setFilterAssignee] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'board'
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectId: '',
    assigneeId: '',
    status: 'todo',
    priority: 'medium',
    dueDate: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setTasks(getTasks());
    setProjects(getProjects());
    setTeam(getTeam());
  };

  const getProject = (id) => projects.find(p => p.id === id);
  const getTeamMember = (id) => team.find(m => m.id === id);

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesProject = filterProject === 'all' || task.projectId === filterProject;
    const matchesAssignee = filterAssignee === 'all' || task.assigneeId === filterAssignee;
    return matchesSearch && matchesStatus && matchesProject && matchesAssignee;
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingTask) {
      updateTask(editingTask.id, formData);
    } else {
      addTask(formData);
    }
    loadData();
    closeModal();
  };

  const handleStatusChange = (taskId, newStatus) => {
    updateTask(taskId, { status: newStatus });
    loadData();
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      projectId: task.projectId,
      assigneeId: task.assigneeId || '',
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate || '',
    });
    setShowModal(true);
    setOpenMenu(null);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteTask(id);
      loadData();
    }
    setOpenMenu(null);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTask(null);
    setFormData({
      title: '',
      description: '',
      projectId: '',
      assigneeId: '',
      status: 'todo',
      priority: 'medium',
      dueDate: '',
    });
  };

  const getPriorityStyle = (priority) => {
    const styles = {
      high: { bg: '#fee2e2', color: '#dc2626' },
      medium: { bg: '#fef3c7', color: '#d97706' },
      low: { bg: '#dcfce7', color: '#16a34a' },
    };
    return styles[priority] || styles.medium;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <FiCheckCircle className="status-icon completed" />;
      case 'in-progress': return <FiClock className="status-icon in-progress" />;
      default: return <FiAlertCircle className="status-icon todo" />;
    }
  };

  const isOverdue = (dueDate, status) => {
    if (!dueDate || status === 'completed') return false;
    return isAfter(new Date(), parseISO(dueDate));
  };

  // Board view columns
  const columns = [
    { id: 'todo', title: 'To Do', color: '#64748b' },
    { id: 'in-progress', title: 'In Progress', color: '#3b82f6' },
    { id: 'completed', title: 'Completed', color: '#10b981' },
  ];

  const getTasksByStatus = (status) => filteredTasks.filter(t => t.status === status);

  return (
    <div className="tasks-page">
      <div className="page-header">
        <div>
          <h1>Tasks</h1>
          <p>Manage and track all your tasks</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <FiPlus /> New Task
        </button>
      </div>

      <div className="filters-bar">
        <div className="search-box">
          <FiSearch />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="all">All Status</option>
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <select value={filterProject} onChange={(e) => setFilterProject(e.target.value)}>
          <option value="all">All Projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <select value={filterAssignee} onChange={(e) => setFilterAssignee(e.target.value)}>
          <option value="all">All Assignees</option>
          {team.map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
        <div className="view-toggle">
          <button
            className={viewMode === 'list' ? 'active' : ''}
            onClick={() => setViewMode('list')}
          >
            List
          </button>
          <button
            className={viewMode === 'board' ? 'active' : ''}
            onClick={() => setViewMode('board')}
          >
            Board
          </button>
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="tasks-list">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => {
              const project = getProject(task.projectId);
              const assignee = getTeamMember(task.assigneeId);
              const priorityStyle = getPriorityStyle(task.priority);
              const overdue = isOverdue(task.dueDate, task.status);

              return (
                <div
                  key={task.id}
                  className={`task-card ${task.status}`}
                  onClick={() => setSelectedTask(task)}
                >
                  <div className="task-checkbox" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={task.status === 'completed'}
                      onChange={() => handleStatusChange(task.id, task.status === 'completed' ? 'todo' : 'completed')}
                    />
                  </div>
                  <div className="task-content">
                    <div className="task-header">
                      <h4 className={task.status === 'completed' ? 'completed' : ''}>{task.title}</h4>
                      <div className="task-badges">
                        <span
                          className="priority-badge"
                          style={{ background: priorityStyle.bg, color: priorityStyle.color }}
                        >
                          {task.priority}
                        </span>
                        {project && (
                          <span className="project-badge" style={{ borderColor: project.color }}>
                            {project.name}
                          </span>
                        )}
                      </div>
                    </div>
                    {task.description && (
                      <p className="task-description">{task.description}</p>
                    )}
                    <div className="task-meta">
                      {assignee && (
                        <div className="meta-item">
                          <div className="assignee-avatar">{assignee.avatar}</div>
                          <span>{assignee.name}</span>
                        </div>
                      )}
                      {task.dueDate && (
                        <div className={`meta-item ${overdue ? 'overdue' : ''}`}>
                          <FiCalendar />
                          <span>{format(parseISO(task.dueDate), 'MMM dd, yyyy')}</span>
                        </div>
                      )}
                      <select
                        className="status-select"
                        value={task.status}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => handleStatusChange(task.id, e.target.value)}
                      >
                        <option value="todo">To Do</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  </div>
                  <div className="task-actions" onClick={(e) => e.stopPropagation()}>
                    <div className="menu-container">
                      <button
                        className="menu-trigger"
                        onClick={() => setOpenMenu(openMenu === task.id ? null : task.id)}
                      >
                        <FiMoreVertical />
                      </button>
                      {openMenu === task.id && (
                        <div className="dropdown-menu">
                          <button onClick={() => { setSelectedTask(task); setOpenMenu(null); }}>
                            <FiEye /> View Details
                          </button>
                          <button onClick={() => handleEdit(task)}>
                            <FiEdit2 /> Edit
                          </button>
                          <button className="delete-action" onClick={() => handleDelete(task.id)}>
                            <FiTrash2 /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="empty-state">
              <FiCheckCircle className="empty-icon" />
              <p>No tasks found</p>
              <button className="btn-primary" onClick={() => setShowModal(true)}>
                Create your first task
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="tasks-board">
          {columns.map((column) => (
            <div key={column.id} className="board-column">
              <div className="column-header" style={{ borderColor: column.color }}>
                <h3>{column.title}</h3>
                <span className="task-count">{getTasksByStatus(column.id).length}</span>
              </div>
              <div className="column-tasks">
                {getTasksByStatus(column.id).map((task) => {
                  const project = getProject(task.projectId);
                  const assignee = getTeamMember(task.assigneeId);
                  const priorityStyle = getPriorityStyle(task.priority);
                  const overdue = isOverdue(task.dueDate, task.status);

                  return (
                    <div
                      key={task.id}
                      className="board-task-card"
                      onClick={() => setSelectedTask(task)}
                    >
                      <div className="board-task-header">
                        <span
                          className="priority-dot"
                          style={{ background: priorityStyle.color }}
                        />
                        <h4>{task.title}</h4>
                      </div>
                      {task.description && (
                        <p className="board-task-desc">{task.description}</p>
                      )}
                      <div className="board-task-footer">
                        {assignee && (
                          <div className="board-assignee" title={assignee.name}>
                            {assignee.avatar}
                          </div>
                        )}
                        {task.dueDate && (
                          <span className={`board-due ${overdue ? 'overdue' : ''}`}>
                            {format(parseISO(task.dueDate), 'MMM dd')}
                          </span>
                        )}
                        {project && (
                          <span className="board-project" style={{ color: project.color }}>
                            {project.name}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
                <button
                  className="add-task-btn"
                  onClick={() => {
                    setFormData({ ...formData, status: column.id });
                    setShowModal(true);
                  }}
                >
                  <FiPlus /> Add Task
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Task Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingTask ? 'Edit Task' : 'New Task'}</h2>
              <button className="close-btn" onClick={closeModal}>
                <FiX />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Task Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter task title"
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter task description"
                  rows={3}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Project *</label>
                  <select
                    value={formData.projectId}
                    onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                    required
                  >
                    <option value="">Select project</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Assignee</label>
                  <select
                    value={formData.assigneeId}
                    onChange={(e) => setFormData({ ...formData, assigneeId: e.target.value })}
                  >
                    <option value="">Unassigned</option>
                    {team.map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
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

              <div className="form-group">
                <label>Due Date</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingTask ? 'Update Task' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

export default Tasks;
