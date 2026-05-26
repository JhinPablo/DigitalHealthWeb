// ───────────────────────────────────────────────────────────
// LANDING PAGE — pública, antes del login
// ───────────────────────────────────────────────────────────

function LandingNav({ onLogin, onTerms }) {
  const scrolled = useScrolled(4);
  return (
    <nav className={`landing-nav ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="landing-nav-inner">
        <div className="brand">
          <div className="brand-mark">S</div>
          <div className="brand-wordmark">
            <span className="brand-name">Salud Digital</span>
            <span className="brand-sub">Historia Clínica FHIR</span>
          </div>
        </div>
        <div className="landing-nav-links">
          <a href="#caracteristicas" className="landing-nav-link">Características</a>
          <a href="#flujo" className="landing-nav-link">Flujo clínico</a>
          <a href="#seguridad" className="landing-nav-link">Seguridad</a>
          <button className="landing-nav-link" onClick={onTerms}>Habeas Data</button>
          <Button variant="ghost" size="sm" onClick={onLogin}>Iniciar sesión</Button>
          <Button variant="primary" size="sm" onClick={onLogin} iconRight={<Icon name="arrowRight" size={12} />}>Acceder</Button>
        </div>
      </div>
    </nav>
  );
}

function Landing({ onLogin, onTerms }) {
  return (
    <div className="landing">
      <LandingNav onLogin={onLogin} onTerms={onTerms} />

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-inner">
          <div className="hero-left fade-up">
            <div className="hero-eyebrow">
              <span className="hero-eyebrow-dot" />
              Plataforma certificada HL7 FHIR R4
            </div>
            <h1 className="hero-title">
              Una historia clínica <em>diseñada</em> para cuidar.
            </h1>
            <p className="hero-sub">
              Plataforma integral para la gestión clínica de pacientes, observaciones biométricas y reportes de riesgo
              con inferencia ML/DL explicable. Construida sobre estándares HL7 FHIR y cumplimiento total con la
              Ley 1581 de 2012.
            </p>
            <div className="hero-cta-row">
              <Button variant="primary" size="lg" onClick={onLogin} iconRight={<Icon name="arrowRight" size={14} />}>
                Iniciar sesión
              </Button>
              <Button variant="secondary" size="lg" onClick={onTerms}>
                Conocer Habeas Data
              </Button>
            </div>
            <div className="hero-trust">
              <div className="hero-trust-item"><Icon name="shield" size={14} /> <span><strong>AES-256</strong> en reposo y tránsito</span></div>
              <div className="hero-trust-item"><Icon name="check" size={14} /> <span><strong>Auditoría</strong> inmutable</span></div>
              <div className="hero-trust-item"><Icon name="sparkle" size={14} /> <span><strong>SHAP & Grad-CAM</strong></span></div>
            </div>
          </div>

          {/* Mock dashboard preview */}
          <div className="hero-right fade-up" style={{ animationDelay: '120ms' }}>
            <div className="hero-mock">
              <div className="hero-mock-bar"><span /><span /><span /></div>
              <div className="hero-mock-stat">
                <div>
                  <div className="hero-mock-stat-label">Pacientes activos</div>
                </div>
                <div className="hero-mock-stat-value">1,284</div>
              </div>
              <div className="hero-mock-stat">
                <div>
                  <div className="hero-mock-stat-label">Reportes firmados</div>
                </div>
                <div className="hero-mock-stat-value">86</div>
              </div>
              <div className="hero-mock-chart">
                <div className="hero-mock-chart-title">Tendencia glucosa · últimos 30 días</div>
                <div className="hero-mock-line" />
              </div>
              <div className="hero-mock-floating">
                <span className="hero-mock-floating-pulse" />
                Inferencia ML · 89% precisión
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="land-section" id="caracteristicas">
        <div className="land-section-inner">
          <div className="land-section-eyebrow">Capacidades</div>
          <h2 className="land-section-title">
            Todo lo que tu equipo clínico necesita, <em>en un solo lugar</em>.
          </h2>
          <div className="features-grid">
            {[
              { icon: 'users',     iconClass: 'sage', title: 'Gestión integral de pacientes',
                desc: 'CRUD completo con asignación de médico tratante, historial clínico, búsqueda por cédula y control de roles granular (admin, médico, paciente).' },
              { icon: 'pulse',     iconClass: 'gold', title: 'Observaciones LOINC',
                desc: 'Captura de signos vitales codificados con LOINC: glucosa, presión arterial, BMI, insulina, temperatura y frecuencia cardíaca con detección de outliers.' },
              { icon: 'brain',     iconClass: 'indigo', title: 'Inferencia ML explicable',
                desc: 'Modelos tabulares ONNX para predicción de riesgo de diabetes con valores SHAP que muestran qué features incrementan o reducen el riesgo.' },
              { icon: 'eye',       iconClass: 'gold', title: 'Análisis DL con Grad-CAM',
                desc: 'Redes neuronales para detección de retinopatía diabética en imágenes de fondo de ojo. Mapas Grad-CAM superpuestos para interpretar el modelo.' },
              { icon: 'signature', iconClass: 'sage', title: 'Firma digital de reportes',
                desc: 'Workflow de aceptación/rechazo de reportes de riesgo con notas clínicas obligatorias y justificación auditada. Cumple con buenas prácticas FHIR.' },
              { icon: 'shield',    iconClass: 'clay', title: 'Cumplimiento Habeas Data',
                desc: 'Ley 1581 de 2012 y Decreto 1377 de 2013. Cifrado AES-256, auditoría inmutable, derechos del titular y consentimiento informado.' },
            ].map((f, i) => (
              <div key={f.title} className="feature-card fade-up" style={{ animationDelay: `${i * 60}ms` }}>
                <div className={`feature-icon ${f.iconClass}`}><Icon name={f.icon} size={22} /></div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS strip */}
      <section className="land-stats land-section">
        <div className="land-section-inner">
          <div className="stats-row">
            <div className="stats-cell"><div className="stats-num">99.99<em>%</em></div><div className="stats-label">Uptime SLA</div></div>
            <div className="stats-cell"><div className="stats-num">256<em>-bit</em></div><div className="stats-label">Cifrado AES</div></div>
            <div className="stats-cell"><div className="stats-num">&lt; 200<em>ms</em></div><div className="stats-label">Latencia P95</div></div>
            <div className="stats-cell"><div className="stats-num">100<em>%</em></div><div className="stats-label">Habeas Data</div></div>
          </div>
        </div>
      </section>

      {/* WORKFLOW */}
      <section className="land-section" id="flujo">
        <div className="land-section-inner">
          <div className="land-section-eyebrow">Flujo clínico</div>
          <h2 className="land-section-title">
            Del registro a la firma, <em>sin fricción</em>.
          </h2>
          <div className="workflow-grid">
            <div className="workflow-step fade-up">
              <div className="workflow-num">1</div>
              <h4 className="workflow-title">Registra observaciones</h4>
              <p className="workflow-desc">El equipo médico captura signos vitales con códigos LOINC. La plataforma detecta automáticamente outliers.</p>
            </div>
            <div className="workflow-step fade-up" style={{ animationDelay: '120ms' }}>
              <div className="workflow-num">2</div>
              <h4 className="workflow-title">Ejecuta inferencia</h4>
              <p className="workflow-desc">Modelos ML y DL evalúan riesgo de diabetes y retinopatía. Cada predicción incluye explicabilidad por feature.</p>
            </div>
            <div className="workflow-step fade-up" style={{ animationDelay: '240ms' }}>
              <div className="workflow-num">3</div>
              <h4 className="workflow-title">Firma y audita</h4>
              <p className="workflow-desc">El médico valida el reporte con sus notas clínicas. Cada acción se audita de forma inmutable.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="land-cta" id="seguridad">
        <div className="land-cta-inner">
          <h2>Construida con la <em>precisión</em> que la salud exige.</h2>
          <p>Cifrado AES-256, auditoría inmutable, cumplimiento total con Ley 1581/2012 y Decreto 1377/2013.</p>
          <div style={{ display: 'flex', gap: 'var(--s-3)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button variant="secondary" size="lg" onClick={onLogin} iconRight={<Icon name="arrowRight" size={14} />}>Acceder a la plataforma</Button>
            <Button variant="ghost" size="lg" onClick={onTerms} style={{ color: '#F5F2EA' }}>Política de tratamiento de datos</Button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="land-footer">
        <div className="land-footer-inner">
          <div>
            <div className="land-footer-brand">
              <div className="brand-mark">S</div>
              <div className="brand-wordmark">
                <span className="brand-name">Salud Digital</span>
                <span className="brand-sub">Historia Clínica FHIR</span>
              </div>
            </div>
            <p className="land-footer-tagline">
              Plataforma de gestión clínica con inferencia explicable. Construida para equipos médicos que priorizan la precisión, la seguridad y la dignidad del paciente.
            </p>
          </div>
          <div className="land-footer-col">
            <h5>Producto</h5>
            <a href="#caracteristicas">Características</a>
            <a href="#flujo">Flujo clínico</a>
            <a href="#seguridad">Seguridad</a>
            <button onClick={onLogin}>Iniciar sesión</button>
          </div>
          <div className="land-footer-col">
            <h5>Legal</h5>
            <button onClick={onTerms}>Habeas Data</button>
            <button onClick={onTerms}>Política de privacidad</button>
            <button onClick={onTerms}>Ley 1581 de 2012</button>
            <button onClick={onTerms}>Decreto 1377 de 2013</button>
          </div>
          <div className="land-footer-col">
            <h5>Contacto</h5>
            <a href="mailto:contacto@saluddigital.co">contacto@saluddigital.co</a>
            <a href="tel:+576015551234">+57 (601) 555 1234</a>
            <span style={{ fontSize: 'var(--t-sm)', color: 'var(--ink-3)' }}>Bogotá, Colombia</span>
          </div>
        </div>
        <div className="land-footer-bottom">
          <span>© 2026 Salud Digital · Todos los derechos reservados</span>
          <span>HL7 FHIR R4 · LOINC · ISO 27001</span>
        </div>
      </footer>
    </div>
  );
}

Object.assign(window, { Landing });
