/**
 * Sistema de carga de componentes HTML
 * Permite cargar navbar, sidebar, footer y otros componentes de forma dinámica
 */

const ComponentLoader = {
    /**
     * Carga un componente HTML en un contenedor específico
     * @param {string} componentPath - Ruta del componente a cargar
     * @param {string} containerId - ID del contenedor donde se insertará el componente
     * @returns {Promise<void>}
     */
    async loadComponent(componentPath, containerId) {
        try {
            const container = document.getElementById(containerId);

            if (!container) {
                console.error(`Contenedor con ID "${containerId}" no encontrado`);
                return;
            }

            const response = await fetch(componentPath);

            if (!response.ok) {
                throw new Error(`Error al cargar ${componentPath}: ${response.status}`);
            }

            const html = await response.text();
            container.innerHTML = html;

            console.log(`Componente ${componentPath} cargado exitosamente`);
        } catch (error) {
            console.error(`Error al cargar componente ${componentPath}:`, error);
        }
    },

    /**
     * Carga el navbar según el rol del usuario
     * @returns {Promise<void>}
     */
    async loadNavbar() {
        const navbarContainer = document.getElementById('navbar-container');

        if (!navbarContainer) {
            console.warn('No se encontró contenedor para navbar');
            return;
        }

        await this.loadComponent('/components/navbar.html', 'navbar-container');

        // Actualizar navbar con información del usuario
        this.updateNavbarWithUserInfo();
    },

    /**
     * Carga el sidebar según el rol del usuario
     * @returns {Promise<void>}
     */
    async loadSidebar() {
        const sidebarContainer = document.getElementById('sidebar-container');

        if (!sidebarContainer) {
            console.warn('No se encontró contenedor para sidebar');
            return;
        }

        const userData = AuthService.getCurrentUser();

        if (!userData) {
            console.warn('No hay usuario autenticado para cargar sidebar');
            return;
        }

        await this.loadComponent('/components/sidebar.html', 'sidebar-container');

        // Actualizar sidebar con menú según el rol
        this.updateSidebarMenu(userData.rol);
    },

    /**
     * Carga el footer
     * @returns {Promise<void>}
     */
    async loadFooter() {
        const footerContainer = document.getElementById('footer-container');

        if (!footerContainer) {
            console.warn('No se encontró contenedor para footer');
            return;
        }

        await this.loadComponent('/components/footer.html', 'footer-container');
    },

    /**
     * Carga todos los componentes comunes (navbar, sidebar, footer)
     * @returns {Promise<void>}
     */
    async loadAllComponents() {
        await Promise.all([
            this.loadNavbar(),
            this.loadSidebar(),
            this.loadFooter()
        ]);

        // Inicializar event listeners DESPUÉS de cargar los componentes
        this.initializeEventListeners();
    },

    /**
     * Actualiza el navbar con la información del usuario actual
     */
    updateNavbarWithUserInfo() {
        const userData = AuthService.getCurrentUser();

        if (!userData) return;

        // Actualizar nombre de usuario
        const userNameElement = document.getElementById('navbar-user-name');
        if (userNameElement) {
            userNameElement.textContent = userData.nombre || 'Usuario';
        }

        // Actualizar email
        const userEmailElement = document.getElementById('navbar-user-email');
        if (userEmailElement) {
            userEmailElement.textContent = userData.email || '';
        }

        // Actualizar rol
        const userRoleElement = document.getElementById('navbar-user-role');
        if (userRoleElement) {
            const roleName = this.getRoleName(userData.rol);
            userRoleElement.textContent = roleName;
        }
    },

    /**
     * Actualiza el menú del sidebar según el rol del usuario
     * @param {string} rol - Nombre del rol del usuario
     */
    updateSidebarMenu(rol) {
        const menuContainer = document.getElementById('sidebar-menu');

        if (!menuContainer) return;

        let menuItems = [];

        switch (rol) {
            case CONFIG.ROLES.ADMIN:
                menuItems = [
                    { icon: 'bi-speedometer2', text: 'Dashboard', link: CONFIG.ROUTES.ADMIN.DASHBOARD },
                    { icon: 'bi-file-earmark-text', text: 'Reportes', link: CONFIG.ROUTES.ADMIN.REPORTES },
                    { icon: 'bi-clock-history', text: 'Historial', link: CONFIG.ROUTES.ADMIN.HISTORIAL }
                ];
                break;

            case CONFIG.ROLES.EMPRESA:
                menuItems = [
                    { icon: 'bi-speedometer2', text: 'Dashboard', link: CONFIG.ROUTES.EMPRESA.DASHBOARD },
                    { icon: 'bi-building', text: 'Mi Empresa', link: CONFIG.ROUTES.EMPRESA.PERFIL },
                    { icon: 'bi-briefcase', text: 'Mis Vacantes', link: CONFIG.ROUTES.EMPRESA.VACANTES },
                    { icon: 'bi-plus-circle', text: 'Nueva Vacante', link: CONFIG.ROUTES.EMPRESA.CREAR_VACANTE },
                    { icon: 'bi-file-earmark-person', text: 'Postulaciones', link: CONFIG.ROUTES.EMPRESA.POSTULACIONES },
                    { icon: 'bi-clipboard-check', text: 'Gestionar Pruebas', link: '/pages/empresa/gestionar-pruebas.html' },
                    { icon: 'bi-search', text: 'Buscar Candidatos', link: CONFIG.ROUTES.EMPRESA.CANDIDATOS }
                ];
                break;

            case CONFIG.ROLES.CANDIDATO:
                menuItems = [
                    { icon: 'bi-speedometer2', text: 'Dashboard', link: CONFIG.ROUTES.CANDIDATO.DASHBOARD },
                    { icon: 'bi-person', text: 'Mi Perfil', link: CONFIG.ROUTES.CANDIDATO.PERFIL },
                    { icon: 'bi-file-earmark-text', text: 'Mi CV', link: CONFIG.ROUTES.CANDIDATO.CV },
                    { icon: 'bi-briefcase', text: 'Buscar Empleos', link: CONFIG.ROUTES.CANDIDATO.VACANTES },
                    { icon: 'bi-file-earmark-person', text: 'Mis Postulaciones', link: CONFIG.ROUTES.CANDIDATO.POSTULACIONES },
                    { icon: 'bi-folder', text: 'Documentos', link: CONFIG.ROUTES.CANDIDATO.DOCUMENTOS },
                    { icon: 'bi-clipboard-check', text: 'Pruebas', link: CONFIG.ROUTES.CANDIDATO.PRUEBAS },
                    { icon: 'bi-calendar-event', text: 'Entrevistas', link: CONFIG.ROUTES.CANDIDATO.ENTREVISTAS }
                ];
                break;

            default:
                console.warn('Rol no reconocido:', rol);
                return;
        }

        // Generar HTML del menú
        const menuHTML = menuItems.map(item => `
            <li class="nav-item">
                <a class="nav-link" href="${item.link}">
                    <i class="bi ${item.icon} me-2"></i>
                    <span>${item.text}</span>
                </a>
            </li>
        `).join('');

        menuContainer.innerHTML = menuHTML;

        // Marcar el elemento activo según la URL actual
        this.setActiveMenuItem();
    },

    /**
     * Marca el elemento del menú activo según la URL actual
     */
    setActiveMenuItem() {
        const currentPath = window.location.pathname;
        const menuLinks = document.querySelectorAll('#sidebar-menu .nav-link');

        menuLinks.forEach(link => {
            const linkPath = new URL(link.href).pathname;

            if (linkPath === currentPath) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    },

    /**
     * Obtiene el nombre del rol para mostrar
     * @param {string} rol - Nombre del rol
     * @returns {string} - Nombre del rol formateado
     */
    getRoleName(rol) {
        switch (rol) {
            case CONFIG.ROLES.ADMIN:
                return 'Administrador';
            case CONFIG.ROLES.EMPRESA:
                return 'Empresa';
            case CONFIG.ROLES.CANDIDATO:
                return 'Candidato';
            default:
                return 'Usuario';
        }
    },

    /**
     * Toggle del sidebar (colapsar/expandir)
     */
    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.getElementById('main-content');

        if (sidebar) {
            sidebar.classList.toggle('collapsed');
        }

        if (mainContent) {
            mainContent.classList.toggle('sidebar-collapsed');
        }
    },

    /**
     * Inicializa los event listeners de los componentes
     */
    initializeEventListeners() {
        console.log('🔧 Inicializando event listeners de componentes...');

        // Toggle del sidebar
        const sidebarToggle = document.getElementById('sidebar-toggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => this.toggleSidebar());
            console.log('✅ Event listener de sidebar-toggle registrado');
        }

        // Logout
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('🚪 Click en logout detectado');
                AuthController.logout();
            });
            console.log('✅ Event listener de logout registrado');
        } else {
            console.warn('⚠️ Botón de logout no encontrado');
        }

        // Cerrar dropdowns al hacer click fuera
        document.addEventListener('click', (e) => {
            const dropdowns = document.querySelectorAll('.dropdown-menu.show');
            dropdowns.forEach(dropdown => {
                if (!dropdown.parentElement.contains(e.target)) {
                    dropdown.classList.remove('show');
                }
            });
        });
    }
};

/**
 * Alias Components para compatibilidad con el código existente
 */
const Components = {
    /**
     * Carga todos los componentes
     */
    async loadAll() {
        await ComponentLoader.loadAllComponents();
    },

    /**
     * Carga navbar
     */
    async loadNavbar() {
        await ComponentLoader.loadNavbar();
    },

    /**
     * Carga sidebar
     */
    async loadSidebar() {
        await ComponentLoader.loadSidebar();
    },

    /**
     * Carga footer
     */
    async loadFooter() {
        await ComponentLoader.loadFooter();
    }
};
