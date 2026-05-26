// ───────────────────────────────────────────────────────────
// Datos mock para la vista previa
// ───────────────────────────────────────────────────────────

const MOCK_USER = {
  id: 'u-1', email: 'maria.rincon@clinica.com',
  full_name: 'María Rincón', role: 'admin',
  habeas_data_accepted: true,
};

const MOCK_DOCTORS = [
  { id: 'd-1', full_name: 'Dr. Andrés Cardona', email: 'andres.cardona@clinica.com' },
  { id: 'd-2', full_name: 'Dra. Lucía Bermúdez', email: 'lucia.bermudez@clinica.com' },
  { id: 'd-3', full_name: 'Dr. Felipe Ochoa',   email: 'felipe.ochoa@clinica.com' },
];

const MOCK_PATIENTS = [
  { id: 'p-001', name: 'Camila Restrepo Vargas', gender: 'female', birth_date: '1988-03-14', identification_doc: '1013456789', medical_summary: 'Diabetes tipo 2 controlada. Hipertensión leve.', assigned_doctor_id: 'd-1', assigned_doctor_name: 'Dr. Andrés Cardona', status: 'active', created_at: '2024-08-12T10:30:00' },
  { id: 'p-002', name: 'Jorge Hernández Murcia', gender: 'male',   birth_date: '1962-11-02', identification_doc: '79854231',   medical_summary: 'Insuficiencia cardíaca. Marcapasos.',           assigned_doctor_id: 'd-2', assigned_doctor_name: 'Dra. Lucía Bermúdez', status: 'active', created_at: '2025-01-05T08:15:00' },
  { id: 'p-003', name: 'Valentina Ospina León',  gender: 'female', birth_date: '1995-07-23', identification_doc: '1075123456', medical_summary: 'Embarazo de alto riesgo, semana 28.',         assigned_doctor_id: 'd-1', assigned_doctor_name: 'Dr. Andrés Cardona',  status: 'active', created_at: '2025-03-20T14:00:00' },
  { id: 'p-004', name: 'Sebastián Mora Téllez',  gender: 'male',   birth_date: '1979-05-18', identification_doc: '1019998877', medical_summary: 'Diabetes tipo 1, control glucémico variable.', assigned_doctor_id: 'd-3', assigned_doctor_name: 'Dr. Felipe Ochoa',     status: 'active', created_at: '2024-12-01T09:45:00' },
  { id: 'p-005', name: 'Isabella Quintero Ruiz', gender: 'female', birth_date: '2001-09-30', identification_doc: '1028345671', medical_summary: 'Asma moderada persistente.',                  assigned_doctor_id: 'd-2', assigned_doctor_name: 'Dra. Lucía Bermúdez', status: 'active', created_at: '2025-05-08T11:20:00' },
  { id: 'p-006', name: 'Daniel Cifuentes Pinto', gender: 'male',   birth_date: '1955-02-08', identification_doc: '19432765',   medical_summary: 'Enfermedad renal crónica estadio 3.',         assigned_doctor_id: 'd-1', assigned_doctor_name: 'Dr. Andrés Cardona',  status: 'inactive', created_at: '2024-06-15T13:00:00' },
  { id: 'p-007', name: 'Lina Patiño Castillo',   gender: 'female', birth_date: '1991-12-04', identification_doc: '1043987654', medical_summary: 'Hipotiroidismo. Tratamiento estable.',        assigned_doctor_id: 'd-3', assigned_doctor_name: 'Dr. Felipe Ochoa',    status: 'active', created_at: '2025-04-22T16:10:00' },
  { id: 'p-008', name: 'Mateo Salgado Rivas',    gender: 'male',   birth_date: '1985-08-19', identification_doc: '1024567890', medical_summary: 'Obesidad grado II. Apnea del sueño.',         assigned_doctor_id: 'd-2', assigned_doctor_name: 'Dra. Lucía Bermúdez', status: 'active', created_at: '2025-02-14T08:30:00' },
];

const LOINC_OPTIONS = [
  { code: '2339-0',  display: 'Glucosa',              unit: 'mg/dL', range: { min: 70,  max: 110 } },
  { code: '55284-4', display: 'Presión Arterial',     unit: 'mmHg',  range: { min: 90,  max: 140 } },
  { code: '39156-5', display: 'BMI',                  unit: 'kg/m²', range: { min: 18,  max: 30  } },
  { code: '14749-6', display: 'Insulina',             unit: 'µU/mL', range: { min: 2,   max: 25  } },
  { code: '8310-5',  display: 'Temperatura',          unit: '°C',    range: { min: 36,  max: 37.5 } },
  { code: '8867-4',  display: 'Frecuencia Cardíaca',  unit: 'lpm',   range: { min: 60,  max: 100 } },
];

