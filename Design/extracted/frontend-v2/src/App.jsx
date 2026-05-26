// App.jsx — Raíz de la aplicación con rutas públicas + protegidas
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Terms from './pages/Terms';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Observations from './pages/Observations';
import Alerts from './pages/Alerts';
import Admin from './pages/Admin';

function ProtectedRoute({ children, allowedRoles, requireHabeas = true }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div className="spinner spinner-lg" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  // Habeas Data obligatorio antes de acceder a cualquier ruta protegida
  if (requireHabeas && !user.habeas_data_accepted) {
    return <Navigate to="/terms" state={{ fromLogin: true }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Públicas */}
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Landing />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />

      {/* Protegidas (requieren auth + habeas data aceptado) */}
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="patients" element={<Patients />} />
        <Route path="observations" element={
          <ProtectedRoute allowedRoles={['admin', 'medico']}>
            <Observations />
          </ProtectedRoute>
        } />
        <Route path="alerts" element={
          <ProtectedRoute allowedRoles={['admin', 'medico']}>
            <Alerts />
          </ProtectedRoute>
        } />
        <Route path="admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Admin />
          </ProtectedRoute>
        } />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
