(function() {
    'use strict';

    AuthService.protectPage(CONFIG.ROLES.EMPRESA);

    let empleados = [];
    let empleadosFiltrados = [];
    let modalImportarExcel, modalAgregarManual, modalCambiarEstado;
    let archivoExcel = null;

    document.addEventListener('DOMContentLoaded', init);

    async function init() {
        modalImportarExcel = new bootstrap.Modal(document.getElementById('modalImportarExcel'));
        modalAgregarManual = new bootstrap.Modal(document.getElementById('modalAgregarManual'));
        modalCambiarEstado = new bootstrap.Modal(document.getElementById('modalCambiarEstado'));

        // Event listeners
        document.getElementById('filtro-buscar').addEventListener('input', aplicarFiltros);
        document.getElementById('filtro-estado').addEventListener('change', aplicarFiltros);
        document.getElementById('filtro-departamento').addEventListener('change', aplicarFiltros);
        document.getElementById('btn-limpiar').addEventListener('click', limpiarFiltros);
        
        document.getElementById('archivo-excel').addEventListener('change', handleArchivoExcel);
        document.getElementById('btn-confirmar-importar').addEventListener('click', importarExcel);
        document.getElementById('btn-guardar-manual').addEventListener('click', guardarManual);
        document.getElementById('btn-confirmar-cambio-estado').addEventListener('click', confirmarCambioEstado);
        
        document.getElementById('nuevo-estado').addEventListener('change', function() {
            const camposBaja = document.getElementById('campos-baja');
            camposBaja.style.display = this.value === 'inactivo' ? 'block' : 'none';
        });

        await cargarEmpleados();
    }

    async function cargarEmpleados() {
        try {
            const response = await ApiService.get('/contrataciones/planilla');
            
            if (response.success) {
                empleados = response.data || [];
                empleadosFiltrados = [...empleados];
                renderizarEmpleados();
                actualizarEstadisticas();
                llenarFiltroDepartamentos();
            }
        } catch (error) {
            console.error('Error al cargar empleados:', error);
            Helpers.showError('Error al cargar la planilla');
        }
    }

    function renderizarEmpleados() {
        const tbody = document.getElementById('tbody-empleados');

        if (empleadosFiltrados.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center py-4 text-muted">
                        <i class="bi bi-inbox fs-1"></i>
                        <p class="mt-2">No hay empleados registrados</p>
                        <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#modalImportarExcel">
                            <i class="bi bi-file-earmark-excel"></i> Importar desde Excel
                        </button>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = empleadosFiltrados.map(emp => {
            const contratacion = emp.contratacion || {};
            const candidato = contratacion.candidato || {};
            const usuario = candidato.usuario || {};

            return `
                <tr>
                    <td><strong>${emp.codigo_empleado || 'Sin código'}</strong></td>
                    <td>
                        ${usuario.nombre || 'Sin nombre'}<br>
                        <small class="text-muted">${usuario.email || ''}</small>
                    </td>
                    <td>${contratacion.cargo || 'N/A'}</td>
                    <td>${contratacion.departamento || '-'}</td>
                    <td>Q ${parseFloat(contratacion.salario || 0).toFixed(2)}</td>
                    <td>${Helpers.formatDateShort(emp.fecha_ingreso_planilla)}</td>
                    <td>${getEstadoBadge(emp.estado)}</td>
                    <td>
                        <div class="btn-group btn-group-sm">
                            <button class="btn btn-outline-primary" onclick="verDetalle(${emp.id})" title="Ver detalles">
                                <i class="bi bi-eye"></i>
                            </button>
                            <button class="btn btn-outline-warning" onclick="abrirCambiarEstado(${emp.id})" title="Cambiar estado">
                                <i class="bi bi-arrow-repeat"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    function actualizarEstadisticas() {
        const total = empleados.length;
        const activos = empleados.filter(e => e.estado === 'activo').length;
        const vacaciones = empleados.filter(e => e.estado === 'vacaciones').length;
        const inactivos = empleados.filter(e => e.estado === 'inactivo').length;

        document.getElementById('stat-total').textContent = total;
        document.getElementById('stat-activos').textContent = activos;
        document.getElementById('stat-vacaciones').textContent = vacaciones;
        document.getElementById('stat-inactivos').textContent = inactivos;
    }

    function llenarFiltroDepartamentos() {
        const departamentos = [...new Set(empleados.map(e => e.contratacion?.departamento).filter(Boolean))];
        const select = document.getElementById('filtro-departamento');
        
        departamentos.forEach(dept => {
            const option = document.createElement('option');
            option.value = dept;
            option.textContent = dept;
            select.appendChild(option);
        });
    }

    function aplicarFiltros() {
        const buscar = document.getElementById('filtro-buscar').value.toLowerCase();
        const estado = document.getElementById('filtro-estado').value;
        const departamento = document.getElementById('filtro-departamento').value;

        empleadosFiltrados = empleados.filter(emp => {
            const contratacion = emp.contratacion || {};
            const candidato = contratacion.candidato || {};
            const usuario = candidato.usuario || {};
            
            const matchBuscar = !buscar || 
                (usuario.nombre || '').toLowerCase().includes(buscar) ||
                (emp.codigo_empleado || '').toLowerCase().includes(buscar) ||
                (contratacion.cargo || '').toLowerCase().includes(buscar);
            
            const matchEstado = !estado || emp.estado === estado;
            const matchDepartamento = !departamento || contratacion.departamento === departamento;

            return matchBuscar && matchEstado && matchDepartamento;
        });

        renderizarEmpleados();
    }

    function limpiarFiltros() {
        document.getElementById('filtro-buscar').value = '';
        document.getElementById('filtro-estado').value = '';
        document.getElementById('filtro-departamento').value = '';
        empleadosFiltrados = [...empleados];
        renderizarEmpleados();
    }

    // ========== IMPORTAR EXCEL ==========
    function handleArchivoExcel(e) {
        const file = e.target.files[0];
        if (!file) return;

        archivoExcel = file;

        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(firstSheet);

                mostrarVistaPrevia(jsonData.slice(0, 5));
            } catch (error) {
                console.error('Error al leer Excel:', error);
                Helpers.showError('Error al leer el archivo Excel');
            }
        };
        reader.readAsArrayBuffer(file);
    }

    function mostrarVistaPrevia(data) {
        if (data.length === 0) return;

        const preview = document.getElementById('preview-excel');
        preview.classList.remove('d-none');

        const thead = document.getElementById('preview-thead');
        const tbody = document.getElementById('preview-tbody');

        // Cabeceras
        const columns = Object.keys(data[0]);
        thead.innerHTML = '<tr>' + columns.map(col => `<th>${col}</th>`).join('') + '</tr>';

        // Filas
        tbody.innerHTML = data.map(row => {
            return '<tr>' + columns.map(col => `<td>${row[col] || ''}</td>`).join('') + '</tr>';
        }).join('');
    }

    async function importarExcel() {
        if (!archivoExcel) {
            Helpers.showWarning('Por favor selecciona un archivo Excel');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('excel', archivoExcel);

            Helpers.showLoader('Importando empleados...');

            const response = await fetch(`${CONFIG.API_URL}/contrataciones/importar-excel`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${AuthService.getToken()}`
                },
                body: formData
            });

            const result = await response.json();

            Helpers.hideLoader();

            if (result.success) {
                const msg = `
                    <strong>Importación completada:</strong><br>
                    ✅ Exitosos: ${result.data.exitosos}<br>
                    ${result.data.fallidos > 0 ? `❌ Fallidos: ${result.data.fallidos}` : ''}
                `;

                if (result.data.errores && result.data.errores.length > 0) {
                    const errores = result.data.errores.map(e => `Fila ${e.fila}: ${e.error}`).join('<br>');
                    Swal.fire({
                        icon: 'info',
                        title: 'Resultados de Importación',
                        html: msg + '<br><br><strong>Errores:</strong><br>' + errores,
                        width: 600
                    });
                } else {
                    Helpers.showSuccess(msg);
                }

                modalImportarExcel.hide();
                await cargarEmpleados();
            } else {
                Helpers.showError(result.message || 'Error al importar');
            }
        } catch (error) {
            console.error('Error al importar:', error);
            Helpers.showError('Error al importar empleados');
        }
    }

    // ========== AGREGAR MANUAL ==========
    async function guardarManual() {
        try {
            const nombre = document.getElementById('manual-nombre').value.trim();
            const email = document.getElementById('manual-email').value.trim();
            const cargo = document.getElementById('manual-cargo').value.trim();
            const salario = document.getElementById('manual-salario').value;
            const fechaInicio = document.getElementById('manual-fecha-inicio').value;
            const departamento = document.getElementById('manual-departamento').value.trim();
            const tipoContrato = document.getElementById('manual-tipo-contrato').value;
            const mesesPrueba = document.getElementById('manual-meses-prueba').value;
            const enPlanilla = document.getElementById('manual-en-planilla').checked;

            if (!nombre || !email || !cargo || !salario || !fechaInicio) {
                Helpers.showWarning('Por favor completa todos los campos requeridos');
                return;
            }

            // Simular importación de un solo empleado
            const formData = new FormData();
            const blob = crearExcelUnEmpleado({
                nombre, email, cargo, salario, fecha_inicio: fechaInicio,
                departamento, tipo_contrato: tipoContrato, meses_prueba: mesesPrueba,
                en_planilla: enPlanilla ? 'SI' : 'NO'
            });
            formData.append('excel', blob, 'empleado.xlsx');

            const response = await fetch(`${CONFIG.API_URL}/contrataciones/importar-excel`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${AuthService.getToken()}`
                },
                body: formData
            });

            const result = await response.json();

            if (result.success && result.data.exitosos > 0) {
                Helpers.showSuccess('Empleado agregado exitosamente');
                modalAgregarManual.hide();
                document.getElementById('form-agregar-manual').reset();
                await cargarEmpleados();
            } else {
                const error = result.data.errores && result.data.errores[0] ? result.data.errores[0].error : 'Error al agregar';
                Helpers.showError(error);
            }
        } catch (error) {
            console.error('Error al agregar empleado:', error);
            Helpers.showError('Error al agregar empleado');
        }
    }

    function crearExcelUnEmpleado(data) {
        const ws = XLSX.utils.json_to_sheet([data]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Empleados');
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        return new Blob([wbout], { type: 'application/octet-stream' });
    }

    // ========== CAMBIAR ESTADO ==========
    window.abrirCambiarEstado = function(empleadoId) {
        const empleado = empleados.find(e => e.id === empleadoId);
        if (!empleado) return;

        document.getElementById('estado-empleado-id').value = empleadoId;
        document.getElementById('nuevo-estado').value = empleado.estado;
        document.getElementById('campos-baja').style.display = 'none';
        
        modalCambiarEstado.show();
    };

    async function confirmarCambioEstado() {
        try {
            const empleadoId = document.getElementById('estado-empleado-id').value;
            const nuevoEstado = document.getElementById('nuevo-estado').value;
            const motivoBaja = document.getElementById('motivo-baja').value;
            const observacionesBaja = document.getElementById('observaciones-baja').value;

            const data = {
                estado: nuevoEstado
            };

            if (nuevoEstado === 'inactivo') {
                data.fecha_baja = new Date().toISOString().split('T')[0];
                data.motivo_baja = motivoBaja;
                data.observaciones_baja = observacionesBaja;
            }

            const response = await ApiService.put(`/contrataciones/planilla/${empleadoId}`, data);

            if (response.success) {
                Helpers.showSuccess('Estado actualizado correctamente');
                modalCambiarEstado.hide();
                await cargarEmpleados();
            }
        } catch (error) {
            console.error('Error al cambiar estado:', error);
            Helpers.showError('Error al cambiar estado');
        }
    }

    // ========== VER DETALLE ==========
    window.verDetalle = function(empleadoId) {
        const empleado = empleados.find(e => e.id === empleadoId);
        if (!empleado) return;

        const contratacion = empleado.contratacion || {};
        const candidato = contratacion.candidato || {};
        const usuario = candidato.usuario || {};

        Swal.fire({
            title: usuario.nombre || 'Empleado',
            html: `
                <div class="text-start">
                    <p><strong>Código:</strong> ${empleado.codigo_empleado || 'Sin código'}</p>
                    <p><strong>Email:</strong> ${usuario.email || 'N/A'}</p>
                    <p><strong>Cargo:</strong> ${contratacion.cargo || 'N/A'}</p>
                    <p><strong>Departamento:</strong> ${contratacion.departamento || 'N/A'}</p>
                    <p><strong>Salario:</strong> Q ${parseFloat(contratacion.salario || 0).toFixed(2)}</p>
                    <p><strong>Ingreso a Planilla:</strong> ${Helpers.formatDateShort(empleado.fecha_ingreso_planilla)}</p>
                    <p><strong>Estado:</strong> ${getEstadoBadge(empleado.estado)}</p>
                    <p><strong>Vacaciones:</strong> ${empleado.dias_vacaciones_tomados}/${empleado.dias_vacaciones_anuales} días</p>
                </div>
            `,
            icon: 'info',
            width: 600
        });
    };

    function getEstadoBadge(estado) {
        const badges = {
            'activo': '<span class="badge bg-success">Activo</span>',
            'vacaciones': '<span class="badge bg-warning">Vacaciones</span>',
            'licencia': '<span class="badge bg-info">Licencia</span>',
            'suspendido': '<span class="badge bg-danger">Suspendido</span>',
            'inactivo': '<span class="badge bg-secondary">Inactivo</span>'
        };
        return badges[estado] || '<span class="badge bg-secondary">N/A</span>';
    }
})();
