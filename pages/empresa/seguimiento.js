// Variables globales
let candidatosData = [];
let candidatosFiltrados = [];

// Helper para formatear fechas
function formatearFecha(fecha) {
    if (!fecha) return 'N/A';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
}

// Inicializar
document.addEventListener('DOMContentLoaded', async () => {
    await cargarSeguimiento();
});

/**
 * Cargar seguimiento de candidatos
 */
async function cargarSeguimiento() {
    try {
        document.getElementById('loading').classList.remove('d-none');
        document.getElementById('sin-datos').classList.add('d-none');
        document.getElementById('tabla-seguimiento').classList.add('d-none');

        const response = await ApiService.get('/contrataciones/seguimiento');
        candidatosData = response.data || response;
        candidatosFiltrados = [...candidatosData];

        if (candidatosData.length === 0) {
            document.getElementById('sin-datos').classList.remove('d-none');
        } else {
            renderizarTabla();
            actualizarEstadisticas();
            document.getElementById('tabla-seguimiento').classList.remove('d-none');
        }

    } catch (error) {
        console.error('Error al cargar seguimiento:', error);
        Swal.fire('Error', 'No se pudo cargar el seguimiento de candidatos', 'error');
    } finally {
        document.getElementById('loading').classList.add('d-none');
    }
}

/**
 * Renderizar tabla de seguimiento
 */
function renderizarTabla() {
    const tbody = document.getElementById('tbody-seguimiento');
    tbody.innerHTML = '';

    candidatosFiltrados.forEach(candidato => {
        const tr = document.createElement('tr');

        // Datos básicos
        const id = candidato.id;
        const nombre = candidato.candidato.nombre;
        const email = candidato.candidato.email;
        const vacante = candidato.vacante.titulo;
        const cvUrl = candidato.candidato.cv_url;
        const estado = candidato.estado;

        // Pruebas Psicométricas
        const psico = candidato.pruebasPsicometricas;
        const psicoTexto = psico.total > 0 
            ? `${psico.completadas}/${psico.total} (${psico.porcentajePromedio}%)`
            : 'N/A';
        const psicoIcono = psico.completadas > 0 
            ? '<i class="bi bi-check-circle-fill text-success icono-estado"></i>'
            : '<i class="bi bi-dash-circle text-muted icono-estado"></i>';

        // Prueba Médica
        const medica = candidato.pruebaMedica;
        const medicaTexto = medica ? `${medica.porcentaje}%` : 'N/A';
        const medicaIcono = medica 
            ? `<i class="bi bi-check-circle-fill text-${medica.porcentaje >= 70 ? 'success' : 'warning'} icono-estado"></i>`
            : '<i class="bi bi-dash-circle text-muted icono-estado"></i>';

        // Prueba Técnica
        const tecnica = candidato.pruebaTecnica;
        const tecnicaTexto = tecnica ? `${tecnica.porcentaje}%` : 'N/A';
        const tecnicaIcono = tecnica 
            ? `<i class="bi bi-check-circle-fill text-${tecnica.porcentaje >= 70 ? 'success' : 'warning'} icono-estado"></i>`
            : '<i class="bi bi-dash-circle text-muted icono-estado"></i>';

        // Contratación
        const contratacion = candidato.contratacion;
        const contratadoIcono = contratacion 
            ? '<i class="bi bi-check-circle-fill text-success icono-estado"></i>'
            : '<i class="bi bi-dash-circle text-muted icono-estado"></i>';
        const contratadoTexto = contratacion 
            ? formatearFecha(contratacion.fecha)
            : 'No';

        // Progreso
        const progreso = candidato.progreso.porcentaje;
        const progresoClase = progreso === 100 ? 'bg-success' : progreso >= 60 ? 'bg-primary' : 'bg-warning';

        // Badge de estado
        const estadoBadge = obtenerBadgeEstado(estado);

        tr.innerHTML = `
            <td>${id}</td>
            <td>
                <div class="fw-bold">${nombre}</div>
                <small class="text-muted">${email}</small>
            </td>
            <td><small>${vacante}</small></td>
            <td class="text-center">
                ${cvUrl 
                    ? `<a href="${cvUrl}" target="_blank" class="btn btn-sm btn-outline-primary">
                        <i class="bi bi-file-pdf"></i>
                       </a>`
                    : '<span class="text-muted">-</span>'
                }
            </td>
            <td>${estadoBadge}</td>
            <td class="text-center">
                ${psicoIcono}
                <div><small>${psicoTexto}</small></div>
            </td>
            <td class="text-center">
                ${medicaIcono}
                <div><small>${medicaTexto}</small></div>
            </td>
            <td class="text-center">
                ${tecnicaIcono}
                <div><small>${tecnicaTexto}</small></div>
            </td>
            <td class="text-center">
                ${contratadoIcono}
                <div><small>${contratadoTexto}</small></div>
            </td>
            <td class="progress-cell">
                <div class="progress" style="height: 25px;">
                    <div class="progress-bar ${progresoClase}" role="progressbar" 
                         style="width: ${progreso}%" 
                         aria-valuenow="${progreso}" aria-valuemin="0" aria-valuemax="100">
                        ${progreso}%
                    </div>
                </div>
                <small class="text-muted">${candidato.progreso.etapasCompletadas}/${candidato.progreso.totalEtapas} etapas</small>
            </td>
            <td class="text-center">
                <button class="btn btn-sm btn-outline-primary" onclick="analizarConIA(${candidato.id_postulacion})" title="Análisis con IA">
                    <i class="bi bi-robot"></i>
                </button>
            </td>
        `;

        tbody.appendChild(tr);
    });
}

