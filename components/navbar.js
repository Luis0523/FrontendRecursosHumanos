/**
 * Script para el componente Navbar
 * Maneja los eventos y lógica del navbar
 */

(function() {
    'use strict';

    /**
     * Inicializa los eventos del navbar
     */
    function initNavbar() {
        // Toggle del sidebar en móvil
        const sidebarToggleMobile = document.getElementById('sidebar-toggle-mobile');
        if (sidebarToggleMobile) {
            sidebarToggleMobile.addEventListener('click', function() {
                if (typeof ComponentLoader !== 'undefined') {
                    ComponentLoader.toggleSidebar();
                }
            });
        }

        // Link a perfil
        const navPerfil = document.getElementById('nav-perfil');
        if (navPerfil) {
            navPerfil.addEventListener('click', function(e) {
                e.preventDefault();
                const userData = AuthService.getCurrentUser();
                if (userData) {
                    switch(userData.rol) {
                        case CONFIG.ROLES.ADMIN:
                            window.location.href = CONFIG.ROUTES.ADMIN.DASHBOARD;
                            break;
                        case CONFIG.ROLES.EMPRESA:
                            window.location.href = CONFIG.ROUTES.EMPRESA.PERFIL;
                            break;
                        case CONFIG.ROLES.CANDIDATO:
                            window.location.href = CONFIG.ROUTES.CANDIDATO.PERFIL;
                            break;
                    }
                }
            });
        }

        // Link a configuración (placeholder)
        const navConfiguracion = document.getElementById('nav-configuracion');
        if (navConfiguracion) {
            navConfiguracion.addEventListener('click', function(e) {
                e.preventDefault();
                if (typeof Helpers !== 'undefined') {
                    Helpers.showWarning('Funcionalidad en desarrollo');
                }
            });
        }
    }

    // Inicializar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initNavbar);
    } else {
        initNavbar();
    }
})();
