
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import Skills from './pages/Skills';
import Matches from './pages/Matches';
import Messages from './pages/Messages';
import Tasks from './pages/Tasks';
import AdminDashboard from './pages/AdminDashboard';
import Chat from './pages/Chat';
import NotFound from './pages/NotFound';
import Landing from './pages/Landing';
import SkillUp from './pages/SkillUp';
import About from './pages/About';
import Blog from './pages/Blog';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Feed from './pages/Feed';
import Whiteboard from './pages/Whiteboard';
import FluidCursor from './components/FluidCursor';

// Helper to restrict access based on role
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const UserRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (user.role === 'admin') return <Navigate to="/admin" />;
  return <Layout>{children}</Layout>;
};

const AdminRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'admin') return <Navigate to="/" />;
  return <Layout>{children}</Layout>;
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <HashRouter>
          <FluidCursor />
          <Main />
        </HashRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

const Main: React.FC = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? (user.role === 'admin' ? <Navigate to="/admin" /> : <Navigate to="/" />) : <Login />} />
      <Route path="/signup" element={user ? (user.role === 'admin' ? <Navigate to="/admin" /> : <Navigate to="/" />) : <Signup />} />
      
      {/* Public / Landing logic for root path */}
      <Route path="/" element={user ? (user.role === 'admin' ? <Navigate to="/admin" /> : <Layout><Dashboard /></Layout>) : <Landing />} />
      
      {/* Explicit Public Landing Route (always visible) */}
      <Route path="/landing" element={<Landing />} />
      
      {/* User Routes (Protected from Admin) */}
      <Route path="/profile" element={<UserRoute><Profile /></UserRoute>} />
      <Route path="/messages" element={<UserRoute><Messages /></UserRoute>} />
      <Route path="/skills" element={<UserRoute><Skills /></UserRoute>} />
      <Route path="/matches" element={<UserRoute><Matches /></UserRoute>} />
      <Route path="/tasks" element={<UserRoute><Tasks /></UserRoute>} />
      <Route path="/chat/:matchId" element={<UserRoute><Chat /></UserRoute>} />
      <Route path="/skillup" element={<UserRoute><SkillUp /></UserRoute>} />
      <Route path="/feed" element={<UserRoute><Feed /></UserRoute>} />
      <Route path="/whiteboard" element={<UserRoute><Layout><div className="h-[85vh] -m-6"><iframe src="/#/whiteboard-view" title="whiteboard" className="w-full h-full border-none" /></div></Layout></UserRoute>} />
      
      {/* Whiteboard Full View Route */}
      <Route path="/whiteboard-view" element={user ? <Whiteboard /> : <Navigate to="/login" />} />

      {/* Admin Routes (Protected from User) */}
      <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      
      {/* Shared/Public Routes */}
      <Route path="/about" element={<About />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
