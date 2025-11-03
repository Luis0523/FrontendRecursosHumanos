/**
 * Script para la página de Registro
 * Maneja los eventos de la página de registro de usuarios
 */

(function() {
    'use strict';

    /**
     * Inicializa los eventos de la página de registro
     */
    function initRegistro() {
        // Prevenir acceso si ya está autenticado
        AuthService.preventAuthenticatedAccess();

        // Mostrar/ocultar campos según el tipo de usuario
        document.querySelectorAll('input[name="rol"]').forEach(radio => {
            radio.addEventListener('change', function() {
                const camposEmpresa = document.getElementById('campos-empresa');
                if (this.value === '2') { // Empresa
                    camposEmpresa.classList.remove('d-none');
                    // Hacer campos requeridos
                    document.getElementById('razon-social').required = true;
                    document.getElementById('nit').required = true;
                } else {
                    camposEmpresa.classList.add('d-none');
                    // Quitar requeridos
                    document.getElementById('razon-social').required = false;
                    document.getElementById('nit').required = false;
                }
            });
        });

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

        // Toggle confirmar contraseña
        const togglePasswordConfirm = document.getElementById('toggle-password-confirm');
        if (togglePasswordConfirm) {
            togglePasswordConfirm.addEventListener('click', function() {
                const passwordInput = document.getElementById('password-confirm');
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

        // Manejar submit del formulario
        const registroForm = document.getElementById('registro-form');
        if (registroForm) {
            registroForm.addEventListener('submit', function(e) {
                e.preventDefault();
                AuthController.handleRegistro(e);
            });
        }
    }

    // Inicializar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initRegistro);
    } else {
        initRegistro();
    }
})();
