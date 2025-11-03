/**
 * Dashboard del Candidato
 * Maneja la lógica y actualización de datos del dashboard
 */

(function() {
    'use strict';

    // Proteger la página - solo candidatos
    AuthService.protectPage(CONFIG.ROLES.CANDIDATO);

    // Actualizar timestamp
    document.getElementById('last-update').textContent = new Date().toLocaleTimeString('es-ES');

    /**
     * Carga los datos del dashboard
     */
    async function cargarDashboard() {
        try {
            // Cargar postulaciones
            const postulacionesRes = await ApiService.get('/vacantes/mis-postulaciones');
            if (postulacionesRes.success) {
                actualizarEstadisticas(postulacionesRes.data);
                mostrarPostulaciones(postulacionesRes.data.postulaciones);
            }

            // Cargar entrevistas
            const entrevistasRes = await ApiService.get('/entrevistas/mis-entrevistas');
            if (entrevistasRes.success) {
                mostrarEntrevistas(entrevistasRes.data.entrevistas);
            }

            // Cargar pruebas pendientes
            const pruebasRes = await ApiService.get('/pruebas-psicometricas/mis-asignaciones', { estado: 'pendiente' });
            if (pruebasRes.success) {
                document.getElementById('pruebas-pendientes').textContent = pruebasRes.data.total || 0;
            }
        } catch (error) {
            console.error('Error al cargar dashboard:', error);
        }
    }

    /**
     * Actualiza las estadísticas del dashboard
     * @param {Object} data - Datos de las postulaciones
     */
    function actualizarEstadisticas(data) {
        document.getElementById('total-postulaciones').textContent = data.total || 0;

        // Calcular completitud del perfil
        const usuario = AuthService.getCurrentUser();
        let completitud = 0;
        if (usuario.nombre) completitud += 25;
        if (usuario.email) completitud += 25;
        if (usuario.telefono) completitud += 25;
        if (usuario.ubicacion) completitud += 25;

        document.getElementById('perfil-porcentaje').textContent = completitud + '%';
        document.getElementById('perfil-progress').style.width = completitud + '%';
    }

    /**
     * Muestra las postulaciones en la tabla
     * @param {Array} postulaciones - Lista de postulaciones
     */
    function mostrarPostulaciones(postulaciones) {
        const loading = document.getElementById('postulaciones-loading');
        const empty = document.getElementById('postulaciones-empty');
        const tbody = document.querySelector('#tabla-postulaciones tbody');

        loading.style.display = 'none';

        if (!postulaciones || postulaciones.length === 0) {
            empty.style.display = 'table-row';
            return;
        }

        // Mostrar solo las primeras 5
        const postulacionesRecientes = postulaciones.slice(0, 5);

        postulacionesRecientes.forEach(post => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <div class="fw-semibold">${post.vacante?.titulo || 'N/A'}</div>
                    <small class="text-muted">${post.vacante?.ubicacion || ''}</small>
                </td>
                <td>${post.vacante?.empresa?.razon_social || 'N/A'}</td>
                <td>${Helpers.formatDateShort(post.fecha_postulacion)}</td>
                <td>${Helpers.getPostulacionBadge(post.estado)}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="verDetallePostulacion(${post.postulacion_id})">
                        <i class="bi bi-eye"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    /**
     * Muestra las entrevistas programadas
     * @param {Array} entrevistas - Lista de entrevistas
     */
    function mostrarEntrevistas(entrevistas) {
        const loading = document.getElementById('entrevistas-loading');
        const empty = document.getElementById('entrevistas-empty');
        const list = document.getElementById('entrevistas-list');
        const pendientesEl = document.getElementById('entrevistas-pendientes');
        const proximaEl = document.getElementById('proxima-entrevista');

        loading.style.display = 'none';

        // Filtrar solo programadas
        const programadas = entrevistas?.filter(e => e.estado === 'programada') || [];

        if (programadas.length === 0) {
            empty.style.display = 'block';
            pendientesEl.textContent = '0';
            proximaEl.textContent = '-';
            return;
        }

        pendientesEl.textContent = programadas.length;

        // Ordenar por fecha
        programadas.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

        // Mostrar próxima
        const proxima = programadas[0];
        proximaEl.textContent = Helpers.formatDateShort(proxima.fecha);

        // Mostrar lista de próximas 3
        programadas.slice(0, 3).forEach(ent => {
            const div = document.createElement('div');
            div.className = 'border-bottom py-2';
            div.innerHTML = `
                <div class="d-flex justify-content-between align-items-start">
                    <div class="flex-grow-1">
                        <div class="fw-semibold small">${ent.tipo || 'Entrevista'}</div>
                        <div class="text-muted small">${Helpers.formatDate(ent.fecha, true)}</div>
                    </div>
                    <span class="badge bg-warning">Programada</span>
                </div>
            `;
            list.appendChild(div);
        });
    }

    /**
     * Ver detalle de una postulación
     * @param {number} id - ID de la postulación
     */
    window.verDetallePostulacion = function(id) {
        window.location.href = `/pages/candidato/mis-postulaciones.html?id=${id}`;
    };

    // Cargar datos al iniciar
    cargarDashboard();
})();
