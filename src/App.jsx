import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Tasks from './pages/Tasks';
import Team from './pages/Team';
import Settings from './pages/Settings';
import MyWork from './pages/MyWork';

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin()) {
    return <Navigate to="/my-work" replace />;
  }

  return children;
};

// Public Route (redirects to app if logged in)
const PublicRoute = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  if (user) {
    // Redirect admins to dashboard, others to my-work
    return <Navigate to={isAdmin() ? "/" : "/my-work"} replace />;
  }

  return children;
};

function AppRoutes() {
  const { isAdmin } = useAuth();

  return (
    <Routes>
      {/* Public Route */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        {/* Dashboard - Admin only */}
        <Route
          index
          element={
            <ProtectedRoute adminOnly>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* My Work - All users */}
        <Route path="my-work" element={<MyWork />} />

        {/* Admin-only routes */}
        <Route
          path="projects"
          element={
            <ProtectedRoute adminOnly>
              <Projects />
            </ProtectedRoute>
          }
        />
        <Route
          path="projects/:id"
          element={
            <ProtectedRoute adminOnly>
              <Projects />
            </ProtectedRoute>
          }
        />
        <Route
          path="tasks"
          element={
            <ProtectedRoute adminOnly>
              <Tasks />
            </ProtectedRoute>
          }
        />
        <Route
          path="team"
          element={
            <ProtectedRoute adminOnly>
              <Team />
            </ProtectedRoute>
          }
        />
        <Route
          path="settings"
          element={
            <ProtectedRoute adminOnly>
              <Settings />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Catch all - redirect to login or appropriate page */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
