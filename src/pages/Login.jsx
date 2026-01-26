import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiFolder, FiMail, FiLock, FiAlertCircle } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { getTeam } from '../utils/localStorage';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showCredentials, setShowCredentials] = useState(false);

  const team = getTeam();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    const result = login(email, password);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
  };

  const handleQuickLogin = (memberEmail) => {
    setEmail(memberEmail);
    setPassword('password123');
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <div className="login-logo">
            <FiFolder className="logo-icon" />
            <span>ProjectHub</span>
          </div>
          <h1>Welcome Back</h1>
          <p>Sign in to access your projects and tasks</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="error-message">
              <FiAlertCircle />
              {error}
            </div>
          )}

          <div className="form-group">
            <label>Email</label>
            <div className="input-with-icon">
              <FiMail />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-with-icon">
              <FiLock />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
            </div>
          </div>

          <button type="submit" className="btn-login">
            Sign In
          </button>
        </form>

        <div className="demo-credentials">
          <button
            className="toggle-credentials"
            onClick={() => setShowCredentials(!showCredentials)}
          >
            {showCredentials ? 'Hide' : 'Show'} Demo Credentials
          </button>

          {showCredentials && (
            <div className="credentials-list">
              <p className="credentials-note">
                Click on a user to auto-fill. Password: <code>password123</code>
              </p>
              {team.map((member) => (
                <button
                  key={member.id}
                  className="credential-item"
                  onClick={() => handleQuickLogin(member.email)}
                >
                  <div className="credential-avatar">{member.avatar}</div>
                  <div className="credential-info">
                    <span className="credential-name">{member.name}</span>
                    <span className="credential-role">{member.role}</span>
                  </div>
                  <span className="credential-email">{member.email}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
