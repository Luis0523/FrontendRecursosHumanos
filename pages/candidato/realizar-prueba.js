/**
 * Página: Realizar Prueba Psicométrica
 * Permite al candidato tomar una prueba asignada
 */

(function() {
    'use strict';

    // Proteger la página - solo candidatos
    AuthService.protectPage(CONFIG.ROLES.CANDIDATO);

    // Variables globales
    let idAsignacion = null;
    let prueba = null;
    let preguntas = [];
    let preguntaActual = 0;
    let respuestas = {}; // { id_pregunta: { id_opcion, texto_respuesta } }
    let timerInterval = null;
    let tiempoRestante = 0; // en segundos

    /**
     * Inicialización
     */
    document.addEventListener('DOMContentLoaded', async function() {
        // Obtener ID de asignación de la URL
        idAsignacion = Helpers.getURLParameter('id');

        if (!idAsignacion) {
            Helpers.showError('No se especificó la prueba a realizar');
            setTimeout(() => {
                window.location.href = '/pages/candidato/pruebas.html';
            }, 2000);
            return;
        }

        // Cargar la prueba
        await cargarPrueba();

        // Event listeners
        document.getElementById('btn-comenzar').addEventListener('click', comenzarPrueba);
        document.getElementById('btn-anterior').addEventListener('click', preguntaAnterior);
        document.getElementById('btn-siguiente').addEventListener('click', preguntaSiguiente);
        document.getElementById('btn-finalizar').addEventListener('click', finalizarPrueba);

        // Prevenir salida accidental
        window.addEventListener('beforeunload', (e) => {
            if (prueba && !prueba.finalizada) {
                e.preventDefault();
                e.returnValue = '';
            }
        });
    });

    /**
     * Cargar la prueba y sus preguntas
     */
    async function cargarPrueba() {
        try {
            const response = await PruebasService.obtenerPruebaCompleta(idAsignacion);

            if (response.success) {
                prueba = response.data;
                preguntas = prueba.prueba?.preguntas || [];

                if (preguntas.length === 0) {
                    throw new Error('Esta prueba no tiene preguntas configuradas');
                }

                // Verificar si ya fue completada
                if (prueba.estado === 'completada' || prueba.fecha_completado) {
                    Helpers.showWarning('Esta prueba ya fue completada');
                    setTimeout(() => {
                        window.location.href = '/pages/candidato/pruebas.html';
                    }, 2000);
                    return;
                }

                // Verificar si está expirada
                if (prueba.fecha_limite && new Date(prueba.fecha_limite) < new Date()) {
                    Helpers.showError('Esta prueba ha expirado');
                    setTimeout(() => {
                        window.location.href = '/pages/candidato/pruebas.html';
                    }, 2000);
                    return;
                }

                mostrarInstrucciones();
                document.getElementById('loading').classList.add('d-none');
            } else {
                throw new Error(response.message || 'Error al cargar la prueba');
            }
        } catch (error) {
            console.error('Error al cargar prueba:', error);
            Helpers.showError(error.message || 'Error al cargar la prueba');
            setTimeout(() => {
                window.location.href = '/pages/candidato/pruebas.html';
            }, 2000);
        }
    }

    /**
     * Mostrar instrucciones de la prueba
     */
    function mostrarInstrucciones() {
        document.getElementById('prueba-titulo').textContent = prueba.prueba?.nombre || 'Prueba';

        const contenido = `
            <p class="lead">${prueba.prueba?.descripcion || 'Completa esta prueba lo mejor que puedas.'}</p>

            <div class="row mt-4">
                <div class="col-md-4">
                    <div class="text-center p-3 bg-light rounded">
                        <i class="bi bi-question-circle fs-3 text-primary"></i>
                        <h6 class="mt-2">Total de Preguntas</h6>
                        <strong>${preguntas.length}</strong>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="text-center p-3 bg-light rounded">
                        <i class="bi bi-clock fs-3 text-primary"></i>
                        <h6 class="mt-2">Duración</h6>
                        <strong>${prueba.prueba?.duracion_minutos || 'Sin límite'} ${prueba.prueba?.duracion_minutos ? 'minutos' : ''}</strong>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="text-center p-3 bg-light rounded">
                        <i class="bi bi-star fs-3 text-primary"></i>
                        <h6 class="mt-2">Puntuación Mínima</h6>
                        <strong>${prueba.prueba?.puntuacion_minima || 'N/A'}</strong>
                    </div>
                </div>
            </div>

            ${prueba.instrucciones ? `
                <div class="alert alert-info mt-4">
                    <strong>Instrucciones especiales:</strong><br>
                    ${prueba.instrucciones}
                </div>
            ` : ''}
        `;

        document.getElementById('instrucciones-content').innerHTML = contenido;
        document.getElementById('instrucciones-container').classList.remove('d-none');
    }

    /**
     * Comenzar la prueba
     */
    function comenzarPrueba() {
        document.getElementById('instrucciones-container').classList.add('d-none');
        document.getElementById('prueba-container').classList.remove('d-none');

        // Iniciar temporizador si la prueba tiene duración
        if (prueba.prueba?.duracion_minutos) {
            tiempoRestante = prueba.prueba.duracion_minutos * 60; // convertir a segundos
            document.getElementById('timer-container').classList.remove('d-none');
            iniciarTemporizador();
        }

        // Crear indicadores de progreso
        crearIndicadoresProgreso();

        // Mostrar primera pregunta
        mostrarPregunta(0);
    }

    /**
     * Iniciar temporizador
     */
    function iniciarTemporizador() {
        actualizarTemporizador();

        timerInterval = setInterval(() => {
            tiempoRestante--;
            actualizarTemporizador();

            // Tiempo agotado
            if (tiempoRestante <= 0) {
                clearInterval(timerInterval);
                Helpers.showWarning('Tiempo agotado. La prueba se finalizará automáticamente.');
                setTimeout(() => {
                    finalizarPrueba(true);
                }, 2000);
            }
        }, 1000);
    }

    /**
     * Actualizar display del temporizador
     */
    function actualizarTemporizador() {
        const minutos = Math.floor(tiempoRestante / 60);
        const segundos = tiempoRestante % 60;
        const display = `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;

        const timerElement = document.getElementById('timer');
        timerElement.textContent = display;

        // Advertencia cuando quedan 5 minutos
        if (tiempoRestante <= 300 && tiempoRestante > 0) {
            timerElement.classList.add('timer-warning');
        }
    }

    /**
     * Crear indicadores de progreso
     */
    function crearIndicadoresProgreso() {
        const container = document.getElementById('progress-dots');
        container.innerHTML = '';

        preguntas.forEach((pregunta, index) => {
            const dot = document.createElement('div');
            dot.className = 'progress-dot';
            dot.textContent = index + 1;
            dot.onclick = () => mostrarPregunta(index);
            container.appendChild(dot);
        });
    }

    /**
     * Actualizar progreso
     */
    function actualizarProgreso() {
        const respondidas = Object.keys(respuestas).length;
        const total = preguntas.length;
        const porcentaje = Math.round((respondidas / total) * 100);

        document.getElementById('progreso-texto').textContent = `${respondidas}/${total}`;
        document.getElementById('progreso-badge').textContent = `${porcentaje}%`;
        document.getElementById('progreso-bar').style.width = `${porcentaje}%`;

        // Actualizar dots
        const dots = document.querySelectorAll('.progress-dot');
        dots.forEach((dot, index) => {
            dot.classList.remove('current', 'answered');

            if (index === preguntaActual) {
                dot.classList.add('current');
            } else if (respuestas[preguntas[index].id]) {
                dot.classList.add('answered');
            }
        });
    }

    /**
     * Mostrar pregunta
     */
    function mostrarPregunta(index) {
        if (index < 0 || index >= preguntas.length) return;

        preguntaActual = index;
        const pregunta = preguntas[index];

        // Actualizar número y texto
        document.getElementById('numero-pregunta').textContent = index + 1;
        document.getElementById('texto-pregunta').textContent = pregunta.texto_pregunta;

        // Badge de tipo
        document.getElementById('tipo-pregunta-badge').innerHTML = getTipoBadge(pregunta.tipo_pregunta);

        // Renderizar opciones según tipo
        renderizarOpciones(pregunta);

        // Botones de navegación
        document.getElementById('btn-anterior').disabled = (index === 0);
        document.getElementById('btn-siguiente').disabled = (index === preguntas.length - 1);

        // Actualizar progreso
        actualizarProgreso();

        // Scroll al inicio
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    /**
     * Obtener badge del tipo de pregunta
     */
    function getTipoBadge(tipo) {
        const tipos = {
            'opcion_multiple': '<span class="badge bg-primary">Opción Múltiple</span>',
            'verdadero_falso': '<span class="badge bg-success">Verdadero/Falso</span>',
            'abierta': '<span class="badge bg-info">Respuesta Abierta</span>',
            'escala': '<span class="badge bg-warning">Escala</span>'
        };
        return tipos[tipo] || '';
    }

    /**
     * Renderizar opciones según tipo de pregunta
     */
    function renderizarOpciones(pregunta) {
        const container = document.getElementById('opciones-container');
        const respuestaGuardada = respuestas[pregunta.id];

        if (pregunta.tipo_pregunta === 'abierta') {
            // Respuesta abierta - Textarea
            container.innerHTML = `
                <div class="mb-3">
                    <label class="form-label fw-bold">Tu respuesta:</label>
                    <textarea class="form-control" id="respuesta-abierta" rows="5"
                              placeholder="Escribe tu respuesta aquí...">${respuestaGuardada?.texto_respuesta || ''}</textarea>
                    <div class="form-text">Esta respuesta será evaluada manualmente por el reclutador.</div>
                </div>
                <button class="btn btn-primary" onclick="window.guardarRespuestaAbierta()">
                    <i class="bi bi-save"></i> Guardar Respuesta
                </button>
            `;
        } else if (pregunta.tipo_pregunta === 'escala') {
            // Escala - Botones numéricos
            const opciones = pregunta.opciones || [];
            container.innerHTML = `
                <label class="form-label fw-bold mb-3">Selecciona un valor:</label>
                <div class="scale-options">
                    ${opciones.map(opcion => `
                        <div class="scale-option ${respuestaGuardada?.id_opcion === opcion.id ? 'selected' : ''}"
                             onclick="window.seleccionarOpcion(${pregunta.id}, ${opcion.id})">
                            ${opcion.valor_numerico || opcion.texto_opcion}
                        </div>
                    `).join('')}
                </div>
                <div class="text-center mt-3 text-muted small">
                    <span>Menor</span>
                    <span class="mx-5">⟷</span>
                    <span>Mayor</span>
                </div>
            `;
        } else {
            // Opción múltiple o Verdadero/Falso
            const opciones = pregunta.opciones || [];
            container.innerHTML = `
                <div class="mb-3">
                    <label class="form-label fw-bold">Selecciona una opción:</label>
                    ${opciones.map(opcion => `
                        <div class="option-card p-3 mb-2 rounded ${respuestaGuardada?.id_opcion === opcion.id ? 'selected' : ''}"
                             onclick="window.seleccionarOpcion(${pregunta.id}, ${opcion.id})">
                            <div class="form-check">
                                <input class="form-check-input" type="radio" name="opcion-${pregunta.id}"
                                       ${respuestaGuardada?.id_opcion === opcion.id ? 'checked' : ''}>
                                <label class="form-check-label w-100">
                                    ${opcion.texto_opcion}
                                </label>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }
    }

    /**
     * Seleccionar opción (opción múltiple, verdadero/falso, escala)
     */
    window.seleccionarOpcion = async function(idPregunta, idOpcion) {
        // Guardar localmente
        respuestas[idPregunta] = {
            id_opcion: idOpcion,
            texto_respuesta: null
        };

        // Guardar en backend
        await guardarRespuesta(idPregunta, idOpcion, null);

        // Actualizar UI
        mostrarPregunta(preguntaActual);
        mostrarAutoSave();
    };

    /**
     * Guardar respuesta abierta
     */
    window.guardarRespuestaAbierta = async function() {
        const pregunta = preguntas[preguntaActual];
        const texto = document.getElementById('respuesta-abierta').value.trim();

        if (!texto) {
            Helpers.showWarning('Por favor escribe una respuesta');
            return;
        }

        // Guardar localmente
        respuestas[pregunta.id] = {
            id_opcion: null,
            texto_respuesta: texto
        };

        // Guardar en backend
        await guardarRespuesta(pregunta.id, null, texto);

        mostrarAutoSave();
        actualizarProgreso();
    };

    /**
     * Guardar respuesta en el backend
     */
    async function guardarRespuesta(idPregunta, idOpcion, textoRespuesta) {
        try {
            const data = {
                id_asignacion: parseInt(idAsignacion),
                id_pregunta: idPregunta,
                id_opcion_seleccionada: idOpcion,
                respuesta_texto: textoRespuesta
            };

            await PruebasService.guardarRespuesta(data);
        } catch (error) {
            console.error('Error al guardar respuesta:', error);
            Helpers.showError('Error al guardar la respuesta. Por favor intenta nuevamente.');
        }
    }

    /**
     * Mostrar indicador de auto-guardado
     */
    function mostrarAutoSave() {
        const alert = document.getElementById('alert-auto-save');
        alert.classList.remove('d-none');
        setTimeout(() => {
            alert.classList.add('d-none');
        }, 2000);
    }

    /**
     * Pregunta anterior
     */
    function preguntaAnterior() {
        if (preguntaActual > 0) {
            mostrarPregunta(preguntaActual - 1);
        }
    }

    /**
     * Pregunta siguiente
     */
    function preguntaSiguiente() {
        if (preguntaActual < preguntas.length - 1) {
            mostrarPregunta(preguntaActual + 1);
        }
    }

    /**
     * Finalizar prueba
     */
    async function finalizarPrueba(porTiempo = false) {
        const respondidas = Object.keys(respuestas).length;
        const total = preguntas.length;

        if (!porTiempo && respondidas < total) {
            const confirmar = await Helpers.confirm(
                '¿Finalizar prueba?',
                `Has respondido ${respondidas} de ${total} preguntas. Las preguntas sin responder se contarán como incorrectas.`,
                'Sí, finalizar'
            );

            if (!confirmar) return;
        }

        try {
            // Detener temporizador
            if (timerInterval) {
                clearInterval(timerInterval);
            }

            // Finalizar en el backend
            const response = await PruebasService.finalizarPrueba(idAsignacion);

            if (response.success) {
                await Swal.fire({
                    icon: 'success',
                    title: '¡Prueba completada!',
                    text: 'Tu prueba ha sido enviada exitosamente.',
                    confirmButtonText: 'Ver resultados'
                });

                // Redirigir a resultados
                window.location.href = `/pages/candidato/pruebas.html`;
            }
        } catch (error) {
            console.error('Error al finalizar prueba:', error);
            Helpers.showError(error.message || 'Error al finalizar la prueba');
        }
    }

})();
