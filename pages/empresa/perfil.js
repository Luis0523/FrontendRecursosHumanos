/**
 * Perfil de Empresa
 * Maneja la visualización y edición del perfil de la empresa
 */

(function() {
    'use strict';

    // Proteger la página - solo empresas
    AuthService.protectPage(CONFIG.ROLES.EMPRESA);

    let empresaData = null;
    let modalCambiarPassword = null;

    /**
     * Inicializa la página
     */
    async function init() {
        // Inicializar modal
        modalCambiarPassword = new bootstrap.Modal(document.getElementById('modalCambiarPassword'));

        // Cargar datos de la empresa
        await cargarPerfil();

        // Event listeners
        document.getElementById('btn-guardar').addEventListener('click', guardarPerfil);
        document.getElementById('btn-cambiar-password').addEventListener('click', () => modalCambiarPassword.show());
        document.getElementById('btn-confirmar-password').addEventListener('click', cambiarPassword);
        document.getElementById('logo-input').addEventListener('change', handleLogoChange);
    }

    /**
     * Carga el perfil de la empresa
     */
    async function cargarPerfil() {
        try {
            Helpers.showLoader();

            const response = await EmpresaService.getPerfil();

            if (response.success) {
                empresaData = response.data;
                llenarFormulario(empresaData);
                actualizarInfoCuenta(empresaData);
            }
        } catch (error) {
            console.error('Error al cargar perfil:', error);
            Helpers.showError('Error al cargar el perfil de la empresa');
        } finally {
            Helpers.hideLoader();
        }
    }

    /**
     * Llena el formulario con los datos de la empresa
     * @param {Object} data - Datos de la empresa
     */
    function llenarFormulario(data) {
        // Información básica
        document.getElementById('razon-social').value = data.nombre_empresa || '';
        document.getElementById('nit').value = data.nit || '';
        document.getElementById('sector').value = data.sector || '';
        document.getElementById('tamaño').value = data.tamaño || '';
        document.getElementById('descripcion').value = data.descripcion || '';

        // Información de contacto
        document.getElementById('telefono').value = data.telefono || '';
        document.getElementById('email-contacto').value = data.email_contacto || '';
        document.getElementById('sitio-web').value = data.sitio_web || '';
        document.getElementById('direccion').value = data.direccion || '';
        document.getElementById('ciudad').value = data.ciudad || '';
        document.getElementById('pais').value = data.pais || 'Colombia';

        // Redes sociales
        document.getElementById('linkedin').value = data.linkedin || '';
        document.getElementById('facebook').value = data.facebook || '';
        document.getElementById('twitter').value = data.twitter || '';
        document.getElementById('instagram').value = data.instagram || '';

        // Logo
        if (data.logo_url) {
            const logoImg = document.getElementById('logo-img');
            const logoPlaceholder = document.getElementById('logo-placeholder');
            logoImg.src = data.logo_url;
            logoImg.style.display = 'block';
            logoPlaceholder.style.display = 'none';
        }
    }

    /**
     * Actualiza la información de la cuenta
     * @param {Object} data - Datos de la empresa
     */
    function actualizarInfoCuenta(data) {
        const usuario = AuthService.getCurrentUser();

        document.getElementById('usuario-nombre').textContent = usuario.nombre || 'N/A';
        document.getElementById('usuario-email').textContent = usuario.email || 'N/A';
        document.getElementById('fecha-registro').textContent = data.fecha_registro ?
            Helpers.formatDate(data.fecha_registro) : 'N/A';
        document.getElementById('total-vacantes').textContent = data.vacantes_count || 0;
    }

    /**
     * Guarda el perfil de la empresa
     */
    async function guardarPerfil() {
        try {
            // Validar formulario
            const form = document.getElementById('form-perfil');
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            // Recopilar datos
            const empresaData = {
                razon_social: document.getElementById('razon-social').value.trim(),
                nit: document.getElementById('nit').value.trim(),
                sector: document.getElementById('sector').value,
                tamaño: document.getElementById('tamaño').value,
                descripcion: document.getElementById('descripcion').value.trim(),
                telefono: document.getElementById('telefono').value.trim(),
                email_contacto: document.getElementById('email-contacto').value.trim(),
                sitio_web: document.getElementById('sitio-web').value.trim(),
                direccion: document.getElementById('direccion').value.trim(),
                ciudad: document.getElementById('ciudad').value.trim(),
                pais: document.getElementById('pais').value.trim(),
                linkedin: document.getElementById('linkedin').value.trim(),
                facebook: document.getElementById('facebook').value.trim(),
                twitter: document.getElementById('twitter').value.trim(),
                instagram: document.getElementById('instagram').value.trim()
            };

            // Validar NIT
            if (empresaData.nit && !Validators.isValidNIT(empresaData.nit)) {
                Helpers.showError('El NIT no es válido. Formato: 123456789-0');
                return;
            }

            // Validar email de contacto si se proporciona
            if (empresaData.email_contacto && !Validators.isValidEmail(empresaData.email_contacto)) {
                Helpers.showError('El email de contacto no es válido');
                return;
            }

            Helpers.showLoader();

            const response = await EmpresaService.updatePerfil(empresaData);

            if (response.success) {
                Helpers.showSuccess('Perfil actualizado correctamente');
                // Recargar datos
                await cargarPerfil();
            }
        } catch (error) {
            console.error('Error al guardar perfil:', error);
            Helpers.showError(error.message || 'Error al actualizar el perfil');
        } finally {
            Helpers.hideLoader();
        }
    }

    /**
     * Maneja el cambio del logo
     * @param {Event} event - Evento de cambio
     */
    async function handleLogoChange(event) {
        const file = event.target.files[0];

        if (!file) return;

        // Validar archivo
        if (!Validators.isValidImageFile(file)) {
            Helpers.showError('El archivo debe ser una imagen (JPG, PNG)');
            event.target.value = '';
            return;
        }

        if (!Validators.isValidFileSize(file, CONFIG.FILE_SIZES.IMAGEN_MAX)) {
            Helpers.showError('El archivo no debe superar los 2MB');
            event.target.value = '';
            return;
        }

        try {
            Helpers.showLoader();

            // Subir logo
            const response = await EmpresaService.uploadLogo(file);

            if (response.success) {
                // Actualizar preview
                const logoImg = document.getElementById('logo-img');
                const logoPlaceholder = document.getElementById('logo-placeholder');
                logoImg.src = response.data.logo_url;
                logoImg.style.display = 'block';
                logoPlaceholder.style.display = 'none';

                Helpers.showSuccess('Logo actualizado correctamente');
            }
        } catch (error) {
            console.error('Error al subir logo:', error);
            Helpers.showError(error.message || 'Error al subir el logo');
            event.target.value = '';
        } finally {
            Helpers.hideLoader();
        }
    }

    /**
     * Cambia la contraseña del usuario
     */
    async function cambiarPassword() {
        try {
            const passwordActual = document.getElementById('password-actual').value;
            const passwordNueva = document.getElementById('password-nueva').value;
            const passwordConfirmar = document.getElementById('password-confirmar').value;

            // Validar campos
            if (!passwordActual || !passwordNueva || !passwordConfirmar) {
                Helpers.showError('Todos los campos son requeridos');
                return;
            }

            // Validar nueva contraseña
            const validation = Validators.validatePassword(passwordNueva, 6);
            if (!validation.valid) {
                Helpers.showError(validation.message);
                return;
            }

            // Validar que coincidan
            if (passwordNueva !== passwordConfirmar) {
                Helpers.showError('Las contraseñas no coinciden');
                return;
            }

            Helpers.showLoader();

            const response = await AuthService.cambiarPassword(passwordActual, passwordNueva);

            if (response.success) {
                Helpers.showSuccess('Contraseña cambiada correctamente');

                // Cerrar modal y limpiar formulario
                modalCambiarPassword.hide();
                document.getElementById('form-cambiar-password').reset();
            }
        } catch (error) {
            console.error('Error al cambiar contraseña:', error);
            Helpers.showError(error.message || 'Error al cambiar la contraseña');
        } finally {
            Helpers.hideLoader();
        }
    }

    // Inicializar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
