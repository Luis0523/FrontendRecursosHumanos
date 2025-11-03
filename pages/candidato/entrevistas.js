/**
 * Script específico para la página de entrevistas del candidato
 */

let todasLasEntrevistas = [];

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Página de entrevistas cargada');

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

    // Cargar entrevistas
    await cargarEntrevistas();
});

/**
 * Carga todas las entrevistas del candidato
 */
async function cargarEntrevistas() {
    try {
        Utils.showLoading('Cargando entrevistas...');

        const response = await CandidatosService.getMisEntrevistas();

        if (response.success) {
            todasLasEntrevistas = response.data || [];
            mostrarEntrevistas(todasLasEntrevistas);
            actualizarEstadisticas(todasLasEntrevistas);
            mostrarProximaEntrevista(todasLasEntrevistas);
        } else {
            Utils.showError(response.message || 'Error al cargar entrevistas');
        }
    } catch (error) {
        Utils.showError('Error al cargar entrevistas: ' + error.message);
        mostrarSinEntrevistas();
    } finally {
        Utils.hideLoading();
    }
}

/**
 * Muestra las entrevistas en el contenedor
 * @param {Array} entrevistas - Lista de entrevistas
 */
function mostrarEntrevistas(entrevistas) {
    const container = document.getElementById('entrevistasContainer');

    if (!entrevistas || entrevistas.length === 0) {
        mostrarSinEntrevistas();
        return;
    }

    let html = '';

    entrevistas.forEach(entrevista => {
        const estadoBadge = getEstadoBadge(entrevista.estado);
        const tipoIcon = getTipoIcon(entrevista.tipo);
        const fechaFormateada = formatearFechaEntrevista(entrevista.fecha_hora);

        html += `
            <div class="col-md-6 col-lg-4">
                <div class="card entrevista-card ${entrevista.estado} border-0 shadow-sm h-100">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <div class="calendario-icon">
                                <i class="${tipoIcon} text-primary"></i>
                            </div>
                            ${estadoBadge}
                        </div>

                        <div class="fecha-destacada mb-3">
                            ${fechaFormateada.dia}<br>
                            <small style="font-size: 1rem;">${fechaFormateada.mes}</small><br>
                            <small style="font-size: 1.2rem;">${fechaFormateada.hora}</small>
                        </div>

                        <h5 class="card-title mb-2">
                            ${entrevista.Postulacion?.Vacante?.titulo || 'Entrevista'}
                        </h5>

                        <p class="text-muted small mb-2">
                            <i class="bi bi-building me-1"></i>
                            ${entrevista.Postulacion?.Vacante?.Empresa?.nombre_empresa || 'Empresa'}
                        </p>

                        <p class="text-muted small mb-2">
                            <i class="bi bi-person me-1"></i>
                            Entrevistador: ${entrevista.Usuario?.nombre || 'Por definir'}
                        </p>

                        ${entrevista.ubicacion || entrevista.enlace ? `
                            <p class="text-muted small mb-2">
                                <i class="bi ${entrevista.tipo === 'video' ? 'bi-camera-video' : 'bi-geo-alt'} me-1"></i>
                                ${entrevista.tipo === 'video' ? 'Video llamada' : entrevista.ubicacion || 'Por definir'}
                            </p>
                        ` : ''}

                        ${entrevista.duracion ? `
                            <p class="text-muted small mb-3">
                                <i class="bi bi-clock me-1"></i>
                                Duración: ${entrevista.duracion} minutos
                            </p>
                        ` : ''}
                    </div>
                    <div class="card-footer bg-transparent">
                        <div class="d-flex gap-2">
                            <button class="btn btn-sm btn-outline-primary flex-fill" onclick="verDetalleEntrevista(${entrevista.id})">
                                <i class="bi bi-eye"></i> Ver Detalle
                            </button>
                            ${entrevista.estado === 'programada' ? `
                                <button class="btn btn-sm btn-success flex-fill" onclick="confirmarAsistencia(${entrevista.id})">
                                    <i class="bi bi-check-circle"></i> Confirmar
                                </button>
                            ` : ''}
                            ${entrevista.enlace && entrevista.tipo === 'video' ? `
                                <a href="${entrevista.enlace}" target="_blank" class="btn btn-sm btn-primary flex-fill">
                                    <i class="bi bi-camera-video"></i> Unirse
                                </a>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

/**
 * Muestra mensaje cuando no hay entrevistas
 */
function mostrarSinEntrevistas() {
    const container = document.getElementById('entrevistasContainer');
    container.innerHTML = `
        <div class="col-12">
            <div class="card border-0 shadow-sm">
                <div class="card-body text-center py-5">
                    <i class="bi bi-calendar-x fs-1 text-muted mb-3 d-block"></i>
                    <h5 class="text-muted mb-3">No tienes entrevistas programadas</h5>
                    <p class="text-muted mb-0">
                        Las empresas te contactarán cuando agenden entrevistas para tus postulaciones
                    </p>
                </div>
            </div>
        </div>
    `;

    // Limpiar próxima entrevista
    document.getElementById('proximaEntrevistaContainer').innerHTML = '';
}

/**
 * Muestra la próxima entrevista destacada
 * @param {Array} entrevistas - Lista de entrevistas
 */
function mostrarProximaEntrevista(entrevistas) {
    const container = document.getElementById('proximaEntrevistaContainer');

    // Filtrar entrevistas programadas o confirmadas que aún no han pasado
    const ahora = new Date();
    const proximasEntrevistas = entrevistas
        .filter(e => (e.estado === 'programada' || e.estado === 'confirmada') && new Date(e.fecha_hora) > ahora)
        .sort((a, b) => new Date(a.fecha_hora) - new Date(b.fecha_hora));

    if (proximasEntrevistas.length === 0) {
        container.innerHTML = '';
        return;
    }

    const proxima = proximasEntrevistas[0];
    const fechaFormateada = formatearFechaEntrevista(proxima.fecha_hora);
    const tiempoRestante = calcularTiempoRestante(proxima.fecha_hora);

    container.innerHTML = `
        <div class="card border-0 shadow-sm bg-gradient mb-4" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
            <div class="card-body text-white p-4">
                <h5 class="card-title mb-3">
                    <i class="bi bi-alarm me-2"></i>
                    Próxima Entrevista
                </h5>
                <div class="row align-items-center">
                    <div class="col-md-3 text-center mb-3 mb-md-0">
                        <div class="bg-white text-dark p-3 rounded">
                            <div style="font-size: 2.5rem; font-weight: bold;">${fechaFormateada.dia}</div>
                            <div>${fechaFormateada.mes}</div>
                            <div style="font-size: 1.3rem; font-weight: bold; margin-top: 0.5rem;">${fechaFormateada.hora}</div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <h4 class="mb-2">${proxima.Postulacion?.Vacante?.titulo || 'Entrevista'}</h4>
                        <p class="mb-1">
                            <i class="bi bi-building me-2"></i>
                            ${proxima.Postulacion?.Vacante?.Empresa?.nombre_empresa || 'Empresa'}
                        </p>
                        <p class="mb-1">
                            <i class="bi bi-person me-2"></i>
                            ${proxima.Usuario?.nombre || 'Entrevistador por definir'}
                        </p>
                        <p class="mb-0">
                            <i class="bi bi-clock-fill me-2"></i>
                            <strong>${tiempoRestante}</strong>
                        </p>
                    </div>
                    <div class="col-md-3 text-center">
                        ${proxima.estado === 'programada' ? `
                            <button class="btn btn-light btn-lg mb-2 w-100" onclick="confirmarAsistencia(${proxima.id})">
                                <i class="bi bi-check-circle me-2"></i>
                                Confirmar Asistencia
                            </button>
                        ` : ''}
                        <button class="btn btn-outline-light w-100" onclick="verDetalleEntrevista(${proxima.id})">
                            <i class="bi bi-eye me-2"></i>
                            Ver Detalles
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Actualiza las estadísticas de entrevistas
 * @param {Array} entrevistas - Lista de entrevistas
 */
function actualizarEstadisticas(entrevistas) {
    const total = entrevistas.length;
    const programadas = entrevistas.filter(e => e.estado === 'programada').length;
    const confirmadas = entrevistas.filter(e => e.estado === 'confirmada').length;
    const completadas = entrevistas.filter(e => e.estado === 'completada').length;

    document.getElementById('totalEntrevistas').textContent = total;
    document.getElementById('entrevistasProgramadas').textContent = programadas;
    document.getElementById('entrevistasConfirmadas').textContent = confirmadas;
    document.getElementById('entrevistasCompletadas').textContent = completadas;
}

/**
 * Retorna el badge HTML según el estado de la entrevista
 * @param {string} estado - Estado de la entrevista
 * @returns {string} - HTML del badge
 */
function getEstadoBadge(estado) {
    const badges = {
        'programada': '<span class="badge bg-primary">Programada</span>',
        'confirmada': '<span class="badge bg-success">Confirmada</span>',
        'completada': '<span class="badge bg-secondary">Completada</span>',
        'cancelada': '<span class="badge bg-danger">Cancelada</span>'
    };

    return badges[estado] || '<span class="badge bg-secondary">Desconocido</span>';
}

/**
 * Retorna el ícono según el tipo de entrevista
 * @param {string} tipo - Tipo de entrevista
 * @returns {string} - Clase del ícono
 */
function getTipoIcon(tipo) {
    const iconos = {
        'video': 'bi bi-camera-video',
        'presencial': 'bi bi-people',
        'telefonica': 'bi bi-telephone'
    };

    return iconos[tipo] || 'bi bi-calendar-event';
}

/**
 * Formatea la fecha de la entrevista
 * @param {string} fechaHora - Fecha y hora de la entrevista
 * @returns {Object} - Objeto con día, mes y hora formateados
 */
function formatearFechaEntrevista(fechaHora) {
    const fecha = new Date(fechaHora);
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    return {
        dia: fecha.getDate(),
        mes: meses[fecha.getMonth()],
        hora: fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    };
}

/**
 * Calcula el tiempo restante hasta la entrevista
 * @param {string} fechaHora - Fecha y hora de la entrevista
 * @returns {string} - Texto descriptivo del tiempo restante
 */
function calcularTiempoRestante(fechaHora) {
    const ahora = new Date();
    const fecha = new Date(fechaHora);
    const diferencia = fecha - ahora;

    if (diferencia <= 0) {
        return 'La entrevista ya pasó';
    }

    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));

    if (dias > 0) {
        return `En ${dias} día${dias > 1 ? 's' : ''} y ${horas} hora${horas !== 1 ? 's' : ''}`;
    } else if (horas > 0) {
        return `En ${horas} hora${horas > 1 ? 's' : ''} y ${minutos} minuto${minutos !== 1 ? 's' : ''}`;
    } else {
        return `En ${minutos} minuto${minutos > 1 ? 's' : ''}`;
    }
}

/**
 * Muestra el detalle completo de una entrevista
 * @param {number} entrevistaId - ID de la entrevista
 */
function verDetalleEntrevista(entrevistaId) {
    const entrevista = todasLasEntrevistas.find(e => e.id === entrevistaId);

    if (!entrevista) {
        Utils.showError('Entrevista no encontrada');
        return;
    }

    const fechaFormateada = new Date(entrevista.fecha_hora).toLocaleString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    const modalBody = document.getElementById('modalDetalleEntrevistaBody');
    modalBody.innerHTML = `
        <div class="mb-3">
            <h5>${entrevista.Postulacion?.Vacante?.titulo || 'Entrevista'}</h5>
            ${getEstadoBadge(entrevista.estado)}
        </div>

        <div class="row mb-3">
            <div class="col-md-6">
                <strong>Empresa:</strong><br>
                ${entrevista.Postulacion?.Vacante?.Empresa?.nombre_empresa || 'No especificada'}
            </div>
            <div class="col-md-6">
                <strong>Tipo:</strong><br>
                ${entrevista.tipo || 'No especificado'}
            </div>
        </div>

        <div class="row mb-3">
            <div class="col-md-6">
                <strong>Fecha y Hora:</strong><br>
                ${fechaFormateada}
            </div>
            <div class="col-md-6">
                <strong>Duración Estimada:</strong><br>
                ${entrevista.duracion ? entrevista.duracion + ' minutos' : 'No especificada'}
            </div>
        </div>

        <div class="mb-3">
            <strong>Entrevistador:</strong><br>
            ${entrevista.Usuario?.nombre || 'Por definir'}
            ${entrevista.Usuario?.email ? `<br><small class="text-muted">${entrevista.Usuario.email}</small>` : ''}
        </div>

        ${entrevista.tipo === 'video' && entrevista.enlace ? `
            <div class="mb-3">
                <strong>Enlace de Video llamada:</strong><br>
                <a href="${entrevista.enlace}" target="_blank" class="btn btn-primary mt-2">
                    <i class="bi bi-camera-video me-2"></i> Unirse a la llamada
                </a>
            </div>
        ` : ''}

        ${entrevista.tipo === 'presencial' && entrevista.ubicacion ? `
            <div class="mb-3">
                <strong>Ubicación:</strong><br>
                ${entrevista.ubicacion}
            </div>
        ` : ''}

        ${entrevista.notas ? `
            <div class="mb-3">
                <strong>Notas adicionales:</strong><br>
                <div class="alert alert-info">
                    ${entrevista.notas}
                </div>
            </div>
        ` : ''}

        ${entrevista.observaciones ? `
            <div class="mb-3">
                <strong>Observaciones:</strong><br>
                <div class="alert alert-warning">
                    ${entrevista.observaciones}
                </div>
            </div>
        ` : ''}

        <div class="timeline">
            <h6 class="mb-3">Preparación para la Entrevista</h6>
            <div class="timeline-item">
                <strong>Investiga la empresa</strong>
                <p class="text-muted small mb-0">Conoce su misión, visión y valores</p>
            </div>
            <div class="timeline-item">
                <strong>Repasa tu CV</strong>
                <p class="text-muted small mb-0">Prepárate para hablar de tu experiencia</p>
            </div>
            <div class="timeline-item">
                <strong>Prepara preguntas</strong>
                <p class="text-muted small mb-0">Muestra interés en el puesto y la empresa</p>
            </div>
            <div class="timeline-item">
                <strong>Verifica la tecnología</strong>
                <p class="text-muted small mb-0">Asegúrate de que tu cámara y micrófono funcionen</p>
            </div>
        </div>
    `;

    const modalFooter = document.getElementById('modalDetalleEntrevistaFooter');
    modalFooter.innerHTML = `
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
        ${entrevista.estado === 'programada' ? `
            <button type="button" class="btn btn-success" onclick="confirmarAsistencia(${entrevista.id})">
                <i class="bi bi-check-circle me-1"></i> Confirmar Asistencia
            </button>
        ` : ''}
        ${entrevista.enlace && entrevista.tipo === 'video' ? `
            <a href="${entrevista.enlace}" target="_blank" class="btn btn-primary">
                <i class="bi bi-camera-video me-1"></i> Unirse a la Llamada
            </a>
        ` : ''}
    `;

    const modal = new bootstrap.Modal(document.getElementById('modalDetalleEntrevista'));
    modal.show();
}

/**
 * Confirma la asistencia a una entrevista
 * @param {number} entrevistaId - ID de la entrevista
 */
async function confirmarAsistencia(entrevistaId) {
    if (!confirm('¿Confirmas tu asistencia a esta entrevista?')) {
        return;
    }

    try {
        Utils.showLoading('Confirmando asistencia...');

        // Aquí iría la llamada al API para confirmar
        // const response = await EntrevistasService.confirmarAsistencia(entrevistaId);

        // Simulación temporal
        await new Promise(resolve => setTimeout(resolve, 1000));

        Utils.showSuccess('Asistencia confirmada correctamente');

        // Actualizar el estado localmente
        const entrevista = todasLasEntrevistas.find(e => e.id === entrevistaId);
        if (entrevista) {
            entrevista.estado = 'confirmada';
        }

        // Recargar entrevistas
        await cargarEntrevistas();

        // Cerrar modal si está abierto
        const modal = bootstrap.Modal.getInstance(document.getElementById('modalDetalleEntrevista'));
        if (modal) {
            modal.hide();
        }
    } catch (error) {
        Utils.showError('Error al confirmar asistencia: ' + error.message);
    } finally {
        Utils.hideLoading();
    }
}

/**
 * Sincroniza las entrevistas con un calendario externo
 */
function sincronizarCalendario() {
    Utils.showInfo('Funcionalidad en desarrollo');
    // Aquí se implementaría la sincronización con Google Calendar, Outlook, etc.
}

/**
 * Filtra las entrevistas según los filtros seleccionados
 */
function filtrarEntrevistas() {
    const filtroEstado = document.getElementById('filtroEstado').value;
    const filtroTipo = document.getElementById('filtroTipo').value;

    let entrevistasFiltradas = [...todasLasEntrevistas];

    if (filtroEstado) {
        entrevistasFiltradas = entrevistasFiltradas.filter(e => e.estado === filtroEstado);
    }

    if (filtroTipo) {
        entrevistasFiltradas = entrevistasFiltradas.filter(e => e.tipo === filtroTipo);
    }

    mostrarEntrevistas(entrevistasFiltradas);
}

/**
 * Limpia todos los filtros
 */
function limpiarFiltros() {
    document.getElementById('filtroEstado').value = '';
    document.getElementById('filtroTipo').value = '';
    mostrarEntrevistas(todasLasEntrevistas);
}
