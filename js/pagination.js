// =====================================================================
// PAGINACIÓN — Sistema reutilizable para listas (cámaras, alertas, etc.)
// =====================================================================

const PAGER = {
  cameras: { currentPage: 1, pageSize: 3, items: [] },
  alerts:  { currentPage: 1, pageSize: 5, items: [] }
};

// ─────────────────────────────────────────────────────────────────────
// PAGINACIÓN DE CÁMARAS (dashboard)
// ─────────────────────────────────────────────────────────────────────
function resetCameraPagination() {
  PAGER.cameras.currentPage = 1;
  PAGER.cameras.items = APP.cameras.slice(); // copia
  renderCameraPagination();
  renderPaginatedCameras();
}

function renderPaginatedCameras() {
  const grid = document.getElementById('monitorGrid');
  if (!grid) return;

  const { currentPage, pageSize, items } = PAGER.cameras;
  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;
  const pageItems = items.slice(start, end);

  grid.innerHTML = pageItems.map(cameraCardHTML).join('');
  refreshIcons();
  updateCCTVTimestamps();
}

function renderCameraPagination() {
  const bar = document.getElementById('cameraPagination');
  if (!bar) return;

  const { currentPage, pageSize, items } = PAGER.cameras;
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, total);

  // Info
  const info = bar.querySelector('.pagination-info');
  if (info) {
    info.innerHTML = `Mostrando <strong>${start}–${end}</strong> de <strong>${total}</strong>`;
  }

  // Controles
  const controls = bar.querySelector('.pagination-controls');
  if (!controls) return;

  // Limpia todo menos los botones prev/next base
  controls.innerHTML = '';

  // Botón prev
  const prevBtn = document.createElement('button');
  prevBtn.className = 'page-btn';
  prevBtn.setAttribute('aria-label', 'Anterior');
  prevBtn.disabled = currentPage === 1;
  prevBtn.innerHTML = '<i data-lucide="chevron-left"></i>';
  prevBtn.addEventListener('click', () => {
    if (PAGER.cameras.currentPage > 1) {
      PAGER.cameras.currentPage--;
      renderCameraPagination();
      renderPaginatedCameras();
    }
  });
  controls.appendChild(prevBtn);

  // Números de página
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement('button');
    btn.className = 'page-btn' + (i === currentPage ? ' active' : '');
    btn.textContent = i;
    btn.addEventListener('click', () => {
      PAGER.cameras.currentPage = i;
      renderCameraPagination();
      renderPaginatedCameras();
    });
    controls.appendChild(btn);
  }

  // Botón next
  const nextBtn = document.createElement('button');
  nextBtn.className = 'page-btn';
  nextBtn.setAttribute('aria-label', 'Siguiente');
  nextBtn.disabled = currentPage >= totalPages;
  nextBtn.innerHTML = '<i data-lucide="chevron-right"></i>';
  nextBtn.addEventListener('click', () => {
    if (PAGER.cameras.currentPage < totalPages) {
      PAGER.cameras.currentPage++;
      renderCameraPagination();
      renderPaginatedCameras();
    }
  });
  controls.appendChild(nextBtn);

  refreshIcons();
}

function initCameraPagination() {
  const select = document.getElementById('pagPageSize');
  if (select) {
    select.addEventListener('change', () => {
      PAGER.cameras.pageSize = parseInt(select.value, 10);
      PAGER.cameras.currentPage = 1;
      renderCameraPagination();
      renderPaginatedCameras();
    });
  }
}

// ─────────────────────────────────────────────────────────────────────
// PAGINACIÓN DE ALERTAS (vista alerts)
// ─────────────────────────────────────────────────────────────────────
function renderAlertsPaginated() {
  const list = document.getElementById('alertsFullList');
  if (!list) return;

  PAGER.alerts.items = APP.alerts.slice();

  const { currentPage, pageSize, items } = PAGER.alerts;
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // Ajustar página actual si está fuera de rango
  if (currentPage > totalPages) PAGER.alerts.currentPage = totalPages;

  const start = (PAGER.alerts.currentPage - 1) * pageSize;
  const end = start + pageSize;
  const pageItems = items.slice(start, end);

  // Render
  if (pageItems.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <i data-lucide="inbox"></i>
        <span>No hay alertas registradas.</span>
      </div>`;
  } else {
    list.innerHTML = pageItems.map(alertRowHTML).join('');
  }

  // Actualiza la paginación (barra inferior)
  const container = list.parentElement;
  let nav = container.querySelector('.list-pagination');
  if (!nav) {
    nav = document.createElement('div');
    nav.className = 'list-pagination';
    container.appendChild(nav);
  }
  nav.innerHTML = buildListPaginationHTML('alerts', PAGER.alerts.currentPage, totalPages, total);
  bindListPaginationEvents(nav, 'alerts');

  refreshIcons();
}

// ─────────────────────────────────────────────────────────────────────
// HELPERS COMPARTIDOS PARA PAGINACIÓN DE LISTAS
// ─────────────────────────────────────────────────────────────────────
function buildListPaginationHTML(pagerKey, currentPage, totalPages, totalItems) {
  const { pageSize } = PAGER[pagerKey];
  const start = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  let pagesHTML = '';
  // Mostrar máximo 7 botones alrededor de la página actual
  const maxBtns = 7;
  let from = Math.max(1, currentPage - Math.floor(maxBtns / 2));
  let to = Math.min(totalPages, from + maxBtns - 1);
  from = Math.max(1, to - maxBtns + 1);

  if (from > 1) {
    pagesHTML += `<button class="page-btn" data-go-page="1">1</button>`;
    if (from > 2) pagesHTML += `<span class="page-btn" style="cursor:default;border:none;">…</span>`;
  }
  for (let i = from; i <= to; i++) {
    pagesHTML += `<button class="page-btn ${i === currentPage ? 'active' : ''}" data-go-page="${i}">${i}</button>`;
  }
  if (to < totalPages) {
    if (to < totalPages - 1) pagesHTML += `<span class="page-btn" style="cursor:default;border:none;">…</span>`;
    pagesHTML += `<button class="page-btn" data-go-page="${totalPages}">${totalPages}</button>`;
  }

  return `
    <div class="pagination-info">
      Mostrando <strong>${start}–${end}</strong> de <strong>${totalItems}</strong>
    </div>
    <div class="pagination-controls">
      <button class="page-btn" data-go-page="${Math.max(1, currentPage - 1)}" ${currentPage === 1 ? 'disabled' : ''} aria-label="Anterior">
        <i data-lucide="chevron-left"></i>
      </button>
      ${pagesHTML}
      <button class="page-btn" data-go-page="${Math.min(totalPages, currentPage + 1)}" ${currentPage === totalPages ? 'disabled' : ''} aria-label="Siguiente">
        <i data-lucide="chevron-right"></i>
      </button>
    </div>
  `;
}

function bindListPaginationEvents(navEl, pagerKey) {
  navEl.querySelectorAll('[data-go-page]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.disabled) return;
      const page = parseInt(btn.dataset.goPage, 10);
      if (!page || isNaN(page)) return;
      PAGER[pagerKey].currentPage = page;
      if (pagerKey === 'alerts') {
        renderAlertsPaginated();
      } else if (pagerKey === 'cameras') {
        renderCameraPagination();
        renderPaginatedCameras();
      }
    });
  });
}