/**
 * Obtener badge de estado
 */
function obtenerBadgeEstado(estado) {
    const badges = {
        'pendiente': '<span class="badge bg-secondary badge-status">Pendiente</span>',
        'revision': '<span class="badge bg-info badge-status">En Revisión</span>',
        'entrevista': '<span class="badge bg-warning badge-status">Entrevista</span>',
        'pruebas': '<span class="badge bg-primary badge-status">Pruebas</span>',
        'rechazado': '<span class="badge bg-danger badge-status">Rechazado</span>',
        'contratado': '<span class="badge bg-success badge-status">Contratado</span>'
    };
    return badges[estado] || '<span class="badge bg-secondary badge-status">Desconocido</span>';
}

/**
 * Actualizar estadísticas
 */
function actualizarEstadisticas() {
    const stats = {
        total: candidatosData.length,
        pendiente: 0,
        revision: 0,
        entrevista: 0,
        pruebas: 0,
        contratado: 0
    };

    candidatosData.forEach(c => {
        if (stats.hasOwnProperty(c.estado)) {
            stats[c.estado]++;
        }
    });

    document.getElementById('stat-total').textContent = stats.total;
    document.getElementById('stat-pendiente').textContent = stats.pendiente;
    document.getElementById('stat-revision').textContent = stats.revision;
    document.getElementById('stat-entrevista').textContent = stats.entrevista;
    document.getElementById('stat-pruebas').textContent = stats.pruebas;
    document.getElementById('stat-contratado').textContent = stats.contratado;
}

/**
 * Filtrar candidatos
 */
function filtrarCandidatos() {
    const busqueda = document.getElementById('buscar').value.toLowerCase();
    const estado = document.getElementById('filtro-estado').value;
    const progresoMin = parseInt(document.getElementById('filtro-progreso').value);

    candidatosFiltrados = candidatosData.filter(candidato => {
        // Filtro de búsqueda
        const coincideBusqueda = !busqueda || 
            candidato.candidato.nombre.toLowerCase().includes(busqueda) ||
            candidato.candidato.email.toLowerCase().includes(busqueda) ||
            candidato.vacante.titulo.toLowerCase().includes(busqueda);

        // Filtro de estado
        const coincideEstado = !estado || candidato.estado === estado;

        // Filtro de progreso
        const coincideProgreso = candidato.progreso.porcentaje >= progresoMin;

        return coincideBusqueda && coincideEstado && coincideProgreso;
    });

    renderizarTabla();
}

/**
 * Limpiar filtros
 */
