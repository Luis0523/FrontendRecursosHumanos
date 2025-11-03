/**
 * Servicio de Empresa
 * Maneja las operaciones relacionadas con el perfil y gestión de la empresa
 */

const EmpresaService = {
    /**
     * Obtiene el perfil completo de la empresa actual
     * @returns {Promise<Object>} - Perfil de la empresa
     */
    async getPerfil() {
        try {
            const response = await ApiService.get('/empresas/mi-empresa');
            console.log(response);
            return response;
        } catch (error) {
            console.error('Error al obtener perfil de empresa:', error);
            throw error;
        }
    },

    /**
     * Actualiza el perfil de la empresa
     * @param {Object} empresaData - Datos de la empresa a actualizar
     * @returns {Promise<Object>} - Respuesta del servidor
     */
    async updatePerfil(empresaData) {
        try {
            const response = await ApiService.put('/empresas/perfil', empresaData);
            return response;
        } catch (error) {
            console.error('Error al actualizar perfil de empresa:', error);
            throw error;
        }
    },

    /**
     * Sube el logo de la empresa
     * @param {File} logoFile - Archivo del logo
     * @returns {Promise<Object>} - URL del logo subido
     */
    async uploadLogo(logoFile) {
        try {
            const formData = new FormData();
            formData.append('logo', logoFile);

            const response = await ApiService.post('/empresas/logo', formData);
            return response;
        } catch (error) {
            console.error('Error al subir logo:', error);
            throw error;
        }
    },

    /**
     * Obtiene todas las vacantes de la empresa
     * @param {Object} filtros - Filtros opcionales (estado, fecha, etc.)
     * @returns {Promise<Object>} - Lista de vacantes
     */
    async getVacantes(filtros = {}) {
        try {
            const response = await ApiService.get('/vacantes/mis-vacantes', filtros);
            return response;
        } catch (error) {
            console.error('Error al obtener vacantes:', error);
            throw error;
        }
    },

    /**
     * Obtiene estadísticas de la empresa
     * @returns {Promise<Object>} - Estadísticas
     */
    async getEstadisticas() {
        try {
            const response = await ApiService.get('/empresas/estadisticas');
            return response;
        } catch (error) {
            console.error('Error al obtener estadísticas:', error);
            throw error;
        }
    },

    /**
     * Obtiene las postulaciones de todas las vacantes de la empresa
     * @param {Object} filtros - Filtros opcionales
     * @returns {Promise<Object>} - Lista de postulaciones
     */
    async getPostulaciones(filtros = {}) {
        try {
            const response = await ApiService.get('/vacantes/postulaciones', filtros);
            return response;
        } catch (error) {
            console.error('Error al obtener postulaciones:', error);
            throw error;
        }
    },

    /**
     * Busca candidatos en la base de datos
     * @param {Object} criterios - Criterios de búsqueda
     * @returns {Promise<Object>} - Lista de candidatos
     */
    async buscarCandidatos(criterios = {}) {
        try {
            const response = await ApiService.get('/candidatos/buscar', criterios);
            return response;
        } catch (error) {
            console.error('Error al buscar candidatos:', error);
            throw error;
        }
    },

    /**
     * Obtiene el detalle de un candidato específico
     * @param {number} candidatoId - ID del candidato
     * @returns {Promise<Object>} - Información del candidato
     */
    async getCandidatoDetalle(candidatoId) {
        try {
            const response = await ApiService.get(`/candidatos/${candidatoId}`);
            
            return response;

        } catch (error) {
            console.error('Error al obtener detalle del candidato:', error);
            throw error;
        }
    }
};
