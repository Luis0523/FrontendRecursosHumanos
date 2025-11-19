/**
 * Servicio de Vacantes
 * Maneja las operaciones CRUD de vacantes y gestión de postulaciones
 */

const VacantesService = {
    /**
     * Crea una nueva vacante
     * @param {Object} vacanteData - Datos de la vacante
     * @returns {Promise<Object>} - Vacante creada
     */
    async crear(vacanteData) {
        try {
            const response = await ApiService.post('/vacantes', vacanteData);
            return response;
        } catch (error) {
            console.error('Error al crear vacante:', error);
            throw error;
        }
    },

    /**
     * Obtiene una vacante por su ID
     * @param {number} vacanteId - ID de la vacante
     * @returns {Promise<Object>} - Datos de la vacante
     */
    async getById(vacanteId) {
        try {
            const response = await ApiService.get(`/vacantes/${vacanteId}`);
            return response;
        } catch (error) {
            console.error('Error al obtener vacante:', error);
            throw error;
        }
    },

    /**
     * Actualiza una vacante existente
     * @param {number} vacanteId - ID de la vacante
     * @param {Object} vacanteData - Datos a actualizar
     * @returns {Promise<Object>} - Vacante actualizada
     */
    async actualizar(vacanteId, vacanteData) {
        try {
            const response = await ApiService.put(`/vacantes/${vacanteId}`, vacanteData);
            return response;
        } catch (error) {
            console.error('Error al actualizar vacante:', error);
            throw error;
        }
    },

    /**
     * Elimina una vacante
     * @param {number} vacanteId - ID de la vacante
     * @returns {Promise<Object>} - Respuesta del servidor
     */
    async eliminar(vacanteId) {
        try {
            const response = await ApiService.delete(`/vacantes/${vacanteId}`);
            return response;
        } catch (error) {
            console.error('Error al eliminar vacante:', error);
            throw error;
        }
    },

    /**
     * Cambia el estado de una vacante (activa, pausada, cerrada)
     * @param {number} vacanteId - ID de la vacante
     * @param {string} nuevoEstado - Nuevo estado
     * @returns {Promise<Object>} - Respuesta del servidor
     */
    async cambiarEstado(vacanteId, nuevoEstado) {
        try {
            const response = await ApiService.patch(`/vacantes/${vacanteId}/estado`, {
                estado: nuevoEstado
            });
            return response;
        } catch (error) {
            console.error('Error al cambiar estado de vacante:', error);
            throw error;
        }
    },

    /**
     * Obtiene todas las postulaciones de una vacante específica
     * @param {number} vacanteId - ID de la vacante
     * @param {Object} filtros - Filtros opcionales (estado, fecha, etc.)
     * @returns {Promise<Object>} - Lista de postulaciones
     */
    async getPostulaciones(vacanteId, filtros = {}) {
        try {
            const response = await ApiService.get(`/vacantes/${vacanteId}/postulaciones`, filtros);
            return response;
        } catch (error) {
            console.error('Error al obtener postulaciones:', error);
            throw error;
        }
    },

    /**
     * Obtiene el detalle de una postulación específica
     * @param {number} postulacionId - ID de la postulación
     * @returns {Promise<Object>} - Información de la postulación
     */
    async getPostulacionDetalle(postulacionId) {
        try {
            const response = await ApiService.get(`/postulaciones/${postulacionId}`);
            return response;
        } catch (error) {
            console.error('Error al obtener detalle de postulación:', error);
            throw error;
        }
    },

    /**
     * Actualiza el estado de una postulación
     * @param {number} postulacionId - ID de la postulación
     * @param {string} nuevoEstado - Nuevo estado (pendiente, en_revision, preseleccionado, etc.)
     * @param {string} observaciones - Observaciones opcionales
     * @returns {Promise<Object>} - Respuesta del servidor
     */
    async actualizarEstadoPostulacion(postulacionId, nuevoEstado, observaciones = null) {
        try {
            const response = await ApiService.put(`/vacantes/postulaciones/${postulacionId}`, {
                estado: nuevoEstado,
                observaciones: observaciones
            });
            return response;
        } catch (error) {
            console.error('Error al actualizar estado de postulación:', error);
            throw error;
        }
    },

    /**
     * Obtiene las estadísticas de una vacante
     * @param {number} vacanteId - ID de la vacante
     * @returns {Promise<Object>} - Estadísticas de la vacante
     */
    async getEstadisticas(vacanteId) {
        try {
            const response = await ApiService.get(`/vacantes/${vacanteId}/estadisticas`);
            return response;
        } catch (error) {
            console.error('Error al obtener estadísticas de vacante:', error);
            throw error;
        }
    },

    /**
     * Duplica una vacante existente
     * @param {number} vacanteId - ID de la vacante a duplicar
     * @returns {Promise<Object>} - Nueva vacante creada
     */
    async duplicar(vacanteId) {
        try {
            const response = await ApiService.post(`/vacantes/${vacanteId}/duplicar`);
            return response;
        } catch (error) {
            console.error('Error al duplicar vacante:', error);
            throw error;
        }
    },

    /**
     * Obtiene las vacantes públicas (para candidatos)
     * @param {Object} filtros - Filtros de búsqueda
     * @returns {Promise<Object>} - Lista de vacantes públicas
     */
    async buscarVacantesPublicas(filtros = {}) {
        try {
            const response = await ApiService.get('/vacantes/buscar', filtros);
            return response;
        } catch (error) {
            console.error('Error al buscar vacantes públicas:', error);
            throw error;
        }
    }
};
