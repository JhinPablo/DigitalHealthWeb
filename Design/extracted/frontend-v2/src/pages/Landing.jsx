// pages/Landing.jsx — Página pública premium
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Landing.css';

const Ic = {
  shield: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  check: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  sparkle: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3z"/></svg>,
  arrowRight: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>,
  users: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/></svg>,
  pulse: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>,
  brain: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.04Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.04Z"/></svg>,
  eye: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  signature: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 17s2-2 5-2 5 2 8 2 5-2 5-2"/><path d="M3 21h18"/><path d="M5 13c.4-2 1.5-7 4-7s2 4 4 4 1-3 3-3 4 3 4 3"/></svg>,
  shieldBig: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
};

export default function Landing() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="landing">
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
            <button className="landing-nav-link" onClick={() => navigate('/terms')}>Habeas Data</button>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/login')}>Iniciar sesión</button>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/login')}>
              Acceder {Ic.arrowRight}
            </button>
          </div>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-inner">
          <div className="hero-left animate-fade-in">
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
              <button className="btn btn-primary btn-lg" onClick={() => navigate('/login')}>
                Iniciar sesión {Ic.arrowRight}
              </button>
              <button className="btn btn-secondary btn-lg" onClick={() => navigate('/terms')}>
                Conocer Habeas Data
              </button>
            </div>
            <div className="hero-trust">
              <div className="hero-trust-item">{Ic.shield} <span><strong>AES-256</strong> en reposo y tránsito</span></div>
              <div className="hero-trust-item">{Ic.check} <span><strong>Auditoría</strong> inmutable</span></div>
              <div className="hero-trust-item">{Ic.sparkle} <span><strong>SHAP & Grad-CAM</strong></span></div>
            </div>
          </div>

          <div className="hero-right animate-fade-in" style={{ animationDelay: '120ms' }}>
            <div className="hero-mock">
              <div className="hero-mock-bar"><span /><span /><span /></div>
              <div className="hero-mock-stat">
                <div><div className="hero-mock-stat-label">Pacientes activos</div></div>
                <div className="hero-mock-stat-value">1,284</div>
              </div>
              <div className="hero-mock-stat">
                <div><div className="hero-mock-stat-label">Reportes firmados</div></div>
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

      <section className="land-section" id="caracteristicas">
        <div className="land-section-inner">
          <div className="land-section-eyebrow">Capacidades</div>
          <h2 className="land-section-title">
            Todo lo que tu equipo clínico necesita, <em>en un solo lugar</em>.
          </h2>
          <div className="features-grid">
            {[
              { icon: Ic.users,     iconClass: 'sage',   title: 'Gestión integral de pacientes', desc: 'CRUD completo con asignación de médico tratante, historial clínico, búsqueda por cédula y control de roles granular (admin, médico, paciente).' },
              { icon: Ic.pulse,     iconClass: 'gold',   title: 'Observaciones LOINC',           desc: 'Captura de signos vitales codificados con LOINC: glucosa, presión arterial, BMI, insulina, temperatura y frecuencia cardíaca con detección de outliers.' },
              { icon: Ic.brain,     iconClass: 'indigo', title: 'Inferencia ML explicable',      desc: 'Modelos tabulares ONNX para predicción de riesgo de diabetes con valores SHAP que muestran qué features incrementan o reducen el riesgo.' },
              { icon: Ic.eye,       iconClass: 'gold',   title: 'Análisis DL con Grad-CAM',       desc: 'Redes neuronales para detección de retinopatía diabética en imágenes de fondo de ojo. Mapas Grad-CAM superpuestos para interpretar el modelo.' },
              { icon: Ic.signature, iconClass: 'sage',   title: 'Firma digital de reportes',     desc: 'Workflow de aceptación/rechazo de reportes de riesgo con notas clínicas obligatorias y justificación auditada. Cumple con buenas prácticas FHIR.' },
              { icon: Ic.shieldBig, iconClass: 'clay',   title: 'Cumplimiento Habeas Data',      desc: 'Ley 1581 de 2012 y Decreto 1377 de 2013. Cifrado AES-256, auditoría inmutable, derechos del titular y consentimiento informado.' },
            ].map((f, i) => (
              <div key={f.title} className="feature-card animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
                <div className={`feature-icon ${f.iconClass}`}>{f.icon}</div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

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

      <section className="land-section" id="flujo">
        <div className="land-section-inner">
          <div className="land-section-eyebrow">Flujo clínico</div>
          <h2 className="land-section-title">
            Del registro a la firma, <em>sin fricción</em>.
          </h2>
          <div className="workflow-grid">
            <div className="workflow-step animate-fade-in">
              <div className="workflow-num">1</div>
              <h4 className="workflow-title">Registra observaciones</h4>
              <p className="workflow-desc">El equipo médico captura signos vitales con códigos LOINC. La plataforma detecta automáticamente outliers.</p>
            </div>
            <div className="workflow-step animate-fade-in" style={{ animationDelay: '120ms' }}>
              <div className="workflow-num">2</div>
              <h4 className="workflow-title">Ejecuta inferencia</h4>
              <p className="workflow-desc">Modelos ML y DL evalúan riesgo de diabetes y retinopatía. Cada predicción incluye explicabilidad por feature.</p>
            </div>
            <div className="workflow-step animate-fade-in" style={{ animationDelay: '240ms' }}>
              <div className="workflow-num">3</div>
              <h4 className="workflow-title">Firma y audita</h4>
              <p className="workflow-desc">El médico valida el reporte con sus notas clínicas. Cada acción se audita de forma inmutable.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="land-cta" id="seguridad">
        <div className="land-cta-inner">
          <h2>Construida con la <em>precisión</em> que la salud exige.</h2>
          <p>Cifrado AES-256, auditoría inmutable, cumplimiento total con Ley 1581/2012 y Decreto 1377/2013.</p>
          <div style={{ display: 'flex', gap: 'var(--s-3)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-secondary btn-lg" onClick={() => navigate('/login')}>
              Acceder a la plataforma {Ic.arrowRight}
            </button>
            <button className="btn btn-ghost btn-lg" style={{ color: '#F5F2EA' }} onClick={() => navigate('/terms')}>
              Política de tratamiento de datos
            </button>
          </div>
        </div>
      </section>

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
            <button onClick={() => navigate('/login')}>Iniciar sesión</button>
          </div>
          <div className="land-footer-col">
            <h5>Legal</h5>
            <button onClick={() => navigate('/terms')}>Habeas Data</button>
            <button onClick={() => navigate('/terms')}>Política de privacidad</button>
            <button onClick={() => navigate('/terms')}>Ley 1581 de 2012</button>
            <button onClick={() => navigate('/terms')}>Decreto 1377 de 2013</button>
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
