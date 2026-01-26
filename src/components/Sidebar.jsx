import { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  FiGrid,
  FiFolder,
  FiCheckSquare,
  FiUsers,
  FiSettings,
  FiMenu,
  FiX,
  FiLogOut,
  FiBriefcase,
  FiUser,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Navigation items based on user role
  const getNavItems = () => {
    const items = [
      { path: '/my-work', icon: FiBriefcase, label: 'My Work' },
    ];

    // Admin (Project Manager) sees all navigation
    if (isAdmin()) {
      items.unshift({ path: '/', icon: FiGrid, label: 'Dashboard' });
      items.push(
        { path: '/projects', icon: FiFolder, label: 'Projects' },
        { path: '/tasks', icon: FiCheckSquare, label: 'Tasks' },
        { path: '/team', icon: FiUsers, label: 'Team' },
        { path: '/settings', icon: FiSettings, label: 'Settings' }
      );
    }

    return items;
  };

  // Mobile bottom nav items (limited to 5 for better UX)
  const getMobileNavItems = () => {
    if (isAdmin()) {
      return [
        { path: '/', icon: FiGrid, label: 'Home' },
        { path: '/projects', icon: FiFolder, label: 'Projects' },
        { path: '/tasks', icon: FiCheckSquare, label: 'Tasks' },
        { path: '/team', icon: FiUsers, label: 'Team' },
        { path: '/my-work', icon: FiUser, label: 'Profile' },
      ];
    }
    return [
      { path: '/my-work', icon: FiBriefcase, label: 'My Work' },
    ];
  };

  const navItems = getNavItems();
  const mobileNavItems = getMobileNavItems();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="sidebar desktop-sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <FiFolder className="logo-icon" />
            <span>ProjectHub</span>
          </div>
        </div>

        {/* User Info */}
        {user && (
          <div className="sidebar-user">
            <div className="user-avatar">{user.avatar}</div>
            <div className="user-info">
              <span className="user-name">{user.name}</span>
              <span className="user-role">{user.role}</span>
            </div>
          </div>
        )}

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'active' : ''}`
              }
            >
              <item.icon className="nav-icon" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <FiLogOut />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="mobile-header">
        <div className="mobile-header-content">
          <div className="mobile-logo">
            <FiFolder className="logo-icon" />
            <span>ProjectHub</span>
          </div>
          {user && (
            <div className="mobile-user" onClick={() => navigate('/my-work')}>
              <span className="mobile-user-avatar">{user.avatar}</span>
            </div>
          )}
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="mobile-bottom-nav">
        {mobileNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `mobile-nav-item ${isActive ? 'active' : ''}`
            }
          >
            <item.icon className="mobile-nav-icon" />
            <span className="mobile-nav-label">{item.label}</span>
          </NavLink>
        ))}
        {isAdmin() && (
          <button className="mobile-nav-item more-btn" onClick={() => setIsOpen(true)}>
            <FiMenu className="mobile-nav-icon" />
            <span className="mobile-nav-label">More</span>
          </button>
        )}
      </nav>

      {/* Mobile More Menu (Slide-up) */}
      <div
        className={`mobile-overlay ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(false)}
      />
      <div className={`mobile-more-menu ${isOpen ? 'open' : ''}`}>
        <div className="more-menu-header">
          <h3>More Options</h3>
          <button className="close-more-btn" onClick={() => setIsOpen(false)}>
            <FiX />
          </button>
        </div>
        <div className="more-menu-content">
          <NavLink to="/settings" className="more-menu-item" onClick={() => setIsOpen(false)}>
            <FiSettings />
            <span>Settings</span>
          </NavLink>
          <button className="more-menu-item logout" onClick={handleLogout}>
            <FiLogOut />
            <span>Logout</span>
          </button>
        </div>
        {user && (
          <div className="more-menu-user">
            <div className="user-avatar">{user.avatar}</div>
            <div className="user-info">
              <span className="user-name">{user.name}</span>
              <span className="user-role">{user.role}</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Sidebar;
