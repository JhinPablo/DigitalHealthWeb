// ───────────────────────────────────────────────────────────
// APP ROOT — Landing → Login → (Terms) → App
// ───────────────────────────────────────────────────────────

function TweaksPanel({ open, onClose, theme, onTheme, density, onDensity, animations, onAnimations }) {
  if (!open) return null;
  return (
    <div className="tweaks-panel">
      <div className="tweaks-head">
        <h4>Tweaks</h4>
        <button className="modal-close" onClick={onClose}><Icon name="x" size={14} /></button>
      </div>
      <div className="tweaks-body">
        <div className="tweak-row">
          <span className="tweak-label">Tema</span>
          <div className="tweak-segment">
            <button className={theme === 'light' ? 'active' : ''} onClick={() => onTheme('light')}>Claro</button>
            <button className={theme === 'dark' ? 'active' : ''} onClick={() => onTheme('dark')}>Oscuro</button>
          </div>
        </div>
        <div className="tweak-row">
          <span className="tweak-label">Densidad</span>
          <div className="tweak-segment">
            <button className={density === 'comfortable' ? 'active' : ''} onClick={() => onDensity('comfortable')}>Confortable</button>
            <button className={density === 'compact' ? 'active' : ''} onClick={() => onDensity('compact')}>Compacta</button>
          </div>
        </div>
        <div className="tweak-row">
          <span className="tweak-label">Animaciones</span>
          <div className="tweak-segment">
            <button className={animations ? 'active' : ''} onClick={() => onAnimations(true)}>Activas</button>
            <button className={!animations ? 'active' : ''} onClick={() => onAnimations(false)}>Reducidas</button>
          </div>
        </div>
        <p style={{ fontSize: 11, color: 'var(--ink-3)', lineHeight: 1.5 }}>
          Las preferencias se guardan en este navegador.
        </p>
      </div>
    </div>
  );
}

function App() {
  // App-level routing: 'landing' | 'login' | 'terms' | 'app'
  const [stage, setStage] = useState('landing');
  const [path, setPath] = useState('/dashboard');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [tweaksOpen, setTweaksOpen] = useState(false);
  const [habeasAccepted, setHabeasAccepted] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('sd_theme') || 'light');
  const [density, setDensity] = useState(() => localStorage.getItem('sd_density') || 'comfortable');
  const [animations, setAnimations] = useState(() => localStorage.getItem('sd_anim') !== 'false');

  useEffect(() => { document.documentElement.dataset.theme = theme; localStorage.setItem('sd_theme', theme); }, [theme]);
  useEffect(() => { document.documentElement.dataset.density = density; localStorage.setItem('sd_density', density); }, [density]);
  useEffect(() => { document.documentElement.dataset.anim = animations; localStorage.setItem('sd_anim', animations); }, [animations]);
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'auto' }); }, [stage]);

  const navigate = (p) => { setPath(p); setSelectedPatient(null); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const openPatient = (id) => { setSelectedPatient(id); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const closePatient = () => setSelectedPatient(null);

  // ── Landing ──
  if (stage === 'landing') {
    return (
      <Landing
        onLogin={() => setStage('login')}
        onTerms={() => setStage('terms-public')}
      />
    );
  }

  // ── Terms (público — desde landing) ──
  if (stage === 'terms-public') {
    return (
      <Terms
        onBack={() => setStage('landing')}
        onAccept={() => setStage('landing')}
        fromLogin={false}
      />
    );
  }

  // ── Login ──
  if (stage === 'login') {
    return <Login onLogin={() => {
      if (habeasAccepted) setStage('app');
      else setStage('terms-required');
    }} />;
  }

  // ── Terms (obligatorio post-login) ──
  if (stage === 'terms-required') {
    return (
      <Terms
        onBack={() => setStage('login')}
        onAccept={() => { setHabeasAccepted(true); setStage('app'); }}
        fromLogin={true}
      />
    );
  }

  // ── App ──
  let pageEl = null;
  if (selectedPatient) {
    pageEl = <PatientDetail patientId={selectedPatient} onBack={closePatient} user={MOCK_USER} />;
  } else if (path === '/dashboard') {
    pageEl = <Dashboard user={MOCK_USER} onNavigate={navigate} onOpenPatient={openPatient} />;
  } else if (path === '/patients') {
    pageEl = <Patients user={MOCK_USER} onOpenPatient={openPatient} />;
  } else if (path === '/observations') {
    pageEl = <Observations user={MOCK_USER} />;
  } else if (path === '/alerts') {
    pageEl = <Alerts />;
  } else if (path === '/admin') {
    pageEl = <Admin />;
  } else {
    pageEl = <Dashboard user={MOCK_USER} onNavigate={navigate} onOpenPatient={openPatient} />;
  }

  return (
    <>
      <TopNav
        user={MOCK_USER}
        currentPath={path}
        onNavigate={navigate}
        onLogout={() => { setHabeasAccepted(false); setStage('landing'); }}
        notifications={MOCK_NOTIFICATIONS}
        onOpenAlertDetail={(n) => { if (n.patient_id) openPatient(n.patient_id); }}
      />
      <div key={selectedPatient || path}>
        {pageEl}
      </div>

      <button
        onClick={() => setTweaksOpen(v => !v)}
        style={{
          position: 'fixed', bottom: 20, right: 20, zIndex: 499,
          width: 44, height: 44, borderRadius: 22,
          background: 'var(--ink)', color: 'var(--paper)',
          display: tweaksOpen ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: 'var(--shadow-lg)',
        }}
        title="Abrir Tweaks"
      >
        <Icon name="settings" size={18} />
      </button>

      <TweaksPanel
        open={tweaksOpen}
        onClose={() => setTweaksOpen(false)}
        theme={theme} onTheme={setTheme}
        density={density} onDensity={setDensity}
        animations={animations} onAnimations={setAnimations}
      />
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
