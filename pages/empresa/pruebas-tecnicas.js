(function() {
    'use strict';

    AuthService.protectPage(CONFIG.ROLES.EMPRESA);

    let pruebas = [];
    let pruebasFiltradas = [];
    let modalEvaluar = null;

    document.addEventListener('DOMContentLoaded', init);

    async function init() {
        modalEvaluar = new bootstrap.Modal(document.getElementById('modalEvaluar'));

        // Event listeners
        document.getElementById('filtro-buscar').addEventListener('input', aplicarFiltros);
        document.getElementById('filtro-resultado').addEventListener('change', aplicarFiltros);
        document.getElementById('filtro-estado').addEventListener('change', aplicarFiltros);
        document.getElementById('btn-limpiar').addEventListener('click', limpiarFiltros);
        document.getElementById('btn-guardar-evaluacion').addEventListener('click', guardarEvaluacion);

        await cargarPruebas();
    }

    async function cargarPruebas() {
        try {
            const response = await ApiService.get('/pruebas-tecnicas');
            
            if (response.success) {
                pruebas = response.data || [];
                pruebasFiltradas = [...pruebas];
                renderizarPruebas();
            }
        } catch (error) {
            console.error('Error al cargar pruebas:', error);
            Helpers.showError('Error al cargar las pruebas técnicas');
        }
    }

    function renderizarPruebas() {
        const tbody = document.getElementById('tbody-pruebas');

        if (pruebasFiltradas.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-4 text-muted">
                        <i class="bi bi-inbox fs-1"></i>
                        <p class="mt-2">No hay pruebas técnicas registradas</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = pruebasFiltradas.map(prueba => {
            const candidato = prueba.candidato || {};
            const usuario = candidato.usuario || {};

            return `
                <tr>
                    <td>
                        <strong>${usuario.nombre || 'Sin nombre'}</strong><br>
                        <small class="text-muted">${usuario.email || ''}</small>
                    </td>
                    <td>${prueba.tipo_prueba || 'N/A'}</td>
                    <td>${Helpers.formatDateShort(prueba.fecha_asignacion)}</td>
                    <td>${getEstadoBadge(prueba.estado)}</td>
                    <td>${getResultadoBadge(prueba.resultado)}</td>
                    <td>
                        ${prueba.puntaje !== null 
                            ? `<span class="badge bg-${getColorPuntaje(prueba.puntaje)}">${prueba.puntaje}/100</span>`
                            : '-'}
                    </td>
                    <td>
                        <div class="btn-group btn-group-sm">
                            ${prueba.archivo_respuesta_url 
                                ? `<a href="${prueba.archivo_respuesta_url}" target="_blank" class="btn btn-outline-primary" title="Ver respuesta">
                                    <i class="bi bi-file-earmark"></i>
                                   </a>`
                                : ''}
                            ${prueba.archivo_evaluacion_url 
                                ? `<a href="${prueba.archivo_evaluacion_url}" target="_blank" class="btn btn-outline-success" title="Ver evaluación">
                                    <i class="bi bi-file-pdf"></i>
                                   </a>`
                                : ''}
                            ${prueba.estado === 'entregada' || prueba.estado === 'evaluada'
                                ? `<button class="btn btn-outline-warning" onclick="abrirModalEvaluar(${prueba.id})" title="Evaluar">
                                    <i class="bi bi-pencil-square"></i>
                                   </button>`
                                : ''}
                            ${prueba.comentarios_evaluador
                                ? `<button class="btn btn-outline-info" onclick="verDetalles(${prueba.id})" title="Ver detalles">
                                    <i class="bi bi-eye"></i>
                                   </button>`
                                : ''}
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    window.abrirModalEvaluar = function(pruebaId) {
        const prueba = pruebas.find(p => p.id === pruebaId);
        if (!prueba) return;

        document.getElementById('prueba-id').value = pruebaId;
        
        // Si ya tiene evaluación, pre-llenar el formulario
        if (prueba.puntaje !== null) {
            document.getElementById('puntaje').value = prueba.puntaje;
            document.getElementById('resultado').value = prueba.resultado || '';
            document.getElementById('comentarios').value = prueba.comentarios_evaluador || '';
            document.getElementById('aspectos-positivos').value = prueba.aspectos_positivos || '';
            document.getElementById('aspectos-negativos').value = prueba.aspectos_negativos || '';
        } else {
            document.getElementById('form-evaluacion').reset();
            document.getElementById('prueba-id').value = pruebaId;
        }
        
        modalEvaluar.show();
    };

    window.verDetalles = function(pruebaId) {
        const prueba = pruebas.find(p => p.id === pruebaId);
        if (!prueba) return;

        Swal.fire({
            title: 'Detalles de la Evaluación',
            html: `
                <div class="text-start">
                    <p><strong>Comentarios:</strong></p>
                    <p>${prueba.comentarios_evaluador || 'Sin comentarios'}</p>
                    ${prueba.aspectos_positivos ? `
                        <hr>
                        <p><strong>Aspectos Positivos:</strong></p>
                        <p>${prueba.aspectos_positivos}</p>
                    ` : ''}
                    ${prueba.aspectos_negativos ? `
                        <hr>
                        <p><strong>Aspectos a Mejorar:</strong></p>
                        <p>${prueba.aspectos_negativos}</p>
                    ` : ''}
                </div>
            `,
            icon: 'info',
            width: 600,
            confirmButtonText: 'Cerrar'
        });
    };

    async function guardarEvaluacion() {
        try {
            const pruebaId = document.getElementById('prueba-id').value;
            const archivo = document.getElementById('archivo-pdf').files[0];
            const resultado = document.getElementById('resultado').value;
            const puntaje = document.getElementById('puntaje').value;
            const comentarios = document.getElementById('comentarios').value;
            const aspectosPositivos = document.getElementById('aspectos-positivos').value;
            const aspectosNegativos = document.getElementById('aspectos-negativos').value;

            if (!resultado || !puntaje || !comentarios) {
                Helpers.showWarning('Por favor completa todos los campos obligatorios');
                return;
            }

            document.getElementById('btn-guardar-evaluacion').disabled = true;

            // 1. Si hay archivo, subirlo primero
            if (archivo) {
                const formData = new FormData();
                formData.append('evaluacion', archivo);
                formData.append('puntaje', puntaje);
                formData.append('resultado', resultado);
                formData.append('comentarios_evaluador', comentarios);

                const uploadResponse = await fetch(`${CONFIG.API_URL}/pruebas-tecnicas/${pruebaId}/evaluacion`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${AuthService.getToken()}`
                    },
                    body: formData
                });

                if (!uploadResponse.ok) {
                    throw new Error('Error al subir el archivo');
                }
            }

            // 2. Guardar/actualizar la evaluación
            const evalResponse = await ApiService.put(`/pruebas-tecnicas/${pruebaId}/evaluar`, {
                puntaje: parseFloat(puntaje),
                resultado,
                comentarios_evaluador: comentarios,
                aspectos_positivos: aspectosPositivos,
                aspectos_negativos: aspectosNegativos
            });

            if (evalResponse.success) {
                Helpers.showSuccess('Evaluación guardada exitosamente');
                modalEvaluar.hide();
                await cargarPruebas();
            }
        } catch (error) {
            console.error('Error al guardar evaluación:', error);
            Helpers.showError('Error al guardar la evaluación');
        } finally {
            document.getElementById('btn-guardar-evaluacion').disabled = false;
        }
    }

    function aplicarFiltros() {
        const buscar = document.getElementById('filtro-buscar').value.toLowerCase();
        const resultado = document.getElementById('filtro-resultado').value;
        const estado = document.getElementById('filtro-estado').value;

        pruebasFiltradas = pruebas.filter(prueba => {
            const candidato = prueba.candidato?.usuario?.nombre || '';
            const email = prueba.candidato?.usuario?.email || '';
            
            const matchBuscar = !buscar || candidato.toLowerCase().includes(buscar) || email.toLowerCase().includes(buscar);
            const matchResultado = !resultado || prueba.resultado === resultado;
            const matchEstado = !estado || prueba.estado === estado;

            return matchBuscar && matchResultado && matchEstado;
        });

        renderizarPruebas();
    }

    function limpiarFiltros() {
        document.getElementById('filtro-buscar').value = '';
        document.getElementById('filtro-resultado').value = '';
        document.getElementById('filtro-estado').value = '';
        pruebasFiltradas = [...pruebas];
        renderizarPruebas();
    }

    function getEstadoBadge(estado) {
        const badges = {
            'asignada': '<span class="badge bg-secondary">Asignada</span>',
            'en_progreso': '<span class="badge bg-info">En Progreso</span>',
            'entregada': '<span class="badge bg-warning">Entregada</span>',
            'evaluada': '<span class="badge bg-success">Evaluada</span>'
        };
        return badges[estado] || '<span class="badge bg-secondary">N/A</span>';
    }

    function getResultadoBadge(resultado) {
        const badges = {
            'aprobado': '<span class="badge bg-success">Aprobado</span>',
            'reprobado': '<span class="badge bg-danger">Reprobado</span>',
            'pendiente': '<span class="badge bg-secondary">Pendiente</span>'
        };
        return badges[resultado] || '<span class="badge bg-secondary">-</span>';
    }

    function getColorPuntaje(puntaje) {
        if (puntaje >= 70) return 'success';
        if (puntaje >= 50) return 'warning';
        return 'danger';
    }
})();
