// =====================================================================
// CÁMARAS — Render con escenas CCTV animadas + acciones
// =====================================================================

/** Asigna una escena a cada cámara (por tipo/ubicación). */
function getSceneForCamera(cam) {
  if (cam.scene) return cam.scene;
  // Auto-asignación basada en el nombre
  const n = (cam.name || '').toLowerCase();
  if (n.includes('parque'))   return 'park';
  if (n.includes('comercio')) return 'shop';
  if (n.includes('mercado'))  return 'market';
  if (cam.icon === 'truck')   return 'vehicle';
  return 'street';
}

/** Genera el HTML de una tarjeta de cámara con feed CCTV animado. */
function cameraCardHTML(cam) {
  const isUnit = cam.icon === 'truck';
  const sceneType = getSceneForCamera(cam);
  const scene = { ...cam, scene: sceneType };

  const statusLabel = {
    online:  'En línea',
    warning: 'Señal débil',
    offline: 'Fuera de línea'
  }[cam.status] || 'En línea';

  const secondAction = isUnit
    ? `<button class="camera-btn secondary" data-action="contact-unit" data-id="${cam.id}" type="button">
         <i data-lucide="message-square"></i> Contactar
       </button>`
    : cam.status === 'online'
      ? `<button class="camera-btn secondary" data-action="camera-ptz" data-id="${cam.id}" type="button">
           <i data-lucide="rotate-cw"></i> PTZ
         </button>`
      : `<button class="camera-btn secondary" data-action="camera-diagnose" data-id="${cam.id}" type="button">
           <i data-lucide="wrench"></i> Diagnóstico
         </button>`;

  const primaryLabel  = isUnit ? 'Ver Ruta' : 'Ver en Vivo';
  const primaryIcon   = isUnit ? 'navigation' : 'play';
  const primaryAction = isUnit ? 'view-route' : 'view-live';

  return `
    <article class="camera-card">
      <div class="camera-preview">
        <span class="camera-status-badge ${cam.status}">
          <span class="dot"></span> ${statusLabel}
        </span>
        <span class="camera-live-tag">
          <span class="dot"></span> EN VIVO
        </span>
        ${getCCTVFeedHTML(scene)}
      </div>
      <div class="camera-info">
        <div class="cam-id">
          <strong>${escapeHtml(cam.id)} · ${escapeHtml(cam.name)}</strong>
          <span>${escapeHtml(cam.type)}</span>
        </div>
        <div class="cam-location">
          <i data-lucide="map-pin"></i>
          ${escapeHtml(cam.location)}
        </div>
        <div class="cam-meta">
          <span>${escapeHtml(cam.zone)}</span>
          <span class="divider"></span>
          <span>${escapeHtml(cam.quality)}</span>
        </div>
        <div class="camera-actions">
          <button class="camera-btn primary" data-action="${primaryAction}" data-id="${cam.id}" type="button">
            <i data-lucide="${primaryIcon}"></i> ${primaryLabel}
          </button>
          ${secondAction}
        </div>
      </div>
    </article>
  `;
}

/** Renderiza el grid de cámaras en el dashboard. */
function renderDashboardCameras() {
  const grid = document.getElementById('monitorGrid');
  if (!grid) return;
  grid.innerHTML = APP.cameras.map(cameraCardHTML).join('');
  refreshIcons();
  updateCCTVTimestamps();
}

/** Renderiza el grid completo en la vista de cámaras. */
function renderFullCameras() {
  const grid = document.getElementById('camerasFullGrid');
  if (!grid) return;
  grid.innerHTML = APP.cameras.map(cameraCardHTML).join('');
  refreshIcons();
  updateCCTVTimestamps();
}

/** Abre el modal de vista en vivo con la escena correspondiente. */
function openCameraLive(id) {
  const cam = APP.cameras.find(c => c.id === id);
  if (!cam) return;

  const sceneType = getSceneForCamera(cam);
  const scene = { ...cam, scene: sceneType };

  const view = document.getElementById('cameraLiveView');
  if (view) {
    view.innerHTML = `
      <div class="cctv-feed" data-camera="${escapeHtml(cam.id)}" data-status="${cam.status}" style="border-radius:8px;">
        ${getCCTVSceneHTML(sceneType)}
        <div class="cctv-scanlines"></div>
        <div class="cctv-noise"></div>
        <div class="cctv-vignette"></div>
        <div class="cctv-hud">
          <div class="cctv-hud-tl"><span>● CAM ${escapeHtml(cam.id)}</span></div>
          <div class="cctv-hud-tr"><span class="cctv-rec-dot"></span><span>REC</span></div>
          <div class="cctv-hud-bl"><span data-cctv-timestamp>--</span></div>
          <div class="cctv-hud-br"><span>${escapeHtml(cam.quality)}</span></div>
        </div>
        <div class="cctv-offline-overlay">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round">
            <path d="M18 6l-12 12M6 6l12 12"/>
          </svg>
          <span>SIN SEÑAL</span>
        </div>
      </div>
    `;
    updateCCTVTimestamps();
  }

  const info = document.getElementById('cameraLiveInfo');
  if (info) {
    info.textContent = `${cam.id} · ${cam.name} · ${cam.quality} · ${cam.zone}`;
  }

  openModal('modalCamera');
}

/** Manejador de acciones de cámara. */
function handleCameraAction(action, id) {
  const cam = APP.cameras.find(c => c.id === id);
  if (!cam && action !== 'camera-ptz') return;

  switch (action) {
    case 'view-live':
      openCameraLive(id);
      break;
    case 'view-route':
      showToast(`🗺️ Mostrando ruta de ${cam.name}`, 'success');
      if (leafletMap) leafletMap.setView([cam.lat, cam.lng], 17);
      break;
    case 'camera-ptz':
      showToast('🎮 Control PTZ activado. Use las flechas para mover.', 'info');
      break;
    case 'camera-diagnose':
      showToast(`🔧 Ejecutando diagnóstico de ${cam.name}...`, 'info');
      setTimeout(() => showToast(`✓ ${cam.name} — Ping 12 ms · Sin errores`, 'success'), 1200);
      break;
    case 'camera-snapshot':
      showToast('📸 Captura guardada en Descargas', 'success');
      break;
    case 'contact-unit':
      showToast(`📞 Llamando a ${cam.name}...`, 'info');
      setTimeout(() => showToast(`✓ Conexión establecida con ${cam.name}`, 'success'), 900);
      break;
  }
}

/** Delegación de eventos para acciones de cámara. */
function initCameraActions() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;
    const id = btn.dataset.id;
    const cameraActions = ['view-live', 'view-route', 'camera-ptz', 'camera-diagnose', 'camera-snapshot', 'contact-unit'];
    if (cameraActions.includes(action)) {
      handleCameraAction(action, id);
    }
  });
}