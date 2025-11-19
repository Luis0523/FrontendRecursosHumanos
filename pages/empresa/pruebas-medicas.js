(function() {
    'use strict';

    AuthService.protectPage(CONFIG.ROLES.EMPRESA);

    let pruebas = [];
    let pruebasFiltradas = [];
    let modalSubirResultado = null;
    let pruebaActual = null;

    document.addEventListener('DOMContentLoaded', init);

    async function init() {
        modalSubirResultado = new bootstrap.Modal(document.getElementById('modalSubirResultado'));

        // Event listeners
        document.getElementById('filtro-buscar').addEventListener('input', aplicarFiltros);
        document.getElementById('filtro-resultado').addEventListener('change', aplicarFiltros);
        document.getElementById('filtro-estado').addEventListener('change', aplicarFiltros);
        document.getElementById('btn-limpiar').addEventListener('click', limpiarFiltros);
        document.getElementById('btn-guardar-resultado').addEventListener('click', guardarResultado);
        document.getElementById('resultado').addEventListener('change', toggleRestricciones);

        await cargarPruebas();
    }

    async function cargarPruebas() {
        try {
            const response = await ApiService.get('/pruebas-medicas');
            
            if (response.success) {
                pruebas = response.data || [];
                pruebasFiltradas = [...pruebas];
                renderizarPruebas();
            }
        } catch (error) {
            console.error('Error al cargar pruebas:', error);
            Helpers.showError('Error al cargar las pruebas médicas');
        }
    }

    function renderizarPruebas() {
        const tbody = document.getElementById('tbody-pruebas');

        if (pruebasFiltradas.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-4 text-muted">
                        <i class="bi bi-inbox fs-1"></i>
                        <p class="mt-2">No hay pruebas médicas registradas</p>
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
                    <td>${Helpers.formatDateShort(prueba.fecha_solicitud)}</td>
                    <td>${getEstadoBadge(prueba.estado)}</td>
                    <td>${getResultadoBadge(prueba.resultado)}</td>
                    <td>
                        ${prueba.porcentaje_aptitud !== null 
                            ? `<span class="badge bg-${getColorPorcentaje(prueba.porcentaje_aptitud)}">${prueba.porcentaje_aptitud}%</span>`
                            : '-'}
                    </td>
                    <td>
                        <div class="btn-group btn-group-sm">
                            ${prueba.documento_resultado_url 
                                ? `<a href="${prueba.documento_resultado_url}" target="_blank" class="btn btn-outline-primary" title="Ver PDF">
                                    <i class="bi bi-file-pdf"></i>
                                   </a>`
                                : ''}
                            <button class="btn btn-outline-success" onclick="abrirModalSubir(${prueba.id})" title="Subir resultado">
                                <i class="bi bi-upload"></i>
                            </button>
                            ${prueba.observaciones 
                                ? `<button class="btn btn-outline-info" onclick="verObservaciones(${prueba.id})" title="Ver observaciones">
                                    <i class="bi bi-eye"></i>
                                   </button>`
                                : ''}
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    window.abrirModalSubir = function(pruebaId) {
        pruebaActual = pruebas.find(p => p.id === pruebaId);
        if (!pruebaActual) return;

        document.getElementById('prueba-id').value = pruebaId;
        document.getElementById('form-resultado').reset();
        document.getElementById('div-restricciones').style.display = 'none';
        
        modalSubirResultado.show();
    };

    window.verObservaciones = function(pruebaId) {
        const prueba = pruebas.find(p => p.id === pruebaId);
        if (!prueba) return;

        Swal.fire({
            title: 'Observaciones',
            html: `
                <div class="text-start">
                    <p><strong>Observaciones:</strong></p>
                    <p>${prueba.observaciones || 'Sin observaciones'}</p>
                    ${prueba.restricciones ? `
                        <hr>
                        <p><strong>Restricciones:</strong></p>
                        <p>${prueba.restricciones}</p>
                    ` : ''}
                </div>
            `,
            icon: 'info',
            confirmButtonText: 'Cerrar'
        });
    };

    function toggleRestricciones() {
        const resultado = document.getElementById('resultado').value;
        const divRestricciones = document.getElementById('div-restricciones');
        
        if (resultado === 'apto_con_restricciones') {
            divRestricciones.style.display = 'block';
        } else {
            divRestricciones.style.display = 'none';
        }
    }

    async function guardarResultado() {
        try {
            const pruebaId = document.getElementById('prueba-id').value;
            const archivo = document.getElementById('archivo-pdf').files[0];
            const resultado = document.getElementById('resultado').value;
            const porcentaje = document.getElementById('porcentaje').value;
            const observaciones = document.getElementById('observaciones').value;
            const restricciones = document.getElementById('restricciones').value;

            if (!archivo) {
                Helpers.showWarning('Por favor selecciona un archivo PDF');
                return;
            }

            if (!resultado || !porcentaje) {
                Helpers.showWarning('Por favor completa todos los campos obligatorios');
                return;
            }

            document.getElementById('btn-guardar-resultado').disabled = true;

            // 1. Subir el PDF
            const formData = new FormData();
            formData.append('resultado', archivo);

            const uploadResponse = await fetch(`${CONFIG.API_URL}/pruebas-medicas/${pruebaId}/resultado`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${AuthService.getToken()}`
                },
                body: formData
            });

            if (!uploadResponse.ok) {
                throw new Error('Error al subir el archivo');
            }

            // 2. Actualizar los datos
            const updateResponse = await ApiService.put(`/pruebas-medicas/${pruebaId}/resultado`, {
                resultado,
                porcentaje_aptitud: parseInt(porcentaje),
                observaciones,
                restricciones: resultado === 'apto_con_restricciones' ? restricciones : null,
                fecha_resultado: new Date().toISOString().split('T')[0]
            });

            if (updateResponse.success) {
                Helpers.showSuccess('Resultado médico guardado exitosamente');
                modalSubirResultado.hide();
                await cargarPruebas();
            }
        } catch (error) {
            console.error('Error al guardar resultado:', error);
            Helpers.showError('Error al guardar el resultado médico');
        } finally {
            document.getElementById('btn-guardar-resultado').disabled = false;
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
            'pendiente': '<span class="badge bg-warning">Pendiente</span>',
            'realizada': '<span class="badge bg-info">Realizada</span>',
            'resultado_recibido': '<span class="badge bg-success">Resultado Recibido</span>'
        };
        return badges[estado] || '<span class="badge bg-secondary">N/A</span>';
    }

    function getResultadoBadge(resultado) {
        const badges = {
            'apto': '<span class="badge bg-success">Apto</span>',
            'no_apto': '<span class="badge bg-danger">No Apto</span>',
            'apto_con_restricciones': '<span class="badge bg-warning">Apto con Restricciones</span>',
            'pendiente': '<span class="badge bg-secondary">Pendiente</span>'
        };
        return badges[resultado] || '<span class="badge bg-secondary">-</span>';
    }

    function getColorPorcentaje(porcentaje) {
        if (porcentaje >= 80) return 'success';
        if (porcentaje >= 60) return 'warning';
        return 'danger';
    }
})();
