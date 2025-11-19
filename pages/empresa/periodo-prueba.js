// Variables globales
let empleadosData = [];
let modalFinalizarPeriodo;

// Inicializar
document.addEventListener('DOMContentLoaded', async () => {
    modalFinalizarPeriodo = new bootstrap.Modal(document.getElementById('modalFinalizarPeriodo'));
    await cargarEmpleados();
});

/**
 * Cargar empleados en periodo de prueba
 */
async function cargarEmpleados() {
    try {
        document.getElementById('loading').classList.remove('d-none');
        document.getElementById('sin-empleados').classList.add('d-none');
        document.getElementById('tabla-empleados').classList.add('d-none');

        const response = await ApiService.get('/contrataciones/periodo-prueba');
        empleadosData = Array.isArray(response) ? response : [];

        if (empleadosData.length === 0) {
            document.getElementById('sin-empleados').classList.remove('d-none');
        } else {
            renderizarEmpleados();
            document.getElementById('tabla-empleados').classList.remove('d-none');
        }

        actualizarEstadisticas();

    } catch (error) {
        console.error('Error al cargar empleados:', error);
        Swal.fire('Error', 'No se pudieron cargar los empleados en periodo de prueba', 'error');
    } finally {
        document.getElementById('loading').classList.add('d-none');
    }
}

/**
 * Renderizar tabla de empleados
 */
function renderizarEmpleados() {
    const tbody = document.getElementById('tbody-empleados');
    tbody.innerHTML = '';

    empleadosData.forEach(empleado => {
        const tr = document.createElement('tr');
        
        const nombre = empleado.contratacion?.candidato?.usuario?.nombre || 'N/A';
        const cargo = empleado.contratacion?.cargo || 'N/A';
        const fechaIngreso = Helpers.formatearFecha(empleado.fecha_ingreso_planilla);
        const fechaFin = Helpers.formatearFecha(empleado.contratacion?.fecha_fin_periodo_prueba);
        const diasRestantes = empleado.diasRestantes || 0;
        const progreso = empleado.progreso || 0;

        // Determinar color según días restantes
        let badgeClass = 'success';
        if (diasRestantes <= 7) badgeClass = 'danger';
        else if (diasRestantes <= 15) badgeClass = 'warning';

        // Determinar color de la barra de progreso
        let progressClass = 'bg-success';
        if (progreso >= 80) progressClass = 'bg-warning';
        if (progreso >= 90) progressClass = 'bg-danger';

        tr.innerHTML = `
            <td>
                <div class="fw-bold">${nombre}</div>
                <small class="text-muted">${empleado.contratacion.candidato.usuario.email}</small>
            </td>
            <td>${cargo}</td>
            <td>${fechaIngreso}</td>
            <td>${fechaFin}</td>
            <td>
                <span class="badge bg-${badgeClass}">
                    ${diasRestantes} día${diasRestantes !== 1 ? 's' : ''}
                </span>
            </td>
            <td>
                <div class="progress" style="height: 25px;">
                    <div class="progress-bar ${progressClass}" role="progressbar" 
                         style="width: ${progreso}%" aria-valuenow="${progreso}" 
                         aria-valuemin="0" aria-valuemax="100">
                        ${progreso}%
                    </div>
                </div>
            </td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="abrirModalFinalizar(${empleado.id}, '${nombre}', '${cargo}')" 
                        title="Finalizar periodo de prueba">
                    <i class="bi bi-check-circle"></i> Finalizar
                </button>
            </td>
        `;

        tbody.appendChild(tr);
    });
}

/**
 * Actualizar estadísticas
 */
function actualizarEstadisticas() {
    const totalEmpleados = empleadosData.length;
    const proximosVencer = empleadosData.filter(e => e.diasRestantes <= 15).length;

    document.getElementById('total-empleados').textContent = totalEmpleados;
    document.getElementById('proximos-vencer').textContent = proximosVencer;
    
    // Por ahora dejamos en 0 hasta que tengamos datos históricos
    document.getElementById('aprobados-mes').textContent = '0';
    document.getElementById('rechazados-mes').textContent = '0';
}

/**
 * Abrir modal para finalizar periodo
 */
function abrirModalFinalizar(empleadoId, nombre, cargo) {
    document.getElementById('empleado-id').value = empleadoId;
    document.getElementById('empleado-nombre').textContent = nombre;
    document.getElementById('empleado-cargo').textContent = cargo;
    document.getElementById('observaciones').value = '';
    
    // Resetear radio buttons
    document.getElementById('aprobar').checked = false;
    document.getElementById('rechazar').checked = false;

    modalFinalizarPeriodo.show();
}

/**
 * Confirmar finalización del periodo de prueba
 */
async function confirmarFinalizacion() {
    const empleadoId = document.getElementById('empleado-id').value;
    const aprobadoRadio = document.querySelector('input[name="resultado"]:checked');
    const observaciones = document.getElementById('observaciones').value.trim();

    // Validar
    if (!aprobadoRadio) {
        Swal.fire('Error', 'Debe seleccionar un resultado (Aprobar o Rechazar)', 'error');
        return;
    }

    const aprobado = aprobadoRadio.value === 'true';

    // Confirmar acción
    const confirmacion = await Swal.fire({
        title: aprobado ? '¿Aprobar Periodo de Prueba?' : '¿Rechazar Periodo de Prueba?',
        text: aprobado 
            ? 'El empleado será confirmado en su cargo permanentemente' 
            : 'El empleado será dado de baja',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: aprobado ? '#28a745' : '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: aprobado ? 'Sí, aprobar' : 'Sí, rechazar',
        cancelButtonText: 'Cancelar'
    });

    if (!confirmacion.isConfirmed) return;

    try {
        await APIService.post(`/contrataciones/periodo-prueba/${empleadoId}/finalizar`, {
            aprobado,
            observaciones
        });

        Swal.fire({
            icon: 'success',
            title: aprobado ? '¡Periodo Aprobado!' : 'Periodo Finalizado',
            text: aprobado 
                ? 'El empleado ha sido confirmado en su cargo' 
                : 'El empleado ha sido dado de baja',
            timer: 2000,
            showConfirmButton: false
        });

        modalFinalizarPeriodo.hide();
        await cargarEmpleados();

    } catch (error) {
        console.error('Error al finalizar periodo:', error);
        Swal.fire('Error', error.message || 'No se pudo finalizar el periodo de prueba', 'error');
    }
}
