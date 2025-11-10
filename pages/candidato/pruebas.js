/**
 * Script específico para la página de pruebas del candidato
 */

(function() {
    'use strict';

    // Proteger la página - solo candidatos
    AuthService.protectPage(CONFIG.ROLES.CANDIDATO);

    let todasLasPruebas = [];

    // Inicialización cuando el DOM esté listo
    document.addEventListener('DOMContentLoaded', async () => {
        // Cargar pruebas
        await cargarPruebas();
    });

    /**
     * Carga todas las pruebas asignadas al candidato
     */
    async function cargarPruebas() {
        try {
            const response = await PruebasService.obtenerMisAsignaciones();

            if (response.success) {
                todasLasPruebas = response.data || [];
                mostrarPruebas(todasLasPruebas);
                actualizarEstadisticas(todasLasPruebas);
            } else {
                Helpers.showError(response.message || 'Error al cargar pruebas');
            }
        } catch (error) {
            Helpers.showError('Error al cargar pruebas: ' + error.message);
            mostrarSinPruebas();
        }
    }

    /**
     * Muestra las pruebas en el contenedor
     * @param {Array} pruebas - Lista de pruebas
     */
    function mostrarPruebas(pruebas) {
    const container = document.getElementById('pruebasContainer');

    if (!pruebas || pruebas.length === 0) {
        mostrarSinPruebas();
        return;
    }

    let html = '';

    pruebas.forEach(prueba => {
        const estado = calcularEstadoPrueba(prueba);
        const estadoBadge = getEstadoBadge(estado);
        const tiempoRestante = calcularTiempoRestante(prueba.fecha_limite);
        const porcentaje = prueba.puntaje_obtenido !== null && prueba.Prueba?.puntaje_maximo
            ? Math.round((prueba.puntaje_obtenido / prueba.Prueba.puntaje_maximo) * 100)
            : null;

        html += `
            <div class="col-md-6 col-lg-4">
                <div class="card prueba-card ${estado} border-0 shadow-sm h-100">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <div class="test-icon">
                                <i class="bi bi-clipboard-data text-primary"></i>
                            </div>
                            ${estadoBadge}
                        </div>

                        <h5 class="card-title mb-2">
                            ${prueba.Prueba?.nombre || 'Prueba sin nombre'}
                        </h5>

                        <p class="text-muted small mb-3">
                            ${prueba.Prueba?.descripcion || 'Sin descripción'}
                        </p>

                        <div class="mb-2">
                            <small class="text-muted">
                                <i class="bi bi-briefcase me-1"></i>
                                Para: ${prueba.Postulacion?.Vacante?.titulo || 'N/A'}
                            </small>
                        </div>

                        <div class="mb-2">
                            <small class="text-muted">
                                <i class="bi bi-building me-1"></i>
                                ${prueba.Postulacion?.Vacante?.Empresa?.nombre_empresa || 'Empresa'}
                            </small>
                        </div>

                        <hr>

                        <div class="mb-2">
                            <small class="text-muted">
                                <i class="bi bi-calendar-event me-1"></i>
                                Asignada: ${Helpers.formatDate(prueba.fecha_asignacion)}
                            </small>
                        </div>

                        <div class="mb-3">
                            <small class="${tiempoRestante.clase}">
                                <i class="bi bi-alarm me-1"></i>
                                ${tiempoRestante.texto}
                            </small>
                        </div>

                        ${estado === 'completada' && porcentaje !== null ? `
                            <div class="mb-3">
                                <strong class="text-success">
                                    <i class="bi bi-trophy me-1"></i>
                                    Puntaje: ${prueba.puntaje_obtenido}/${prueba.Prueba.puntaje_maximo} (${porcentaje}%)
                                </strong>
                            </div>
                        ` : ''}

                        ${prueba.Prueba?.duracion ? `
                            <div class="mb-2">
                                <small class="text-muted">
                                    <i class="bi bi-clock me-1"></i>
                                    Duración: ${prueba.Prueba.duracion} minutos
                                </small>
                            </div>
                        ` : ''}

                        ${prueba.Prueba?.numero_preguntas ? `
                            <div class="mb-3">
                                <small class="text-muted">
                                    <i class="bi bi-question-circle me-1"></i>
                                    ${prueba.Prueba.numero_preguntas} preguntas
                                </small>
                            </div>
                        ` : ''}
                    </div>
                    <div class="card-footer bg-transparent">
                        ${estado === 'pendiente' ? `
                            <button class="btn btn-primary w-100" onclick="iniciarPrueba(${prueba.id})">
                                <i class="bi bi-play-fill me-1"></i> Iniciar Prueba
                            </button>
                        ` : estado === 'completada' ? `
                            <button class="btn btn-outline-primary w-100" onclick="verResultados(${prueba.id})">
                                <i class="bi bi-graph-up me-1"></i> Ver Resultados
                            </button>
                        ` : `
                            <button class="btn btn-secondary w-100" disabled>
                                <i class="bi bi-x-circle me-1"></i> Prueba Expirada
                            </button>
                        `}
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

    /**
     * Muestra mensaje cuando no hay pruebas
     */
    function mostrarSinPruebas() {
    const container = document.getElementById('pruebasContainer');
    container.innerHTML = `
        <div class="col-12">
            <div class="card border-0 shadow-sm">
                <div class="card-body text-center py-5">
                    <i class="bi bi-clipboard-x fs-1 text-muted mb-3 d-block"></i>
                    <h5 class="text-muted mb-3">No tienes pruebas asignadas</h5>
                    <p class="text-muted mb-0">
                        Las empresas te asignarán pruebas cuando avances en los procesos de selección
                    </p>
                </div>
            </div>
        </div>
    `;
}

    /**
     * Actualiza las estadísticas de pruebas
     * @param {Array} pruebas - Lista de pruebas
     */
    function actualizarEstadisticas(pruebas) {
    const total = pruebas.length;
    let pendientes = 0;
    let completadas = 0;
    let expiradas = 0;

    pruebas.forEach(prueba => {
        const estado = calcularEstadoPrueba(prueba);
        if (estado === 'pendiente') pendientes++;
        else if (estado === 'completada') completadas++;
        else if (estado === 'expirada') expiradas++;
    });

    document.getElementById('totalPruebas').textContent = total;
    document.getElementById('pruebasPendientes').textContent = pendientes;
    document.getElementById('pruebasCompletadas').textContent = completadas;
    document.getElementById('pruebasExpiradas').textContent = expiradas;
}

    /**
     * Calcula el estado de una prueba
     * @param {Object} prueba - Datos de la prueba
     * @returns {string} - Estado de la prueba
     */
    function calcularEstadoPrueba(prueba) {
    if (prueba.fecha_completado) {
        return 'completada';
    }

    if (new Date(prueba.fecha_limite) < new Date()) {
        return 'expirada';
    }

    return 'pendiente';
}

    /**
     * Retorna el badge HTML según el estado de la prueba
     * @param {string} estado - Estado de la prueba
     * @returns {string} - HTML del badge
     */
    function getEstadoBadge(estado) {
    const badges = {
        'pendiente': '<span class="badge bg-warning">Pendiente</span>',
        'completada': '<span class="badge bg-success">Completada</span>',
        'expirada': '<span class="badge bg-danger">Expirada</span>'
    };

    return badges[estado] || '<span class="badge bg-secondary">Desconocido</span>';
}

    /**
     * Calcula el tiempo restante para completar la prueba
     * @param {string} fechaLimite - Fecha límite de la prueba
     * @returns {Object} - Objeto con texto y clase CSS
     */
    function calcularTiempoRestante(fechaLimite) {
        if (!fechaLimite) {
            return {
                texto: 'Sin fecha límite',
                clase: 'text-muted'
            };
        }

        const ahora = new Date();
        const limite = new Date(fechaLimite);
        const diferencia = limite - ahora;

        if (diferencia <= 0) {
            return {
                texto: 'Fecha límite: ' + Helpers.formatDate(fechaLimite),
                clase: 'text-danger fw-bold'
            };
        }

        const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
        const horas = Math.floor((diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        let texto = 'Vence: ';
        let clase = 'text-muted';

        if (dias > 7) {
            texto += Helpers.formatDate(fechaLimite);
        } else if (dias > 0) {
            texto += `en ${dias} día${dias > 1 ? 's' : ''}`;
            clase = dias <= 2 ? 'text-danger fw-bold' : 'text-warning';
        } else if (horas > 0) {
            texto += `en ${horas} hora${horas > 1 ? 's' : ''}`;
            clase = 'text-danger fw-bold';
        } else {
            texto += 'en menos de 1 hora';
            clase = 'text-danger fw-bold';
        }

        return { texto, clase };
    }

    /**
     * Muestra el modal para iniciar una prueba
     * @param {number} pruebaId - ID de la asignación de prueba
     */
    window.iniciarPrueba = async function(pruebaId) {
        const prueba = todasLasPruebas.find(p => p.id_asignacion === pruebaId);

        if (!prueba) {
            Helpers.showError('Prueba no encontrada');
            return;
        }

    const modalBody = document.getElementById('modalIniciarPruebaBody');
    modalBody.innerHTML = `
        <div class="alert alert-warning border-0">
            <i class="bi bi-exclamation-triangle me-2"></i>
            <strong>Importante:</strong> Una vez que inicies la prueba, no podrás pausarla.
        </div>

        <h5 class="mb-3">${prueba.Prueba?.nombre || 'Prueba'}</h5>

        <ul class="list-unstyled">
            <li class="mb-2">
                <i class="bi bi-clock text-primary me-2"></i>
                <strong>Duración:</strong> ${prueba.Prueba?.duracion_minutos || 'No especificada'} minutos
            </li>
            <li class="mb-2">
                <i class="bi bi-question-circle text-primary me-2"></i>
                <strong>Número de preguntas:</strong> ${prueba.Prueba?.Preguntas?.length || 'No especificado'}
            </li>
            <li class="mb-2">
                <i class="bi bi-alarm text-primary me-2"></i>
                <strong>Fecha límite:</strong> ${prueba.fecha_limite ? Helpers.formatDate(prueba.fecha_limite) : 'Sin límite'}
            </li>
        </ul>

        <p class="text-muted small mb-0">
            ${prueba.Prueba?.descripcion || 'Sin descripción adicional'}
        </p>
    `;

        const confirmado = await Helpers.confirm(
            '¿Iniciar prueba?',
            'Una vez que inicies la prueba, no podrás pausarla. Asegúrate de tener tiempo disponible.',
            'Iniciar'
        );

        if (confirmado) {
            confirmarIniciarPrueba(pruebaId);
        }
    };

    /**
     * Confirma e inicia la prueba
     * @param {number} pruebaId - ID de la asignación de prueba
     */
    async function confirmarIniciarPrueba(pruebaId) {
        try {
            // Iniciar la prueba en el backend
            const response = await PruebasService.iniciarPrueba(pruebaId);

            if (response.success) {
                Helpers.showSuccess('Prueba iniciada. Redirigiendo...');
                setTimeout(() => {
                    window.location.href = `/pages/candidato/realizar-prueba.html?id=${pruebaId}`;
                }, 1000);
            }
        } catch (error) {
            Helpers.showError(error.message || 'Error al iniciar la prueba');
        }
    }

    /**
     * Muestra los resultados de una prueba completada
     * @param {number} pruebaId - ID de la asignación de prueba
     */
    window.verResultados = async function(pruebaId) {
        try {
            const response = await PruebasService.obtenerResultado(pruebaId);

            if (!response.success) {
                Helpers.showError('No se pudieron cargar los resultados');
                return;
            }

            const prueba = response.data;

            const porcentaje = prueba.porcentaje || 0;

            await Swal.fire({
                title: 'Resultados de la Prueba',
                html: `
        <div class="text-center mb-4">
            <div class="display-1 mb-3">
                ${porcentaje >= 70 ? '<i class="bi bi-emoji-smile text-success"></i>' :
                  porcentaje >= 50 ? '<i class="bi bi-emoji-neutral text-warning"></i>' :
                  '<i class="bi bi-emoji-frown text-danger"></i>'}
            </div>
            <h3 class="mb-2">Tu Puntaje</h3>
            <div class="display-4 fw-bold ${porcentaje >= 70 ? 'text-success' : porcentaje >= 50 ? 'text-warning' : 'text-danger'}">
                ${porcentaje}%
            </div>
            <p class="text-muted">${prueba.puntaje_obtenido} de ${prueba.Prueba?.puntaje_maximo} puntos</p>
        </div>

        <hr>

        <div class="row mb-3">
            <div class="col-md-6">
                <strong>Prueba:</strong><br>
                ${prueba.Prueba?.nombre || 'N/A'}
            </div>
            <div class="col-md-6">
                <strong>Completada:</strong><br>
                ${Utils.formatDate(prueba.fecha_completado)}
            </div>
        </div>

        <div class="row mb-3">
            <div class="col-md-6">
                <strong>Vacante:</strong><br>
                ${prueba.Postulacion?.Vacante?.titulo || 'N/A'}
            </div>
            <div class="col-md-6">
                <strong>Empresa:</strong><br>
                ${prueba.Postulacion?.Vacante?.Empresa?.nombre_empresa || 'N/A'}
            </div>
        </div>

        ${prueba.observaciones ? `
            <hr>
            <div class="alert alert-info">
                <strong>Observaciones:</strong><br>
                ${prueba.observaciones}
            </div>
        ` : ''}

        <div class="alert alert-${porcentaje >= 70 ? 'success' : porcentaje >= 50 ? 'warning' : 'danger'} border-0 mt-3">
            <strong>
                ${porcentaje >= 70 ? '¡Excelente trabajo!' :
                  porcentaje >= 50 ? 'Buen intento' :
                  'Sigue mejorando'}
            </strong><br>
            <small>
                ${porcentaje >= 70 ? 'Has obtenido un resultado destacado en esta prueba.' :
                  porcentaje >= 50 ? 'Has aprobado la prueba. Sigue preparándote.' :
                  'Te recomendamos seguir practicando para mejorar tus resultados.'}
            </small>
        </div>
    `;

    const modal = new bootstrap.Modal(document.getElementById('modalVerResultados'));
    modal.show();
}

    /**
     * Filtra las pruebas según el estado seleccionado
     */
    window.filtrarPruebas = function() {
    const filtroEstado = document.getElementById('filtroEstado').value;

    let pruebasFiltradas = [...todasLasPruebas];

    if (filtroEstado) {
        pruebasFiltradas = pruebasFiltradas.filter(p => {
            const estado = calcularEstadoPrueba(p);
            return estado === filtroEstado;
        });
    }

    mostrarPruebas(pruebasFiltradas);
}

/**
 * Ordena las pruebas según el criterio seleccionado
 */
function ordenarPruebas() {
    const orden = document.getElementById('ordenar').value;
    let pruebasOrdenadas = [...todasLasPruebas];

    switch (orden) {
        case 'fecha_limite_asc':
            pruebasOrdenadas.sort((a, b) => new Date(a.fecha_limite) - new Date(b.fecha_limite));
            break;
        case 'fecha_limite_desc':
            pruebasOrdenadas.sort((a, b) => new Date(b.fecha_limite) - new Date(a.fecha_limite));
            break;
        case 'fecha_asignacion':
            pruebasOrdenadas.sort((a, b) => new Date(b.fecha_asignacion) - new Date(a.fecha_asignacion));
            break;
    }

        todasLasPruebas = pruebasOrdenadas;
        mostrarPruebas(todasLasPruebas);
    };

    /**
     * Limpia todos los filtros
     */
    window.limpiarFiltros = function() {
        document.getElementById('filtroEstado')?.value = '';
        document.getElementById('ordenar')?.value = 'fecha_limite_asc';
        cargarPruebas();
    };

})();
