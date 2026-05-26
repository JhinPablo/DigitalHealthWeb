# Salud Digital — Sistema de diseño premium v2

Drop-in replacement para el frontend. **Mantiene toda la lógica de negocio, autenticación, llamadas API y rutas** — solo cambia la capa visual.

## 📁 Archivos a reemplazar

Copia el contenido de `frontend-v2/src/` sobre `frontend/src/` respetando la estructura:

```
frontend-v2/src/
├── index.css                          ← REEMPLAZA frontend/src/index.css
├── App.jsx                            ← REEMPLAZA (añade rutas /, /terms, /login)
├── components/
│   ├── Layout.jsx                     ← REEMPLAZA (sidebar → topnav)
│   └── Layout.css                     ← REEMPLAZA
└── pages/
    ├── Landing.jsx                    ← NUEVO (página pública /)
    ├── Landing.css                    ← NUEVO
    ├── Terms.jsx                      ← NUEVO (Habeas Data /terms)
    ├── Terms.css                      ← NUEVO
    ├── Login.jsx                      ← REEMPLAZA (redirige a /terms si no aceptado)
    ├── Login.css                      ← REEMPLAZA
    ├── Dashboard.css                  ← REEMPLAZA (JSX sin cambios)
    ├── Patients.css                   ← REEMPLAZA (JSX sin cambios)
    ├── PatientDetail.css              ← REEMPLAZA (JSX sin cambios)
    ├── Observations.css               ← REEMPLAZA (JSX sin cambios)
    ├── Alerts.css                     ← REEMPLAZA (JSX sin cambios)
    └── Admin.css                      ← REEMPLAZA (JSX sin cambios)
```

## 🧭 Flujo de navegación

```
  /                     →  Landing (pública)
  /terms                →  Política Habeas Data (pública + obligatoria post-login)
  /login                →  Login
       └ on success →  si !user.habeas_data_accepted  →  /terms
                       sino                            →  /dashboard
  /dashboard, /patients, /observations, /alerts, /admin → protegidas
       └ ProtectedRoute fuerza /terms si aún no acepta Habeas Data
```

**Cambio clave:** el modal de Habeas Data del Login original **se reemplaza por una página completa** (`/terms`) con TOC, secciones expandidas, marco legal colombiano completo (Ley 1581/2012, Decreto 1377/2013, Resolución 1995/1999, Circular SIC 002/2015, etc.) y checkbox de aceptación. Más profesional y más auditable.

## ✅ Lo que NO cambia

Estos archivos **no requieren modificación** — siguen funcionando 1:1:

- `src/main.jsx`
- `src/context/AuthContext.jsx`
- `src/services/api.js`
- `src/pages/Dashboard.jsx`
- `src/pages/Patients.jsx`
- `src/pages/PatientDetail.jsx`
- `src/pages/Observations.jsx`
- `src/pages/Alerts.jsx`
- `src/pages/Admin.jsx`

> El CSS nuevo apunta a las mismas clases que ya usa tu JSX (`.welcome-banner`, `.stat-card`, `.data-table`, `.patient-header`, `.detail-tabs`, etc.), solo que ahora con el look premium clínica.

## 🎨 Sistema de diseño

**Tokens** (definidos en `index.css`):

| Token | Valor | Uso |
|---|---|---|
| `--paper` | `#F6F4EE` | Fondo de la app (warm white) |
| `--ink` | `#15212E` | Texto principal, navbar |
| `--sage` / `--sage-soft` | `#3F5D4E` | Acento clínico (links activos, success) |
| `--gold` / `--gold-soft` | `#A8854B` | Acento premium (warnings, firma) |
| `--clay` / `--clay-soft` | `#B0543F` | Errores, outliers, alertas |
| `--hairline` | `#E2DED4` | Bordes finos |

**Tipografía:**
- Display / títulos: **Fraunces** (serif editorial)
- UI / texto: **Inter**
- Códigos / IDs: **JetBrains Mono**

**Animaciones:** entrada `fadeUp` 360ms con cubic-bezier(.2,.8,.2,1) — `prefers-reduced-motion` respetado.

