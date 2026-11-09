// =====================================================================
// CUADRANTES — Mapa interactivo de cuadrantes del sector
// Integrado con APP.alerts, showToast y refreshIcons existentes.
// =====================================================================
(() => {
  'use strict';

  // ── Datos de cuadrantes ──
  const QUADRANTS = [
    { id: 'C-01', zone: 'norte',  status: 'safe',  name: 'Cuadrante C-01',
      address: 'Av. Perú / Av. Universitaria', staff: '4 Serenazgos',
      patrol: 'Móvil 03', desc: 'Zona residencial con patrullaje preventivo constante.',
      pos: { top: 18, left: 22 } },
    { id: 'C-02', zone: 'norte',  status: 'alert', name: 'Cuadrante C-02',
      address: 'Av. Central / Jr. Los Álamos', staff: '3 Serenazgos',
      patrol: 'Móvil 05', desc: 'Reportes recientes de actividad sospechosa en la zona.',
      pos: { top: 28, left: 56 } },
    { id: 'C-03', zone: 'centro', status: 'safe',  name: 'Cuadrante C-03',
      address: 'Jr. Comercio / Av. Los Héroes', staff: '5 Serenazgos',
      patrol: 'Móvil 01', desc: 'Zona comercial con alta afluencia peatonal.',
      pos: { top: 50, left: 42 } },
    { id: 'C-04', zone: 'centro', status: 'alert', name: 'Cuadrante C-04',
      address: 'Av. Grau / Jr. Puno', staff: '2 Serenazgos',
      patrol: 'Móvil 04', desc: 'Se requiere refuerzo por incremento de incidentes.',
      pos: { top: 58, left: 24 } },
    { id: 'C-05', zone: 'sur',    status: 'alert', name: 'Cuadrante C-05',
      address: 'Av. Arequipa / Jr. Andahuaylas', staff: '3 Serenazgos',
      patrol: 'Móvil 02', desc: 'Zona industrial con vigilancia reforzada.',
      pos: { top: 80, left: 44 } },
    { id: 'C-06', zone: 'sur',    status: 'safe',  name: 'Cuadrante C-06',
      address: 'Av. Brasil / Jr. Washington', staff: '4 Serenazgos',
      patrol: 'Móvil 06', desc: 'Zona residencial con patrullaje permanente.',
      pos: { top: 78, left: 72 } }
  ];

  const STATE = { selectedId: null, filterZone: 'all' };
  let tooltipEl = null;

  // ── Helpers ──
  const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  const buildBlocksHTML = () => {
    // Grid 3x3 de manzanas con calles entre ellas
    const blocks = [
      { top: 4,  left: 4,  w: 24, h: 22 },
      { top: 4,  left: 38, w: 24, h: 22 },
      { top: 4,  left: 70, w: 26, h: 22 },
      { top: 38, left: 4,  w: 24, h: 20 },
      { top: 38, left: 38, w: 24, h: 20 },
      { top: 38, left: 70, w: 26, h: 20 },
      { top: 68, left: 4,  w: 24, h: 28 },
      { top: 68, left: 38, w: 24, h: 28 },
      { top: 68, left: 70, w: 26, h: 28 }
    ];
    return blocks.map(b =>
      `<div class="map-block" style="top:${b.top}%;left:${b.left}%;width:${b.w}%;height:${b.h}%;"></div>`
    ).join('');
  };

  const buildMarkersHTML = () => {
    return QUADRANTS
      .filter(q => STATE.filterZone === 'all' || q.zone === STATE.filterZone)
      .map(q => {
        const isSelected = q.id === STATE.selectedId;
        const icon = q.status === 'safe' ? 'shield-check' : 'alert-triangle';
        const statusText = q.status === 'safe' ? 'SEGURO' : 'EN ALERTA';
        return `
          <button class="quadrant-marker ${q.status} ${isSelected ? 'selected' : ''}"
                  data-quadrant="${q.id}"
                  type="button"
                  aria-label="${q.name} - ${statusText}"
                  aria-pressed="${isSelected}">
            <i data-lucide="${icon}"></i>
          </button>
          <span class="quadrant-label" style="top:calc(${q.pos.top}% + 22px);left:${q.pos.left}%;">${q.id}</span>
        `;
      }).join('');
  };

  // ── Render del mapa ──
  function renderQuadrantMap() {
    const mapEl = document.getElementById('quadrantMap');
    if (!mapEl) return;

    mapEl.innerHTML = `
      <div class="map-street h-street" style="top:30%;"></div>
      <div class="map-street h-street" style="top:62%;"></div>
      <div class="map-street v-street" style="left:32%;"></div>
      <div class="map-street v-street" style="left:66%;"></div>
      <div class="map-street diagonal"></div>
      ${buildBlocksHTML()}
      ${QUADRANTS.filter(q => STATE.filterZone === 'all' || q.zone === STATE.filterZone).map(q =>
        `<button class="quadrant-marker ${q.status} ${q.id === STATE.selectedId ? 'selected' : ''}"
                 data-quadrant="${q.id}" type="button"
                 aria-label="${q.name}"
                 style="top:${q.pos.top}%;left:${q.pos.left}%;">
           <i data-lucide="${q.status === 'safe' ? 'shield-check' : 'alert-triangle'}"></i>
         </button>
         <span class="quadrant-label" style="top:calc(${q.pos.top}% + 22px);left:${q.pos.left}%;">${q.id}</span>`
      ).join('')}
    `;

    // Bind clicks
    mapEl.querySelectorAll('.quadrant-marker').forEach(btn => {
      btn.addEventListener('click', () => selectQuadrant(btn.dataset.quadrant));
      btn.addEventListener('mouseenter', (e) => showTooltip(e.currentTarget));
      btn.addEventListener('mouseleave', hideTooltip);
    });

    if (typeof refreshIcons === 'function') refreshIcons();
    updateAlertCount();
  }

  // ── Panel info ──
  function renderQuadrantInfo() {
    const panel = document.getElementById('quadrantInfo');
    if (!panel) return;

    const q = QUADRANTS.find(x => x.id === STATE.selectedId);

    if (!q) {
      panel.innerHTML = `
        <h4><i data-lucide="map-pin"></i> Panel de Ubicación Seleccionada</h4>
        <p style="font-size:12.5px;color:var(--text-muted);padding:8px 0;line-height:1.5;">
          Haz clic en cualquier marcador del mapa para ver el detalle operativo del cuadrante.
        </p>`;
      if (typeof refreshIcons === 'function') refreshIcons();
      return;
    }

    const isAlert = q.status === 'alert';
    panel.innerHTML = `
      <h4><i data-lucide="map-pin"></i> ${q.name}</h4>
      <div class="info-row"><span class="info-label">Dirección / Ref</span><span class="info-value">${q.address}</span></div>
      <div class="info-row"><span class="info-label">Zona Geográfica</span><span class="info-value">${capitalize(q.zone)}</span></div>
      <div class="info-row"><span class="info-label">Personal Asignado</span><span class="info-value">${q.staff}</span></div>
      <div class="info-row"><span class="info-label">Patrulla Móvil</span><span class="info-value">${q.patrol}</span></div>
      <div class="info-row"><span class="info-label">Descripción</span><span class="info-value">${q.desc}</span></div>
      <div class="info-row">
        <span class="info-label">Estado Actual</span>
        <span class="info-value">
          <span class="status-badge ${q.status}">
            <span class="dot"></span> ${isAlert ? 'EN ALERTA' : 'SEGURO'}
          </span>
        </span>
      </div>
      <button class="btn-quadrant-alert ${isAlert ? 'is-active' : ''}"
              type="button" data-toggle-quadrant="${q.id}">
        <i data-lucide="${isAlert ? 'check-circle' : 'alert-triangle'}"></i>
        ${isAlert ? 'Desactivar Estado de Alerta' : 'Activar Estado de ALERTA'}
      </button>
    `;

    const btn = panel.querySelector('[data-toggle-quadrant]');
    if (btn) btn.addEventListener('click', () => toggleQuadrantAlert(q.id));

    if (typeof refreshIcons === 'function') refreshIcons();
  }

  // ── Selección ──
  function selectQuadrant(id) {
    STATE.selectedId = id;
    renderQuadrantMap();
    renderQuadrantInfo();
  }

  // ── Toggle alerta ──
  function toggleQuadrantAlert(id) {
    const q = QUADRANTS.find(x => x.id === id);
    if (!q) return;

    q.status = q.status === 'alert' ? 'safe' : 'alert';

    // Sincroniza con el sistema de alertas global
    if (q.status === 'alert' && typeof APP !== 'undefined' && Array.isArray(APP.alerts)) {
      const now = new Date();
      const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const newAlert = {
        id: (typeof uid === 'function') ? uid() : Date.now(),
        type: 'Sospechoso',
        location: `${q.name} · ${q.address}`,
        desc: `Alerta activada manualmente desde el mapa de cuadrantes. ${q.desc}`,
        time,
        status: 'review'
      };
      APP.alerts.unshift(newAlert);
      if (typeof renderRecentAlerts === 'function') renderRecentAlerts();
      if (typeof renderFullAlerts === 'function') renderFullAlerts();
      if (typeof updateAlertsBadge === 'function') updateAlertsBadge();
      if (typeof resetUpdateTimer === 'function') resetUpdateTimer();
    }

    renderQuadrantMap();
    renderQuadrantInfo();

    if (typeof showToast === 'function') {
      showToast(
        q.status === 'alert'
          ? `⚠ Alerta ACTIVADA en ${q.name}`
          : `✓ Alerta desactivada en ${q.name}`,
        q.status === 'alert' ? 'error' : 'success'
      );
    }
  }

  // ── Contador de alertas en el topbar ──
  function updateAlertCount() {
    const el = document.getElementById('quadrantAlertCount');
    if (!el) return;
    const activeAlerts = (typeof APP !== 'undefined' && Array.isArray(APP.alerts))
      ? APP.alerts.filter(a => a.status === 'review').length
      : QUADRANTS.filter(q => q.status === 'alert').length;
    el.textContent = activeAlerts;
  }

  // ── Tooltip flotante ──
  function showTooltip(marker) {
    const id = marker.dataset.quadrant;
    const q = QUADRANTS.find(x => x.id === id);
    if (!q) return;

    if (!tooltipEl) {
      tooltipEl = document.createElement('div');
      tooltipEl.className = 'quadrant-tooltip';
      document.body.appendChild(tooltipEl);
    }

    tooltipEl.innerHTML = `
      <strong>${q.name}</strong>
      <div>${q.desc}</div>
      <span class="tooltip-status ${q.status}">
        ${q.status === 'safe' ? '✓ ESTADO: SEGURO' : '⚠ ESTADO: ALERTA'}
      </span>
    `;

    const rect = marker.getBoundingClientRect();
    tooltipEl.classList.add('visible');

    const tooltipRect = tooltipEl.getBoundingClientRect();
    let left = rect.left + rect.width / 2 - tooltipRect.width / 2;
    let top  = rect.top - tooltipRect.height - 12;

    left = Math.max(8, Math.min(left, window.innerWidth - tooltipRect.width - 8));
    if (top < 8) top = rect.bottom + 12;

    tooltipEl.style.left = `${left}px`;
    tooltipEl.style.top  = `${top}px`;
  }

  function hideTooltip() {
    if (tooltipEl) tooltipEl.classList.remove('visible');
  }

  // ── Filtros ──
  function initFilters() {
    document.querySelectorAll('.zone-filter').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.zone-filter').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        STATE.filterZone = btn.dataset.zone;

        const visible = QUADRANTS.filter(q =>
          STATE.filterZone === 'all' || q.zone === STATE.filterZone
        );
        if (visible.length > 0) {
          STATE.selectedId = visible[0].id;
        } else {
          STATE.selectedId = null;
        }

        renderQuadrantMap();
        renderQuadrantInfo();
        hideTooltip();
      });
    });
  }

  // ── Arranque ──
  function initQuadrants() {
    renderQuadrantMap();
    if (QUADRANTS.length > 0) {
      STATE.selectedId = QUADRANTS[0].id;
      renderQuadrantInfo();
    }
    initFilters();

    // Mantiene sincronizado el contador con APP.alerts
    setInterval(updateAlertCount, 2000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initQuadrants);
  } else {
    initQuadrants();
  }
})();