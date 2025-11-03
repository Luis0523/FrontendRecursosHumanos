/**
 * Script para el componente Sidebar
 * Maneja los eventos y lógica del sidebar
 */

(function() {
    'use strict';

    /**
     * Inicializa los eventos del sidebar
     */
    function initSidebar() {
        const sidebar = document.getElementById('sidebar');
        const sidebarToggle = document.getElementById('sidebar-toggle');

        if (!sidebar) {
            console.warn('Sidebar element not found');
            return;
        }

        // Toggle del sidebar en desktop
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', function() {
                sidebar.classList.toggle('collapsed');

                // Guardar estado en localStorage
                const isCollapsed = sidebar.classList.contains('collapsed');
                localStorage.setItem('sidebar-collapsed', isCollapsed);

                // Ajustar el contenido principal
                const mainContent = document.getElementById('main-content');
                if (mainContent) {
                    mainContent.classList.toggle('sidebar-collapsed');
                }
            });
        }

        // Restaurar estado del sidebar desde localStorage
        const isCollapsed = localStorage.getItem('sidebar-collapsed') === 'true';
        if (isCollapsed && window.innerWidth >= 992) {
            sidebar.classList.add('collapsed');
            const mainContent = document.getElementById('main-content');
            if (mainContent) {
                mainContent.classList.add('sidebar-collapsed');
            }
        }

        // En móvil, toggle para mostrar/ocultar
        if (window.innerWidth < 992) {
            // Crear overlay
            const overlay = document.createElement('div');
            overlay.className = 'sidebar-overlay';
            overlay.id = 'sidebar-overlay';
            document.body.appendChild(overlay);

            // Event listener para el overlay
            overlay.addEventListener('click', function() {
                sidebar.classList.remove('show');
                overlay.classList.remove('show');
            });
        }

        // Manejar resize
        window.addEventListener('resize', function() {
            if (window.innerWidth >= 992) {
                sidebar.classList.remove('show');
                const overlay = document.getElementById('sidebar-overlay');
                if (overlay) {
                    overlay.classList.remove('show');
                }
            }
        });

        // Actualizar el toggle del ComponentLoader para que funcione correctamente
        updateComponentLoaderToggle(sidebar);
    }

    /**
     * Actualiza la función toggleSidebar del ComponentLoader
     * @param {HTMLElement} sidebar - Elemento del sidebar
     */
    function updateComponentLoaderToggle(sidebar) {
        if (typeof ComponentLoader !== 'undefined') {
            ComponentLoader.toggleSidebar = function() {
                const overlay = document.getElementById('sidebar-overlay');

                if (window.innerWidth < 992) {
                    // En móvil: mostrar/ocultar con overlay
                    sidebar.classList.toggle('show');
                    if (overlay) {
                        overlay.classList.toggle('show');
                    }
                } else {
                    // En desktop: colapsar/expandir
                    sidebar.classList.toggle('collapsed');
                    const mainContent = document.getElementById('main-content');
                    if (mainContent) {
                        mainContent.classList.toggle('sidebar-collapsed');
                    }

                    // Guardar estado
                    const isCollapsed = sidebar.classList.contains('collapsed');
                    localStorage.setItem('sidebar-collapsed', isCollapsed);
                }
            };
        }
    }

    // Inicializar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSidebar);
    } else {
        initSidebar();
    }
})();