function limpiarFiltros() {
    document.getElementById('buscar').value = '';
    document.getElementById('filtro-estado').value = '';
    document.getElementById('filtro-progreso').value = 0;
    document.getElementById('valor-progreso').textContent = '0%';
    
    candidatosFiltrados = [...candidatosData];
    renderizarTabla();
}

/**
 * Exportar a Excel
 */
function exportarExcel() {
    if (candidatosFiltrados.length === 0) {
        Swal.fire('Info', 'No hay datos para exportar', 'info');
        return;
    }

    // Preparar datos para Excel
    const datos = candidatosFiltrados.map(c => ({
        'ID': c.id,
        'Candidato': c.candidato.nombre,
        'Email': c.candidato.email,
        'Teléfono': c.candidato.telefono,
        'Vacante': c.vacante.titulo,
        'Estado': c.estado,
        'Test Psico Completadas': `${c.pruebasPsicometricas.completadas}/${c.pruebasPsicometricas.total}`,
        'Test Psico %': c.pruebasPsicometricas.porcentajePromedio,
        'Test Médico %': c.pruebaMedica ? c.pruebaMedica.porcentaje : 'N/A',
        'Test Técnico %': c.pruebaTecnica ? c.pruebaTecnica.porcentaje : 'N/A',
        'Contratado': c.contratacion ? 'Sí' : 'No',
        'Progreso %': c.progreso.porcentaje,
        'Etapas Completadas': `${c.progreso.etapasCompletadas}/${c.progreso.totalEtapas}`,
        'Fecha Postulación': formatearFecha(c.fechaPostulacion)
    }));

    // Crear libro de Excel
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(datos);

    // Ajustar anchos de columna
    const colWidths = [
        { wch: 5 },   // ID
        { wch: 25 },  // Candidato
        { wch: 30 },  // Email
        { wch: 15 },  // Teléfono
        { wch: 30 },  // Vacante
        { wch: 12 },  // Estado
        { wch: 20 },  // Test Psico
        { wch: 12 },  // Test Psico %
        { wch: 15 },  // Test Médico
        { wch: 15 },  // Test Técnico
        { wch: 12 },  // Contratado
        { wch: 12 },  // Progreso
        { wch: 18 },  // Etapas
        { wch: 18 }   // Fecha
    ];
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, 'Seguimiento');

    // Descargar
    const fecha = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `Seguimiento_Candidatos_${fecha}.xlsx`);

    Swal.fire({
        icon: 'success',
        title: '¡Exportado!',
        text: 'El archivo se ha descargado correctamente',
        timer: 2000,
        showConfirmButton: false
    });
}

/**
 * Analizar candidato con IA
 */
async function analizarConIA(idPostulacion) {
    try {
        const candidato = candidatosData.find(c => c.id_postulacion === idPostulacion);
        if (!candidato) {
            Swal.fire('Error', 'Candidato no encontrado', 'error');
            return;
        }

        // Mostrar modal y loading
        const modal = new bootstrap.Modal(document.getElementById('modalAnalisisIA'));
        document.getElementById('modal-ia-candidato-nombre').textContent = candidato.candidato.nombre;
        document.getElementById('modal-ia-vacante-titulo').textContent = candidato.vacante.titulo;
        document.getElementById('ia-loading').style.display = 'block';
        document.getElementById('ia-resultados').style.display = 'none';
        document.getElementById('ia-error').style.display = 'none';
        document.getElementById('btn-regenerar-analisis').style.display = 'none';
        modal.show();

        // Llamar al endpoint de análisis con IA
        const response = await ApiService.post(`/postulaciones/${idPostulacion}/analizar-ia`, {});

        if (response.success && response.data) {
            mostrarResultadosIA(response.data);
        } else {
            throw new Error('No se recibieron datos del análisis');
        }

    } catch (error) {
        console.error('Error al analizar con IA:', error);
        document.getElementById('ia-loading').style.display = 'none';
        document.getElementById('ia-error').style.display = 'block';
        document.getElementById('ia-error-mensaje').textContent = error.message || 'Error al realizar el análisis';
        document.getElementById('btn-regenerar-analisis').style.display = 'inline-block';
    }
}

