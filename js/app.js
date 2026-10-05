// =====================================================================
// APP — Bootstrap principal. Renderiza todas las vistas y arranca.
// =====================================================================

/** Renderiza todas las secciones dinámicas. */
function renderAll() {
  if (typeof renderDashboardCameras === 'function') renderDashboardCameras();
  if (typeof renderFullCameras === 'function') renderFullCameras();
  if (typeof renderRecentAlerts === 'function') renderRecentAlerts();
  if (typeof renderFullAlerts === 'function') renderFullAlerts();
  renderSectors();
  renderOperators();
  renderReports();
  renderSettings();
  renderHelp();
  renderKpiDetail();
  if (typeof updateAlertsBadge === 'function') updateAlertsBadge();
  refreshIcons();
}

/** Vista de sectores. */
function renderSectors() {
  const grid = document.getElementById('sectorsGrid');
  if (!grid) return;
  grid.innerHTML = APP.sectors.map(s => `
    <article class="info-card">
      <div class="icon"><i data-lucide="map"></i></div>
      <h4>${escapeHtml(s.name)}</h4>
      <p>${escapeHtml(s.desc)}</p>
      <div style="margin-top:12px;display:flex;gap:12px;font-size:11.5px;color:var(--text-muted);font-weight:600;">
        <span>📷 ${s.cameras} cámaras</span>
        <span>🚓 ${s.units} unidades</span>
      </div>
      <div style="margin-top:8px;">
        <span class="status-pill ${s.status === 'Óptimo' ? 'done' : 'review'}">
          <span class="dot"></span> ${escapeHtml(s.status)}
        </span>
      </div>
    </article>
  `).join('');
}

/** Vista de operadores. */
function renderOperators() {
  const grid = document.getElementById('operatorsGrid');
  if (!grid) return;
  grid.innerHTML = APP.operators.map(o => `
    <article class="info-card">
      <div class="icon" style="background:linear-gradient(135deg,var(--institutional-blue),var(--institutional-blue-dark));color:#fff;font-weight:800;font-size:15px;">${escapeHtml(o.initials)}</div>
      <h4>${escapeHtml(o.name)}</h4>
      <p>Turno: ${escapeHtml(o.turn)}<br>${escapeHtml(o.sector)}</p>
      <div style="margin-top:8px;">
        <span class="status-pill ${o.status === 'En turno' ? 'done' : 'review'}">
          <span class="dot"></span> ${escapeHtml(o.status)}
        </span>
      </div>
    </article>
  `).join('');
}

/** Vista de reportes. */
function renderReports() {
  const grid = document.getElementById('reportsGrid');
  if (!grid) return;
  grid.innerHTML = APP.reports.map(r => `
    <article class="info-card" data-report="${escapeHtml(r.title)}" style="cursor:pointer;">
      <div class="icon"><i data-lucide="${r.icon}"></i></div>
      <h4>${escapeHtml(r.title)}</h4>
      <p>${escapeHtml(r.desc)}</p>
      <div style="margin-top:10px;">
        <span class="status-pill done"><span class="dot"></span> ${escapeHtml(r.format)}</span>
      </div>
    </article>
  `).join('');

  grid.querySelectorAll('[data-report]').forEach(card => {
    card.addEventListener('click', () => {
      const title = card.dataset.report;
      showToast(`📄 Generando "${title}"...`, 'info');
      setTimeout(() => {
        const content = `Sistema Integrado de Seguridad Ciudadana\n\nReporte: ${title}\nGenerado: ${new Date().toLocaleString()}\n\nTotal alertas: ${APP.alerts.length}\nCámaras activas: ${APP.cameras.filter(c => c.status === 'online').length}\n`;
        downloadFile(`reporte-${Date.now()}.txt`, content);
        showToast(`✓ "${title}" descargado`, 'success');
      }, 900);
    });
  });
}

/** Vista de configuración. */
function renderSettings() {
  const list = document.getElementById('settingsList');
  if (!list) return;
  list.innerHTML = APP.settings.map(s => `
    <div class="settings-row">
      <div class="info">
        <strong>${escapeHtml(s.label)}</strong>
        <span>${escapeHtml(s.desc)}</span>
      </div>
      <div class="switch ${s.on ? 'on' : ''}" data-setting="${s.id}" role="switch" aria-checked="${s.on}"></div>
    </div>
  `).join('');

  list.querySelectorAll('.switch').forEach(sw => {
    sw.addEventListener('click', () => {
      const id = sw.dataset.setting;
      const setting = APP.settings.find(s => s.id === id);
      if (!setting) return;
      setting.on = !setting.on;
      sw.classList.toggle('on', setting.on);
      sw.setAttribute('aria-checked', String(setting.on));
      showToast(`${setting.on ? '✓ Activado' : '✗ Desactivado'}: ${setting.label}`, setting.on ? 'success' : 'info');
    });
  });
}

