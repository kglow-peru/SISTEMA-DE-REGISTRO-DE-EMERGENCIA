// =====================================================================
// UTILIDADES GENERALES
// =====================================================================

/** Escapa HTML para insertar strings de usuarios de forma segura. */
function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/** Inicializa los íconos de Lucide si están disponibles. */
function refreshIcons() {
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
}

/** Muestra un toast con mensaje y variante visual. */
let _toastTimer = null;
function showToast(message, variant = 'info') {
  const el = document.getElementById('toast');
  const msg = document.getElementById('toastMsg');
  if (!el || !msg) return;
  msg.textContent = message;
  el.className = 'toast ' + variant;
  clearTimeout(_toastTimer);
  requestAnimationFrame(() => el.classList.add('show'));
  _toastTimer = setTimeout(() => el.classList.remove('show'), 2800);
}

/** Abre un modal por id. */
function openModal(id) {
  const m = document.getElementById(id);
  if (!m) return;
  m.classList.add('open');
  document.body.style.overflow = 'hidden';
}

/** Cierra un modal por id. */
function closeModal(id) {
  const m = document.getElementById(id);
  if (!m) return;
  m.classList.remove('open');
  document.body.style.overflow = '';
}

/** Genera un id único simple. */
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/** Descarga un texto como archivo. */
function downloadFile(filename, content, mime = 'text/plain') {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Mapea tipo de alerta a clase de ícono. */
function alertTypeClass(type) {
  const map = {
    'Robo': 'robo',
    'Sospechoso': 'sospechoso',
    'Incendio': 'incendio',
    'Accidente': 'accidente'
  };
  return map[type] || 'sospechoso';
}

/** Mapea tipo de alerta a nombre de ícono Lucide. */
function alertTypeIcon(type) {
  const map = {
    'Robo': 'alert-circle',
    'Sospechoso': 'eye',
    'Incendio': 'flame',
    'Accidente': 'activity'
  };
  return map[type] || 'alert-circle';
}