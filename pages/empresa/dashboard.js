/**
 * Dashboard de Empresa
 * Maneja la lógica y actualización de datos del dashboard de empresa
 */

(function() {
    'use strict';

    // Proteger la página - solo empresas
    AuthService.protectPage(CONFIG.ROLES.EMPRESA);

    /**
     * Carga los datos del dashboard
     */
    async function cargarDashboard() {
        try {
            // Cargar vacantes
            const vacantesRes = await ApiService.get('/vacantes/mis-vacantes');
            if (vacantesRes.success) {
                actualizarEstadisticasVacantes(vacantesRes.data);
                mostrarVacantes(vacantesRes.data);
            }

            // Cargar postulaciones recientes
            cargarPostulacionesRecientes();

            // Cargar entrevistas programadas
            const entrevistasRes = await ApiService.get('/entrevistas/empresa');
            if (entrevistasRes.success) {
                const programadas = entrevistasRes.data.entrevistas.filter(e => e.estado === 'programada');
                document.getElementById('entrevistas-programadas').textContent = programadas.length;
            }
        } catch (error) {
            console.error('Error al cargar dashboard:', error);
            Helpers.showError('Error al cargar los datos del dashboard');
        }
    }

    /**
     * Actualiza las estadísticas de vacantes
     * @param {Object} data - Datos de las vacantes
     */
    function actualizarEstadisticasVacantes(data) {
        const activas = data.vacantes?.filter(v => v.estado === 'activa').length || 0;
        document.getElementById('vacantes-activas').textContent = activas;
        document.getElementById('vacantes-total').textContent = data.total || 0;

        // Sumar todas las postulaciones
        let totalPostulaciones = 0;
        let enProceso = 0;
        let nuevas = 0;

        data.vacantes?.forEach(v => {
            totalPostulaciones += v.postulaciones_count || 0;

            // Contar en proceso (preseleccionados, en entrevista, en pruebas)
            v.postulaciones?.forEach(p => {
                if (['preseleccionado', 'entrevista', 'pruebas'].includes(p.estado)) {
                    enProceso++;
                }
                if (p.estado === 'pendiente') {
                    nuevas++;
                }
            });
        });

        document.getElementById('total-postulaciones').textContent = totalPostulaciones;
        document.getElementById('candidatos-proceso').textContent = enProceso;
        document.getElementById('nuevas-postulaciones').textContent = nuevas;
    }

    /**
     * Muestra las vacantes en la tabla
     * @param {Array} vacantes - Lista de vacantes
     */
    function mostrarVacantes(vacantes) {
        const loading = document.getElementById('vacantes-loading');
        const empty = document.getElementById('vacantes-empty');
        const tbody = document.querySelector('#tabla-vacantes tbody');

        loading.style.display = 'none';

        if (!vacantes || vacantes.length === 0) {
            empty.style.display = 'table-row';
            return;
        }

        // Mostrar solo las primeras 5
        const vacantesRecientes = vacantes.slice(0, 5);

        vacantesRecientes.forEach(vac => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <div class="fw-semibold">${vac.titulo}</div>
                    <small class="text-muted">${vac.ubicacion || ''}</small>
                </td>
                <td>
                    <span class="badge bg-primary">${vac.postulaciones_count || 0}</span>
                </td>
                <td>${Helpers.getVacanteBadge(vac.estado)}</td>
                <td>${Helpers.formatDateShort(vac.fecha_publicacion)}</td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" onclick="verDetalleVacante(${vac.vacante_id})" title="Ver detalle">
                            <i class="bi bi-eye"></i>
                        </button>
                        <button class="btn btn-outline-secondary" onclick="editarVacante(${vac.vacante_id})" title="Editar">
                            <i class="bi bi-pencil"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    /**
     * Carga las postulaciones recientes
     */
    async function cargarPostulacionesRecientes() {
        const loading = document.getElementById('postulaciones-loading');
        const empty = document.getElementById('postulaciones-empty');
        const list = document.getElementById('postulaciones-list');

        try {
            // Obtener todas las vacantes con sus postulaciones
            const res = await ApiService.get('/vacantes/mis-vacantes');

            loading.style.display = 'none';

            if (!res.success || !res.data.vacantes) {
                empty.style.display = 'block';
                return;
            }

            // Recopilar todas las postulaciones
            let todasPostulaciones = [];
            res.data.vacantes.forEach(v => {
                if (v.postulaciones) {
                    v.postulaciones.forEach(p => {
                        p.vacante_titulo = v.titulo;
                        todasPostulaciones.push(p);
                    });
                }
            });

            if (todasPostulaciones.length === 0) {
                empty.style.display = 'block';
                return;
            }

            // Ordenar por fecha más reciente
            todasPostulaciones.sort((a, b) => new Date(b.fecha_postulacion) - new Date(a.fecha_postulacion));

            // Mostrar solo las primeras 5
            todasPostulaciones.slice(0, 5).forEach(post => {
                const div = document.createElement('div');
                div.className = 'border-bottom py-2';
                div.innerHTML = `
                    <div class="d-flex justify-content-between align-items-start mb-1">
                        <div class="flex-grow-1">
                            <div class="fw-semibold small">${post.candidato?.nombre || 'Candidato'}</div>
                            <div class="text-muted small">${post.vacante_titulo}</div>
                        </div>
                        ${Helpers.getPostulacionBadge(post.estado)}
                    </div>
                    <div class="text-muted small">
                        <i class="bi bi-clock"></i> ${Helpers.timeAgo(post.fecha_postulacion)}
                    </div>
                `;
                div.style.cursor = 'pointer';
                div.onclick = () => verDetallePostulacion(post.postulacion_id);
                list.appendChild(div);
            });

        } catch (error) {
            console.error('Error al cargar postulaciones:', error);
            loading.style.display = 'none';
            empty.style.display = 'block';
        }
    }

    /**
     * Ver detalle de una vacante
     * @param {number} id - ID de la vacante
     */
    window.verDetalleVacante = function(id) {
        window.location.href = `/pages/empresa/detalle-vacante.html?id=${id}`;
    };

    /**
     * Editar una vacante
     * @param {number} id - ID de la vacante
     */
    window.editarVacante = function(id) {
        window.location.href = `/pages/empresa/crear-vacante.html?id=${id}`;
    };

    /**
     * Ver detalle de una postulación
     * @param {number} id - ID de la postulación
     */
    window.verDetallePostulacion = function(id) {
        window.location.href = `/pages/empresa/postulaciones.html?id=${id}`;
    };

    // Cargar al iniciar
    cargarDashboard();
})();
