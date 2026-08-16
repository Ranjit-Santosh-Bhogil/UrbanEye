import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';
import AuthLayout from './components/AuthLayout';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import MyReports from './pages/MyReports';
import SubmitIssue from './pages/SubmitIssue';
import Profile from './pages/Profile';
import NearbyIssues from './pages/NearbyIssues';
import Login from './pages/Login';
import Register from './pages/Register';
import AddDetails from './pages/AddDetails';
import About from './pages/About';
import Helpline from './pages/Helpline';

// Moved outside App to prevent full unmount/remount on re-renders
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('token');
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const AdminProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('userRole');
  if (!token || role !== 'admin') {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/add-details" element={<AddDetails />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin" element={<AdminProtectedRoute><AdminLayout /></AdminProtectedRoute>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
      </Route>

      {/* Main App Routes */}
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        {/* Redirect root to dashboard */}
        <Route index element={<Navigate to="/dashboard" replace />} />

        <Route path="dashboard" element={<Dashboard />} />
        <Route path="my-reports" element={<MyReports />} />
        <Route path="submit-issue" element={<SubmitIssue />} />
        <Route path="nearby" element={<NearbyIssues />} />
        <Route path="profile" element={<Profile />} />
        <Route path="about" element={<About />} />
        <Route path="helpline" element={<Helpline />} />
      </Route>
    </Routes>
  );
}

export default App;
