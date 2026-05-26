// ───────────────────────────────────────────────────────────
// PÁGINAS: Login, Dashboard, Patients, Observations, Alerts
// ───────────────────────────────────────────────────────────

// ── LOGIN ────────────────────────────────────────────────
function Login({ onLogin }) {
  const [email, setEmail] = useState('maria.rincon@clinica.com');
  const [password, setPassword] = useState('demo1234');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    setTimeout(() => {
      if (!email.includes('@') || password.length < 4) {
        setError('Credenciales inválidas. Verifica el correo y la contraseña.');
        setLoading(false);
        return;
      }
      onLogin();
    }, 700);
  };

  return (
    <div className="login-page">
      <aside className="login-aside">
        <div className="login-aside-top">
          <div className="login-brand">
            <div className="login-brand-mark">S</div>
            <div className="login-brand-text">
              <span className="login-brand-name">Salud Digital</span>
              <span className="login-brand-sub">Historia Clínica FHIR</span>
            </div>
          </div>
        </div>
        <div className="login-quote">
          <p className="login-quote-text">
            Una experiencia <span className="login-quote-em">clínica</span> diseñada con la misma precisión con la que cuidas a tus pacientes.
          </p>
          <span className="login-quote-meta">— Plataforma certificada HL7 FHIR R4</span>
        </div>
        <div className="login-aside-bottom">
          <div className="row"><Icon name="shield" size={14} /> AES-256 · Habeas Data (Ley 1581/2012)</div>
          <div className="row"><Icon name="check" size={14} /> Auditoría inmutable de cada acceso</div>
          <div className="row"><Icon name="sparkle" size={14} /> Inferencia ML/DL con explicabilidad SHAP & Grad-CAM</div>
        </div>
      </aside>

      <main className="login-main">
        <div className="login-card fade-up">
          <h1 className="login-title">Bienvenido de vuelta</h1>
          <p className="login-subtitle">Ingresa con tu cuenta institucional para continuar.</p>

          <form className="login-form" onSubmit={submit}>
            {error && (
              <div className="login-error">
                <Icon name="alert" size={16} style={{ marginTop: 1, flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <Field label="Correo electrónico" required>
              <input
                type="email" className="input" required
                placeholder="usuario@clinica.com"
                value={email}
                onChange={(e) => setEmail(e.target.value.replace(/\s/g, ''))}
                autoComplete="email"
              />
            </Field>

            <Field label="Contraseña" required>
              <input
                type="password" className="input" required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </Field>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: -4 }}>
              <button type="button" style={{ fontSize: 'var(--t-xs)', color: 'var(--ink-3)', padding: 4 }}>
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <Button type="submit" variant="primary" size="lg" loading={loading} style={{ marginTop: 4 }}>
              {loading ? 'Verificando...' : 'Iniciar sesión'}
            </Button>
          </form>

          <div className="login-footer-meta">
            <Icon name="shield" size={14} />
            <span>Conexión segura · Tus datos están cifrados de extremo a extremo</span>
          </div>
        </div>
      </main>
    </div>
  );
}

// ── DASHBOARD ────────────────────────────────────────────
function Dashboard({ user, onNavigate, onOpenPatient }) {
  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Buenos días';
    if (h < 19) return 'Buenas tardes';
    return 'Buenas noches';
  }, []);

  const today = new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const pending = MOCK_RISK_REPORTS.filter(r => !r.signed_at);
  const recent = MOCK_PATIENTS.slice(0, 5);

  const stats = [
    { label: 'Pacientes activos', value: 32, trend: '+3 esta semana', trendType: 'up', icon: 'users', variant: 'accent' },
    { label: 'Observaciones',    value: 1284, trend: '+128 esta semana', trendType: 'up', icon: 'pulse' },
    { label: 'Pendientes firma', value: pending.length, trend: 'Requiere atención', trendType: 'warn', icon: 'signature', variant: 'warn' },
    { label: 'Alertas críticas', value: 3, trend: '−2 vs ayer', trendType: 'down', icon: 'alert' },
  ];

  return (
    <div className="container page fade-up">
      <div className="greet-wrap">
        <div>
          <h1 className="greet-title">
            {greeting},<br />
            <span className="greet-name">{user.full_name.split(' ')[0]}</span>.
          </h1>
          <p className="greet-meta">Resumen del consultorio · Salud Digital — FHIR R4</p>
        </div>
        <div className="greet-date">
          <strong style={{ textTransform: 'capitalize' }}>{today}</strong>
          <span>Hora local · Bogotá, Colombia</span>
        </div>
      </div>

      <div className="stat-grid">
        {stats.map((s, i) => (
          <div key={s.label} className={`stat-card fade-up ${s.variant ? `is-${s.variant}` : ''}`} style={{ animationDelay: `${i * 60}ms` }}>
            <div className="stat-label">
              {s.label}
              <span className="stat-icon"><Icon name={s.icon} size={14} /></span>
            </div>
            <div className="stat-value"><CountUp to={s.value} /></div>
            <div className={`stat-trend ${s.trendType}`}>
              {s.trendType === 'up' && <Icon name="trending" size={12} />}
              {s.trend}
            </div>
          </div>
        ))}
      </div>

      <div className="dash-grid">
        <div className="card">
          <div className="section-head">
            <div>
              <h3 className="section-title">Reportes pendientes de firma</h3>
              <p className="section-subtitle">Resultados de inferencia ML/DL que requieren validación clínica</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('/alerts')}>Ver todos <Icon name="arrowRight" size={14} /></Button>
          </div>

          {pending.length === 0 ? (
            <div className="empty">
              <div className="empty-icon"><Icon name="check" /></div>
              <div className="empty-title">Todo firmado</div>
              <p>No hay reportes pendientes en este momento.</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Paciente</th>
                    <th>Modelo</th>
                    <th>Score</th>
                    <th>Categoría</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {pending.map((r) => (
                    <tr key={r.id} className="row-clickable" onClick={() => onOpenPatient(r.patient_id)}>
                      <td className="td-primary">{r.patient_name}</td>
                      <td><Badge variant={r.model_type === 'ML' ? 'info' : 'warning'}>{r.model_type}</Badge></td>
                      <td><span className="mono" style={{ color: 'var(--ink)' }}>{(r.risk_score * 100).toFixed(0)}%</span></td>
                      <td><Badge variant={r.risk_category === 'CRITICAL' ? 'danger' : 'warning'}>{r.risk_category}</Badge></td>
                      <td style={{ textAlign: 'right' }}>
                        <Button variant="secondary" size="sm" iconRight={<Icon name="arrowRight" size={12} />}>Firmar</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card">
          <div className="section-head">
            <div>
              <h3 className="section-title">Actividad reciente</h3>
              <p className="section-subtitle">Últimos eventos del consultorio</p>
            </div>
          </div>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-dot danger" />
              <div className="activity-content">
                <div className="activity-text">Glucosa fuera de rango — Camila Restrepo</div>
                <div className="activity-meta">245 mg/dL · Hace 5 min</div>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-dot warn" />
              <div className="activity-content">
                <div className="activity-text">Reporte ML pendiente · Sebastián Mora</div>
                <div className="activity-meta">Riesgo CRITICAL · Hace 2 h</div>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-dot" />
              <div className="activity-content">
                <div className="activity-text">Nuevo paciente asignado — Lina Patiño</div>
                <div className="activity-meta">Dr. Felipe Ochoa · Hace 1 día</div>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-dot" />
              <div className="activity-content">
                <div className="activity-text">Análisis DL completado · Camila Restrepo</div>
                <div className="activity-meta">Retinopatía moderada · Hace 1 día</div>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-dot" />
              <div className="activity-content">
                <div className="activity-text">Reporte firmado por Dr. Cardona</div>
                <div className="activity-meta">Jorge Hernández · Hace 2 días</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 'var(--s-7)' }}>
        <div className="card">
          <div className="section-head">
            <div>
              <h3 className="section-title">Pacientes recientes</h3>
              <p className="section-subtitle">Últimos pacientes registrados</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('/patients')}>Ver todos <Icon name="arrowRight" size={14} /></Button>
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Género</th>
                  <th>Fecha nacimiento</th>
                  <th>Estado</th>
                  <th>Médico asignado</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {recent.map((p) => (
                  <tr key={p.id} className="row-clickable" onClick={() => onOpenPatient(p.id)}>
                    <td className="td-primary">{p.name}</td>
                    <td>{p.gender === 'male' ? 'Masculino' : 'Femenino'}</td>
                    <td className="mono">{p.birth_date}</td>
                    <td><Badge variant={p.status === 'active' ? 'success' : 'warning'}>{p.status === 'active' ? 'Activo' : 'Inactivo'}</Badge></td>
                    <td className="td-muted">{p.assigned_doctor_name}</td>
                    <td style={{ textAlign: 'right' }}>
                      <Button variant="ghost" size="sm" iconRight={<Icon name="arrowRight" size={12} />}>Abrir</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── PATIENTS ────────────────────────────────────────────
function Patients({ user, onOpenPatient }) {
  const [patients, setPatients] = useState(MOCK_PATIENTS);
  const [search, setSearch] = useState('');
  const [view, setView] = useState('table');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [sortField, setSortField] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [confirmDel, setConfirmDel] = useState(null);
  const [form, setForm] = useState({ name: '', birth_date: '', gender: '', identification_doc: '', medical_summary: '', assigned_doctor_id: '' });
  const [formError, setFormError] = useState('');

  const filtered = patients
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || (p.identification_doc || '').includes(search))
    .sort((a, b) => {
      const a1 = String(a[sortField] ?? '');
      const b1 = String(b[sortField] ?? '');
      const cmp = a1.localeCompare(b1, 'es');
      return sortDir === 'asc' ? cmp : -cmp;
    });

  const toggleSort = (f) => {
    if (sortField === f) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(f); setSortDir('asc'); }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', birth_date: '', gender: '', identification_doc: '', medical_summary: '', assigned_doctor_id: '' });
    setFormError('');
    setShowForm(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({ ...p });
    setFormError('');
    setShowForm(true);
  };

  const submit = (e) => {
    e.preventDefault();
    if (!form.name || !form.identification_doc) {
      setFormError('Por favor completa los campos obligatorios');
      return;
    }
    if (editing) {
      setPatients(ps => ps.map(p => p.id === editing.id ? { ...editing, ...form } : p));
    } else {
      const id = `p-new-${Date.now()}`;
      const doc = MOCK_DOCTORS.find(d => d.id === form.assigned_doctor_id);
      setPatients(ps => [{
        ...form,
        id,
        assigned_doctor_name: doc?.full_name || 'Sin asignar',
        status: 'active',
        created_at: new Date().toISOString(),
      }, ...ps]);
    }
    setShowForm(false);
  };

  const SortArrow = ({ field }) => (
    <span className={`sort-arrow ${sortField === field ? 'active' : ''}`}>
      {sortField === field ? (sortDir === 'asc' ? '▲' : '▼') : '↕'}
    </span>
  );

  const canCreate = user.role === 'admin' || user.role === 'medico';

  return (
    <div className="container page fade-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Pacientes</h1>
          <p className="page-subtitle">{patients.length} pacientes registrados en el sistema</p>
        </div>
        {canCreate && (
          <Button variant="primary" icon={<Icon name="plus" size={14} />} onClick={openCreate}>
            Nuevo paciente
          </Button>
        )}
      </div>

      <div className="toolbar">
        <div className="search-field">
          <span className="search-ic"><Icon name="search" size={16} /></span>
          <input
            className="input"
            placeholder="Buscar por nombre o cédula..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {search && (
          <div className="filter-chip">
            {filtered.length} resultados
            <button onClick={() => setSearch('')}><Icon name="x" size={10} /></button>
          </div>
        )}
        <div style={{ flex: 1 }} />
        <div className="view-toggle">
          <button className={view === 'table' ? 'active' : ''} onClick={() => setView('table')}>
            <Icon name="dashboard" size={12} /> Tabla
          </button>
          <button className={view === 'grid' ? 'active' : ''} onClick={() => setView('grid')}>
            <Icon name="image" size={12} /> Tarjetas
          </button>
        </div>
      </div>

      {view === 'table' ? (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th className="sortable" onClick={() => toggleSort('name')}>Nombre <SortArrow field="name" /></th>
                  <th>Género</th>
                  <th className="sortable" onClick={() => toggleSort('birth_date')}>Fecha nac. <SortArrow field="birth_date" /></th>
                  <th>Documento</th>
                  <th>Médico</th>
                  <th>Estado</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => (
                  <tr key={p.id} className="row-clickable fade-up" style={{ animationDelay: `${i * 25}ms` }} onClick={() => onOpenPatient(p.id)}>
                    <td className="td-primary">{p.name}</td>
                    <td>{p.gender === 'male' ? 'Masculino' : p.gender === 'female' ? 'Femenino' : '—'}</td>
                    <td className="mono">{p.birth_date || '—'}</td>
                    <td className="mono td-muted">{p.identification_doc}</td>
                    <td>{p.assigned_doctor_name || 'Sin asignar'}</td>
                    <td><Badge variant={p.status === 'active' ? 'success' : 'warning'}>{p.status === 'active' ? 'Activo' : 'Inactivo'}</Badge></td>
                    <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: 'inline-flex', gap: 6 }}>
                        {canCreate && <Button variant="ghost" size="sm" icon={<Icon name="edit" size={12} />} onClick={() => openEdit(p)} />}
                        {user.role === 'admin' && <Button variant="ghost" size="sm" icon={<Icon name="trash" size={12} />} onClick={() => setConfirmDel(p)} />}
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan="7"><div className="empty"><div className="empty-icon"><Icon name="search" /></div><div className="empty-title">Sin resultados</div><p>No se encontraron pacientes con ese criterio.</p></div></td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="patient-grid">
          {filtered.map((p, i) => (
            <div key={p.id} className="patient-tile fade-up" style={{ animationDelay: `${i * 30}ms` }} onClick={() => onOpenPatient(p.id)}>
              <div className="patient-tile-head">
                <div className="avatar avatar-lg" style={{ width: 48, height: 48, fontSize: 18 }}>
                  {p.name.charAt(0)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="patient-tile-name">{p.name}</div>
                  <div className="patient-tile-meta">
                    {p.gender === 'male' ? 'Masculino' : 'Femenino'} · {p.birth_date}
                  </div>
                </div>
                <Badge variant={p.status === 'active' ? 'success' : 'warning'} dot={false}>{p.status === 'active' ? 'Activo' : 'Inactivo'}</Badge>
              </div>
              <p style={{ fontSize: 'var(--t-xs)', color: 'var(--ink-3)', lineHeight: 1.5 }}>{p.medical_summary}</p>
              <div className="patient-tile-row">
                <span>Médico: <strong>{p.assigned_doctor_name?.split(' ').slice(-2).join(' ')}</strong></span>
                <span className="mono">{p.identification_doc}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal form */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? 'Editar paciente' : 'Nuevo paciente'}
        footer={<>
          <Button variant="secondary" onClick={() => setShowForm(false)}>Cancelar</Button>
          <Button variant="primary" onClick={submit}>{editing ? 'Guardar cambios' : 'Crear paciente'}</Button>
        </>}
      >
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-4)' }}>
          {formError && <div className="login-error">{formError}</div>}
          <Field label="Nombre completo" required>
            <input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--s-4)' }}>
            <Field label="Fecha de nacimiento">
              <input type="date" className="input" value={form.birth_date} onChange={(e) => setForm({ ...form, birth_date: e.target.value })} />
            </Field>
            <Field label="Género">
              <select className="select" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                <option value="">Seleccionar</option>
                <option value="male">Masculino</option>
                <option value="female">Femenino</option>
                <option value="other">Otro</option>
              </select>
            </Field>
          </div>
          <Field label="Documento de identidad" required>
            <input className="input" required value={form.identification_doc} onChange={(e) => setForm({ ...form, identification_doc: e.target.value })} />
          </Field>
          <Field label="Médico asignado">
            <select className="select" value={form.assigned_doctor_id} onChange={(e) => setForm({ ...form, assigned_doctor_id: e.target.value })}>
              <option value="">Sin asignar</option>
              {MOCK_DOCTORS.map(d => <option key={d.id} value={d.id}>{d.full_name}</option>)}
            </select>
          </Field>
          <Field label="Resumen médico">
            <textarea className="textarea" rows="3" value={form.medical_summary} onChange={(e) => setForm({ ...form, medical_summary: e.target.value })} />
          </Field>
        </form>
      </Modal>

      <Modal open={!!confirmDel} onClose={() => setConfirmDel(null)} title="Confirmar eliminación" size="sm"
        footer={<>
          <Button variant="secondary" onClick={() => setConfirmDel(null)}>Cancelar</Button>
          <Button variant="danger" onClick={() => { setPatients(ps => ps.filter(p => p.id !== confirmDel.id)); setConfirmDel(null); }}>Eliminar</Button>
        </>}
      >
        <p style={{ color: 'var(--ink-2)', marginBottom: 'var(--s-3)' }}>
          ¿Deseas eliminar al paciente <strong style={{ color: 'var(--ink)' }}>{confirmDel?.name}</strong>?
        </p>
        <p style={{ fontSize: 'var(--t-xs)', color: 'var(--ink-3)' }}>
          Esta acción es un soft-delete y puede revertirse desde el panel de administración.
        </p>
      </Modal>
    </div>
  );
}

// ── OBSERVATIONS ────────────────────────────────────────
function Observations({ user }) {
  const [obs, setObs] = useState(MOCK_OBSERVATIONS);
  const [patientFilter, setPatientFilter] = useState('');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [cedulaInput, setCedulaInput] = useState('');
  const [foundPatient, setFoundPatient] = useState(null);
  const [cedulaError, setCedulaError] = useState('');
  const [form, setForm] = useState({ loinc_code: '2339-0', loinc_display: 'Glucosa', value: '', unit: 'mg/dL' });

  const filtered = obs
    .filter(o => !patientFilter || o.patient_id === patientFilter)
    .slice(0, 50);

  const patientName = (id) => MOCK_PATIENTS.find(p => p.id === id)?.name || '—';

  const handleLoinc = (code) => {
    const l = LOINC_OPTIONS.find(x => x.code === code);
    setForm({ ...form, loinc_code: code, loinc_display: l.display, unit: l.unit });
  };

  const searchCedula = () => {
    const match = MOCK_PATIENTS.find(p => p.identification_doc === cedulaInput.trim());
    if (match) { setFoundPatient(match); setCedulaError(''); }
    else { setFoundPatient(null); setCedulaError('No se encontró ningún paciente con esa cédula.'); }
  };

  const submit = (e) => {
    e.preventDefault();
    if (!foundPatient) { setCedulaError('Primero busca y selecciona un paciente.'); return; }
    const v = parseFloat(form.value);
    const loinc = LOINC_OPTIONS.find(l => l.code === form.loinc_code);
    const newObs = {
      id: `obs-new-${Date.now()}`, patient_id: foundPatient.id,
      loinc_code: form.loinc_code, loinc_display: form.loinc_display,
      value: v, unit: form.unit,
      effective_date: new Date().toISOString(),
      is_outlier: v < loinc.range.min || v > loinc.range.max,
    };
    setObs(o => [newObs, ...o]);
    setShowForm(false);
    setCedulaInput(''); setFoundPatient(null);
    setForm({ loinc_code: '2339-0', loinc_display: 'Glucosa', value: '', unit: 'mg/dL' });
  };

  const canCreate = user.role === 'medico' || user.role === 'admin';

  return (
    <div className="container page fade-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Observaciones</h1>
          <p className="page-subtitle">{obs.length} registros clínicos · Codificación LOINC</p>
        </div>
        {canCreate && (
          <Button variant="primary" icon={<Icon name="plus" size={14} />} onClick={() => setShowForm(true)}>
            Nueva observación
          </Button>
        )}
      </div>

      <div className="toolbar">
        <div className="search-field">
          <span className="search-ic"><Icon name="search" size={16} /></span>
          <input className="input" placeholder="Buscar paciente..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="select" style={{ maxWidth: 260, height: 40 }} value={patientFilter} onChange={(e) => setPatientFilter(e.target.value)}>
          <option value="">Todos los pacientes</option>
          {MOCK_PATIENTS.filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase())).map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        {patientFilter && (
          <div className="filter-chip">
            {patientName(patientFilter)}
            <button onClick={() => setPatientFilter('')}><Icon name="x" size={10} /></button>
          </div>
        )}
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>LOINC</th>
                <th>Tipo</th>
                <th>Valor</th>
                <th>Unidad</th>
                <th>Paciente</th>
                <th>Fecha</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o, i) => (
                <tr key={o.id} className={`fade-up ${o.is_outlier ? 'row-flagged' : ''}`} style={{ animationDelay: `${i * 20}ms` }}>
                  <td className="mono td-muted">{o.loinc_code}</td>
                  <td>{o.loinc_display}</td>
                  <td className="td-primary mono">{o.value}</td>
                  <td className="td-muted">{o.unit}</td>
                  <td>{patientName(o.patient_id)}</td>
                  <td className="mono td-muted">{o.effective_date?.split('T')[0]}</td>
                  <td><Badge variant={o.is_outlier ? 'danger' : 'success'}>{o.is_outlier ? 'Outlier' : 'Normal'}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Nueva observación"
        footer={<>
          <Button variant="secondary" onClick={() => setShowForm(false)}>Cancelar</Button>
          <Button variant="primary" onClick={submit} disabled={!foundPatient}>Crear observación</Button>
        </>}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-4)' }}>
          <Field label="Cédula del paciente" required hint={!foundPatient && !cedulaError ? 'Ingresa la cédula y presiona Buscar' : ''} error={cedulaError}>
            <div style={{ display: 'flex', gap: 8 }}>
              <input className="input" placeholder="Ej: 1013456789" value={cedulaInput}
                onChange={(e) => { setCedulaInput(e.target.value); setFoundPatient(null); setCedulaError(''); }}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); searchCedula(); } }}
              />
              <Button variant="secondary" onClick={searchCedula} type="button">Buscar</Button>
            </div>
          </Field>

          {foundPatient && (
            <div className="patient-found">
              <div>
                <div className="patient-found-name">{foundPatient.name}</div>
                <div className="patient-found-meta">
                  {foundPatient.gender === 'male' ? 'Masculino' : 'Femenino'} · {foundPatient.birth_date} · CC {foundPatient.identification_doc}
                </div>
              </div>
              <Badge variant="success">Encontrado</Badge>
            </div>
          )}

          <Field label="Tipo de observación (LOINC)" required>
            <select className="select" value={form.loinc_code} onChange={(e) => handleLoinc(e.target.value)}>
              {LOINC_OPTIONS.map(l => <option key={l.code} value={l.code}>{l.display} — {l.code}</option>)}
            </select>
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--s-4)' }}>
            <Field label="Valor" required>
              <input type="number" step="0.1" className="input" required placeholder="Ej: 120.5" value={form.value}
                onChange={(e) => setForm({ ...form, value: e.target.value })} />
            </Field>
            <Field label="Unidad">
              <input className="input" readOnly value={form.unit} style={{ background: 'var(--paper-2)' }} />
            </Field>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ── ALERTS ──────────────────────────────────────────────
