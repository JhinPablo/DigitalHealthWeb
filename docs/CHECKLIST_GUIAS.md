# Checklist contra Guides

Estado de cumplimiento para la demo solida actual. El objetivo es mostrar un sistema funcional por IP publica, sin prometer componentes que aun no estan implementados.

## Implementado

- Docker Compose con Nginx como entrypoint, frontend React, backend FastAPI, PostgreSQL, MinIO, ML service, DL service y orquestador.
- Backend con autenticacion JWT, doble API key, RBAC para `admin`, `medico` y `paciente`.
- Recursos clinicos estilo FHIR: `Patient`, `Observation`, `Media`, `RiskAssessment`/reportes de riesgo.
- Datos sensibles cifrados con Fernet/AES-256 y consentimiento Habeas Data registrado.
- Soft-delete en entidades principales y audit log para eventos de seguridad/CRUD/inferencia/firma.
- Frontend React SPA para login, dashboard, pacientes, observaciones, alertas, admin, imagenes, ML/DL y firma medica.
- Modelos ONNX en servicios separados, con salida SHAP para ML y Grad-CAM para DL cuando el flujo de imagen esta disponible.
- Rate limiting y headers basicos de seguridad en Nginx.

## Parcialmente implementado

- HL7 FHIR R4: las rutas y payloads usan recursos inspirados en FHIR, pero no hay servidor HAPI FHIR R4 ni versioning `_history`.
- Interoperabilidad SuperUser: hay RBAC y API medica interna, pero no existe un router SuperUser dedicado para intercambio entre sistemas de companeros.
- DiagnosticReport/RiskAssessment: se persisten reportes de riesgo en JSON, pero falta integracion completa con HAPI FHIR.
- Seguridad publica: Nginx tiene headers y rate limiting; falta dominio, HTTPS, Cloudflare proxy/WAF y SSL Full Strict.
- Evidencia de despliegue: el repo queda listo para DigitalOcean por IP publica; se debe capturar evidencia cuando el Droplet este activo.

## Pendiente fase 2

- HAPI FHIR R4 con PostgreSQL backend y versioning `_history`.
- API SuperUser interoperable con JWT y endpoints documentados para otros equipos.
- Agente RAG con memoria corta/larga, herramientas clinicas, evaluacion RAGAS y persistencia.
- Redis para memoria/sesiones del agente.
- MLflow tracking con PostgreSQL backend.
- Cloudflare con dominio, HTTPS, WAF, certificado en VPS y SSL Full Strict.
- Coleccion Postman completa si se requiere como entregable formal separado.

## Smoke test de entrega demo

- `npm run lint`
- `npm run build`
- `npm audit --audit-level=moderate`
- `docker compose config`
- `docker compose up -d --build`
- `docker compose exec backend python seed_db.py`
- `curl -f http://localhost/health`
- Abrir frontend, iniciar sesion y validar: dashboard, pacientes, detalle clinico, observaciones/reportes y admin.