/**
 * Mostrar resultados del análisis con IA
 */
function mostrarResultadosIA(data) {
    document.getElementById('ia-loading').style.display = 'none';
    document.getElementById('ia-resultados').style.display = 'block';
    document.getElementById('btn-regenerar-analisis').style.display = 'inline-block';

    // Puntuación general
    const puntuacion = data.puntuacion_compatibilidad || 0;
    document.getElementById('ia-puntuacion').textContent = `${puntuacion}%`;
    
    const progressBar = document.getElementById('ia-puntuacion-bar');
    progressBar.style.width = `${puntuacion}%`;
    
    // Color según puntuación
    if (puntuacion >= 80) {
        progressBar.className = 'progress-bar bg-success';
    } else if (puntuacion >= 60) {
        progressBar.className = 'progress-bar bg-warning';
    } else {
        progressBar.className = 'progress-bar bg-danger';
    }

    // Categoría
    let categoria = 'No recomendado';
    if (puntuacion >= 90) categoria = 'Excelente candidato';
    else if (puntuacion >= 80) categoria = 'Muy buen candidato';
    else if (puntuacion >= 70) categoria = 'Buen candidato';
    else if (puntuacion >= 60) categoria = 'Candidato aceptable';
    document.getElementById('ia-categoria').textContent = categoria;

    // Fortalezas
    const fortalezasContainer = document.getElementById('ia-fortalezas');
    fortalezasContainer.innerHTML = '';
    if (data.fortalezas && data.fortalezas.length > 0) {
        data.fortalezas.forEach(fortaleza => {
            const li = document.createElement('li');
            li.className = 'mb-2';
            li.innerHTML = `<i class="bi bi-check-circle-fill text-success me-2"></i>${fortaleza}`;
            fortalezasContainer.appendChild(li);
        });
    } else {
        fortalezasContainer.innerHTML = '<li class="text-muted">No se identificaron fortalezas específicas</li>';
    }

    // Debilidades
    const debilidadesContainer = document.getElementById('ia-debilidades');
    debilidadesContainer.innerHTML = '';
    if (data.debilidades && data.debilidades.length > 0) {
        data.debilidades.forEach(debilidad => {
            const li = document.createElement('li');
            li.className = 'mb-2';
            li.innerHTML = `<i class="bi bi-exclamation-circle-fill text-warning me-2"></i>${debilidad}`;
            debilidadesContainer.appendChild(li);
        });
    } else {
        debilidadesContainer.innerHTML = '<li class="text-muted">No se identificaron áreas de mejora</li>';
    }

    // Recomendación
    document.getElementById('ia-recomendacion').textContent = data.recomendacion || 'No hay recomendación disponible';

    // Análisis por áreas
    const areas = data.analisis_areas || {};
    
    actualizarBarraProgreso('ia-experiencia', areas.experiencia || 0);
    actualizarBarraProgreso('ia-habilidades', areas.habilidades || 0);
    actualizarBarraProgreso('ia-psicometrico', areas.perfil_psicometrico || 0);
    actualizarBarraProgreso('ia-aptitud', areas.aptitud_general || 0);
}

/**
 * Actualizar barra de progreso
 */
function actualizarBarraProgreso(prefijo, valor) {
    const bar = document.getElementById(`${prefijo}-bar`);
    const text = document.getElementById(`${prefijo}-text`);
    
    bar.style.width = `${valor}%`;
    text.textContent = `${valor}%`;
}

// Event listener para regenerar análisis
document.addEventListener('DOMContentLoaded', () => {
    const btnRegenerar = document.getElementById('btn-regenerar-analisis');
    if (btnRegenerar) {
        btnRegenerar.addEventListener('click', function() {
            const modal = bootstrap.Modal.getInstance(document.getElementById('modalAnalisisIA'));
            if (modal) {
                modal.hide();
                Swal.fire({
                    icon: 'info',
                    title: 'Regenerar análisis',
                    text: 'Por favor, vuelva a hacer clic en el botón de análisis',
                    timer: 2000,
                    showConfirmButton: false
                });
            }
        });
    }
});

