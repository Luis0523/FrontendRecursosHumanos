/**
 * Script específico para la página de documentos del candidato
 */

let todosLosDocumentos = [];

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Página de documentos cargada');

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

    // Cargar documentos
    await cargarDocumentos();
});

/**
 * Carga todos los documentos del candidato
 */
async function cargarDocumentos() {
    try {
        Utils.showLoading('Cargando documentos...');

        const response = await CandidatosService.getMisDocumentos();

        if (response.success) {
            todosLosDocumentos = response.data || [];
            mostrarDocumentos(todosLosDocumentos);
            actualizarEstadisticas(todosLosDocumentos);
        } else {
            Utils.showError(response.message || 'Error al cargar documentos');
        }
    } catch (error) {
        Utils.showError('Error al cargar documentos: ' + error.message);
        mostrarSinDocumentos();
    } finally {
        Utils.hideLoading();
    }
}

/**
 * Muestra los documentos en el contenedor
 * @param {Array} documentos - Lista de documentos
 */
function mostrarDocumentos(documentos) {
    const container = document.getElementById('documentosContainer');

    if (!documentos || documentos.length === 0) {
        mostrarSinDocumentos();
        return;
    }

    let html = '';

    documentos.forEach(doc => {
        const estadoBadge = getEstadoBadge(doc.estado);
        const tipoLabel = getTipoLabel(doc.tipo);
        const iconoArchivo = getIconoArchivo(doc.archivo_url);

        html += `
            <div class="col-md-6 col-lg-4">
                <div class="card document-card border-0 shadow-sm h-100 position-relative">
                    ${estadoBadge}
                    <div class="card-body">
                        <div class="text-center mb-3">
                            <i class="${iconoArchivo} file-icon text-primary"></i>
                        </div>

                        <h5 class="card-title text-truncate" title="${doc.nombre}">
                            ${doc.nombre}
                        </h5>

                        <p class="text-muted small mb-2">
                            <i class="bi bi-tag me-1"></i> ${tipoLabel}
                        </p>

                        <p class="text-muted small mb-2">
                            <i class="bi bi-calendar-event me-1"></i>
                            Subido: ${Utils.formatDate(doc.fecha_subida)}
                        </p>

                        ${doc.descripcion ? `
                            <p class="text-muted small mb-3" style="max-height: 60px; overflow: hidden;">
                                ${doc.descripcion}
                            </p>
                        ` : ''}

                        ${doc.observaciones ? `
                            <div class="alert alert-warning p-2 small mb-2">
                                <strong>Observaciones:</strong><br>
                                ${doc.observaciones}
                            </div>
                        ` : ''}
                    </div>
                    <div class="card-footer bg-transparent">
                        <div class="d-flex justify-content-between align-items-center">
                            <button class="btn btn-sm btn-outline-primary" onclick="verDocumento(${doc.id})">
                                <i class="bi bi-eye"></i> Ver
                            </button>
                            <a href="${doc.archivo_url}" target="_blank" class="btn btn-sm btn-outline-secondary">
                                <i class="bi bi-download"></i> Descargar
                            </a>
                            <button class="btn btn-sm btn-outline-danger" onclick="eliminarDocumento(${doc.id})">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

/**
 * Muestra mensaje cuando no hay documentos
 */
function mostrarSinDocumentos() {
    const container = document.getElementById('documentosContainer');
    container.innerHTML = `
        <div class="col-12">
            <div class="card border-0 shadow-sm">
                <div class="card-body text-center py-5">
                    <i class="bi bi-inbox fs-1 text-muted mb-3 d-block"></i>
                    <h5 class="text-muted mb-3">No tienes documentos subidos</h5>
                    <p class="text-muted mb-4">
                        Comienza subiendo tus documentos de verificación para aumentar tu credibilidad
                    </p>
                    <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#modalSubirDocumento">
                        <i class="bi bi-cloud-upload me-1"></i> Subir mi primer documento
                    </button>
                </div>
            </div>
        </div>
    `;
}

/**
 * Actualiza las estadísticas de documentos
 * @param {Array} documentos - Lista de documentos
 */
function actualizarEstadisticas(documentos) {
    const total = documentos.length;
    const verificados = documentos.filter(d => d.estado === 'verificado').length;
    const revision = documentos.filter(d => d.estado === 'pendiente').length;
    const rechazados = documentos.filter(d => d.estado === 'rechazado').length;

    document.getElementById('totalDocumentos').textContent = total;
    document.getElementById('documentosVerificados').textContent = verificados;
    document.getElementById('documentosRevision').textContent = revision;
    document.getElementById('documentosRechazados').textContent = rechazados;
}

/**
 * Retorna el badge HTML según el estado del documento
 * @param {string} estado - Estado del documento
 * @returns {string} - HTML del badge
 */
function getEstadoBadge(estado) {
    const badges = {
        'pendiente': '<span class="badge bg-warning status-badge">Pendiente</span>',
        'verificado': '<span class="badge bg-success status-badge">Verificado</span>',
        'rechazado': '<span class="badge bg-danger status-badge">Rechazado</span>'
    };

    return badges[estado] || '<span class="badge bg-secondary status-badge">Desconocido</span>';
}

/**
 * Retorna la etiqueta del tipo de documento
 * @param {string} tipo - Tipo de documento
 * @returns {string} - Etiqueta del tipo
 */
function getTipoLabel(tipo) {
    const tipos = {
        'cedula_identidad': 'Cédula de Identidad',
        'titulo_profesional': 'Título Profesional',
        'certificado': 'Certificado',
        'carta_recomendacion': 'Carta de Recomendación',
        'otro': 'Otro'
    };

    return tipos[tipo] || tipo;
}

/**
 * Retorna el ícono según el tipo de archivo
 * @param {string} url - URL del archivo
 * @returns {string} - Clase del ícono
 */
function getIconoArchivo(url) {
    if (!url) return 'bi bi-file-earmark';

    const extension = url.split('.').pop().toLowerCase();

    const iconos = {
        'pdf': 'bi bi-file-earmark-pdf',
        'jpg': 'bi bi-file-earmark-image',
        'jpeg': 'bi bi-file-earmark-image',
        'png': 'bi bi-file-earmark-image'
    };

    return iconos[extension] || 'bi bi-file-earmark';
}

/**
 * Sube un nuevo documento
 * @param {Event} event - Evento del formulario
 */
async function subirDocumento(event) {
    event.preventDefault();

    try {
        const nombre = document.getElementById('nombreDocumento').value.trim();
        const tipo = document.getElementById('tipoDocumento').value;
        const fileInput = document.getElementById('archivoDocumento');
        const archivo = fileInput.files[0];

        // Validaciones
        if (!nombre || !tipo || !archivo) {
            Utils.showError('Por favor completa todos los campos requeridos');
            return;
        }

        // Validar tamaño
        if (archivo.size > CONFIG.FILE_SIZES.DOCUMENT_MAX) {
            Utils.showError('El archivo no debe superar los 5MB');
            return;
        }

        // Validar tipo de archivo
        const tiposPermitidos = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
        if (!tiposPermitidos.includes(archivo.type)) {
            Utils.showError('Solo se permiten archivos PDF, JPG y PNG');
            return;
        }

        Utils.showLoading('Subiendo documento...');

        const response = await CandidatosService.subirDocumento(archivo, tipo, nombre);

        if (response.success) {
            Utils.showSuccess('Documento subido correctamente');

            // Cerrar modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('modalSubirDocumento'));
            modal.hide();

            // Limpiar formulario
            document.getElementById('formSubirDocumento').reset();

            // Recargar lista
            await cargarDocumentos();
        } else {
            Utils.showError(response.message || 'Error al subir el documento');
        }
    } catch (error) {
        Utils.showError('Error al subir el documento: ' + error.message);
    } finally {
        Utils.hideLoading();
    }
}

/**
 * Muestra el detalle de un documento
 * @param {number} documentoId - ID del documento
 */
function verDocumento(documentoId) {
    const documento = todosLosDocumentos.find(d => d.id === documentoId);

    if (!documento) {
        Utils.showError('Documento no encontrado');
        return;
    }

    const tipoLabel = getTipoLabel(documento.tipo);
    const estadoBadge = getEstadoBadge(documento.estado);

    const modalBody = document.getElementById('modalVerDocumentoBody');
    modalBody.innerHTML = `
        <div class="mb-3">
            <h5>${documento.nombre}</h5>
            ${estadoBadge}
        </div>

        <div class="mb-3">
            <strong>Tipo:</strong><br>
            ${tipoLabel}
        </div>

        <div class="mb-3">
            <strong>Fecha de subida:</strong><br>
            ${Utils.formatDate(documento.fecha_subida)}
        </div>

        ${documento.descripcion ? `
            <div class="mb-3">
                <strong>Descripción:</strong><br>
                ${documento.descripcion}
            </div>
        ` : ''}

        ${documento.observaciones ? `
            <div class="alert alert-warning">
                <strong>Observaciones del revisor:</strong><br>
                ${documento.observaciones}
            </div>
        ` : ''}

        <div class="mb-3">
            <strong>Vista previa:</strong><br>
            ${documento.archivo_url.endsWith('.pdf')
                ? `<embed src="${documento.archivo_url}" type="application/pdf" width="100%" height="500px" />`
                : `<img src="${documento.archivo_url}" class="img-fluid rounded" alt="${documento.nombre}" />`
            }
        </div>

        <div class="d-grid gap-2">
            <a href="${documento.archivo_url}" target="_blank" class="btn btn-primary">
                <i class="bi bi-download me-2"></i> Descargar Documento
            </a>
        </div>
    `;

    const modal = new bootstrap.Modal(document.getElementById('modalVerDocumento'));
    modal.show();
}

/**
 * Elimina un documento
 * @param {number} documentoId - ID del documento
 */
async function eliminarDocumento(documentoId) {
    if (!confirm('¿Estás seguro de que deseas eliminar este documento?')) {
        return;
    }

    try {
        Utils.showLoading('Eliminando documento...');

        const response = await CandidatosService.eliminarDocumento(documentoId);

        if (response.success) {
            Utils.showSuccess('Documento eliminado correctamente');
            await cargarDocumentos();
        } else {
            Utils.showError(response.message || 'Error al eliminar el documento');
        }
    } catch (error) {
        Utils.showError('Error al eliminar el documento: ' + error.message);
    } finally {
        Utils.hideLoading();
    }
}

/**
 * Filtra los documentos según los filtros seleccionados
 */
function filtrarDocumentos() {
    const filtroTipo = document.getElementById('filtroTipo').value;
    const filtroEstado = document.getElementById('filtroEstado').value;

    let documentosFiltrados = [...todosLosDocumentos];

    if (filtroTipo) {
        documentosFiltrados = documentosFiltrados.filter(d => d.tipo === filtroTipo);
    }

    if (filtroEstado) {
        documentosFiltrados = documentosFiltrados.filter(d => d.estado === filtroEstado);
    }

    mostrarDocumentos(documentosFiltrados);
}

/**
 * Limpia todos los filtros
 */
function limpiarFiltros() {
    document.getElementById('filtroTipo').value = '';
    document.getElementById('filtroEstado').value = '';
    mostrarDocumentos(todosLosDocumentos);
}
