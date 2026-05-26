// pages/Login.jsx — Pantalla de login premium con quote panel
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accessKey, setAccessKey] = useState('master-access-key');
  const [permissionKey, setPermissionKey] = useState('admin-permission');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const ROLE_PERMISSION_MAP = {
    admin: 'admin-permission',
    medico: 'medico-permission',
    paciente: 'paciente-permission',
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    localStorage.setItem('accessKey', accessKey);
    localStorage.setItem('permissionKey', permissionKey);

    try {
      const userData = await login(email, password);
      const correctPermKey = ROLE_PERMISSION_MAP[userData.role] || 'paciente-permission';
      localStorage.setItem('permissionKey', correctPermKey);

      // Si no ha aceptado habeas data, va a la página completa de Terms
      if (!userData.habeas_data_accepted) {
        navigate('/terms', { state: { fromLogin: true } });
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (err.response?.status === 423) {
        setError(detail || 'Cuenta bloqueada temporalmente');
      } else if (err.response?.status === 401) {
        setError(detail || 'Usuario o contraseña incorrecta');
      } else {
        setError(detail || 'Error de conexión con el servidor');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Panel izquierdo — quote premium */}
      <aside className="login-bg-effects">
        <div className="login-aside-top">
          <div className="login-aside-brand">
            <div className="login-aside-mark">S</div>
            <div>
              <div className="login-aside-name">Salud Digital</div>
              <div className="login-aside-sub">Historia Clínica FHIR</div>
            </div>
          </div>
        </div>

        <div className="login-aside-quote">
          <p className="login-aside-quote-text">
            Una experiencia <em className="login-aside-em">clínica</em> diseñada con la misma precisión con la que cuidas a tus pacientes.
          </p>
          <span className="login-aside-quote-meta">— Plataforma certificada HL7 FHIR R4</span>
        </div>

        <div className="login-aside-bottom">
          <div className="login-aside-feature">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            AES-256 · Habeas Data (Ley 1581/2012)
          </div>
          <div className="login-aside-feature">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><polyline points="20 6 9 17 4 12"/></svg>
            Auditoría inmutable de cada acceso
          </div>
          <div className="login-aside-feature">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 3l1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3z"/></svg>
            Inferencia ML/DL con explicabilidad SHAP & Grad-CAM
          </div>
        </div>
      </aside>

      {/* Panel derecho — formulario */}
      <div className="login-container">
        <div className="login-form-wrap">
          <div className="login-header">
            <h1 className="login-title">Bienvenido de vuelta</h1>
            <p className="login-subtitle">Ingresa con tu cuenta institucional para continuar.</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            {error && (
              <div className="login-error">
                <span>Error:</span> {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Correo electrónico</label>
              <input
                type="email"
                className="input"
                placeholder="usuario@clinica.com"
                value={email}
                onChange={(e) => setEmail(e.target.value.replace(/\s/g, ''))}
                onKeyDown={(e) => { if (e.key === ' ') e.preventDefault(); }}
                onPaste={(e) => {
                  e.preventDefault();
                  const text = e.clipboardData.getData('text').replace(/\s/g, '');
                  setEmail(text);
                }}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contraseña</label>
              <input
                type="password"
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* API Keys ocultas — la lógica se conserva */}
            <div style={{ display: 'none' }}>
              <input type="text" value={accessKey} onChange={(e) => setAccessKey(e.target.value)} />
              <select value={permissionKey} onChange={(e) => setPermissionKey(e.target.value)}>
                <option value="admin-permission">Admin</option>
                <option value="medico-permission">Medico</option>
                <option value="paciente-permission">Paciente</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary btn-lg login-btn" disabled={loading}>
              {loading ? <span className="spinner" /> : 'Iniciar sesión'}
            </button>
          </form>

          <p className="login-footer-text">
            Conexión segura · Datos cifrados de extremo a extremo
          </p>
        </div>
      </div>
    </div>
  );
}
