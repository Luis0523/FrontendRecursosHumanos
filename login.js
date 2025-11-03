/**
 * Script para la página de Login
 * Maneja los eventos de la página de inicio de sesión
 */

(function() {
    'use strict';

    /**
     * Inicializa los eventos de la página de login
     */
    function initLogin() {
        // Prevenir acceso si ya está autenticado
        AuthService.preventAuthenticatedAccess();

        // Toggle mostrar/ocultar contraseña
        const togglePassword = document.getElementById('toggle-password');
        if (togglePassword) {
            togglePassword.addEventListener('click', function() {
                const passwordInput = document.getElementById('password');
                const icon = this.querySelector('i');

                if (passwordInput.type === 'password') {
                    passwordInput.type = 'text';
                    icon.className = 'bi bi-eye-slash';
                } else {
                    passwordInput.type = 'password';
                    icon.className = 'bi bi-eye';
                }
            });
        }

        // Manejar forgot password
        const forgotPassword = document.getElementById('forgot-password');
        if (forgotPassword) {
            forgotPassword.addEventListener('click', function(e) {
                e.preventDefault();
                Helpers.showWarning('Funcionalidad de recuperación de contraseña en desarrollo');
            });
        }

        // Manejar submit del formulario
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', function(e) {
                e.preventDefault();
                AuthController.handleLogin(e);
            });
        }
    }

    // Inicializar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLogin);
    } else {
        initLogin();
    }
})();
