// =====================================================================
// ALERTAS — Render, modal de creación y gestión
// =====================================================================

/** HTML de una fila de alerta. */
function alertRowHTML(a) {
  const statusLabel = a.status === 'done' ? 'Atendido' : 'En revisión';
  return `
    <article class="incident-row" data-alert-id="${a.id}">
      <div class="incident-icon ${alertTypeClass(a.type)}">
        <i data-lucide="${alertTypeIcon(a.type)}"></i>
      </div>
      <div class="incident-body">
        <div class="title">${escapeHtml(a.type)} · ${escapeHtml(a.location)}</div>
        <div class="desc">${escapeHtml(a.desc)}</div>
        <div class="meta">
          <span><i data-lucide="clock"></i> ${escapeHtml(a.time)}</span>
          <span class="status-pill ${a.status}"><span class="dot"></span> ${statusLabel}</span>
        </div>
      </div>
    </article>
  `;
}

/** Renderiza las alertas recientes del dashboard (máx 5). */
function renderRecentAlerts() {
  const list = document.getElementById('incidentList');
  if (!list) return;
  list.innerHTML = APP.alerts.slice(0, 5).map(alertRowHTML).join('');
  refreshIcons();
}

/** Renderiza la lista completa de alertas. */
function renderFullAlerts() {
  const list = document.getElementById('alertsFullList');
  if (!list) return;
  if (APP.alerts.length === 0) {
    list.innerHTML = '<div style="padding:32px;text-align:center;color:var(--text-muted);font-size:13px;">No hay alertas registradas.</div>';
    return;
  }
  list.innerHTML = APP.alerts.map(alertRowHTML).join('');
  refreshIcons();
}

/** Actualiza el badge de alertas en el sidebar. */
function updateAlertsBadge() {
  const badge = document.getElementById('alertsBadge');
  const stat = document.getElementById('statAlerts');
  const review = document.getElementById('statReview');
  const kpi = document.getElementById('kpiAlerts');

  const total = APP.alerts.length;
  const pending = APP.alerts.filter(a => a.status === 'review').length;

  if (badge) badge.textContent = total;
  if (stat) stat.textContent = total;
  if (review) review.textContent = pending;
  if (kpi) kpi.textContent = total;
}

/** Guarda una nueva alerta desde el modal. */
function submitNewAlert() {
  const type = document.getElementById('alertType').value;
  const location = document.getElementById('alertLocation').value.trim();
  const desc = document.getElementById('alertDesc').value.trim();
  const priority = document.getElementById('alertPriority').value;

  if (!location || !desc) {
    showToast('Completa todos los campos obligatorios', 'error');
    return;
  }

  const now = new Date();
  const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const newAlert = {
    id: uid(),
    type,
    location,
    desc,
    priority,
    time,
    status: 'review'
  };

  APP.alerts.unshift(newAlert);

  // Limpia el formulario
  document.getElementById('formNewAlert').reset();

  // Cierra el modal
  closeModal('modalAlert');

  // Refresca UI
  renderRecentAlerts();
  renderFullAlerts();
  updateAlertsBadge();
  resetUpdateTimer();

  showToast(`✓ Alerta registrada · ${type} en ${location}`, 'success');
}

/** Inicializa eventos de alertas. */
function initAlerts() {
  // Botón "Activar alerta" del dashboard
  const btnNew = document.getElementById('btnNewAlert');
  if (btnNew) btnNew.addEventListener('click', () => openModal('modalAlert'));

  // Botón "Nueva alerta" de la vista de alertas
  document.querySelectorAll('[data-action="new-alert"]').forEach(btn => {
    btn.addEventListener('click', () => openModal('modalAlert'));
  });

  // Submit del modal
  const btnSubmit = document.getElementById('btnSubmitAlert');
  if (btnSubmit) btnSubmit.addEventListener('click', submitNewAlert);

  // Cerrar modales
  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => closeModal(btn.dataset.closeModal));
  });

  // Cerrar modal haciendo clic en el backdrop
  document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) closeModal(backdrop.id);
    });
  });

  // Tecla Escape cierra modales
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-backdrop.open').forEach(m => closeModal(m.id));
    }
  });
}