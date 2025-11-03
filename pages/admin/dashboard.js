/**
 * Dashboard de Administrador
 * Maneja la lógica y actualización de datos del dashboard de administrador
 */

(function() {
    'use strict';

    // Proteger la página - solo administradores
    AuthService.protectPage(CONFIG.ROLES.ADMIN);

    /**
     * Carga los datos del dashboard
     */
    async function cargarDashboard() {
        try {
            // Cargar estadísticas del historial
            const estadisticasRes = await ApiService.get('/admin/historial/estadisticas');
            if (estadisticasRes.success) {
                actualizarEstadisticas(estadisticasRes.data);
            }

            // Cargar actividad reciente
            const actividadRes = await ApiService.get('/admin/historial', {
                limite: 10,
                orden: 'DESC'
            });
            if (actividadRes.success) {
                mostrarActividad(actividadRes.data.historial);
            }
        } catch (error) {
            console.error('Error al cargar dashboard:', error);
            Helpers.showError('Error al cargar los datos del dashboard');
        }
    }

    /**
     * Actualiza las estadísticas del sistema
     * @param {Object} data - Datos de las estadísticas
     */
    function actualizarEstadisticas(data) {
        // Estadísticas principales
        document.getElementById('total-usuarios').textContent = data.total_usuarios || 0;
        document.getElementById('total-empresas').textContent = data.total_empresas || 0;
        document.getElementById('total-candidatos').textContent = data.total_candidatos || 0;
        document.getElementById('vacantes-activas').textContent = data.vacantes_activas || 0;
        document.getElementById('total-vacantes').textContent = data.total_vacantes || 0;

        // Métricas adicionales
        document.getElementById('total-postulaciones').textContent = data.total_postulaciones || 0;
        document.getElementById('total-entrevistas').textContent = data.total_entrevistas || 0;
        document.getElementById('total-pruebas').textContent = data.total_pruebas || 0;
        document.getElementById('total-contratados').textContent = data.contrataciones || 0;

        // Usuarios y empresas activas
        document.getElementById('usuarios-mes').textContent = data.usuarios_mes || 0;
        document.getElementById('empresas-activas').textContent = data.empresas_activas || 0;
        document.getElementById('candidatos-activos').textContent = data.candidatos_activos || 0;
    }

    /**
     * Muestra la actividad reciente del sistema
     * @param {Array} actividades - Lista de actividades
     */
    function mostrarActividad(actividades) {
        const loading = document.getElementById('actividad-loading');
        const empty = document.getElementById('actividad-empty');
        const tbody = document.querySelector('#tabla-actividad tbody');

        loading.style.display = 'none';

        if (!actividades || actividades.length === 0) {
            empty.style.display = 'table-row';
            return;
        }

        actividades.forEach(act => {
            const tr = document.createElement('tr');

            // Determinar icono según la acción
            let iconClass = 'bi-circle-fill';
            let iconColor = 'text-secondary';
            switch(act.accion) {
                case 'INSERT':
                    iconClass = 'bi-plus-circle-fill';
                    iconColor = 'text-success';
                    break;
                case 'UPDATE':
                    iconClass = 'bi-pencil-square';
                    iconColor = 'text-info';
                    break;
                case 'DELETE':
                    iconClass = 'bi-trash-fill';
                    iconColor = 'text-danger';
                    break;
            }

            tr.innerHTML = `
                <td>
                    <div class="d-flex align-items-center">
                        <i class="bi ${iconClass} ${iconColor} me-2"></i>
                        <span>${act.usuario?.nombre || 'Sistema'}</span>
                    </div>
                </td>
                <td>
                    <span class="badge ${iconColor.replace('text', 'bg')}">${act.accion}</span>
                </td>
                <td>${act.tabla_afectada}</td>
                <td>
                    <small class="text-muted">${Helpers.timeAgo(act.fecha)}</small>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    /**
     * Actualiza los datos del dashboard
     */
    window.actualizarDatos = async function() {
        Helpers.showLoader();
        await cargarDashboard();
        Helpers.hideLoader();
        Helpers.showSuccess('Datos actualizados correctamente');
    };

    /**
     * Exporta los datos del sistema
     */
    window.exportarDatos = function() {
        Helpers.showWarning('Funcionalidad de exportación en desarrollo');
    };

    /**
     * Limpia el caché del sistema
     */
    window.limpiarCache = async function() {
        const confirmado = await Helpers.confirm(
            'Esto limpiará todos los datos en caché del sistema. ¿Estás seguro?',
            'Limpiar Caché'
        );

        if (confirmado) {
            Helpers.showSuccess('Caché limpiado correctamente');
        }
    };

    // Cargar al iniciar
    cargarDashboard();

    // Auto-refresh cada 30 segundos
    setInterval(() => {
        cargarDashboard();
    }, 30000);
})();
