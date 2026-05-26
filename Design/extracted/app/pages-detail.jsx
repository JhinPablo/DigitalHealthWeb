// ───────────────────────────────────────────────────────────
// PATIENT DETAIL + ADMIN
// ───────────────────────────────────────────────────────────

// ── Mini line chart SVG ──
function MiniChart({ data, color = 'var(--sage)', range }) {
  if (!data || data.length === 0) return null;
  const w = 520, h = 160, pad = 32;
  const values = data.map(d => d.value);
  const min = Math.min(...values, range?.min ?? Infinity);
  const max = Math.max(...values, range?.max ?? -Infinity);
  const padding = (max - min) * 0.18 || 1;
  const yMin = min - padding;
  const yMax = max + padding;

  const x = (i) => pad + (i / Math.max(1, data.length - 1)) * (w - pad * 2);
  const y = (v) => pad + ((yMax - v) / (yMax - yMin)) * (h - pad * 2);

  const path = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(d.value)}`).join(' ');
  const area = `${path} L ${x(data.length - 1)} ${h - pad} L ${x(0)} ${h - pad} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mini-chart" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`grad-${color.replace(/[^a-z]/gi,'')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* range band */}
      {range && (
        <rect
          x={pad} y={y(range.max)}
          width={w - pad * 2}
          height={Math.max(0, y(range.min) - y(range.max))}
          fill="var(--sage)" opacity="0.06"
        />
      )}
      {/* gridlines */}
      {[0.25, 0.5, 0.75].map(p => (
        <line key={p}
          x1={pad} x2={w - pad}
          y1={pad + p * (h - pad * 2)} y2={pad + p * (h - pad * 2)}
          stroke="var(--hairline)" strokeWidth="1"
        />
      ))}
      <path d={area} fill={`url(#grad-${color.replace(/[^a-z]/gi,'')})`} />
      <path d={path} stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((d, i) => (
        <circle key={i} cx={x(i)} cy={y(d.value)} r={d.is_outlier ? 4 : 2.5}
          fill={d.is_outlier ? 'var(--clay)' : color}
          stroke="var(--surface)" strokeWidth="1.5"
        />
      ))}
    </svg>
  );
}

