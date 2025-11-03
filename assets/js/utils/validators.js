/**
 * Utilidades de validación de formularios
 * Contiene funciones para validar diferentes tipos de datos
 */

const Validators = {
    /**
     * Valida un email
     * @param {string} email - Email a validar
     * @returns {boolean} - True si es válido
     */
    isValidEmail(email) {
        if (!email || typeof email !== 'string') {
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    /**
     * Valida una contraseña
     * Mínimo 6 caracteres
     * @param {string} password - Contraseña a validar
     * @param {number} minLength - Longitud mínima (por defecto 6)
     * @returns {Object} - { valid: boolean, message: string }
     */
    validatePassword(password, minLength = 6) {
        if (!password || typeof password !== 'string') {
            return {
                valid: false,
                message: 'La contraseña es requerida'
            };
        }

        if (password.length < minLength) {
            return {
                valid: false,
                message: `La contraseña debe tener al menos ${minLength} caracteres`
            };
        }

        return {
            valid: true,
            message: ''
        };
    },

    /**
     * Valida una contraseña fuerte
     * Mínimo 8 caracteres, una mayúscula, una minúscula, un número
     * @param {string} password - Contraseña a validar
     * @returns {Object} - { valid: boolean, message: string }
     */
    validateStrongPassword(password) {
        if (!password || typeof password !== 'string') {
            return {
                valid: false,
                message: 'La contraseña es requerida'
            };
        }

        if (password.length < 8) {
            return {
                valid: false,
                message: 'La contraseña debe tener al menos 8 caracteres'
            };
        }

        if (!/[a-z]/.test(password)) {
            return {
                valid: false,
                message: 'La contraseña debe contener al menos una letra minúscula'
            };
        }

        if (!/[A-Z]/.test(password)) {
            return {
                valid: false,
                message: 'La contraseña debe contener al menos una letra mayúscula'
            };
        }

        if (!/[0-9]/.test(password)) {
            return {
                valid: false,
                message: 'La contraseña debe contener al menos un número'
            };
        }

        return {
            valid: true,
            message: ''
        };
    },

    /**
     * Valida que dos contraseñas coincidan
     * @param {string} password - Contraseña
     * @param {string} confirmPassword - Confirmación de contraseña
     * @returns {boolean} - True si coinciden
     */
    passwordsMatch(password, confirmPassword) {
        return password === confirmPassword;
    },

    /**
     * Valida un teléfono
     * @param {string} phone - Teléfono a validar
     * @returns {boolean} - True si es válido
     */
    isValidPhone(phone) {
        if (!phone || typeof phone !== 'string') {
            return false;
        }

        // Acepta números con o sin guiones, espacios, paréntesis
        // Mínimo 7 dígitos
        const phoneRegex = /^[\d\s\-\(\)]{7,}$/;
        return phoneRegex.test(phone);
    },

    /**
     * Valida un NIT (Colombia)
     * @param {string} nit - NIT a validar
     * @returns {boolean} - True si es válido
     */
    isValidNIT(nit) {
        if (!nit || typeof nit !== 'string') {
            return false;
        }

        // Acepta formato: 123456789-0 o 123456789
        const nitRegex = /^\d{9}(-\d)?$/;
        return nitRegex.test(nit);
    },

    /**
     * Valida una URL
     * @param {string} url - URL a validar
     * @returns {boolean} - True si es válida
     */
    isValidURL(url) {
        if (!url || typeof url !== 'string') {
            return false;
        }

        try {
            new URL(url);
            return true;
        } catch (error) {
            return false;
        }
    },

    /**
     * Valida que un string no esté vacío
     * @param {string} value - Valor a validar
     * @returns {boolean} - True si no está vacío
     */
    isNotEmpty(value) {
        if (value === null || value === undefined) {
            return false;
        }

        if (typeof value === 'string') {
            return value.trim().length > 0;
        }

        return true;
    },

    /**
     * Valida que un número esté dentro de un rango
     * @param {number} value - Valor a validar
     * @param {number} min - Valor mínimo
     * @param {number} max - Valor máximo
     * @returns {boolean} - True si está en el rango
     */
    isInRange(value, min, max) {
        const num = Number(value);

        if (isNaN(num)) {
            return false;
        }

        return num >= min && num <= max;
    },

    /**
     * Valida que un archivo tenga un tamaño máximo
     * @param {File} file - Archivo a validar
     * @param {number} maxSizeInBytes - Tamaño máximo en bytes
     * @returns {Object} - { valid: boolean, message: string }
     */
    validateFileSize(file, maxSizeInBytes) {
        if (!file) {
            return {
                valid: false,
                message: 'No se ha seleccionado ningún archivo'
            };
        }

        if (file.size > maxSizeInBytes) {
            const maxSizeInMB = (maxSizeInBytes / (1024 * 1024)).toFixed(2);
            return {
                valid: false,
                message: `El archivo debe ser menor a ${maxSizeInMB}MB`
            };
        }

        return {
            valid: true,
            message: ''
        };
    },

    /**
     * Valida que un archivo tenga una extensión permitida
     * @param {File} file - Archivo a validar
     * @param {Array<string>} allowedExtensions - Extensiones permitidas (ej: ['pdf', 'doc'])
     * @returns {Object} - { valid: boolean, message: string }
     */
    validateFileExtension(file, allowedExtensions) {
        if (!file) {
            return {
                valid: false,
                message: 'No se ha seleccionado ningún archivo'
            };
        }

        const fileName = file.name.toLowerCase();
        const extension = fileName.split('.').pop();

        if (!allowedExtensions.includes(extension)) {
            return {
                valid: false,
                message: `Solo se permiten archivos ${allowedExtensions.join(', ')}`
            };
        }

        return {
            valid: true,
            message: ''
        };
    },

    /**
     * Valida un archivo PDF
     * @param {File} file - Archivo a validar
     * @param {number} maxSizeInMB - Tamaño máximo en MB (por defecto 10MB)
     * @returns {Object} - { valid: boolean, message: string }
     */
    validatePDFFile(file, maxSizeInMB = 10) {
        const extensionCheck = this.validateFileExtension(file, ['pdf']);

        if (!extensionCheck.valid) {
            return extensionCheck;
        }

        const sizeCheck = this.validateFileSize(file, maxSizeInMB * 1024 * 1024);

        return sizeCheck;
    },

    /**
     * Valida una fecha
     * @param {string} dateString - Fecha en formato YYYY-MM-DD
     * @returns {boolean} - True si es válida
     */
    isValidDate(dateString) {
        if (!dateString) {
            return false;
        }

        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date);
    },

    /**
     * Valida que una fecha sea futura
     * @param {string} dateString - Fecha en formato YYYY-MM-DD
     * @returns {boolean} - True si es futura
     */
    isFutureDate(dateString) {
        if (!this.isValidDate(dateString)) {
            return false;
        }

        const date = new Date(dateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return date > today;
    },

    /**
     * Valida que una fecha sea pasada
     * @param {string} dateString - Fecha en formato YYYY-MM-DD
     * @returns {boolean} - True si es pasada
     */
    isPastDate(dateString) {
        if (!this.isValidDate(dateString)) {
            return false;
        }

        const date = new Date(dateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return date < today;
    },

    /**
     * Valida un salario
     * @param {number} salary - Salario a validar
     * @returns {Object} - { valid: boolean, message: string }
     */
    validateSalary(salary) {
        const num = Number(salary);

        if (isNaN(num) || num <= 0) {
            return {
                valid: false,
                message: 'El salario debe ser un número positivo'
            };
        }

        return {
            valid: true,
            message: ''
        };
    },

    /**
     * Muestra errores de validación en el DOM
     * @param {string} inputId - ID del input
     * @param {string} message - Mensaje de error
     */
    showValidationError(inputId, message) {
        const input = document.getElementById(inputId);

        if (!input) {
            return;
        }

        // Agregar clase de error al input
        input.classList.add('is-invalid');
        input.classList.remove('is-valid');

        // Buscar o crear elemento de feedback
        let feedback = input.nextElementSibling;

        if (!feedback || !feedback.classList.contains('invalid-feedback')) {
            feedback = document.createElement('div');
            feedback.className = 'invalid-feedback';
            input.parentNode.insertBefore(feedback, input.nextSibling);
        }

        feedback.textContent = message;
        feedback.style.display = 'block';
    },

    /**
     * Limpia errores de validación en el DOM
     * @param {string} inputId - ID del input
     */
    clearValidationError(inputId) {
        const input = document.getElementById(inputId);

        if (!input) {
            return;
        }

        input.classList.remove('is-invalid');
        input.classList.add('is-valid');

        const feedback = input.nextElementSibling;

        if (feedback && feedback.classList.contains('invalid-feedback')) {
            feedback.style.display = 'none';
        }
    },

    /**
     * Limpia todos los errores de validación de un formulario
     * @param {string} formId - ID del formulario
     */
    clearAllValidationErrors(formId) {
        const form = document.getElementById(formId);

        if (!form) {
            return;
        }

        const inputs = form.querySelectorAll('.is-invalid');

        inputs.forEach(input => {
            input.classList.remove('is-invalid');

            const feedback = input.nextElementSibling;
            if (feedback && feedback.classList.contains('invalid-feedback')) {
                feedback.style.display = 'none';
            }
        });
    }
};