function genObs(pid, daysBack = 30) {
  const obs = [];
  let id = 1;
  for (let i = 0; i < daysBack; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    if (i % 3 === 0) {
      const loinc = LOINC_OPTIONS[0];
      const base = pid === 'p-001' ? 145 : pid === 'p-004' ? 220 : 105;
      const v = Math.round((base + (Math.random() - 0.5) * 40) * 10) / 10;
      obs.push({
        id: `${pid}-obs-${id++}`, patient_id: pid,
        loinc_code: loinc.code, loinc_display: loinc.display,
        value: v, unit: loinc.unit,
        effective_date: date.toISOString(),
        is_outlier: v < loinc.range.min || v > loinc.range.max,
      });
    }
    if (i % 5 === 0) {
      const loinc = LOINC_OPTIONS[2];
      const v = Math.round((28 + (Math.random() - 0.5) * 6) * 10) / 10;
      obs.push({
        id: `${pid}-obs-${id++}`, patient_id: pid,
        loinc_code: loinc.code, loinc_display: loinc.display,
        value: v, unit: loinc.unit,
        effective_date: date.toISOString(),
        is_outlier: v < loinc.range.min || v > loinc.range.max,
      });
    }
    if (i % 4 === 0) {
      const loinc = LOINC_OPTIONS[5];
      const v = Math.round(72 + (Math.random() - 0.5) * 20);
      obs.push({
        id: `${pid}-obs-${id++}`, patient_id: pid,
        loinc_code: loinc.code, loinc_display: loinc.display,
        value: v, unit: loinc.unit,
        effective_date: date.toISOString(),
        is_outlier: v < loinc.range.min || v > loinc.range.max,
      });
    }
  }
  return obs;
}

const MOCK_OBSERVATIONS = MOCK_PATIENTS.flatMap(p => genObs(p.id));

const MOCK_RISK_REPORTS = [
  { id: 'r-1', patient_id: 'p-001', patient_name: 'Camila Restrepo Vargas', model_type: 'ML', risk_score: 0.78, risk_category: 'HIGH', created_at: '2025-05-22T10:30:00', signed_at: null },
  { id: 'r-2', patient_id: 'p-004', patient_name: 'Sebastián Mora Téllez',  model_type: 'DL', risk_score: 0.92, risk_category: 'CRITICAL', created_at: '2025-05-21T15:00:00', signed_at: null },
  { id: 'r-3', patient_id: 'p-002', patient_name: 'Jorge Hernández Murcia', model_type: 'ML', risk_score: 0.45, risk_category: 'MEDIUM', created_at: '2025-05-20T09:15:00', signed_at: '2025-05-20T11:00:00', feedback: 'ACCEPT' },
  { id: 'r-4', patient_id: 'p-001', patient_name: 'Camila Restrepo Vargas', model_type: 'ML', risk_score: 0.32, risk_category: 'LOW', created_at: '2025-04-18T14:20:00', signed_at: '2025-04-18T16:30:00', feedback: 'ACCEPT' },
];

