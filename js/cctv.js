// =====================================================================
// CCTV — Templates HTML de las escenas animadas y actualización
//        de timestamp en los feeds en vivo.
// =====================================================================

/** Devuelve el HTML interno de una escena según su tipo. */
function getCCTVSceneHTML(sceneType) {
  switch (sceneType) {
    case 'street':
      return `
        <div class="cctv-scene scene-street">
          <div class="sky"><div class="sun"></div></div>
          <div class="buildings">
            <div class="bld" style="--h:55%"></div>
            <div class="bld" style="--h:72%"></div>
            <div class="bld" style="--h:48%"></div>
            <div class="bld" style="--h:85%"></div>
            <div class="bld" style="--h:62%"></div>
            <div class="bld" style="--h:78%"></div>
            <div class="bld" style="--h:58%"></div>
          </div>
          <div class="road">
            <div class="sidewalk top"></div>
            <div class="car red"></div>
            <div class="car blue"></div>
            <div class="car dark"></div>
            <div class="car silver"></div>
          </div>
          <div class="traffic-light"></div>
        </div>
      `;
    case 'park':
      return `
        <div class="cctv-scene scene-park">
          <div class="sky"></div>
          <div class="grass"></div>
          <div class="tree t1"><div class="trunk"></div><div class="crown"></div></div>
          <div class="tree t2"><div class="trunk"></div><div class="crown"></div></div>
          <div class="tree t3"><div class="trunk"></div><div class="crown"></div></div>
          <div class="tree t4"><div class="trunk"></div><div class="crown"></div></div>
          <div class="person p1"></div>
          <div class="person p2"></div>
          <div class="person p3"></div>
          <div class="bird b1"></div>
          <div class="bird b2"></div>
          <div class="bird b3"></div>
        </div>
      `;
    case 'shop':
      return `
        <div class="cctv-scene scene-shop">
          <div class="sky"></div>
          <div class="storefront">
            <div class="shop"></div>
            <div class="shop"></div>
            <div class="shop"></div>
            <div class="shop"></div>
          </div>
          <div class="sidewalk"></div>
          <div class="p p1"></div>
          <div class="p p2"></div>
          <div class="p p3"></div>
          <div class="p p4"></div>
          <div class="p p5"></div>
        </div>
      `;
    case 'market':
      return `
        <div class="cctv-scene scene-market">
          <div class="sky"></div>
          <div class="stalls">
            <div class="stall"></div>
            <div class="stall"></div>
            <div class="stall"></div>
            <div class="stall"></div>
          </div>
          <div class="ground"></div>
          <div class="p p1"></div>
          <div class="p p2"></div>
          <div class="p p3"></div>
          <div class="p p4"></div>
          <div class="p p5"></div>
        </div>
      `;
    case 'vehicle':
      return `
        <div class="cctv-scene scene-vehicle">
          <div class="windshield"></div>
          <div class="side-bld left"></div>
          <div class="side-bld right"></div>
          <div class="road"></div>
          <div class="dashboard"></div>
        </div>
      `;
    default:
      return `<div class="cctv-scene scene-street"></div>`;
  }
}

/** Devuelve el HTML completo de un feed CCTV (escena + HUD + efectos). */
function getCCTVFeedHTML(cam) {
  const sceneType = cam.scene || 'street';
  const isRecording = cam.status === 'online' || cam.status === 'warning';
  const time = new Date();
  const pad = n => String(n).padStart(2, '0');
  const timestamp = `${time.getFullYear()}-${pad(time.getMonth() + 1)}-${pad(time.getDate())} ${pad(time.getHours())}:${pad(time.getMinutes())}:${pad(time.getSeconds())}`;

  return `
    <div class="cctv-feed" data-camera="${escapeHtml(cam.id)}" data-status="${cam.status}">
      ${getCCTVSceneHTML(sceneType)}

      <div class="cctv-scanlines"></div>
      <div class="cctv-noise"></div>
      <div class="cctv-vignette"></div>

      <div class="cctv-hud">
        <div class="cctv-hud-tl">
          <span>● CAM ${escapeHtml(cam.id.replace('CAM-', '').replace('UNI-', ''))}</span>
        </div>
        <div class="cctv-hud-tr">
          ${isRecording
            ? `<span class="cctv-rec-dot"></span><span>REC</span>`
            : `<span style="color:#ff6b6b;">● OFFLINE</span>`}
        </div>
        <div class="cctv-hud-bl">
          <span data-cctv-timestamp>${timestamp}</span>
        </div>
        <div class="cctv-hud-br">
          <span>${escapeHtml(cam.quality || '1080p · 30 fps')}</span>
        </div>
      </div>

      <div class="cctv-offline-overlay">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round">
          <path d="M18 6l-12 12M6 6l12 12"/>
        </svg>
        <span>SIN SEÑAL</span>
      </div>
    </div>
  `;
}

/** Actualiza todos los timestamps de los feeds CCTV visibles. */
function updateCCTVTimestamps() {
  const els = document.querySelectorAll('[data-cctv-timestamp]');
  if (els.length === 0) return;
  const time = new Date();
  const pad = n => String(n).padStart(2, '0');
  const ts = `${time.getFullYear()}-${pad(time.getMonth() + 1)}-${pad(time.getDate())} ${pad(time.getHours())}:${pad(time.getMinutes())}:${pad(time.getSeconds())}`;
  els.forEach(el => { el.textContent = ts; });
}

/** Inicia el reloj global de los CCTV. */
function initCCTVClock() {
  setInterval(updateCCTVTimestamps, 1000);
}