// =====================================================================
// NAVEGACIÓN — Router SPA, breadcrumbs y autenticación
// =====================================================================

// ── Mapa de rutas del breadcrumb por vista ──
const BREADCRUMB_MAP = {
  home: [
    { label: 'Inicio', current: true }
  ],
  dashboard: [
    { label: 'Inicio', view: 'home' },
    { label: 'Centro de control', view: 'dashboard' },
    { label: 'Panel de Operaciones y Monitoreo en Vivo', current: true }
  ],
  alerts: [
    { label: 'Inicio', view: 'home' },
    { label: 'Centro de control', view: 'dashboard' },
    { label: 'Alertas', view: 'alerts' },
    { label: 'Gestión de alertas ciudadanas', current: true }
  ],
  cameras: [
    { label: 'Inicio', view: 'home' },
    { label: 'Centro de control', view: 'dashboard' },
    { label: 'Cámaras', view: 'cameras' },
    { label: 'Red de videovigilancia', current: true }
  ],
  sectors: [
    { label: 'Inicio', view: 'home' },
    { label: 'Centro de control', view: 'dashboard' },
    { label: 'Sectores', view: 'sectors' },
    { label: 'Mapa general', current: true }
  ],
  search: [
    { label: 'Inicio', view: 'home' },
    { label: 'Centro de control', view: 'dashboard' },
    { label: 'Búsqueda en Vivo', view: 'search' },
    { label: 'Rastreo de unidades', current: true }
  ],
  kpi: [
    { label: 'Inicio', view: 'home' },
    { label: 'Centro de control', view: 'dashboard' },
    { label: 'Indicadores', view: 'kpi' },
    { label: 'KPI operativos', current: true }
  ],
  reports: [
    { label: 'Inicio', view: 'home' },
    { label: 'Centro de control', view: 'dashboard' },
    { label: 'Reportes', view: 'reports' },
    { label: 'Generación de documentos', current: true }
  ],
  stats: [
    { label: 'Inicio', view: 'home' },
    { label: 'Centro de control', view: 'dashboard' },
    { label: 'Estadísticas', view: 'stats' },
    { label: 'Análisis histórico', current: true }
  ],
  operators: [
    { label: 'Inicio', view: 'home' },
    { label: 'Centro de control', view: 'dashboard' },
    { label: 'Operadores', view: 'operators' },
    { label: 'Equipo de turno', current: true }
  ],
  settings: [
    { label: 'Inicio', view: 'home' },
    { label: 'Centro de control', view: 'dashboard' },
    { label: 'Configuración', view: 'settings' },
    { label: 'Preferencias', current: true }
  ],
  help: [
    { label: 'Inicio', view: 'home' },
    { label: 'Centro de control', view: 'dashboard' },
    { label: 'Ayuda', view: 'help' },
    { label: 'Centro de soporte', current: true }
  ]
};

// ─────────────────────────────────────────────────────────────
// NAVEGACIÓN
// ─────────────────────────────────────────────────────────────
function goToView(viewName) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));

  const target = document.getElementById('view-' + viewName);
  if (target) {
    target.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  APP.currentView = viewName;

  // Sidebar
  document.querySelectorAll('.sidebar-item').forEach(item => {
    item.classList.toggle('active', item.dataset.view === viewName);
  });

  // Top nav
  document.querySelectorAll('.top-nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.view === viewName);
  });

  // Breadcrumb
  refreshBreadcrumb(viewName);

  // Iconos
  refreshIcons();

  // Inicializaciones específicas por vista
  if (viewName === 'dashboard') {
    if (typeof resetCameraPagination === 'function') resetCameraPagination();
    if (typeof invalidateMap === 'function') {
      setTimeout(() => invalidateMap(), 100);
      setTimeout(() => invalidateMap(), 400);
    }
  }
  if (viewName === 'alerts' && typeof renderAlertsPaginated === 'function') {
    renderAlertsPaginated();
  }
}

// ─────────────────────────────────────────────────────────────
// BREADCRUMBS
// ─────────────────────────────────────────────────────────────
function buildBreadcrumbHTML(viewName) {
  const items = BREADCRUMB_MAP[viewName] || BREADCRUMB_MAP.dashboard;
  let html = '';
  items.forEach((item, idx) => {
    if (idx > 0) html += '<span class="breadcrumb-sep">/</span>';
    if (item.current) {
      html += `<span class="breadcrumb-current">${escapeHtml(item.label)}</span>`;
    } else {
      html += `<button class="breadcrumb-link" data-view="${item.view}" type="button">${escapeHtml(item.label)}</button>`;
    }
  });
  return html;
}

function refreshBreadcrumb(viewName) {
  const nav = document.querySelector(`#view-${viewName} .breadcrumb`);
  if (!nav) return;
  nav.innerHTML = buildBreadcrumbHTML(viewName);
  nav.querySelectorAll('[data-view]').forEach(btn => {
    btn.addEventListener('click', () => goToView(btn.dataset.view));
  });
}

// ─────────────────────────────────────────────────────────────
// INICIALIZACIÓN
// ─────────────────────────────────────────────────────────────
function initNavigation() {
  document.querySelectorAll('[data-view]').forEach(btn => {
    btn.addEventListener('click', () => goToView(btn.dataset.view));
  });

  // Construir breadcrumbs de todas las vistas excepto home
  Object.keys(BREADCRUMB_MAP).forEach(viewName => {
    if (viewName === 'home') return;
    refreshBreadcrumb(viewName);
  });
}

// ─────────────────────────────────────────────────────────────
// AUTENTICACIÓN (login / registro simulados)
// ─────────────────────────────────────────────────────────────
function handleLogin() {
  const email = document.getElementById('loginEmail').value.trim();
  const pass = document.getElementById('loginPass').value;

  if (!email || !pass) {
    showToast('Completa correo y contraseña', 'error');
    return;
  }

  showToast(`✓ Sesión iniciada · Bienvenido/a`, 'success');

  // Limpiar formulario
  document.getElementById('formLogin').reset();

  // Ir al dashboard
  setTimeout(() => goToView('dashboard'), 500);
}

function handleRegister() {
  const name = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const pass = document.getElementById('regPass').value;
  const role = document.getElementById('regRole').value;

  if (!name || !email || !pass) {
    showToast('Completa todos los campos', 'error');
    return;
  }
  if (pass.length < 6) {
    showToast('La contraseña debe tener al menos 6 caracteres', 'error');
    return;
  }

  showToast(`✓ Cuenta creada para ${name} (${role})`, 'success');

  // Limpiar formulario
  document.getElementById('formRegister').reset();

  // Ir al dashboard
  setTimeout(() => goToView('dashboard'), 700);
}