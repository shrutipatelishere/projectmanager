import { createContext, useContext, useState, useEffect } from 'react';
import { getTeam } from '../utils/localStorage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('pm_current_user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      // Verify user still exists in team
      const team = getTeam();
      const existingUser = team.find(m => m.id === userData.id);
      if (existingUser) {
        setUser(existingUser);
      } else {
        localStorage.removeItem('pm_current_user');
      }
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    const team = getTeam();
    // Find user by email (password is the email for simplicity)
    const member = team.find(m => m.email.toLowerCase() === email.toLowerCase());

    if (member) {
      // For demo purposes, password is same as email or "password123"
      if (password === member.email || password === 'password123') {
        setUser(member);
        localStorage.setItem('pm_current_user', JSON.stringify(member));
        return { success: true };
      }
      return { success: false, error: 'Invalid password' };
    }
    return { success: false, error: 'User not found' };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('pm_current_user');
  };

  const isAdmin = () => {
    return user?.role === 'Project Manager';
  };

  const refreshUser = () => {
    if (user) {
      const team = getTeam();
      const updatedUser = team.find(m => m.id === user.id);
      if (updatedUser) {
        setUser(updatedUser);
        localStorage.setItem('pm_current_user', JSON.stringify(updatedUser));
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
