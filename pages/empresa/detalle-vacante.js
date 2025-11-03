/**
 * Detalle de Vacante
 * Muestra la información completa de una vacante específica
 */

(function() {
    'use strict';

    // Proteger la página - solo empresas
    AuthService.protectPage(CONFIG.ROLES.EMPRESA);

    let vacante = null;
    let vacanteId = null;
    let modalCambiarEstado = null;

    /**
     * Inicializa la página
     */
    async function init() {
        // Inicializar modal
        modalCambiarEstado = new bootstrap.Modal(document.getElementById('modalCambiarEstado'));

        // Obtener ID de la vacante desde la URL
        vacanteId = Helpers.getURLParameter('id');

        if (!vacanteId) {
            mostrarError();
            return;
        }

        // Cargar vacante
        await cargarVacante();

        // Event listeners
        document.getElementById('btn-editar').addEventListener('click', editarVacante);
        document.getElementById('btn-cambiar-estado').addEventListener('click', abrirModalCambiarEstado);
        document.getElementById('btn-duplicar').addEventListener('click', duplicarVacante);
        document.getElementById('btn-eliminar').addEventListener('click', eliminarVacante);
        document.getElementById('btn-confirmar-estado').addEventListener('click', confirmarCambioEstado);
        document.getElementById('btn-ver-postulaciones').addEventListener('click', verPostulaciones);
        document.getElementById('btn-compartir').addEventListener('click', compartirVacante);
        document.getElementById('btn-descargar').addEventListener('click', descargarPDF);
    }

    /**
     * Carga los detalles de la vacante
     */
    async function cargarVacante() {
        try {
            mostrarLoading();

            const response = await VacantesService.getById(vacanteId);

            if (response.success) {
                // Mapear campos del backend al formato esperado
                const v = response.data;
                vacante = {
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
                    habilidades: v.habilidades,
                    estado: v.estado,
                    fecha_publicacion: v.fecha_publicacion || v.created_at,
                    fecha_cierre: v.fecha_cierre,
                    vacantes_disponibles: v.vacantes_disponibles,
                    postulaciones: v.postulaciones || []
                };

                renderizarVacante();
                mostrarContenido();
            } else {
                mostrarError();
            }
        } catch (error) {
            console.error('Error al cargar vacante:', error);
            Helpers.showError('Error al cargar la vacante');
            mostrarError();
        }
    }

    /**
     * Renderiza la información de la vacante
     */
    function renderizarVacante() {
        // Header
        document.getElementById('vacante-titulo').textContent = vacante.titulo;
        document.getElementById('vacante-ubicacion').textContent = vacante.ubicacion || 'Ubicación no especificada';

        // Estado y estadísticas
        document.getElementById('vacante-estado-badge').innerHTML = Helpers.getVacanteBadge(vacante.estado);
        document.getElementById('total-postulaciones').textContent = Array.isArray(vacante.postulaciones)
            ? vacante.postulaciones.length
            : 0;
        document.getElementById('fecha-publicacion').textContent = Helpers.formatDateShort(vacante.fecha_publicacion);
        document.getElementById('fecha-cierre').textContent = vacante.fecha_cierre
            ? Helpers.formatDateShort(vacante.fecha_cierre)
            : 'Sin límite';

        // Descripción
        document.getElementById('vacante-descripcion').textContent = vacante.descripcion || 'Sin descripción';

        // Responsabilidades (puede venir como string JSON o array)
        const responsabilidades = parseArrayField(vacante.responsabilidades);
        renderizarLista('vacante-responsabilidades', responsabilidades, 'No se especificaron responsabilidades');

        // Requisitos
        const requisitos = parseArrayField(vacante.requisitos);
        renderizarLista('vacante-requisitos', requisitos, 'No se especificaron requisitos');

        // Beneficios
        const beneficios = parseArrayField(vacante.beneficios);
        renderizarLista('vacante-beneficios', beneficios, 'No se especificaron beneficios');

        // Detalles del puesto
        document.getElementById('vacante-modalidad').innerHTML = `
            <span class="badge bg-${getModalidadColor(vacante.modalidad)}">${formatModalidad(vacante.modalidad)}</span>
        `;
        document.getElementById('vacante-tipo-contrato').textContent = formatTipoContrato(vacante.tipo_contrato);
        document.getElementById('vacante-nivel-experiencia').textContent = vacante.nivel_experiencia || 'No especificado';
        document.getElementById('vacante-vacantes-disponibles').textContent = vacante.vacantes_disponibles || '1';

        // Salario
        const salarioText = formatRangoSalarial(vacante.salario_min, vacante.salario_max);
        document.getElementById('vacante-salario').textContent = salarioText;

        // Habilidades
        const habilidades = parseArrayField(vacante.habilidades);
        renderizarHabilidades(habilidades);
    }

    /**
     * Convierte un campo que puede ser string JSON o array en array
     * @param {string|array} field - Campo a convertir
     * @returns {array} - Array con los valores
     */
    function parseArrayField(field) {
        if (!field) return [];
        if (Array.isArray(field)) return field;

        try {
            const parsed = JSON.parse(field);
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            // Si no es JSON válido, intentar dividir por líneas o comas
            return field.split(/[\n,]/).map(item => item.trim()).filter(item => item);
        }
    }

    /**
     * Renderiza una lista de elementos
     * @param {string} elementId - ID del elemento donde renderizar
     * @param {array} items - Items a renderizar
     * @param {string} emptyMessage - Mensaje si está vacío
     */
    function renderizarLista(elementId, items, emptyMessage) {
        const elemento = document.getElementById(elementId);

        if (items.length === 0) {
            elemento.innerHTML = `<li class="text-muted">${emptyMessage}</li>`;
            return;
        }

        elemento.innerHTML = items.map(item => `<li>${item}</li>`).join('');
    }

    /**
     * Renderiza las habilidades como badges
     * @param {array} habilidades - Array de habilidades
     */
    function renderizarHabilidades(habilidades) {
        const container = document.getElementById('vacante-habilidades');

        if (habilidades.length === 0) {
            container.innerHTML = '<span class="text-muted small">No se especificaron habilidades</span>';
            return;
        }

        container.innerHTML = habilidades
            .map(hab => `<span class="badge bg-secondary me-1 mb-1">${hab}</span>`)
            .join('');
    }

    /**
     * Formatea el rango salarial
     * @param {number} min - Salario mínimo
     * @param {number} max - Salario máximo
     * @returns {string} - Rango formateado
     */
    function formatRangoSalarial(min, max) {
        if (!min && !max) return 'A convenir';
        if (min && !max) return `Desde $${Helpers.formatNumber(min)}`;
        if (!min && max) return `Hasta $${Helpers.formatNumber(max)}`;
        return `$${Helpers.formatNumber(min)} - $${Helpers.formatNumber(max)}`;
    }

    /**
     * Formatea el tipo de contrato
     * @param {string} tipo - Tipo de contrato
     * @returns {string} - Tipo formateado
     */
    function formatTipoContrato(tipo) {
        const tipos = {
            'tiempo_completo': 'Tiempo Completo',
            'medio_tiempo': 'Medio Tiempo',
            'por_proyecto': 'Por Proyecto',
            'temporal': 'Temporal',
            'indefinido': 'Indefinido',
            'pasantia': 'Pasantía'
        };
        return tipos[tipo] || tipo || 'No especificado';
    }

    /**
     * Formatea la modalidad
     * @param {string} modalidad - Modalidad
     * @returns {string} - Modalidad formateada
     */
    function formatModalidad(modalidad) {
        const modalidades = {
            'presencial': 'Presencial',
            'remoto': 'Remoto',
            'hibrido': 'Híbrido'
        };
        return modalidades[modalidad] || modalidad || 'No especificado';
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
     * Editar vacante
     */
    function editarVacante() {
        window.location.href = `/pages/empresa/crear-vacante.html?id=${vacanteId}`;
    }

    /**
     * Abre el modal para cambiar estado
     */
    function abrirModalCambiarEstado() {
        document.getElementById('modal-vacante-titulo').textContent = `Vacante: ${vacante.titulo}`;
        document.getElementById('nuevo-estado').value = vacante.estado;
        modalCambiarEstado.show();
    }

    /**
     * Confirma el cambio de estado
     */
    async function confirmarCambioEstado() {
        try {
            const nuevoEstado = document.getElementById('nuevo-estado').value;

            if (nuevoEstado === vacante.estado) {
                Helpers.showWarning('El estado seleccionado es el mismo actual');
                return;
            }

            Helpers.showLoader();

            const response = await VacantesService.cambiarEstado(vacanteId, nuevoEstado);

            if (response.success) {
                Helpers.showSuccess('Estado actualizado correctamente');
                modalCambiarEstado.hide();
                // Recargar vacante
                await cargarVacante();
            }
        } catch (error) {
            console.error('Error al cambiar estado:', error);
            Helpers.showError(error.message || 'Error al cambiar el estado');
        } finally {
            Helpers.hideLoader();
        }
    }

    /**
     * Duplicar vacante
     */
    async function duplicarVacante() {
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
    }

    /**
     * Eliminar vacante
     */
    async function eliminarVacante() {
        try {
            const confirmado = await Helpers.confirm(
                `¿Estás seguro de eliminar la vacante "${vacante.titulo}"? Esta acción no se puede deshacer.`,
                'Eliminar Vacante'
            );

            if (!confirmado) return;

            Helpers.showLoader();

            const response = await VacantesService.eliminar(vacanteId);

            if (response.success) {
                Helpers.showSuccess('Vacante eliminada correctamente');
                // Redirigir a mis vacantes
                setTimeout(() => {
                    window.location.href = '/pages/empresa/vacantes.html';
                }, 1500);
            }
        } catch (error) {
            console.error('Error al eliminar vacante:', error);
            Helpers.showError(error.message || 'Error al eliminar la vacante');
        } finally {
            Helpers.hideLoader();
        }
    }

    /**
     * Ver postulaciones de esta vacante
     */
    function verPostulaciones() {
        // Redirigir a postulaciones con filtro de esta vacante
        window.location.href = `/pages/empresa/postulaciones.html?vacante=${vacanteId}`;
    }

    /**
     * Compartir vacante
     */
    function compartirVacante() {
        const url = `${window.location.origin}/pages/vacante-publica.html?id=${vacanteId}`;

        // Intentar usar la API de compartir del navegador
        if (navigator.share) {
            navigator.share({
                title: vacante.titulo,
                text: `${vacante.titulo} - ${vacante.ubicacion}`,
                url: url
            }).catch(err => console.log('Error al compartir:', err));
        } else {
            // Fallback: copiar al portapapeles
            navigator.clipboard.writeText(url).then(() => {
                Helpers.showSuccess('Enlace copiado al portapapeles');
            }).catch(() => {
                Helpers.showInfo(`Comparte este enlace: ${url}`);
            });
        }
    }

    /**
     * Descargar como PDF
     */
    function descargarPDF() {
        Helpers.showWarning('Funcionalidad de descarga PDF en desarrollo');
    }

    /**
     * Muestra el loading
     */
    function mostrarLoading() {
        document.getElementById('loading').style.display = 'block';
        document.getElementById('content').style.display = 'none';
        document.getElementById('error-state').style.display = 'none';
    }

    /**
     * Muestra el contenido
     */
    function mostrarContenido() {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('content').style.display = 'block';
        document.getElementById('error-state').style.display = 'none';
    }

    /**
     * Muestra el error
     */
    function mostrarError() {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('content').style.display = 'none';
        document.getElementById('error-state').style.display = 'block';
    }

    // Inicializar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
