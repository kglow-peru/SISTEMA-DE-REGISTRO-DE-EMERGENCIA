// =====================================================================
// SOLICITUD — Formulario de
//             solicitud de metraje de seguridad (apartado de cámaras).
// =====================================================================

const SOLICITUD = {
  maxDescripcion: 500,
  minDescripcion: 20,
  reParte: /^[A-Z]{2,6}-\d{4}-\d{3,6}$/,
  contador: 0
};

/** Referencias a los elementos del formulario. */
function solicitudEls() {
  return {
    form:      document.getElementById('formSolicitud'),
    dni:       document.getElementById('reqDni'),
    camara:    document.getElementById('reqCamara'),
    fecha:     document.getElementById('reqFecha'),
    parte:     document.getElementById('reqParte'),
    desc:      document.getElementById('reqDescripcion'),
    contador:  document.getElementById('reqContador'),
    success:   document.getElementById('requestSuccess'),
    successTx: document.getElementById('requestSuccessText'),
    submit:    document.getElementById('btnEnviarSolicitud')
  };
}

// ─────────────────────────────────────────────────────────────────────
// LISTA DE CÁMARAS DEL FORMULARIO
// ─────────────────────────────────────────────────────────────────────
function populateSolicitudCameras() {
  const { camara } = solicitudEls();
  if (!camara || typeof APP === 'undefined') return;
  const current = camara.value;
  camara.innerHTML = '<option value="">Seleccione una cámara del sistema…</option>' +
    APP.cameras.map(c =>
      `<option value="${escapeHtml(c.id)}">${escapeHtml(c.id)} · ${escapeHtml(c.name)} (${escapeHtml(c.type)})</option>`
    ).join('');
  camara.value = current;
}

// ─────────────────────────────────────────────────────────────────────
// VALIDACIÓN
// ─────────────────────────────────────────────────────────────────────
function setFieldError(input, message) {
  const field = input.closest('.req-field');
  if (!field) return;
  const err = field.querySelector('.req-error span');
  field.classList.toggle('invalid', !!message);
  input.setAttribute('aria-invalid', message ? 'true' : 'false');
  if (err) err.textContent = message || '';
}

/** Devuelve el mensaje de error de un campo, o '' si es válido. */
function validateSolicitudField(input) {
  const els = solicitudEls();
  const v = input.value.trim();

  if (input === els.dni) {
    if (!v) return 'Ingrese su DNI o documento de identidad.';
    if (!/^\d{8}$/.test(v)) return 'El DNI debe tener exactamente 8 dígitos.';
  }
  if (input === els.camara) {
    if (!v) return 'Seleccione la cámara requerida.';
  }
  if (input === els.fecha) {
    if (!v) return 'Indique la fecha y hora estimada del incidente.';
    const d = new Date(v);
    if (isNaN(d.getTime())) return 'La fecha ingresada no es válida.';
    if (d.getTime() > Date.now()) return 'La fecha del incidente no puede ser futura.';
  }
  if (input === els.parte) {
    if (!v) return 'Ingrese el número de parte policial o denuncia.';
    if (!SOLICITUD.reParte.test(v.toUpperCase())) return 'Formato no válido. Ejemplo: PNP-2026-9874.';
  }
  if (input === els.desc) {
    if (!v) return 'Describa brevemente el suceso y su fundamento legal.';
    if (v.length < SOLICITUD.minDescripcion) return `Ingrese al menos ${SOLICITUD.minDescripcion} caracteres.`;
  }
  return '';
}

function solicitudFields() {
  const e = solicitudEls();
  return [e.dni, e.camara, e.fecha, e.parte, e.desc];
}

function updateFechaMax() {
  const { fecha } = solicitudEls();
  if (!fecha) return;
  const n = new Date();
  const pad = x => String(x).padStart(2, '0');
  fecha.max = `${n.getFullYear()}-${pad(n.getMonth() + 1)}-${pad(n.getDate())}T${pad(n.getHours())}:${pad(n.getMinutes())}`;
}

function updateDescripcionCounter() {
  const { desc, contador } = solicitudEls();
  if (desc && contador) contador.textContent = `${desc.value.length} / ${SOLICITUD.maxDescripcion}`;
}

function hideSolicitudSuccess() {
  const { success } = solicitudEls();
  if (success) success.classList.remove('show');
}

// ─────────────────────────────────────────────────────────────────────
// ACCIONES
// ─────────────────────────────────────────────────────────────────────
function clearSolicitudForm() {
  const els = solicitudEls();
  if (!els.form) return;
  els.form.reset();
  solicitudFields().forEach(i => setFieldError(i, ''));
  updateDescripcionCounter();
  hideSolicitudSuccess();
}

function submitSolicitud(e) {
  e.preventDefault();
  const els = solicitudEls();
  let firstInvalid = null;

  solicitudFields().forEach(input => {
    const msg = validateSolicitudField(input);
    setFieldError(input, msg);
    if (msg && !firstInvalid) firstInvalid = input;
  });

  if (firstInvalid) {
    firstInvalid.focus();
    showToast('Revise los campos marcados en el formulario', 'error');
    return;
  }

  // Antes de registrar, el usuario debe aceptar el protocolo de entrega
  openProtocolo();
}

