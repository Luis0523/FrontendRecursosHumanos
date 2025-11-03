/**
 * Servicio de Autenticación
 * Maneja login, registro, logout y gestión de sesiones
 */

const AuthService = {
    /**
     * Inicia sesión de un usuario
     * @param {string} email - Email del usuario
     * @param {string} password - Contraseña del usuario
     * @returns {Promise<Object>} - Datos del usuario y token
     */
    async login(email, password) {
        try {
            const response = await ApiService.post('/auth/login', {
                email,
                password
            }, false); // No incluir auth porque aún no tiene token

            if (response.success) {
                // Guardar token y datos del usuario
                this.saveSession(response.data.token, response.data.usuario);
                return response;
            }

            throw new Error(response.message || 'Error al iniciar sesión');
        } catch (error) {
            console.error('Error en login:', error);
            throw error;
        }
    },

    /**
     * Registra un nuevo usuario
     * @param {Object} userData - Datos del usuario a registrar
     * @returns {Promise<Object>} - Respuesta del servidor
     */
    async registro(userData) {
        try {
            const response = await ApiService.post('/auth/registro', userData, false);

            if (response.success) {
                // Guardar token y datos del usuario
                this.saveSession(response.data.token, response.data.usuario);
                return response;
            }

            throw new Error(response.message || 'Error al registrar usuario');
        } catch (error) {
            console.error('Error en registro:', error);
            throw error;
        }
    },

    /**
     * Cierra la sesión del usuario
     */
    logout() {
        // Limpiar localStorage
        localStorage.removeItem(CONFIG.TOKEN_KEY);
        localStorage.removeItem(CONFIG.USER_KEY);

        // Redirigir al login
        window.location.href = CONFIG.ROUTES.LOGIN;
    },

    /**
     * Guarda la sesión en localStorage
     * @param {string} token - Token JWT
     * @param {Object} userData - Datos del usuario
     */
    saveSession(token, userData) {
        localStorage.setItem(CONFIG.TOKEN_KEY, token);
        localStorage.setItem(CONFIG.USER_KEY, JSON.stringify(userData));
    },

    /**
     * Obtiene los datos del usuario actual
     * @returns {Object|null} - Datos del usuario o null
     */
    getCurrentUser() {
        const userDataString = localStorage.getItem(CONFIG.USER_KEY);

        if (!userDataString) {
            return null;
        }

        try {
            return JSON.parse(userDataString);
        } catch (error) {
            console.error('Error al parsear datos del usuario:', error);
            return null;
        }
    },

    /**
     * Verifica si el usuario está autenticado
     * @returns {boolean} - True si está autenticado
     */
    isAuthenticated() {
        const token = localStorage.getItem(CONFIG.TOKEN_KEY);
        const userData = this.getCurrentUser();

        return !!(token && userData);
    },

    /**
     * Obtiene el token JWT actual
     * @returns {string|null} - Token o null
     */
    getToken() {
        return localStorage.getItem(CONFIG.TOKEN_KEY);
    },

    /**
     * Verifica si el usuario tiene un rol específico
     * @param {number} rolId - ID del rol a verificar
     * @returns {boolean} - True si el usuario tiene ese rol
     */
    hasRole(rolId) {
        const userData = this.getCurrentUser();

        if (!userData) {
            return false;
        }

        return userData.rol === rolId;
    },

    /**
     * Verifica si el usuario es administrador
     * @returns {boolean}
     */
    isAdmin() {
        return this.hasRole(CONFIG.ROLES.ADMIN);
    },

    /**
     * Verifica si el usuario es empresa
     * @returns {boolean}
     */
    isEmpresa() {
        console.log(this.hasRole(CONFIG.ROLES.EMPRESA));
        return this.hasRole(CONFIG.ROLES.EMPRESA);
    },

    /**
     * Verifica si el usuario es candidato
     * @returns {boolean}
     */
    isCandidato() {
        console.log(this.hasRole(CONFIG.ROLES.CANDIDATO))
        return this.hasRole(CONFIG.ROLES.CANDIDATO);
    },

    /**
     * Obtiene el perfil completo del usuario actual
     * @returns {Promise<Object>} - Perfil del usuario
     */
    async getPerfil() {
        try {
            const response = await ApiService.get('/auth/perfil');

            if (response.success) {
                // Actualizar datos del usuario en localStorage
                const currentData = this.getCurrentUser();
                const updatedData = { ...currentData, ...response.data };
                localStorage.setItem(CONFIG.USER_KEY, JSON.stringify(updatedData));

                return response;
            }

            throw new Error(response.message || 'Error al obtener perfil');
        } catch (error) {
            console.error('Error al obtener perfil:', error);
            throw error;
        }
    },

    /**
     * Actualiza el perfil del usuario
     * @param {Object} profileData - Datos del perfil a actualizar
     * @returns {Promise<Object>} - Respuesta del servidor
     */
    async updatePerfil(profileData) {
        try {
            const response = await ApiService.put('/auth/perfil', profileData);

            if (response.success) {
                // Actualizar datos del usuario en localStorage
                const currentData = this.getCurrentUser();
                const updatedData = { ...currentData, ...response.data };
                localStorage.setItem(CONFIG.USER_KEY, JSON.stringify(updatedData));

                return response;
            }

            throw new Error(response.message || 'Error al actualizar perfil');
        } catch (error) {
            console.error('Error al actualizar perfil:', error);
            throw error;
        }
    },

    /**
     * Cambia la contraseña del usuario
     * @param {string} currentPassword - Contraseña actual
     * @param {string} newPassword - Nueva contraseña
     * @returns {Promise<Object>} - Respuesta del servidor
     */
    async cambiarPassword(currentPassword, newPassword) {
        try {
            const response = await ApiService.put('/auth/cambiar-contraseña', {
                contraseña_actual: currentPassword,
                nueva_contraseña: newPassword
            });

            return response;
        } catch (error) {
            console.error('Error al cambiar contraseña:', error);
            throw error;
        }
    },

    /**
     * Solicita recuperación de contraseña
     * @param {string} email - Email del usuario
     * @returns {Promise<Object>} - Respuesta del servidor
     */
    async solicitarRecuperacion(email) {
        try {
            const response = await ApiService.post('/auth/solicitar-recuperacion', {
                email
            }, false);

            return response;
        } catch (error) {
            console.error('Error al solicitar recuperación:', error);
            throw error;
        }
    },

    /**
     * Restablece la contraseña con un token
     * @param {string} token - Token de recuperación
     * @param {string} newPassword - Nueva contraseña
     * @returns {Promise<Object>} - Respuesta del servidor
     */
    async restablecerPassword(token, newPassword) {
        try {
            const response = await ApiService.post('/auth/restablecer-contraseña', {
                token,
                nueva_contraseña: newPassword
            }, false);

            return response;
        } catch (error) {
            console.error('Error al restablecer contraseña:', error);
            throw error;
        }
    },

    /**
     * Redirige al dashboard según el rol del usuario
     */
    redirectToDashboard() {
        const userData = this.getCurrentUser();

        if (!userData) {
            window.location.href = CONFIG.ROUTES.LOGIN;
            return;
        }

        console.log(userData.rol);
        switch (userData.rol) {
            
            case CONFIG.ROLES.ADMIN:
                window.location.href = CONFIG.ROUTES.ADMIN.DASHBOARD;
                break;

            case CONFIG.ROLES.EMPRESA:
                window.location.href = CONFIG.ROUTES.EMPRESA.DASHBOARD;
                break;

            case CONFIG.ROLES.CANDIDATO:
                window.location.href = CONFIG.ROUTES.CANDIDATO.DASHBOARD;
                break;

            default:
                console.warn('Rol no reconocido, redirigiendo al home');
                window.location.href = CONFIG.ROUTES.HOME;
        }
    },

    /**
     * Protege una página requiriendo autenticación
     * Si el usuario no está autenticado, lo redirige al login
     * @param {number|null} requiredRole - Rol requerido (opcional)
     */
    protectPage(requiredRole = null) {
        if (!this.isAuthenticated()) {
            window.location.href = CONFIG.ROUTES.LOGIN;
            return;
        }

        console.log(requiredRole);
        // Si se especifica un rol requerido, verificarlo
        if (requiredRole !== null && !this.hasRole(requiredRole)) {
            alert('No tienes permisos para acceder a esta página');
            this.redirectToDashboard();
        }
    },

    /**
     * Previene el acceso a páginas públicas si ya está autenticado
     * (ej: login, registro)
     */
    preventAuthenticatedAccess() {
        if (this.isAuthenticated()) {
            this.redirectToDashboard();
        }
    },

    /**
     * Verifica la autenticación y redirige si no está autenticado
     * @returns {boolean} - True si está autenticado
     */
    checkAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = CONFIG.ROUTES.LOGIN;
            return false;
        }
        return true;
    },

    /**
     * Obtiene el usuario actual (alias de getCurrentUser)
     * @returns {Object|null} - Datos del usuario o null
     */
    getUser() {
        return this.getCurrentUser();
    }
};
