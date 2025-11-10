/**
 * Página: Gestionar Pruebas Psicométricas
 * Permite crear, editar y eliminar pruebas y preguntas
 */

(function() {
    'use strict';

    let pruebas = [];
    let pruebaSeleccionada = null;
    let preguntaEditando = null;
    let contadorOpciones = 0;

    // Modals
    let modalPrueba, modalPregunta;

    /**
     * Inicialización
     */
    document.addEventListener('DOMContentLoaded', function() {
        // Inicializar modals
        modalPrueba = new bootstrap.Modal(document.getElementById('modalPrueba'));
        modalPregunta = new bootstrap.Modal(document.getElementById('modalPregunta'));

        // Cargar pruebas
        cargarPruebas();

        // Event listeners
        document.getElementById('btn-nueva-prueba').addEventListener('click', () => abrirModalPrueba());
        document.getElementById('form-prueba').addEventListener('submit', guardarPrueba);
        document.getElementById('filtro-tipo').addEventListener('change', cargarPruebas);
        document.getElementById('filtro-estado').addEventListener('change', cargarPruebas);

        // Preguntas
        document.getElementById('btn-nueva-pregunta')?.addEventListener('click', () => abrirModalPregunta());
        document.getElementById('form-pregunta').addEventListener('submit', guardarPregunta);
        document.getElementById('pregunta-tipo').addEventListener('change', cambiarTipoPregunta);
        document.getElementById('btn-agregar-opcion').addEventListener('click', agregarOpcion);

        // Cuando se muestra el tab de preguntas
        document.getElementById('preguntas-tab').addEventListener('shown.bs.tab', () => {
            if (pruebaSeleccionada) {
                mostrarPreguntas(pruebaSeleccionada);
            }
        });
    });

    /**
     * Cargar lista de pruebas
     */
    async function cargarPruebas() {
        try {
            const filtros = {};
            const tipo = document.getElementById('filtro-tipo').value;
            const estado = document.getElementById('filtro-estado').value;

            if (tipo) filtros.tipo = tipo;
            if (estado !== '') filtros.activa = estado;

            const response = await PruebasService.obtenerPruebas(filtros);

            if (response.success) {
                pruebas = response.data || [];
                renderizarPruebas();
            }
        } catch (error) {
            Helpers.showError(error.message);
        }
    }

    /**
     * Renderizar lista de pruebas
     */
    function renderizarPruebas() {
        const container = document.getElementById('lista-pruebas');

        if (pruebas.length === 0) {
            container.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-info">
                        <i class="bi bi-info-circle"></i>
                        No hay pruebas registradas. Crea tu primera prueba usando el botón "Nueva Prueba".
                    </div>
                </div>
            `;
            return;
        }

        container.innerHTML = pruebas.map(prueba => `
            <div class="col-md-6 col-lg-4 mb-3">
                <div class="card h-100 ${prueba.estado !== 'activa' ? 'border-secondary' : ''}">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h5 class="card-title mb-0">${prueba.nombre}</h5>
                            ${prueba.estado !== 'activa' ? '<span class="badge bg-secondary">Inactiva</span>' : '<span class="badge bg-success">Activa</span>'}
                        </div>

                        <p class="card-text text-muted small mb-2">
                            ${prueba.descripcion || 'Sin descripción'}
                        </p>

                        <div class="mb-3">
                            <span class="badge bg-primary">${getTipoLabel(prueba.tipo)}</span>
                            ${prueba.duracion_minutos ? `<span class="badge bg-info"><i class="bi bi-clock"></i> ${prueba.duracion_minutos} min</span>` : ''}
                            <span class="badge bg-secondary"><i class="bi bi-question-circle"></i> ${prueba.preguntas?.length || 0} preguntas</span>
                        </div>

                        <div class="d-flex gap-2">
                            <button class="btn btn-sm btn-outline-primary flex-grow-1"
                                    onclick="window.verPreguntas(${prueba.id})">
                                <i class="bi bi-list-ul"></i> Preguntas
                            </button>
                            <button class="btn btn-sm btn-outline-secondary"
                                    onclick="window.editarPrueba(${prueba.id})">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger"
                                    onclick="window.eliminarPrueba(${prueba.id})">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </div>

                    <div class="card-footer bg-light text-muted small">
                        ${prueba.puntaje_minimo_aprobacion ? `Puntuación mínima: ${prueba.puntaje_minimo_aprobacion}` : 'Sin puntuación mínima'}
                    </div>
                </div>
            </div>
        `).join('');
    }

    /**
     * Obtener etiqueta del tipo de prueba
     */
    function getTipoLabel(tipo) {
        const tipos = {
            'cognitiva': 'Cognitiva',
            'personalidad': 'Personalidad',
            'habilidades': 'Habilidades',
            'conocimientos': 'Conocimientos'
        };
        return tipos[tipo] || tipo;
    }

    /**
     * Abrir modal para nueva prueba
     */
    function abrirModalPrueba(prueba = null) {
        document.getElementById('modalPruebaTitle').textContent = prueba ? 'Editar Prueba' : 'Nueva Prueba';
        document.getElementById('form-prueba').reset();

        if (prueba) {
            document.getElementById('prueba-id').value = prueba.id;
            document.getElementById('prueba-nombre').value = prueba.nombre;
            document.getElementById('prueba-descripcion').value = prueba.descripcion || '';
            document.getElementById('prueba-tipo').value = prueba.tipo;
            document.getElementById('prueba-duracion').value = prueba.duracion_minutos || '';
            document.getElementById('prueba-puntuacion-minima').value = prueba.puntaje_minimo_aprobacion || '';
            document.getElementById('prueba-activa').checked = prueba.estado === 'activa';
        } else {
            document.getElementById('prueba-id').value = '';
            document.getElementById('prueba-activa').checked = true;
        }

        modalPrueba.show();
    }

    /**
     * Guardar prueba (crear o actualizar)
     */
    async function guardarPrueba(e) {
        e.preventDefault();

        const data = {
            nombre: document.getElementById('prueba-nombre').value.trim(),
            descripcion: document.getElementById('prueba-descripcion').value.trim(),
            tipo: document.getElementById('prueba-tipo').value,
            duracion_minutos: parseInt(document.getElementById('prueba-duracion').value) || null,
            puntaje_minimo_aprobacion: parseFloat(document.getElementById('prueba-puntuacion-minima').value) || null,
            estado: document.getElementById('prueba-activa').checked ? 'activa' : 'inactiva'
        };

        const idPrueba = document.getElementById('prueba-id').value;

        try {
            const response = idPrueba
                ? await PruebasService.actualizarPrueba(idPrueba, data)
                : await PruebasService.crearPrueba(data);

            if (response.success) {
                Helpers.showSuccess(idPrueba ? 'Prueba actualizada correctamente' : 'Prueba creada correctamente');
                modalPrueba.hide();
                cargarPruebas();
            }
        } catch (error) {
            Helpers.showError(error.message);
        }
    }

    /**
     * Editar prueba
     */
    window.editarPrueba = async function(idPrueba) {
        try {
            const response = await PruebasService.obtenerPrueba(idPrueba);
            if (response.success) {
                abrirModalPrueba(response.data);
            }
        } catch (error) {
            Helpers.showError(error.message);
        }
    };

    /**
     * Eliminar prueba
     */
    window.eliminarPrueba = async function(idPrueba) {
        const confirmado = await Helpers.confirm(
            '¿Estás seguro de eliminar esta prueba?',
            'Se eliminarán también todas sus preguntas y opciones',
            'Eliminar'
        );

        if (confirmado) {
            try {
                const response = await PruebasService.eliminarPrueba(idPrueba);
                if (response.success) {
                    Helpers.showSuccess('Prueba eliminada correctamente');
                    cargarPruebas();
                    if (pruebaSeleccionada?.id === idPrueba) {
                        pruebaSeleccionada = null;
                        document.getElementById('preguntas-content').style.display = 'none';
                    }
                }
            } catch (error) {
                Helpers.showError(error.message);
            }
        }
    };

    /**
     * Ver preguntas de una prueba
     */
    window.verPreguntas = async function(idPrueba) {
        try {
            const response = await PruebasService.obtenerPrueba(idPrueba);
            if (response.success) {
                pruebaSeleccionada = response.data;
                mostrarPreguntas(pruebaSeleccionada);

                // Cambiar al tab de preguntas
                const preguntasTab = new bootstrap.Tab(document.getElementById('preguntas-tab'));
                preguntasTab.show();
            }
        } catch (error) {
            Helpers.showError(error.message);
        }
    };

    /**
     * Mostrar preguntas de la prueba seleccionada
     */
    function mostrarPreguntas(prueba) {
        document.getElementById('preguntas-content').style.display = 'block';
        document.getElementById('nombre-prueba').textContent = prueba.nombre;
        document.getElementById('pregunta-id-prueba').value = prueba.id;

        const container = document.getElementById('lista-preguntas');
        const preguntas = prueba.preguntas || [];

        if (preguntas.length === 0) {
            container.innerHTML = `
                <div class="alert alert-info">
                    <i class="bi bi-info-circle"></i>
                    Esta prueba no tiene preguntas. Usa el botón "Nueva Pregunta" para agregar.
                </div>
            `;
            return;
        }

        container.innerHTML = preguntas.map((pregunta, index) => `
            <div class="card mb-3">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <h6 class="mb-0">
                            <span class="badge bg-secondary me-2">#${index + 1}</span>
                            ${pregunta.texto_pregunta}
                        </h6>
                        <div>
                            <button class="btn btn-sm btn-outline-secondary"
                                    onclick="window.editarPregunta(${pregunta.id})">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger"
                                    onclick="window.eliminarPregunta(${pregunta.id})">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </div>

                    <div class="mb-2">
                        <span class="badge bg-info">${getTipoPreguntaLabel(pregunta.tipo_pregunta)}</span>
                        <span class="badge bg-success">${pregunta.puntaje_maximo || pregunta.puntos || 1} puntos</span>
                    </div>

                    ${renderizarOpciones(pregunta)}
                </div>
            </div>
        `).join('');
    }

    /**
     * Renderizar opciones de una pregunta
     */
    function renderizarOpciones(pregunta) {
        if (pregunta.tipo_pregunta === 'abierta') {
            return '<p class="text-muted small mb-0"><i>Respuesta abierta (evaluación manual)</i></p>';
        }

        const opciones = pregunta.opciones || [];
        if (opciones.length === 0) {
            return '<p class="text-muted small mb-0"><i>Sin opciones configuradas</i></p>';
        }

        return `
            <ul class="list-unstyled mb-0">
                ${opciones.map(opcion => `
                    <li class="mb-1">
                        ${opcion.es_correcta ? '<i class="bi bi-check-circle-fill text-success"></i>' : '<i class="bi bi-circle"></i>'}
                        ${opcion.texto_opcion}
                        ${opcion.valor_numerico !== null && opcion.valor_numerico !== undefined ? `<span class="badge bg-secondary ms-2">${opcion.valor_numerico}</span>` : ''}
                    </li>
                `).join('')}
            </ul>
        `;
    }

    /**
     * Obtener etiqueta del tipo de pregunta
     */
    function getTipoPreguntaLabel(tipo) {
        const tipos = {
            'opcion_multiple': 'Opción Múltiple',
            'verdadero_falso': 'Verdadero/Falso',
            'abierta': 'Abierta',
            'escala': 'Escala'
        };
        return tipos[tipo] || tipo;
    }

    /**
     * Abrir modal para nueva/editar pregunta
     */
    function abrirModalPregunta(pregunta = null) {
        document.getElementById('modalPreguntaTitle').textContent = pregunta ? 'Editar Pregunta' : 'Nueva Pregunta';
        document.getElementById('form-pregunta').reset();
        document.getElementById('lista-opciones').innerHTML = '';
        contadorOpciones = 0;

        if (pregunta) {
            preguntaEditando = pregunta;
            document.getElementById('pregunta-id').value = pregunta.id;
            document.getElementById('pregunta-texto').value = pregunta.texto_pregunta;
            document.getElementById('pregunta-tipo').value = pregunta.tipo_pregunta;
            document.getElementById('pregunta-puntos').value = pregunta.puntaje_maximo || pregunta.puntos || 1;
            document.getElementById('pregunta-id-prueba').value = pregunta.id_prueba;

            // Mostrar opciones si aplica
            cambiarTipoPregunta();

            if (pregunta.opciones && pregunta.opciones.length > 0) {
                pregunta.opciones.forEach(opcion => {
                    agregarOpcion(opcion);
                });
            }
        } else {
            preguntaEditando = null;
            document.getElementById('pregunta-id').value = '';
            document.getElementById('pregunta-puntos').value = '1';
            document.getElementById('opciones-container').style.display = 'none';
        }

        modalPregunta.show();
    }

    /**
     * Cambiar tipo de pregunta
     */
    function cambiarTipoPregunta() {
        const tipo = document.getElementById('pregunta-tipo').value;
        const container = document.getElementById('opciones-container');

        if (tipo === 'opcion_multiple' || tipo === 'verdadero_falso' || tipo === 'escala') {
            container.style.display = 'block';

            // Para verdadero/falso, agregar automáticamente las opciones
            if (tipo === 'verdadero_falso' && !preguntaEditando) {
                document.getElementById('lista-opciones').innerHTML = '';
                contadorOpciones = 0;
                agregarOpcion({ texto_opcion: 'Verdadero', es_correcta: false });
                agregarOpcion({ texto_opcion: 'Falso', es_correcta: false });
            }

            // Para escala, agregar opciones numéricas si no hay
            if (tipo === 'escala' && !preguntaEditando && contadorOpciones === 0) {
                document.getElementById('lista-opciones').innerHTML = '';
                contadorOpciones = 0;
                for (let i = 1; i <= 5; i++) {
                    agregarOpcion({ texto_opcion: `${i}`, valor_numerico: i, es_correcta: false });
                }
            }
        } else {
            container.style.display = 'none';
        }
    }

    /**
     * Agregar opción de respuesta
     */
    function agregarOpcion(opcion = null) {
        const tipo = document.getElementById('pregunta-tipo').value;
        const id = contadorOpciones++;
        const container = document.getElementById('lista-opciones');

        const opcionHtml = `
            <div class="card mb-2" data-opcion-id="${id}">
                <div class="card-body p-2">
                    <div class="row g-2">
                        <div class="col">
                            <input type="text" class="form-control form-control-sm opcion-texto"
                                   placeholder="Texto de la opción" value="${opcion?.texto_opcion || ''}" required>
                        </div>
                        ${tipo === 'escala' ? `
                            <div class="col-auto" style="width: 100px;">
                                <input type="number" class="form-control form-control-sm opcion-valor"
                                       placeholder="Valor" value="${opcion?.valor_numerico || ''}" step="0.1">
                            </div>
                        ` : ''}
                        <div class="col-auto">
                            <div class="form-check">
                                <input class="form-check-input opcion-correcta" type="${tipo === 'opcion_multiple' ? 'checkbox' : 'radio'}"
                                       name="opcion-correcta" ${opcion?.es_correcta ? 'checked' : ''}>
                                <label class="form-check-label small">Correcta</label>
                            </div>
                        </div>
                        <div class="col-auto">
                            <button type="button" class="btn btn-sm btn-outline-danger" onclick="this.closest('[data-opcion-id]').remove()">
                                <i class="bi bi-x"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        container.insertAdjacentHTML('beforeend', opcionHtml);
    }

    /**
     * Guardar pregunta
     */
    async function guardarPregunta(e) {
        e.preventDefault();

        const tipo = document.getElementById('pregunta-tipo').value;
        const data = {
            id_prueba: document.getElementById('pregunta-id-prueba').value,
            texto_pregunta: document.getElementById('pregunta-texto').value.trim(),
            tipo_pregunta: tipo,
            puntos: parseFloat(document.getElementById('pregunta-puntos').value) || 1
        };

        // Recopilar opciones si aplica
        if (tipo !== 'abierta') {
            const opciones = [];
            document.querySelectorAll('[data-opcion-id]').forEach(opcionEl => {
                const texto = opcionEl.querySelector('.opcion-texto').value.trim();
                if (texto) {
                    opciones.push({
                        texto_opcion: texto,
                        es_correcta: opcionEl.querySelector('.opcion-correcta').checked,
                        valor_numerico: opcionEl.querySelector('.opcion-valor')?.value || null
                    });
                }
            });

            if (opciones.length === 0) {
                Helpers.showWarning('Debes agregar al menos una opción de respuesta');
                return;
            }

            data.opciones = opciones;
        }

        const idPregunta = document.getElementById('pregunta-id').value;

        try {
            const response = idPregunta
                ? await PruebasService.actualizarPregunta(idPregunta, data)
                : await PruebasService.crearPregunta(data);

            if (response.success) {
                Helpers.showSuccess(idPregunta ? 'Pregunta actualizada' : 'Pregunta creada');
                modalPregunta.hide();
                // Recargar preguntas
                window.verPreguntas(data.id_prueba);
            }
        } catch (error) {
            Helpers.showError(error.message);
        }
    }

    /**
     * Editar pregunta
     */
    window.editarPregunta = async function(idPregunta) {
        const pregunta = pruebaSeleccionada.preguntas.find(p => p.id === idPregunta);
        if (pregunta) {
            abrirModalPregunta(pregunta);
        }
    };

    /**
     * Eliminar pregunta
     */
    window.eliminarPregunta = async function(idPregunta) {
        const confirmado = await Helpers.confirm(
            '¿Eliminar esta pregunta?',
            'Se eliminarán también todas sus opciones de respuesta',
            'Eliminar'
        );

        if (confirmado) {
            try {
                const response = await PruebasService.eliminarPregunta(idPregunta);
                if (response.success) {
                    Helpers.showSuccess('Pregunta eliminada');
                    window.verPreguntas(pruebaSeleccionada.id);
                }
            } catch (error) {
                Helpers.showError(error.message);
            }
        }
    };

})();