/** Vista de ayuda. */
function renderHelp() {
  const grid = document.getElementById('helpGrid');
  if (!grid) return;
  grid.innerHTML = APP.helpTopics.map(h => `
    <article class="info-card" data-help="${escapeHtml(h.title)}">
      <div class="icon"><i data-lucide="${h.icon}"></i></div>
      <h4>${escapeHtml(h.title)}</h4>
      <p>${escapeHtml(h.desc)}</p>
    </article>
  `).join('');

  grid.querySelectorAll('[data-help]').forEach(card => {
    card.addEventListener('click', () => {
      showToast(`📖 Abriendo: ${card.dataset.help}`, 'info');
    });
  });
}

/** Vista de KPIs detallados. */
function renderKpiDetail() {
  const grid = document.getElementById('kpiDetailGrid');
  if (!grid) return;
  grid.innerHTML = APP.kpiDetail.map(k => `
    <article class="kpi-card">
      <div class="kpi-icon ${k.color}"><i data-lucide="activity"></i></div>
      <div class="kpi-body">
        <div class="label">${escapeHtml(k.label)}</div>
        <div class="value">${escapeHtml(k.value)}</div>
        <span class="delta flat">${escapeHtml(k.desc)}</span>
      </div>
    </article>
  `).join('');
}

/** Búsqueda en vivo. */
function initSearch() {
  const input = document.getElementById('searchInput');
  const results = document.getElementById('searchResults');
  if (!input || !results) return;

  function renderResults(query) {
    const q = query.trim().toLowerCase();
    const items = [];

    APP.cameras.forEach(c => {
      if (!q || [c.id, c.name, c.zone, c.location].join(' ').toLowerCase().includes(q)) {
        items.push({ type: 'Cámara', title: `${c.id} · ${c.name}`, sub: c.location, id: c.id });
      }
    });

    APP.alerts.forEach(a => {
      if (!q || [a.type, a.location, a.desc].join(' ').toLowerCase().includes(q)) {
        items.push({ type: 'Alerta', title: `${a.type} · ${a.location}`, sub: a.desc, id: a.id });
      }
    });

    if (items.length === 0) {
      results.innerHTML = '<div style="padding:32px;text-align:center;color:var(--text-muted);font-size:13px;">Sin resultados para tu búsqueda.</div>';
      return;
    }

    results.innerHTML = items.slice(0, 20).map(i => `
      <div class="search-result" data-search-id="${i.id}">
        <strong>${escapeHtml(i.title)}</strong>
        <span>${escapeHtml(i.type)} · ${escapeHtml(i.sub)}</span>
      </div>
    `).join('');
  }

  input.addEventListener('input', () => renderResults(input.value));
  renderResults('');

  results.addEventListener('click', (e) => {
    const item = e.target.closest('[data-search-id]');
    if (!item) return;
    showToast(`🔍 Seleccionado: ${item.querySelector('strong').textContent}`, 'info');
  });
}

/** Exportar reporte consolidado. */
function initExport() {
  const btn = document.getElementById('btnExport');
  if (!btn) return;
  btn.addEventListener('click', () => {
    showToast('📄 Generando reporte consolidado...', 'info');
    setTimeout(() => {
      const content = `SISTEMA INTEGRADO DE SEGURIDAD CIUDADANA\nReporte consolidado\nGenerado: ${new Date().toLocaleString()}\n\nAlertas totales: ${APP.alerts.length}\nEn revisión: ${APP.alerts.filter(a => a.status === 'review').length}\nAtendidas: ${APP.alerts.filter(a => a.status === 'done').length}\n\nCámaras registradas: ${APP.cameras.length}\nEn línea: ${APP.cameras.filter(c => c.status === 'online').length}\n`;
      downloadFile(`reporte-consolidado-${Date.now()}.txt`, content);
      showToast('✓ Reporte descargado', 'success');
    }, 800);
  });
}

/** Botones del modal de cámara. */
function initCameraModalActions() {
  document.querySelectorAll('[data-action="camera-ptz"]').forEach(btn => {
    if (btn.closest('#modalCamera')) {
      btn.addEventListener('click', () => handleCameraAction('camera-ptz', null));
    }
  });
  document.querySelectorAll('[data-action="camera-snapshot"]').forEach(btn => {
    if (btn.closest('#modalCamera')) {
      btn.addEventListener('click', () => handleCameraAction('camera-snapshot', null));
    }
  });
}

// =====================================================================
// BOOTSTRAP
// =====================================================================
function boot() {
  refreshIcons();
  startClock();
  initNavigation();
  initCameraActions();
  initAlerts();
  initExport();
  initSearch();
  renderAll();
  initMap();
  initCameraModalActions();

  if (typeof initCCTVClock === 'function') initCCTVClock();
  if (typeof initCameraPagination === 'function') initCameraPagination();
  if (typeof resetCameraPagination === 'function') resetCameraPagination();

  // Arrancar en la vista Home
  if (typeof goToView === 'function') goToView('home');

  refreshIcons();
  showToast('✓ Sistema listo · Inicia sesión para continuar', 'success');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}