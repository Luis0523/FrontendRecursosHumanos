/**
 * Script específico para la página de detalle de vacante del candidato
 */

let vacanteActual = null;

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Página de detalle de vacante cargada');

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

    // Obtener el ID de la vacante de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const vacanteId = urlParams.get('id');

    if (!vacanteId) {
        Utils.showError('No se especificó una vacante');
        setTimeout(() => {
            window.location.href = '/pages/candidato/vacantes.html';
        }, 2000);
        return;
    }

    // Cargar detalle de la vacante
    await cargarDetalleVacante(vacanteId);

    // Event listener para el botón de confirmar postulación
    document.getElementById('btnConfirmarPostulacion').addEventListener('click', confirmarPostulacion);
});

/**
 * Carga el detalle completo de la vacante
 * @param {number} vacanteId - ID de la vacante
 */
async function cargarDetalleVacante(vacanteId) {
    try {
        Utils.showLoading('Cargando información...');

        const response = await CandidatosService.getVacanteDetalle(vacanteId);

        if (response.success) {
            vacanteActual = response.data;
            mostrarDetalleVacante(response.data);
        } else {
            Utils.showError(response.message || 'Error al cargar la vacante');
            setTimeout(() => {
                window.location.href = '/pages/candidato/vacantes.html';
            }, 2000);
        }
    } catch (error) {
        Utils.showError('Error al cargar la vacante: ' + error.message);
        setTimeout(() => {
            window.location.href = '/pages/candidato/vacantes.html';
        }, 2000);
    } finally {
        Utils.hideLoading();
    }
}

/**
 * Muestra el detalle completo de la vacante
 * @param {Object} vacante - Datos de la vacante
 */
function mostrarDetalleVacante(vacante) {
    const container = document.getElementById('detalleVacanteContainer');

    // Parsear arrays si están como strings
    let habilidades = [];
    let beneficios = [];

    try {
        habilidades = typeof vacante.habilidades === 'string'
            ? JSON.parse(vacante.habilidades)
            : (vacante.habilidades || []);
    } catch (e) {
        habilidades = [];
    }

    try {
        beneficios = typeof vacante.beneficios === 'string'
            ? vacante.beneficios.split('\n').filter(b => b.trim())
            : (Array.isArray(vacante.beneficios) ? vacante.beneficios : [vacante.beneficios].filter(Boolean));
    } catch (e) {
        beneficios = [];
    }

    container.innerHTML = `
        <!-- Header con información principal -->
        <div class="card border-0 shadow-sm mb-4">
            <div class="card-body p-4">
                <div class="row">
                    <div class="col-md-8">
                        <h1 class="h2 mb-3 fw-bold">${vacante.titulo}</h1>

                        <div class="d-flex align-items-center mb-3">
                            <i class="bi bi-building text-primary fs-4 me-2"></i>
                            <h5 class="mb-0 text-muted">
                                ${vacante.Empresa?.nombre_empresa || 'Empresa Confidencial'}
                            </h5>
                        </div>

                        <div class="d-flex flex-wrap gap-2 mb-3">
                            <span class="badge bg-primary">
                                <i class="bi bi-geo-alt me-1"></i> ${vacante.ubicacion || 'No especificado'}
                            </span>
                            <span class="badge bg-secondary">
                                <i class="bi bi-laptop me-1"></i> ${vacante.modalidad || 'No especificado'}
                            </span>
                            <span class="badge bg-info">
                                <i class="bi bi-file-text me-1"></i> ${vacante.tipo_contrato || 'No especificado'}
                            </span>
                            <span class="badge bg-dark">
                                <i class="bi bi-clock me-1"></i> ${vacante.jornada_laboral || 'No especificada'}
                            </span>
                        </div>

                        ${vacante.salario_min && vacante.salario_max ? `
                            <div class="salary-range mb-3">
                                <i class="bi bi-cash-stack text-success me-2"></i>
                                $${vacante.salario_min.toLocaleString()} - $${vacante.salario_max.toLocaleString()}
                            </div>
                        ` : ''}

                        <div class="text-muted">
                            <small>
                                <i class="bi bi-calendar-event me-1"></i>
                                Publicado: ${Utils.formatDate(vacante.fecha_publicacion)}
                            </small>
                            ${vacante.fecha_cierre ? `
                                <br>
                                <small class="text-danger">
                                    <i class="bi bi-calendar-x me-1"></i>
                                    Fecha límite: ${Utils.formatDate(vacante.fecha_cierre)}
                                </small>
                            ` : ''}
                        </div>
                    </div>

                    <div class="col-md-4 text-end">
                        <button class="btn btn-primary btn-lg w-100" onclick="mostrarModalPostulacion()">
                            <i class="bi bi-send me-2"></i>
                            Postularse a esta vacante
                        </button>
                        <button class="btn btn-outline-secondary mt-2 w-100" onclick="compartirVacante()">
                            <i class="bi bi-share me-2"></i>
                            Compartir
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Descripción -->
        <div class="card border-0 shadow-sm mb-4">
            <div class="card-body p-4">
                <div class="info-section">
                    <h4 class="mb-3">
                        <i class="bi bi-info-circle text-primary me-2"></i>
                        Descripción del Puesto
                    </h4>
                    <p class="text-muted" style="white-space: pre-line;">${vacante.descripcion || 'Sin descripción'}</p>
                </div>
            </div>
        </div>

        <!-- Requisitos y Responsabilidades -->
        <div class="row mb-4">
            <div class="col-md-6">
                <div class="card border-0 shadow-sm h-100">
                    <div class="card-body p-4">
                        <div class="info-section">
                            <h4 class="mb-3">
                                <i class="bi bi-list-check text-primary me-2"></i>
                                Requisitos
                            </h4>
                            <p class="text-muted" style="white-space: pre-line;">${vacante.requisitos || 'No especificados'}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-md-6">
                <div class="card border-0 shadow-sm h-100">
                    <div class="card-body p-4">
                        <div class="info-section">
                            <h4 class="mb-3">
                                <i class="bi bi-briefcase text-primary me-2"></i>
                                Responsabilidades
                            </h4>
                            <p class="text-muted" style="white-space: pre-line;">${vacante.responsabilidades || 'No especificadas'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Habilidades requeridas -->
        ${habilidades.length > 0 ? `
            <div class="card border-0 shadow-sm mb-4">
                <div class="card-body p-4">
                    <h4 class="mb-3">
                        <i class="bi bi-stars text-primary me-2"></i>
                        Habilidades Requeridas
                    </h4>
                    <div>
                        ${habilidades.map(hab => `<span class="skill-tag">${hab}</span>`).join('')}
                    </div>
                </div>
            </div>
        ` : ''}

        <!-- Beneficios -->
        ${beneficios.length > 0 ? `
            <div class="card border-0 shadow-sm mb-4">
                <div class="card-body p-4">
                    <h4 class="mb-3">
                        <i class="bi bi-gift text-primary me-2"></i>
                        Beneficios
                    </h4>
                    <ul class="list-unstyled">
                        ${beneficios.map(ben => `
                            <li class="mb-2">
                                <i class="bi bi-check-circle-fill text-success me-2"></i>
                                ${ben}
                            </li>
                        `).join('')}
                    </ul>
                </div>
            </div>
        ` : ''}

        <!-- Información adicional -->
        <div class="card border-0 shadow-sm mb-4">
            <div class="card-body p-4">
                <h4 class="mb-3">
                    <i class="bi bi-info-square text-primary me-2"></i>
                    Información Adicional
                </h4>
                <div class="row">
                    <div class="col-md-4 mb-3">
                        <strong>Número de Vacantes:</strong><br>
                        <span class="text-muted">${vacante.numero_vacantes || 1}</span>
                    </div>
                    <div class="col-md-4 mb-3">
                        <strong>Estado:</strong><br>
                        <span class="badge ${vacante.estado === 'activa' ? 'bg-success' : 'bg-secondary'}">
                            ${vacante.estado || 'No especificado'}
                        </span>
                    </div>
                    ${vacante.area ? `
                        <div class="col-md-4 mb-3">
                            <strong>Área:</strong><br>
                            <span class="text-muted">${vacante.area}</span>
                        </div>
                    ` : ''}
                </div>
            </div>
        </div>

        <!-- Call to Action final -->
        <div class="card border-0 shadow-sm bg-primary text-white mb-4">
            <div class="card-body p-4 text-center">
                <h4 class="mb-3">¿Te interesa esta oportunidad?</h4>
                <p class="mb-3">Postúlate ahora y forma parte del equipo</p>
                <button class="btn btn-light btn-lg" onclick="mostrarModalPostulacion()">
                    <i class="bi bi-send me-2"></i>
                    Postularse Ahora
                </button>
            </div>
        </div>
    `;
}

