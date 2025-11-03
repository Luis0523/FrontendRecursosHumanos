/**
 * Mis Vacantes
 * Maneja el listado y gestión de vacantes de la empresa
 */

(function() {
    'use strict';

    // Proteger la página - solo empresas
    AuthService.protectPage(CONFIG.ROLES.EMPRESA);

    let vacantes = [];
    let vacantesFiltradas = [];
    let vacanteSeleccionada = null;
    let modalCambiarEstado = null;

    /**
     * Inicializa la página
     */
    async function init() {
        // Inicializar modal
        modalCambiarEstado = new bootstrap.Modal(document.getElementById('modalCambiarEstado'));

        // Cargar vacantes
        await cargarVacantes();

        // Event listeners
        document.getElementById('filtro-buscar').addEventListener('input', aplicarFiltros);
        document.getElementById('filtro-estado').addEventListener('change', aplicarFiltros);
        document.getElementById('filtro-modalidad').addEventListener('change', aplicarFiltros);
        document.getElementById('filtro-ordenar').addEventListener('change', aplicarFiltros);
        document.getElementById('btn-limpiar-filtros').addEventListener('click', limpiarFiltros);
        document.getElementById('btn-confirmar-estado').addEventListener('click', confirmarCambioEstado);
    }

    /**
     * Carga las vacantes de la empresa
     */
    async function cargarVacantes() {
        try {
            mostrarLoading();

            const response = await EmpresaService.getVacantes();

            if (response.success) {
                // El backend devuelve data como array directo, no data.vacantes
                const vacantesRaw = Array.isArray(response.data) ? response.data : [];

                // Mapear campos del backend al formato esperado por el frontend
                vacantes = vacantesRaw.map(v => ({
                    vacante_id: v.id,
                    titulo: v.titulo,
                    descripcion: v.descripcion,
                    ubicacion: v.ubicacion,
                    modalidad: v.modalidad,
                    tipo_contrato: v.tipo_contrato,
                    nivel_experiencia: v.nivel_educacion || 'No especificado',
                    requisitos: v.requisitos,
                    responsabilidades: v.responsabilidades,
                    salario_min: v.salario_minimo,
                    salario_max: v.salario_maximo,
                    beneficios: v.beneficios,
                    estado: v.estado,
                    fecha_publicacion: v.fecha_publicacion || v.created_at,
                    fecha_cierre: v.fecha_cierre,
                    vacantes_disponibles: v.vacantes_disponibles,
                    postulaciones_count: Array.isArray(v.postulaciones) ? v.postulaciones.length : 0
                }));
                vacantesFiltradas = [...vacantes];
                actualizarEstadisticas();
                renderizarVacantes();
            }
        } catch (error) {
            console.error('Error al cargar vacantes:', error);
            Helpers.showError('Error al cargar las vacantes');
            mostrarEmpty();
        }
    }

    /**
     * Actualiza las estadísticas
     */
    function actualizarEstadisticas() {
        const activas = vacantes.filter(v => v.estado === 'activa').length;
        const totalPostulaciones = vacantes.reduce((sum, v) => sum + (v.postulaciones_count || 0), 0);

        // Vacantes que cierran en los próximos 7 días
        const hoy = new Date();
        const proximaSemana = new Date(hoy.getTime() + 7 * 24 * 60 * 60 * 1000);
        const proximasCerrar = vacantes.filter(v => {
            if (!v.fecha_cierre || v.estado === 'cerrada') return false;
            const fechaCierre = new Date(v.fecha_cierre);
            return fechaCierre >= hoy && fechaCierre <= proximaSemana;
        }).length;

        document.getElementById('total-vacantes').textContent = vacantes.length;
        document.getElementById('vacantes-activas').textContent = activas;
        document.getElementById('total-postulaciones').textContent = totalPostulaciones;
        document.getElementById('vacantes-proximas-cerrar').textContent = proximasCerrar;
    }

    /**
     * Renderiza las vacantes en la tabla
     */
    function renderizarVacantes() {
        const tbody = document.getElementById('tbody-vacantes');
        const tablaContainer = document.getElementById('tabla-container');
        const emptyState = document.getElementById('empty-state');
        const loading = document.getElementById('loading');

        loading.style.display = 'none';

        if (vacantesFiltradas.length === 0) {
            if (vacantes.length === 0) {
                // No hay vacantes en absoluto
                tablaContainer.style.display = 'none';
                emptyState.style.display = 'block';
            } else {
                // Hay vacantes pero los filtros no devuelven resultados
                tbody.innerHTML = `
                    <tr>
                        <td colspan="7" class="text-center py-5">
                            <i class="bi bi-search text-muted" style="font-size: 3rem;"></i>
                            <p class="text-muted mt-3">No se encontraron vacantes con los filtros aplicados</p>
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

        vacantesFiltradas.forEach(vacante => {
            const tr = document.createElement('tr');
            tr.style.cursor = 'pointer';

            // Alerta si está próxima a cerrar
            let alertaCierre = '';
            if (vacante.fecha_cierre && vacante.estado === 'activa') {
                const diasRestantes = Math.ceil((new Date(vacante.fecha_cierre) - new Date()) / (1000 * 60 * 60 * 24));
                if (diasRestantes <= 7 && diasRestantes > 0) {
                    alertaCierre = `<i class="bi bi-exclamation-triangle text-warning ms-2" title="Cierra en ${diasRestantes} días"></i>`;
                }
            }

            tr.innerHTML = `
                <td>
                    <div class="fw-semibold">${vacante.titulo}</div>
                    <small class="text-muted">${vacante.tipo_contrato || 'N/A'} · ${vacante.nivel_experiencia || 'N/A'}</small>
                    ${alertaCierre}
                </td>
                <td>${vacante.ubicacion || 'N/A'}</td>
                <td>
                    <span class="badge bg-${getModalidadColor(vacante.modalidad)}">${vacante.modalidad || 'N/A'}</span>
                </td>
                <td>
                    <span class="badge bg-primary rounded-pill">${vacante.postulaciones_count || 0}</span>
                </td>
                <td>${Helpers.getVacanteBadge(vacante.estado)}</td>
                <td>
                    <small>${Helpers.formatDateShort(vacante.fecha_publicacion)}</small>
                </td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" onclick="verDetalleVacante(${vacante.vacante_id})" title="Ver detalle">
                            <i class="bi bi-eye"></i>
                        </button>
                        <button class="btn btn-outline-secondary" onclick="editarVacante(${vacante.vacante_id})" title="Editar">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-outline-info" onclick="abrirCambiarEstado(${vacante.vacante_id})" title="Cambiar estado">
                            <i class="bi bi-arrow-repeat"></i>
                        </button>
                        <button class="btn btn-outline-success" onclick="duplicarVacante(${vacante.vacante_id})" title="Duplicar">
                            <i class="bi bi-files"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick="eliminarVacante(${vacante.vacante_id})" title="Eliminar">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            `;

            tbody.appendChild(tr);
        });
    }

    /**
     * Obtiene el color del badge según la modalidad
     * @param {string} modalidad - Modalidad de trabajo
     * @returns {string} - Color del badge
     */
    function getModalidadColor(modalidad) {
        switch(modalidad) {
            case 'remoto': return 'success';
            case 'presencial': return 'info';
            case 'hibrido': return 'warning';
            default: return 'secondary';
        }
    }

    /**
     * Aplica los filtros a las vacantes
     */
    function aplicarFiltros() {
        const buscar = document.getElementById('filtro-buscar').value.toLowerCase();
        const estado = document.getElementById('filtro-estado').value;
        const modalidad = document.getElementById('filtro-modalidad').value;
        const ordenar = document.getElementById('filtro-ordenar').value;

        // Filtrar
        vacantesFiltradas = vacantes.filter(vacante => {
            const coincideBusqueda = !buscar || vacante.titulo.toLowerCase().includes(buscar);
            const coincideEstado = !estado || vacante.estado === estado;
            const coincideModalidad = !modalidad || vacante.modalidad === modalidad;
            return coincideBusqueda && coincideEstado && coincideModalidad;
        });

        // Ordenar
        switch(ordenar) {
            case 'reciente':
                vacantesFiltradas.sort((a, b) => new Date(b.fecha_publicacion) - new Date(a.fecha_publicacion));
                break;
            case 'antigua':
                vacantesFiltradas.sort((a, b) => new Date(a.fecha_publicacion) - new Date(b.fecha_publicacion));
                break;
            case 'postulaciones':
                vacantesFiltradas.sort((a, b) => (b.postulaciones_count || 0) - (a.postulaciones_count || 0));
                break;
        }

        renderizarVacantes();
    }

    /**
     * Limpia todos los filtros
     */
    function limpiarFiltros() {
        document.getElementById('filtro-buscar').value = '';
        document.getElementById('filtro-estado').value = '';
        document.getElementById('filtro-modalidad').value = '';
        document.getElementById('filtro-ordenar').value = 'reciente';
        aplicarFiltros();
    }

    /**
     * Abre el modal para cambiar el estado de una vacante
     * @param {number} vacanteId - ID de la vacante
     */
    window.abrirCambiarEstado = function(vacanteId) {
        vacanteSeleccionada = vacantes.find(v => v.vacante_id === vacanteId);
        if (!vacanteSeleccionada) return;

        document.getElementById('modal-vacante-titulo').textContent = `Vacante: ${vacanteSeleccionada.titulo}`;
        document.getElementById('nuevo-estado').value = vacanteSeleccionada.estado;
        modalCambiarEstado.show();
    };

    /**
     * Confirma el cambio de estado
     */
    async function confirmarCambioEstado() {
        if (!vacanteSeleccionada) return;

        try {
            const nuevoEstado = document.getElementById('nuevo-estado').value;

            if (nuevoEstado === vacanteSeleccionada.estado) {
                Helpers.showWarning('El estado seleccionado es el mismo actual');
                return;
            }

            Helpers.showLoader();

            const response = await VacantesService.cambiarEstado(vacanteSeleccionada.vacante_id, nuevoEstado);

            if (response.success) {
                Helpers.showSuccess('Estado actualizado correctamente');
                modalCambiarEstado.hide();
                await cargarVacantes();
            }
        } catch (error) {
            console.error('Error al cambiar estado:', error);
            Helpers.showError(error.message || 'Error al cambiar el estado');
        } finally {
            Helpers.hideLoader();
        }
    }

    /**
     * Ver detalle de una vacante
     * @param {number} vacanteId - ID de la vacante
     */
    window.verDetalleVacante = function(vacanteId) {
        window.location.href = `/pages/empresa/detalle-vacante.html?id=${vacanteId}`;
    };

    /**
     * Editar una vacante
     * @param {number} vacanteId - ID de la vacante
     */
    window.editarVacante = function(vacanteId) {
        window.location.href = `/pages/empresa/crear-vacante.html?id=${vacanteId}`;
    };

    /**
     * Duplicar una vacante
     * @param {number} vacanteId - ID de la vacante
     */
    window.duplicarVacante = async function(vacanteId) {
        try {
            const confirmado = await Helpers.confirm(
                '¿Deseas duplicar esta vacante? Se creará una copia que podrás editar.',
                'Duplicar Vacante'
            );

            if (!confirmado) return;

            Helpers.showLoader();

            const response = await VacantesService.duplicar(vacanteId);

            if (response.success) {
                Helpers.showSuccess('Vacante duplicada correctamente');
                // Redirigir a editar la nueva vacante
                setTimeout(() => {
                    window.location.href = `/pages/empresa/crear-vacante.html?id=${response.data.vacante_id}`;
                }, 1500);
            }
        } catch (error) {
            console.error('Error al duplicar vacante:', error);
            Helpers.showError(error.message || 'Error al duplicar la vacante');
        } finally {
            Helpers.hideLoader();
        }
    };

    /**
     * Eliminar una vacante
     * @param {number} vacanteId - ID de la vacante
     */
    window.eliminarVacante = async function(vacanteId) {
        try {
            const vacante = vacantes.find(v => v.vacante_id === vacanteId);
            const confirmado = await Helpers.confirm(
                `¿Estás seguro de eliminar la vacante "${vacante.titulo}"? Esta acción no se puede deshacer.`,
                'Eliminar Vacante'
            );

            if (!confirmado) return;

            Helpers.showLoader();

            const response = await VacantesService.eliminar(vacanteId);

            if (response.success) {
                Helpers.showSuccess('Vacante eliminada correctamente');
                await cargarVacantes();
            }
        } catch (error) {
            console.error('Error al eliminar vacante:', error);
            Helpers.showError(error.message || 'Error al eliminar la vacante');
        } finally {
            Helpers.hideLoader();
        }
    };

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
