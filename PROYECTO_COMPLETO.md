# 📋 PLATAFORMA DE GESTIÓN DE TALENTO HUMANO - PROYECTO COMPLETO

**Versión:** 1.0
**Fecha:** Octubre 2024
**Autores:** Equipo de Desarrollo

---

## 📖 ÍNDICE

1. [Introducción al Proyecto](#introducción-al-proyecto)
2. [Arquitectura General](#arquitectura-general)
3. [Tecnologías Utilizadas](#tecnologías-utilizadas)
4. [Estructura del Backend (MVC)](#estructura-del-backend-mvc)
5. [Estructura del Frontend (MVC-Like)](#estructura-del-frontend-mvc-like)
6. [Módulos del Sistema](#módulos-del-sistema)
7. [Planificación de Desarrollo](#planificación-de-desarrollo)
8. [Guía de Implementación](#guía-de-implementación)
9. [Endpoints API REST](#endpoints-api-rest)
10. [Flujos de Usuario](#flujos-de-usuario)

---

## 1. INTRODUCCIÓN AL PROYECTO

### 🎯 Objetivo

Desarrollar una **Plataforma Web Integral** para la gestión de procesos de selección y contratación de personal, que conecte a empresas con candidatos de manera eficiente, automatizando evaluaciones, seguimiento de postulaciones y gestión documental.

### 👥 Roles del Sistema

El sistema maneja **3 roles principales**:

1. **👨‍💼 Administrador**
   - Gestión total del sistema
   - Generación de reportes
   - Auditoría de actividades
   - Gestión de usuarios

2. **🏢 Empresa**
   - Publicar vacantes
   - Gestionar postulaciones
   - Evaluar candidatos
   - Asignar pruebas técnicas y médicas
   - Programar entrevistas

3. **👤 Candidato**
   - Buscar vacantes
   - Postularse a empleos
   - Subir CV y documentos
   - Realizar pruebas psicométricas
   - Asistir a entrevistas

### 🌟 Características Principales

- ✅ Sistema de autenticación con JWT
- ✅ Gestión completa de vacantes y postulaciones
- ✅ Pruebas psicométricas automatizadas
- ✅ Pruebas técnicas con carga de archivos PDF
- ✅ Pruebas médicas con gestión de resultados
- ✅ Sistema de entrevistas
- ✅ Calendario de eventos
- ✅ Verificación de documentos
- ✅ Evaluaciones post-contratación
- ✅ Generación de reportes
- ✅ Auditoría de actividades

---

## 2. ARQUITECTURA GENERAL

### 🏗️ Arquitectura del Proyecto

El proyecto sigue una arquitectura **Cliente-Servidor** con separación clara de responsabilidades:

```
┌─────────────────────────────────────────────────────────┐
│                     FRONTEND                            │
│  HTML + Bootstrap + JavaScript Vanilla                  │
│  (MVC-Like: Views, Controllers, Services)              │
└─────────────────────────────────────────────────────────┘
                        ↕ HTTP/REST
┌─────────────────────────────────────────────────────────┐
│                     BACKEND                             │
│  Node.js + Express + Sequelize                         │
│  (MVC: Models, Controllers, Routes)                    │
└─────────────────────────────────────────────────────────┘
                        ↕ SQL
┌─────────────────────────────────────────────────────────┐
│                   BASE DE DATOS                         │
│                   MySQL/MariaDB                         │
└─────────────────────────────────────────────────────────┘
                        ↕ Files
┌─────────────────────────────────────────────────────────┐
│               ALMACENAMIENTO                            │
│             Firebase Storage (PDFs)                     │
└─────────────────────────────────────────────────────────┘
```

### 🔄 Flujo de Datos

```
Usuario → Frontend (HTML/JS) → API REST → Backend (Express) → Database (MySQL)
                                  ↓                              ↓
                            Firebase Storage              Sequelize ORM
                          (CVs, Documentos, PDFs)
```

---

## 3. TECNOLOGÍAS UTILIZADAS

### **Backend**

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Node.js | 18+ | Runtime de JavaScript |
| Express | 5.1.0 | Framework web |
| Sequelize | 6.37.7 | ORM para MySQL |
| MySQL | 8.0+ | Base de datos |
| JWT | 9.0.2 | Autenticación |
| Bcrypt | 6.0.0 | Hash de contraseñas |
| Multer | 2.0.2 | Carga de archivos |
| Firebase Admin | latest | Storage de archivos |

### **Frontend**

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| HTML5 | - | Estructura |
| CSS3 | - | Estilos |
| Bootstrap | 5.3 | Framework CSS |
| Bootstrap Icons | 1.11+ | Iconografía |
| JavaScript Vanilla | ES6+ | Lógica del cliente |
| Fetch API | - | Llamadas HTTP |
| LocalStorage | - | Persistencia JWT |

### **Librerías Adicionales (Opcionales)**

- **Chart.js**: Gráficas en dashboards
- **DataTables**: Tablas avanzadas
- **SweetAlert2**: Alertas elegantes
- **Moment.js**: Manejo de fechas

---

## 4. ESTRUCTURA DEL BACKEND (MVC)

### 📁 Estructura de Carpetas

```
backend/
├── app.js                          # Punto de entrada
├── package.json                    # Dependencias
├── .env                           # Variables de entorno
├── firebase-credentials.json      # Credenciales Firebase
│
├── db/
│   └── db.js                      # Conexión Sequelize
│
├── src/
│   ├── config/
│   │   └── constants.js           # Enums y constantes
│   │
│   ├── models/                    # MODELO (20 modelos)
│   │   ├── index.js               # Relaciones (54 associations)
│   │   ├── auth/
│   │   │   ├── usuario.model.js
│   │   │   └── rol.model.js
│   │   ├── empresas/
│   │   │   └── empresa.model.js
│   │   ├── candidatos/
│   │   │   └── candidato.model.js
│   │   ├── vacantes/
│   │   │   ├── vacante.model.js
│   │   │   └── postulacion.model.js
│   │   ├── pruebas-psicometricas/  (6 modelos)
│   │   ├── pruebas-tecnicas/
│   │   ├── pruebas-medicas/
│   │   ├── entrevistas/
│   │   ├── eventos/
│   │   ├── documentos/
│   │   ├── evaluaciones/
│   │   └── admin/
│   │
│   ├── controllers/               # CONTROLADOR (15 controllers, 103 funciones)
│   │   ├── auth/
│   │   │   └── auth.controller.js
│   │   ├── vacantes/
│   │   │   ├── vacantes.controller.js
│   │   │   └── postulaciones.controller.js
│   │   ├── empresas/
│   │   ├── candidatos/
│   │   ├── pruebas-psicometricas/
│   │   ├── pruebas-tecnicas/
│   │   ├── pruebas-medicas/
│   │   ├── entrevistas/
│   │   ├── eventos/
│   │   ├── documentos/
│   │   ├── evaluaciones/
│   │   └── admin/
│   │
│   ├── routes/                    # RUTAS (13 módulos, 104 endpoints)
│   │   ├── index.js               # Router maestro
│   │   ├── auth/auth.routes.js
│   │   ├── vacantes/vacantes.routes.js
│   │   ├── empresas/empresas.routes.js
│   │   ├── candidatos/candidatos.routes.js
│   │   ├── pruebas-psicometricas/
│   │   ├── pruebas-tecnicas/
│   │   ├── pruebas-medicas/
│   │   ├── entrevistas/
│   │   ├── eventos/
│   │   ├── documentos/
│   │   ├── evaluaciones/
│   │   └── admin/
│   │
│   ├── middlewares/
│   │   ├── auth.middleware.js     # Verificación JWT y roles
│   │   ├── validation.middleware.js
│   │   └── multer.middleware.js   # Carga de archivos
│   │
│   └── utils/
│       ├── response.util.js       # Respuestas estandarizadas
│       ├── jwt.util.js            # Manejo de tokens
│       ├── firebase.util.js       # Firebase Storage
│       └── errors.util.js         # Manejo de errores
│
└── SQL/
    ├── schema_gestion_talento.sql  # Schema de BD
    └── datos.sql                   # Datos de prueba
```

### 🔧 Patrón MVC Backend

**MODEL (Modelo):**
- Define la estructura de datos
- Validaciones a nivel de BD
- Relaciones entre tablas
- Ejemplo: `Usuario`, `Vacante`, `Candidato`

**CONTROLLER (Controlador):**
- Lógica de negocio
- Procesamiento de datos
- Validaciones complejas
- Llamadas a modelos
- Ejemplo: `authController.login()`, `vacantesController.crear()`

**VIEW (Vista):**
- En API REST = **Respuestas JSON**
- No hay vistas HTML en el backend
- Formato estandarizado:
```json
{
  "success": true,
  "message": "Operación exitosa",
  "data": { ... }
}
```

**ROUTES (Rutas):**
- Define endpoints HTTP
- Middlewares de autenticación
- Validación de permisos
- Ejemplo: `POST /api/auth/login`, `GET /api/vacantes`

### 📊 Estado del Backend

**Completitud: 80%**

✅ **Completo (100%):**
- 20 modelos con relaciones
- 104 endpoints REST
- Autenticación JWT
- Control de roles
- Firebase Storage integrado
- Manejo de archivos PDF

⚠️ **Pendiente:**
- Email service (recuperación de contraseña)
- Validación Joi exhaustiva
- Testing automatizado
- Documentación Swagger

---

## 5. ESTRUCTURA DEL FRONTEND (MVC-Like)

### 📁 Estructura de Carpetas

```
frontend/
├── index.html                     # Landing page
├── login.html                     # Login universal
├── registro.html                  # Registro con selector de rol
│
├── assets/
│   ├── css/
│   │   ├── styles.css            # Estilos personalizados
│   │   └── variables.css         # Variables CSS
│   │
│   ├── js/
│   │   ├── controllers/          # CONTROLADORES (Lógica por módulo)
│   │   │   ├── auth.controller.js
│   │   │   ├── candidato.controller.js
│   │   │   ├── empresa.controller.js
│   │   │   └── admin.controller.js
│   │   │
│   │   ├── services/             # SERVICIOS (API calls)
│   │   │   ├── api.service.js
│   │   │   ├── auth.service.js
│   │   │   ├── vacantes.service.js
│   │   │   ├── candidatos.service.js
│   │   │   ├── documentos.service.js
│   │   │   ├── pruebas.service.js
│   │   │   └── empresas.service.js
│   │   │
│   │   ├── utils/                # UTILIDADES
│   │   │   ├── validators.js
│   │   │   ├── formatters.js
│   │   │   └── helpers.js
│   │   │
│   │   ├── config.js             # Configuración global
│   │   ├── components.js         # Cargar componentes
│   │   └── main.js               # Inicialización
│   │
│   └── img/
│       └── logo.png
│
├── pages/                         # VISTAS (HTML)
│   ├── admin/
│   │   ├── dashboard.html
│   │   ├── reportes.html
│   │   └── historial.html
│   │
│   ├── empresa/
│   │   ├── dashboard.html
│   │   ├── perfil.html
│   │   ├── vacantes.html
│   │   ├── crear-vacante.html
│   │   ├── detalle-vacante.html
│   │   ├── postulaciones.html
│   │   ├── candidatos.html
│   │   └── detalle-candidato.html
│   │
│   └── candidato/
│       ├── dashboard.html
│       ├── perfil.html
│       ├── cv.html
│       ├── vacantes.html
│       ├── mis-postulaciones.html
│       ├── documentos.html
│       ├── pruebas.html
│       └── entrevistas.html
│
└── components/                    # COMPONENTES reutilizables
    ├── navbar.html
    ├── sidebar.html
    └── footer.html
```

### 🔧 Patrón MVC-Like Frontend

**VIEW (Vista):**
- Archivos HTML con Bootstrap
- Componentes reutilizables
- Estructura semántica
- Ejemplo: `pages/candidato/vacantes.html`

**CONTROLLER (Controlador):**
- JavaScript que maneja eventos
- Lógica de UI
- Llama a servicios
- Actualiza el DOM
- Ejemplo: `controllers/candidato.controller.js`

**SERVICE (Servicio):**
- Comunicación con backend
- Fetch a endpoints REST
- Manejo de respuestas
- Manejo de errores
- Ejemplo: `services/vacantes.service.js`

**UTILITY (Utilidad):**
- Funciones helper
- Validaciones
- Formateo de datos
- Ejemplo: `utils/validators.js`

### 📊 Flujo de Datos Frontend

```
1. Usuario interactúa con VIEW (HTML)
      ↓
2. Controller captura evento (click, submit)
      ↓
3. Controller valida datos
      ↓
4. Controller llama a Service
      ↓
5. Service hace Fetch al Backend
      ↓
6. Service recibe respuesta JSON
      ↓
7. Controller actualiza el DOM
      ↓
8. Usuario ve resultado en VIEW
```

### 💡 Ejemplo Práctico: Subir CV

**1. VIEW (HTML):**
```html
<!-- pages/candidato/cv.html -->
<div class="card">
  <div class="card-body">
    <h5>Mi CV</h5>
    <input type="file" id="cvInput" accept=".pdf" class="form-control">
    <button onclick="CandidatoController.uploadCV()" class="btn btn-primary mt-2">
      Subir CV
    </button>
    <div id="cvPreview"></div>
  </div>
</div>
```

**2. CONTROLLER (JavaScript):**
```javascript
// assets/js/controllers/candidato.controller.js
const CandidatoController = {
  async uploadCV() {
    try {
      // Obtener archivo
      const fileInput = document.getElementById('cvInput');
      const file = fileInput.files[0];

      // Validar
      if (!file) {
        Utils.showError('Por favor selecciona un archivo');
        return;
      }

      if (!Validators.isPDF(file)) {
        Utils.showError('Solo se permiten archivos PDF');
        return;
      }

      // Llamar al servicio
      Utils.showLoading('Subiendo CV...');
      const result = await CandidatoService.uploadCV(file);

      // Actualizar UI
      if (result.success) {
        Utils.showSuccess('CV subido exitosamente');
        this.updateCVPreview(result.data.cv_url);
      } else {
        Utils.showError(result.message);
      }
    } catch (error) {
      Utils.showError('Error al subir CV: ' + error.message);
    } finally {
      Utils.hideLoading();
    }
  },

  updateCVPreview(url) {
    const preview = document.getElementById('cvPreview');
    preview.innerHTML = `
      <div class="alert alert-success mt-3">
        <i class="bi bi-file-pdf"></i> CV subido correctamente
        <a href="${url}" target="_blank" class="btn btn-sm btn-outline-primary ms-2">
          Ver CV
        </a>
      </div>
    `;
  }
};
```

**3. SERVICE (API Call):**
```javascript
// assets/js/services/candidato.service.js
const CandidatoService = {
  async uploadCV(file) {
    const formData = new FormData();
    formData.append('cv', file);

    return await ApiService.post('/candidatos/cv', formData);
  },

  async deleteCV() {
    return await ApiService.delete('/candidatos/cv');
  },

  async getProfile() {
    return await ApiService.get('/candidatos/mi-perfil');
  }
};
```

**4. API SERVICE (Fetch Base):**
```javascript
// assets/js/services/api.service.js
const ApiService = {
  baseURL: 'http://localhost:5000/api',

  getToken() {
    return localStorage.getItem('token');
  },

  async post(endpoint, data) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.getToken()}`
      },
      body: data instanceof FormData ? data : JSON.stringify(data)
    });

    return await response.json();
  },

  async get(endpoint) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.getToken()}`,
        'Content-Type': 'application/json'
      }
    });

    return await response.json();
  }
};
```

**5. VALIDATORS (Utilidad):**
```javascript
// assets/js/utils/validators.js
const Validators = {
  isPDF(file) {
    return file && file.type === 'application/pdf';
  },

  isEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  },

  isValidPassword(password) {
    return password && password.length >= 8;
  }
};
```

---

## 6. MÓDULOS DEL SISTEMA

### 🔐 Módulo de Autenticación

**Páginas:**
- `login.html` - Login universal
- `registro.html` - Registro con selector de rol

**Funcionalidades:**
- Login con email y contraseña
- Registro de usuarios (Empresa/Candidato)
- Almacenamiento de JWT en LocalStorage
- Recuperación de contraseña
- Cambio de contraseña

**Endpoints:**
- `POST /api/auth/login`
- `POST /api/auth/registro`
- `POST /api/auth/solicitar-recuperacion`
- `POST /api/auth/restablecer-contraseña`
- `PUT /api/auth/cambiar-contraseña`

---

### 👤 Módulo de Candidato

**Páginas:**
- `dashboard.html` - Resumen de actividad
- `perfil.html` - Ver/editar perfil
- `cv.html` - Gestión de CV
- `vacantes.html` - Buscar vacantes
- `mis-postulaciones.html` - Ver postulaciones
- `documentos.html` - Subir documentos
- `pruebas.html` - Realizar pruebas
- `entrevistas.html` - Ver entrevistas

**Funcionalidades Principales:**

**Dashboard:**
- Estadísticas: postulaciones, entrevistas, pruebas
- Notificaciones recientes
- Accesos rápidos

**Perfil:**
- Editar datos personales
- Información profesional
- Redes sociales

**CV:**
- Subir CV (PDF, max 10MB)
- Actualizar CV
- Eliminar CV
- Vista previa

**Vacantes:**
- Buscador con filtros
- Cards de vacantes
- Ver detalles
- Postularse

**Mis Postulaciones:**
- Lista de postulaciones
- Estados con badges
- Cancelar postulación

**Documentos:**
- Subir documentos de verificación
- Tipos: Título, Certificado, Antecedentes, etc.
- Estado de verificación
- Actualizar/Eliminar

**Pruebas:**
- Tabs: Psicométricas, Técnicas, Médicas
- Iniciar pruebas psicométricas
- Descargar instrucciones técnicas
- Subir respuestas

**Entrevistas:**
- Lista de entrevistas programadas
- Fecha, hora, tipo
- Unirse a videollamada

**Endpoints Principales:**
```
GET  /api/candidatos/mi-perfil
PUT  /api/candidatos
POST /api/candidatos/cv
DELETE /api/candidatos/cv
GET  /api/vacantes
POST /api/vacantes/postularse
GET  /api/vacantes/mis-postulaciones
POST /api/documentos
GET  /api/pruebas-psicometricas/mis-asignaciones
POST /api/pruebas-tecnicas/:id/respuesta
GET  /api/entrevistas/mis-entrevistas
```

---

### 🏢 Módulo de Empresa

**Páginas:**
- `dashboard.html` - KPIs y estadísticas
- `perfil.html` - Perfil de empresa
- `vacantes.html` - Mis vacantes
- `crear-vacante.html` - Crear/editar vacante
- `detalle-vacante.html` - Ver vacante con postulaciones
- `postulaciones.html` - Gestión de postulaciones
- `candidatos.html` - Buscar candidatos
- `detalle-candidato.html` - Ver candidato completo

**Funcionalidades Principales:**

**Dashboard:**
- KPIs: Vacantes activas, Postulaciones, Entrevistas
- Gráficas de postulaciones
- Actividad reciente

**Vacantes:**
- CRUD completo de vacantes
- Filtros por estado
- Cambiar estado (Activa, Pausada, Cerrada)

**Crear Vacante:**
- Formulario completo con validaciones
- Título, descripción, requisitos
- Salario, tipo de contrato, jornada
- Fecha límite

**Postulaciones:**
- Ver todas las postulaciones
- Filtros por vacante/estado
- Cambiar estado: En revisión, Preseleccionado, Entrevista, Aceptado, Rechazado

**Candidatos:**
- Buscador avanzado
- Filtros: título, experiencia, ubicación
- Ver perfil completo

**Detalle Candidato:**
- Información completa
- Descargar CV
- Ver documentos
- Resultados de pruebas
- Asignar prueba técnica
- Programar entrevista

**Endpoints Principales:**
```
GET  /api/empresas/mi-empresa
PUT  /api/empresas
GET  /api/vacantes/mis-vacantes
POST /api/vacantes
PUT  /api/vacantes/:id
GET  /api/vacantes/:id/postulaciones
PUT /api/vacantes/postulaciones/:id
GET  /api/candidatos/buscar
GET  /api/candidatos/:id
POST /api/pruebas-tecnicas
POST /api/pruebas-tecnicas/:id/instrucciones
POST /api/pruebas-medicas
POST /api/entrevistas
```

---

### 👨‍💼 Módulo de Administrador

**Páginas:**
- `dashboard.html` - Vista general del sistema
- `reportes.html` - Generación de reportes
- `historial.html` - Auditoría de actividades

**Funcionalidades:**

**Dashboard:**
- KPIs globales del sistema
- Total usuarios, empresas, candidatos
- Vacantes activas
- Gráficas de actividad

**Reportes:**
- Tipos: Vacantes, Postulaciones, Candidatos, Entrevistas, Evaluaciones
- Filtros por fecha
- Generar en PDF/Excel
- Descargar reportes

**Historial:**
- Log de todas las actividades
- Filtros: usuario, tabla, acción, fecha
- Búsqueda avanzada
- Exportar log

**Endpoints:**
```
GET  /api/admin/historial
GET  /api/admin/historial/estadisticas
POST /api/admin/reportes
GET  /api/admin/reportes
GET  /api/admin/reportes/:id
```

---

## 7. PLANIFICACIÓN DE DESARROLLO

### 📅 Sprints de Desarrollo

### **Sprint 1: Fundamentos (2-3 días) - 16-24h**

**Objetivos:**
- Configurar estructura base
- Implementar autenticación
- Crear componentes globales

**Tareas:**
1. ✅ Crear estructura de carpetas (HECHO)
2. Crear `assets/css/styles.css` con variables Bootstrap
3. Crear `assets/js/config.js` con configuración de API
4. Crear `assets/js/services/api.service.js`
5. Crear `assets/js/services/auth.service.js`
6. Crear `assets/js/controllers/auth.controller.js`
7. Crear `assets/js/utils/validators.js`
8. Crear `assets/js/utils/helpers.js`
9. Crear `index.html` - Landing page con Bootstrap
10. Crear `login.html` - Formulario de login funcional
11. Crear `registro.html` - Formulario de registro funcional
12. Integrar login con backend
13. Guardar JWT en LocalStorage
14. Redireccionar según rol

**Entregables:**
- ✅ Autenticación funcional
- ✅ LocalStorage JWT
- ✅ Redirección por rol

---

### **Sprint 2: Componentes (1-2 días) - 8-16h**

**Objetivos:**
- Crear componentes reutilizables
- Navbar y sidebar dinámicos

**Tareas:**
1. Crear `components/navbar.html`
   - Logo
   - Links de navegación
   - Dropdown de usuario
   - Botón logout
2. Crear `components/sidebar.html`
   - Menú adaptable por rol
   - Links con iconos Bootstrap Icons
3. Crear `components/footer.html`
4. Crear `assets/js/components.js`
   - Función para cargar componentes
   - Detectar rol y mostrar menú correcto
5. Integrar componentes en todas las páginas

**Entregables:**
- ✅ Navbar responsive
- ✅ Sidebar por rol
- ✅ Sistema de carga de componentes

---

### **Sprint 3: Módulo Candidato (3-4 días) - 24-32h**

**Objetivos:**
- Implementar todas las páginas del candidato
- Integrar con endpoints del backend

**Tareas:**

**Día 1: Dashboard y Perfil**
1. `pages/candidato/dashboard.html`
   - KPIs
   - Notificaciones
   - Accesos rápidos
2. `pages/candidato/perfil.html`
   - Formulario editable
   - Integración con `GET /api/candidatos/mi-perfil`
   - Integración con `PUT /api/candidatos`

**Día 2: CV y Vacantes**
3. `pages/candidato/cv.html`
   - Subir CV
   - Vista previa
   - Eliminar CV
   - Integración con `POST /api/candidatos/cv`
4. `pages/candidato/vacantes.html`
   - Buscador con filtros
   - Cards de vacantes
   - Paginación
   - Botón "Postularse"
   - Integración con `GET /api/vacantes`
   - Integración con `POST /api/vacantes/postularse`

**Día 3: Postulaciones y Documentos**
5. `pages/candidato/mis-postulaciones.html`
   - Tabla de postulaciones
   - Badges de estado
   - Cancelar postulación
   - Integración con `GET /api/vacantes/mis-postulaciones`
6. `pages/candidato/documentos.html`
   - Subir documentos
   - Lista de documentos
   - Estado de verificación
   - Integración con `POST /api/documentos`

**Día 4: Pruebas y Entrevistas**
7. `pages/candidato/pruebas.html`
   - Tabs de pruebas
   - Iniciar pruebas psicométricas
   - Subir respuestas técnicas
   - Integración con endpoints de pruebas
8. `pages/candidato/entrevistas.html`
   - Lista de entrevistas
   - Integración con `GET /api/entrevistas/mis-entrevistas`

**Controllers y Services:**
- `controllers/candidato.controller.js`
- `services/candidatos.service.js`
- `services/vacantes.service.js`
- `services/documentos.service.js`
- `services/pruebas.service.js`

**Entregables:**
- ✅ 8 páginas funcionales del candidato
- ✅ Integración completa con backend
- ✅ Subida de archivos PDF

---

### **Sprint 4: Módulo Empresa (3-4 días) - 24-32h**

**Objetivos:**
- Implementar todas las páginas de empresa
- Gestión completa de vacantes y postulaciones

**Tareas:**

**Día 1: Dashboard y Perfil**
1. `pages/empresa/dashboard.html`
   - KPIs
   - Gráficas
   - Actividad reciente
2. `pages/empresa/perfil.html`
   - Editar empresa
   - Integración con `GET /api/empresas/mi-empresa`

**Día 2: Vacantes**
3. `pages/empresa/vacantes.html`
   - Tabla de vacantes
   - Filtros
   - CRUD
   - Integración con `GET /api/vacantes/mis-vacantes`
4. `pages/empresa/crear-vacante.html`
   - Formulario completo
   - Validaciones
   - Integración con `POST /api/vacantes`

**Día 3: Postulaciones**
5. `pages/empresa/detalle-vacante.html`
   - Ver vacante
   - Postulaciones de la vacante
   - Cambiar estado
6. `pages/empresa/postulaciones.html`
   - Vista global de postulaciones
   - Filtros
   - Cambiar estados

**Día 4: Candidatos**
7. `pages/empresa/candidatos.html`
   - Buscador de candidatos
   - Filtros avanzados
   - Integración con `GET /api/candidatos/buscar`
8. `pages/empresa/detalle-candidato.html`
   - Perfil completo
   - CV, documentos, pruebas
   - Asignar pruebas
   - Programar entrevista

**Controllers y Services:**
- `controllers/empresa.controller.js`
- `services/empresas.service.js`

**Entregables:**
- ✅ 8 páginas funcionales de empresa
- ✅ CRUD de vacantes
- ✅ Gestión de postulaciones

---

### **Sprint 5: Módulo Admin (2-3 días) - 16-24h**

**Objetivos:**
- Dashboard administrativo
- Reportes
- Historial de actividades

**Tareas:**
1. `pages/admin/dashboard.html`
   - KPIs globales
   - Gráficas del sistema
2. `pages/admin/reportes.html`
   - Selector de tipo de reporte
   - Filtros
   - Generar y descargar
   - Integración con `POST /api/admin/reportes`
3. `pages/admin/historial.html`
   - Tabla de actividades
   - Filtros avanzados
   - Búsqueda
   - Integración con `GET /api/admin/historial`

**Controllers y Services:**
- `controllers/admin.controller.js`
- `services/admin.service.js`

**Entregables:**
- ✅ 3 páginas de administrador
- ✅ Generación de reportes
- ✅ Auditoría completa

---

### **Sprint 6: Refinamiento y Testing (2-3 días) - 16-24h**

**Objetivos:**
- Mejorar UX/UI
- Agregar validaciones
- Testing manual completo

**Tareas:**
1. Mejorar estilos CSS
2. Agregar animaciones y transiciones
3. Validaciones exhaustivas en formularios
4. Manejo de errores mejorado
5. Mensajes de éxito/error con SweetAlert2
6. Responsive design para móviles
7. Testing manual de todos los flujos
8. Corrección de bugs
9. Optimización de performance
10. Documentación de código

**Entregables:**
- ✅ UI pulida y profesional
- ✅ Validaciones completas
- ✅ Responsive design
- ✅ Bugs corregidos

---

### 📊 Resumen de Estimación

| Sprint | Descripción | Duración | Horas |
|--------|-------------|----------|-------|
| Sprint 1 | Fundamentos | 2-3 días | 16-24h |
| Sprint 2 | Componentes | 1-2 días | 8-16h |
| Sprint 3 | Módulo Candidato | 3-4 días | 24-32h |
| Sprint 4 | Módulo Empresa | 3-4 días | 24-32h |
| Sprint 5 | Módulo Admin | 2-3 días | 16-24h |
| Sprint 6 | Refinamiento | 2-3 días | 16-24h |
| | | | |
| **TOTAL** | **6 Sprints** | **13-19 días** | **104-152h** |

---

## 8. GUÍA DE IMPLEMENTACIÓN

### 🚀 Cómo Empezar

### **Paso 1: Configuración Inicial**

**1.1 Variables de Configuración**

Crear `assets/js/config.js`:
```javascript
const CONFIG = {
  API_URL: 'http://localhost:5000/api',
  TOKEN_KEY: 'auth_token',
  USER_KEY: 'user_data',
  MAX_FILE_SIZE: 10485760, // 10MB
  ALLOWED_FILE_TYPES: ['application/pdf']
};
```

**1.2 Service Base API**

Crear `assets/js/services/api.service.js`:
```javascript
const ApiService = {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem(CONFIG.TOKEN_KEY);

    const headers = {
      ...options.headers
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    try {
      const response = await fetch(`${CONFIG.API_URL}${endpoint}`, {
        ...options,
        headers
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error en la petición');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  },

  post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body)
    });
  },

  put(endpoint, body) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body)
    });
  },

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
};
```

### **Paso 2: Sistema de Autenticación**

**2.1 Auth Service**

Crear `assets/js/services/auth.service.js`:
```javascript
const AuthService = {
  async login(email, password) {
    const response = await ApiService.post('/auth/login', {
      email,
      password
    });

    if (response.success) {
      this.saveAuth(response.data.token, response.data.usuario);
    }

    return response;
  },

  async register(userData) {
    return await ApiService.post('/auth/registro', userData);
  },

  saveAuth(token, user) {
    localStorage.setItem(CONFIG.TOKEN_KEY, token);
    localStorage.setItem(CONFIG.USER_KEY, JSON.stringify(user));
  },

  logout() {
    localStorage.removeItem(CONFIG.TOKEN_KEY);
    localStorage.removeItem(CONFIG.USER_KEY);
    window.location.href = '/login.html';
  },

  getToken() {
    return localStorage.getItem(CONFIG.TOKEN_KEY);
  },

  getUser() {
    const user = localStorage.getItem(CONFIG.USER_KEY);
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated() {
    return !!this.getToken();
  },

  getUserRole() {
    const user = this.getUser();
    return user ? user.rol : null;
  },

  checkAuth() {
    if (!this.isAuthenticated()) {
      window.location.href = '/login.html';
      return false;
    }
    return true;
  }
};
```

**2.2 Auth Controller**

Crear `assets/js/controllers/auth.controller.js`:
```javascript
const AuthController = {
  async handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Validar
    if (!email || !password) {
      Utils.showError('Por favor completa todos los campos');
      return;
    }

    try {
      Utils.showLoading('Iniciando sesión...');

      const response = await AuthService.login(email, password);

      if (response.success) {
        Utils.showSuccess('Login exitoso');

        // Redireccionar según rol
        const user = AuthService.getUser();
        this.redirectByRole(user.rol);
      }
    } catch (error) {
      Utils.showError('Error al iniciar sesión: ' + error.message);
    } finally {
      Utils.hideLoading();
    }
  },

  redirectByRole(rol) {
    switch(rol) {
      case 'administrador':
        window.location.href = '/pages/admin/dashboard.html';
        break;
      case 'empresa':
        window.location.href = '/pages/empresa/dashboard.html';
        break;
      case 'candidato':
        window.location.href = '/pages/candidato/dashboard.html';
        break;
      default:
        window.location.href = '/index.html';
    }
  },

  handleLogout() {
    if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
      AuthService.logout();
    }
  }
};
```

### **Paso 3: Utilidades**

**3.1 Validators**

Crear `assets/js/utils/validators.js`:
```javascript
const Validators = {
  isEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  },

  isValidPassword(password) {
    return password && password.length >= 8;
  },

  isPDF(file) {
    return file && file.type === 'application/pdf';
  },

  isValidFileSize(file, maxSize = CONFIG.MAX_FILE_SIZE) {
    return file && file.size <= maxSize;
  },

  isRequired(value) {
    return value !== null && value !== undefined && value !== '';
  }
};
```

**3.2 Helpers**

Crear `assets/js/utils/helpers.js`:
```javascript
const Utils = {
  showError(message) {
    // Puedes usar SweetAlert2 o Bootstrap alerts
    alert(message); // Temporal
  },

  showSuccess(message) {
    alert(message); // Temporal
  },

  showLoading(message = 'Cargando...') {
    // Implementar spinner
    console.log(message);
  },

  hideLoading() {
    // Ocultar spinner
  },

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  },

  formatCurrency(amount) {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }
};
```

### **Paso 4: Componentes Dinámicos**

Crear `assets/js/components.js`:
```javascript
const Components = {
  async loadNavbar() {
    const response = await fetch('/components/navbar.html');
    const html = await response.text();
    document.getElementById('navbar-container').innerHTML = html;

    // Actualizar con datos del usuario
    const user = AuthService.getUser();
    if (user) {
      document.getElementById('userName').textContent = user.nombre;
    }
  },

  async loadSidebar() {
    const response = await fetch('/components/sidebar.html');
    const html = await response.text();
    document.getElementById('sidebar-container').innerHTML = html;

    // Mostrar menú según rol
    this.showMenuByRole();
  },

  async loadFooter() {
    const response = await fetch('/components/footer.html');
    const html = await response.text();
    document.getElementById('footer-container').innerHTML = html;
  },

  showMenuByRole() {
    const role = AuthService.getUserRole();

    // Ocultar todos los menús
    document.querySelectorAll('[data-role]').forEach(el => {
      el.style.display = 'none';
    });

    // Mostrar solo el menú del rol actual
    document.querySelectorAll(`[data-role="${role}"]`).forEach(el => {
      el.style.display = 'block';
    });
  },

  async loadAll() {
    await this.loadNavbar();
    await this.loadSidebar();
    await this.loadFooter();
  }
};
```

### **Paso 5: Inicialización**

Crear `assets/js/main.js`:
```javascript
// Verificar autenticación en páginas protegidas
function checkPageAuth() {
  const publicPages = ['/index.html', '/login.html', '/registro.html'];
  const currentPage = window.location.pathname;

  if (!publicPages.includes(currentPage)) {
    if (!AuthService.checkAuth()) {
      return false;
    }
  }

  return true;
}

// Cargar componentes al iniciar
document.addEventListener('DOMContentLoaded', async () => {
  if (checkPageAuth()) {
    // Solo cargar componentes si no es una página pública
    const publicPages = ['/index.html', '/login.html', '/registro.html'];
    const currentPage = window.location.pathname;

    if (!publicPages.includes(currentPage)) {
      await Components.loadAll();
    }
  }
});
```

---

## 9. ENDPOINTS API REST

### 📡 Lista Completa de Endpoints

### **Autenticación**
```
POST   /api/auth/registro              # Registrar usuario
POST   /api/auth/login                 # Login
GET    /api/auth/perfil                # Obtener perfil
PUT    /api/auth/perfil                # Actualizar perfil
PUT    /api/auth/cambiar-contraseña    # Cambiar contraseña
POST   /api/auth/solicitar-recuperacion
POST   /api/auth/restablecer-contraseña
```

### **Vacantes**
```
GET    /api/vacantes                   # Listar vacantes (público)
GET    /api/vacantes/mis-vacantes      # Mis vacantes (Empresa)
GET    /api/vacantes/:id               # Detalle de vacante
POST   /api/vacantes                   # Crear vacante (Empresa)
PUT    /api/vacantes/:id               # Actualizar vacante (Empresa)
DELETE /api/vacantes/:id               # Eliminar vacante (Empresa)
PATCH  /api/vacantes/:id/estado        # Cambiar estado (Empresa)
```

### **Postulaciones**
```
POST   /api/vacantes/postularse        # Postularse (Candidato)
GET    /api/vacantes/mis-postulaciones # Mis postulaciones (Candidato)
GET    /api/vacantes/:id/postulaciones # Postulaciones de vacante (Empresa)
PUT    /api/vacantes/postulaciones/:id # Actualizar estado (Empresa)
DELETE /api/vacantes/postulaciones/:id # Cancelar (Candidato)
```

### **Candidatos**
```
GET    /api/candidatos/mi-perfil       # Mi perfil (Candidato)
PUT    /api/candidatos                 # Actualizar perfil (Candidato)
GET    /api/candidatos/buscar          # Buscar candidatos (Empresa)
GET    /api/candidatos/:id             # Ver candidato
POST   /api/candidatos/cv              # Subir CV (Candidato)
DELETE /api/candidatos/cv              # Eliminar CV (Candidato)
```

### **Empresas**
```
GET    /api/empresas                   # Listar empresas
GET    /api/empresas/mi-empresa        # Mi empresa (Empresa)
GET    /api/empresas/:id               # Ver empresa
PUT    /api/empresas                   # Actualizar empresa (Empresa)
```

### **Documentos**
```
POST   /api/documentos                 # Subir documento (Candidato)
GET    /api/documentos/mis-documentos  # Mis documentos (Candidato)
GET    /api/documentos/candidato/:id   # Docs de candidato (Empresa)
PUT    /api/documentos/:id/verificar   # Verificar (Empresa)
PUT    /api/documentos/:id/archivo     # Actualizar archivo
DELETE /api/documentos/:id             # Eliminar documento
```

### **Pruebas Psicométricas**
```
POST   /api/pruebas-psicometricas      # Crear prueba
GET    /api/pruebas-psicometricas      # Listar pruebas
GET    /api/pruebas-psicometricas/:id  # Ver prueba
POST   /api/pruebas-psicometricas/asignar # Asignar (Empresa)
GET    /api/pruebas-psicometricas/mis-asignaciones # Mis pruebas (Candidato)
POST   /api/pruebas-psicometricas/iniciar/:id # Iniciar
POST   /api/pruebas-psicometricas/respuesta # Guardar respuesta
POST   /api/pruebas-psicometricas/finalizar/:id # Finalizar
GET    /api/pruebas-psicometricas/resultado/:id # Ver resultado
```

### **Pruebas Técnicas**
```
POST   /api/pruebas-tecnicas           # Asignar (Empresa)
GET    /api/pruebas-tecnicas/mis-pruebas # Mis pruebas (Candidato)
GET    /api/pruebas-tecnicas/candidato/:id # Pruebas de candidato
POST   /api/pruebas-tecnicas/:id/instrucciones # Subir instrucciones (Empresa)
POST   /api/pruebas-tecnicas/:id/respuesta # Subir respuesta (Candidato)
PUT    /api/pruebas-tecnicas/:id/evaluar # Evaluar (Empresa)
```

### **Pruebas Médicas**
```
POST   /api/pruebas-medicas            # Solicitar (Empresa)
GET    /api/pruebas-medicas/mis-pruebas # Mis pruebas (Candidato)
GET    /api/pruebas-medicas/candidato/:id # Pruebas de candidato
POST   /api/pruebas-medicas/:id/resultado # Subir resultado (Empresa)
PUT    /api/pruebas-medicas/:id/resultado # Actualizar
DELETE /api/pruebas-medicas/:id        # Eliminar
```

### **Entrevistas**
```
POST   /api/entrevistas                # Crear (Empresa)
GET    /api/entrevistas/mis-entrevistas # Mis entrevistas (Candidato)
GET    /api/entrevistas/empresa        # Entrevistas de empresa
PUT    /api/entrevistas/:id            # Actualizar
PUT    /api/entrevistas/:id/evaluar    # Evaluar
PATCH  /api/entrevistas/:id/cancelar   # Cancelar
```

### **Eventos**
```
POST   /api/eventos                    # Crear
GET    /api/eventos                    # Listar
GET    /api/eventos/mis-eventos        # Mis eventos (Candidato)
GET    /api/eventos/empresa            # Eventos de empresa
PUT    /api/eventos/:id                # Actualizar
PATCH  /api/eventos/:id/estado         # Cambiar estado
DELETE /api/eventos/:id                # Eliminar
```

### **Evaluaciones**
```
POST   /api/evaluaciones               # Crear (Empresa)
GET    /api/evaluaciones/empresa       # Mis evaluaciones
GET    /api/evaluaciones/estadisticas  # Estadísticas
GET    /api/evaluaciones/candidato/:id # Evaluaciones de candidato
GET    /api/evaluaciones/:id           # Ver evaluación
PUT    /api/evaluaciones/:id           # Actualizar
PATCH  /api/evaluaciones/:id/decision  # Tomar decisión
DELETE /api/evaluaciones/:id           # Eliminar
```

### **Admin**
```
POST   /api/admin/historial            # Registrar actividad
GET    /api/admin/historial            # Ver historial
GET    /api/admin/historial/estadisticas
GET    /api/admin/historial/usuario/:id
POST   /api/admin/reportes             # Generar reporte
GET    /api/admin/reportes             # Listar reportes
GET    /api/admin/reportes/:id         # Ver reporte
DELETE /api/admin/reportes/:id         # Eliminar reporte
```

**Total:** 104 endpoints REST funcionales

---

## 10. FLUJOS DE USUARIO

### 🔄 Flujo Completo: Candidato se Postula a Vacante

```
1. Candidato accede a /pages/candidato/vacantes.html
      ↓
2. Sistema carga vacantes: GET /api/vacantes
      ↓
3. Candidato busca/filtra vacantes
      ↓
4. Candidato ve detalles de vacante
      ↓
5. Candidato hace click en "Postularse"
      ↓
6. Controller valida que tenga CV
      ↓
7. Si no tiene CV → redireccionar a /pages/candidato/cv.html
      ↓
8. Si tiene CV → POST /api/vacantes/postularse
      ↓
9. Backend crea postulación con estado "pendiente"
      ↓
10. Frontend muestra mensaje de éxito
      ↓
11. Candidato puede ver en /pages/candidato/mis-postulaciones.html
```

### 🔄 Flujo: Empresa Evalúa Candidato

```
1. Empresa accede a /pages/empresa/detalle-vacante.html
      ↓
2. Ve lista de postulaciones de la vacante
      ↓
3. Hace click en un candidato
      ↓
4. Sistema carga: GET /api/candidatos/:id
      ↓
5. Empresa ve: CV, documentos, experiencia
      ↓
6. Decide cambiar estado de postulación
      ↓
7. PUT /api/vacantes/postulaciones/:id
      ↓
8. Estado cambia a "en_revision" o "preseleccionado"
      ↓
9. Empresa puede:
   - Asignar prueba técnica
   - Programar entrevista
   - Solicitar prueba médica
```

### 🔄 Flujo: Prueba Psicométrica Completa

```
1. Empresa asigna prueba a candidato
   POST /api/pruebas-psicometricas/asignar
      ↓
2. Candidato ve prueba en /pages/candidato/pruebas.html
   GET /api/pruebas-psicometricas/mis-asignaciones
      ↓
3. Candidato inicia prueba
   POST /api/pruebas-psicometricas/iniciar/:id
      ↓
4. Sistema muestra preguntas una por una
   GET /api/pruebas-psicometricas/:id
      ↓
5. Candidato responde cada pregunta
   POST /api/pruebas-psicometricas/respuesta
      ↓
6. Al terminar, candidato finaliza
   POST /api/pruebas-psicometricas/finalizar/:id
      ↓
7. Backend calcula resultado automáticamente
      ↓
8. Candidato y empresa pueden ver resultado
   GET /api/pruebas-psicometricas/resultado/:id
```

---

## 📚 RECURSOS Y DOCUMENTACIÓN

### Bootstrap 5.3
- Documentación: https://getbootstrap.com/docs/5.3/
- Icons: https://icons.getbootstrap.com/

### JavaScript
- MDN Web Docs: https://developer.mozilla.org/es/
- Fetch API: https://developer.mozilla.org/es/docs/Web/API/Fetch_API

### Backend
- Express: https://expressjs.com/
- Sequelize: https://sequelize.org/
- Firebase Admin: https://firebase.google.com/docs/admin/setup

---

## 🎯 CONCLUSIÓN

Este proyecto es una **Plataforma Web Completa** para gestión de recursos humanos con:

- ✅ Backend al 80% completo (104 endpoints funcionales)
- ✅ Arquitectura MVC sólida
- ✅ 20 modelos de base de datos
- ✅ Firebase Storage integrado
- ✅ Sistema de roles robusto
- ✅ Autenticación JWT

**El Frontend está estructurado y planificado** para ser desarrollado en 6 sprints (13-19 días de trabajo).

La arquitectura es **escalable, mantenible y profesional**, siguiendo las mejores prácticas de desarrollo web.

---

**Última actualización:** Octubre 2024
**Versión del documento:** 1.0
**Estado del proyecto:** Backend 80% - Frontend 0% (estructurado)
