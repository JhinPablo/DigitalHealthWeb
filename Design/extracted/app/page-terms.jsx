// ───────────────────────────────────────────────────────────
// TERMS & CONDITIONS — Habeas Data / Ley 1581 de 2012
// ───────────────────────────────────────────────────────────

const TERMS_SECTIONS = [
  { id: 'introduccion',    num: '01', title: 'Introducción y aceptación' },
  { id: 'marco-legal',     num: '02', title: 'Marco legal colombiano' },
  { id: 'datos-tratados',  num: '03', title: 'Datos personales tratados' },
  { id: 'finalidades',     num: '04', title: 'Finalidades del tratamiento' },
  { id: 'derechos',        num: '05', title: 'Derechos del titular' },
  { id: 'seguridad',       num: '06', title: 'Medidas de seguridad' },
  { id: 'transferencias',  num: '07', title: 'Transferencia y transmisión' },
  { id: 'responsable',     num: '08', title: 'Responsable del tratamiento' },
  { id: 'vigencia',        num: '09', title: 'Vigencia y modificaciones' },
];

function useActiveSection(ids) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-100px 0px -60% 0px', threshold: [0, 0.1] }
    );
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [ids.join(',')]);
  return active;
}

function Terms({ onAccept, onBack, fromLogin }) {
  const [accepted, setAccepted] = useState(false);
  const active = useActiveSection(TERMS_SECTIONS.map(s => s.id));

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="terms-page">
      {/* TOP BAR */}
      <div className="terms-topbar">
        <div className="terms-topbar-inner">
          <div className="brand" onClick={onBack} style={{ cursor: 'pointer' }}>
            <div className="brand-mark">S</div>
            <div className="brand-wordmark">
              <span className="brand-name">Salud Digital</span>
              <span className="brand-sub">Historia Clínica FHIR</span>
            </div>
          </div>
          {!fromLogin && (
            <Button variant="ghost" size="sm" icon={<Icon name="arrowLeft" size={14} />} onClick={onBack}>
              Volver
            </Button>
          )}
        </div>
      </div>

      {/* HERO */}
      <div className="terms-hero">
        <div className="terms-eyebrow">
          <Icon name="shield" size={14} />
          Tratamiento de Datos Personales
        </div>
        <h1 className="terms-title">
          Política de <em>Habeas Data</em> y términos del servicio
        </h1>
        <p style={{ fontSize: '17px', color: 'var(--ink-2)', maxWidth: 720, lineHeight: 1.6 }}>
          Salud Digital trata datos personales sensibles de salud de acuerdo con la Constitución
          Política de Colombia (artículo 15), la Ley Estatutaria 1581 de 2012 y el Decreto Reglamentario 1377 de 2013.
          Este documento describe cómo recolectamos, usamos, protegemos y compartimos tu información.
        </p>
        <div className="terms-meta">
          <div className="terms-meta-item">
            <span className="terms-meta-label">Última actualización</span>
            <span className="terms-meta-value">26 de mayo de 2026</span>
          </div>
          <div className="terms-meta-item">
            <span className="terms-meta-label">Versión</span>
            <span className="terms-meta-value">v3.2 · Vigente</span>
          </div>
          <div className="terms-meta-item">
            <span className="terms-meta-label">Jurisdicción</span>
            <span className="terms-meta-value">República de Colombia</span>
          </div>
          <div className="terms-meta-item">
            <span className="terms-meta-label">Tiempo estimado de lectura</span>
            <span className="terms-meta-value">≈ 12 minutos</span>
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className="terms-body">
        {/* TOC */}
        <aside className="terms-toc">
          <div className="terms-toc-title">Contenido</div>
          {TERMS_SECTIONS.map(s => (
            <button
              key={s.id}
              className={`terms-toc-link ${active === s.id ? 'active' : ''}`}
              onClick={() => scrollTo(s.id)}
            >
              {s.num} · {s.title}
            </button>
          ))}
        </aside>

        {/* CONTENT */}
        <article className="terms-content">
          <section className="terms-section" id="introduccion">
            <span className="terms-section-num">01 · Introducción</span>
            <h2>Aceptación de los términos y políticas</h2>
            <p>
              Bienvenido a <strong>Salud Digital</strong>, una plataforma de gestión de historia clínica electrónica
              basada en el estándar HL7 FHIR R4, operada por <strong>Salud Digital S.A.S.</strong> (en adelante,
              «la Plataforma» o «el Responsable»).
            </p>
            <p>
              Al acceder, registrarte o utilizar esta plataforma, aceptas voluntaria, expresa, informada e
              inequívocamente esta Política de Tratamiento de Datos Personales y Habeas Data. Si actúas en
              representación de una entidad prestadora de servicios de salud (IPS, EPS, clínica u hospital),
              declaras tener facultades suficientes para vincular a dicha entidad a estos términos.
            </p>
            <div className="terms-callout">
              <div className="terms-callout-title">
                <Icon name="alert" size={16} style={{ color: 'var(--sage)' }} />
                Lectura indispensable
              </div>
              <p>
                Si <strong>no estás de acuerdo</strong> con cualquier disposición de esta política, debes
                abstenerte de usar la Plataforma. La aceptación es condición necesaria para el ingreso al sistema.
              </p>
            </div>
          </section>

          <section className="terms-section" id="marco-legal">
            <span className="terms-section-num">02 · Marco legal</span>
            <h2>Normativa colombiana aplicable</h2>
            <p>
              El tratamiento de datos personales realizado por Salud Digital se rige por las siguientes normas
              de la legislación colombiana:
            </p>
            <ul>
              <li>
                <strong>Constitución Política de Colombia (1991), Artículo 15</strong> — Reconoce el derecho fundamental
                a la intimidad personal y familiar, y el habeas data como derecho de toda persona a conocer, actualizar
                y rectificar la información recogida sobre ella.
              </li>
              <li>
                <strong>Ley Estatutaria 1581 de 2012</strong> — «Por la cual se dictan disposiciones generales para
                la protección de datos personales». Norma marco que regula el tratamiento de datos en Colombia.
              </li>
              <li>
                <strong>Decreto Reglamentario 1377 de 2013</strong> — Reglamenta parcialmente la Ley 1581, define las
                categorías de datos sensibles (incluidos los datos de salud) y establece los procedimientos para
                obtener autorización del titular.
              </li>
              <li>
                <strong>Decreto Único Reglamentario 1074 de 2015</strong> — Compila las disposiciones en materia de
                protección de datos.
              </li>
              <li>
                <strong>Circular Externa 002 de 2015 (SIC)</strong> — Establece la obligación de inscripción ante el
                Registro Nacional de Bases de Datos (RNBD).
              </li>
              <li>
                <strong>Resolución 1995 de 1999 (Ministerio de Salud)</strong> — Por la cual se establecen normas para
                el manejo de la Historia Clínica.
              </li>
              <li>
                <strong>Ley 23 de 1981</strong> y <strong>Ley 1438 de 2011</strong> — Ética médica y reforma del Sistema
                General de Seguridad Social en Salud.
              </li>
            </ul>
          </section>

          <section className="terms-section" id="datos-tratados">
            <span className="terms-section-num">03 · Datos tratados</span>
            <h2>Categorías de datos personales recolectados</h2>
            <p>
              De conformidad con el artículo 5 de la Ley 1581 de 2012, los datos personales que trata Salud Digital
              se clasifican así:
            </p>
            <table className="terms-table">
              <thead>
                <tr>
                  <th>Categoría</th>
                  <th>Datos específicos</th>
                  <th>Naturaleza</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Identificación</strong></td>
                  <td>Nombre, cédula, fecha de nacimiento, género</td>
                  <td>Semiprivado</td>
                </tr>
                <tr>
                  <td><strong>Contacto</strong></td>
                  <td>Correo electrónico institucional, teléfono</td>
                  <td>Semiprivado</td>
                </tr>
                <tr>
                  <td><strong>Datos de salud</strong></td>
                  <td>Observaciones clínicas (LOINC), imágenes médicas, diagnósticos, resúmenes médicos</td>
                  <td><span style={{ color: 'var(--clay)', fontWeight: 500 }}>Sensible</span></td>
                </tr>
                <tr>
                  <td><strong>Reportes de riesgo</strong></td>
                  <td>Scores ML/DL, categorías de riesgo, firmas digitales</td>
                  <td><span style={{ color: 'var(--clay)', fontWeight: 500 }}>Sensible</span></td>
                </tr>
                <tr>
                  <td><strong>Autenticación</strong></td>
                  <td>Hashes bcrypt de contraseña, tokens JWT, registros de acceso</td>
                  <td>Privado</td>
                </tr>
                <tr>
                  <td><strong>Auditoría</strong></td>
                  <td>Logs de acción, IP de origen, timestamp, recursos accedidos</td>
                  <td>Privado</td>
                </tr>
              </tbody>
            </table>
            <p>
              Los <strong>datos sensibles</strong> son aquellos que afectan la intimidad del titular o cuyo uso indebido
              puede generar discriminación. Su tratamiento está expresamente prohibido salvo cuando el titular ha
              otorgado autorización explícita, como ocurre al aceptar esta política.
            </p>
          </section>

          <section className="terms-section" id="finalidades">
            <span className="terms-section-num">04 · Finalidades</span>
            <h2>Finalidades del tratamiento</h2>
            <p>
              Los datos personales serán tratados exclusivamente para las siguientes finalidades, todas relacionadas
              con la prestación del servicio de gestión clínica:
            </p>
            <ul>
              <li>Crear, almacenar, actualizar y consultar la historia clínica electrónica del paciente.</li>
              <li>Permitir al equipo médico el seguimiento longitudinal de signos vitales y biomarcadores.</li>
              <li>Generar reportes de riesgo mediante modelos de Machine Learning y Deep Learning, con explicabilidad
                  por feature (SHAP) y mapas de atención visual (Grad-CAM).</li>
              <li>Soportar la firma digital de reportes clínicos por parte del médico tratante.</li>
              <li>Cumplir obligaciones legales del Sistema General de Seguridad Social en Salud.</li>
              <li>Mantener registros de auditoría inmutables para trazabilidad de acceso a datos sensibles.</li>
              <li>Investigación clínica en datos <strong>anonimizados</strong>, previa aprobación de comité de ética.</li>
              <li>Mejora del servicio, métricas técnicas y prevención de fraude o usos indebidos.</li>
            </ul>
            <div className="terms-quote">
              «Los datos sensibles de salud no serán comercializados, ni cedidos a terceros con fines publicitarios,
              ni utilizados para fines distintos a los aquí descritos.»
            </div>
          </section>

          <section className="terms-section" id="derechos">
            <span className="terms-section-num">05 · Derechos</span>
            <h2>Derechos del titular de los datos</h2>
            <p>
              Como titular de tus datos personales, en virtud del artículo 8 de la Ley 1581 de 2012, tienes los
              siguientes derechos, ejercibles en cualquier momento y de forma gratuita:
            </p>
            <h3>Derechos sustantivos</h3>
            <ul>
              <li><strong>Conocer</strong> los datos que la Plataforma trata sobre ti y solicitar copia de los mismos.</li>
              <li><strong>Actualizar</strong> y <strong>rectificar</strong> los datos que sean inexactos, incompletos o desactualizados.</li>
              <li><strong>Solicitar prueba</strong> de la autorización otorgada al Responsable.</li>
              <li>Ser <strong>informado</strong> sobre el uso que se ha dado a tus datos previa solicitud.</li>
              <li>Presentar <strong>quejas</strong> ante la Superintendencia de Industria y Comercio (SIC).</li>
              <li><strong>Revocar</strong> la autorización y/o solicitar la <strong>supresión</strong> del dato, salvo cuando exista deber legal o contractual de permanecer en la base.</li>
              <li>Acceder de forma <strong>gratuita</strong> a tus datos, al menos una vez por mes calendario.</li>
            </ul>
            <h3>Procedimiento para ejercer los derechos</h3>
            <p>
              Para ejercer cualquiera de los derechos anteriores, el titular o sus causahabientes pueden enviar
              una solicitud al correo <a href="mailto:habeasdata@saluddigital.co">habeasdata@saluddigital.co</a> con
              la siguiente información:
            </p>
            <ul>
              <li>Identificación del titular (cédula, nombre completo).</li>
              <li>Descripción clara de los hechos que dan lugar al reclamo.</li>
              <li>Datos de contacto para recibir respuesta.</li>
              <li>Documentos que sustenten la petición, si aplica.</li>
            </ul>
            <p>
              El Responsable dará respuesta en un plazo máximo de <strong>15 días hábiles</strong> contados desde
              la recepción del reclamo. En caso de reclamos por consulta de información, el plazo será de
              <strong> 10 días hábiles</strong>.
            </p>
          </section>

          <section className="terms-section" id="seguridad">
            <span className="terms-section-num">06 · Seguridad</span>
            <h2>Medidas técnicas, humanas y administrativas</h2>
            <p>
              Salud Digital implementa controles de seguridad para proteger la confidencialidad, integridad y
              disponibilidad de los datos personales conforme a las mejores prácticas de la industria y los
              estándares ISO/IEC 27001 e ISO/IEC 27799 (gestión de seguridad en informática de la salud).
            </p>
            <h3>Controles técnicos</h3>
            <ul>
              <li>Cifrado <strong>AES-256</strong> de datos en reposo y <strong>TLS 1.3</strong> en tránsito.</li>
              <li>Hashing de contraseñas con <strong>bcrypt</strong> (cost factor 12).</li>
              <li>Autenticación con tokens JWT firmados, doble API-Key (acceso + permiso por rol).</li>
              <li>Backups cifrados con retención mínima de 6 meses y disaster recovery probado trimestralmente.</li>
              <li>Pre-signed URLs con expiración corta para acceso a imágenes médicas en MinIO.</li>
              <li>Logging inmutable de auditoría con timestamp criptográfico.</li>
              <li>Aislamiento por entornos (dev, staging, prod) con segregación de credenciales.</li>
              <li>Pentests semestrales y bug bounty privado.</li>
            </ul>
            <h3>Controles humanos y administrativos</h3>
            <ul>
              <li>Política de control de acceso por roles (RBAC): admin, médico, paciente.</li>
              <li>Capacitación obligatoria en protección de datos para todo el personal con acceso.</li>
              <li>Acuerdos de confidencialidad firmados con empleados, contratistas y proveedores cloud.</li>
              <li>Designación de un <strong>Oficial de Protección de Datos (DPO)</strong>.</li>
              <li>Notificación de incidentes a la SIC dentro de las <strong>15 horas</strong> siguientes a su detección.</li>
            </ul>
          </section>

          <section className="terms-section" id="transferencias">
            <span className="terms-section-num">07 · Transferencias</span>
            <h2>Transferencia y transmisión de datos</h2>
            <p>
              Los datos personales pueden ser transmitidos a terceros únicamente cuando exista:
            </p>
            <ul>
              <li>Autorización previa, expresa e informada del titular.</li>
              <li>Necesidad legal o contractual (por ejemplo, requerimientos de la EPS o entidades de control).</li>
              <li>Orden judicial o administrativa de autoridad competente.</li>
              <li>Servicios cloud necesarios para la operación, con cláusulas contractuales de protección de datos
                  conformes al artículo 26 de la Ley 1581.</li>
            </ul>
            <p>
              Las <strong>transferencias internacionales</strong> únicamente se realizan a países que ofrezcan
              niveles adecuados de protección, según el listado emitido por la SIC. Si el país receptor no cuenta
              con esta calificación, se solicitará autorización específica al titular.
            </p>
          </section>

          <section className="terms-section" id="responsable">
            <span className="terms-section-num">08 · Responsable</span>
            <h2>Responsable y encargado del tratamiento</h2>
            <table className="terms-table">
              <tbody>
                <tr>
                  <td><strong>Razón social</strong></td>
                  <td>Salud Digital S.A.S.</td>
                </tr>
                <tr>
                  <td><strong>NIT</strong></td>
                  <td>901.234.567-8</td>
                </tr>
                <tr>
                  <td><strong>Dirección</strong></td>
                  <td>Cra. 11 # 93-46, Of. 502, Bogotá D.C., Colombia</td>
                </tr>
                <tr>
                  <td><strong>Correo de Habeas Data</strong></td>
                  <td><a href="mailto:habeasdata@saluddigital.co">habeasdata@saluddigital.co</a></td>
                </tr>
                <tr>
                  <td><strong>Oficial de Protección de Datos</strong></td>
                  <td>Dr. Andrés Felipe Quintero · <a href="mailto:dpo@saluddigital.co">dpo@saluddigital.co</a></td>
                </tr>
                <tr>
                  <td><strong>Línea de atención</strong></td>
                  <td>+57 (601) 555 1234 · lunes a viernes, 7am – 7pm</td>
                </tr>
                <tr>
                  <td><strong>Registro RNBD</strong></td>
                  <td>Inscrito ante la Superintendencia de Industria y Comercio</td>
                </tr>
              </tbody>
            </table>
            <p>
              Toda solicitud de habeas data, queja, reclamo o pregunta relacionada con el tratamiento de tus datos
              debe dirigirse al correo electrónico institucional <strong>habeasdata@saluddigital.co</strong> o
              a la línea de atención al cliente.
            </p>
          </section>

          <section className="terms-section" id="vigencia">
            <span className="terms-section-num">09 · Vigencia</span>
            <h2>Vigencia y modificaciones</h2>
            <p>
              La presente política rige a partir del <strong>26 de mayo de 2026</strong> y permanece vigente mientras
              exista relación contractual entre el titular y Salud Digital, y hasta que el titular ejerza su derecho
              de supresión o revocación.
            </p>
            <p>
              Los datos personales tratados serán conservados durante el tiempo establecido por la
              <strong> Resolución 1995 de 1999 </strong> para la historia clínica (mínimo 20 años a partir de la última
              atención) o el tiempo necesario para cumplir obligaciones legales, contables y de auditoría.
            </p>
            <h3>Modificaciones a la política</h3>
            <p>
              Salud Digital se reserva el derecho de modificar esta política en cualquier momento. Las modificaciones
              sustanciales serán comunicadas al titular con al menos <strong>15 días calendario</strong> de antelación
              a través del correo registrado o mediante notificación al iniciar sesión en la Plataforma. La
              continuación del uso del servicio constituye aceptación tácita de las modificaciones.
            </p>
            <div className="terms-callout">
              <div className="terms-callout-title">
                <Icon name="shield" size={16} style={{ color: 'var(--sage)' }} />
                Compromiso editorial
              </div>
              <p>
                Mantenemos un histórico público de versiones de esta política. Puedes consultar versiones anteriores
                escribiendo a habeasdata@saluddigital.co.
              </p>
            </div>
          </section>
        </article>
      </div>

      {/* Footer actions */}
      <div className="terms-footer-actions">
        <div className="terms-footer-actions-inner">
          <label className="terms-check">
            <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} />
            <span className="terms-check-box" />
            <span>
              He leído y acepto la Política de Tratamiento de Datos Personales y Habeas Data conforme a la
              Ley 1581 de 2012 y el Decreto 1377 de 2013. Autorizo el tratamiento de mis datos sensibles de salud.
            </span>
          </label>
          <div style={{ display: 'flex', gap: 'var(--s-3)' }}>
            <Button variant="secondary" onClick={onBack}>Cancelar</Button>
            <Button variant="primary" onClick={onAccept} disabled={!accepted}>
              Acepto y continuo <Icon name="arrowRight" size={14} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Terms });
