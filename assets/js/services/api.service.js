/**
 * Servicio base de API
 * Maneja todas las peticiones HTTP al backend
 * Proporciona métodos reutilizables para GET, POST, PUT, DELETE
 */

const ApiService = {
    /**
     * Obtiene el token JWT del localStorage
     * @returns {string|null} - Token JWT o null
     */
    getToken() {
        return localStorage.getItem(CONFIG.TOKEN_KEY);
    },

    /**
     * Construye los headers para las peticiones HTTP
     * @param {boolean} includeAuth - Incluir header de autorización
     * @param {boolean} isFormData - Si el body es FormData (para archivos)
     * @returns {Object} - Headers de la petición
     */
    getHeaders(includeAuth = true, isFormData = false) {
        const headers = {};

        // Solo agregar Content-Type si no es FormData
        // (FormData establece automáticamente multipart/form-data con boundary)
        if (!isFormData) {
            headers['Content-Type'] = 'application/json';
        }

        // Agregar token de autorización si está disponible
        if (includeAuth) {
            const token = this.getToken();
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }

        return headers;
    },

    /**
     * Maneja errores de las peticiones HTTP
     * @param {Response} response - Respuesta HTTP
     * @returns {Promise<Object>} - Datos de la respuesta o error
     */
    async handleResponse(response) {
        // Intentar parsear JSON
        let data;
        try {
            data = await response.json();
        } catch (error) {
            // Si no es JSON, crear objeto de error
            data = {
                success: false,
                message: 'Error al procesar la respuesta del servidor'
            };
        }

        // Si la respuesta no es exitosa
        if (!response.ok) {
            // Manejar errores específicos
            if (response.status === 401) {
                // Token expirado o no autorizado
                this.handleUnauthorized();
                throw new Error(data.message || CONFIG.MESSAGES.ERROR_UNAUTHORIZED);
            }

            if (response.status === 403) {
                throw new Error(data.message || 'No tienes permisos para realizar esta acción');
            }

            if (response.status === 404) {
                throw new Error(data.message || 'Recurso no encontrado');
            }

            if (response.status === 500) {
                throw new Error(data.message || 'Error interno del servidor');
            }

            // Error genérico
            throw new Error(data.message || CONFIG.MESSAGES.ERROR_GENERAL);
        }

        return data;
    },

    /**
     * Maneja errores de red
     * @param {Error} error - Error de la petición
     */
    handleNetworkError(error) {
        console.error('Error de red:', error);

        if (error.message === 'Failed to fetch') {
            throw new Error(CONFIG.MESSAGES.ERROR_NETWORK);
        }

        throw error;
    },

    /**
     * Maneja sesiones no autorizadas
     */
    handleUnauthorized() {
        // Limpiar datos de sesión
        localStorage.removeItem(CONFIG.TOKEN_KEY);
        localStorage.removeItem(CONFIG.USER_KEY);

        // Redirigir al login después de un breve delay
        setTimeout(() => {
            window.location.href = CONFIG.ROUTES.LOGIN;
        }, 1500);
    },

    /**
     * Petición GET
     * @param {string} endpoint - Endpoint de la API (ej: '/vacantes')
     * @param {Object} params - Parámetros de query string
     * @param {boolean} includeAuth - Incluir autorización
     * @returns {Promise<Object>} - Respuesta de la API
     */
    async get(endpoint, params = {}, includeAuth = true) {
        try {
            // Construir URL con query params
            const url = new URL(`${CONFIG.API_URL}${endpoint}`);
            Object.keys(params).forEach(key => {
                if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
                    url.searchParams.append(key, params[key]);
                }
            });

            const response = await fetch(url.toString(), {
                method: 'GET',
                headers: this.getHeaders(includeAuth),
                timeout: CONFIG.REQUEST_TIMEOUT
            });

            return await this.handleResponse(response);
        } catch (error) {
            this.handleNetworkError(error);
        }
    },

    /**
     * Petición POST
     * @param {string} endpoint - Endpoint de la API
     * @param {Object} data - Datos a enviar
     * @param {boolean} includeAuth - Incluir autorización
     * @returns {Promise<Object>} - Respuesta de la API
     */
    async post(endpoint, data = {}, includeAuth = true) {
        try {
            const isFormData = data instanceof FormData;

            const response = await fetch(`${CONFIG.API_URL}${endpoint}`, {
                method: 'POST',
                headers: this.getHeaders(includeAuth, isFormData),
                body: isFormData ? data : JSON.stringify(data),
                timeout: CONFIG.REQUEST_TIMEOUT
            });

            return await this.handleResponse(response);
        } catch (error) {
            this.handleNetworkError(error);
        }
    },

    /**
     * Petición PUT
     * @param {string} endpoint - Endpoint de la API
     * @param {Object} data - Datos a enviar
     * @param {boolean} includeAuth - Incluir autorización
     * @returns {Promise<Object>} - Respuesta de la API
     */
    async put(endpoint, data = {}, includeAuth = true) {
        try {
            const isFormData = data instanceof FormData;

            const response = await fetch(`${CONFIG.API_URL}${endpoint}`, {
                method: 'PUT',
                headers: this.getHeaders(includeAuth, isFormData),
                body: isFormData ? data : JSON.stringify(data),
                timeout: CONFIG.REQUEST_TIMEOUT
            });

            return await this.handleResponse(response);
        } catch (error) {
            this.handleNetworkError(error);
        }
    },

    /**
     * Petición PATCH
     * @param {string} endpoint - Endpoint de la API
     * @param {Object} data - Datos a enviar
     * @param {boolean} includeAuth - Incluir autorización
     * @returns {Promise<Object>} - Respuesta de la API
     */
    async patch(endpoint, data = {}, includeAuth = true) {
        try {
            const response = await fetch(`${CONFIG.API_URL}${endpoint}`, {
                method: 'PATCH',
                headers: this.getHeaders(includeAuth),
                body: JSON.stringify(data),
                timeout: CONFIG.REQUEST_TIMEOUT
            });

            return await this.handleResponse(response);
        } catch (error) {
            this.handleNetworkError(error);
        }
    },

    /**
     * Petición DELETE
     * @param {string} endpoint - Endpoint de la API
     * @param {boolean} includeAuth - Incluir autorización
     * @returns {Promise<Object>} - Respuesta de la API
     */
    async delete(endpoint, includeAuth = true) {
        try {
            const response = await fetch(`${CONFIG.API_URL}${endpoint}`, {
                method: 'DELETE',
                headers: this.getHeaders(includeAuth),
                timeout: CONFIG.REQUEST_TIMEOUT
            });

            return await this.handleResponse(response);
        } catch (error) {
            this.handleNetworkError(error);
        }
    },

    /**
     * Descarga un archivo
     * @param {string} endpoint - Endpoint de la API
     * @param {string} filename - Nombre del archivo a descargar
     * @returns {Promise<void>}
     */
    async downloadFile(endpoint, filename) {
        try {
            const response = await fetch(`${CONFIG.API_URL}${endpoint}`, {
                method: 'GET',
                headers: this.getHeaders(true)
            });

            if (!response.ok) {
                throw new Error('Error al descargar el archivo');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Error al descargar archivo:', error);
            throw error;
        }
    }
};