**Modo oscuro:** automático via `data-theme="dark"` en `<html>`. Implementación opcional con un toggle en el avatar dropdown.

## 🧭 Navegación

**Antes:** sidebar vertical fijo de 260px con todos los items.
**Ahora:** topnav horizontal sticky (64px) con blur al hacer scroll. Brand a la izq, links centrados con underline sage para el activo, derecha con búsqueda + campana + avatar dropdown. Mobile: hamburger → drawer.

```jsx
// Layout.jsx ya importa useAuth y useNavigate como el original
// Las rutas en App.jsx siguen funcionando sin cambios
```

## 🔌 Compatibilidad con código existente

El nuevo `index.css` define **alias de variables CSS** para mantener compatibilidad con el código heredado:

```css
--color-bg-primary    → var(--paper)
--color-accent        → var(--sage)
--text-xl             → var(--t-xl)
--space-6             → var(--s-6)
--radius-lg           → var(--r-lg)
/* ...etc */
```

Esto significa que cualquier estilo legacy que aún referencie `--color-accent` o `--font-display` sigue funcionando.

## 🎛️ Tweaks opcionales

Si quieres exponer **modo claro/oscuro** desde la UI, agrega esto al avatar dropdown en `Layout.jsx`:

```jsx
<button
  className="dropdown-item"
  onClick={() => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    localStorage.setItem('sd_theme', next);
  }}
>
  Alternar tema
</button>
```

Y en `main.jsx` antes del render:

```jsx
document.documentElement.dataset.theme = localStorage.getItem('sd_theme') || 'light';
```

## 🚀 Pasos de instalación

```bash
# 1. Copia los archivos
cp -r frontend-v2/src/* frontend/src/

# 2. Asegúrate que las fuentes carguen (ya están en el @import de index.css, no requiere npm)

# 3. Levanta el dev server
cd frontend
npm run dev
```

No requiere instalar nuevas dependencias.

## 🧪 Vista previa

El archivo `Salud Digital v2.html` en la raíz del proyecto contiene la **vista previa completa** del sistema con todas las pantallas funcionando con datos mock — úsalo para verificar el look antes/después de integrar.

## 📋 Checklist de QA post-integración

- [ ] **Landing** (`/`) — hero serif + mock dashboard, features grid, stats strip, workflow, CTA, footer
- [ ] **Terms** (`/terms`) — TOC sticky, 9 secciones legales, callouts, checkbox de aceptación
- [ ] Login (split panel + quote)
- [ ] Login → si `!habeas_data_accepted` redirige a `/terms` (fromLogin: true)
- [ ] `/terms` muestra "Acepto y continúo" → llama `acceptHabeasData()` → navega a `/dashboard`
- [ ] Cualquier ruta protegida fuerza redirect a `/terms` si Habeas Data no aceptado
- [ ] Dashboard (saludo serif + 4 stat cards + pending reports + actividad)
- [ ] Pacientes (toolbar de búsqueda + tabla premium + acciones inline)
- [ ] Patient Detail (hero con avatar gradient + tabs + gráficos mini)
- [ ] Observaciones (toolbar + cédula search + tabla outlier-aware)
- [ ] Alertas (banner + tabla flagged rows)
- [ ] Admin (tabs sage + tabla usuarios + audit log expandible + KPI cards)
- [ ] Topnav sticky con blur al hacer scroll
- [ ] Avatar dropdown abre/cierra correctamente
- [ ] Mobile: hamburger drawer funciona
- [ ] Modales: backdrop blur + animación fadeUp

## ⚠️ Detalles a vigilar

- **Tu CSS legacy podría tener `!important` en algunos lugares** — si ves algún estilo que no se aplica, busca overrides en clases especiales del código original
- **Los iconos lucide-style** usan `stroke-width: 1.6` (más fino que los 2 del original) para el look premium — si quieres íconos más bold, cámbialo en cada SVG
- **El `welcome-greeting` y `welcome-name`** ahora se renderizan en dos lineas — verifica que el saludo `getHours()` en Dashboard.jsx funciona con el nuevo estilo (no requiere cambio de código)