/** Registra la solicitud (se ejecuta al aceptar el protocolo). */
function registrarSolicitud() {
  const els = solicitudEls();

  // Registro de la solicitud
  SOLICITUD.contador += 1;
  const cam = APP.cameras.find(c => c.id === els.camara.value);
  const solicitud = {
    codigo: `SOL-${new Date().getFullYear()}-${String(SOLICITUD.contador).padStart(4, '0')}`,
    dni: els.dni.value.trim(),
    camara: els.camara.value,
    fechaIncidente: els.fecha.value,
    parte: els.parte.value.trim().toUpperCase(),
    descripcion: els.desc.value.trim(),
    estado: 'En revisión',
    registrada: new Date().toISOString()
  };
  APP.recordingRequests = APP.recordingRequests || [];
  APP.recordingRequests.push(solicitud);

  // Confirmación visible
  const fechaTxt = new Date(solicitud.fechaIncidente).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' });
  els.successTx.innerHTML =
    `Código <span class="req-code">${escapeHtml(solicitud.codigo)}</span> · ` +
    `${escapeHtml(cam ? `${cam.id} · ${cam.name}` : solicitud.camara)} · ` +
    `Incidente: ${escapeHtml(fechaTxt)} · Estado: <strong style="display:inline">En revisión</strong>`;

  els.form.reset();
  solicitudFields().forEach(i => setFieldError(i, ''));
  updateDescripcionCounter();
  els.success.classList.add('show');
  els.success.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  showToast(`✓ Solicitud ${solicitud.codigo} enviada a revisión`, 'success');
}

// ─────────────────────────────────────────────────────────────────────
// MODAL DE PROTOCOLO Y TÉRMINOS LEGALES
// ─────────────────────────────────────────────────────────────────────
let _protocoloOpener = null;

function openProtocolo() {
  const m = document.getElementById('modalProtocolo');
  if (!m) { registrarSolicitud(); return; }
  _protocoloOpener = document.activeElement;
  m.classList.add('show');
  m.removeAttribute('aria-hidden');
  document.body.style.overflow = 'hidden';
  requestAnimationFrame(() => m.classList.add('in'));
  setTimeout(() => document.getElementById('btnProtocoloAceptar').focus(), 60);
}

function closeProtocolo() {
  const m = document.getElementById('modalProtocolo');
  if (!m || !m.classList.contains('show')) return;
  m.classList.remove('in');
  m.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  setTimeout(() => m.classList.remove('show'), 200);
  if (_protocoloOpener && typeof _protocoloOpener.focus === 'function') _protocoloOpener.focus();
}

function initProtocolo() {
  const m = document.getElementById('modalProtocolo');
  if (!m) return;

  m.querySelectorAll('[data-protocolo-cerrar]').forEach(b => b.addEventListener('click', closeProtocolo));
  document.getElementById('btnProtocoloAceptar').addEventListener('click', () => {
    closeProtocolo();
    registrarSolicitud();
  });

  // Cerrar al hacer clic fuera del cuadro
  m.addEventListener('mousedown', (e) => { if (e.target === m) closeProtocolo(); });

  // Esc para cerrar y Tab atrapado dentro del modal
  document.addEventListener('keydown', (e) => {
    if (!m.classList.contains('show')) return;
    if (e.key === 'Escape') { closeProtocolo(); return; }
    if (e.key === 'Tab') {
      const f = m.querySelectorAll('button');
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
}

/** Lleva al formulario con la cámara indicada ya seleccionada. */
function goToSolicitud(cameraId) {
  const run = () => {
    const els = solicitudEls();
    if (!els.form) return;
    populateSolicitudCameras();
    if (cameraId) {
      els.camara.value = cameraId;
      setFieldError(els.camara, '');
    }
    const card = document.getElementById('solicitudMetraje');
    if (card) card.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => (cameraId && els.dni.value ? els.fecha : els.dni).focus({ preventScroll: true }), 450);
  };

  const vista = document.getElementById('view-cameras');
  if (vista && !vista.classList.contains('active') && typeof goToView === 'function') {
    goToView('cameras');
    setTimeout(run, 200);
  } else {
    run();
  }
}

// ─────────────────────────────────────────────────────────────────────
// INICIALIZACIÓN
// ─────────────────────────────────────────────────────────────────────
function initSolicitud() {
  const els = solicitudEls();
  if (!els.form) return;

  populateSolicitudCameras();
  updateFechaMax();
  updateDescripcionCounter();
  els.desc.maxLength = SOLICITUD.maxDescripcion;

  // Solo dígitos en el DNI
  els.dni.addEventListener('input', () => {
    els.dni.value = els.dni.value.replace(/\D/g, '').slice(0, 8);
  });

  // Validación al salir del campo y limpieza del error al corregir
  solicitudFields().forEach(input => {
    input.addEventListener('blur', () => {
      if (input.value.trim() !== '' || input.closest('.req-field').classList.contains('invalid')) {
        setFieldError(input, validateSolicitudField(input));
      }
    });
    const evt = input.tagName === 'SELECT' ? 'change' : 'input';
    input.addEventListener(evt, () => {
      if (input.closest('.req-field').classList.contains('invalid')) {
        setFieldError(input, validateSolicitudField(input));
      }
      hideSolicitudSuccess();
    });
  });

  els.fecha.addEventListener('focus', updateFechaMax);
  els.desc.addEventListener('input', updateDescripcionCounter);
  els.form.addEventListener('submit', submitSolicitud);
  initProtocolo();
  document.getElementById('btnLimpiarSolicitud').addEventListener('click', clearSolicitudForm);
  document.getElementById('btnCerrarSolicitudOk').addEventListener('click', hideSolicitudSuccess);

  // Botón "Solicitar Grabación" de las tarjetas (delegación)
  document.addEventListener('click', (ev) => {
    const btn = ev.target.closest('[data-action="request-recording"]');
    if (btn) goToSolicitud(btn.dataset.id);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSolicitud);
} else {
  initSolicitud();
}