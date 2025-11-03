/**
 * Script específico para la página de gestión de CV del candidato
 */

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Página de CV cargada');

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

    // Cargar información del CV actual
    await CandidatoController.cargarCV();

    // Event listener para el input de archivo (mostrar nombre del archivo seleccionado)
    const fileInput = document.getElementById('cvFile');
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validar tipo
            if (file.type !== 'application/pdf') {
                Utils.showError('Solo se permiten archivos PDF');
                fileInput.value = '';
                return;
            }

            // Validar tamaño
            if (file.size > CONFIG.FILE_SIZES.CV_MAX) {
                Utils.showError('El archivo no debe superar los 5MB');
                fileInput.value = '';
                return;
            }

            console.log('Archivo seleccionado:', file.name);
        }
    });
});
