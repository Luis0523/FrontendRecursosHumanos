/**
 * Servicio de Pruebas Psicométricas
 * Maneja la gestión de pruebas, preguntas, asignaciones y respuestas
 */

const PruebasService = {
    /**
     * Crear una nueva prueba psicométrica
     * @param {Object} data - Datos de la prueba
     * @returns {Promise<Object>}
     */
    async crearPrueba(data) {
        return await ApiService.post('/pruebas-psicometricas', data);
    },

    /**
     * Obtener todas las pruebas
     * @param {Object} filtros - Filtros opcionales (tipo, activa)
     * @returns {Promise<Object>}
     */
    async obtenerPruebas(filtros = {}) {
        return await ApiService.get('/pruebas-psicometricas', filtros);
    },

    /**
     * Obtener una prueba por ID con sus preguntas
     * @param {number} id - ID de la prueba
     * @returns {Promise<Object>}
     */
    async obtenerPrueba(id) {
        return await ApiService.get(`/pruebas-psicometricas/${id}`);
    },

    /**
     * Actualizar una prueba existente
     * @param {number} id - ID de la prueba
     * @param {Object} data - Datos actualizados
     * @returns {Promise<Object>}
     */
    async actualizarPrueba(id, data) {
        return await ApiService.put(`/pruebas-psicometricas/${id}`, data);
    },

    /**
     * Eliminar una prueba
     * @param {number} id - ID de la prueba
     * @returns {Promise<Object>}
     */
    async eliminarPrueba(id) {
        return await ApiService.delete(`/pruebas-psicometricas/${id}`);
    },

    /**
     * Crear una pregunta para una prueba
     * @param {Object} data - Datos de la pregunta
     * @returns {Promise<Object>}
     */
    async crearPregunta(data) {
        return await ApiService.post('/pruebas-psicometricas/preguntas', data);
    },

    /**
     * Actualizar una pregunta existente
     * @param {number} id - ID de la pregunta
     * @param {Object} data - Datos actualizados
     * @returns {Promise<Object>}
     */
    async actualizarPregunta(id, data) {
        return await ApiService.put(`/pruebas-psicometricas/preguntas/${id}`, data);
    },

    /**
     * Eliminar una pregunta
     * @param {number} id - ID de la pregunta
     * @returns {Promise<Object>}
     */
    async eliminarPregunta(id) {
        return await ApiService.delete(`/pruebas-psicometricas/preguntas/${id}`);
    },

    /**
     * Asignar una prueba a un candidato
     * @param {Object} data - Datos de la asignación
     * @returns {Promise<Object>}
     */
    async asignarPrueba(data) {
        return await ApiService.post('/pruebas-psicometricas/asignar', data);
    },

    /**
     * Obtener las asignaciones de pruebas (para el candidato actual)
     * @returns {Promise<Object>}
     */
    async obtenerMisAsignaciones() {
        return await ApiService.get('/pruebas-psicometricas/mis-asignaciones');
    },

    /**
     * Obtener asignaciones de una postulación específica
     * @param {number} idPostulacion - ID de la postulación
     * @returns {Promise<Object>}
     */
    async obtenerAsignacionesPorPostulacion(idPostulacion) {
        return await ApiService.get(`/pruebas-psicometricas/asignaciones/postulacion/${idPostulacion}`);
    },

    /**
     * Iniciar una prueba asignada
     * @param {number} idAsignacion - ID de la asignación
     * @returns {Promise<Object>}
     */
    async iniciarPrueba(idAsignacion) {
        return await ApiService.post(`/pruebas-psicometricas/iniciar/${idAsignacion}`);
    },

    /**
     * Guardar una respuesta
     * @param {Object} data - Datos de la respuesta
     * @returns {Promise<Object>}
     */
    async guardarRespuesta(data) {
        return await ApiService.post('/pruebas-psicometricas/respuesta', data);
    },

    /**
     * Finalizar una prueba
     * @param {number} idAsignacion - ID de la asignación
     * @returns {Promise<Object>}
     */
    async finalizarPrueba(idAsignacion) {
        return await ApiService.post(`/pruebas-psicometricas/finalizar/${idAsignacion}`);
    },

    /**
     * Obtener el resultado de una prueba
     * @param {number} idAsignacion - ID de la asignación
     * @returns {Promise<Object>}
     */
    async obtenerResultado(idAsignacion) {
        return await ApiService.get(`/pruebas-psicometricas/resultado/${idAsignacion}`);
    },

    /**
     * Obtener estadísticas de pruebas (para empresa)
     * @returns {Promise<Object>}
     */
    async obtenerEstadisticas() {
        return await ApiService.get('/pruebas-psicometricas/estadisticas');
    },

    /**
     * Obtener prueba completa con preguntas para realizar
     * @param {number} idAsignacion - ID de la asignación
     * @returns {Promise<Object>}
     */
    async obtenerPruebaCompleta(idAsignacion) {
        return await ApiService.get(`/pruebas-psicometricas/asignacion/${idAsignacion}`);
    }
};
