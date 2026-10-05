// =====================================================================
// ESTADO GLOBAL DE LA APLICACIÓN
// =====================================================================
const APP = {
  currentView: 'dashboard',
  cameras: [
    { id: 'CAM-152', name: 'Av. Central',        type: 'PTZ',   zone: 'Zona Centro', location: 'Intersección Av. Central con Jr. Comercio', status: 'online',  quality: '1080p · 30 fps', icon: 'cctv',  lat: -12.0460, lng: -77.0430 },
    { id: 'CAM-105', name: 'Parque Central',     type: 'Fijo',  zone: 'Zona Sur',    location: 'Parque Central, sector sur',                 status: 'warning', quality: '720p · 25 fps',  icon: 'cctv',  lat: -12.0480, lng: -77.0400 },
    { id: 'CAM-118', name: 'Jr. Comercio',       type: 'PTZ',   zone: 'Zona Centro', location: 'Jr. Comercio con Av. Los Héroes',            status: 'online',  quality: '1080p · 30 fps', icon: 'cctv',  lat: -12.0450, lng: -77.0450 },
    { id: 'CAM-121', name: 'Mercado Central',    type: 'Fijo',  zone: 'Zona Centro', location: 'Mercado Central, entrada principal',         status: 'online',  quality: '1080p · 30 fps', icon: 'cctv',  lat: -12.0490, lng: -77.0440 },
    { id: 'UNI-012', name: 'Unidad Móvil 12',    type: 'GPS',   zone: 'En ruta',     location: 'Av. Principal · velocidad 32 km/h',          status: 'online',  quality: 'Última posición 12 s', icon: 'truck', lat: -12.0455, lng: -77.0415 }
  ],
  alerts: [
    { id: 1, type: 'Robo',       location: 'Av. Central 234',   desc: 'Sujeto sospechoso intentando abrir vehículo estacionado.', time: '10:38', status: 'review' },
    { id: 2, type: 'Sospechoso', location: 'Parque Central',    desc: 'Presencia extraña reportada por vecinos del sector sur.',  time: '09:52', status: 'done'   },
    { id: 3, type: 'Accidente',  location: 'Jr. Comercio',      desc: 'Colisión menor entre dos vehículos. Sin heridos.',         time: '08:15', status: 'done'   },
    { id: 4, type: 'Incendio',   location: 'Almacén industrial',desc: 'Columna de humo visible. Bomberos notificados.',           time: '07:30', status: 'review' },
    { id: 5, type: 'Robo',       location: 'Mercado Central',   desc: 'Robo a transeúnte reportado por testigo presencial.',      time: '06:12', status: 'done'   }
  ],
  sectors: [
    { name: 'Zona Centro',   cameras: 15, units: 3, status: 'Óptimo',  desc: 'Cobertura completa con 15 cámaras PTZ activas.' },
    { name: 'Zona Sur',      cameras: 12, units: 2, status: 'Óptimo',  desc: 'Zona residencial con buena cobertura.' },
    { name: 'Zona Norte',    cameras: 8,  units: 2, status: 'Parcial', desc: 'Faltan 3 cámaras por instalar en el sector norte.' },
    { name: 'Zona Industrial',cameras: 7, units: 1, status: 'Parcial', desc: 'Requiere ampliación en próximos meses.' }
  ],
  operators: [
    { name: 'Torres Pérez, José',   turn: '08:00 – 16:00', sector: 'Sector 04', initials: 'JT', status: 'En turno' },
    { name: 'Ramírez López, Ana',   turn: '16:00 – 00:00', sector: 'Sector 02', initials: 'AR', status: 'Disponible' },
    { name: 'Castillo Ruiz, Luis',  turn: '00:00 – 08:00', sector: 'Sector 01', initials: 'LC', status: 'Descanso' },
    { name: 'Vargas Mendoza, Sofía',turn: '08:00 – 16:00', sector: 'Sector 05', initials: 'SV', status: 'En turno' }
  ],
  reports: [
    { title: 'Reporte diario de alertas',  desc: 'Consolidado de alertas del día',          icon: 'file-text',   format: 'PDF' },
    { title: 'Reporte de incidentes',      desc: 'Detalle de incidentes registrados',       icon: 'alert-triangle', format: 'PDF' },
    { title: 'Operatividad de cámaras',    desc: 'Uptime y estado de la red de cámaras',    icon: 'cctv',        format: 'CSV' },
    { title: 'Tiempos de respuesta',       desc: 'Métricas de tiempos de respuesta',        icon: 'timer',       format: 'PDF' },
    { title: 'Resumen ejecutivo mensual',  desc: 'Informe consolidado mensual',             icon: 'bar-chart-3', format: 'PDF' },
    { title: 'Bitácora de operadores',     desc: 'Registro de turnos y acciones',           icon: 'users',       format: 'CSV' }
  ],
  helpTopics: [
    { title: 'Cómo registrar alertas',   desc: 'Guía paso a paso para el registro de alertas ciudadanas.', icon: 'bell' },
    { title: 'Control de cámaras PTZ',   desc: 'Aprende a mover, hacer zoom y capturar imágenes.',         icon: 'cctv' },
    { title: 'Atajos de teclado',        desc: 'Combinaciones de teclas para operaciones rápidas.',        icon: 'keyboard' },
    { title: 'Gestión de operadores',    desc: 'Altas, bajas y turnos del personal del centro.',           icon: 'users' },
    { title: 'Exportación de reportes',  desc: 'Cómo generar y descargar reportes en PDF o CSV.',          icon: 'download' },
    { title: 'Soporte técnico',          desc: 'Contacta al equipo de soporte del sistema.',               icon: 'life-buoy' }
  ],
  kpiDetail: [
    { label: 'Cámaras activas',       value: '42/45',   desc: '3 cámaras fuera de servicio',  color: 'blue'   },
    { label: 'Alertas del día',       value: '12',      desc: '2 en revisión pendientes',      color: 'orange' },
    { label: 'Tiempo de respuesta',   value: '4.8 min', desc: 'Promedio últimas 24 h',         color: 'green'  },
    { label: 'Incidentes críticos',   value: '2',       desc: 'Requieren atención inmediata',  color: 'red'    },
    { label: 'Cobertura del sector',  value: '87 %',    desc: 'Área total monitoreada',        color: 'blue'   },
    { label: 'Uptime del sistema',    value: '99.2 %',  desc: 'Últimos 30 días',               color: 'green'  }
  ],
  settings: [
    { id: 'notif-alerts',    label: 'Notificaciones de alertas', desc: 'Recibir alertas push en tiempo real',         on: true  },
    { id: 'notif-sound',     label: 'Sonido de alerta',          desc: 'Reproducir sonido al recibir alertas críticas', on: true  },
    { id: 'auto-refresh',    label: 'Actualización automática',  desc: 'Refrescar datos cada 30 segundos',            on: true  },
    { id: 'dark-mode',       label: 'Modo oscuro',               desc: 'Cambiar a tema oscuro del sistema',           on: false },
    { id: 'show-coords',     label: 'Mostrar coordenadas GPS',   desc: 'Ver latitud y longitud en los mapas',         on: false },
    { id: 'email-reports',   label: 'Reportes por correo',       desc: 'Enviar reportes diarios al correo registrado',on: false }
  ]
};