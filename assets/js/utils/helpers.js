/**
 * Funciones helper y utilidades generales
 * Contiene funciones reutilizables para el proyecto
 */

const Helpers = {
    /**
     * Formatea una fecha a formato legible en español
     * @param {string|Date} date - Fecha a formatear
     * @param {boolean} includeTime - Incluir hora (por defecto false)
     * @returns {string} - Fecha formateada
     */
    formatDate(date, includeTime = false) {
        if (!date) {
            return '';
        }

        const dateObj = typeof date === 'string' ? new Date(date) : date;

        if (isNaN(dateObj.getTime())) {
            return '';
        }

        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };

        if (includeTime) {
            options.hour = '2-digit';
            options.minute = '2-digit';
        }

        return dateObj.toLocaleDateString('es-ES', options);
    },

    /**
     * Formatea una fecha a formato corto (DD/MM/YYYY)
     * @param {string|Date} date - Fecha a formatear
     * @returns {string} - Fecha formateada
     */
    formatDateShort(date) {
        if (!date) {
            return '';
        }

        const dateObj = typeof date === 'string' ? new Date(date) : date;

        if (isNaN(dateObj.getTime())) {
            return '';
        }

        const day = dateObj.getDate().toString().padStart(2, '0');
        const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
        const year = dateObj.getFullYear();

        return `${day}/${month}/${year}`;
    },

    /**
     * Formatea un número a formato de moneda (COP)
     * @param {number} amount - Cantidad a formatear
     * @param {string} currency - Código de moneda (por defecto COP)
     * @returns {string} - Cantidad formateada
     */
    formatCurrency(amount, currency = 'COP') {
        if (amount === null || amount === undefined || isNaN(amount)) {
            return '$0';
        }

        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0
        }).format(amount);
    },

    /**
     * Formatea un número con separadores de miles
     * @param {number} num - Número a formatear
     * @returns {string} - Número formateado
     */
    formatNumber(num) {
        if (num === null || num === undefined || isNaN(num)) {
            return '0';
        }

        return new Intl.NumberFormat('es-CO').format(num);
    },

    /**
     * Trunca un texto a una longitud máxima
     * @param {string} text - Texto a truncar
     * @param {number} maxLength - Longitud máxima
     * @param {string} suffix - Sufijo a agregar (por defecto '...')
     * @returns {string} - Texto truncado
     */
    truncateText(text, maxLength, suffix = '...') {
        if (!text || text.length <= maxLength) {
            return text || '';
        }

        return text.substring(0, maxLength) + suffix;
    },

    /**
     * Capitaliza la primera letra de un texto
     * @param {string} text - Texto a capitalizar
     * @returns {string} - Texto capitalizado
     */
    capitalize(text) {
        if (!text || typeof text !== 'string') {
            return '';
        }

        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    },

    /**
     * Capitaliza todas las palabras de un texto
     * @param {string} text - Texto a capitalizar
     * @returns {string} - Texto capitalizado
     */
    capitalizeWords(text) {
        if (!text || typeof text !== 'string') {
            return '';
        }

        return text.split(' ')
            .map(word => this.capitalize(word))
            .join(' ');
    },

    /**
     * Obtiene el badge HTML para un estado de postulación
     * @param {string} estado - Estado de la postulación
     * @returns {string} - HTML del badge
     */
    getPostulacionBadge(estado) {
        const badges = {
            pendiente: '<span class="badge bg-warning">Pendiente</span>',
            en_revision: '<span class="badge bg-info">En Revisión</span>',
            preseleccionado: '<span class="badge" style="background-color: var(--status-preseleccionado)">Preseleccionado</span>',
            entrevista: '<span class="badge bg-primary">Entrevista</span>',
            pruebas: '<span class="badge" style="background-color: var(--status-pruebas)">Pruebas</span>',
            rechazado: '<span class="badge bg-danger">Rechazado</span>',
            contratado: '<span class="badge bg-success">Contratado</span>'
        };

        return badges[estado] || `<span class="badge bg-secondary">${estado}</span>`;
    },

    /**
     * Obtiene el badge HTML para un estado de vacante
     * @param {string} estado - Estado de la vacante
     * @returns {string} - HTML del badge
     */
    getVacanteBadge(estado) {
        const badges = {
            activa: '<span class="badge bg-success">Activa</span>',
            pausada: '<span class="badge bg-warning">Pausada</span>',
            cerrada: '<span class="badge bg-secondary">Cerrada</span>'
        };

        return badges[estado] || `<span class="badge bg-secondary">${estado}</span>`;
    },

    /**
     * Muestra un mensaje de alerta con SweetAlert2 o alert nativo
     * @param {string} message - Mensaje a mostrar
     * @param {string} type - Tipo de alerta (success, error, warning, info)
     * @param {string} title - Título de la alerta (opcional)
     */
    showAlert(message, type = 'info', title = '') {
        // Si SweetAlert2 está disponible, usarlo
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                title: title,
                text: message,
                icon: type,
                confirmButtonText: 'Aceptar'
            });
        } else {
            // Fallback a alert nativo
            alert(`${title ? title + '\n' : ''}${message}`);
        }
    },

    /**
     * Muestra un mensaje de éxito
     * @param {string} message - Mensaje a mostrar
     * @param {string} title - Título (opcional)
     */
    showSuccess(message, title = 'Éxito') {
        this.showAlert(message, 'success', title);
    },

    /**
     * Muestra un mensaje de error
     * @param {string} message - Mensaje a mostrar
     * @param {string} title - Título (opcional)
     */
    showError(message, title = 'Error') {
        this.showAlert(message, 'error', title);
    },

    /**
     * Muestra un mensaje de advertencia
     * @param {string} message - Mensaje a mostrar
     * @param {string} title - Título (opcional)
     */
    showWarning(message, title = 'Advertencia') {
        this.showAlert(message, 'warning', title);
    },

    /**
     * Muestra un diálogo de confirmación
     * @param {string} message - Mensaje de confirmación
     * @param {string} title - Título (opcional)
     * @returns {Promise<boolean>} - True si el usuario confirma
     */
    async confirm(message, title = '¿Estás seguro?') {
        if (typeof Swal !== 'undefined') {
            const result = await Swal.fire({
                title: title,
                text: message,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sí, continuar',
                cancelButtonText: 'Cancelar'
            });

            return result.isConfirmed;
        } else {
            // Fallback a confirm nativo
            return confirm(`${title}\n${message}`);
        }
    },

    /**
     * Muestra un loader/spinner
     * @param {string} containerId - ID del contenedor donde mostrar el loader
     */
    showLoader(containerId = 'main-content') {
        const container = document.getElementById(containerId);

        if (!container) {
            return;
        }

        const loader = document.createElement('div');
        loader.id = 'custom-loader';
        loader.className = 'd-flex justify-content-center align-items-center';
        loader.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(255,255,255,0.8); z-index: 9999;';
        loader.innerHTML = `
            <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
                <span class="visually-hidden">Cargando...</span>
            </div>
        `;

        document.body.appendChild(loader);
    },

    /**
     * Oculta el loader/spinner
     */
    hideLoader() {
        const loader = document.getElementById('custom-loader');

        if (loader) {
            loader.remove();
        }
    },

    /**
     * Debounce para limitar la frecuencia de ejecución de una función
     * @param {Function} func - Función a ejecutar
     * @param {number} wait - Tiempo de espera en ms
     * @returns {Function} - Función debounced
     */
    debounce(func, wait = 300) {
        let timeout;

        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };

            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Obtiene parámetros de la URL
     * @param {string} param - Nombre del parámetro
     * @returns {string|null} - Valor del parámetro o null
     */
    getURLParameter(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    },

    /**
     * Agrega un parámetro a la URL sin recargar la página
     * @param {string} key - Clave del parámetro
     * @param {string} value - Valor del parámetro
     */
    setURLParameter(key, value) {
        const url = new URL(window.location);
        url.searchParams.set(key, value);
        window.history.pushState({}, '', url);
    },

    /**
     * Descarga un archivo desde una URL
     * @param {string} url - URL del archivo
     * @param {string} filename - Nombre del archivo
     */
    downloadFile(url, filename) {
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    },

    /**
     * Copia texto al portapapeles
     * @param {string} text - Texto a copiar
     * @returns {Promise<boolean>} - True si se copió exitosamente
     */
    async copyToClipboard(text) {
        try {
            if (navigator.clipboard) {
                await navigator.clipboard.writeText(text);
                return true;
            } else {
                // Fallback para navegadores antiguos
                const textarea = document.createElement('textarea');
                textarea.value = text;
                textarea.style.position = 'fixed';
                textarea.style.opacity = '0';
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
                return true;
            }
        } catch (error) {
            console.error('Error al copiar al portapapeles:', error);
            return false;
        }
    },

    /**
     * Calcula el tiempo transcurrido desde una fecha
     * @param {string|Date} date - Fecha
     * @returns {string} - Tiempo transcurrido en formato legible
     */
    timeAgo(date) {
        if (!date) {
            return '';
        }

        const dateObj = typeof date === 'string' ? new Date(date) : date;
        const now = new Date();
        const seconds = Math.floor((now - dateObj) / 1000);

        const intervals = {
            año: 31536000,
            mes: 2592000,
            semana: 604800,
            día: 86400,
            hora: 3600,
            minuto: 60
        };

        for (const [name, secondsInInterval] of Object.entries(intervals)) {
            const interval = Math.floor(seconds / secondsInInterval);

            if (interval >= 1) {
                return `hace ${interval} ${name}${interval > 1 ? (name === 'mes' ? 'es' : 's') : ''}`;
            }
        }

        return 'hace un momento';
    },

    /**
     * Genera un ID único
     * @returns {string} - ID único
     */
    generateUniqueId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    },

    /**
     * Scroll suave hacia un elemento
     * @param {string} elementId - ID del elemento
     */
    scrollToElement(elementId) {
        const element = document.getElementById(elementId);

        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    },

    /**
     * Verifica si un elemento está visible en el viewport
     * @param {HTMLElement} element - Elemento a verificar
     * @returns {boolean} - True si está visible
     */
    isElementInViewport(element) {
        if (!element) {
            return false;
        }

        const rect = element.getBoundingClientRect();

        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }
};

