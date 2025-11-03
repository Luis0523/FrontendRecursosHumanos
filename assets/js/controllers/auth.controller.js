/**
 * Controlador de Autenticación
 * Maneja las interacciones del usuario con login, registro y recuperación de contraseña
 */

const AuthController = {
    /**
     * Maneja el login del usuario
     * @param {Event} event - Evento del formulario
     */
    async handleLogin(event) {
        event.preventDefault();

        // Obtener valores del formulario
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        // Limpiar errores previos
        Validators.clearAllValidationErrors('login-form');

        // Validar email
        if (!Validators.isValidEmail(email)) {
            Validators.showValidationError('email', 'Por favor, ingresa un email válido');
            return;
        }

        // Validar contraseña
        const passwordValidation = Validators.validatePassword(password);
        if (!passwordValidation.valid) {
            Validators.showValidationError('password', passwordValidation.message);
            return;
        }

        // Deshabilitar botón y mostrar loading
        const loginBtn = document.getElementById('login-btn');
        const originalBtnText = loginBtn.innerHTML;
        loginBtn.disabled = true;
        loginBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Iniciando sesión...';

        try {
            // Intentar login
            const response = await AuthService.login(email, password);

            if (response.success) {
                // Mostrar mensaje de éxito
                Helpers.showSuccess('Sesión iniciada correctamente');

                // Redirigir al dashboard según el rol
                setTimeout(() => {
                    AuthService.redirectToDashboard();
                }, 1000);
            }
        } catch (error) {
            console.error('Error en login:', error);
            Helpers.showError(error.message || 'Error al iniciar sesión');

            // Restaurar botón
            loginBtn.disabled = false;
            loginBtn.innerHTML = originalBtnText;
        }
    },

    /**
     * Maneja el registro de un nuevo usuario
     * @param {Event} event - Evento del formulario
     */
    async handleRegistro(event) {
        event.preventDefault();

        // Obtener valores del formulario
        const nombre = document.getElementById('nombre').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('password-confirm').value;
        const telefono = document.getElementById('telefono').value.trim();
        const ubicacion = document.getElementById('ubicacion').value.trim();
        const rolId = parseInt(document.querySelector('input[name="rol"]:checked').value);
        const terminos = document.getElementById('terminos').checked;

        // Limpiar errores previos
        Validators.clearAllValidationErrors('registro-form');

        // Validaciones
        let hasErrors = false;

        // Validar nombre
        if (!Validators.isNotEmpty(nombre)) {
            Validators.showValidationError('nombre', 'El nombre es requerido');
            hasErrors = true;
        }

        // Validar email
        if (!Validators.isValidEmail(email)) {
            Validators.showValidationError('email', 'Por favor, ingresa un email válido');
            hasErrors = true;
        }

        // Validar contraseña
        const passwordValidation = Validators.validatePassword(password, 6);
        if (!passwordValidation.valid) {
            Validators.showValidationError('password', passwordValidation.message);
            hasErrors = true;
        }

        // Validar que las contraseñas coincidan
        if (password !== passwordConfirm) {
            Validators.showValidationError('password-confirm', 'Las contraseñas no coinciden');
            hasErrors = true;
        }

        // Validar teléfono si se proporciona
        if (telefono && !Validators.isValidPhone(telefono)) {
            Validators.showValidationError('telefono', 'Por favor, ingresa un teléfono válido');
            hasErrors = true;
        }

        // Validar campos de empresa si el rol es empresa
        if (rolId === CONFIG.ROLES.EMPRESA) {
            const razonSocial = document.getElementById('razon-social').value.trim();
            const nit = document.getElementById('nit').value.trim();

            if (!Validators.isNotEmpty(razonSocial)) {
                Validators.showValidationError('razon-social', 'La razón social es requerida');
                hasErrors = true;
            }

            if (!Validators.isValidNIT(nit)) {
                Validators.showValidationError('nit', 'Por favor, ingresa un NIT válido (ej: 123456789-0)');
                hasErrors = true;
            }
        }

        // Validar términos
        if (!terminos) {
            const terminosInput = document.getElementById('terminos');
            terminosInput.classList.add('is-invalid');
            hasErrors = true;
        }

        if (hasErrors) {
            return;
        }

        // Construir objeto de datos
        const userData = {
            nombre,
            email,
            password,
            telefono: telefono || null,
            ubicacion: ubicacion || null,
            rol_id: rolId
        };

        // Si es empresa, agregar datos adicionales
        if (rolId === CONFIG.ROLES.EMPRESA) {
            userData.empresa = {
                razon_social: document.getElementById('razon-social').value.trim(),
                nit: document.getElementById('nit').value.trim(),
                sector: document.getElementById('sector').value.trim() || null,
                sitio_web: document.getElementById('sitio-web').value.trim() || null,
                descripcion: document.getElementById('descripcion-empresa').value.trim() || null
            };
        }

        // Deshabilitar botón y mostrar loading
        const registroBtn = document.getElementById('registro-btn');
        const originalBtnText = registroBtn.innerHTML;
        registroBtn.disabled = true;
        registroBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Creando cuenta...';

        try {
            // Intentar registro
            const response = await AuthService.registro(userData);

            if (response.success) {
                // Mostrar mensaje de éxito
                Helpers.showSuccess('Cuenta creada exitosamente. Redirigiendo...');

                // Redirigir al dashboard según el rol
                setTimeout(() => {
                    AuthService.redirectToDashboard();
                }, 1500);
            }
        } catch (error) {
            console.error('Error en registro:', error);
            Helpers.showError(error.message || 'Error al crear la cuenta');

            // Restaurar botón
            registroBtn.disabled = false;
            registroBtn.innerHTML = originalBtnText;
        }
    },

    /**
     * Maneja el cierre de sesión
     */
    logout() {
        Helpers.confirm('¿Estás seguro de que deseas cerrar sesión?', 'Cerrar Sesión')
            .then(confirmed => {
                if (confirmed) {
                    AuthService.logout();
                }
            });
    },

    /**
     * Maneja la recuperación de contraseña
     * @param {Event} event - Evento del formulario
     */
    async handleRecuperarPassword(event) {
        event.preventDefault();

        const email = document.getElementById('email').value.trim();

        // Validar email
        if (!Validators.isValidEmail(email)) {
            Validators.showValidationError('email', 'Por favor, ingresa un email válido');
            return;
        }

        // Deshabilitar botón
        const btn = event.target.querySelector('button[type="submit"]');
        const originalBtnText = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Enviando...';

        try {
            const response = await AuthService.solicitarRecuperacion(email);

            if (response.success) {
                Helpers.showSuccess('Se ha enviado un enlace de recuperación a tu email');

                // Limpiar formulario
                event.target.reset();
            }
        } catch (error) {
            console.error('Error al solicitar recuperación:', error);
            Helpers.showError(error.message || 'Error al enviar el email de recuperación');
        } finally {
            // Restaurar botón
            btn.disabled = false;
            btn.innerHTML = originalBtnText;
        }
    },

    /**
     * Maneja el restablecimiento de contraseña
     * @param {Event} event - Evento del formulario
     */
    async handleRestablecerPassword(event) {
        event.preventDefault();

        const token = Helpers.getURLParameter('token');
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        // Validar token
        if (!token) {
            Helpers.showError('Token de recuperación inválido o expirado');
            return;
        }

        // Validar contraseña
        const passwordValidation = Validators.validatePassword(newPassword, 6);
        if (!passwordValidation.valid) {
            Validators.showValidationError('new-password', passwordValidation.message);
            return;
        }

        // Validar que coincidan
        if (newPassword !== confirmPassword) {
            Validators.showValidationError('confirm-password', 'Las contraseñas no coinciden');
            return;
        }

        // Deshabilitar botón
        const btn = event.target.querySelector('button[type="submit"]');
        const originalBtnText = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Restableciendo...';

        try {
            const response = await AuthService.restablecerPassword(token, newPassword);

            if (response.success) {
                Helpers.showSuccess('Contraseña restablecida exitosamente. Redirigiendo al login...');

                // Redirigir al login
                setTimeout(() => {
                    window.location.href = CONFIG.ROUTES.LOGIN;
                }, 2000);
            }
        } catch (error) {
            console.error('Error al restablecer contraseña:', error);
            Helpers.showError(error.message || 'Error al restablecer la contraseña');

            // Restaurar botón
            btn.disabled = false;
            btn.innerHTML = originalBtnText;
        }
    },

    /**
     * Maneja el cambio de contraseña desde el perfil
     * @param {Event} event - Evento del formulario
     */
    async handleCambiarPassword(event) {
        event.preventDefault();

        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        // Limpiar errores previos
        Validators.clearAllValidationErrors('cambiar-password-form');

        // Validaciones
        let hasErrors = false;

        // Validar contraseña actual
        if (!Validators.isNotEmpty(currentPassword)) {
            Validators.showValidationError('current-password', 'La contraseña actual es requerida');
            hasErrors = true;
        }

        // Validar nueva contraseña
        const passwordValidation = Validators.validatePassword(newPassword, 6);
        if (!passwordValidation.valid) {
            Validators.showValidationError('new-password', passwordValidation.message);
            hasErrors = true;
        }

        // Validar que coincidan
        if (newPassword !== confirmPassword) {
            Validators.showValidationError('confirm-password', 'Las contraseñas no coinciden');
            hasErrors = true;
        }

        if (hasErrors) {
            return;
        }

        // Deshabilitar botón
        const btn = event.target.querySelector('button[type="submit"]');
        const originalBtnText = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Cambiando...';

        try {
            const response = await AuthService.cambiarPassword(currentPassword, newPassword);

            if (response.success) {
                Helpers.showSuccess('Contraseña cambiada exitosamente');

                // Limpiar formulario
                event.target.reset();
            }
        } catch (error) {
            console.error('Error al cambiar contraseña:', error);
            Helpers.showError(error.message || 'Error al cambiar la contraseña');
        } finally {
            // Restaurar botón
            btn.disabled = false;
            btn.innerHTML = originalBtnText;
        }
    }
};