function Alerts() {
  const outliers = MOCK_OBSERVATIONS.filter(o => o.is_outlier);

  return (
    <div className="container page fade-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Alertas clínicas</h1>
          <p className="page-subtitle">Detección automática de valores fuera de rango clínico</p>
        </div>
        <Button variant="secondary" icon={<Icon name="refresh" size={14} />}>Actualizar</Button>
      </div>

      {outliers.length === 0 ? (
        <div className="card">
          <div className="empty">
            <div className="empty-icon" style={{ background: 'var(--sage-soft)', color: 'var(--sage)' }}><Icon name="check" /></div>
            <div className="empty-title">Todo en orden</div>
            <p>No se detectaron valores fuera de rango. Todos los signos están dentro de parámetros clínicos normales.</p>
          </div>
        </div>
      ) : (
        <>
          <div className="banner banner-warning" style={{ marginBottom: 'var(--s-5)' }}>
            <Icon name="alert" size={18} />
            <span>Se detectaron <strong>{outliers.length}</strong> valores fuera de rango clínico que requieren atención.</span>
          </div>
          <div className="card" style={{ padding: 0 }}>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>LOINC</th>
                    <th>Tipo</th>
                    <th>Valor</th>
                    <th>Unidad</th>
                    <th>Rango válido</th>
                    <th>Paciente</th>
                    <th>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {outliers.map((o, i) => {
                    const loinc = LOINC_OPTIONS.find(l => l.code === o.loinc_code);
                    const patient = MOCK_PATIENTS.find(p => p.id === o.patient_id);
                    return (
                      <tr key={o.id} className="row-flagged fade-up" style={{ animationDelay: `${i * 20}ms` }}>
                        <td className="mono td-muted">{o.loinc_code}</td>
                        <td>{o.loinc_display}</td>
                        <td className="td-primary mono" style={{ color: 'var(--clay)' }}>{o.value}</td>
                        <td className="td-muted">{o.unit}</td>
                        <td className="mono td-muted">{loinc?.range.min}–{loinc?.range.max}</td>
                        <td>{patient?.name}</td>
                        <td className="mono td-muted">{o.effective_date?.split('T')[0]}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

Object.assign(window, { Login, Dashboard, Patients, Observations, Alerts });
