/**
 * Script específico para la página de mis postulaciones del candidato
 */

// Variables globales
let todasLasPostulaciones = [];
let postulacionesFiltradas = [];

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Página de mis postulaciones cargada');

    // Verificar autenticación
    if (!AuthService.checkAuth()) {
        return;
    }

    // Verificar que el usuario sea candidato
    const user = AuthService.getUser();
    if (user.rol !== CONFIG.ROLES.CANDIDATO) {
        Utils.showError('No tienes permisos para acceder a esta página');
        setTimeout(() => {
            window.location.href = CONFIG.ROUTES.HOME;
        }, 2000);
        return;
    }

    // Cargar componentes
    try {
        await Components.loadAll();
    } catch (error) {
        console.error('Error al cargar componentes:', error);
    }

    // Cargar postulaciones
    await cargarPostulaciones();
});

/**
 * Carga todas las postulaciones del candidato
 */
async function cargarPostulaciones() {
    try {
        const response = await CandidatosService.getMisPostulaciones();

        if (response.success) {
            todasLasPostulaciones = response.data || [];
            postulacionesFiltradas = [...todasLasPostulaciones];

            actualizarEstadisticas();
            mostrarPostulaciones(postulacionesFiltradas);
        } else {
            Utils.showError(response.message || 'Error al cargar postulaciones');
        }
    } catch (error) {
        console.error('Error al cargar postulaciones:', error);
        Utils.showError('Error al cargar postulaciones: ' + error.message);
    }
}

/**
 * Actualiza las estadísticas en las tarjetas superiores
 */
function actualizarEstadisticas() {
    const total = todasLasPostulaciones.length;
    const enRevision = todasLasPostulaciones.filter(p => p.estado === 'en_revision').length;
    const preseleccionado = todasLasPostulaciones.filter(p => p.estado === 'preseleccionado').length;
    const contratado = todasLasPostulaciones.filter(p => p.estado === 'contratado').length;

    document.getElementById('totalPostulaciones').textContent = total;
    document.getElementById('enRevision').textContent = enRevision;
    document.getElementById('preseleccionado').textContent = preseleccionado;
    document.getElementById('contratado').textContent = contratado;
}

/**
 * Muestra las postulaciones en la tabla
 * @param {Array} postulaciones - Lista de postulaciones a mostrar
 */
