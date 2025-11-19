/**
 * Postulaciones
 * Maneja la visualización y gestión de postulaciones recibidas
 */

(function() {
    'use strict';

    // Proteger la página - solo empresas
    AuthService.protectPage(CONFIG.ROLES.EMPRESA);

    let postulaciones = [];
    let postulacionesFiltradas = [];
    let vacantes = [];
    let postulacionSeleccionada = null;
    let modalCambiarEstado = null;
    let modalAsignarPrueba = null;
    let modalContratar = null;
    let pruebasDisponibles = [];

    /**
     * Inicializa la página
     */
    async function init() {
        // Inicializar modals
        modalCambiarEstado = new bootstrap.Modal(document.getElementById('modalCambiarEstado'));
        modalAsignarPrueba = new bootstrap.Modal(document.getElementById('modalAsignarPrueba'));
        modalContratar = new bootstrap.Modal(document.getElementById('modalContratar'));

        // Cargar datos
        await Promise.all([
            cargarVacantes(),
            cargarPostulaciones(),
            cargarPruebasDisponibles()
        ]);

        // Si viene de detalle de vacante, aplicar filtro
        const vacanteIdParam = Helpers.getURLParameter('vacante');
        if (vacanteIdParam) {
            document.getElementById('filtro-vacante').value = vacanteIdParam;
            aplicarFiltros();
        }

        // Event listeners
        document.getElementById('filtro-buscar').addEventListener('input', aplicarFiltros);
        document.getElementById('filtro-vacante').addEventListener('change', aplicarFiltros);
        document.getElementById('filtro-estado').addEventListener('change', aplicarFiltros);
        document.getElementById('filtro-ordenar').addEventListener('change', aplicarFiltros);
        document.getElementById('btn-limpiar-filtros').addEventListener('click', limpiarFiltros);
        document.getElementById('btn-confirmar-estado').addEventListener('click', confirmarCambioEstado);
        document.getElementById('btn-confirmar-asignar-prueba').addEventListener('click', confirmarAsignarPrueba);
        document.getElementById('btn-exportar').addEventListener('click', exportarPostulaciones);
        
        // Event listeners para cambiar entre tipos de prueba
        document.querySelectorAll('input[name="tipo-prueba"]').forEach(radio => {
            radio.addEventListener('change', cambiarTipoPrueba);
        });
    }

    /**
     * Carga las vacantes para el filtro
     */
    async function cargarVacantes() {
        try {
            const response = await EmpresaService.getVacantes();
            if (response.success) {
                // El backend devuelve data como array directo, no data.vacantes
                const vacantesRaw = Array.isArray(response.data) ? response.data : [];

                // Mapear campos del backend al formato esperado
                vacantes = vacantesRaw.map(v => ({
                    vacante_id: v.id,
                    titulo: v.titulo
                }));

                llenarSelectVacantes();
            }
        } catch (error) {
            console.error('Error al cargar vacantes:', error);
        }
    }

    /**
     * Llena el select de vacantes
     */
    function llenarSelectVacantes() {
        const select = document.getElementById('filtro-vacante');
        vacantes.forEach(vacante => {
            const option = document.createElement('option');
            option.value = vacante.vacante_id;
            option.textContent = vacante.titulo;
            select.appendChild(option);
        });
    }

    /**
     * Carga las postulaciones
     */
    async function cargarPostulaciones() {
        try {
            mostrarLoading();

            const response = await EmpresaService.getPostulaciones();

            if (response.success) {
                // El backend devuelve data como array directo o como objeto con postulaciones
                postulaciones = Array.isArray(response.data)
                    ? response.data
                    : (response.data.postulaciones || []);

                postulacionesFiltradas = [...postulaciones];
                actualizarEstadisticas();
                renderizarPostulaciones();
            }
        } catch (error) {
            console.error('Error al cargar postulaciones:', error);
            Helpers.showError('Error al cargar las postulaciones');
            mostrarEmpty();
        }
    }

    /**
     * Actualiza las estadísticas por estado
     */
    function actualizarEstadisticas() {
        const estados = ['pendiente', 'en_revision', 'preseleccionado', 'entrevista', 'contratado', 'rechazado'];

        estados.forEach(estado => {
            const count = postulaciones.filter(p => p.estado === estado).length;
            const elemento = document.getElementById(`count-${estado}`);
            if (elemento) {
                elemento.textContent = count;
            }
        });
    }

    /**
     * Renderiza las postulaciones en la tabla
     */
    function renderizarPostulaciones() {
        const tbody = document.getElementById('tbody-postulaciones');
        const tablaContainer = document.getElementById('tabla-container');
        const emptyState = document.getElementById('empty-state');
        const loading = document.getElementById('loading');

        loading.style.display = 'none';

        if (postulacionesFiltradas.length === 0) {
            if (postulaciones.length === 0) {
                tablaContainer.style.display = 'none';
                emptyState.style.display = 'block';
            } else {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="6" class="text-center py-5">
                            <i class="bi bi-search text-muted" style="font-size: 3rem;"></i>
                            <p class="text-muted mt-3">No se encontraron postulaciones con los filtros aplicados</p>
                        </td>
                    </tr>
                `;
                tablaContainer.style.display = 'block';
                emptyState.style.display = 'none';
            }
            return;
        }

        tablaContainer.style.display = 'block';
        emptyState.style.display = 'none';
        tbody.innerHTML = '';

        postulacionesFiltradas.forEach(postulacion => {
            const tr = document.createElement('tr');

            // Acceder correctamente a los datos anidados
            const candidato = postulacion.candidato || {};
            const usuario = candidato.usuario || {};
            const vacante = postulacion.vacante || {};

            tr.innerHTML = `
                <td>
                    <div class="d-flex align-items-center">
                        <div class="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3" style="width: 40px; height: 40px;">
                            <i class="bi bi-person-fill"></i>
                        </div>
                        <div>
                            <div class="fw-semibold">${usuario.nombre || 'Sin nombre'}</div>
                            <small class="text-muted">${usuario.email || 'Sin email'}</small>
                        </div>
                    </div>
                </td>
                <td>
                    <div class="fw-semibold">${vacante.titulo || 'N/A'}</div>
                    <small class="text-muted">${vacante.ubicacion || ''}</small>
                </td>
                <td>
                    <small>${Helpers.formatDateShort(postulacion.fecha_postulacion)}</small><br>
                    <small class="text-muted">${Helpers.timeAgo(postulacion.fecha_postulacion)}</small>
                </td>
                <td>${Helpers.getPostulacionBadge(postulacion.estado)}</td>
                <td>
                    ${candidato.cv_url ?
                        `<a href="${candidato.cv_url}" target="_blank" class="btn btn-sm btn-outline-primary">
                            <i class="bi bi-file-pdf"></i> Ver CV
                        </a>` :
                        '<span class="text-muted small">Sin CV</span>'
                    }
                </td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" onclick="verCandidato(${candidato.id})" title="Ver perfil">
                            <i class="bi bi-eye"></i>
                        </button>
                        <button class="btn btn-outline-secondary" onclick="abrirCambiarEstado(${postulacion.id})" title="Cambiar estado">
                            <i class="bi bi-arrow-repeat"></i>
                        </button>
                        <button class="btn btn-outline-success" onclick="abrirAsignarPrueba(${postulacion.id})" title="Asignar prueba">
                            <i class="bi bi-clipboard-check"></i>
                        </button>
                        <button class="btn btn-outline-warning" onclick="verResultadosPruebas(${candidato.id}, ${postulacion.id})" title="Ver resultados de pruebas">
                            <i class="bi bi-bar-chart"></i>
                        </button>
                        <button class="btn btn-outline-primary" onclick="analizarConIA(${postulacion.id})" title="Análisis con IA">
                            <i class="bi bi-robot"></i>
                        </button>
                        ${postulacion.estado === 'entrevista' || postulacion.estado === 'pruebas' 
                            ? `<button class="btn btn-outline-dark" onclick="abrirContratar(${postulacion.id})" title="Contratar">
                                <i class="bi bi-person-check"></i>
                               </button>`
                            : ''}
                        <button class="btn btn-outline-info" onclick="enviarMensaje(${candidato.id})" title="Enviar mensaje">
                            <i class="bi bi-envelope"></i>
                        </button>
                    </div>
                </td>
            `;

            tbody.appendChild(tr);
        });
    }

    /**
     * Aplica los filtros
     */
    function aplicarFiltros() {
        const buscar = document.getElementById('filtro-buscar').value.toLowerCase();
        const vacanteId = document.getElementById('filtro-vacante').value;
        const estado = document.getElementById('filtro-estado').value;
        const ordenar = document.getElementById('filtro-ordenar').value;

        // Filtrar
        postulacionesFiltradas = postulaciones.filter(postulacion => {
            const candidato = postulacion.candidato || {};
            const usuario = candidato.usuario || {};
            const vacante = postulacion.vacante || {};
            const coincideBusqueda = !buscar ||
                (usuario.nombre && usuario.nombre.toLowerCase().includes(buscar)) ||
                (usuario.email && usuario.email.toLowerCase().includes(buscar));
            const coincideVacante = !vacanteId || vacante.id == vacanteId;
            const coincideEstado = !estado || postulacion.estado === estado;
            return coincideBusqueda && coincideVacante && coincideEstado;
        });

        // Ordenar
        switch(ordenar) {
            case 'reciente':
                postulacionesFiltradas.sort((a, b) =>
                    new Date(b.fecha_postulacion) - new Date(a.fecha_postulacion)
                );
                break;
            case 'antigua':
                postulacionesFiltradas.sort((a, b) =>
                    new Date(a.fecha_postulacion) - new Date(b.fecha_postulacion)
                );
                break;
            case 'nombre':
                postulacionesFiltradas.sort((a, b) => {
                    const nombreA = (a.candidato?.usuario?.nombre || '').toLowerCase();
                    const nombreB = (b.candidato?.usuario?.nombre || '').toLowerCase();
                    return nombreA.localeCompare(nombreB);
                });
                break;
        }

        renderizarPostulaciones();
    }

    /**
     * Limpia los filtros
     */
    function limpiarFiltros() {
        document.getElementById('filtro-buscar').value = '';
        document.getElementById('filtro-vacante').value = '';
        document.getElementById('filtro-estado').value = '';
        document.getElementById('filtro-ordenar').value = 'reciente';
        aplicarFiltros();
    }

    /**
     * Abre el modal para cambiar estado
     * @param {number} postulacionId - ID de la postulación
     */
    window.abrirCambiarEstado = function(postulacionId) {
        postulacionSeleccionada = postulaciones.find(p => p.id === postulacionId);
        if (!postulacionSeleccionada) return;

        const candidato = postulacionSeleccionada.candidato || {};
        const usuario = candidato.usuario || {};
        const vacante = postulacionSeleccionada.vacante || {};

        document.getElementById('modal-candidato-nombre').textContent = usuario.nombre || 'Sin nombre';
        document.getElementById('modal-vacante-titulo').textContent = vacante.titulo || 'N/A';
        document.getElementById('nuevo-estado').value = postulacionSeleccionada.estado;
        document.getElementById('observaciones').value = '';

        modalCambiarEstado.show();
    };

    /**
     * Confirma el cambio de estado
     */
    async function confirmarCambioEstado() {
        if (!postulacionSeleccionada) return;

        try {
            const nuevoEstado = document.getElementById('nuevo-estado').value;
            const observaciones = document.getElementById('observaciones').value.trim();

            if (!nuevoEstado) {
                Helpers.showError('Debes seleccionar un estado');
                return;
            }

            if (nuevoEstado === postulacionSeleccionada.estado && !observaciones) {
                Helpers.showWarning('Selecciona un estado diferente o agrega observaciones');
                return;
            }

            Helpers.showLoader();

            const response = await VacantesService.actualizarEstadoPostulacion(
                postulacionSeleccionada.id,
                nuevoEstado,
                observaciones
            );

            if (response.success) {
                Helpers.showSuccess('Estado actualizado correctamente');
                modalCambiarEstado.hide();
                await cargarPostulaciones();
            }
        } catch (error) {
            console.error('Error al actualizar estado:', error);
            Helpers.showError(error.message || 'Error al actualizar el estado');
        } finally {
            Helpers.hideLoader();
        }
    }

    /**
     * Ver perfil del candidato
     * @param {number} candidatoId - ID del candidato
     */
    window.verCandidato = function(candidatoId) {
        window.location.href = `/pages/empresa/detalle-candidato.html?id=${candidatoId}`;
    };

    /**
     * Enviar mensaje al candidato
     * @param {number} candidatoId - ID del candidato
     */
    window.enviarMensaje = function(candidatoId) {
        Helpers.showWarning('Funcionalidad de mensajería en desarrollo');
    };

    /**
     * Ver resultados de pruebas psicométricas del candidato
     */
    window.verResultadosPruebas = async function(candidatoId, postulacionId) {
        try {
            // Obtener pruebas asignadas al candidato
            const response = await ApiService.get(`/pruebas-psicometricas/candidato/${candidatoId}/resultados`);
            
            if (response.success) {
                const resultados = response.data || [];
                
                if (resultados.length === 0) {
                    Helpers.showWarning('Este candidato no tiene pruebas asignadas aún');
                    return;
                }
                
                mostrarModalResultados(resultados, candidatoId);
            }
        } catch (error) {
            console.error('Error al cargar resultados:', error);
            Helpers.showError('Error al cargar los resultados de las pruebas');
        }
    };

    /**
     * Muestra modal con resultados de pruebas
     */
    async function mostrarModalResultados(resultados, candidatoId) {
        const candidato = postulaciones.find(p => p.candidato?.id === candidatoId)?.candidato;
        const nombreCandidato = candidato?.usuario?.nombre || 'Candidato';
        
        let html = `
            <div class="modal fade" id="modalResultadosPruebas" tabindex="-1">
                <div class="modal-dialog modal-xl modal-dialog-scrollable">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                <i class="bi bi-clipboard-data me-2"></i>
                                Resultados de Pruebas - ${nombreCandidato}
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row">
        `;
        
        // Obtener evaluaciones para cada resultado
        for (const resultado of resultados) {
            const prueba = resultado.prueba || {};
            const asignacion = resultado.asignacion || resultado;
            const estado = asignacion.estado;
            const completada = estado === 'completada';
            
            // Intentar obtener evaluación
            let evaluacion = null;
            if (completada) {
                try {
                    const responseEval = await ApiService.get(`/pruebas-psicometricas/evaluacion/${asignacion.id}`);
                    if (responseEval.success && responseEval.data) {
                        evaluacion = responseEval.data;
                    }
                } catch (error) {
                    // No hay evaluación todavía
                }
            }
            
            html += `
                <div class="col-12 mb-4">
                    <div class="card ${completada ? 'border-success' : 'border-warning'}">
                        <div class="card-header bg-light">
                            <div class="d-flex justify-content-between align-items-center">
                                <h6 class="mb-0">
                                    <i class="bi bi-clipboard-check me-2"></i>
                                    ${prueba.nombre || 'Prueba sin nombre'}
                                </h6>
                                ${Helpers.getPruebaBadge(estado)}
                            </div>
                        </div>
                        <div class="card-body">
                            <div class="row mb-3">
                                <div class="col-md-3">
                                    <small class="text-muted">Tipo</small>
                                    <div class="fw-semibold">${prueba.tipo || 'N/A'}</div>
                                </div>
                                <div class="col-md-3">
                                    <small class="text-muted">Fecha asignada</small>
                                    <div class="fw-semibold">${Helpers.formatDate(asignacion.fecha_asignacion)}</div>
                                </div>
                                <div class="col-md-3">
                                    <small class="text-muted">Fecha completada</small>
                                    <div class="fw-semibold">${asignacion.fecha_completado ? Helpers.formatDate(asignacion.fecha_completado) : 'Pendiente'}</div>
                                </div>
                                <div class="col-md-3">
                                    <small class="text-muted">Estado</small>
                                    <div class="fw-semibold text-${completada ? 'success' : 'warning'}">${estado}</div>
                                </div>
                            </div>
                            
                            ${completada ? `
                                <div class="alert alert-info mb-3">
                                    <div class="row text-center">
                                        <div class="col-md-4">
                                            <i class="bi bi-hourglass-split fs-4"></i>
                                            <div class="mt-2">
                                                <small class="text-muted d-block">Tiempo empleado</small>
                                                <strong>${Math.round((asignacion.tiempo_total_segundos || 0) / 60)} minutos</strong>
                                            </div>
                                        </div>
                                        <div class="col-md-4">
                                            <i class="bi bi-check-circle fs-4"></i>
                                            <div class="mt-2">
                                                <small class="text-muted d-block">Intentos</small>
                                                <strong>${asignacion.intentos_realizados || 0} de ${asignacion.intentos_permitidos || 1}</strong>
                                            </div>
                                        </div>
                                        <div class="col-md-4">
                                            <i class="bi bi-calendar-check fs-4"></i>
                                            <div class="mt-2">
                                                <small class="text-muted d-block">Completada</small>
                                                <strong>${Helpers.formatDateShort(asignacion.fecha_completado)}</strong>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                ${evaluacion ? `
                                    <div class="alert alert-${evaluacion.resultado === 'aprobado' ? 'success' : evaluacion.resultado === 'no_aprobado' ? 'danger' : 'warning'} mb-3">
                                        <div class="d-flex justify-content-between align-items-center mb-2">
                                            <h6 class="mb-0">
                                                <i class="bi bi-clipboard-check me-2"></i>
                                                Evaluación Psicométrica
                                            </h6>
                                            <span class="badge bg-${evaluacion.resultado === 'aprobado' ? 'success' : evaluacion.resultado === 'no_aprobado' ? 'danger' : 'warning'}">
                                                ${evaluacion.resultado === 'aprobado' ? 'APROBADO' : evaluacion.resultado === 'no_aprobado' ? 'NO APROBADO' : 'PENDIENTE'}
                                            </span>
                                        </div>
                                        <div class="row mb-2">
                                            <div class="col-md-6">
                                                <strong>Porcentaje de Aptitud:</strong> ${evaluacion.porcentaje_aptitud}%
                                                <div class="progress mt-1" style="height: 20px;">
                                                    <div class="progress-bar bg-${evaluacion.porcentaje_aptitud >= 70 ? 'success' : evaluacion.porcentaje_aptitud >= 50 ? 'warning' : 'danger'}" 
                                                         style="width: ${evaluacion.porcentaje_aptitud}%">
                                                        ${evaluacion.porcentaje_aptitud}%
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="col-md-6">
                                                <strong>Evaluado por:</strong> ${evaluacion.evaluador?.nombre || 'N/A'}<br>
                                                <small class="text-muted">${Helpers.formatDate(evaluacion.fecha_evaluacion)}</small>
                                            </div>
                                        </div>
                                        ${evaluacion.observaciones ? `
                                            <div class="mt-2">
                                                <strong>Observaciones:</strong>
                                                <p class="mb-0 mt-1">${evaluacion.observaciones}</p>
                                            </div>
                                        ` : ''}
                                    </div>
                                ` : `
                                    <div class="alert alert-warning mb-3">
                                        <i class="bi bi-exclamation-circle me-2"></i>
                                        Esta prueba no ha sido evaluada aún.
                                    </div>
                                `}
                                
                                <button class="btn btn-primary btn-sm me-2" onclick="verRespuestasPrueba(${asignacion.id})">
                                    <i class="bi bi-eye me-1"></i>
                                    Ver respuestas detalladas
                                </button>
                                <button class="btn btn-success btn-sm" onclick="evaluarPrueba(${asignacion.id}, ${candidatoId})">
                                    <i class="bi bi-clipboard-check me-1"></i>
                                    ${evaluacion ? 'Editar' : 'Realizar'} Evaluación
                                </button>
                            ` : `
                                <div class="alert alert-warning">
                                    <i class="bi bi-exclamation-triangle me-2"></i>
                                    Esta prueba aún no ha sido completada por el candidato.
                                </div>
                            `}
                        </div>
                    </div>
                </div>
            `;
        }
        
        html += `
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Eliminar modal anterior si existe
        const modalAnterior = document.getElementById('modalResultadosPruebas');
        if (modalAnterior) {
            modalAnterior.remove();
        }
        
        // Insertar y mostrar nuevo modal
        document.body.insertAdjacentHTML('beforeend', html);
        const modal = new bootstrap.Modal(document.getElementById('modalResultadosPruebas'));
        modal.show();
        
        // Limpiar modal al cerrar
        document.getElementById('modalResultadosPruebas').addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
    }

    /**
     * Ver respuestas detalladas de una prueba
     */
    window.verRespuestasPrueba = async function(idAsignacion) {
        try {
            const response = await ApiService.get(`/pruebas-psicometricas/asignacion/${idAsignacion}/respuestas`);
            
            if (response.success) {
                const data = response.data;
                mostrarModalRespuestas(data);
            }
        } catch (error) {
            console.error('Error al cargar respuestas:', error);
            Helpers.showError('Error al cargar las respuestas');
        }
    };

    /**
     * Muestra modal con respuestas detalladas
     */
    function mostrarModalRespuestas(data) {
        const asignacion = data.asignacion || data;
        const respuestas = data.respuestas || [];
        const prueba = asignacion.prueba || {};
        
        let html = `
            <div class="modal fade" id="modalRespuestasDetalle" tabindex="-1">
                <div class="modal-dialog modal-xl modal-dialog-scrollable">
                    <div class="modal-content">
                        <div class="modal-header bg-primary text-white">
                            <h5 class="modal-title">
                                <i class="bi bi-list-check me-2"></i>
                                Respuestas Detalladas - ${prueba.nombre || 'Prueba'}
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="alert alert-info mb-4">
                                <div class="row">
                                    <div class="col-md-6">
                                        <strong>Descripción:</strong> ${prueba.descripcion || 'Sin descripción'}
                                    </div>
                                    <div class="col-md-3">
                                        <strong>Total de preguntas:</strong> ${respuestas.length}
                                    </div>
                                    <div class="col-md-3">
                                        <strong>Respondidas:</strong> ${respuestas.filter(r => r.id_opcion_seleccionada || r.respuesta_texto).length}
                                    </div>
                                </div>
                            </div>
        `;
        
        if (respuestas.length === 0) {
            html += `
                <div class="alert alert-warning">
                    <i class="bi bi-info-circle me-2"></i>
                    No hay respuestas registradas para esta prueba.
                </div>
            `;
        } else {
            respuestas.forEach((respuesta, index) => {
                const pregunta = respuesta.pregunta || {};
                const opcionSeleccionada = respuesta.opcion_seleccionada || {};
                
                html += `
                    <div class="card mb-3 border-start border-4 border-primary">
                        <div class="card-body">
                            <div class="d-flex align-items-start mb-3">
                                <div class="badge bg-primary me-3" style="width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; border-radius: 50%;">
                                    ${index + 1}
                                </div>
                                <div class="flex-grow-1">
                                    <h6 class="mb-2">${pregunta.texto_pregunta || 'Pregunta sin texto'}</h6>
                                    <span class="badge bg-secondary">${pregunta.tipo_pregunta || 'N/A'}</span>
                                </div>
                            </div>
                            
                            <div class="ms-5">
                                ${pregunta.tipo_pregunta === 'abierta' ? `
                                    <div class="bg-light p-3 rounded">
                                        <strong class="d-block mb-2">Respuesta del candidato:</strong>
                                        <p class="mb-0">${respuesta.respuesta_texto || '<em class="text-muted">Sin respuesta</em>'}</p>
                                    </div>
                                ` : `
                                    <div class="bg-light p-3 rounded">
                                        <strong class="d-block mb-2">Opción seleccionada:</strong>
                                        <p class="mb-0">
                                            <i class="bi bi-check-circle text-primary me-2"></i>
                                            ${opcionSeleccionada.texto_opcion || 'Sin respuesta'}
                                        </p>
                                    </div>
                                `}
                                
                                ${respuesta.fecha_respuesta ? `
                                    <small class="text-muted d-block mt-2">
                                        <i class="bi bi-clock me-1"></i>
                                        Respondida: ${Helpers.formatDateTime(respuesta.fecha_respuesta)}
                                    </small>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                `;
            });
        }
        
        html += `
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                            <button type="button" class="btn btn-success me-2" onclick="evaluarPrueba(${asignacion.id}, ${asignacion.id_candidato})">
                                <i class="bi bi-clipboard-check me-1"></i>
                                Evaluar Prueba
                            </button>
                            <button type="button" class="btn btn-primary" onclick="exportarRespuestas(${asignacion.id})">
                                <i class="bi bi-download me-1"></i>
                                Exportar PDF
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Eliminar modal anterior si existe
        const modalAnterior = document.getElementById('modalRespuestasDetalle');
        if (modalAnterior) {
            modalAnterior.remove();
        }
        
        // Insertar y mostrar nuevo modal
        document.body.insertAdjacentHTML('beforeend', html);
        const modal = new bootstrap.Modal(document.getElementById('modalRespuestasDetalle'));
        modal.show();
        
        // Limpiar modal al cerrar
        document.getElementById('modalRespuestasDetalle').addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
    }

    /**
     * Exportar respuestas a PDF (placeholder)
     */
    window.exportarRespuestas = function(idAsignacion) {
        Helpers.showWarning('Funcionalidad de exportar a PDF en desarrollo');
    };

    /**
     * Evaluar prueba psicométrica
     */
    window.evaluarPrueba = async function(idAsignacion, idCandidato) {
        // Verificar si ya existe una evaluación
        try {
            const responseExiste = await ApiService.get(`/pruebas-psicometricas/evaluacion/${idAsignacion}`);
            
            let evaluacionExistente = null;
            if (responseExiste.success && responseExiste.data) {
                evaluacionExistente = responseExiste.data;
            }
            
            mostrarModalEvaluacion(idAsignacion, idCandidato, evaluacionExistente);
        } catch (error) {
            console.error('Error al verificar evaluación:', error);
            mostrarModalEvaluacion(idAsignacion, idCandidato, null);
        }
    };

    /**
     * Mostrar modal de evaluación de prueba
     */
    function mostrarModalEvaluacion(idAsignacion, idCandidato, evaluacionExistente) {
        const esEdicion = evaluacionExistente !== null;
        
        let html = `
            <div class="modal fade" id="modalEvaluarPrueba" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header bg-success text-white">
                            <h5 class="modal-title">
                                <i class="bi bi-clipboard-check me-2"></i>
                                ${esEdicion ? 'Editar' : 'Realizar'} Evaluación Psicométrica
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="formEvaluarPrueba">
                                <div class="mb-3">
                                    <label for="evaluacionResultado" class="form-label">Resultado</label>
                                    <select class="form-select" id="evaluacionResultado" required>
                                        <option value="">Seleccione...</option>
                                        <option value="aprobado" ${evaluacionExistente?.resultado === 'aprobado' ? 'selected' : ''}>Aprobado</option>
                                        <option value="no_aprobado" ${evaluacionExistente?.resultado === 'no_aprobado' ? 'selected' : ''}>No Aprobado</option>
                                        <option value="pendiente_revision" ${evaluacionExistente?.resultado === 'pendiente_revision' ? 'selected' : ''}>Pendiente de revisión</option>
                                    </select>
                                </div>

                                <div class="mb-3">
                                    <label for="evaluacionPorcentaje" class="form-label">
                                        Porcentaje de Aptitud
                                        <span class="text-muted" id="porcentajeValor">${evaluacionExistente?.porcentaje_aptitud || 0}%</span>
                                    </label>
                                    <input type="range" class="form-range" id="evaluacionPorcentaje" 
                                           min="0" max="100" step="5" value="${evaluacionExistente?.porcentaje_aptitud || 0}"
                                           oninput="document.getElementById('porcentajeValor').textContent = this.value + '%'">
                                </div>

                                <div class="mb-3">
                                    <label for="evaluacionObservaciones" class="form-label">Observaciones</label>
                                    <textarea class="form-control" id="evaluacionObservaciones" rows="4" 
                                              placeholder="Ingrese observaciones sobre la evaluación...">${evaluacionExistente?.observaciones || ''}</textarea>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-success" onclick="guardarEvaluacion(${idAsignacion}, ${idCandidato}, ${esEdicion})">
                                <i class="bi bi-save me-1"></i>
                                ${esEdicion ? 'Actualizar' : 'Guardar'} Evaluación
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Eliminar modal anterior si existe
        const modalAnterior = document.getElementById('modalEvaluarPrueba');
        if (modalAnterior) {
            modalAnterior.remove();
        }
        
        // Insertar y mostrar nuevo modal
        document.body.insertAdjacentHTML('beforeend', html);
        const modal = new bootstrap.Modal(document.getElementById('modalEvaluarPrueba'));
        modal.show();
        
        // Limpiar modal al cerrar
        document.getElementById('modalEvaluarPrueba').addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
    }

    /**
     * Guardar evaluación de prueba psicométrica
     */
    window.guardarEvaluacion = async function(idAsignacion, idCandidato, esEdicion) {
        try {
            const resultado = document.getElementById('evaluacionResultado').value;
            const porcentaje = document.getElementById('evaluacionPorcentaje').value;
            const observaciones = document.getElementById('evaluacionObservaciones').value;

            if (!resultado) {
                Helpers.showWarning('Por favor seleccione un resultado');
                return;
            }

            const datos = {
                id_asignacion: idAsignacion,
                id_candidato: idCandidato,
                resultado: resultado,
                porcentaje_aptitud: parseInt(porcentaje),
                observaciones: observaciones
            };

            let response;
            if (esEdicion) {
                response = await ApiService.put(`/pruebas-psicometricas/evaluacion/${idAsignacion}`, datos);
            } else {
                response = await ApiService.post('/pruebas-psicometricas/evaluacion', datos);
            }

            if (response.success) {
                Helpers.showSuccess(`Evaluación ${esEdicion ? 'actualizada' : 'guardada'} correctamente`);
                
                // Cerrar modales
                const modalEvaluar = bootstrap.Modal.getInstance(document.getElementById('modalEvaluarPrueba'));
                if (modalEvaluar) modalEvaluar.hide();
                
                const modalRespuestas = bootstrap.Modal.getInstance(document.getElementById('modalRespuestasDetalle'));
                if (modalRespuestas) modalRespuestas.hide();
                
                const modalResultados = bootstrap.Modal.getInstance(document.getElementById('modalResultadosPruebas'));
                if (modalResultados) modalResultados.hide();
                
                // Recargar postulaciones
                await cargarPostulaciones();
            }
        } catch (error) {
            console.error('Error al guardar evaluación:', error);
            Helpers.showError('Error al guardar la evaluación');
        }
    };

    /**
     * Cargar pruebas disponibles
     */
    async function cargarPruebasDisponibles() {
        try {
            const response = await PruebasService.obtenerPruebas({ activa: 1 });
            if (response.success) {
                pruebasDisponibles = response.data || [];
                llenarSelectPruebas();
            }
        } catch (error) {
            console.error('Error al cargar pruebas:', error);
        }
    }

    /**
     * Llenar el select de pruebas
     */
    function llenarSelectPruebas() {
        const select = document.getElementById('select-prueba');
        select.innerHTML = '<option value="">Seleccionar prueba...</option>';

        if (pruebasDisponibles.length === 0) {
            select.innerHTML = '<option value="">No hay pruebas activas disponibles</option>';
            return;
        }

        pruebasDisponibles.forEach(prueba => {
            const option = document.createElement('option');
            option.value = prueba.id;
            option.textContent = `${prueba.nombre} (${getTipoLabel(prueba.tipo)})`;
            select.appendChild(option);
        });
    }

    /**
     * Obtener etiqueta del tipo de prueba
     */
    function getTipoLabel(tipo) {
        const tipos = {
            'cognitiva': 'Cognitiva',
            'personalidad': 'Personalidad',
            'habilidades': 'Habilidades',
            'conocimientos': 'Conocimientos'
        };
        return tipos[tipo] || tipo;
    }

    /**
     * Abrir modal para asignar prueba
     * @param {number} postulacionId - ID de la postulación
     */
    window.abrirAsignarPrueba = function(postulacionId) {
        postulacionSeleccionada = postulaciones.find(p => p.id === postulacionId);
        if (!postulacionSeleccionada) return;

        const candidato = postulacionSeleccionada.candidato || {};
        const usuario = candidato.usuario || {};
        const vacante = postulacionSeleccionada.vacante || {};

        document.getElementById('modal-prueba-candidato-nombre').textContent = usuario.nombre || 'Sin nombre';
        document.getElementById('modal-prueba-vacante-titulo').textContent = vacante.titulo || 'N/A';
        
        // Resetear formularios
        document.getElementById('select-prueba').value = '';
        document.getElementById('fecha-limite-psico').value = '';
        document.getElementById('tipo-examen-medico').value = '';
        document.getElementById('nombre-examen').value = '';
        document.getElementById('descripcion-medica').value = '';
        document.getElementById('tipo-prueba-tecnica').value = '';
        document.getElementById('nombre-prueba-tecnica').value = '';
        document.getElementById('descripcion-tecnica').value = '';
        document.getElementById('instrucciones-tecnica').value = '';
        document.getElementById('fecha-limite-tecnica').value = '';
        
        // Seleccionar psicométrica por defecto
        document.getElementById('tipo-psicometrica').checked = true;
        cambiarTipoPrueba();

        modalAsignarPrueba.show();
    };

    /**
     * Cambiar entre tipos de prueba
     */
    function cambiarTipoPrueba() {
        const tipo = document.querySelector('input[name="tipo-prueba"]:checked').value;
        
        // Ocultar todos los formularios
        document.querySelectorAll('.tipo-prueba-form').forEach(form => {
            form.style.display = 'none';
        });
        
        // Mostrar el formulario correspondiente
        document.getElementById(`form-${tipo}`).style.display = 'block';
    }

    /**
     * Confirmar asignación de prueba
     */
    async function confirmarAsignarPrueba() {
        if (!postulacionSeleccionada) return;

        try {
            const tipo = document.querySelector('input[name="tipo-prueba"]:checked').value;
            const candidatoId = postulacionSeleccionada.candidato?.id;
            const vacanteId = postulacionSeleccionada.vacante?.id;
            const postulacionId = postulacionSeleccionada.id;
            
            let response;
            
            // Según el tipo de prueba, hacer la petición correspondiente
            switch(tipo) {
                case 'psicometrica':
                    const idPrueba = document.getElementById('select-prueba').value;
                    const fechaLimitePsico = document.getElementById('fecha-limite-psico').value;
                    
                    if (!idPrueba) {
                        Helpers.showWarning('Debes seleccionar una prueba');
                        return;
                    }
                    
                    response = await ApiService.post('/pruebas-psicometricas/asignar', {
                        id_prueba: parseInt(idPrueba),
                        id_candidato: candidatoId,
                        id_vacante: vacanteId,
                        fecha_limite: fechaLimitePsico || null
                    });
                    break;
                    
                case 'medica':
                    const tipoExamen = document.getElementById('tipo-examen-medico').value;
                    const nombreExamen = document.getElementById('nombre-examen').value.trim();
                    const descripcionMedica = document.getElementById('descripcion-medica').value.trim();
                    
                    if (!tipoExamen) {
                        Helpers.showWarning('Debes seleccionar el tipo de examen médico');
                        return;
                    }
                    
                    response = await ApiService.post('/pruebas-medicas', {
                        id_candidato: candidatoId,
                        id_postulacion: postulacionId,
                        id_vacante: vacanteId,
                        tipo_prueba: tipoExamen,
                        nombre_prueba: nombreExamen || 'Examen Médico',
                        descripcion: descripcionMedica
                    });
                    break;
                    
                case 'tecnica':
                    const tipoPruebaTecnica = document.getElementById('tipo-prueba-tecnica').value;
                    const nombrePruebaTecnica = document.getElementById('nombre-prueba-tecnica').value.trim();
                    const descripcionTecnica = document.getElementById('descripcion-tecnica').value.trim();
                    const instruccionesTecnica = document.getElementById('instrucciones-tecnica').value.trim();
                    const fechaLimiteTecnica = document.getElementById('fecha-limite-tecnica').value;
                    
                    if (!tipoPruebaTecnica || !nombrePruebaTecnica) {
                        Helpers.showWarning('Debes completar el tipo y nombre de la prueba técnica');
                        return;
                    }
                    
                    response = await ApiService.post('/pruebas-tecnicas', {
                        id_candidato: candidatoId,
                        id_vacante: vacanteId,
                        id_postulacion: postulacionId,
                        tipo_prueba: tipoPruebaTecnica,
                        nombre_prueba: nombrePruebaTecnica,
                        descripcion: descripcionTecnica,
                        instrucciones: instruccionesTecnica,
                        fecha_limite: fechaLimiteTecnica || null
                    });
                    break;
            }
            
            if (response && response.success) {
                Helpers.showSuccess('Prueba asignada correctamente al candidato');
                modalAsignarPrueba.hide();
                
                // Opcional: Cambiar el estado de la postulación a "pruebas"
                if (postulacionSeleccionada.estado !== 'pruebas') {
                    const confirmar = await Helpers.confirm(
                        '¿Cambiar estado a "Pruebas"?',
                        'Se asignó la prueba. ¿Deseas actualizar el estado de la postulación a "Pruebas"?',
                        'Sí, actualizar'
                    );

                    if (confirmar) {
                        await VacantesService.actualizarEstadoPostulacion(
                            postulacionSeleccionada.id,
                            'pruebas',
                            'Prueba psicométrica asignada'
                        );
                        await cargarPostulaciones();
                    }
                }
            }
        } catch (error) {
            console.error('Error al asignar prueba:', error);
            Helpers.showError(error.message || 'Error al asignar la prueba');
        } finally {
            Helpers.hideLoader();
        }
    }

    /**
     * Exportar postulaciones
     */
    function exportarPostulaciones() {
        Helpers.showWarning('Funcionalidad de exportación en desarrollo');
    }

    /**
     * Muestra el loading
     */
    function mostrarLoading() {
        document.getElementById('loading').style.display = 'block';
        document.getElementById('tabla-container').style.display = 'none';
        document.getElementById('empty-state').style.display = 'none';
    }

    /**
     * Muestra el empty state
     */
    function mostrarEmpty() {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('tabla-container').style.display = 'none';
        document.getElementById('empty-state').style.display = 'block';
    }

    // ========== CONTRATAR CANDIDATO ==========
    window.abrirContratar = function(postulacionId) {
        postulacionSeleccionada = postulaciones.find(p => p.id === postulacionId);
        if (!postulacionSeleccionada) return;

        const candidato = postulacionSeleccionada.candidato || {};
        const usuario = candidato.usuario || {};
        const vacante = postulacionSeleccionada.vacante || {};

        document.getElementById('contratar-nombre').textContent = usuario.nombre || 'Sin nombre';
        document.getElementById('contratar-vacante').textContent = vacante.titulo || 'N/A';
        document.getElementById('contratar-id-candidato').value = candidato.id;
        document.getElementById('contratar-id-postulacion').value = postulacionId;
        document.getElementById('contratar-id-vacante').value = vacante.id;
        
        // Pre-llenar cargo de la vacante
        document.getElementById('contratar-cargo').value = vacante.titulo || '';
        
        // Fecha de inicio por defecto en 2 semanas
        const fechaInicio = new Date();
        fechaInicio.setDate(fechaInicio.getDate() + 14);
        document.getElementById('contratar-fecha-inicio').value = fechaInicio.toISOString().split('T')[0];

        modalContratar.show();
    };

    // Event listener para el botón de contratar
    document.addEventListener('DOMContentLoaded', function() {
        const btnConfirmarContratar = document.getElementById('btn-confirmar-contratar');
        if (btnConfirmarContratar) {
            btnConfirmarContratar.addEventListener('click', confirmarContratar);
        }
    });

    async function confirmarContratar() {
        try {
            const idCandidato = document.getElementById('contratar-id-candidato').value;
            const idPostulacion = document.getElementById('contratar-id-postulacion').value;
            const idVacante = document.getElementById('contratar-id-vacante').value;
            const cargo = document.getElementById('contratar-cargo').value.trim();
            const departamento = document.getElementById('contratar-departamento').value.trim();
            const salario = document.getElementById('contratar-salario').value;
            const fechaInicio = document.getElementById('contratar-fecha-inicio').value;
            const tipoContrato = document.getElementById('contratar-tipo-contrato').value;
            const periodoPrueba = document.getElementById('contratar-periodo-prueba').value;
            const notas = document.getElementById('contratar-notas').value.trim();

            if (!cargo || !salario || !fechaInicio) {
                Helpers.showWarning('Por favor completa todos los campos requeridos');
                return;
            }

            const confirmacion = await Swal.fire({
                title: '¿Contratar candidato?',
                text: 'Esta acción registrará al candidato como empleado en periodo de prueba',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Sí, contratar',
                cancelButtonText: 'Cancelar'
            });

            if (!confirmacion.isConfirmed) return;

            Helpers.showLoader('Contratando...');

            const response = await ApiService.post('/contrataciones', {
                id_candidato: parseInt(idCandidato),
                id_postulacion: parseInt(idPostulacion),
                id_vacante: parseInt(idVacante),
                cargo,
                departamento: departamento || null,
                salario: parseFloat(salario),
                fecha_inicio_labores: fechaInicio,
                tipo_contrato: tipoContrato,
                duracion_periodo_prueba_meses: parseInt(periodoPrueba),
                notas: notas || null
            });

            Helpers.hideLoader();

            if (response.success) {
                Helpers.showSuccess('¡Candidato contratado exitosamente!');
                modalContratar.hide();
                document.getElementById('form-contratar').reset();
                await cargarPostulaciones();
            }
        } catch (error) {
            console.error('Error al contratar:', error);
            Helpers.showError('Error al contratar candidato');
        }
    }

    /**
     * Analizar candidato con IA
     */
    window.analizarConIA = async function(idPostulacion) {
        try {
            const postulacion = postulaciones.find(p => p.id === idPostulacion);
            if (!postulacion) {
                Helpers.showError('Postulación no encontrada');
                return;
            }

            const candidato = postulacion.candidato || {};
            const usuario = candidato.usuario || {};
            const vacante = postulacion.vacante || {};

            // Mostrar modal y loading
            const modal = new bootstrap.Modal(document.getElementById('modalAnalisisIA'));
            document.getElementById('modal-ia-candidato-nombre').textContent = usuario.nombre || 'Sin nombre';
            document.getElementById('modal-ia-vacante-titulo').textContent = vacante.titulo || 'N/A';
            document.getElementById('ia-loading').style.display = 'block';
            document.getElementById('ia-resultados').style.display = 'none';
            document.getElementById('ia-error').style.display = 'none';
            document.getElementById('btn-regenerar-analisis').style.display = 'none';
            modal.show();

            // Llamar al endpoint de análisis con IA
            const response = await ApiService.post(`/ia/analizar-compatibilidad/${idPostulacion}`, {});

            if (response.success && response.analisis) {
                mostrarResultadosIA(response.analisis);
            } else {
                throw new Error('No se recibieron datos del análisis');
            }

        } catch (error) {
            console.error('Error al analizar con IA:', error);
            document.getElementById('ia-loading').style.display = 'none';
            document.getElementById('ia-error').style.display = 'block';
            document.getElementById('ia-error-mensaje').textContent = error.message || 'Error al realizar el análisis';
            document.getElementById('btn-regenerar-analisis').style.display = 'inline-block';
        }
    };

    /**
     * Mostrar resultados del análisis con IA
     */
    function mostrarResultadosIA(data) {
        document.getElementById('ia-loading').style.display = 'none';
        document.getElementById('ia-resultados').style.display = 'block';
        document.getElementById('btn-regenerar-analisis').style.display = 'inline-block';

        // Puntuación general
        const puntuacion = data.porcentaje_compatibilidad || 0;
        document.getElementById('ia-puntuacion').textContent = `${puntuacion}%`;
        
        const progressBar = document.getElementById('ia-puntuacion-bar');
        progressBar.style.width = `${puntuacion}%`;
        
        // Color según puntuación
        if (puntuacion >= 80) {
            progressBar.className = 'progress-bar bg-success';
        } else if (puntuacion >= 60) {
            progressBar.className = 'progress-bar bg-warning';
        } else {
            progressBar.className = 'progress-bar bg-danger';
        }

        // Categoría
        let categoria = 'No recomendado';
        if (puntuacion >= 90) categoria = 'Excelente candidato';
        else if (puntuacion >= 80) categoria = 'Muy buen candidato';
        else if (puntuacion >= 70) categoria = 'Buen candidato';
        else if (puntuacion >= 60) categoria = 'Candidato aceptable';
        document.getElementById('ia-categoria').textContent = categoria;

        // Fortalezas
        const fortalezasContainer = document.getElementById('ia-fortalezas');
        fortalezasContainer.innerHTML = '';
        if (data.fortalezas && data.fortalezas.length > 0) {
            data.fortalezas.forEach(fortaleza => {
                const li = document.createElement('li');
                li.className = 'mb-2';
                li.innerHTML = `<i class="bi bi-check-circle-fill text-success me-2"></i>${fortaleza}`;
                fortalezasContainer.appendChild(li);
            });
        } else {
            fortalezasContainer.innerHTML = '<li class="text-muted">No se identificaron fortalezas específicas</li>';
        }

        // Debilidades / Áreas de preocupación
        const debilidadesContainer = document.getElementById('ia-debilidades');
        debilidadesContainer.innerHTML = '';
        const areasPreocupacion = data.areas_preocupacion || data.debilidades || [];
        if (areasPreocupacion.length > 0) {
            areasPreocupacion.forEach(debilidad => {
                const li = document.createElement('li');
                li.className = 'mb-2';
                li.innerHTML = `<i class="bi bi-exclamation-circle-fill text-warning me-2"></i>${debilidad}`;
                debilidadesContainer.appendChild(li);
            });
        } else {
            debilidadesContainer.innerHTML = '<li class="text-muted">No se identificaron áreas de mejora</li>';
        }

        // Recomendación
        document.getElementById('ia-recomendacion').textContent = data.recomendacion || 'No hay recomendación disponible';

        // Resumen
        const resumenElement = document.getElementById('ia-resumen');
        if (resumenElement) {
            resumenElement.textContent = data.resumen || 'Sin resumen disponible';
        }
    }

    /**
     * Actualizar barra de progreso
     */
    function actualizarBarraProgreso(prefijo, valor) {
        const bar = document.getElementById(`${prefijo}-bar`);
        const text = document.getElementById(`${prefijo}-text`);
        
        bar.style.width = `${valor}%`;
        text.textContent = `${valor}%`;
    }

    /**
     * Regenerar análisis con IA
     */
    document.getElementById('btn-regenerar-analisis')?.addEventListener('click', function() {
        const modal = bootstrap.Modal.getInstance(document.getElementById('modalAnalisisIA'));
        if (modal) {
            modal.hide();
            // Obtener el ID de la postulación del nombre del candidato mostrado
            // En una implementación real, guardaríamos el ID en un atributo data
            Helpers.showInfo('Por favor, vuelva a hacer clic en el botón de análisis');
        }
    });

    // Inicializar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
