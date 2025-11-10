/**
 * Configuración global de la aplicación
 * Contiene URLs del API, constantes y configuraciones generales
 */

const CONFIG = {
    // URL base del API (cambiar según el entorno)
    API_URL: 'http://localhost:5000/api',
    //API_URL: 'http://100.121.194.109:5000/api',

    // Timeout para las peticiones HTTP (en milisegundos)
    REQUEST_TIMEOUT: 30000,

    // Nombre de la clave para almacenar el token JWT
    TOKEN_KEY: 'auth_token',

    // Nombre de la clave para almacenar datos del usuario
    USER_KEY: 'user_data',

    // Roles del sistema
    ROLES: {
        ADMIN: "administrador",
        EMPRESA: "empresa",
        CANDIDATO: "candidato"
    },

    // Estados de postulación
    ESTADOS_POSTULACION: {
        PENDIENTE: 'pendiente',
        EN_REVISION: 'en_revision',
        PRESELECCIONADO: 'preseleccionado',
        ENTREVISTA: 'entrevista',
        PRUEBAS: 'pruebas',
        RECHAZADO: 'rechazado',
        CONTRATADO: 'contratado'
    },

    // Estados de vacante
    ESTADOS_VACANTE: {
        ACTIVA: 'activa',
        PAUSADA: 'pausada',
        CERRADA: 'cerrada'
    },

    // Estados de pruebas
    ESTADOS_PRUEBA: {
        PENDIENTE: 'pendiente',
        EN_PROGRESO: 'en_progreso',
        COMPLETADA: 'completada',
        NO_REALIZADA: 'no_realizada'
    },

    // Estados de entrevista
    ESTADOS_ENTREVISTA: {
        PROGRAMADA: 'programada',
        COMPLETADA: 'completada',
        CANCELADA: 'cancelada',
        REPROGRAMADA: 'reprogramada'
    },

    // Estados de documento
    ESTADOS_DOCUMENTO: {
        PENDIENTE: 'pendiente',
        VERIFICADO: 'verificado',
        RECHAZADO: 'rechazado'
    },

    // Tipos de documento
    TIPOS_DOCUMENTO: {
        TITULO_UNIVERSITARIO: 'titulo_universitario',
        CERTIFICADO_ESPECIALIZACION: 'certificado_especializacion',
        ANTECEDENTES_PENALES: 'antecedentes_penales',
        CERTIFICADO_EXPERIENCIA: 'certificado_experiencia',
        OTRO: 'otro'
    },

    // Tipos de entrevista
    TIPOS_ENTREVISTA: {
        TECNICA: 'tecnica',
        RECURSOS_HUMANOS: 'recursos_humanos',
        FINAL: 'final'
    },

    // Modalidades de trabajo
    MODALIDADES: {
        PRESENCIAL: 'presencial',
        REMOTO: 'remoto',
        HIBRIDO: 'hibrido'
    },

    // Tipos de contrato
    TIPOS_CONTRATO: {
        INDEFINIDO: 'indefinido',
        FIJO: 'fijo',
        TEMPORAL: 'temporal',
        FREELANCE: 'freelance',
        PRACTICAS: 'practicas'
    },

    // Niveles de experiencia
    NIVELES_EXPERIENCIA: {
        SIN_EXPERIENCIA: 'sin_experiencia',
        JUNIOR: 'junior',
        MEDIO: 'medio',
        SENIOR: 'senior',
        EXPERTO: 'experto'
    },

    // Configuración de paginación
    PAGINATION: {
        DEFAULT_PAGE: 1,
        DEFAULT_LIMIT: 10,
        MAX_LIMIT: 100
    },

    // Tamaños máximos de archivo (en bytes)
    FILE_SIZES: {
        CV_MAX: 5 * 1024 * 1024, // 5MB
        DOCUMENTO_MAX: 10 * 1024 * 1024, // 10MB
        IMAGEN_MAX: 2 * 1024 * 1024 // 2MB
    },

    // Mensajes de error comunes
    MESSAGES: {
        ERROR_GENERAL: 'Ha ocurrido un error. Por favor, intenta de nuevo.',
        ERROR_NETWORK: 'Error de conexión. Verifica tu conexión a internet.',
        ERROR_UNAUTHORIZED: 'No tienes autorización para realizar esta acción.',
        ERROR_SESSION_EXPIRED: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
        SUCCESS_SAVE: 'Los cambios se han guardado correctamente.',
        SUCCESS_DELETE: 'El elemento ha sido eliminado correctamente.',
        CONFIRM_DELETE: '¿Estás seguro de que deseas eliminar este elemento?'
    },

    // Rutas de las páginas según el rol
    ROUTES: {
        LOGIN: '/login.html',
        REGISTRO: '/registro.html',
        HOME: '/index.html',
        ADMIN: {
            DASHBOARD: '/pages/admin/dashboard.html',
            REPORTES: '/pages/admin/reportes.html',
            HISTORIAL: '/pages/admin/historial.html'
        },
        EMPRESA: {
            DASHBOARD: '/pages/empresa/dashboard.html',
            PERFIL: '/pages/empresa/perfil.html',
            VACANTES: '/pages/empresa/vacantes.html',
            CREAR_VACANTE: '/pages/empresa/crear-vacante.html',
            DETALLE_VACANTE: '/pages/empresa/detalle-vacante.html',
            POSTULACIONES: '/pages/empresa/postulaciones.html',
            CANDIDATOS: '/pages/empresa/buscar-candidatos.html',
            DETALLE_CANDIDATO: '/pages/empresa/detalle-candidato.html'
        },
        CANDIDATO: {
            DASHBOARD: '/pages/candidato/dashboard.html',
            PERFIL: '/pages/candidato/perfil.html',
            CV: '/pages/candidato/cv.html',
            VACANTES: '/pages/candidato/vacantes.html',
            POSTULACIONES: '/pages/candidato/mis-postulaciones.html',
            DOCUMENTOS: '/pages/candidato/documentos.html',
            PRUEBAS: '/pages/candidato/pruebas.html',
            ENTREVISTAS: '/pages/candidato/entrevistas.html'
        }
    }
};

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
