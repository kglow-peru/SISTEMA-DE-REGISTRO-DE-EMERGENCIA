// =====================================================================
// CUADRANTES — Mapa Real de Leaflet con creación dinámica
// =====================================================================
(() => {
  'use strict';

  // ── Coordenadas Reales (Óvalo de Santa Anita / TECSUP) ──
  let QUADRANTS = [
    { id: 'C-01', zone: 'norte',  status: 'safe',  name: 'Cuadrante C-01',
      address: 'Av. Los Ruiseñores / Av. La Molina', staff: '4 Serenazgos',
      patrol: 'Móvil 03', desc: 'Zona residencial con patrullaje preventivo constante.',
      lat: -12.0490, lng: -76.9680 },

    { id: 'C-02', zone: 'norte',  status: 'alert', name: 'Cuadrante C-02',
      address: 'Av. Santa Anita / Calle Los Eucaliptos', staff: '3 Serenazgos',
      patrol: 'Móvil 05', desc: 'Reportes recientes de actividad sospechosa en la zona.',
      lat: -12.0520, lng: -76.9640 },

    { id: 'C-03', zone: 'centro', status: 'safe',  name: 'Cuadrante C-03',
      address: 'Óvalo de Santa Anita / TECSUP', staff: '5 Serenazgos',
      patrol: 'Móvil 01', desc: 'Zona comercial con alta afluencia peatonal y estudiantil.',
      lat: -12.0545, lng: -76.9710 },

    { id: 'C-04', zone: 'centro', status: 'alert', name: 'Cuadrante C-04',
      address: 'Av. Las Gaviotas / Jr. Las Américas', staff: '2 Serenazgos',
      patrol: 'Móvil 04', desc: 'Se requiere refuerzo por incremento de incidentes.',
      lat: -12.0560, lng: -76.9670 },

    { id: 'C-05', zone: 'sur',    status: 'alert', name: 'Cuadrante C-05',
      address: 'Av. La Cultura / Parque Industrial', staff: '3 Serenazgos',
      patrol: 'Móvil 02', desc: 'Zona industrial con vigilancia reforzada.',
      lat: -12.0600, lng: -76.9730 },

    { id: 'C-06', zone: 'sur',    status: 'safe',  name: 'Cuadrante C-06',
      address: 'Av. Aviación / Calle Los Olivos', staff: '4 Serenazgos',
      patrol: 'Móvil 06', desc: 'Zona residencial con patrullaje permanente.',
      lat: -12.0620, lng: -76.9660 }
  ];

  const STATE = { selectedId: null, filterZone: 'all', isAddingMode: false };
  let map = null;
  let markersLayer = null;
  let tooltipEl = null;

  const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  // ═══════════════════════════════════════════════════════════════════
  // INICIALIZAR MAPA REAL (LEAFLET)
  // ═══════════════════════════════════════════════════════════════════
  function initMap() {
    const mapEl = document.getElementById('quadrantMap');
    if (!mapEl || map) return;
    if (typeof L === 'undefined') {
      console.warn('[Cuadrantes] Leaflet no está disponible.');
      return;
    }

    map = L.map(mapEl, {
      center: [-12.0545, -76.9710],
      zoom: 15,
      zoomControl: true,
      attributionControl: false
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(map);

    // EVENTO: Clic en el mapa para agregar un cuadrante
    map.on('click', (e) => {
      if (STATE.isAddingMode) {
        const nextNum = QUADRANTS.length + 1;
        const newId = `C-${String(nextNum).padStart(2, '0')}`;
        
        const newQ = {
          id: newId,
          zone: 'centro',
          status: 'safe',
          name: `Cuadrante ${newId}`,
          address: `Lat: ${e.latlng.lat.toFixed(4)}, Lng: ${e.latlng.lng.toFixed(4)}`,
          staff: '1 Serenazgo',
          patrol: `Móvil ${String(nextNum).padStart(2, '0')}`,
          desc: 'Cuadrante agregado desde el mapa.',
          lat: e.latlng.lat,
          lng: e.latlng.lng
        };

        QUADRANTS.push(newQ);
        STATE.isAddingMode = false;
        map.getContainer().style.cursor = '';
        STATE.selectedId = newId;

        renderMarkers();
        renderQuadrantTable();
        renderQuadrantInfo();
        
        if (typeof showToast === 'function') {
          showToast(`✓ ${newQ.name} agregado correctamente`, 'success');
        }
      }
    });

    markersLayer = L.layerGroup().addTo(map);
    renderMarkers();
  }

  // ── BOTÓN: Activar modo "Agregar Cuadrante" ──
  function initAddButton() {
    const btn = document.getElementById('btnAddQuadrant');
    if (btn) {
      btn.addEventListener('click', () => {
        STATE.isAddingMode = true;
        map.getContainer().style.cursor = 'crosshair';
        if (typeof showToast === 'function') {
          showToast('Haz clic en el mapa para ubicar el nuevo cuadrante', 'info');
        }
      });
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // RENDERIZAR MARCADORES EN EL MAPA
  // ═══════════════════════════════════════════════════════════════════
  function renderMarkers() {
    if (!map || !markersLayer) return;
    markersLayer.clearLayers();

    const visible = QUADRANTS.filter(q => STATE.filterZone === 'all' || q.zone === STATE.filterZone);

    visible.forEach(q => {
      const isSel = q.id === STATE.selectedId;
      const isSafe = q.status === 'safe';
      const iconName = isSafe ? 'shield-check' : 'alert-triangle';

      const customIcon = L.divIcon({
        className: 'custom-map-marker',
        html: `
          <div class="marker-pin ${isSafe ? 'safe' : 'alert'} ${isSel ? 'selected' : ''}">
            <i data-lucide="${iconName}"></i>
          </div>
          <div class="marker-label">${q.id}</div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 40]
      });

      const marker = L.marker([q.lat, q.lng], { icon: customIcon }).addTo(markersLayer);

      marker.on('click', () => {
        STATE.selectedId = q.id;
        renderMarkers();
        renderQuadrantInfo();
      });

      marker.on('mouseover', (e) => showTooltip(e.originalEvent, q));
      marker.on('mouseout', () => hideTooltip());
    });

    if (typeof refreshIcons === 'function') refreshIcons();
  }

  // ═══════════════════════════════════════════════════════════════════
  // RENDERIZAR TABLA DE GESTIÓN
  // ═══════════════════════════════════════════════════════════════════
  function renderQuadrantTable() {
    const tbody = document.getElementById('quadrantTableBody');
    if (!tbody) return;

    const visible = QUADRANTS.filter(q => STATE.filterZone === 'all' || q.zone === STATE.filterZone);

    tbody.innerHTML = visible.map(q => {
      const isAlert = q.status === 'alert';
      return `
        <tr>
          <td class="q-id">${q.id}</td>
          <td class="q-address">${q.address}</td>
          <td class="q-staff">${q.staff}</td>
          <td>
            <span class="status-badge ${q.status}">
              <span class="dot"></span> ${isAlert ? 'ALERTA' : 'SEGURO'}
            </span>
          </td>
          <td>
            <button class="btn-table-action ${isAlert ? 'deactivate' : 'activate'}"
                    data-table-toggle="${q.id}" type="button">
              <i data-lucide="${isAlert ? 'check-circle' : 'alert-triangle'}"></i>
              ${isAlert ? 'Calmar' : 'Alertar'}
            </button>
          </td>
        </tr>
      `;
    }).join('');

    tbody.querySelectorAll('[data-table-toggle]').forEach(btn => {
      btn.addEventListener('click', () => toggleQuadrantAlert(btn.dataset.tableToggle));
    });

    if (typeof refreshIcons === 'function') refreshIcons();
  }

  // ═══════════════════════════════════════════════════════════════════
  // PANEL LATERAL (INFORMACIÓN DEL CUADRANTE)
  // ═══════════════════════════════════════════════════════════════════
  function renderQuadrantInfo() {
    const panel = document.getElementById('quadrantInfo');
    if (!panel) return;

    const q = QUADRANTS.find(x => x.id === STATE.selectedId);

    if (!q) {
      panel.innerHTML = `
        <h4><i data-lucide="map-pin"></i> Panel de Ubicación</h4>
        <p style="font-size:12.5px;color:var(--text-muted);padding:8px 0;">
          Haz clic en cualquier marcador o agrega uno nuevo.
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
          <span class="status-badge ${q.status}"><span class="dot"></span> ${isAlert ? 'EN ALERTA' : 'SEGURO'}</span>
        </span>
      </div>
      <button class="btn-quadrant-alert ${isAlert ? 'is-active' : ''}" type="button" data-toggle-quadrant="${q.id}">
        <i data-lucide="${isAlert ? 'check-circle' : 'alert-triangle'}"></i>
        ${isAlert ? 'Desactivar Alerta' : 'Activar ALERTA'}
      </button>
    `;

    const btn = panel.querySelector('[data-toggle-quadrant]');
    if (btn) btn.addEventListener('click', () => toggleQuadrantAlert(q.id));

    if (typeof refreshIcons === 'function') refreshIcons();
  }

  function toggleQuadrantAlert(id) {
    const q = QUADRANTS.find(x => x.id === id);
    if (!q) return;

    const wasAlert = q.status === 'alert';
    q.status = wasAlert ? 'safe' : 'alert';

    if (typeof APP !== 'undefined' && Array.isArray(APP.alerts)) {
      if (!wasAlert) {
        const now = new Date();
        const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        APP.alerts.unshift({
          id: (typeof uid === 'function') ? uid() : Date.now(),
          type: 'Sospechoso',
          location: `${q.name} · ${q.address}`,
          desc: `Alerta activada desde el panel. ${q.desc}`,
          time,
          status: 'review',
          quadrantId: q.id
        });
      } else {
        const related = APP.alerts.find(a => a.quadrantId === q.id && a.status === 'review');
        if (related) related.status = 'done';
      }

      if (typeof renderRecentAlerts === 'function') renderRecentAlerts();
      if (typeof renderFullAlerts === 'function') renderFullAlerts();
      if (typeof updateAlertsBadge === 'function') updateAlertsBadge();
      if (typeof resetUpdateTimer === 'function') resetUpdateTimer();
    }

    renderMarkers();
    renderQuadrantInfo();
    renderQuadrantTable();
    updateAlertCount();

    if (typeof showToast === 'function') {
      showToast(!wasAlert ? `⚠ Alerta en ${q.name}` : `✓ Alerta desactivada en ${q.name}`, !wasAlert ? 'error' : 'success');
    }
  }

  function updateAlertCount() {
    const el = document.getElementById('quadrantAlertCount');
    if (!el) return;
    const count = (typeof APP !== 'undefined' && Array.isArray(APP.alerts)) ? APP.alerts.filter(a => a.status === 'review').length : QUADRANTS.filter(q => q.status === 'alert').length;
    el.textContent = count;
  }

  function showTooltip(event, q) {
    if (!tooltipEl) {
      tooltipEl = document.createElement('div');
      tooltipEl.className = 'quadrant-tooltip';
      document.body.appendChild(tooltipEl);
    }
    tooltipEl.innerHTML = `
      <strong>${q.name}</strong><div>${q.desc}</div>
      <span class="tooltip-status ${q.status}">${q.status === 'safe' ? '✓ ESTADO: SEGURO' : '⚠ ESTADO: ALERTA'}</span>
    `;
    tooltipEl.classList.add('visible');
    const tr = tooltipEl.getBoundingClientRect();
    let left = event.clientX - (tr.width / 2);
    let top = event.clientY - tr.height - 20;
    left = Math.max(8, Math.min(left, window.innerWidth - tr.width - 8));
    if (top < 8) top = event.clientY + 20;
    tooltipEl.style.left = `${left}px`; tooltipEl.style.top  = `${top}px`;
  }

  function hideTooltip() { if (tooltipEl) tooltipEl.classList.remove('visible'); }

  function initFilters() {
    document.querySelectorAll('.zone-filter').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.zone-filter').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        STATE.filterZone = btn.dataset.zone;

        const visible = QUADRANTS.filter(q => STATE.filterZone === 'all' || q.zone === STATE.filterZone);
        STATE.selectedId = visible.length > 0 ? visible[0].id : null;

        if (map && visible.length > 0) {
          const bounds = L.latLngBounds(visible.map(q => [q.lat, q.lng]));
          map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
        } else if (map && STATE.filterZone === 'all') {
          map.setView([-12.0545, -76.9710], 15);
        }

        renderMarkers();
        renderQuadrantInfo();
        renderQuadrantTable();
        hideTooltip();
      });
    });
  }

  function initQuadrants() {
    initMap();
    initAddButton(); // <-- Nueva función para el botón "+"

    if (QUADRANTS.length > 0 && !STATE.selectedId) {
      STATE.selectedId = QUADRANTS[0].id;
    }
    
    renderMarkers();
    renderQuadrantInfo();
    renderQuadrantTable();

    initFilters();
    setInterval(updateAlertCount, 2000);

    const dashView = document.getElementById('view-dashboard');
    if (dashView) {
      new MutationObserver(() => {
        if (dashView.classList.contains('active') && map) {
          setTimeout(() => map.invalidateSize(), 150);
        }
      }).observe(dashView, { attributes: true, attributeFilter: ['class'] });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initQuadrants);
  } else {
    initQuadrants();
  }
})();
