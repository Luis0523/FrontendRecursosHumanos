/**
 * Servicio de Candidatos
 * Maneja las operaciones relacionadas con el perfil del candidato,
 * CV, postulaciones y documentos
 */

const CandidatosService = {
    /**
     * Obtiene el perfil completo del candidato autenticado
     * @returns {Promise<Object>} - Datos del perfil del candidato
     */
    async getMiPerfil() {
        try {
            const response = await ApiService.get('/candidatos/mi-perfil');
            return response;
        } catch (error) {
            console.error('Error al obtener perfil:', error);
            throw error;
        }
    },

    /**
     * Actualiza el perfil del candidato
     * @param {Object} perfilData - Datos del perfil a actualizar
     * @returns {Promise<Object>} - Perfil actualizado
     */
    async actualizarPerfil(perfilData) {
        try {
            const response = await ApiService.put('/candidatos', perfilData);
            return response;
        } catch (error) {
            console.error('Error al actualizar perfil:', error);
            throw error;
        }
    },

    /**
     * Sube el CV del candidato
     * @param {File} cvFile - Archivo PDF del CV
     * @returns {Promise<Object>} - Respuesta con URL del CV
     */
    async subirCV(cvFile) {
        try {
            const formData = new FormData();
            formData.append('cv', cvFile);

            const response = await ApiService.post('/candidatos/cv', formData);
            return response;
        } catch (error) {
            console.error('Error al subir CV:', error);
            throw error;
        }
    },

    /**
     * Elimina el CV del candidato
     * @returns {Promise<Object>} - Respuesta del servidor
     */
    async eliminarCV() {
        try {
            const response = await ApiService.delete('/candidatos/cv');
            return response;
        } catch (error) {
            console.error('Error al eliminar CV:', error);
            throw error;
        }
    },

    /**
     * Busca vacantes públicas con filtros
     * @param {Object} filtros - Filtros de búsqueda (titulo, ubicacion, modalidad, etc.)
     * @returns {Promise<Object>} - Lista de vacantes
     */
    async buscarVacantes(filtros = {}) {
        try {
            const response = await ApiService.get('/vacantes', filtros, false);
            return response;
        } catch (error) {
            console.error('Error al buscar vacantes:', error);
            throw error;
        }
    },

    /**
     * Obtiene el detalle de una vacante específica
     * @param {number} vacanteId - ID de la vacante
     * @returns {Promise<Object>} - Detalles de la vacante
     */
    async getVacanteDetalle(vacanteId) {
        try {
            const response = await ApiService.get(`/vacantes/${vacanteId}`, {}, false);
            return response;
        } catch (error) {
            console.error('Error al obtener detalle de vacante:', error);
            throw error;
        }
    },

    /**
     * Se postula a una vacante
     * @param {number} vacanteId - ID de la vacante
     * @param {string} mensaje - Mensaje opcional para la empresa
     * @returns {Promise<Object>} - Respuesta del servidor
     */
    async postularse(vacanteId, mensaje = null) {
        try {
            const response = await ApiService.post('/vacantes/postularse', {
                id_vacante: vacanteId,
                carta_presentacion: mensaje
            });
            return response;
        } catch (error) {
            console.error('Error al postularse:', error);
            throw error;
        }
    },

    /**
     * Obtiene todas las postulaciones del candidato
     * @param {Object} filtros - Filtros opcionales (estado, fecha, etc.)
     * @returns {Promise<Object>} - Lista de postulaciones
     */
    async getMisPostulaciones(filtros = {}) {
        try {
            const response = await ApiService.get('/vacantes/mis-postulaciones', filtros);
            return response;
        } catch (error) {
            console.error('Error al obtener postulaciones:', error);
            throw error;
        }
    },

    /**
     * Cancela una postulación
     * @param {number} postulacionId - ID de la postulación
     * @returns {Promise<Object>} - Respuesta del servidor
     */
    async cancelarPostulacion(postulacionId) {
        try {
            const response = await ApiService.delete(`/vacantes/postulaciones/${postulacionId}`);
            return response;
        } catch (error) {
            console.error('Error al cancelar postulación:', error);
            throw error;
        }
    },

    /**
     * Obtiene los documentos del candidato
     * @returns {Promise<Object>} - Lista de documentos
     */
    async getMisDocumentos() {
        try {
            const response = await ApiService.get('/documentos/mis-documentos');
            return response;
        } catch (error) {
            console.error('Error al obtener documentos:', error);
            throw error;
        }
    },

    /**
     * Sube un documento de verificación
     * @param {File} archivo - Archivo del documento
     * @param {string} tipo - Tipo de documento
     * @param {string} nombre - Nombre del documento
     * @returns {Promise<Object>} - Documento creado
     */
    async subirDocumento(archivo, tipo, nombre) {
        try {
            const formData = new FormData();
            formData.append('archivo', archivo);
            formData.append('tipo', tipo);
            formData.append('nombre', nombre);

            const response = await ApiService.post('/documentos', formData);
            return response;
        } catch (error) {
            console.error('Error al subir documento:', error);
            throw error;
        }
    },

    /**
     * Elimina un documento
     * @param {number} documentoId - ID del documento
     * @returns {Promise<Object>} - Respuesta del servidor
     */
    async eliminarDocumento(documentoId) {
        try {
            const response = await ApiService.delete(`/documentos/${documentoId}`);
            return response;
        } catch (error) {
            console.error('Error al eliminar documento:', error);
            throw error;
        }
    },

    /**
     * Obtiene las pruebas asignadas al candidato
     * @returns {Promise<Object>} - Lista de pruebas
     */
    async getMisPruebas() {
        try {
            const response = await ApiService.get('/pruebas-psicometricas/mis-asignaciones');
            return response;
        } catch (error) {
            console.error('Error al obtener pruebas:', error);
            throw error;
        }
    },

    /**
     * Obtiene las entrevistas del candidato
     * @returns {Promise<Object>} - Lista de entrevistas
     */
    async getMisEntrevistas() {
        try {
            const response = await ApiService.get('/entrevistas/mis-entrevistas');
            return response;
        } catch (error) {
            console.error('Error al obtener entrevistas:', error);
            throw error;
        }
    }
};
