/**
 * Detalle de Candidato
 * Muestra el perfil completo de un candidato
 */

(function() {
    'use strict';

    // Proteger la página - solo empresas
    AuthService.protectPage(CONFIG.ROLES.EMPRESA);

    let candidato = null;
    let candidatoId = null;
    let modalContactar = null;

    /**
     * Inicializa la página
     */
    async function init() {
        // Inicializar modal
        modalContactar = new bootstrap.Modal(document.getElementById('modalContactar'));

        // Obtener ID del candidato desde la URL
        candidatoId = Helpers.getURLParameter('id');

        if (!candidatoId) {
            mostrarError();
            return;
        }

        // Cargar candidato
        await cargarCandidato();

        // Event listeners
        document.getElementById('btn-contactar').addEventListener('click', abrirModalContactar);
        document.getElementById('btn-descargar-cv').addEventListener('click', descargarCV);
        document.getElementById('btn-guardar-favoritos').addEventListener('click', guardarFavoritos);
        document.getElementById('btn-enviar-mensaje').addEventListener('click', enviarMensaje);
    }

    /**
     * Carga los detalles del candidato
     */
    async function cargarCandidato() {
        try {
            mostrarLoading();

            const response = await EmpresaService.getCandidatoDetalle(candidatoId);

            if (response.success) {
                // Mapear campos del backend
                const c = response.data;
                candidato = {
                    candidato_id: c.id || c.candidato_id,
                    nombre: c.usuario.nombre,
                    email: c.email,
                    telefono: c.telefono,
                    ubicacion: c.ubicacion,
                    titulo_profesional: c.titulo_profesional,
                    resumen: c.resumen || c.descripcion,
                    foto_url: c.foto_url || c.foto,
                    fecha_nacimiento: c.fecha_nacimiento,
                    genero: c.genero,
                    estado_civil: c.estado_civil,
                    nivel_educacion: c.nivel_educacion,
                    anos_experiencia: c.anos_experiencia || c.experiencia,
                    disponibilidad: c.disponibilidad,
                    habilidades: c.habilidades,
                    idiomas: c.idiomas,
                    experiencia_laboral: c.experiencia_laboral || c.experiencias,
                    educacion: c.educacion || c.educaciones,
                    certificaciones: c.certificaciones,
                    documentos: c.documentos,
                    redes_sociales: c.redes_sociales,
                    cv_url: c.cv_url
                };

                renderizarCandidato();
                mostrarContenido();
            } else {
                mostrarError();
            }
        } catch (error) {
            console.error('Error al cargar candidato:', error);
            Helpers.showError('Error al cargar el perfil del candidato');
            mostrarError();
        }
    }

    /**
     * Renderiza la información del candidato
     */
    function renderizarCandidato() {
        // Avatar
        const avatarContainer = document.getElementById('candidato-avatar');
        if (candidato.foto_url) {
            avatarContainer.innerHTML = `<img src="${candidato.foto_url}" class="rounded-circle" style="width: 100px; height: 100px; object-fit: cover;" alt="${candidato.nombre}">`;
        } else {
            const iniciales = getIniciales(candidato.nombre);
            avatarContainer.innerHTML = iniciales;
        }

        // Header
        document.getElementById('candidato-nombre').textContent = candidato.nombre || 'Sin nombre';
        document.getElementById('candidato-titulo').textContent = candidato.titulo_profesional || 'Profesional';

        const ubicacionSpan = document.getElementById('candidato-ubicacion');
        ubicacionSpan.querySelector('span').textContent = candidato.ubicacion || 'No especificado';

        const emailSpan = document.getElementById('candidato-email');
        emailSpan.querySelector('span').textContent = candidato.email || 'No especificado';

        const telefonoSpan = document.getElementById('candidato-telefono');
        telefonoSpan.querySelector('span').textContent = candidato.telefono || 'No especificado';

        // Disponibilidad
        if (candidato.disponibilidad) {
            document.getElementById('candidato-disponibilidad-badge').innerHTML = `
                <span class="badge bg-success">
                    <i class="bi bi-clock me-1"></i>${formatDisponibilidad(candidato.disponibilidad)}
                </span>
            `;
        }

        // Resumen
        document.getElementById('candidato-resumen').textContent = candidato.resumen || 'El candidato no ha agregado un resumen profesional.';

        // Experiencia Laboral
        renderizarExperiencia();

        // Educación
        renderizarEducacion();

        // Certificaciones
        renderizarCertificaciones();

        // Información Personal
        document.getElementById('candidato-anos-experiencia').textContent = formatExperiencia(candidato.anos_experiencia);
        document.getElementById('candidato-nivel-educacion').textContent = formatNivelEducacion(candidato.nivel_educacion);
        document.getElementById('candidato-edad').textContent = calcularEdad(candidato.fecha_nacimiento);
        document.getElementById('candidato-genero').textContent = formatGenero(candidato.genero);
        document.getElementById('candidato-estado-civil').textContent = formatEstadoCivil(candidato.estado_civil);

        // Habilidades
        renderizarHabilidades();

        // Idiomas
        renderizarIdiomas();

        // Documentos
        renderizarDocumentos();

        // Redes Sociales
        renderizarRedesSociales();
    }

    /**
     * Renderiza la experiencia laboral
     */
    function renderizarExperiencia() {
        const container = document.getElementById('candidato-experiencia');
        const experiencias = parseArrayField(candidato.experiencia_laboral);

        if (experiencias.length === 0) {
            container.innerHTML = '<p class="text-muted">No hay experiencia registrada</p>';
            return;
        }

        container.innerHTML = experiencias.map(exp => `
            <div class="mb-4 pb-3 border-bottom">
                <h6 class="fw-bold mb-1">${exp.cargo || exp.puesto || 'Cargo no especificado'}</h6>
                <p class="text-primary mb-2">${exp.empresa || 'Empresa no especificada'}</p>
                <p class="text-muted small mb-2">
                    <i class="bi bi-calendar me-1"></i>
                    ${exp.fecha_inicio ? Helpers.formatDate(exp.fecha_inicio) : 'N/A'} -
                    ${exp.fecha_fin ? Helpers.formatDate(exp.fecha_fin) : 'Actualidad'}
                    ${exp.fecha_inicio && exp.fecha_fin ? `(${calcularDuracion(exp.fecha_inicio, exp.fecha_fin)})` : ''}
                </p>
                ${exp.descripcion ? `<p class="mb-0">${exp.descripcion}</p>` : ''}
            </div>
        `).join('');
    }

    /**
     * Renderiza la educación
     */
    function renderizarEducacion() {
        const container = document.getElementById('candidato-educacion');
        const educaciones = parseArrayField(candidato.educacion);

        if (educaciones.length === 0) {
            container.innerHTML = '<p class="text-muted">No hay educación registrada</p>';
            return;
        }

        container.innerHTML = educaciones.map(edu => `
            <div class="mb-4 pb-3 border-bottom">
                <h6 class="fw-bold mb-1">${edu.titulo || edu.carrera || 'Título no especificado'}</h6>
                <p class="text-primary mb-2">${edu.institucion || 'Institución no especificada'}</p>
                <p class="text-muted small mb-2">
                    <i class="bi bi-calendar me-1"></i>
                    ${edu.fecha_inicio ? Helpers.formatDate(edu.fecha_inicio) : 'N/A'} -
                    ${edu.fecha_fin ? Helpers.formatDate(edu.fecha_fin) : 'En curso'}
                </p>
                ${edu.descripcion ? `<p class="mb-0">${edu.descripcion}</p>` : ''}
            </div>
        `).join('');
    }

    /**
     * Renderiza las certificaciones
     */
    function renderizarCertificaciones() {
        const container = document.getElementById('candidato-certificaciones');
        const certificaciones = parseArrayField(candidato.certificaciones);

        if (certificaciones.length === 0) {
            container.innerHTML = '<p class="text-muted">No hay certificaciones registradas</p>';
            return;
        }

        container.innerHTML = certificaciones.map(cert => `
            <div class="mb-3 pb-3 border-bottom">
                <h6 class="fw-bold mb-1">${cert.nombre || 'Certificación'}</h6>
                <p class="text-muted small mb-1">${cert.organizacion || 'Organización no especificada'}</p>
                ${cert.fecha_obtencion ? `<p class="text-muted small mb-0"><i class="bi bi-calendar me-1"></i>${Helpers.formatDate(cert.fecha_obtencion)}</p>` : ''}
            </div>
        `).join('');
    }

    /**
     * Renderiza las habilidades
     */
    function renderizarHabilidades() {
        const container = document.getElementById('candidato-habilidades');
        const habilidades = parseArrayField(candidato.habilidades);

        if (habilidades.length === 0) {
            container.innerHTML = '<span class="text-muted">No hay habilidades registradas</span>';
            return;
        }

        container.innerHTML = habilidades
            .map(hab => `<span class="badge bg-secondary me-1 mb-1">${hab}</span>`)
            .join('');
    }

    /**
     * Renderiza los idiomas
     */
    function renderizarIdiomas() {
        const container = document.getElementById('candidato-idiomas');
        const idiomas = parseArrayField(candidato.idiomas);

        if (idiomas.length === 0) {
            container.innerHTML = '<p class="text-muted mb-0">No hay idiomas registrados</p>';
            return;
        }

        container.innerHTML = idiomas.map(idioma => `
            <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="fw-semibold">${idioma.idioma || idioma.nombre || idioma}</span>
                ${idioma.nivel ? `<span class="badge bg-primary">${idioma.nivel}</span>` : ''}
            </div>
        `).join('');
    }

    /**
     * Renderiza los documentos
     */
    function renderizarDocumentos() {
        const container = document.getElementById('candidato-documentos');
        const documentos = parseArrayField(candidato.documentos);

        if (documentos.length === 0 && !candidato.cv_url) {
            container.innerHTML = '<p class="text-muted mb-0">No hay documentos adjuntos</p>';
            return;
        }

        let html = '';

        // CV principal
        if (candidato.cv_url) {
            html += `
                <a href="${candidato.cv_url}" target="_blank" class="d-flex align-items-center text-decoration-none mb-2">
                    <i class="bi bi-file-pdf text-danger me-2"></i>
                    <span>Currículum Vitae</span>
                </a>
            `;
        }

        // Otros documentos
        documentos.forEach(doc => {
            html += `
                <a href="${doc.url}" target="_blank" class="d-flex align-items-center text-decoration-none mb-2">
                    <i class="bi bi-file-earmark text-primary me-2"></i>
                    <span>${doc.nombre || 'Documento'}</span>
                </a>
            `;
        });

        container.innerHTML = html;
    }

    /**
     * Renderiza las redes sociales
     */
    function renderizarRedesSociales() {
        const container = document.getElementById('candidato-redes');
        const redes = candidato.redes_sociales || {};

        const redesDisponibles = [];

        if (redes.linkedin) {
            redesDisponibles.push({
                icono: 'bi-linkedin',
                nombre: 'LinkedIn',
                url: redes.linkedin,
                color: 'text-primary'
            });
        }

        if (redes.github) {
            redesDisponibles.push({
                icono: 'bi-github',
                nombre: 'GitHub',
                url: redes.github,
                color: 'text-dark'
            });
        }

        if (redes.portfolio || redes.website) {
            redesDisponibles.push({
                icono: 'bi-globe',
                nombre: 'Portafolio',
                url: redes.portfolio || redes.website,
                color: 'text-info'
            });
        }

        if (redes.twitter) {
            redesDisponibles.push({
                icono: 'bi-twitter',
                nombre: 'Twitter',
                url: redes.twitter,
                color: 'text-primary'
            });
        }

        if (redesDisponibles.length === 0) {
            container.innerHTML = '<p class="text-muted mb-0">No hay redes sociales</p>';
            return;
        }

        container.innerHTML = redesDisponibles.map(red => `
            <a href="${red.url}" target="_blank" class="btn btn-outline-secondary btn-sm w-100 text-start">
                <i class="bi ${red.icono} ${red.color} me-2"></i>${red.nombre}
            </a>
        `).join('');
    }

    /**
     * Parsea un campo que puede ser JSON string o array
     */
    function parseArrayField(field) {
        if (!field) return [];
        if (Array.isArray(field)) return field;

        try {
            const parsed = JSON.parse(field);
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            return [];
        }
    }

    /**
     * Obtiene las iniciales de un nombre
     */
    function getIniciales(nombre) {
        if (!nombre) return '?';
        const partes = nombre.trim().split(' ');
        if (partes.length === 1) return partes[0][0].toUpperCase();
        return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
    }

    /**
     * Calcula la edad a partir de la fecha de nacimiento
     */
    function calcularEdad(fechaNacimiento) {
        if (!fechaNacimiento) return 'No especificada';

        const hoy = new Date();
        const nacimiento = new Date(fechaNacimiento);
        let edad = hoy.getFullYear() - nacimiento.getFullYear();
        const mes = hoy.getMonth() - nacimiento.getMonth();

        if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
            edad--;
        }

        return `${edad} años`;
    }

    /**
     * Calcula la duración entre dos fechas
     */
    function calcularDuracion(fechaInicio, fechaFin) {
        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);

        const meses = (fin.getFullYear() - inicio.getFullYear()) * 12 + (fin.getMonth() - inicio.getMonth());
        const anos = Math.floor(meses / 12);
        const mesesRestantes = meses % 12;

        if (anos === 0) return `${meses} ${meses === 1 ? 'mes' : 'meses'}`;
        if (mesesRestantes === 0) return `${anos} ${anos === 1 ? 'año' : 'años'}`;
        return `${anos} ${anos === 1 ? 'año' : 'años'} y ${mesesRestantes} ${mesesRestantes === 1 ? 'mes' : 'meses'}`;
    }

    /**
     * Formatea años de experiencia
     */
    function formatExperiencia(anos) {
        if (!anos) return 'Sin experiencia';
        if (anos === 1) return '1 año';
        return `${anos} años`;
    }

    /**
     * Formatea nivel de educación
     */
    function formatNivelEducacion(nivel) {
        const niveles = {
            'secundaria': 'Secundaria',
            'tecnico': 'Técnico',
            'universitario': 'Universitario',
            'posgrado': 'Posgrado',
            'doctorado': 'Doctorado'
        };
        return niveles[nivel] || nivel || 'No especificado';
    }

    /**
     * Formatea género
     */
    function formatGenero(genero) {
        const generos = {
            'masculino': 'Masculino',
            'femenino': 'Femenino',
            'otro': 'Otro'
        };
        return generos[genero] || genero || 'No especificado';
    }

    /**
     * Formatea estado civil
     */
    function formatEstadoCivil(estado) {
        const estados = {
            'soltero': 'Soltero/a',
            'casado': 'Casado/a',
            'divorciado': 'Divorciado/a',
            'viudo': 'Viudo/a'
        };
        return estados[estado] || estado || 'No especificado';
    }

    /**
     * Formatea disponibilidad
     */
    function formatDisponibilidad(disponibilidad) {
        const disponibilidades = {
            'inmediata': 'Disponible Inmediato',
            '2_semanas': 'Disponible en 2 semanas',
            '1_mes': 'Disponible en 1 mes',
            'negociable': 'Disponibilidad Negociable'
        };
        return disponibilidades[disponibilidad] || disponibilidad;
    }

    /**
     * Abre el modal para contactar
     */
    function abrirModalContactar() {
        document.getElementById('modal-candidato-nombre').textContent = candidato.nombre;
        document.getElementById('asunto').value = '';
        document.getElementById('mensaje').value = '';
        modalContactar.show();
    }

    /**
     * Envía mensaje al candidato
     */
    function enviarMensaje() {
        const asunto = document.getElementById('asunto').value.trim();
        const mensaje = document.getElementById('mensaje').value.trim();

        if (!asunto || !mensaje) {
            Helpers.showError('Por favor completa todos los campos');
            return;
        }

        // Aquí iría la llamada al backend para enviar el mensaje
        Helpers.showWarning('Funcionalidad de mensajería en desarrollo');
        modalContactar.hide();
    }

    /**
     * Descarga el CV del candidato
     */
    function descargarCV() {
        if (candidato.cv_url) {
            window.open(candidato.cv_url, '_blank');
        } else {
            Helpers.showWarning('El candidato no ha subido su CV');
        }
    }

    /**
     * Guarda candidato en favoritos
     */
    function guardarFavoritos() {
        // Aquí iría la llamada al backend para guardar en favoritos
        Helpers.showSuccess('Candidato guardado en favoritos');

        const btn = document.getElementById('btn-guardar-favoritos');
        btn.innerHTML = '<i class="bi bi-bookmark-fill me-2"></i>Guardado';
        btn.classList.remove('btn-outline-secondary');
        btn.classList.add('btn-secondary');
    }

    /**
     * Muestra el loading
     */
    function mostrarLoading() {
        document.getElementById('loading').style.display = 'block';
        document.getElementById('content').style.display = 'none';
        document.getElementById('error-state').style.display = 'none';
    }

    /**
     * Muestra el contenido
     */
    function mostrarContenido() {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('content').style.display = 'block';
        document.getElementById('error-state').style.display = 'none';
    }

    /**
     * Muestra el error
     */
    function mostrarError() {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('content').style.display = 'none';
        document.getElementById('error-state').style.display = 'block';
    }

    // Inicializar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
