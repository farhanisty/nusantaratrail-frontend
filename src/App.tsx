import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import Layout from './components/layout/Layout';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import LocationsPage from './pages/locations/LocationsPage';
import LocationDetailPage from './pages/locations/LocationDetailPage';
import UsersPage from './pages/users/UsersPage';
import ReportsPage from './pages/reports/ReportsPage';

// Protected Route
function Protected({ children, superAdminOnly = false }: { children: React.ReactNode; superAdminOnly?: boolean }) {
  const { isAuthenticated, isSuperAdmin } = useAuthStore();

  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  if (superAdminOnly && !isSuperAdmin()) return <Navigate to="/dashboard" replace />;

  return <Layout>{children}</Layout>;
}

export default function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated() ? <Navigate to="/dashboard" replace /> : <LoginPage />}
        />

        <Route path="/dashboard" element={<Protected><DashboardPage /></Protected>} />
        <Route path="/locations" element={<Protected><LocationsPage /></Protected>} />
        <Route path="/locations/:id" element={<Protected><LocationDetailPage /></Protected>} />
        <Route path="/reports" element={<Protected><ReportsPage /></Protected>} />
        <Route path="/users" element={<Protected superAdminOnly><UsersPage /></Protected>} />

        {/* Redirect root */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
