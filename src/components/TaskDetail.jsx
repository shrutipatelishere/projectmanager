import { useState, useEffect, useRef } from 'react';
import {
  FiX,
  FiCalendar,
  FiUser,
  FiFolder,
  FiPaperclip,
  FiMessageCircle,
  FiSend,
  FiTrash2,
  FiImage,
  FiFile,
  FiDownload,
  FiEdit2,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiAtSign,
} from 'react-icons/fi';
import {
  getProjectById,
  getTeamMemberById,
  getTeam,
  updateTask,
  getComments,
  addComment,
  deleteComment,
  getAttachments,
  addAttachment,
  deleteAttachment,
} from '../utils/localStorage';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import './TaskDetail.css';

const TaskDetail = ({ task, onClose, onUpdate, currentUser }) => {
  const [activeTab, setActiveTab] = useState('details');
  const [comments, setComments] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [mentionedUsers, setMentionedUsers] = useState([]);
  const [showMentionList, setShowMentionList] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    detailedDescription: task.detailedDescription || '',
  });
  const fileInputRef = useRef(null);
  const commentInputRef = useRef(null);
  const team = getTeam();
  const project = getProjectById(task.projectId);
  const assignee = task.assigneeId ? getTeamMemberById(task.assigneeId) : null;

  // Get project team members for mentions
  const projectTeam = project?.teamMembers?.map(id => getTeamMemberById(id)).filter(Boolean) || [];

  useEffect(() => {
    loadComments();
    loadAttachments();
  }, [task.id]);

  const loadComments = () => {
    setComments(getComments(task.id));
  };

  const loadAttachments = () => {
    setAttachments(getAttachments(task.id));
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    addComment(task.id, {
      text: newComment,
      authorId: currentUser.id,
      mentions: mentionedUsers,
    });

    setNewComment('');
    setMentionedUsers([]);
    loadComments();
  };

  const handleDeleteComment = (commentId) => {
    if (window.confirm('Delete this comment?')) {
      deleteComment(task.id, commentId);
      loadComments();
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        addAttachment(task.id, {
          name: file.name,
          type: file.type,
          size: file.size,
          data: reader.result,
          uploadedBy: currentUser.id,
        });
        loadAttachments();
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleDeleteAttachment = (attachmentId) => {
    if (window.confirm('Delete this attachment?')) {
      deleteAttachment(task.id, attachmentId);
      loadAttachments();
    }
  };

  const handleMentionClick = (member) => {
    const beforeCursor = newComment.slice(0, newComment.lastIndexOf('@'));
    setNewComment(beforeCursor + `@${member.name} `);
    if (!mentionedUsers.includes(member.id)) {
      setMentionedUsers([...mentionedUsers, member.id]);
    }
    setShowMentionList(false);
    commentInputRef.current?.focus();
  };

  const handleCommentChange = (e) => {
    const value = e.target.value;
    setNewComment(value);

    // Check for @ mentions
    const lastAtIndex = value.lastIndexOf('@');
    if (lastAtIndex !== -1 && lastAtIndex === value.length - 1) {
      setShowMentionList(true);
    } else if (lastAtIndex !== -1) {
      const searchText = value.slice(lastAtIndex + 1).toLowerCase();
      if (searchText && !searchText.includes(' ')) {
        setShowMentionList(true);
      } else {
        setShowMentionList(false);
      }
    } else {
      setShowMentionList(false);
    }
  };

  const handleSaveDetails = () => {
    updateTask(task.id, { detailedDescription: editData.detailedDescription });
    onUpdate();
    setIsEditing(false);
  };

  const handleStatusChange = (newStatus) => {
    updateTask(task.id, { status: newStatus });
    onUpdate();
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
      case 'completed': return <FiCheckCircle />;
      case 'in-progress': return <FiClock />;
      default: return <FiAlertCircle />;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const isImageFile = (type) => type?.startsWith('image/');

  const priorityStyle = getPriorityStyle(task.priority);

  const getMentionSearchResults = () => {
    const lastAtIndex = newComment.lastIndexOf('@');
    if (lastAtIndex === -1) return projectTeam;
    const searchText = newComment.slice(lastAtIndex + 1).toLowerCase();
    return projectTeam.filter(m =>
      m.name.toLowerCase().includes(searchText)
    );
  };

  return (
    <div className="task-detail-overlay" onClick={onClose}>
      <div className="task-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="task-detail-header">
          <div className="task-detail-title">
            <span className={`status-indicator ${task.status}`}>
              {getStatusIcon(task.status)}
            </span>
            <h2>{task.title}</h2>
          </div>
          <button className="close-btn" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <div className="task-detail-meta">
          {project && (
            <div className="meta-tag project" style={{ borderColor: project.color }}>
              <FiFolder style={{ color: project.color }} />
              <span>{project.name}</span>
            </div>
          )}
          <div className="meta-tag priority" style={{ background: priorityStyle.bg, color: priorityStyle.color }}>
            {task.priority} priority
          </div>
          {task.dueDate && (
            <div className="meta-tag due">
              <FiCalendar />
              <span>{format(parseISO(task.dueDate), 'MMM dd, yyyy')}</span>
            </div>
          )}
        </div>

        <div className="task-detail-tabs">
          <button
            className={activeTab === 'details' ? 'active' : ''}
            onClick={() => setActiveTab('details')}
          >
            Details
          </button>
          <button
            className={activeTab === 'discussion' ? 'active' : ''}
            onClick={() => setActiveTab('discussion')}
          >
            <FiMessageCircle />
            Discussion ({comments.length})
          </button>
          <button
            className={activeTab === 'attachments' ? 'active' : ''}
            onClick={() => setActiveTab('attachments')}
          >
            <FiPaperclip />
            Attachments ({attachments.length})
          </button>
        </div>

        <div className="task-detail-content">
          {activeTab === 'details' && (
            <div className="details-tab">
              <div className="detail-section">
                <div className="section-header">
                  <h3>Assignee</h3>
                </div>
                {assignee ? (
                  <div className="assignee-info">
                    <div className="assignee-avatar">{assignee.avatar}</div>
                    <div>
                      <span className="assignee-name">{assignee.name}</span>
                      <span className="assignee-role">{assignee.role}</span>
                    </div>
                  </div>
                ) : (
                  <p className="no-assignee">Unassigned</p>
                )}
              </div>

              <div className="detail-section">
                <div className="section-header">
                  <h3>Status</h3>
                </div>
                <div className="status-selector">
                  {['todo', 'in-progress', 'completed'].map(status => (
                    <button
                      key={status}
                      className={`status-option ${task.status === status ? 'active' : ''} ${status}`}
                      onClick={() => handleStatusChange(status)}
                    >
                      {getStatusIcon(status)}
                      <span>{status === 'todo' ? 'To Do' : status === 'in-progress' ? 'In Progress' : 'Completed'}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="detail-section">
                <div className="section-header">
                  <h3>Description</h3>
                </div>
                <p className="task-description">{task.description || 'No description provided.'}</p>
              </div>

              <div className="detail-section">
                <div className="section-header">
                  <h3>Detailed Information</h3>
                  {!isEditing && (
                    <button className="edit-btn" onClick={() => setIsEditing(true)}>
                      <FiEdit2 /> Edit
                    </button>
                  )}
                </div>
                {isEditing ? (
                  <div className="edit-detailed">
                    <textarea
                      value={editData.detailedDescription}
                      onChange={(e) => setEditData({ ...editData, detailedDescription: e.target.value })}
                      placeholder="Add detailed notes, requirements, links, or any additional information..."
                      rows={8}
                    />
                    <div className="edit-actions">
                      <button className="btn-secondary" onClick={() => setIsEditing(false)}>Cancel</button>
                      <button className="btn-primary" onClick={handleSaveDetails}>Save</button>
                    </div>
                  </div>
                ) : (
                  <div className="detailed-description">
                    {task.detailedDescription ? (
                      <p style={{ whiteSpace: 'pre-wrap' }}>{task.detailedDescription}</p>
                    ) : (
                      <p className="placeholder">Click Edit to add detailed information, notes, or requirements.</p>
                    )}
                  </div>
                )}
              </div>

              <div className="detail-section">
                <div className="section-header">
                  <h3>Project Team</h3>
                </div>
                <div className="team-list">
                  {projectTeam.map(member => (
                    <div key={member.id} className="team-member-mini">
                      <div className="member-avatar">{member.avatar}</div>
                      <div className="member-info">
                        <span className="member-name">{member.name}</span>
                        <span className="member-role">{member.role}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'discussion' && (
            <div className="discussion-tab">
              <div className="discussion-header">
                <h3>Ask for Help or Discuss</h3>
                <p>Mention team members with @ to notify them</p>
              </div>

              <div className="comments-list">
                {comments.length > 0 ? (
                  comments.map(comment => {
                    const author = getTeamMemberById(comment.authorId);
                    return (
                      <div key={comment.id} className="comment-item">
                        <div className="comment-avatar">{author?.avatar || '?'}</div>
                        <div className="comment-content">
                          <div className="comment-header">
                            <span className="comment-author">{author?.name || 'Unknown'}</span>
                            <span className="comment-time">
                              {formatDistanceToNow(parseISO(comment.createdAt), { addSuffix: true })}
                            </span>
                            {comment.authorId === currentUser.id && (
                              <button
                                className="delete-comment-btn"
                                onClick={() => handleDeleteComment(comment.id)}
                              >
                                <FiTrash2 />
                              </button>
                            )}
                          </div>
                          <p className="comment-text">{comment.text}</p>
                          {comment.mentions?.length > 0 && (
                            <div className="comment-mentions">
                              <FiAtSign />
                              {comment.mentions.map(id => {
                                const mentioned = getTeamMemberById(id);
                                return mentioned ? (
                                  <span key={id} className="mention-tag">{mentioned.name}</span>
                                ) : null;
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="no-comments">
                    <FiMessageCircle />
                    <p>No comments yet. Start a discussion or ask for help!</p>
                  </div>
                )}
              </div>

              <form className="comment-form" onSubmit={handleAddComment}>
                <div className="comment-input-wrapper">
                  <div className="current-user-avatar">{currentUser.avatar}</div>
                  <div className="comment-input-container">
                    <textarea
                      ref={commentInputRef}
                      value={newComment}
                      onChange={handleCommentChange}
                      placeholder="Write a comment... Use @ to mention team members"
                      rows={2}
                    />
                    {showMentionList && getMentionSearchResults().length > 0 && (
                      <div className="mention-dropdown">
                        {getMentionSearchResults().map(member => (
                          <button
                            key={member.id}
                            type="button"
                            className="mention-option"
                            onClick={() => handleMentionClick(member)}
                          >
                            <span className="mention-avatar">{member.avatar}</span>
                            <span className="mention-name">{member.name}</span>
                            <span className="mention-role">{member.role}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button type="submit" className="send-btn" disabled={!newComment.trim()}>
                    <FiSend />
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'attachments' && (
            <div className="attachments-tab">
              <div className="attachments-header">
                <h3>Files & Images</h3>
                <button
                  className="btn-primary upload-btn"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FiPaperclip /> Upload File
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                />
              </div>

              {attachments.length > 0 ? (
                <div className="attachments-grid">
                  {attachments.map(attachment => {
                    const uploader = getTeamMemberById(attachment.uploadedBy);
                    return (
                      <div key={attachment.id} className="attachment-card">
                        {isImageFile(attachment.type) ? (
                          <div className="attachment-preview image">
                            <img src={attachment.data} alt={attachment.name} />
                          </div>
                        ) : (
                          <div className="attachment-preview file">
                            <FiFile />
                          </div>
                        )}
                        <div className="attachment-info">
                          <span className="attachment-name" title={attachment.name}>
                            {attachment.name}
                          </span>
                          <span className="attachment-meta">
                            {formatFileSize(attachment.size)} • {uploader?.name || 'Unknown'}
                          </span>
                        </div>
                        <div className="attachment-actions">
                          <a
                            href={attachment.data}
                            download={attachment.name}
                            className="download-btn"
                            title="Download"
                          >
                            <FiDownload />
                          </a>
                          {attachment.uploadedBy === currentUser.id && (
                            <button
                              className="delete-btn"
                              onClick={() => handleDeleteAttachment(attachment.id)}
                              title="Delete"
                            >
                              <FiTrash2 />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="no-attachments">
                  <FiImage />
                  <p>No attachments yet. Upload files or images to share with the team.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;
