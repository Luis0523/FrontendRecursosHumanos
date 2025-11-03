/**
 * Controlador de Candidato
 * Maneja la lógica de las páginas del módulo de candidato
 */

const CandidatoController = {
    // ========== PERFIL ==========

    /**
     * Carga los datos del perfil del candidato
     */
    async cargarPerfil() {
        try {
            const response = await CandidatosService.getMiPerfil();

            if (response.success) {
                console.log(response.data);
                this.mostrarPerfil(response.data);

            } else {
                Utils.showError(response.message || 'Error al cargar el perfil');
            }
        } catch (error) {
            Utils.showError('Error al cargar el perfil: ' + error.message);
        }
    },

    /**
     * Muestra los datos del perfil en el formulario
     * @param {Object} perfil - Datos del perfil del candidato
     */
    mostrarPerfil(perfil) {
        // Información profesional
        if (document.getElementById('titulo_profesional')) {
            document.getElementById('titulo_profesional').value = perfil.titulo_profesional || '';
        }
        if (document.getElementById('años_experiencia')) {
            document.getElementById('años_experiencia').value = perfil.años_experiencia || 0;
        }
        if (document.getElementById('perfil')) {
            document.getElementById('perfil').value = perfil.perfil || '';
        }

        // Ubicación
        if (document.getElementById('pais')) {
            document.getElementById('pais').value = perfil.pais || '';
        }
        if (document.getElementById('ciudad')) {
            document.getElementById('ciudad').value = perfil.ciudad || '';
        }
        if (document.getElementById('ubicacion')) {
            document.getElementById('ubicacion').value = perfil.ubicacion || '';
        }

        // Información personal
        if (document.getElementById('fecha_nacimiento')) {
            document.getElementById('fecha_nacimiento').value = perfil.fecha_nacimiento || '';
        }
        if (document.getElementById('genero')) {
            document.getElementById('genero').value = perfil.genero || '';
        }

        // Expectativas laborales
        if (document.getElementById('salario_esperado')) {
            document.getElementById('salario_esperado').value = perfil.salario_esperado || '';
        }
        if (document.getElementById('disponibilidad')) {
            document.getElementById('disponibilidad').value = perfil.disponibilidad || '';
        }

        // Redes sociales
        if (document.getElementById('linkedin')) {
            document.getElementById('linkedin').value = perfil.linkedin || '';
        }
        if (document.getElementById('github')) {
            document.getElementById('github').value = perfil.github || '';
        }
        if (document.getElementById('portfolio')) {
            document.getElementById('portfolio').value = perfil.portfolio || '';
        }
    },

    /**
     * Actualiza el perfil del candidato
     * @param {Event} event - Evento del formulario
     */
    async actualizarPerfil(event) {
        event.preventDefault();

        try {
            // Obtener datos del formulario
            const perfilData = {
                titulo_profesional: document.getElementById('titulo_profesional').value.trim(),
                años_experiencia: parseInt(document.getElementById('años_experiencia').value) || 0,
                perfil: document.getElementById('perfil').value.trim(),
                pais: document.getElementById('pais').value.trim(),
                ciudad: document.getElementById('ciudad').value.trim(),
                ubicacion: document.getElementById('ubicacion').value.trim(),
                fecha_nacimiento: document.getElementById('fecha_nacimiento').value || null,
                genero: document.getElementById('genero').value || null,
                salario_esperado: parseFloat(document.getElementById('salario_esperado').value) || null,
                disponibilidad: document.getElementById('disponibilidad').value || null,
                linkedin: document.getElementById('linkedin').value.trim() || null,
                github: document.getElementById('github').value.trim() || null,
                portfolio: document.getElementById('portfolio').value.trim() || null
            };

            Utils.showLoading('Guardando cambios...');

            const response = await CandidatosService.actualizarPerfil(perfilData);

            if (response.success) {
                Utils.showSuccess('Perfil actualizado correctamente');

                // Recargar el perfil para mostrar los datos actualizados
                setTimeout(() => {
                    this.cargarPerfil();
                }, 1000);
            } else {
                Utils.showError(response.message || 'Error al actualizar el perfil');
            }
        } catch (error) {
            Utils.showError('Error al actualizar el perfil: ' + error.message);
        } finally {
            Utils.hideLoading();
        }
    },

    // ========== CV ==========

    /**
     * Carga la información del CV actual
     */
    async cargarCV() {
        try {
            const response = await CandidatosService.getMiPerfil();

            if (response.success && response.data.cv_url) {
                this.mostrarCVActual(response.data.cv_url);
            } else {
                this.mostrarSinCV();
            }
        } catch (error) {
            Utils.showError('Error al cargar el CV: ' + error.message);
        }
    },

    /**
     * Muestra el CV actual del candidato
     * @param {string} cvUrl - URL del CV
     */
    mostrarCVActual(cvUrl) {
        const container = document.getElementById('cvContainer');
        container.innerHTML = `
            <div class="alert alert-success">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <i class="bi bi-file-pdf-fill fs-4 me-2"></i>
                        <span>CV subido correctamente</span>
                    </div>
                    <div>
                        <a href="${cvUrl}" target="_blank" class="btn btn-sm btn-outline-primary me-2">
                            <i class="bi bi-eye"></i> Ver CV
                        </a>
                        <button onclick="CandidatoController.eliminarCV()" class="btn btn-sm btn-outline-danger">
                            <i class="bi bi-trash"></i> Eliminar
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Muestra mensaje cuando no hay CV
     */
    mostrarSinCV() {
        const container = document.getElementById('cvContainer');
        container.innerHTML = `
            <div class="alert alert-info">
                <i class="bi bi-info-circle me-2"></i>
                No has subido tu CV aún. Sube tu CV para poder postularte a vacantes.
            </div>
        `;
    },

    /**
     * Sube un nuevo CV
     * @param {Event} event - Evento del formulario
     */
    async subirCV(event) {
        event.preventDefault();

        try {
            const fileInput = document.getElementById('cvFile');
            const file = fileInput.files[0];

            // Validar que se haya seleccionado un archivo
            if (!file) {
                Utils.showError('Por favor selecciona un archivo PDF');
                return;
            }

            // Validar que sea PDF
            if (file.type !== 'application/pdf') {
                Utils.showError('Solo se permiten archivos PDF');
                return;
            }

            // Validar tamaño (5MB máximo)
            if (file.size > CONFIG.FILE_SIZES.CV_MAX) {
                Utils.showError('El archivo no debe superar los 5MB');
                return;
            }

            Utils.showLoading('Subiendo CV...');

            const response = await CandidatosService.subirCV(file);

            if (response.success) {
                Utils.showSuccess('CV subido correctamente');
                this.mostrarCVActual(response.data.cv_url);
                fileInput.value = ''; // Limpiar input
            } else {
                Utils.showError(response.message || 'Error al subir el CV');
            }
        } catch (error) {
            Utils.showError('Error al subir el CV: ' + error.message);
        } finally {
            Utils.hideLoading();
        }
    },

    /**
     * Elimina el CV actual
     */
    async eliminarCV() {
        if (!confirm('¿Estás seguro de que deseas eliminar tu CV? No podrás postularte a vacantes sin un CV.')) {
            return;
        }

        try {
            Utils.showLoading('Eliminando CV...');

            const response = await CandidatosService.eliminarCV();

            if (response.success) {
                Utils.showSuccess('CV eliminado correctamente');
                this.mostrarSinCV();
            } else {
                Utils.showError(response.message || 'Error al eliminar el CV');
            }
        } catch (error) {
            Utils.showError('Error al eliminar el CV: ' + error.message);
        } finally {
            Utils.hideLoading();
        }
    },

    // ========== VACANTES ==========

    /**
     * Busca y muestra vacantes disponibles
     * @param {number} pagina - Número de página
     */
    async buscarVacantes(pagina = 1) {
        try {
            // Obtener filtros del formulario
            const filtros = {
                titulo: document.getElementById('filtroTitulo')?.value || '',
                ubicacion: document.getElementById('filtroUbicacion')?.value || '',
                modalidad: document.getElementById('filtroModalidad')?.value || '',
                tipo_contrato: document.getElementById('filtroTipoContrato')?.value || '',
                pagina: pagina,
                limite: 10
            };

            Utils.showLoading('Buscando vacantes...');

            const response = await CandidatosService.buscarVacantes(filtros);

            if (response.success) {
                this.mostrarVacantes(response.data);
            } else {
                Utils.showError(response.message || 'Error al buscar vacantes');
            }
        } catch (error) {
            Utils.showError('Error al buscar vacantes: ' + error.message);
        } finally {
            Utils.hideLoading();
        }
    },

    /**
     * Muestra las vacantes en cards
     * @param {Object} data - Datos de vacantes (lista y paginación)
     */
    mostrarVacantes(data) {
        const container = document.getElementById('vacantesContainer');

        if (!data.vacantes || data.vacantes.length === 0) {
            container.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-info">
                        <i class="bi bi-info-circle me-2"></i>
                        No se encontraron vacantes disponibles
                    </div>
                </div>
            `;
            return;
        }

        let html = '';

        data.vacantes.forEach(vacante => {
            html += `
                <div class="col-md-6 col-lg-4 mb-4">
                    <div class="card h-100 shadow-sm hover-shadow">
                        <div class="card-body">
                            <h5 class="card-title">${vacante.titulo}</h5>
                            <h6 class="card-subtitle mb-3 text-muted">
                                ${vacante.Empresa?.nombre_empresa || 'Empresa Confidencial'}
                            </h6>

                            <p class="card-text small text-truncate-3">
                                ${vacante.descripcion || 'Sin descripción'}
                            </p>

                            <div class="mt-3">
                                <span class="badge bg-primary me-2">
                                    <i class="bi bi-geo-alt"></i> ${vacante.ubicacion || 'No especificado'}
                                </span>
                                <span class="badge bg-secondary me-2">
                                    ${vacante.modalidad || 'No especificado'}
                                </span>
                                <span class="badge bg-info">
                                    ${vacante.tipo_contrato || 'No especificado'}
                                </span>
                            </div>

                            ${vacante.salario_min && vacante.salario_max ? `
                                <div class="mt-2 text-success fw-bold">
                                    $${vacante.salario_min.toLocaleString()} - $${vacante.salario_max.toLocaleString()}
                                </div>
                            ` : ''}
                        </div>
                        <div class="card-footer bg-transparent">
                            <div class="d-flex justify-content-between align-items-center">
                                <small class="text-muted">
                                    Publicado: ${Utils.formatDate(vacante.fecha_publicacion)}
                                </small>
                                <button onclick="CandidatoController.verDetalleVacante(${vacante.id})"
                                        class="btn btn-sm btn-primary">
                                    Ver más
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;

        // Mostrar paginación si es necesario
        if (data.totalPaginas > 1) {
            this.mostrarPaginacion(data.paginaActual, data.totalPaginas);
        }
    },

    /**
     * Muestra el detalle de una vacante y permite postularse
     * @param {number} vacanteId - ID de la vacante
     */
    async verDetalleVacante(vacanteId) {
        try {
            Utils.showLoading('Cargando detalles...');

            const response = await CandidatosService.getVacanteDetalle(vacanteId);

            if (response.success) {
                this.mostrarModalDetalleVacante(response.data);
            } else {
                Utils.showError(response.message || 'Error al cargar detalles');
            }
        } catch (error) {
            Utils.showError('Error al cargar detalles: ' + error.message);
        } finally {
            Utils.hideLoading();
        }
    },

    /**
     * Muestra un modal con el detalle completo de la vacante
     * @param {Object} vacante - Datos de la vacante
     */
    mostrarModalDetalleVacante(vacante) {
        // Aquí puedes implementar un modal de Bootstrap
        // Por ahora, redirigiremos a una página de detalle
        window.location.href = `/pages/candidato/detalle-vacante.html?id=${vacante.id}`;
    },

    /**
     * Se postula a una vacante
     * @param {number} vacanteId - ID de la vacante
     */
    async postularse(vacanteId) {
        try {
            // Verificar si tiene CV
            const perfilResponse = await CandidatosService.getMiPerfil();

            if (!perfilResponse.success || !perfilResponse.data.cv_url) {
                if (confirm('Necesitas subir tu CV para postularte. ¿Deseas ir a subir tu CV ahora?')) {
                    window.location.href = CONFIG.ROUTES.CANDIDATO.CV;
                }
                return;
            }

            // Confirmar postulación
            if (!confirm('¿Estás seguro de que deseas postularte a esta vacante?')) {
                return;
            }

            Utils.showLoading('Enviando postulación...');

            const mensaje = document.getElementById('mensajePostulacion')?.value || null;
            const response = await CandidatosService.postularse(vacanteId, mensaje);

            if (response.success) {
                Utils.showSuccess('¡Postulación enviada correctamente!');
                // Opcionalmente, redirigir a mis postulaciones
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
    },

    // ========== POSTULACIONES ==========

    /**
     * Carga y muestra las postulaciones del candidato
     */
    async cargarMisPostulaciones() {
        try {
            Utils.showLoading('Cargando postulaciones...');

            const response = await CandidatosService.getMisPostulaciones();

            if (response.success) {
                this.mostrarPostulaciones(response.data);
            } else {
                Utils.showError(response.message || 'Error al cargar postulaciones');
            }
        } catch (error) {
            Utils.showError('Error al cargar postulaciones: ' + error.message);
        } finally {
            Utils.hideLoading();
        }
    },

    /**
     * Muestra las postulaciones en una tabla
     * @param {Array} postulaciones - Lista de postulaciones
     */
    mostrarPostulaciones(postulaciones) {
        const tbody = document.getElementById('postulacionesTableBody');

        if (!postulaciones || postulaciones.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-4">
                        <div class="text-muted">
                            <i class="bi bi-inbox fs-1 d-block mb-2"></i>
                            No tienes postulaciones aún
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        let html = '';

        postulaciones.forEach(postulacion => {
            const estadoBadge = this.getBadgeEstadoPostulacion(postulacion.estado);

            html += `
                <tr>
                    <td>${postulacion.Vacante?.titulo || 'N/A'}</td>
                    <td>${postulacion.Vacante?.Empresa?.nombre_empresa || 'Empresa Confidencial'}</td>
                    <td>${Utils.formatDate(postulacion.fecha_postulacion)}</td>
                    <td>${estadoBadge}</td>
                    <td>
                        ${postulacion.observaciones ?
                            `<small class="text-muted">${postulacion.observaciones}</small>` :
                            '<span class="text-muted">-</span>'}
                    </td>
                    <td>
                        <button onclick="CandidatoController.verDetallePostulacion(${postulacion.id})"
                                class="btn btn-sm btn-outline-primary me-1">
                            <i class="bi bi-eye"></i>
                        </button>
                        ${postulacion.estado === 'pendiente' || postulacion.estado === 'en_revision' ? `
                            <button onclick="CandidatoController.cancelarPostulacion(${postulacion.id})"
                                    class="btn btn-sm btn-outline-danger">
                                <i class="bi bi-x-circle"></i>
                            </button>
                        ` : ''}
                    </td>
                </tr>
            `;
        });

        tbody.innerHTML = html;
    },

    /**
     * Retorna el badge HTML según el estado de la postulación
     * @param {string} estado - Estado de la postulación
     * @returns {string} - HTML del badge
     */
    getBadgeEstadoPostulacion(estado) {
        const badges = {
            'pendiente': '<span class="badge bg-secondary">Pendiente</span>',
            'en_revision': '<span class="badge bg-info">En Revisión</span>',
            'preseleccionado': '<span class="badge bg-primary">Preseleccionado</span>',
            'entrevista': '<span class="badge bg-warning">Entrevista</span>',
            'pruebas': '<span class="badge bg-warning">Pruebas</span>',
            'contratado': '<span class="badge bg-success">Contratado</span>',
            'rechazado': '<span class="badge bg-danger">Rechazado</span>'
        };

        return badges[estado] || '<span class="badge bg-secondary">Desconocido</span>';
    },

    /**
     * Cancela una postulación
     * @param {number} postulacionId - ID de la postulación
     */
    async cancelarPostulacion(postulacionId) {
        if (!confirm('¿Estás seguro de que deseas cancelar esta postulación?')) {
            return;
        }

        try {
            Utils.showLoading('Cancelando postulación...');

            const response = await CandidatosService.cancelarPostulacion(postulacionId);

            if (response.success) {
                Utils.showSuccess('Postulación cancelada correctamente');
                this.cargarMisPostulaciones(); // Recargar lista
            } else {
                Utils.showError(response.message || 'Error al cancelar postulación');
            }
        } catch (error) {
            Utils.showError('Error al cancelar postulación: ' + error.message);
        } finally {
            Utils.hideLoading();
        }
    },

    /**
     * Ver detalle de una postulación
     * @param {number} postulacionId - ID de la postulación
     */
    verDetallePostulacion(postulacionId) {
        // Implementar vista de detalle
        console.log('Ver detalle de postulación:', postulacionId);
    },

    /**
     * Muestra la paginación
     * @param {number} paginaActual - Página actual
     * @param {number} totalPaginas - Total de páginas
     */
    mostrarPaginacion(paginaActual, totalPaginas) {
        const container = document.getElementById('paginacionContainer');

        if (!container) return;

        let html = '<nav><ul class="pagination justify-content-center">';

        // Botón anterior
        html += `
            <li class="page-item ${paginaActual === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="CandidatoController.buscarVacantes(${paginaActual - 1}); return false;">
                    Anterior
                </a>
            </li>
        `;

        // Páginas
        for (let i = 1; i <= totalPaginas; i++) {
            html += `
                <li class="page-item ${i === paginaActual ? 'active' : ''}">
                    <a class="page-link" href="#" onclick="CandidatoController.buscarVacantes(${i}); return false;">
                        ${i}
                    </a>
                </li>
            `;
        }

        // Botón siguiente
        html += `
            <li class="page-item ${paginaActual === totalPaginas ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="CandidatoController.buscarVacantes(${paginaActual + 1}); return false;">
                    Siguiente
                </a>
            </li>
        `;

        html += '</ul></nav>';
        container.innerHTML = html;
    }
};
