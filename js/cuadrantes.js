// =====================================================================
// CUADRANTES — Mapa Real de Leaflet centrado en Óvalo Santa Anita - TECSUP
// =====================================================================
(() => {
  'use strict';

  // ── Coordenadas Reales (Óvalo de Santa Anita / TECSUP) ──
  const QUADRANTS = [
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

  const STATE = { selectedId: null, filterZone: 'all' };
  let map = null;
  let markersLayer = null;
  let tooltipEl = null;

  // ── Helpers ──
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

    // Centrar en Óvalo Santa Anita / TECSUP
    map = L.map(mapEl, {
      center: [-12.0545, -76.9710], // Coordenadas TECSUP
      zoom: 15,
      zoomControl: true,
      attributionControl: false
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(map);

    markersLayer = L.layerGroup().addTo(map);
    renderMarkers();
  }

  // ═══════════════════════════════════════════════════════════════════
  // RENDERIZAR MARCADORES EN EL MAPA
  // ═══════════════════════════════════════════════════════════════════
  function renderMarkers() {
    if (!map || !markersLayer) return;
    markersLayer.clearLayers();

    const visible = QUADRANTS.filter(q =>
      STATE.filterZone === 'all' || q.zone === STATE.filterZone
    );

    visible.forEach(q => {
      const isSel = q.id === STATE.selectedId;
      const isSafe = q.status === 'safe';
      
      // Colores institucionales
      const bgColor = isSafe ? '#22C55E' : '#EF4444';
      const iconName = isSafe ? 'shield-check' : 'alert-triangle';

      // Crear un icono HTML personalizado para que se vea como la primera imagen
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

      // Al hacer clic en el marcador
      marker.on('click', () => {
        STATE.selectedId = q.id;
        renderMarkers();
        renderQuadrantInfo();
      });

      // Tooltip flotante al pasar el mouse
      marker.on('mouseover', (e) => {
        showTooltip(e.originalEvent, q);
      });
      marker.on('mouseout', () => {
        hideTooltip();
      });
    });

    // Actualizar iconos Lucide dentro de los marcadores generados
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

  // ── Activar / Desactivar Alerta ──
  function toggleQuadrantAlert(id) {
    const q = QUADRANTS.find(x => x.id === id);
    if (!q) return;

    const wasAlert = q.status === 'alert';
    q.status = wasAlert ? 'safe' : 'alert';

    // Sincroniza con el sistema de alertas global
    if (typeof APP !== 'undefined' && Array.isArray(APP.alerts)) {
      if (!wasAlert) {
        const now = new Date();
        const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        APP.alerts.unshift({
          id: (typeof uid === 'function') ? uid() : Date.now(),
          type: 'Sospechoso',
          location: `${q.name} · ${q.address}`,
          desc: `Alerta activada manualmente desde el mapa. ${q.desc}`,
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
    updateAlertCount();

    if (typeof showToast === 'function') {
      showToast(
        !wasAlert ? `⚠ Alerta ACTIVADA en ${q.name}` : `✓ Alerta desactivada en ${q.name}`,
        !wasAlert ? 'error' : 'success'
      );
    }
  }

  // ── Contador de Alertas en la barra superior ──
  function updateAlertCount() {
    const el = document.getElementById('quadrantAlertCount');
    if (!el) return;
    const count = (typeof APP !== 'undefined' && Array.isArray(APP.alerts))
      ? APP.alerts.filter(a => a.status === 'review').length
      : QUADRANTS.filter(q => q.status === 'alert').length;
    el.textContent = count;
  }

  // ── Tooltip flotante ──
  function showTooltip(event, q) {
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
    
    tooltipEl.classList.add('visible');
    const tr = tooltipEl.getBoundingClientRect();
    
    let left = event.clientX - (tr.width / 2);
    let top = event.clientY - tr.height - 20;

    // Evitar que se salga de la pantalla
    left = Math.max(8, Math.min(left, window.innerWidth - tr.width - 8));
    if (top < 8) top = event.clientY + 20;

    tooltipEl.style.left = `${left}px`;
    tooltipEl.style.top  = `${top}px`;
  }

  function hideTooltip() {
    if (tooltipEl) tooltipEl.classList.remove('visible');
  }

  // ── Filtros por Zona ──
  function initFilters() {
    document.querySelectorAll('.zone-filter').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.zone-filter').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        STATE.filterZone = btn.dataset.zone;

        const visible = QUADRANTS.filter(q =>
          STATE.filterZone === 'all' || q.zone === STATE.filterZone
        );
        
        // Seleccionar automáticamente el primero de la zona
        STATE.selectedId = visible.length > 0 ? visible[0].id : null;

        // Ajustar vista del mapa si hay filtro
        if (map && visible.length > 0) {
          const bounds = L.latLngBounds(visible.map(q => [q.lat, q.lng]));
          map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
        } else if (map && STATE.filterZone === 'all') {
          map.setView([-12.0545, -76.9710], 15);
        }

        renderMarkers();
        renderQuadrantInfo();
        hideTooltip();
      });
    });
  }

  // ═══════════════════════════════════════════════════════════════════
  // ARRANQUE
  // ═══════════════════════════════════════════════════════════════════
  function initQuadrants() {
    // 1. Iniciar Mapa
    initMap();

    // 2. Seleccionar inicial
    if (QUADRANTS.length > 0 && !STATE.selectedId) {
      STATE.selectedId = QUADRANTS[0].id;
    }
    
    // 3. Render inicial
    renderMarkers();
    renderQuadrantInfo();

    // 4. Filtros
    initFilters();

    // 5. Sincronizar contador
    setInterval(updateAlertCount, 2000);

    // 6. Solucionar problema de renderizado de Leaflet al cambiar de vista
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
