// ───────────────────────────────────────────────────────────
// TopNav — barra superior premium + subnav contextual
// ───────────────────────────────────────────────────────────

function TopNav({ user, currentPath, onNavigate, onLogout, notifications = [], onOpenAlertDetail }) {
  const scrolled = useScrolled(4);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const avatarRef = useClickOutside(() => setAvatarOpen(false));
  const notifRef = useClickOutside(() => setNotifOpen(false));

  const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes(user?.role));
  const unreadCount = notifications.filter(n => !n.read).length;

  const roleLabel = { admin: 'Administrador', medico: 'Médico', paciente: 'Paciente' };

  return (
    <>
      <nav className={`topnav ${scrolled ? 'is-scrolled' : ''}`}>
        <div className="topnav-inner">
          <div className="brand" onClick={() => onNavigate('/dashboard')}>
            <div className="brand-mark">S</div>
            <div className="brand-wordmark">
              <span className="brand-name">Salud Digital</span>
              <span className="brand-sub">Historia Clínica FHIR</span>
            </div>
          </div>

          <div className="nav-links">
            {visibleItems.map((item) => {
              const active = currentPath.startsWith(item.path);
              return (
                <button
                  key={item.path}
                  className={`nav-link ${active ? 'active' : ''}`}
                  onClick={() => onNavigate(item.path)}
                >
                  {item.label}
                  {item.path === '/alerts' && unreadCount > 0 && <span className="nav-link-dot" />}
                </button>
              );
            })}
          </div>

          <div className="nav-right">
            <button className="nav-icon-btn" aria-label="Búsqueda">
              <Icon name="search" size={18} />
            </button>

            <div ref={notifRef} style={{ position: 'relative' }}>
              <button className="nav-icon-btn" aria-label="Alertas" onClick={() => setNotifOpen(v => !v)}>
                <Icon name="bell" size={18} />
                {unreadCount > 0 && <span className="notif-pip" />}
              </button>
              {notifOpen && (
                <div className="notif-panel">
                  <div className="notif-panel-header">
                    <span className="notif-panel-title">Alertas clínicas</span>
                    <Badge variant={unreadCount > 0 ? 'danger' : 'neutral'} dot={false}>
                      {unreadCount} nuevas
                    </Badge>
                  </div>
                  <div className="notif-list">
                    {notifications.length === 0 ? (
                      <div className="empty" style={{ padding: 'var(--s-6)' }}>
                        <div className="empty-icon"><Icon name="check" /></div>
                        <div className="empty-title" style={{ fontSize: 'var(--t-md)' }}>Todo en orden</div>
                        <p style={{ fontSize: 'var(--t-xs)' }}>No hay alertas pendientes</p>
                      </div>
                    ) : (
                      notifications.slice(0, 5).map((n) => (
                        <div key={n.id} className="notif-item" onClick={() => { setNotifOpen(false); onOpenAlertDetail?.(n); }}>
                          <div className={`notif-dot ${n.read ? 'read' : 'unread'}`} />
                          <div className="notif-content">
                            <div className="notif-title">{n.title}</div>
                            <div className="notif-meta">{n.meta} · {n.time}</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div ref={avatarRef} style={{ position: 'relative' }}>
              <button className="avatar-trigger" onClick={() => setAvatarOpen(v => !v)}>
                <div className="avatar">{user?.full_name?.charAt(0).toUpperCase()}</div>
                <span className="avatar-name">{user?.full_name?.split(' ')[0]}</span>
                <Icon name="chevronDown" size={14} style={{ color: 'var(--ink-3)' }} />
              </button>
              {avatarOpen && (
                <div className="dropdown">
                  <div className="dropdown-header">
                    <div className="dropdown-header-name">{user?.full_name}</div>
                    <div className="dropdown-header-meta">{user?.email} · {roleLabel[user?.role]}</div>
                  </div>
                  <button className="dropdown-item" onClick={() => { setAvatarOpen(false); onNavigate('/profile'); }}>
                    <Icon name="user" size={16} /> Mi perfil
                  </button>
                  <button className="dropdown-item" onClick={() => { setAvatarOpen(false); onNavigate('/settings'); }}>
                    <Icon name="settings" size={16} /> Configuración
                  </button>
                  <div className="dropdown-divider" />
                  <button className="dropdown-item danger" onClick={() => { setAvatarOpen(false); onLogout(); }}>
                    <Icon name="logout" size={16} /> Cerrar sesión
                  </button>
                </div>
              )}
            </div>

            <button className="nav-burger" onClick={() => setDrawerOpen(true)} aria-label="Menú">
              <Icon name="menu" />
            </button>
          </div>
        </div>
      </nav>

      {drawerOpen && (
        <>
          <div className="drawer-backdrop" onClick={() => setDrawerOpen(false)} />
          <div className="drawer">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--s-6)' }}>
              <span className="serif" style={{ fontSize: 'var(--t-xl)' }}>Menú</span>
              <button className="modal-close" onClick={() => setDrawerOpen(false)}><Icon name="x" size={16} /></button>
            </div>
            {visibleItems.map((item) => {
              const active = currentPath.startsWith(item.path);
              return (
                <button
                  key={item.path}
                  className={`drawer-link ${active ? 'active' : ''}`}
                  onClick={() => { setDrawerOpen(false); onNavigate(item.path); }}
                >
                  <Icon name={item.icon} size={18} />
                  {item.label}
                </button>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}

// ── SubNav contextual ────────────────────────────────────
function SubNav({ backLabel, onBack, items, value, onChange }) {
  return (
    <div className="subnav">
      <div className="subnav-inner">
        {onBack && (
          <>
            <button className="subnav-back" onClick={onBack}>
              <Icon name="arrowLeft" size={14} />
              {backLabel}
            </button>
            <div className="subnav-divider" />
          </>
        )}
        {items.map((it) => (
          <button
            key={it.value}
            className={`subnav-link ${value === it.value ? 'active' : ''}`}
            onClick={() => onChange(it.value)}
          >
            {it.icon && <Icon name={it.icon} size={14} />}
            {it.label}
            {it.count != null && <span className="count">{it.count}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

const NAV_ITEMS = [
  { path: '/dashboard',    label: 'Dashboard',     icon: 'dashboard', roles: ['admin', 'medico', 'paciente'] },
  { path: '/patients',     label: 'Pacientes',     icon: 'users',     roles: ['admin', 'medico', 'paciente'] },
  { path: '/observations', label: 'Observaciones', icon: 'activity',  roles: ['admin', 'medico'] },
  { path: '/alerts',       label: 'Alertas',       icon: 'alert',     roles: ['admin', 'medico'] },
  { path: '/admin',        label: 'Admin',         icon: 'settings',  roles: ['admin'] },
];

Object.assign(window, { TopNav, SubNav, NAV_ITEMS });