const MOCK_IMAGES = [
  { id: 'i-1', patient_id: 'p-001', modality: 'FUNDUS', original_filename: 'fundus-ojo-derecho.jpg', description: 'Retinopatía diabética grado II', created_at: '2025-05-20T10:00:00', presigned_url: 'https://images.unsplash.com/photo-1559757175-08c1d3b40d5e?w=400' },
  { id: 'i-2', patient_id: 'p-001', modality: 'FUNDUS', original_filename: 'fundus-ojo-izquierdo.jpg', description: 'Sin hallazgos significativos', created_at: '2025-05-20T10:01:00', presigned_url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400' },
  { id: 'i-3', patient_id: 'p-004', modality: 'XRAY', original_filename: 'torax-pa.jpg', description: 'Radiografía de tórax PA', created_at: '2025-05-15T08:30:00', presigned_url: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=400' },
];

const MOCK_NOTIFICATIONS = [
  { id: 'n-1', title: 'Glucosa fuera de rango: Camila Restrepo', meta: 'Valor 245 mg/dL', time: 'Hace 5 min', read: false, patient_id: 'p-001' },
  { id: 'n-2', title: 'Reporte ML pendiente de firma', meta: 'Sebastián Mora · Riesgo CRITICAL', time: 'Hace 2 h', read: false, patient_id: 'p-004' },
  { id: 'n-3', title: 'Nuevo paciente asignado', meta: 'Lina Patiño Castillo', time: 'Hace 1 día', read: true, patient_id: 'p-007' },
];

const MOCK_AUDIT = [
  { id: 'al-1', action: 'SIGN_REPORT', user_name: 'Dr. Andrés Cardona', user_email: 'andres.cardona@clinica.com', resource_type: 'RiskReport', resource_id: 'r-3', status: 'SUCCESS', timestamp: '2025-05-20T11:00:30' },
  { id: 'al-2', action: 'CREATE_OBSERVATION', user_name: 'Dra. Lucía Bermúdez', user_email: 'lucia.bermudez@clinica.com', resource_type: 'Observation', resource_id: 'p-005-obs-12', status: 'SUCCESS', timestamp: '2025-05-22T09:14:20' },
  { id: 'al-3', action: 'LOGIN', user_name: 'María Rincón', user_email: 'maria.rincon@clinica.com', resource_type: 'Auth', resource_id: '—', status: 'SUCCESS', timestamp: '2025-05-26T08:02:11' },
  { id: 'al-4', action: 'DELETE_PATIENT', user_name: 'María Rincón', user_email: 'maria.rincon@clinica.com', resource_type: 'Patient', resource_id: 'p-099', status: 'SUCCESS', timestamp: '2025-05-25T17:45:00' },
  { id: 'al-5', action: 'INFERENCE_ML', user_name: 'Dr. Andrés Cardona', user_email: 'andres.cardona@clinica.com', resource_type: 'RiskReport', resource_id: 'r-1', status: 'SUCCESS', timestamp: '2025-05-22T10:30:00' },
  { id: 'al-6', action: 'UPDATE_USER', user_name: 'María Rincón', user_email: 'maria.rincon@clinica.com', resource_type: 'User', resource_id: 'u-15', status: 'SUCCESS', timestamp: '2025-05-24T13:22:15' },
  { id: 'al-7', action: 'UPLOAD_IMAGE', user_name: 'Dr. Felipe Ochoa', user_email: 'felipe.ochoa@clinica.com', resource_type: 'Image', resource_id: 'i-3', status: 'SUCCESS', timestamp: '2025-05-15T08:32:11' },
  { id: 'al-8', action: 'ACCEPT_HABEAS_DATA', user_name: 'Isabella Quintero', user_email: 'isabella.q@clinica.com', resource_type: 'Auth', resource_id: 'u-8', status: 'SUCCESS', timestamp: '2025-05-08T11:25:33' },
];

const MOCK_USERS_ADMIN = [
  { id: 'u-1',  full_name: 'María Rincón',       identification_doc: '1018765432', email: 'maria.rincon@clinica.com',     role: 'admin',    is_active: true,  created_at: '2024-01-15T10:00:00', updated_at: '2025-05-20T09:00:00' },
  { id: 'u-2',  full_name: 'Dr. Andrés Cardona', identification_doc: '79865412',   email: 'andres.cardona@clinica.com',   role: 'medico',   is_active: true,  created_at: '2024-02-01T08:00:00', updated_at: '2025-05-22T11:30:00' },
  { id: 'u-3',  full_name: 'Dra. Lucía Bermúdez',identification_doc: '52543219',   email: 'lucia.bermudez@clinica.com',   role: 'medico',   is_active: true,  created_at: '2024-02-10T09:30:00', updated_at: '2025-05-24T14:00:00' },
  { id: 'u-4',  full_name: 'Dr. Felipe Ochoa',   identification_doc: '80987654',   email: 'felipe.ochoa@clinica.com',     role: 'medico',   is_active: true,  created_at: '2024-03-05T11:15:00', updated_at: '2025-05-15T08:00:00' },
  { id: 'u-5',  full_name: 'Camila Restrepo',    identification_doc: '1013456789', email: 'camila.r@example.com',         role: 'paciente', is_active: true,  created_at: '2024-08-12T10:30:00', updated_at: '2025-05-20T10:00:00' },
  { id: 'u-6',  full_name: 'Sebastián Mora',     identification_doc: '1019998877', email: 'sebastian.m@example.com',      role: 'paciente', is_active: true,  created_at: '2024-12-01T09:45:00', updated_at: '2025-04-10T16:20:00' },
  { id: 'u-7',  full_name: 'Daniel Cifuentes',   identification_doc: '19432765',   email: 'daniel.c@example.com',         role: 'paciente', is_active: false, created_at: '2024-06-15T13:00:00', updated_at: '2025-03-20T11:00:00' },
];

const MOCK_STATS = {
  users: { total: 47, admins: 3, medicos: 12, pacientes: 32 },
  patients: { total: 32, active: 30 },
  observations: { total: 1284 },
  risk_reports: { total: 86, pending_signature: 4 },
  audit_log: { total_entries: 2456 },
};

Object.assign(window, {
  MOCK_USER, MOCK_DOCTORS, MOCK_PATIENTS, MOCK_OBSERVATIONS, MOCK_RISK_REPORTS,
  MOCK_IMAGES, MOCK_NOTIFICATIONS, MOCK_AUDIT, MOCK_USERS_ADMIN, MOCK_STATS, LOINC_OPTIONS,
});
