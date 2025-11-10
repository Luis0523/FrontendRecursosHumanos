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
    let pruebasDisponibles = [];

    /**
     * Inicializa la página
     */
    async function init() {
        // Inicializar modals
        modalCambiarEstado = new bootstrap.Modal(document.getElementById('modalCambiarEstado'));
        modalAsignarPrueba = new bootstrap.Modal(document.getElementById('modalAsignarPrueba'));

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

            const candidato = postulacion.candidato || {};
            const vacante = postulacion.vacante || {};

            tr.innerHTML = `
                <td>
                    <div class="d-flex align-items-center">
                        <div class="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3" style="width: 40px; height: 40px;">
                            <i class="bi bi-person-fill"></i>
                        </div>
                        <div>
                            <div class="fw-semibold">${candidato.nombre || 'Sin nombre'}</div>
                            <small class="text-muted">${candidato.email || 'Sin email'}</small>
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
                    ${postulacion.cv_url ?
                        `<a href="${postulacion.cv_url}" target="_blank" class="btn btn-sm btn-outline-primary">
                            <i class="bi bi-file-pdf"></i> Ver CV
                        </a>` :
                        '<span class="text-muted small">Sin CV</span>'
                    }
                </td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" onclick="verCandidato(${postulacion.candidato_id})" title="Ver perfil">
                            <i class="bi bi-eye"></i>
                        </button>
                        <button class="btn btn-outline-secondary" onclick="abrirCambiarEstado(${postulacion.postulacion_id})" title="Cambiar estado">
                            <i class="bi bi-arrow-repeat"></i>
                        </button>
                        <button class="btn btn-outline-success" onclick="abrirAsignarPrueba(${postulacion.postulacion_id})" title="Asignar prueba">
                            <i class="bi bi-clipboard-check"></i>
                        </button>
                        <button class="btn btn-outline-info" onclick="enviarMensaje(${postulacion.candidato_id})" title="Enviar mensaje">
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
            const coincideBusqueda = !buscar ||
                (candidato.nombre && candidato.nombre.toLowerCase().includes(buscar)) ||
                (candidato.email && candidato.email.toLowerCase().includes(buscar));
            const coincideVacante = !vacanteId || postulacion.vacante_id == vacanteId;
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
                    const nombreA = (a.candidato?.nombre || '').toLowerCase();
                    const nombreB = (b.candidato?.nombre || '').toLowerCase();
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
        postulacionSeleccionada = postulaciones.find(p => p.postulacion_id === postulacionId);
        if (!postulacionSeleccionada) return;

        const candidato = postulacionSeleccionada.candidato || {};
        const vacante = postulacionSeleccionada.vacante || {};

        document.getElementById('modal-candidato-nombre').textContent = candidato.nombre || 'Sin nombre';
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
                postulacionSeleccionada.postulacion_id,
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
        postulacionSeleccionada = postulaciones.find(p => p.postulacion_id === postulacionId);
        if (!postulacionSeleccionada) return;

        const candidato = postulacionSeleccionada.candidato || {};
        const vacante = postulacionSeleccionada.vacante || {};

        document.getElementById('modal-prueba-candidato-nombre').textContent = candidato.nombre || 'Sin nombre';
        document.getElementById('modal-prueba-vacante-titulo').textContent = vacante.titulo || 'N/A';
        document.getElementById('select-prueba').value = '';
        document.getElementById('fecha-limite').value = '';
        document.getElementById('instrucciones-prueba').value = '';

        modalAsignarPrueba.show();
    };

    /**
     * Confirmar asignación de prueba
     */
    async function confirmarAsignarPrueba() {
        if (!postulacionSeleccionada) return;

        try {
            const idPrueba = document.getElementById('select-prueba').value;
            const fechaLimite = document.getElementById('fecha-limite').value;
            const instrucciones = document.getElementById('instrucciones-prueba').value.trim();

            if (!idPrueba) {
                Helpers.showError('Debes seleccionar una prueba');
                return;
            }

            Helpers.showLoader();

            const data = {
                id_prueba: parseInt(idPrueba),
                id_candidato: postulacionSeleccionada.candidato_id,
                id_postulacion: postulacionSeleccionada.postulacion_id,
                fecha_limite: fechaLimite || null,
                instrucciones: instrucciones || null
            };

            const response = await PruebasService.asignarPrueba(data);

            if (response.success) {
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
                            postulacionSeleccionada.postulacion_id,
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

    // Inicializar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
