// =====================================================================
// RELOJ EN VIVO Y CONTADOR DE "ÚLTIMA ACTUALIZACIÓN"
// =====================================================================
let _secondsSinceUpdate = 12;

function updateClock() {
  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  const hora = document.getElementById('hora');
  const fecha = document.getElementById('fecha');
  if (hora) hora.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  if (fecha) fecha.textContent = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()}`;
}

function startClock() {
  updateClock();
  setInterval(updateClock, 1000);

  // Contador de segundos desde la última actualización
  setInterval(() => {
    _secondsSinceUpdate++;
    if (_secondsSinceUpdate > 30) _secondsSinceUpdate = 0;
    const el = document.getElementById('lastUpdate');
    if (el) el.textContent = _secondsSinceUpdate;
  }, 1000);
}

function resetUpdateTimer() {
  _secondsSinceUpdate = 0;
}