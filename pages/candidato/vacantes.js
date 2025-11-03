/**
 * Script específico para la página de vacantes del candidato
 */

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Página de vacantes cargada');

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

    // Cargar vacantes disponibles (página 1)
    await CandidatoController.buscarVacantes(1);

    // Event listener para limpiar filtros
    document.getElementById('formFiltros').addEventListener('reset', () => {
        setTimeout(() => {
            CandidatoController.buscarVacantes(1);
        }, 100);
    });
});

/**
 * Muestra el modal con el detalle completo de la vacante
 * @param {number} vacanteId - ID de la vacante
 */
async function mostrarDetalleVacante(vacanteId) {
    try {
        Utils.showLoading('Cargando detalles...');

        const response = await CandidatosService.getVacanteDetalle(vacanteId);

        if (response.success) {
            const vacante = response.data;

            // Actualizar título del modal
            document.getElementById('modalTituloVacante').textContent = vacante.titulo;

            // Actualizar contenido del modal
            const modalBody = document.getElementById('modalBodyVacante');
            modalBody.innerHTML = `
                <div class="mb-3">
                    <h6 class="text-primary">
                        <i class="bi bi-building me-2"></i>
                        ${vacante.Empresa?.nombre_empresa || 'Empresa Confidencial'}
                    </h6>
                </div>

                <div class="mb-3">
                    <h6>Descripción</h6>
                    <p>${vacante.descripcion || 'Sin descripción'}</p>
                </div>

                <div class="mb-3">
                    <h6>Requisitos</h6>
                    <p>${vacante.requisitos || 'No especificados'}</p>
                </div>

                <div class="mb-3">
                    <h6>Responsabilidades</h6>
                    <p>${vacante.responsabilidades || 'No especificadas'}</p>
                </div>

                <div class="row mb-3">
                    <div class="col-md-6">
                        <h6>Información General</h6>
                        <ul class="list-unstyled">
                            <li><i class="bi bi-geo-alt text-primary me-2"></i> ${vacante.ubicacion || 'No especificado'}</li>
                            <li><i class="bi bi-laptop text-primary me-2"></i> ${vacante.modalidad || 'No especificado'}</li>
                            <li><i class="bi bi-file-text text-primary me-2"></i> ${vacante.tipo_contrato || 'No especificado'}</li>
                            <li><i class="bi bi-clock text-primary me-2"></i> ${vacante.jornada_laboral || 'No especificada'}</li>
                        </ul>
                    </div>
                    <div class="col-md-6">
                        <h6>Beneficios</h6>
                        <p>${vacante.beneficios || 'No especificados'}</p>
                    </div>
                </div>

                ${vacante.salario_min && vacante.salario_max ? `
                    <div class="mb-3">
                        <h6>Rango Salarial</h6>
                        <p class="text-success fs-5 mb-0">
                            $${vacante.salario_min.toLocaleString()} - $${vacante.salario_max.toLocaleString()}
                        </p>
                    </div>
                ` : ''}

                <div class="mb-3">
                    <small class="text-muted">
                        Publicado: ${Utils.formatDate(vacante.fecha_publicacion)}
                    </small>
                    ${vacante.fecha_cierre ? `
                        <br>
                        <small class="text-danger">
                            Fecha límite: ${Utils.formatDate(vacante.fecha_cierre)}
                        </small>
                    ` : ''}
                </div>

                <div class="mb-3">
                    <label for="mensajePostulacion" class="form-label">
                        Mensaje para la empresa (opcional)
                    </label>
                    <textarea class="form-control" id="mensajePostulacion" rows="3"
                              placeholder="Escribe un mensaje para acompañar tu postulación..."></textarea>
                </div>
            `;

            // Configurar botón de postularse
            const btnPostularse = document.getElementById('btnPostularse');
            btnPostularse.onclick = () => {
                CandidatoController.postularse(vacanteId);
            };

            // Mostrar modal
            const modal = new bootstrap.Modal(document.getElementById('modalDetalleVacante'));
            modal.show();
        } else {
            Utils.showError(response.message || 'Error al cargar detalles');
        }
    } catch (error) {
        Utils.showError('Error al cargar detalles: ' + error.message);
    } finally {
        Utils.hideLoading();
    }
}
