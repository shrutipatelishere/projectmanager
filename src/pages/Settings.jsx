import { useState } from 'react';
import {
  FiDownload,
  FiUpload,
  FiTrash2,
  FiCheck,
  FiAlertCircle,
} from 'react-icons/fi';
import './Settings.css';

const Settings = () => {
  const [importStatus, setImportStatus] = useState(null);

  const handleExport = () => {
    const data = {
      projects: JSON.parse(localStorage.getItem('pm_projects') || '[]'),
      tasks: JSON.parse(localStorage.getItem('pm_tasks') || '[]'),
      team: JSON.parse(localStorage.getItem('pm_team') || '[]'),
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `projecthub_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data.projects) localStorage.setItem('pm_projects', JSON.stringify(data.projects));
        if (data.tasks) localStorage.setItem('pm_tasks', JSON.stringify(data.tasks));
        if (data.team) localStorage.setItem('pm_team', JSON.stringify(data.team));
        setImportStatus({ success: true, message: 'Data imported successfully! Refresh the page to see changes.' });
      } catch (error) {
        setImportStatus({ success: false, message: 'Failed to import data. Invalid file format.' });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      localStorage.removeItem('pm_projects');
      localStorage.removeItem('pm_tasks');
      localStorage.removeItem('pm_team');
      setImportStatus({ success: true, message: 'All data has been cleared. Refresh the page to start fresh.' });
    }
  };

  return (
    <div className="settings-page">
      <div className="page-header">
        <h1>Settings</h1>
        <p>Manage your application settings</p>
      </div>

      <div className="settings-grid">
        <div className="settings-card">
          <h3>Data Management</h3>
          <p>Export, import, or clear your project data</p>

          <div className="settings-actions">
            <button className="action-btn export" onClick={handleExport}>
              <FiDownload />
              <span>Export Data</span>
            </button>

            <label className="action-btn import">
              <FiUpload />
              <span>Import Data</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                hidden
              />
            </label>

            <button className="action-btn danger" onClick={handleClearData}>
              <FiTrash2 />
              <span>Clear All Data</span>
            </button>
          </div>

          {importStatus && (
            <div className={`status-message ${importStatus.success ? 'success' : 'error'}`}>
              {importStatus.success ? <FiCheck /> : <FiAlertCircle />}
              {importStatus.message}
            </div>
          )}
        </div>

        <div className="settings-card">
          <h3>About ProjectHub</h3>
          <p>Project management made simple</p>

          <div className="about-info">
            <div className="info-row">
              <span className="info-label">Version</span>
              <span className="info-value">1.0.0</span>
            </div>
            <div className="info-row">
              <span className="info-label">Built with</span>
              <span className="info-value">React + Vite</span>
            </div>
            <div className="info-row">
              <span className="info-label">Storage</span>
              <span className="info-value">Local Storage</span>
            </div>
          </div>

          <div className="features-list">
            <h4>Features</h4>
            <ul>
              <li>Project management with team collaboration</li>
              <li>Task tracking with Kanban board view</li>
              <li>Team member management</li>
              <li>Progress tracking and statistics</li>
              <li>Data export and import</li>
              <li>Fully responsive design</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