/**
 * Muestra el modal de confirmación de postulación
 */
function mostrarModalPostulacion() {
    const modal = new bootstrap.Modal(document.getElementById('modalPostulacion'));
    modal.show();
}

/**
 * Confirma y envía la postulación
 */
async function confirmarPostulacion() {
    if (!vacanteActual) {
        Utils.showError('No hay vacante seleccionada');
        return;
    }

    try {
        // Verificar si tiene CV
        const perfilResponse = await CandidatosService.getMiPerfil();

        if (!perfilResponse.success || !perfilResponse.data.cv_url) {
            const modal = bootstrap.Modal.getInstance(document.getElementById('modalPostulacion'));
            modal.hide();

            if (confirm('Necesitas subir tu CV para postularte. ¿Deseas ir a subir tu CV ahora?')) {
                window.location.href = CONFIG.ROUTES.CANDIDATO.CV;
            }
            return;
        }

        Utils.showLoading('Enviando postulación...');

        const mensaje = document.getElementById('mensajePostulacion').value || null;
        const response = await CandidatosService.postularse(vacanteActual.id, mensaje);

        if (response.success) {
            // Cerrar modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('modalPostulacion'));
            modal.hide();

            Utils.showSuccess('¡Postulación enviada correctamente!');

            // Redirigir a mis postulaciones
            setTimeout(() => {
                window.location.href = CONFIG.ROUTES.CANDIDATO.POSTULACIONES;
            }, 2000);
        } else {
            Utils.showError(response.message || 'Error al postularse');
        }
    } catch (error) {
        Utils.showError('Error al postularse: ' + error.message);
    } finally {
        Utils.hideLoading();
    }
}

/**
 * Comparte la vacante (copia el link al portapapeles)
 */
function compartirVacante() {
    const url = window.location.href;

    if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(() => {
            Utils.showSuccess('Enlace copiado al portapapeles');
        }).catch(() => {
            Utils.showError('No se pudo copiar el enlace');
        });
    } else {
        // Fallback para navegadores antiguos
        const input = document.createElement('input');
        input.value = url;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        Utils.showSuccess('Enlace copiado al portapapeles');
    }
}
