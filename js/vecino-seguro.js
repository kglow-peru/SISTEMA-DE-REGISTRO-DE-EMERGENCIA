// =====================================================================
// VECINO SEGURO 2026 — Semana 11: JavaScript II
// Archivo nuevo: no modifica ninguna función ni variable existente.
// Todo el código vive dentro de una función flecha autoejecutable para
// no chocar con los nombres globales de los demás archivos (APP, etc.).
//
// Reparto de módulos (completar con los nombres del grupo):
//   Integrante 1 → Módulo 1: Req 1, 2, 3
//   Integrante 2 → Módulo 2: Req 4, 5, 6, 7
//   Integrante 3 → Módulo 3: Req 8, 9, 10
// =====================================================================
(() => {
  // ───────────────────────────────────────────────────────────────────
  // Utilidades internas (con respaldo por si falta alguna global)
  // ───────────────────────────────────────────────────────────────────

  /**
   * Muestra un aviso usando el toast del sistema; si no existe, usa console.log.
   * Función flecha 1 de 4+ documentadas (Req 10).
   */
  const avisar = (mensaje, variante = 'info') => {
    if (typeof showToast === 'function') {
      showToast(mensaje, variante);
    } else {
      console.log(mensaje);
    }
  };

  /** Atajo para obtener un elemento por id. */
  const $ = (id) => document.getElementById(id);

  // ===================================================================
  // MÓDULO 1 — NAVEGACIÓN Y EVALUACIÓN DE RIESGO
  // ===================================================================

  // ── REQ 1: Menú hamburguesa (Eventos + DOM) ──
  /**
   * El botón ☰ abre y cierra el menú lateral completo en TODOS los dispositivos.
   * Cerrado: solo se ve el botón. Abierto: aparecen todas las opciones.
   */
  const menuEstaAbierto = () => document.body.classList.contains('vs-menu-abierto');

  const fijarMenu = (abierto) => {
    const boton = $('vsHamburguesa');
    document.body.classList.toggle('vs-menu-abierto', abierto);
    if (boton) {
      boton.setAttribute('aria-expanded', String(abierto));
      boton.setAttribute('aria-label', abierto ? 'Cerrar menú de navegación' : 'Abrir menú de navegación');
      boton.textContent = abierto ? '✕' : '☰';
    }
    // Leaflet necesita recalcular su tamaño cuando el contenido se desplaza
    if (typeof invalidateMap === 'function') setTimeout(() => invalidateMap(), 320);
  };

  const alternarMenu = () => fijarMenu(!menuEstaAbierto());
  const cerrarMenu = () => fijarMenu(false);

  const iniciarMenu = () => {
    const boton = $('vsHamburguesa');
    const menu = $('menuLateral');
    if (!boton || !menu) return;
    boton.addEventListener('click', alternarMenu);

    // En pantallas chicas, al elegir una opción el menú se cierra solo
    menu.querySelectorAll('.sidebar-item').forEach((item) => {
      item.addEventListener('click', () => {
        if (window.innerWidth <= 900) cerrarMenu();
      });
    });

    // Tocar el fondo oscuro o presionar Escape también lo cierra
    const fondo = $('vsFondoMenu');
    if (fondo) fondo.addEventListener('click', cerrarMenu);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menuEstaAbierto()) cerrarMenu();
    });
  };

  // ── REQ 2: Semáforo de riesgo por cuadrante (if/else + switch) ──
  /**
   * Devuelve la categoría ('verde' | 'amarillo' | 'naranja' | 'rojo')
   * según la cantidad de reportes mensuales (estructura if/else).
   */
  const clasificarRiesgo = (reportes) => {
    if (reportes <= 5) {
      return 'verde';
    } else if (reportes <= 15) {
      return 'amarillo';
    } else if (reportes <= 25) {
      return 'naranja';
    } else {
      return 'rojo';
    }
  };

  const evaluarRiesgo = () => {
    const input = $('vsReportesZona');
    const tarjeta = $('vsSemaforo');
    if (!input || !tarjeta) return;

    const valor = input.value.trim();
    const reportes = Number(valor);
    if (valor === '' || !Number.isFinite(reportes) || reportes < 0) {
      tarjeta.className = 'vs-semaforo';
      tarjeta.textContent = 'Ingresa un número de reportes válido (0 o más).';
      console.log('[Req 2] Valor inválido:', valor);
      return;
    }

    const categoria = clasificarRiesgo(reportes);
    let mensaje = '';
    // switch: asigna el texto de cada categoría
    switch (categoria) {
      case 'verde':
        mensaje = 'Zona Verde - Riesgo Bajo';
        break;
      case 'amarillo':
        mensaje = 'Zona Amarilla - Riesgo Moderado';
        break;
      case 'naranja':
        mensaje = 'Zona Naranja - Riesgo Alto';
        break;
      case 'rojo':
        mensaje = 'Zona Roja - Emergencia / Peligro Extremo';
        break;
      default:
        mensaje = 'Categoría no reconocida';
    }

    tarjeta.className = `vs-semaforo ${categoria}`;
    tarjeta.textContent = `${reportes} reportes → ${mensaje}`;
    console.log(`[Req 2] ${reportes} reportes → ${mensaje}`);
  };

  // ── REQ 3: Contador de módulos de emergencia (bucle for + DOM) ──
  const contarModulos = () => {
    const secciones = document.getElementsByTagName('section');
    let total = 0;
    for (let i = 0; i < secciones.length; i++) {
      const seccion = secciones[i];
      const titulo = seccion.querySelector('h1, h2, h3, h4');
      const nombre = seccion.id || (titulo ? titulo.textContent.trim() : seccion.className || 'sin identificar');
      console.log(`Sección ${i + 1}: ${nombre}`);
      total++;
    }
    const destino = $('vsTotalModulos');
    if (destino) destino.textContent = String(total);
    console.log(`[Req 3] Total de módulos activos: ${total}`);
  };

  // ===================================================================
  // MÓDULO 2 — GESTIÓN DE INCIDENCIAS Y ALERTAS EN TIEMPO REAL
  // ===================================================================

  // ── REQ 4: Galería de comunicados (while + funciones flecha) ──
  const comunicados = [
    { titulo: 'Patrullaje preventivo - Zona Centro', mensaje: 'Unidades de serenazgo recorrerán Av. Central y Jr. Comercio con refuerzo de vigilancia.', hora: '08:00' },
    { titulo: 'Operativo nocturno - Zona Sur', mensaje: 'Se intensificará el patrullaje en el Parque Central. Reporte cualquier movimiento sospechoso.', hora: '20:30' },
    { titulo: 'Coordinación con Bomberos - Zona Industrial', mensaje: 'Simulacro de evacuación programado. Mantenga libres las vías de acceso a los almacenes.', hora: '15:00' }
  ];
  let indiceComunicado = 0;

  /**
   * Normaliza el índice de forma cíclica con bucles while:
   * si pasa del final vuelve al inicio y viceversa.
   */
  const normalizarIndice = (indice, total) => {
    let resultado = indice;
    while (resultado < 0) resultado += total;
    while (resultado >= total) resultado -= total;
    return resultado;
  };

  /** Dibuja el comunicado actual en el DOM. */
  const mostrarComunicado = () => {
    const caja = $('vsComunicado');
    const cont = $('vsContadorCom');
    if (!caja) return;
    const c = comunicados[indiceComunicado];
    caja.innerHTML = '';
    const titulo = document.createElement('h5');
    titulo.textContent = c.titulo;
    const texto = document.createElement('p');
    texto.textContent = c.mensaje;
    const hora = document.createElement('small');
    hora.textContent = `Hora: ${c.hora}`;
    caja.append(titulo, texto, hora);
    if (cont) cont.textContent = `${indiceComunicado + 1} / ${comunicados.length}`;
  };

  /** Función flecha que mueve el carrusel (+1 siguiente, -1 anterior). */
  const cambiarComunicado = (paso) => {
    indiceComunicado = normalizarIndice(indiceComunicado + paso, comunicados.length);
    console.log(`[Req 4] Comunicado ${indiceComunicado + 1} de ${comunicados.length}`);
    mostrarComunicado();
  };

  // ── REQ 5: Registro e histórico de incidencias (Array + forEach) ──
  const reportes = []; // arreglo global de reportes

  /** Redibuja la lista completa con forEach; cada ítem lleva su botón "Atendido / Eliminar". */
  const dibujarReportes = () => {
    const lista = $('vsListaReportes');
    if (!lista) return;
    lista.innerHTML = '';

    if (reportes.length === 0) {
      const vacio = document.createElement('li');
      vacio.className = 'vs-vacio';
      vacio.textContent = 'Aún no hay incidencias reportadas.';
      lista.appendChild(vacio);
      return;
    }

    reportes.forEach((reporte, posicion) => {
      const item = document.createElement('li');
      const texto = document.createElement('span');
      texto.textContent = reporte.tipo;
      const hora = document.createElement('span');
      hora.className = 'vs-hora';
      hora.textContent = reporte.hora;
      texto.appendChild(hora);

      const boton = document.createElement('button');
      boton.type = 'button';
      boton.className = 'btn btn-ghost';
      boton.textContent = 'Atendido / Eliminar';
      boton.addEventListener('click', () => {
        reportes.splice(posicion, 1);
        console.log(`[Req 5] Reporte eliminado. Quedan ${reportes.length}`);
        dibujarReportes();
      });

      item.append(texto, boton);
      lista.appendChild(item);
    });
  };

  const agregarReporte = () => {
    const input = $('vsTipoIncidencia');
    if (!input) return;
    const tipo = input.value.trim();
    if (tipo === '') {
      avisar('Escribe el tipo de incidencia (Robo, Alumbrado, Sospechoso)', 'error');
      return;
    }
    reportes.push({ tipo, hora: new Date().toLocaleTimeString() });
    console.log(`[Req 5] Reporte agregado: ${tipo}. Total: ${reportes.length}`);
    input.value = '';
    dibujarReportes();
  };

  // ── REQ 6: Calculadora de tasa de incidencias (función flecha + return) ──
  /** Tasa = (Delitos / Población) * 1000, redondeada a 2 decimales. */
  const calcularTasa = (delitos, poblacion) => {
    return Math.round((delitos / poblacion) * 1000 * 100) / 100;
  };

  const procesarTasa = () => {
    const salida = $('vsResultadoTasa');
    const poblacion = Number($('vsPoblacion').value);
    const delitos = Number($('vsDelitos').value);
    if (!salida) return;

    if (!Number.isInteger(poblacion) || !Number.isInteger(delitos) || poblacion <= 0 || delitos <= 0) {
      salida.textContent = 'Ingresa números enteros positivos en ambos campos.';
      console.log('[Req 6] Datos inválidos');
      return;
    }

    const tasa = calcularTasa(delitos, poblacion);
    salida.textContent = `Tasa: ${tasa} incidentes por cada 1,000 habitantes`;
    console.log(`[Req 6] Tasa calculada: ${tasa}`);
  };

  // ── REQ 7: Generador de claves de alarma (for + Array) ──
  const MAX_CLAVES = 20;

  const generarClaves = () => {
    const contenedor = $('vsClaves');
    const aviso = $('vsAvisoClaves');
    if (!contenedor || !aviso) return;

    let cantidad = Number($('vsCantidadClaves').value);
    contenedor.innerHTML = '';
    aviso.textContent = '';

    if (!Number.isInteger(cantidad) || cantidad <= 0) {
      aviso.textContent = 'Ingresa una cantidad entera mayor que 0.';
      return;
    }
    if (cantidad > MAX_CLAVES) {
      aviso.textContent = `⚠ El máximo permitido es ${MAX_CLAVES}. Se generarán ${MAX_CLAVES} códigos.`;
      cantidad = MAX_CLAVES;
    }

    const claves = [];
    for (let i = 0; i < cantidad; i++) {
      claves.push(102 + i * 2); // 102, 104, 106...
    }

    claves.forEach((clave) => {
      const chip = document.createElement('span');
      chip.className = 'vs-clave';
      chip.textContent = clave;
      contenedor.appendChild(chip);
    });
    console.log(`[Req 7] Claves generadas: [${claves.join(', ')}]`);
  };

  // ===================================================================
  // MÓDULO 3 — MONITOREO Y AVISOS FLOTANTES
  // ===================================================================

  // ── REQ 8: Reloj de la central de monitoreo (setInterval + pausa) ──
  let intervaloReloj = null;

  /** Muestra la hora actual en formato HH:MM:SS. */
  const actualizarRelojCentral = () => {
    const destino = $('vsHoraCentral');
    if (!destino) return;
    const ahora = new Date();
    const dos = (n) => String(n).padStart(2, '0');
    destino.textContent = `${dos(ahora.getHours())}:${dos(ahora.getMinutes())}:${dos(ahora.getSeconds())}`;
  };

  const alternarReloj = () => {
    const boton = $('vsBtnReloj');
    if (!boton) return;
    if (intervaloReloj === null) {
      actualizarRelojCentral();
      intervaloReloj = setInterval(actualizarRelojCentral, 1000);
      boton.textContent = '⏸ Pausar';
      console.log('[Req 8] Reloj reanudado');
    } else {
      clearInterval(intervaloReloj);
      intervaloReloj = null;
      boton.textContent = '▶ Reanudar';
      console.log('[Req 8] Reloj en pausa');
    }
  };

  // ── REQ 9: Tooltip de detalle de serenazgo (mouseover / mouseout) ──
  // Teléfonos de patrulla por sector (datos de ejemplo del prototipo)
  const patrullas = {
    'Zona Centro': '(01) 555-0101',
    'Zona Sur': '(01) 555-0102',
    'Zona Norte': '(01) 555-0103',
    'Zona Industrial': '(01) 555-0104'
  };
  let tooltip = null;

  /** Obtiene la tarjeta de sector bajo el cursor (las propias y las del módulo Sectores). */
  const buscarTarjetaSector = (elemento) => {
    if (!elemento || !elemento.closest) return null;
    return elemento.closest('.vs-sector, #sectorsGrid .info-card');
  };

  const iniciarTooltips = () => {
    document.addEventListener('mouseover', function (evento) {
      const tarjeta = buscarTarjetaSector(evento.target);
      if (!tarjeta) return;
      const titulo = tarjeta.querySelector('h4');
      const sector = tarjeta.dataset.sector || (titulo ? titulo.textContent.trim() : '');
      const telefono = patrullas[sector] || 'No disponible';

      if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.className = 'vs-tooltip';
        document.body.appendChild(tooltip);
      }
      tooltip.innerHTML = '';
      const etiqueta = document.createElement('strong');
      etiqueta.textContent = 'Patrulla de serenazgo';
      const detalle = document.createElement('span');
      detalle.textContent = `${sector} · Tel: ${telefono}`;
      tooltip.append(etiqueta, detalle);

      tooltip.style.display = 'block';
      const caja = tarjeta.getBoundingClientRect();
      tooltip.style.left = `${Math.max(8, Math.min(caja.left, window.innerWidth - 250))}px`;
      tooltip.style.top = `${Math.max(8, caja.top - tooltip.offsetHeight - 8)}px`;
      console.log(`[Req 9] Tooltip → ${sector}: ${telefono}`);
    });

    document.addEventListener('mouseout', function (evento) {
      const tarjeta = buscarTarjetaSector(evento.target);
      if (!tarjeta || !tooltip) return;
      // Ignorar el paso entre elementos internos de la misma tarjeta
      if (evento.relatedTarget && tarjeta.contains(evento.relatedTarget)) return;
      tooltip.style.display = 'none';
    });
  };

  // ===================================================================
  // ARRANQUE (Req 10: solo let/const, sin errores en consola)
  // ===================================================================
  const iniciar = () => {
    iniciarMenu();
    iniciarTooltips();
    contarModulos();
    mostrarComunicado();
    dibujarReportes();
    alternarReloj(); // arranca el reloj automáticamente

    const enlazar = (id, evento, manejador) => {
      const el = $(id);
      if (el) el.addEventListener(evento, manejador);
    };
    enlazar('vsBtnRiesgo', 'click', evaluarRiesgo);
    enlazar('vsReportesZona', 'keydown', (e) => { if (e.key === 'Enter') evaluarRiesgo(); });
    enlazar('vsBtnAnterior', 'click', () => cambiarComunicado(-1));
    enlazar('vsBtnSiguiente', 'click', () => cambiarComunicado(1));
    enlazar('vsFormReporte', 'submit', (e) => { e.preventDefault(); agregarReporte(); });
    enlazar('vsBtnTasa', 'click', procesarTasa);
    enlazar('vsBtnClaves', 'click', generarClaves);
    enlazar('vsBtnReloj', 'click', alternarReloj);

    console.log('[Vecino Seguro 2026] Módulos inicializados');
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }
})();
