/**
 * Archivo principal de inicialización de la aplicación
 * Se ejecuta en todas las páginas que requieren componentes dinámicos
 */

(function() {
    'use strict';

    /**
     * Inicializa la aplicación
     */
    async function initApp() {
        console.log('🚀 Inicializando aplicación...');

        // Verificar si estamos en una página que requiere autenticación
        const isProtectedPage = checkIfProtectedPage();

        if (isProtectedPage) {
            // Proteger la página
            if (!AuthService.isAuthenticated()) {
                console.warn('Usuario no autenticado, redirigiendo al login...');
                window.location.href = CONFIG.ROUTES.LOGIN;
                return;
            }

            // Cargar componentes (navbar, sidebar, footer)
            await loadComponents();

            console.log('✅ Aplicación inicializada correctamente');
        }

        // Inicializar event listeners globales
        initGlobalEventListeners();
    }

    /**
     * Verifica si la página actual requiere autenticación
     * @returns {boolean}
     */
    function checkIfProtectedPage() {
        const path = window.location.pathname;

        // Páginas públicas
        const publicPages = [
            '/index.html',
            '/login.html',
            '/registro.html',
            '/',
            ''
        ];

        // Si la ruta está en páginas públicas, no requiere autenticación
        if (publicPages.includes(path)) {
            return false;
        }

        // Si la ruta contiene /pages/, requiere autenticación
        if (path.includes('/pages/')) {
            return true;
        }

        return false;
    }

    /**
     * Carga los componentes dinámicos (navbar, sidebar, footer)
     */
    async function loadComponents() {
        try {
            console.log('📦 Cargando componentes...');

            // Cargar todos los componentes en paralelo
            await ComponentLoader.loadAllComponents();

            console.log('✅ Componentes cargados');
        } catch (error) {
            console.error('❌ Error al cargar componentes:', error);
        }
    }

    /**
     * Inicializa event listeners globales
     */
    function initGlobalEventListeners() {
        // Manejar errores de red globalmente
        window.addEventListener('offline', function() {
            Helpers.showWarning('Se ha perdido la conexión a internet');
        });

        window.addEventListener('online', function() {
            Helpers.showSuccess('Conexión restaurada');
        });

        // Prevenir submit de formularios por defecto (para debugging)
        // Se puede descomentar si se necesita
        /*
        document.addEventListener('submit', function(e) {
            console.log('Formulario enviado:', e.target.id);
        });
        */

        // Manejar clicks en links externos
        document.addEventListener('click', function(e) {
            const link = e.target.closest('a');
            if (link && link.hostname !== window.location.hostname) {
                // Link externo
                link.setAttribute('target', '_blank');
                link.setAttribute('rel', 'noopener noreferrer');
            }
        });

        // Debug: mostrar errores de JavaScript en consola
        window.addEventListener('error', function(e) {
            console.error('Error global:', e.error);
        });

        // Debug: mostrar promesas rechazadas
        window.addEventListener('unhandledrejection', function(e) {
            console.error('Promesa rechazada:', e.reason);
        });
    }

    /**
     * Inicializa tooltips de Bootstrap si está disponible
     */
    function initBootstrapTooltips() {
        if (typeof bootstrap !== 'undefined') {
            const tooltipTriggerList = [].slice.call(
                document.querySelectorAll('[data-bs-toggle="tooltip"]')
            );
            tooltipTriggerList.map(function(tooltipTriggerEl) {
                return new bootstrap.Tooltip(tooltipTriggerEl);
            });
        }
    }

    /**
     * Inicializa popovers de Bootstrap si está disponible
     */
    function initBootstrapPopovers() {
        if (typeof bootstrap !== 'undefined') {
            const popoverTriggerList = [].slice.call(
                document.querySelectorAll('[data-bs-toggle="popover"]')
            );
            popoverTriggerList.map(function(popoverTriggerEl) {
                return new bootstrap.Popover(popoverTriggerEl);
            });
        }
    }

    /**
     * Maneja la navegación del historial del navegador
     */
    function handleBrowserNavigation() {
        window.addEventListener('popstate', function(e) {
            console.log('Navegación del historial:', e.state);
            // Aquí se puede manejar la navegación SPA si se implementa
        });
    }

    /**
     * Actualiza el título de la página según la ruta
     */
    function updatePageTitle() {
        const path = window.location.pathname;
        let title = 'ARCO - Gestión de Talento Humano';

        // Mapeo de rutas a títulos
        const titleMap = {
            '/login.html': 'Iniciar Sesión',
            '/registro.html': 'Registro',
            '/pages/admin/dashboard.html': 'Dashboard - Administrador',
            '/pages/empresa/dashboard.html': 'Dashboard - Empresa',
            '/pages/candidato/dashboard.html': 'Dashboard - Candidato',
            // Agregar más rutas según sea necesario
        };

        if (titleMap[path]) {
            title = `${titleMap[path]} - ARCO`;
        }

        document.title = title;
    }

    /**
     * Detecta el modo de tema preferido del usuario (claro/oscuro)
     * Preparado para implementación futura
     */
    function detectThemePreference() {
        const savedTheme = localStorage.getItem('theme');

        if (savedTheme) {
            document.documentElement.setAttribute('data-theme', savedTheme);
        } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.setAttribute('data-theme', 'dark');
        }
    }

    /**
     * Registra información de analytics (placeholder para futura implementación)
     */
    function trackPageView() {
        // Aquí se puede integrar Google Analytics, Mixpanel, etc.
        console.log('📊 Page view:', window.location.pathname);
    }

    // Esperar a que el DOM esté completamente cargado
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', async function() {
            await initApp();
            initBootstrapTooltips();
            initBootstrapPopovers();
            handleBrowserNavigation();
            updatePageTitle();
            detectThemePreference();
            trackPageView();
        });
    } else {
        // DOM ya está listo
        (async function() {
            await initApp();
            initBootstrapTooltips();
            initBootstrapPopovers();
            handleBrowserNavigation();
            updatePageTitle();
            detectThemePreference();
            trackPageView();
        })();
    }

    // Exportar funciones útiles al scope global si es necesario
    window.App = {
        init: initApp,
        loadComponents: loadComponents,
        updatePageTitle: updatePageTitle
    };

    console.log('📱 Main.js cargado correctamente');
})();
