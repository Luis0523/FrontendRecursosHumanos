/**
 * Crear/Editar Vacante
 * Maneja el formulario de creación y edición de vacantes
 */

(function() {
    'use strict';

    // Proteger la página - solo empresas
    AuthService.protectPage(CONFIG.ROLES.EMPRESA);

    let vacanteId = null;
    let habilidades = [];

    /**
     * Inicializa la página
     */
    async function init() {
        // Verificar si es edición
        vacanteId = Helpers.getURLParameter('id');

        if (vacanteId) {
            document.getElementById('page-title').textContent = 'Editar Vacante';
            document.getElementById('btn-guardar').innerHTML = '<i class="bi bi-save me-2"></i>Guardar Cambios';
            await cargarVacante(vacanteId);
        }

        // Event listeners
        document.getElementById('btn-guardar').addEventListener('click', guardarVacante);
        document.getElementById('btn-agregar-habilidad').addEventListener('click', agregarHabilidad);
        document.getElementById('habilidades-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                agregarHabilidad();
            }
        });

        // Configurar fecha mínima (hoy)
        const hoy = new Date().toISOString().split('T')[0];
        document.getElementById('fecha-cierre').setAttribute('min', hoy);
    }

    /**
     * Carga los datos de una vacante para editar
     * @param {number} id - ID de la vacante
     */
    async function cargarVacante(id) {
        try {
            Helpers.showLoader();

            const response = await VacantesService.getById(id);

            if (response.success) {
                llenarFormulario(response.data);
            }
        } catch (error) {
            console.error('Error al cargar vacante:', error);
            Helpers.showError('Error al cargar la vacante');
            setTimeout(() => {
                window.location.href = '/pages/empresa/vacantes.html';
            }, 2000);
        } finally {
            Helpers.hideLoader();
        }
    }

    /**
     * Llena el formulario con los datos de la vacante
     * @param {Object} data - Datos de la vacante
     */
    function llenarFormulario(data) {
        // Información básica
        document.getElementById('titulo').value = data.titulo || '';
        document.getElementById('ubicacion').value = data.ubicacion || '';
        document.getElementById('modalidad').value = data.modalidad || '';
        document.getElementById('tipo-contrato').value = data.tipo_contrato || '';
        document.getElementById('nivel-experiencia').value = data.nivel_experiencia || '';
        document.getElementById('descripcion').value = data.descripcion || '';
        document.getElementById('requisitos').value = data.requisitos || '';
        document.getElementById('responsabilidades').value = data.responsabilidades || '';

        // Compensación
        if (data.salario_min || data.salario_max) {
            document.getElementById('mostrar-salario').checked = true;
        }
        document.getElementById('salario-min').value = data.salario_min || '';
        document.getElementById('salario-max').value = data.salario_max || '';
        document.getElementById('beneficios').value = data.beneficios || '';

        // Habilidades
        if (data.habilidades) {
            habilidades = typeof data.habilidades === 'string' ?
                JSON.parse(data.habilidades) : data.habilidades;
            renderizarHabilidades();
        }
        document.getElementById('idiomas').value = data.idiomas || '';
        document.getElementById('educacion').value = data.educacion || '';

        // Estado
        document.getElementById('estado').value = data.estado || 'activa';
        if (data.fecha_cierre) {
            const fecha = new Date(data.fecha_cierre).toISOString().split('T')[0];
            document.getElementById('fecha-cierre').value = fecha;
        }
        document.getElementById('vacantes-disponibles').value = data.vacantes_disponibles || 1;

        // Proceso
        document.getElementById('requiere-prueba-tecnica').checked = data.requiere_prueba_tecnica || false;
        document.getElementById('requiere-prueba-psicometrica').checked = data.requiere_prueba_psicometrica || false;
        document.getElementById('requiere-examenes-medicos').checked = data.requiere_examenes_medicos || false;
        document.getElementById('num-entrevistas').value = data.numero_entrevistas || 2;

        // Info adicional
        document.getElementById('departamento').value = data.departamento || '';
        document.getElementById('horario').value = data.horario || '';
        document.getElementById('contacto-reclutador').value = data.contacto_reclutador || '';
    }

    /**
     * Agrega una habilidad a la lista
     */
    function agregarHabilidad() {
        const input = document.getElementById('habilidades-input');
        const habilidad = input.value.trim();

        if (!habilidad) return;

        if (habilidades.includes(habilidad)) {
            Helpers.showWarning('Esta habilidad ya está agregada');
            return;
        }

        habilidades.push(habilidad);
        input.value = '';
        renderizarHabilidades();
    }

    /**
     * Elimina una habilidad de la lista
     * @param {number} index - Índice de la habilidad
     */
    function eliminarHabilidad(index) {
        habilidades.splice(index, 1);
        renderizarHabilidades();
    }

    /**
     * Renderiza la lista de habilidades
     */
    function renderizarHabilidades() {
        const container = document.getElementById('habilidades-list');
        container.innerHTML = '';

        habilidades.forEach((hab, index) => {
            const badge = document.createElement('span');
            badge.className = 'badge bg-primary';
            badge.innerHTML = `
                ${hab}
                <i class="bi bi-x-lg ms-2" style="cursor: pointer;" onclick="eliminarHabilidad(${index})"></i>
            `;
            container.appendChild(badge);
        });
    }

    // Exponer función para onclick
    window.eliminarHabilidad = eliminarHabilidad;

    /**
     * Guarda la vacante (crear o actualizar)
     */
    async function guardarVacante() {
        try {
            // Validar formulario
            const form = document.getElementById('form-vacante');
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            // Recopilar datos
            const vacanteData = {
                titulo: document.getElementById('titulo').value.trim(),
                ubicacion: document.getElementById('ubicacion').value.trim(),
                modalidad: document.getElementById('modalidad').value,
                tipo_contrato: document.getElementById('tipo-contrato').value,
                nivel_experiencia: document.getElementById('nivel-experiencia').value,
                descripcion: document.getElementById('descripcion').value.trim(),
                requisitos: document.getElementById('requisitos').value.trim(),
                responsabilidades: document.getElementById('responsabilidades').value.trim(),
                salario_min: parseFloat(document.getElementById('salario-min').value) || null,
                salario_max: parseFloat(document.getElementById('salario-max').value) || null,
                mostrar_salario: document.getElementById('mostrar-salario').checked,
                beneficios: document.getElementById('beneficios').value.trim(),
                habilidades: JSON.stringify(habilidades),
                idiomas: document.getElementById('idiomas').value.trim(),
                educacion: document.getElementById('educacion').value,
                estado: document.getElementById('estado').value,
                fecha_cierre: document.getElementById('fecha-cierre').value || null,
                vacantes_disponibles: parseInt(document.getElementById('vacantes-disponibles').value) || 1,
                requiere_prueba_tecnica: document.getElementById('requiere-prueba-tecnica').checked,
                requiere_prueba_psicometrica: document.getElementById('requiere-prueba-psicometrica').checked,
                requiere_examenes_medicos: document.getElementById('requiere-examenes-medicos').checked,
                numero_entrevistas: parseInt(document.getElementById('num-entrevistas').value) || 2,
                departamento: document.getElementById('departamento').value.trim(),
                horario: document.getElementById('horario').value.trim(),
                contacto_reclutador: document.getElementById('contacto-reclutador').value.trim()
            };

            // Validaciones adicionales
            if (vacanteData.salario_min && vacanteData.salario_max) {
                if (vacanteData.salario_min > vacanteData.salario_max) {
                    Helpers.showError('El salario mínimo no puede ser mayor al salario máximo');
                    return;
                }
            }

            if (vacanteData.contacto_reclutador && !Validators.isValidEmail(vacanteData.contacto_reclutador)) {
                Helpers.showError('El email del reclutador no es válido');
                return;
            }

            Helpers.showLoader();

            let response;
            if (vacanteId) {
                // Actualizar vacante existente
                response = await VacantesService.actualizar(vacanteId, vacanteData);
            } else {
                // Crear nueva vacante
                response = await VacantesService.crear(vacanteData);
            }

            if (response.success) {
                Helpers.showSuccess(vacanteId ? 'Vacante actualizada correctamente' : 'Vacante creada correctamente');

                setTimeout(() => {
                    window.location.href = '/pages/empresa/vacantes.html';
                }, 1500);
            }
        } catch (error) {
            console.error('Error al guardar vacante:', error);
            Helpers.showError(error.message || 'Error al guardar la vacante');
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