function mostrarPostulaciones(postulaciones) {
    const tbody = document.getElementById('postulacionesTableBody');

    if (!postulaciones || postulaciones.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-5">
                    <i class="bi bi-inbox text-muted" style="font-size: 3rem;"></i>
                    <p class="text-muted mt-3 mb-0">No se encontraron postulaciones</p>
                    <a href="/pages/candidato/vacantes.html" class="btn btn-primary btn-sm mt-3">
                        <i class="bi bi-search me-1"></i> Buscar Vacantes
                    </a>
                </td>
            </tr>
        `;
        return;
    }

    let html = '';

    postulaciones.forEach(postulacion => {
        const estadoBadge = getEstadoBadge(postulacion.estado);
        const puedesCancelar = ['pendiente', 'en_revision'].includes(postulacion.estado);

        html += `
            <tr>
                <td class="px-4">
                    <div class="fw-semibold">${postulacion.Vacante?.titulo || 'N/A'}</div>
                    <small class="text-muted">
                        <i class="bi bi-geo-alt"></i> ${postulacion.Vacante?.ubicacion || 'No especificado'}
                    </small>
                </td>
                <td>
                    <div>${postulacion.Vacante?.Empresa?.razon_social || 'Empresa Confidencial'}</div>
                    <small class="text-muted">${postulacion.Vacante?.Empresa?.sector || ''}</small>
                </td>
                <td>
                    <div>${Helpers.formatDateShort(postulacion.fecha_postulacion)}</div>
                    <small class="text-muted">${Helpers.timeAgo(postulacion.fecha_postulacion)}</small>
                </td>
                <td>${estadoBadge}</td>
                <td>
                    ${postulacion.observaciones ?
                        `<small class="text-muted">${Helpers.truncateText(postulacion.observaciones, 50)}</small>` :
                        '<span class="text-muted">-</span>'}
                </td>
                <td class="text-center">
                    <div class="btn-group btn-group-sm">
                        <button onclick="verDetallePostulacion(${postulacion.id})"
                                class="btn btn-outline-primary" title="Ver detalle">
                            <i class="bi bi-eye"></i>
                        </button>
                        ${puedesCancelar ? `
                            <button onclick="cancelarPostulacion(${postulacion.id})"
                                    class="btn btn-outline-danger" title="Cancelar postulación">
                                <i class="bi bi-x-circle"></i>
                            </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
}

/**
 * Retorna el badge HTML según el estado
 * @param {string} estado - Estado de la postulación
 * @returns {string} - HTML del badge
 */
function getEstadoBadge(estado) {
    const badges = {
        'pendiente': '<span class="badge bg-secondary"><i class="bi bi-clock me-1"></i>Pendiente</span>',
        'en_revision': '<span class="badge bg-info"><i class="bi bi-eye me-1"></i>En Revisión</span>',
        'preseleccionado': '<span class="badge bg-primary"><i class="bi bi-star me-1"></i>Preseleccionado</span>',
        'entrevista': '<span class="badge bg-warning"><i class="bi bi-calendar-event me-1"></i>Entrevista</span>',
        'pruebas': '<span class="badge bg-warning"><i class="bi bi-clipboard-check me-1"></i>Pruebas</span>',
        'contratado': '<span class="badge bg-success"><i class="bi bi-check-circle me-1"></i>Contratado</span>',
        'rechazado': '<span class="badge bg-danger"><i class="bi bi-x-circle me-1"></i>Rechazado</span>'
    };

    return badges[estado] || `<span class="badge bg-secondary">${estado}</span>`;
}

/**
 * Filtra las postulaciones por estado
 */
window.filtrarPostulaciones = function() {
    const estadoSeleccionado = document.getElementById('filtroEstado').value;

    if (estadoSeleccionado === '') {
        postulacionesFiltradas = [...todasLasPostulaciones];
    } else {
        postulacionesFiltradas = todasLasPostulaciones.filter(p => p.estado === estadoSeleccionado);
    }

    mostrarPostulaciones(postulacionesFiltradas);
};

/**
 * Ordena las postulaciones
 */
window.ordenarPostulaciones = function() {
    const ordenSeleccionado = document.getElementById('ordenar').value;

    switch (ordenSeleccionado) {
        case 'fecha_desc':
            postulacionesFiltradas.sort((a, b) =>
                new Date(b.fecha_postulacion) - new Date(a.fecha_postulacion)
            );
            break;
        case 'fecha_asc':
            postulacionesFiltradas.sort((a, b) =>
                new Date(a.fecha_postulacion) - new Date(b.fecha_postulacion)
            );
            break;
        case 'empresa':
            postulacionesFiltradas.sort((a, b) => {
                const empresaA = a.Vacante?.Empresa?.razon_social || '';
                const empresaB = b.Vacante?.Empresa?.razon_social || '';
                return empresaA.localeCompare(empresaB);
            });
            break;
        default:
            break;
    }

    mostrarPostulaciones(postulacionesFiltradas);
};

/**
 * Limpia todos los filtros
 */
window.limpiarFiltros = function() {
    document.getElementById('filtroEstado').value = '';
    document.getElementById('ordenar').value = 'fecha_desc';

    postulacionesFiltradas = [...todasLasPostulaciones];
    ordenarPostulaciones(); // Aplicar orden por defecto
};

/**
 * Ver detalle de una postulación
 * @param {number} postulacionId - ID de la postulación
 */
window.verDetallePostulacion = async function(postulacionId) {
    const postulacion = todasLasPostulaciones.find(p => p.id === postulacionId);

    if (!postulacion) {
        Utils.showError('No se encontró la postulación');
        return;
    }

    // Crear modal con el detalle
    const modalContent = `
        <div class="modal fade" id="modalDetallePostulacion" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="bi bi-file-earmark-text me-2"></i>
                            Detalle de Postulación
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <!-- Información de la Vacante -->
                        <div class="mb-4">
                            <h6 class="text-primary mb-3">
                                <i class="bi bi-briefcase me-2"></i>Información de la Vacante
                            </h6>
                            <div class="row">
                                <div class="col-md-12">
                                    <h5 class="mb-2">${postulacion.Vacante?.titulo || 'N/A'}</h5>
                                    <p class="text-muted mb-2">
                                        <i class="bi bi-building me-2"></i>
                                        ${postulacion.Vacante?.Empresa?.razon_social || 'Empresa Confidencial'}
                                    </p>
                                    <p class="text-muted mb-2">
                                        <i class="bi bi-geo-alt me-2"></i>
                                        ${postulacion.Vacante?.ubicacion || 'No especificado'}
                                    </p>
                                    <p class="text-muted mb-2">
                                        <i class="bi bi-laptop me-2"></i>
                                        ${postulacion.Vacante?.modalidad || 'No especificado'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <!-- Estado de la Postulación -->
                        <div class="mb-4">
                            <h6 class="text-primary mb-3">
                                <i class="bi bi-activity me-2"></i>Estado de tu Postulación
                            </h6>
                            <div class="d-flex align-items-center mb-3">
                                <div class="me-3">${getEstadoBadge(postulacion.estado)}</div>
                                <div>
                                    <small class="text-muted">
                                        Fecha de postulación: ${Helpers.formatDate(postulacion.fecha_postulacion)}
                                    </small>
                                </div>
                            </div>
                            ${postulacion.observaciones ? `
                                <div class="alert alert-info">
                                    <strong>Observaciones de la empresa:</strong><br>
                                    ${postulacion.observaciones}
                                </div>
                            ` : ''}
                        </div>

                        <!-- Descripción de la Vacante -->
                        ${postulacion.Vacante?.descripcion ? `
                            <div class="mb-4">
                                <h6 class="text-primary mb-3">
                                    <i class="bi bi-card-text me-2"></i>Descripción de la Vacante
                                </h6>
                                <p>${postulacion.Vacante.descripcion}</p>
                            </div>
                        ` : ''}

                        <!-- Mensaje enviado -->
                        ${postulacion.mensaje ? `
                            <div class="mb-4">
                                <h6 class="text-primary mb-3">
                                    <i class="bi bi-chat-left-text me-2"></i>Tu Mensaje
                                </h6>
                                <p class="fst-italic">"${postulacion.mensaje}"</p>
                            </div>
                        ` : ''}
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                        ${['pendiente', 'en_revision'].includes(postulacion.estado) ? `
                            <button type="button" class="btn btn-danger"
                                    onclick="cancelarPostulacion(${postulacion.id});
                                             bootstrap.Modal.getInstance(document.getElementById('modalDetallePostulacion')).hide();">
                                <i class="bi bi-x-circle me-1"></i> Cancelar Postulación
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        </div>
    `;

    // Agregar modal al body si no existe
    let modalElement = document.getElementById('modalDetallePostulacion');
    if (modalElement) {
        modalElement.remove();
    }

    document.body.insertAdjacentHTML('beforeend', modalContent);

    // Mostrar modal
    const modal = new bootstrap.Modal(document.getElementById('modalDetallePostulacion'));
    modal.show();
};

/**
 * Cancela una postulación
 * @param {number} postulacionId - ID de la postulación
 */
window.cancelarPostulacion = async function(postulacionId) {
    const confirmado = await Helpers.confirm(
        '¿Estás seguro de que deseas cancelar esta postulación? Esta acción no se puede deshacer.',
        'Cancelar Postulación'
    );

    if (!confirmado) {
        return;
    }

    try {
        Utils.showLoading('Cancelando postulación...');

        const response = await CandidatosService.cancelarPostulacion(postulacionId);

        if (response.success) {
            Utils.showSuccess('Postulación cancelada correctamente');

            // Recargar postulaciones
            await cargarPostulaciones();
        } else {
            Utils.showError(response.message || 'Error al cancelar la postulación');
        }
    } catch (error) {
        console.error('Error al cancelar postulación:', error);
        Utils.showError('Error al cancelar la postulación: ' + error.message);
    } finally {
        Utils.hideLoading();
    }
};
