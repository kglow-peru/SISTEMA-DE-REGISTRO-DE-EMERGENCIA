// =====================================================================
// MAPA LEAFLET — Marcadores de cámaras y unidades
// =====================================================================
let leafletMap = null;
let mapMarkersLayer = null;

function initMap() {
  const el = document.getElementById('mini-map');
  if (!el || leafletMap) return;
  if (typeof L === 'undefined') {
    console.warn('[map] Leaflet no está disponible.');
    return;
  }

  leafletMap = L.map(el, {
    zoomControl: true,
    attributionControl: true
  }).setView([-12.0464, -77.0428], 15);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
  }).addTo(leafletMap);

  mapMarkersLayer = L.layerGroup().addTo(leafletMap);
  renderMapMarkers();

  // Círculo del sector
  L.circle([-12.0464, -77.0428], {
    radius: 500,
    color: '#EA580C',
    weight: 2,
    opacity: 0.6,
    fillColor: '#EA580C',
    fillOpacity: 0.05,
    dashArray: '8 6'
  }).addTo(leafletMap);
}

function renderMapMarkers() {
  if (!mapMarkersLayer) return;
  mapMarkersLayer.clearLayers();

  APP.cameras.forEach(cam => {
    const isUnit = cam.icon === 'truck';
    const bg = isUnit ? '#059669' : '#1E3A8A';
    const emoji = isUnit ? '🚓' : '📷';
    const pulse = isUnit ? 'animation:pulse 2s ease-in-out infinite;' : '';

    const icon = L.divIcon({
      className: '',
      html: `<div style="background:${bg};width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;border:2px solid #fff;box-shadow:0 3px 8px rgba(0,0,0,.35);${pulse}">${emoji}</div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    const marker = L.marker([cam.lat, cam.lng], { icon }).addTo(mapMarkersLayer);
    marker.bindPopup(`<b>${escapeHtml(cam.id)} · ${escapeHtml(cam.name)}</b><br>${escapeHtml(cam.location)}`);
    marker.on('click', () => {
      if (isUnit) {
        showToast(`📍 ${cam.name} — ${cam.location}`);
      } else {
        openCameraLive(cam.id);
      }
    });
  });
}

function invalidateMap() {
  if (leafletMap) {
    leafletMap.invalidateSize();
  } else {
    initMap();
  }
}