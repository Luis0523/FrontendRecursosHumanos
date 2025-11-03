/**
 * Script específico para la página de perfil del candidato
 */

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Página de perfil cargada');

    // Verificar autenticación
    if (!AuthService.checkAuth()) {
        return;
    }

    // Verificar que el usuario sea candidato
    const user = AuthService.getUser();
    if (user.rol !== CONFIG.ROLES.CANDIDATO) {
        Utils.showError('No tienes permisos para acceder a esta página');
        setTimeout(() => {
            window.location.href = CONFIG.ROUTES.HOME;
        }, 2000);
        return;
    }

    // Cargar componentes
    try {
        await Components.loadAll();
    } catch (error) {
        console.error('Error al cargar componentes:', error);
    }

    // Cargar datos del perfil automáticamente
    await cargarPerfil();

    // Configurar el evento de submit del formulario
    const formPerfil = document.getElementById('formPerfil');
    if (formPerfil) {
        formPerfil.addEventListener('submit', async (event) => {
            await CandidatoController.actualizarPerfil(event);
        });
    }
});

/**
 * Carga el perfil del candidato y llena el formulario
 */
async function cargarPerfil() {
    try {
        Utils.showLoading('Cargando perfil...');

        const response = await CandidatosService.getMiPerfil();

        if (response.success) {
            // Mostrar los datos en el formulario
            CandidatoController.mostrarPerfil(response.data);
            console.log('Perfil cargado correctamente:', response.data);
        } else {
            Utils.showError(response.message || 'Error al cargar el perfil');
        }
    } catch (error) {
        console.error('Error al cargar el perfil:', error);
        Utils.showError('Error al cargar el perfil: ' + error.message);
    } finally {
        Utils.hideLoading();
    }
}
