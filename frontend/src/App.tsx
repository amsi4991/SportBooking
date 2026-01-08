
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Courts from './pages/Courts';
import CourtDetail from './pages/CourtDetail';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import ProtectedRoute from './guards/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/courts"
          element={
            <ProtectedRoute>
              <Courts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/court/:id"
          element={
            <ProtectedRoute>
              <CourtDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}