// ── PATIENT DETAIL ──
function PatientDetail({ patientId, onBack, user }) {
  const patient = MOCK_PATIENTS.find(p => p.id === patientId);
  const [tab, setTab] = useState('overview');
  const [signing, setSigning] = useState(null);
  const [signForm, setSignForm] = useState({ clinical_notes: '', action: 'ACCEPT', justification: '' });
  const [reports, setReports] = useState(MOCK_RISK_REPORTS.filter(r => r.patient_id === patientId));
  const [lightbox, setLightbox] = useState(null);
  const [mlResult, setMlResult] = useState(null);
  const [mlLoading, setMlLoading] = useState(false);
  const [dlResult, setDlResult] = useState(null);
  const [dlLoading, setDlLoading] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);

  const observations = MOCK_OBSERVATIONS.filter(o => o.patient_id === patientId);
  const images = MOCK_IMAGES.filter(i => i.patient_id === patientId);
  const canSign = user.role === 'medico' || user.role === 'admin';

  // Group obs by type
  const obsTypes = useMemo(() => {
    const acc = {};
    observations.forEach(o => {
      const k = o.loinc_display;
      if (!acc[k]) acc[k] = { type: k, code: o.loinc_code, unit: o.unit, items: [] };
      acc[k].items.push(o);
    });
    Object.values(acc).forEach(g => g.items.sort((a, b) => a.effective_date.localeCompare(b.effective_date)));
    return Object.values(acc);
  }, [observations]);

  const runML = () => {
    setMlLoading(true); setMlResult(null);
    setTimeout(() => {
      setMlResult({
        probability: 0.78,
        risk_category: 'HIGH',
        calibration: 'isotonic',
        shap_values: {
          Glucose: 0.142, BMI: 0.087, Age: 0.063, BloodPressure: 0.041, Insulin: -0.018,
          SkinThickness: -0.024, DiabetesPedigreeFunction: 0.031, Pregnancies: 0.012,
        },
      });
      setMlLoading(false);
    }, 1400);
  };

  const runDL = (imgUrl) => {
    setDlLoading(true); setDlResult(null);
    setTimeout(() => {
      setDlResult({
        severity_label: 'Moderada',
        confidence: 0.864,
        risk_category: 'HIGH',
        original_url: imgUrl,
        gradcam_url: imgUrl,
      });
      setDlLoading(false);
    }, 1800);
  };

  const submitSign = (e) => {
    e.preventDefault();
    setReports(rs => rs.map(r => r.id === signing.id
      ? { ...r, signed_at: new Date().toISOString(), feedback: signForm.action }
      : r));
    setSigning(null);
    setSignForm({ clinical_notes: '', action: 'ACCEPT', justification: '' });
  };

  if (!patient) return <div className="container page"><p>Paciente no encontrado.</p></div>;

  const tabItems = [
    { value: 'overview',    label: 'Resumen',         icon: 'user' },
    { value: 'observations',label: 'Observaciones',   icon: 'pulse', count: observations.length },
    { value: 'reports',     label: 'Reportes',        icon: 'file',  count: reports.length },
    { value: 'images',      label: 'Imágenes',        icon: 'image', count: images.length },
    ...(canSign ? [
      { value: 'ml',          label: 'Análisis ML',     icon: 'brain' },
      { value: 'dl',          label: 'Análisis DL',     icon: 'eye' },
    ] : []),
  ];

  return (
    <>
      <SubNav
        backLabel="Volver a pacientes"
        onBack={onBack}
        items={tabItems}
        value={tab}
        onChange={setTab}
      />

      <div className="container page fade-up">
        <div className="pd-hero">
          <div className="pd-hero-avatar">{patient.name.charAt(0)}</div>
          <div>
            <h1 className="pd-hero-name">{patient.name}</h1>
            <p style={{ color: 'var(--ink-3)', fontSize: 'var(--t-sm)' }}>{patient.medical_summary}</p>
            <div className="pd-hero-meta">
              <Badge variant={patient.status === 'active' ? 'success' : 'warning'}>{patient.status === 'active' ? 'Activo' : 'Inactivo'}</Badge>
              <Badge variant="sage" dot={false}>Médico: {patient.assigned_doctor_name?.split(' ').slice(-2).join(' ')}</Badge>
              <Badge variant="neutral" dot={false}>CC {patient.identification_doc}</Badge>
            </div>
          </div>
          <div className="pd-hero-actions">
            <Button variant="secondary" size="sm" icon={<Icon name="edit" size={12} />}>Editar</Button>
            {canSign && <Button variant="primary" size="sm" icon={<Icon name="plus" size={12} />}>Nueva observación</Button>}
          </div>
        </div>

        {tab === 'overview' && (
          <>
            <div className="pd-meta-grid card" style={{ marginTop: 'var(--s-5)' }}>
              <div className="pd-meta-item"><span className="pd-meta-label">Género</span><span className="pd-meta-value">{patient.gender === 'male' ? 'Masculino' : 'Femenino'}</span></div>
              <div className="pd-meta-item"><span className="pd-meta-label">Fecha nacimiento</span><span className="pd-meta-value">{patient.birth_date}</span></div>
              <div className="pd-meta-item"><span className="pd-meta-label">Documento</span><span className="pd-meta-value mono">{patient.identification_doc}</span></div>
              <div className="pd-meta-item"><span className="pd-meta-label">Médico tratante</span><span className="pd-meta-value">{patient.assigned_doctor_name}</span></div>
              <div className="pd-meta-item"><span className="pd-meta-label">Registrado</span><span className="pd-meta-value">{patient.created_at?.split('T')[0]}</span></div>
              <div className="pd-meta-item"><span className="pd-meta-label">Última observación</span><span className="pd-meta-value">{observations[0]?.effective_date?.split('T')[0] || '—'}</span></div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--s-5)', marginTop: 'var(--s-5)' }}>
              <div className="card">
                <div className="section-head">
                  <div>
                    <h3 className="section-title">Tendencias clínicas</h3>
                    <p className="section-subtitle">Últimas {Math.min(observations.length, 30)} mediciones</p>
                  </div>
                </div>
                <div className="chart-grid">
                  {obsTypes.slice(0, 2).map((g, i) => {
                    const loinc = LOINC_OPTIONS.find(l => l.code === g.code);
                    const latest = g.items[g.items.length - 1];
                    return (
                      <div key={g.type} className="chart-card" style={{ padding: 0, border: 'none' }}>
                        <div className="chart-head">
                          <div>
                            <h4 className="chart-title">{g.type}</h4>
                            <span style={{ fontSize: 'var(--t-xs)', color: 'var(--ink-3)' }}>Rango: {loinc?.range.min}–{loinc?.range.max} {g.unit}</span>
                          </div>
                          <div>
                            <span className="chart-latest" style={{ color: latest?.is_outlier ? 'var(--clay)' : 'var(--ink)' }}>{latest?.value}</span>
                            <span className="chart-unit">{g.unit}</span>
                          </div>
                        </div>
                        <MiniChart data={g.items} range={loinc?.range} color={i === 0 ? 'var(--sage)' : 'var(--gold)'} />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="card">
                <div className="section-head">
                  <h3 className="section-title">Reportes recientes</h3>
                </div>
                {reports.length === 0 ? (
                  <p style={{ color: 'var(--ink-3)', fontSize: 'var(--t-sm)' }}>Sin reportes de riesgo.</p>
                ) : reports.slice(0, 3).map(r => (
                  <div key={r.id} className={`report-row ${r.signed_at ? 'is-signed' : 'is-pending'}`} style={{ gridTemplateColumns: 'auto 1fr auto' }}>
                    <Badge variant={r.model_type === 'ML' ? 'info' : 'warning'}>{r.model_type}</Badge>
                    <div>
                      <div className="report-score">{(r.risk_score * 100).toFixed(0)}%</div>
                      <span style={{ fontSize: 'var(--t-xs)', color: 'var(--ink-3)' }}>{r.created_at.split('T')[0]}</span>
                    </div>
                    <Badge variant={r.risk_category === 'CRITICAL' ? 'danger' : r.risk_category === 'HIGH' ? 'warning' : 'success'}>{r.risk_category}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {tab === 'observations' && (
          <>
            <div className="chart-grid" style={{ marginBottom: 'var(--s-5)' }}>
              {obsTypes.map((g, i) => {
                const loinc = LOINC_OPTIONS.find(l => l.code === g.code);
                const latest = g.items[g.items.length - 1];
                return (
                  <div key={g.type} className="chart-card fade-up" style={{ animationDelay: `${i * 60}ms` }}>
                    <div className="chart-head">
                      <div>
                        <h4 className="chart-title">{g.type}</h4>
                        <span style={{ fontSize: 'var(--t-xs)', color: 'var(--ink-3)' }}>Rango: {loinc?.range.min}–{loinc?.range.max} {g.unit}</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span className="chart-latest" style={{ color: latest?.is_outlier ? 'var(--clay)' : 'var(--ink)' }}>{latest?.value}</span>
                        <span className="chart-unit">{g.unit}</span>
                      </div>
                    </div>
                    <MiniChart data={g.items} range={loinc?.range} color={['var(--sage)', 'var(--gold)', 'var(--indigo)'][i % 3]} />
                  </div>
                );
              })}
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
                      <th>Fecha</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {observations.slice(0, 30).map((o, i) => (
                      <tr key={o.id} className={`fade-up ${o.is_outlier ? 'row-flagged' : ''}`} style={{ animationDelay: `${i * 15}ms` }}>
                        <td className="mono td-muted">{o.loinc_code}</td>
                        <td>{o.loinc_display}</td>
                        <td className="td-primary mono">{o.value}</td>
                        <td className="td-muted">{o.unit}</td>
                        <td className="mono td-muted">{o.effective_date?.split('T')[0]}</td>
                        <td><Badge variant={o.is_outlier ? 'danger' : 'success'}>{o.is_outlier ? 'Outlier' : 'Normal'}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {tab === 'reports' && (
          <div className="card">
            <div className="section-head">
              <div>
                <h3 className="section-title">Reportes de riesgo</h3>
                <p className="section-subtitle">Resultados de inferencia ML y DL · RiskAssessment FHIR</p>
              </div>
            </div>
            {reports.length === 0 ? (
              <div className="empty">
                <div className="empty-icon"><Icon name="file" /></div>
                <div className="empty-title">Sin reportes</div>
                <p>Aún no se han generado reportes para este paciente.</p>
              </div>
            ) : (
              <div>
                {reports.map(r => (
                  <div key={r.id} className={`report-row ${r.signed_at ? 'is-signed' : 'is-pending'}`}>
                    <Badge variant={r.model_type === 'ML' ? 'info' : 'warning'}>{r.model_type}</Badge>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                        <span className="report-score">{(r.risk_score * 100).toFixed(0)}%</span>
                        <Badge variant={r.risk_category === 'CRITICAL' ? 'danger' : r.risk_category === 'HIGH' ? 'warning' : 'success'}>{r.risk_category}</Badge>
                      </div>
                      <div style={{ fontSize: 'var(--t-xs)', color: 'var(--ink-3)', marginTop: 4 }}>
                        Generado el {r.created_at.split('T')[0]}
                        {r.signed_at && ` · Firmado ${r.feedback === 'ACCEPT' ? 'aceptando' : 'rechazando'} el ${r.signed_at.split('T')[0]}`}
                      </div>
                    </div>
                    <div>
                      {r.signed_at ? (
                        <Badge variant={r.feedback === 'ACCEPT' ? 'success' : 'danger'}>{r.feedback === 'ACCEPT' ? 'Aceptado' : 'Rechazado'}</Badge>
                      ) : canSign && (
                        <Button variant="primary" size="sm" icon={<Icon name="signature" size={14} />} onClick={() => setSigning(r)}>Firmar</Button>
                      )}
                    </div>
                    <Button variant="ghost" size="sm" icon={<Icon name="arrowRight" size={14} />} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'images' && (
          <div className="card">
            <div className="section-head">
              <div>
                <h3 className="section-title">Imágenes médicas</h3>
                <p className="section-subtitle">Almacenamiento seguro en MinIO · Pre-signed URLs</p>
              </div>
              {canSign && <Button variant="primary" size="sm" icon={<Icon name="upload" size={14} />} onClick={() => setUploadOpen(true)}>Subir imagen</Button>}
            </div>
            {images.length === 0 ? (
              <div className="empty">
                <div className="empty-icon"><Icon name="image" /></div>
                <div className="empty-title">Sin imágenes</div>
                <p>No hay estudios de imagen para este paciente.</p>
              </div>
            ) : (
              <div className="img-grid">
                {images.map((img, i) => (
                  <div key={img.id} className="img-card fade-up" style={{ animationDelay: `${i * 60}ms` }}>
                    <div className="img-preview" onClick={() => setLightbox(img)}>
                      <img src={img.presigned_url} alt={img.original_filename} loading="lazy" />
                    </div>
                    <div className="img-info">
                      <Badge variant="info" dot={false}>{img.modality}</Badge>
                      <p className="img-name">{img.original_filename}</p>
                      <p className="img-desc">{img.description}</p>
                      <div className="img-actions">
                        <Button variant="secondary" size="sm" onClick={() => setLightbox(img)}>Ver</Button>
                        {canSign && <Button variant="ghost" size="sm" icon={<Icon name="trash" size={12} />} />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'ml' && (
          <div className="card">
            <div className="section-head">
              <div>
                <h3 className="section-title">Análisis ML — Predicción de riesgo</h3>
                <p className="section-subtitle">Modelo tabular ONNX · Explicabilidad SHAP</p>
              </div>
              <Button variant="accent" icon={<Icon name="brain" size={14} />} onClick={runML} loading={mlLoading}>
                {mlLoading ? 'Ejecutando modelo...' : 'Ejecutar análisis ML'}
              </Button>
            </div>

            {!mlResult && !mlLoading && (
              <div className="empty">
                <div className="empty-icon"><Icon name="sparkle" /></div>
                <div className="empty-title">Análisis predictivo</div>
                <p>Ejecuta el modelo para obtener una predicción de riesgo y su explicabilidad por feature.</p>
              </div>
            )}

            {mlResult && (
              <div className="fade-up">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--s-4)', marginBottom: 'var(--s-5)' }}>
                  <div className="kpi-card">
                    <div style={{ fontSize: 'var(--t-xs)', color: 'var(--ink-3)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>Probabilidad</div>
                    <div style={{ fontFamily: 'var(--font-serif)', fontSize: 44, lineHeight: 1, letterSpacing: '-0.025em' }}>{(mlResult.probability * 100).toFixed(1)}%</div>
                  </div>
                  <div className="kpi-card">
                    <div style={{ fontSize: 'var(--t-xs)', color: 'var(--ink-3)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>Categoría</div>
                    <Badge variant="warning" dot={false} style={{ height: 32, fontSize: 14, padding: '0 12px' }}>{mlResult.risk_category}</Badge>
                  </div>
                  <div className="kpi-card">
                    <div style={{ fontSize: 'var(--t-xs)', color: 'var(--ink-3)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>Calibración</div>
                    <div style={{ fontSize: 'var(--t-md)', color: 'var(--ink-2)' }}>{mlResult.calibration}</div>
                  </div>
                </div>

                <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--t-lg)', marginBottom: 'var(--s-4)' }}>Explicabilidad SHAP</h4>
                <div className="shap-list">
                  {Object.entries(mlResult.shap_values)
                    .sort(([, a], [, b]) => Math.abs(b) - Math.abs(a))
                    .map(([feat, val]) => {
                      const max = Math.max(...Object.values(mlResult.shap_values).map(Math.abs));
                      const pct = (Math.abs(val) / max) * 50;
                      return (
                        <div key={feat} className="shap-item">
                          <span className="shap-label">{feat}</span>
                          <div className="shap-track">
                            <div className={`shap-fill ${val > 0 ? 'pos' : 'neg'}`} style={{ width: `${pct}%` }} />
                          </div>
                          <span className="shap-val">{val > 0 ? '+' : ''}{val.toFixed(3)}</span>
                        </div>
                      );
                    })
                  }
                </div>
                <p style={{ fontSize: 'var(--t-xs)', color: 'var(--ink-3)', marginTop: 'var(--s-4)' }}>
                  <span style={{ color: 'var(--clay)' }}>■</span> Incrementa riesgo · <span style={{ color: 'var(--sage)' }}>■</span> Reduce riesgo
                </p>
              </div>
            )}
          </div>
        )}

        {tab === 'dl' && (
          <div className="card">
            <div className="section-head">
              <div>
                <h3 className="section-title">Análisis DL — Retinopatía diabética</h3>
                <p className="section-subtitle">Modelo CNN · Mapas Grad-CAM</p>
              </div>
            </div>

            {images.length === 0 ? (
              <div className="empty">
                <div className="empty-icon"><Icon name="image" /></div>
                <div className="empty-title">Sin imágenes para analizar</div>
                <p>Sube una imagen de fondo de ojo desde la pestaña Imágenes para ejecutar el análisis.</p>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 'var(--s-4)' }}>
                  {images.map(img => (
                    <Button key={img.id} variant="secondary" size="sm" disabled={dlLoading} onClick={() => runDL(img.presigned_url)}>
                      <Icon name="eye" size={12} /> {img.original_filename}
                    </Button>
                  ))}
                </div>

                {dlLoading && (
                  <div className="empty" style={{ padding: 'var(--s-7)' }}>
                    <div className="spinner spinner-lg" style={{ margin: '0 auto var(--s-4)' }} />
                    <p>Analizando imagen con red neuronal...</p>
                  </div>
                )}

                {dlResult && (
                  <div className="fade-up">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--s-4)', marginBottom: 'var(--s-5)' }}>
                      <div className="kpi-card">
                        <div style={{ fontSize: 'var(--t-xs)', color: 'var(--ink-3)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>Severidad</div>
                        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 32, lineHeight: 1, letterSpacing: '-0.025em' }}>{dlResult.severity_label}</div>
                      </div>
                      <div className="kpi-card">
                        <div style={{ fontSize: 'var(--t-xs)', color: 'var(--ink-3)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>Confianza</div>
                        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 44, lineHeight: 1, letterSpacing: '-0.025em' }}>{(dlResult.confidence * 100).toFixed(1)}%</div>
                      </div>
                      <div className="kpi-card">
                        <div style={{ fontSize: 'var(--t-xs)', color: 'var(--ink-3)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>Categoría</div>
                        <Badge variant="warning" dot={false} style={{ height: 32, fontSize: 14, padding: '0 12px' }}>{dlResult.risk_category}</Badge>
                      </div>
                    </div>

                    <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--t-lg)', marginBottom: 'var(--s-3)' }}>Comparación: Original vs Grad-CAM</h4>
                    <div className="gradcam-compare">
                      <div className="gradcam-panel">
                        <h5>Original</h5>
                        <img src={dlResult.original_url} alt="Original" />
                      </div>
                      <div className="gradcam-panel">
                        <h5>Grad-CAM</h5>
                        <div style={{ position: 'relative' }}>
                          <img src={dlResult.gradcam_url} alt="Grad-CAM" />
                          <div style={{
                            position: 'absolute', inset: 0,
                            background: 'radial-gradient(ellipse at 60% 45%, rgba(217,93,57,.5) 0%, rgba(247,159,68,.32) 30%, transparent 60%)',
                            mixBlendMode: 'screen',
                          }} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Sign report modal */}
      <Modal open={!!signing} onClose={() => setSigning(null)} title="Firmar reporte de riesgo" size="lg"
        footer={<>
          <Button variant="secondary" onClick={() => setSigning(null)}>Cancelar</Button>
          <Button variant={signForm.action === 'ACCEPT' ? 'primary' : 'danger'} onClick={submitSign}>
            Firmar y {signForm.action === 'ACCEPT' ? 'aceptar' : 'rechazar'}
          </Button>
        </>}
      >
        {signing && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-4)' }}>
            <div className="patient-found" style={{ background: 'var(--paper-2)', borderColor: 'var(--hairline)' }}>
              <div>
                <div className="patient-found-name">Reporte {signing.model_type} · {signing.created_at.split('T')[0]}</div>
                <div className="patient-found-meta">Score {(signing.risk_score * 100).toFixed(0)}% · Categoría {signing.risk_category}</div>
              </div>
              <Badge variant={signing.risk_category === 'CRITICAL' ? 'danger' : 'warning'}>{signing.risk_category}</Badge>
            </div>

            <Field label="Observaciones clínicas" required hint={`${signForm.clinical_notes.length}/30 caracteres mínimos`}>
              <textarea className="textarea" rows="4" minLength={30}
                placeholder="Describe tu evaluación clínica de este resultado..."
                value={signForm.clinical_notes}
                onChange={(e) => setSignForm({ ...signForm, clinical_notes: e.target.value })}
              />
            </Field>

            <Field label="Decisión" required>
              <div className="choice-grid">
                <label className={`choice ${signForm.action === 'ACCEPT' ? 'selected accept' : ''}`}>
                  <input type="radio" checked={signForm.action === 'ACCEPT'} onChange={() => setSignForm({ ...signForm, action: 'ACCEPT' })} />
                  <span className="choice-dot" />
                  <div>
                    <div style={{ fontSize: 'var(--t-sm)', fontWeight: 500 }}>Aceptar resultado</div>
                    <div style={{ fontSize: 'var(--t-xs)', color: 'var(--ink-3)' }}>El modelo es válido</div>
                  </div>
                </label>
                <label className={`choice ${signForm.action === 'REJECT' ? 'selected reject' : ''}`}>
                  <input type="radio" checked={signForm.action === 'REJECT'} onChange={() => setSignForm({ ...signForm, action: 'REJECT' })} />
                  <span className="choice-dot" />
                  <div>
                    <div style={{ fontSize: 'var(--t-sm)', fontWeight: 500 }}>Rechazar resultado</div>
                    <div style={{ fontSize: 'var(--t-xs)', color: 'var(--ink-3)' }}>Discrepa con clínica</div>
                  </div>
                </label>
              </div>
            </Field>

            {signForm.action === 'REJECT' && (
              <Field label="Justificación del rechazo" required hint={`${signForm.justification.length}/20 caracteres mínimos`}>
                <textarea className="textarea" rows="3" minLength={20}
                  placeholder="Justifica por qué rechazas este resultado..."
                  value={signForm.justification}
                  onChange={(e) => setSignForm({ ...signForm, justification: e.target.value })}
                />
              </Field>
            )}
          </div>
        )}
      </Modal>

      {/* Lightbox */}
      {lightbox && (
        <div className="lightbox-bg" onClick={() => setLightbox(null)}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <div className="lightbox-head">
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <Badge variant="info">{lightbox.modality}</Badge>
                <span style={{ fontSize: 'var(--t-sm)' }}>{lightbox.original_filename}</span>
              </div>
              <button className="modal-close" onClick={() => setLightbox(null)}><Icon name="x" size={16} /></button>
            </div>
            <img src={lightbox.presigned_url} alt={lightbox.original_filename} className="lightbox-img" style={{ width: '100%' }} />
            {lightbox.description && <p style={{ padding: 'var(--s-4) var(--s-5)', fontSize: 'var(--t-sm)', color: 'var(--ink-2)' }}>{lightbox.description}</p>}
          </div>
        </div>
      )}

      <Modal open={uploadOpen} onClose={() => setUploadOpen(false)} title="Subir imagen médica"
        footer={<>
          <Button variant="secondary" onClick={() => setUploadOpen(false)}>Cancelar</Button>
          <Button variant="primary" onClick={() => setUploadOpen(false)}>Subir imagen</Button>
        </>}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-4)' }}>
          <Field label="Modalidad" required>
            <select className="select">
              <option>FUNDUS — Fondo de ojo</option>
              <option>XRAY — Radiografía</option>
              <option>DERM — Dermatología</option>
              <option>CT — Tomografía</option>
              <option>MRI — Resonancia</option>
            </select>
          </Field>
          <Field label="Descripción">
            <textarea className="textarea" rows="2" placeholder="Descripción clínica de la imagen..." />
          </Field>
          <Field label="Archivo" required hint="Formatos: JPEG, PNG, DICOM · Máx 10MB">
            <input type="file" className="input" style={{ paddingTop: 9 }} accept="image/*" />
          </Field>
        </div>
      </Modal>
    </>
  );
}

// ── ADMIN ──────────────────────────────────────────────
function Admin() {
  const [tab, setTab] = useState('users');
  const [users, setUsers] = useState(MOCK_USERS_ADMIN);
  const [expandedLog, setExpandedLog] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [showUserForm, setShowUserForm] = useState(false);
  const [userForm, setUserForm] = useState({ full_name: '', identification_doc: '', email: '', password: '', role: 'medico' });

  const openCreate = () => {
    setEditingUser(null);
    setUserForm({ full_name: '', identification_doc: '', email: '', password: '', role: 'medico' });
    setShowUserForm(true);
  };
  const openEdit = (u) => {
    setEditingUser(u);
    setUserForm({ ...u, password: '' });
    setShowUserForm(true);
  };
  const submitUser = (e) => {
    e.preventDefault();
    if (editingUser) {
      setUsers(us => us.map(u => u.id === editingUser.id ? { ...u, ...userForm } : u));
    } else {
      setUsers(us => [{ ...userForm, id: `u-new-${Date.now()}`, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }, ...us]);
    }
    setShowUserForm(false);
  };

  return (
    <>
      <SubNav
        items={[
          { value: 'users',  label: 'Usuarios',     icon: 'users',    count: users.length },
          { value: 'audit',  label: 'Audit log',    icon: 'shield',   count: MOCK_AUDIT.length },
          { value: 'stats',  label: 'Estadísticas', icon: 'trending' },
        ]}
        value={tab}
        onChange={setTab}
      />

      <div className="container page fade-up">
        <div className="page-header">
          <div>
            <h1 className="page-title">Administración</h1>
            <p className="page-subtitle">Gestión del sistema · Cumplimiento Ley 1581/2012</p>
          </div>
          {tab === 'users' && <Button variant="primary" icon={<Icon name="plus" size={14} />} onClick={openCreate}>Nuevo usuario</Button>}
        </div>

        {tab === 'users' && (
          <div className="card" style={{ padding: 0 }}>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Cédula</th>
                    <th>Email</th>
                    <th>Rol</th>
                    <th>Estado</th>
                    <th>Modificado</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr key={u.id} className="fade-up" style={{ animationDelay: `${i * 20}ms` }}>
                      <td className="td-primary">{u.full_name}</td>
                      <td className="mono td-muted">{u.identification_doc}</td>
                      <td className="td-muted">{u.email}</td>
                      <td><Badge variant={u.role === 'admin' ? 'danger' : u.role === 'medico' ? 'info' : 'success'} dot={false}>
                        {u.role === 'admin' ? 'Administrador' : u.role === 'medico' ? 'Médico' : 'Paciente'}
                      </Badge></td>
                      <td><Badge variant={u.is_active ? 'success' : 'neutral'}>{u.is_active ? 'Activo' : 'Inactivo'}</Badge></td>
                      <td className="mono td-muted">{u.updated_at?.split('T')[0]}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          <Button variant="ghost" size="sm" icon={<Icon name="edit" size={12} />} onClick={() => openEdit(u)} />
                          <Button variant="ghost" size="sm" icon={<Icon name="trash" size={12} />} onClick={() => setConfirmDel(u)} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'audit' && (
          <div className="card" style={{ padding: 0 }}>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th></th>
                    <th>Acción</th>
                    <th>Usuario</th>
                    <th>Recurso</th>
                    <th>Estado</th>
                    <th>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_AUDIT.map((e, i) => (
                    <React.Fragment key={e.id}>
                      <tr className="row-clickable fade-up" style={{ animationDelay: `${i * 20}ms` }} onClick={() => setExpandedLog(expandedLog === e.id ? null : e.id)}>
                        <td style={{ width: 32 }}>
                          <span style={{ display: 'inline-flex', transition: 'transform 200ms var(--ease)', transform: expandedLog === e.id ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                            <Icon name="arrowRight" size={12} />
                          </span>
                        </td>
                        <td className="td-primary">{e.action}</td>
                        <td>
                          <div>{e.user_name}</div>
                          <div className="td-muted">{e.user_email}</div>
                        </td>
                        <td>{e.resource_type}</td>
                        <td><Badge variant={e.status === 'SUCCESS' ? 'success' : 'danger'}>{e.status}</Badge></td>
                        <td className="mono td-muted">{e.timestamp.replace('T', ' ').slice(0, 19)}</td>
                      </tr>
                      {expandedLog === e.id && (
                        <tr>
                          <td colSpan="6" style={{ padding: 0 }}>
                            <div className="audit-detail-panel fade-up">
                              <p style={{ fontSize: 'var(--t-sm)', color: 'var(--ink-2)', marginBottom: 'var(--s-3)' }}>
                                {AUDIT_DESC[e.action] || 'Acción registrada en el sistema'}
                              </p>
                              <div className="audit-grid">
                                <div className="audit-item"><span className="label">ID del registro</span><span className="value mono">{e.id}</span></div>
                                <div className="audit-item"><span className="label">Realizado por</span><span className="value">{e.user_name}</span></div>
                                <div className="audit-item"><span className="label">Recurso</span><span className="value">{e.resource_type}</span></div>
                                <div className="audit-item"><span className="label">ID recurso</span><span className="value mono" style={{ fontSize: 11 }}>{e.resource_id}</span></div>
                                <div className="audit-item"><span className="label">Timestamp</span><span className="value mono">{e.timestamp.replace('T', ' ')}</span></div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'stats' && (
          <div className="admin-stats-grid">
            <div className="kpi-card fade-up">
              <h4 className="kpi-title">Usuarios</h4>
              <div className="kpi-row"><span>Total</span><strong><CountUp to={MOCK_STATS.users.total} /></strong></div>
              <div className="kpi-row"><span>Administradores</span><strong>{MOCK_STATS.users.admins}</strong></div>
              <div className="kpi-row"><span>Médicos</span><strong>{MOCK_STATS.users.medicos}</strong></div>
              <div className="kpi-row"><span>Pacientes</span><strong>{MOCK_STATS.users.pacientes}</strong></div>
            </div>
            <div className="kpi-card fade-up" style={{ animationDelay: '60ms' }}>
              <h4 className="kpi-title">Pacientes</h4>
              <div className="kpi-row"><span>Total</span><strong><CountUp to={MOCK_STATS.patients.total} /></strong></div>
              <div className="kpi-row"><span>Activos</span><strong>{MOCK_STATS.patients.active}</strong></div>
            </div>
            <div className="kpi-card fade-up" style={{ animationDelay: '120ms' }}>
              <h4 className="kpi-title">Datos clínicos</h4>
              <div className="kpi-row"><span>Observaciones</span><strong><CountUp to={MOCK_STATS.observations.total} /></strong></div>
              <div className="kpi-row"><span>Reportes de riesgo</span><strong>{MOCK_STATS.risk_reports.total}</strong></div>
              <div className="kpi-row"><span>Pendientes firma</span><strong>{MOCK_STATS.risk_reports.pending_signature}</strong></div>
            </div>
            <div className="kpi-card fade-up" style={{ animationDelay: '180ms' }}>
              <h4 className="kpi-title">Auditoría</h4>
              <div className="kpi-row"><span>Entradas totales</span><strong><CountUp to={MOCK_STATS.audit_log.total_entries} /></strong></div>
            </div>
          </div>
        )}
      </div>

      <Modal open={showUserForm} onClose={() => setShowUserForm(false)} title={editingUser ? 'Editar usuario' : 'Nuevo usuario'}
        footer={<>
          <Button variant="secondary" onClick={() => setShowUserForm(false)}>Cancelar</Button>
          <Button variant="primary" onClick={submitUser}>{editingUser ? 'Guardar cambios' : 'Crear usuario'}</Button>
        </>}
      >
        <form onSubmit={submitUser} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-4)' }}>
          <Field label="Nombre completo" required>
            <input className="input" required value={userForm.full_name} onChange={(e) => setUserForm({ ...userForm, full_name: e.target.value })} />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--s-4)' }}>
            <Field label="Cédula" required>
              <input className="input" required value={userForm.identification_doc} onChange={(e) => setUserForm({ ...userForm, identification_doc: e.target.value })} />
            </Field>
            <Field label="Rol" required>
              <select className="select" value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}>
                <option value="admin">Administrador</option>
                <option value="medico">Médico</option>
                <option value="paciente">Paciente</option>
              </select>
            </Field>
          </div>
          {!editingUser && (
            <Field label="Email" required>
              <input type="email" className="input" required value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} />
            </Field>
          )}
          <Field label={editingUser ? 'Nueva contraseña (vacío para no cambiar)' : 'Contraseña'} required={!editingUser}>
            <input type="password" className="input" required={!editingUser} minLength={6} value={userForm.password}
              onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} />
          </Field>
        </form>
      </Modal>

      <Modal open={!!confirmDel} onClose={() => setConfirmDel(null)} title="Confirmar eliminación" size="sm"
        footer={<>
          <Button variant="secondary" onClick={() => setConfirmDel(null)}>Cancelar</Button>
          <Button variant="danger" onClick={() => { setUsers(us => us.filter(u => u.id !== confirmDel.id)); setConfirmDel(null); }}>Eliminar</Button>
        </>}
      >
        <p style={{ color: 'var(--ink-2)' }}>
          ¿Eliminar a <strong style={{ color: 'var(--ink)' }}>{confirmDel?.full_name}</strong>? Esta acción puede revertirse.
        </p>
      </Modal>
    </>
  );
}

const AUDIT_DESC = {
  'LOGIN': 'El usuario inició sesión en el sistema.',
  'LOGOUT': 'El usuario cerró sesión.',
  'CREATE_PATIENT': 'Se creó un nuevo paciente en el sistema.',
  'UPDATE_PATIENT': 'Se actualizaron los datos de un paciente.',
  'DELETE_PATIENT': 'Se eliminó (soft delete) un paciente.',
  'CREATE_OBSERVATION': 'Se registró una nueva observación clínica.',
  'UPDATE_OBSERVATION': 'Se modificó una observación existente.',
  'DELETE_OBSERVATION': 'Se eliminó una observación clínica.',
  'SIGN_REPORT': 'Un médico firmó un reporte de riesgo.',
  'CREATE_RISK_REPORT': 'Se generó un reporte de riesgo por inferencia.',
  'UPLOAD_IMAGE': 'Se subió una imagen médica al almacenamiento.',
  'DELETE_IMAGE': 'Se eliminó una imagen médica.',
  'CREATE_USER': 'Se creó una nueva cuenta de usuario.',
  'UPDATE_USER': 'Se actualizaron los datos de un usuario.',
  'DELETE_USER': 'Se eliminó una cuenta de usuario.',
  'INFERENCE_ML': 'Se ejecutó un análisis de Machine Learning.',
  'INFERENCE_DL': 'Se ejecutó un análisis de Deep Learning.',
  'ACCEPT_HABEAS_DATA': 'El usuario aceptó el consentimiento de Habeas Data.',
};

Object.assign(window, { PatientDetail, Admin });