/**
 * Utils - Alias de Helpers para compatibilidad
 * Proporciona funciones adicionales para manejo de loading y alertas
 */
const Utils = {
    ...Helpers,

    /**
     * Muestra un loader de pantalla completa
     * @param {string} mensaje - Mensaje a mostrar (opcional)
     */
    showLoading(mensaje = 'Cargando...') {
        // Remover loader anterior si existe
        this.hideLoading();

        const loader = document.createElement('div');
        loader.id = 'global-loader';
        loader.className = 'd-flex flex-column justify-content-center align-items-center';
        loader.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 99999;
        `;
        loader.innerHTML = `
            <div class="spinner-border text-light mb-3" role="status" style="width: 3rem; height: 3rem;">
                <span class="visually-hidden">Cargando...</span>
            </div>
            <p class="text-white fw-bold">${mensaje}</p>
        `;

        document.body.appendChild(loader);
    },

    /**
     * Oculta el loader de pantalla completa
     */
    hideLoading() {
        const loader = document.getElementById('global-loader');
        if (loader) {
            loader.remove();
        }
    },

    /**
     * Muestra un mensaje de error con toast de Bootstrap
     * @param {string} mensaje - Mensaje de error
     */
    showError(mensaje) {
        this.showToast(mensaje, 'danger');
    },

    /**
     * Muestra un mensaje de éxito con toast de Bootstrap
     * @param {string} mensaje - Mensaje de éxito
     */
    showSuccess(mensaje) {
        this.showToast(mensaje, 'success');
    },

    /**
     * Muestra un mensaje de advertencia con toast de Bootstrap
     * @param {string} mensaje - Mensaje de advertencia
     */
    showWarning(mensaje) {
        this.showToast(mensaje, 'warning');
    },

    /**
     * Muestra un mensaje de información con toast de Bootstrap
     * @param {string} mensaje - Mensaje de información
     */
    showInfo(mensaje) {
        this.showToast(mensaje, 'info');
    },

    /**
     * Muestra un toast de Bootstrap
     * @param {string} mensaje - Mensaje a mostrar
     * @param {string} tipo - Tipo de toast (success, danger, warning, info)
     */
    showToast(mensaje, tipo = 'info') {
        // Verificar si existe el contenedor de toasts
        let toastContainer = document.getElementById('toast-container');

        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toast-container';
            toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
            toastContainer.style.zIndex = '100000';
            document.body.appendChild(toastContainer);
        }

        // Mapear tipos a clases de Bootstrap
        const tipoClases = {
            'success': { bg: 'bg-success', icon: 'bi-check-circle-fill', titulo: 'Éxito' },
            'danger': { bg: 'bg-danger', icon: 'bi-x-circle-fill', titulo: 'Error' },
            'warning': { bg: 'bg-warning', icon: 'bi-exclamation-triangle-fill', titulo: 'Advertencia' },
            'info': { bg: 'bg-info', icon: 'bi-info-circle-fill', titulo: 'Información' }
        };

        const config = tipoClases[tipo] || tipoClases['info'];

        // Crear toast
        const toastId = `toast-${Date.now()}`;
        const toastHTML = `
            <div id="${toastId}" class="toast align-items-center text-white ${config.bg} border-0" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="d-flex">
                    <div class="toast-body">
                        <i class="bi ${config.icon} me-2"></i>
                        ${mensaje}
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
            </div>
        `;

        toastContainer.insertAdjacentHTML('beforeend', toastHTML);

        // Inicializar y mostrar el toast
        const toastElement = document.getElementById(toastId);
        const toast = new bootstrap.Toast(toastElement, {
            autohide: true,
            delay: tipo === 'danger' ? 5000 : 3000
        });

        toast.show();

        // Eliminar el toast del DOM después de que se oculte
        toastElement.addEventListener('hidden.bs.toast', () => {
            toastElement.remove();
        });
    },

    /**
     * Formatea una fecha usando el helper de Helpers
     * @param {string|Date} date - Fecha a formatear
     * @param {boolean} includeTime - Incluir hora
     * @returns {string} - Fecha formateada
     */
    formatDate(date, includeTime = false) {
        return Helpers.formatDate(date, includeTime);
    },

    /**
     * Formatea una fecha a formato corto
     * @param {string|Date} date - Fecha a formatear
     * @returns {string} - Fecha formateada
     */
    formatDateShort(date) {
        return Helpers.formatDateShort(date);
    },

    /**
     * Obtiene el badge de estado de postulación
     * @param {string} estado - Estado de la postulación
     * @returns {string} - HTML del badge
     */
    getPostulacionBadge(estado) {
        return Helpers.getPostulacionBadge(estado);
    }
};
