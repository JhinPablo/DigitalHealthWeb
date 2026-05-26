// components/Layout.jsx — Layout premium con TopNav horizontal
import { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

const NAV_ITEMS = [
  { path: '/dashboard',    label: 'Dashboard',     roles: ['admin', 'medico', 'paciente'] },
  { path: '/patients',     label: 'Pacientes',     roles: ['admin', 'medico', 'paciente'] },
  { path: '/observations', label: 'Observaciones', roles: ['admin', 'medico'] },
  { path: '/alerts',       label: 'Alertas',       roles: ['admin', 'medico'] },
  { path: '/admin',        label: 'Admin',         roles: ['admin'] },
];

const IconBell = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
const IconSearch = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>;
const IconChevron = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>;
const IconUser = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IconLogout = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const IconSettings = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
const IconMenu = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;

function useClickOutside(onOutside) {
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onOutside?.(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onOutside]);
  return ref;
}

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const avatarRef = useClickOutside(() => setAvatarOpen(false));

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes(user?.role));
  const roleLabel = { admin: 'Administrador', medico: 'Médico', paciente: 'Paciente' };

  return (
    <div className="app-layout">
      <nav className={`topnav ${scrolled ? 'is-scrolled' : ''}`}>
        <div className="topnav-inner">
          <div className="brand" onClick={() => navigate('/dashboard')}>
            <div className="brand-mark">S</div>
            <div className="brand-wordmark">
              <span className="brand-name">Salud Digital</span>
              <span className="brand-sub">Historia Clínica FHIR</span>
            </div>
          </div>

          <div className="nav-links">
            {visibleItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          <div className="nav-right">
            <button className="nav-icon-btn" aria-label="Búsqueda"><IconSearch /></button>
            <button className="nav-icon-btn" aria-label="Alertas" onClick={() => navigate('/alerts')}><IconBell /></button>

            <div ref={avatarRef} style={{ position: 'relative' }}>
              <button className="avatar-trigger" onClick={() => setAvatarOpen(v => !v)}>
                <div className="avatar">{user?.full_name?.charAt(0)?.toUpperCase()}</div>
                <span className="avatar-name">{user?.full_name?.split(' ')[0]}</span>
                <IconChevron />
              </button>
              {avatarOpen && (
                <div className="dropdown">
                  <div className="dropdown-header">
                    <div className="dropdown-header-name">{user?.full_name}</div>
                    <div className="dropdown-header-meta">{user?.email} · {roleLabel[user?.role]}</div>
                  </div>
                  <button className="dropdown-item"><IconUser /> Mi perfil</button>
                  <button className="dropdown-item"><IconSettings /> Configuración</button>
                  <div className="dropdown-divider" />
                  <button className="dropdown-item danger" onClick={handleLogout}><IconLogout /> Cerrar sesión</button>
                </div>
              )}
            </div>

            <button className="nav-burger" onClick={() => setDrawerOpen(true)} aria-label="Menú"><IconMenu /></button>
          </div>
        </div>
      </nav>

      {drawerOpen && (
        <>
          <div className="drawer-backdrop" onClick={() => setDrawerOpen(false)} />
          <div className="drawer">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--s-6)' }}>
              <span className="serif" style={{ fontSize: 'var(--t-xl)' }}>Menú</span>
              <button className="modal-close" onClick={() => setDrawerOpen(false)}>×</button>
            </div>
            {visibleItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setDrawerOpen(false)}
                className={({ isActive }) => `drawer-link ${isActive ? 'active' : ''}`}
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </>
      )}

      <main className="app-main">
        <Outlet />
        <footer className="app-footer">
          Protegido bajo Ley 1581/2012 · Datos cifrados AES-256 · Sistema auditado
        </footer>
      </main>
    </div>
  );
}
