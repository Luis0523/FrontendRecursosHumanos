/**
 * Buscar Candidatos
 * Permite a las empresas buscar candidatos en la base de datos
 */

(function() {
    'use strict';

    // Proteger la página - solo empresas
    AuthService.protectPage(CONFIG.ROLES.EMPRESA);

    let candidatos = [];
    let candidatosFiltrados = [];
    let paginaActual = 1;
    const candidatosPorPagina = 12;

    /**
     * Inicializa la página
     */
    async function init() {
        // Cargar candidatos inicial (sin filtros)
        await buscarCandidatos();

        // Event listeners
        document.getElementById('btn-buscar').addEventListener('click', buscarCandidatos);
        document.getElementById('filtro-buscar').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') buscarCandidatos();
        });
        document.getElementById('filtro-ordenar').addEventListener('change', aplicarOrdenamiento);
        document.getElementById('btn-limpiar-filtros').addEventListener('click', limpiarFiltros);
    }

    /**
     * Busca candidatos según los criterios
     */
    async function buscarCandidatos() {
        try {
            mostrarLoading();

            // Construir criterios de búsqueda
            const criterios = {
                buscar: document.getElementById('filtro-buscar').value.trim(),
                ubicacion: document.getElementById('filtro-ubicacion').value.trim(),
                nivel_educacion: document.getElementById('filtro-nivel-educacion').value,
                disponibilidad: document.getElementById('filtro-disponibilidad').value,
                experiencia: document.getElementById('filtro-experiencia').value,
                estado_civil: document.getElementById('filtro-estado-civil').value,
                genero: document.getElementById('filtro-genero').value,
                ordenar: document.getElementById('filtro-ordenar').value
            };

            // Filtrar criterios vacíos
            const criteriosLimpios = {};
            Object.keys(criterios).forEach(key => {
                if (criterios[key]) {
                    criteriosLimpios[key] = criterios[key];
                }
            });

            const response = await EmpresaService.buscarCandidatos(criteriosLimpios);
            console.log(response);
            if (response.success) {
                // El backend puede devolver data como array directo
                const candidatosRaw = Array.isArray(response.data)
                    ? response.data
                    : (response.data.candidatos || []);

                
                    console.log(candidatosRaw);
                // Mapear campos del backend
                candidatos = candidatosRaw.map(c => ({
                    candidato_id: c.id || c.candidato_id,
                    nombre: c.usuario.nombre,
                    email: c.email,
                    telefono: c.telefono,
                    ubicacion: c.ubicacion,
                    titulo_profesional: c.titulo_profesional,
                    resumen: c.resumen || c.descripcion,
                    foto_url: c.foto_url || c.foto,
                    nivel_educacion: c.nivel_educacion,
                    anos_experiencia: c.anos_experiencia || c.experiencia,
                    disponibilidad: c.disponibilidad,
                    habilidades: c.habilidades,
                    estado_civil: c.estado_civil,
                    genero: c.genero,
                    fecha_registro: c.fecha_registro || c.created_at
                }));

                candidatosFiltrados = [...candidatos];
                paginaActual = 1;
                renderizarResultados();
            }
        } catch (error) {
            console.error('Error al buscar candidatos:', error);
            Helpers.showError('Error al buscar candidatos');
            mostrarEmpty();
        }
    }

    /**
     * Aplica ordenamiento a los resultados
     */
    function aplicarOrdenamiento() {
        const ordenar = document.getElementById('filtro-ordenar').value;

        switch(ordenar) {
            case 'reciente':
                candidatosFiltrados.sort((a, b) =>
                    new Date(b.fecha_registro) - new Date(a.fecha_registro)
                );
                break;
            case 'experiencia':
                candidatosFiltrados.sort((a, b) =>
                    (b.anos_experiencia || 0) - (a.anos_experiencia || 0)
                );
                break;
            case 'nombre':
                candidatosFiltrados.sort((a, b) =>
                    (a.nombre || '').localeCompare(b.nombre || '')
                );
                break;
            // 'relevancia' es el orden que viene del backend
        }

        renderizarResultados();
    }

    /**
     * Renderiza los resultados de búsqueda
     */
    function renderizarResultados() {
        const container = document.getElementById('resultados-container');
        const loading = document.getElementById('loading');
        const emptyState = document.getElementById('empty-state');
        const totalResultados = document.getElementById('total-resultados');

        loading.style.display = 'none';

        if (candidatosFiltrados.length === 0) {
            container.innerHTML = '';
            emptyState.style.display = 'block';
            totalResultados.textContent = '0';
            return;
        }

        emptyState.style.display = 'none';
        totalResultados.textContent = candidatosFiltrados.length;

        // Calcular candidatos de la página actual
        const inicio = (paginaActual - 1) * candidatosPorPagina;
        const fin = inicio + candidatosPorPagina;
        const candidatosPagina = candidatosFiltrados.slice(inicio, fin);

        // Renderizar en grid
        container.innerHTML = '<div class="row g-4"></div>';
        const row = container.querySelector('.row');

        candidatosPagina.forEach(candidato => {
            const col = document.createElement('div');
            col.className = 'col-md-6 col-lg-4';

            const iniciales = getIniciales(candidato.nombre);
            const experiencia = formatExperiencia(candidato.anos_experiencia);
            const habilidades = parseHabilidades(candidato.habilidades);

            col.innerHTML = `
                <div class="card border-0 shadow-sm h-100 hover-card" style="cursor: pointer;" onclick="verCandidato(${candidato.candidato_id})">
                    <div class="card-body">
                        <!-- Avatar y Nombre -->
                        <div class="d-flex align-items-center mb-3">
                            <div class="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3" style="width: 60px; height: 60px; font-size: 1.5rem; flex-shrink: 0;">
                                ${candidato.foto_url
                                    ? `<img src="${candidato.foto_url}" class="rounded-circle" style="width: 60px; height: 60px; object-fit: cover;" alt="${candidato.nombre}">`
                                    : iniciales
                                }
                            </div>
                            <div class="flex-grow-1 overflow-hidden">
                                <h5 class="card-title mb-1 text-truncate">${candidato.nombre}</h5>
                                <p class="text-muted small mb-0 text-truncate">${candidato.titulo_profesional || 'Profesional'}</p>
                            </div>
                        </div>

                        <!-- Información -->
                        <div class="mb-3">
                            ${candidato.ubicacion ? `
                                <div class="d-flex align-items-center mb-2">
                                    <i class="bi bi-geo-alt text-muted me-2"></i>
                                    <small class="text-truncate">${candidato.ubicacion}</small>
                                </div>
                            ` : ''}
                            ${candidato.anos_experiencia ? `
                                <div class="d-flex align-items-center mb-2">
                                    <i class="bi bi-briefcase text-muted me-2"></i>
                                    <small>${experiencia}</small>
                                </div>
                            ` : ''}
                            ${candidato.nivel_educacion ? `
                                <div class="d-flex align-items-center mb-2">
                                    <i class="bi bi-mortarboard text-muted me-2"></i>
                                    <small>${formatNivelEducacion(candidato.nivel_educacion)}</small>
                                </div>
                            ` : ''}
                        </div>

                        <!-- Resumen -->
                        ${candidato.resumen ? `
                            <p class="card-text small text-muted mb-3" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                                ${candidato.resumen}
                            </p>
                        ` : ''}

                        <!-- Habilidades -->
                        ${habilidades.length > 0 ? `
                            <div class="mb-3">
                                ${habilidades.slice(0, 3).map(hab =>
                                    `<span class="badge bg-secondary me-1 mb-1">${hab}</span>`
                                ).join('')}
                                ${habilidades.length > 3 ? `<span class="badge bg-light text-dark">+${habilidades.length - 3}</span>` : ''}
                            </div>
                        ` : ''}

                        <!-- Disponibilidad -->
                        ${candidato.disponibilidad ? `
                            <div class="mt-auto">
                                <span class="badge bg-success">
                                    <i class="bi bi-clock me-1"></i>${formatDisponibilidad(candidato.disponibilidad)}
                                </span>
                            </div>
                        ` : ''}
                    </div>
                    <div class="card-footer bg-transparent border-top">
                        <button class="btn btn-outline-primary btn-sm w-100" onclick="verCandidato(${candidato.candidato_id}); event.stopPropagation();">
                            <i class="bi bi-eye me-2"></i>Ver Perfil
                        </button>
                    </div>
                </div>
            `;

            row.appendChild(col);
        });

        // Renderizar paginación si es necesario
        if (candidatosFiltrados.length > candidatosPorPagina) {
            renderizarPaginacion();
        } else {
            document.getElementById('paginacion-container').style.display = 'none';
        }
    }

    /**
     * Obtiene las iniciales de un nombre
     * @param {string} nombre - Nombre completo
     * @returns {string} - Iniciales
     */
    function getIniciales(nombre) {
        if (!nombre) return '?';
        const partes = nombre.trim().split(' ');
        if (partes.length === 1) return partes[0][0].toUpperCase();
        return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
    }

    /**
     * Formatea años de experiencia
     * @param {number} anos - Años de experiencia
     * @returns {string} - Texto formateado
     */
    function formatExperiencia(anos) {
        if (!anos) return 'Sin experiencia';
        if (anos === 1) return '1 año de experiencia';
        return `${anos} años de experiencia`;
    }

    /**
     * Parsea habilidades (puede ser JSON string o array)
     * @param {string|array} habilidades - Habilidades
     * @returns {array} - Array de habilidades
     */
    function parseHabilidades(habilidades) {
        if (!habilidades) return [];
        if (Array.isArray(habilidades)) return habilidades;

        try {
            const parsed = JSON.parse(habilidades);
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            return habilidades.split(',').map(h => h.trim()).filter(h => h);
        }
    }

    /**
     * Formatea nivel de educación
     * @param {string} nivel - Nivel educativo
     * @returns {string} - Nivel formateado
     */
    function formatNivelEducacion(nivel) {
        const niveles = {
            'secundaria': 'Secundaria',
            'tecnico': 'Técnico',
            'universitario': 'Universitario',
            'posgrado': 'Posgrado',
            'doctorado': 'Doctorado'
        };
        return niveles[nivel] || nivel;
    }

    /**
     * Formatea disponibilidad
     * @param {string} disponibilidad - Disponibilidad
     * @returns {string} - Disponibilidad formateada
     */
    function formatDisponibilidad(disponibilidad) {
        const disponibilidades = {
            'inmediata': 'Disponible Ya',
            '2_semanas': '2 semanas',
            '1_mes': '1 mes',
            'negociable': 'Negociable'
        };
        return disponibilidades[disponibilidad] || disponibilidad;
    }

    /**
     * Renderiza la paginación
     */
    function renderizarPaginacion() {
        const totalPaginas = Math.ceil(candidatosFiltrados.length / candidatosPorPagina);
        const paginacionContainer = document.getElementById('paginacion-container');
        const paginacion = document.getElementById('paginacion');

        paginacionContainer.style.display = 'block';
        paginacion.innerHTML = '';

        // Botón anterior
        const prevLi = document.createElement('li');
        prevLi.className = `page-item ${paginaActual === 1 ? 'disabled' : ''}`;
        prevLi.innerHTML = `<a class="page-link" href="#" data-pagina="${paginaActual - 1}">Anterior</a>`;
        paginacion.appendChild(prevLi);

        // Números de página
        for (let i = 1; i <= totalPaginas; i++) {
            // Mostrar solo páginas cercanas
            if (i === 1 || i === totalPaginas || (i >= paginaActual - 2 && i <= paginaActual + 2)) {
                const li = document.createElement('li');
                li.className = `page-item ${i === paginaActual ? 'active' : ''}`;
                li.innerHTML = `<a class="page-link" href="#" data-pagina="${i}">${i}</a>`;
                paginacion.appendChild(li);
            } else if (i === paginaActual - 3 || i === paginaActual + 3) {
                const li = document.createElement('li');
                li.className = 'page-item disabled';
                li.innerHTML = '<a class="page-link" href="#">...</a>';
                paginacion.appendChild(li);
            }
        }

        // Botón siguiente
        const nextLi = document.createElement('li');
        nextLi.className = `page-item ${paginaActual === totalPaginas ? 'disabled' : ''}`;
        nextLi.innerHTML = `<a class="page-link" href="#" data-pagina="${paginaActual + 1}">Siguiente</a>`;
        paginacion.appendChild(nextLi);

        // Event listeners para paginación
        paginacion.querySelectorAll('.page-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const pagina = parseInt(e.target.dataset.pagina);
                if (pagina && pagina !== paginaActual && pagina >= 1 && pagina <= totalPaginas) {
                    paginaActual = pagina;
                    renderizarResultados();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            });
        });
    }

    /**
     * Ver detalle de candidato
     * @param {number} candidatoId - ID del candidato
     */
    window.verCandidato = function(candidatoId) {
        window.location.href = `/pages/empresa/detalle-candidato.html?id=${candidatoId}`;
    };

    /**
     * Limpia todos los filtros
     */
    function limpiarFiltros() {
        document.getElementById('filtro-buscar').value = '';
        document.getElementById('filtro-ubicacion').value = '';
        document.getElementById('filtro-nivel-educacion').value = '';
        document.getElementById('filtro-disponibilidad').value = '';
        document.getElementById('filtro-experiencia').value = '';
        document.getElementById('filtro-estado-civil').value = '';
        document.getElementById('filtro-genero').value = '';
        document.getElementById('filtro-ordenar').value = 'relevancia';
        buscarCandidatos();
    }

    /**
     * Muestra el loading
     */
    function mostrarLoading() {
        document.getElementById('loading').style.display = 'block';
        document.getElementById('resultados-container').innerHTML = '';
        document.getElementById('empty-state').style.display = 'none';
        document.getElementById('paginacion-container').style.display = 'none';
    }

    /**
     * Muestra el empty state
     */
    function mostrarEmpty() {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('resultados-container').innerHTML = '';
        document.getElementById('empty-state').style.display = 'block';
        document.getElementById('paginacion-container').style.display = 'none';
        document.getElementById('total-resultados').textContent = '0';
    }

    // Agregar estilos para hover en cards
    const style = document.createElement('style');
    style.textContent = `
        .hover-card {
            transition: transform 0.2s, box-shadow 0.2s;
        }
        .hover-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
        }
    `;
    document.head.appendChild(style);

    // Inicializar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
