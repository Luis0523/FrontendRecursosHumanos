# 📋 SISTEMA DE PRUEBAS PSICOMÉTRICAS - PLATAFORMA ARCO

## 🎯 RESUMEN EJECUTIVO

Sistema completo para gestionar pruebas psicométricas integrado en la plataforma de gestión de talento humano ARCO. Permite a las empresas crear pruebas personalizadas, asignarlas a candidatos, y obtener resultados automáticos.

**Estado:** ✅ **100% COMPLETADO Y FUNCIONAL**

---

## 📦 COMPONENTES CREADOS

### **1. Servicio Frontend**
**Archivo:** `frontend/assets/js/services/pruebas.service.js`

Métodos disponibles:
- `crearPrueba(data)` - Crear nueva prueba
- `obtenerPruebas(filtros)` - Listar pruebas con filtros
- `obtenerPrueba(id)` - Obtener prueba con preguntas
- `actualizarPrueba(id, data)` - Actualizar prueba
- `eliminarPrueba(id)` - Eliminar prueba
- `crearPregunta(data)` - Crear pregunta
- `actualizarPregunta(id, data)` - Actualizar pregunta
- `eliminarPregunta(id)` - Eliminar pregunta
- `asignarPrueba(data)` - Asignar prueba a candidato
- `obtenerMisAsignaciones()` - Obtener pruebas asignadas (candidato)
- `iniciarPrueba(idAsignacion)` - Iniciar prueba
- `guardarRespuesta(data)` - Guardar respuesta de pregunta
- `finalizarPrueba(idAsignacion)` - Finalizar prueba
- `obtenerResultado(idAsignacion)` - Obtener resultados
- `obtenerPruebaCompleta(idAsignacion)` - Obtener prueba con preguntas para realizar

---

### **2. Página: Gestionar Pruebas (Empresa)**
**Archivos:**
- `frontend/pages/empresa/gestionar-pruebas.html`
- `frontend/pages/empresa/gestionar-pruebas.js`

**Características:**

#### Tab 1: Gestión de Pruebas
- ✅ Listado de todas las pruebas creadas
- ✅ Filtros por tipo (cognitiva, personalidad, habilidades, conocimientos)
- ✅ Filtros por estado (activa/inactiva)
- ✅ Crear nueva prueba con:
  - Nombre y descripción
  - Tipo de prueba
  - Duración en minutos (opcional)
  - Puntuación mínima aprobatoria (opcional)
  - Número de intentos permitidos
  - Orden aleatorio de preguntas
  - Estado activa/inactiva
- ✅ Editar pruebas existentes
- ✅ Eliminar pruebas (con confirmación)
- ✅ Ver número de preguntas por prueba

#### Tab 2: Gestión de Preguntas
- ✅ Ver todas las preguntas de una prueba seleccionada
- ✅ Crear pregunta con 4 tipos disponibles:

  **1. Opción Múltiple:**
  - Agregar múltiples opciones
  - Marcar cuál(es) son correctas
  - Checkbox para respuestas múltiples

  **2. Verdadero/Falso:**
  - Automáticamente crea 2 opciones
  - Radio buttons para respuesta única

  **3. Respuesta Abierta:**
  - Campo de texto libre
  - Evaluación manual por el reclutador
  - Sin opciones predefinidas

  **4. Escala de Valoración:**
  - Valores numéricos (ej: 1-5)
  - Útil para pruebas de personalidad
  - Cada opción tiene un valor asociado

- ✅ Asignar puntos a cada pregunta
- ✅ Editar preguntas existentes
- ✅ Eliminar preguntas (con confirmación)
- ✅ Ver opciones de respuesta con indicador de correcta

**Acceso:** Menú lateral → "Gestionar Pruebas" (icono clipboard-check)

---

### **3. Asignación de Pruebas desde Postulaciones**
**Archivos Modificados:**
- `frontend/pages/empresa/postulaciones.html`
- `frontend/pages/empresa/postulaciones.js`

**Características:**
- ✅ Botón "Asignar prueba" en cada postulación
- ✅ Modal de asignación con:
  - Selector de prueba (solo muestra pruebas activas)
  - Campo de fecha y hora límite (opcional)
  - Campo de instrucciones especiales (opcional)
- ✅ Confirmación de asignación exitosa
- ✅ Opción de cambiar estado de postulación a "Pruebas" automáticamente
- ✅ Vinculación automática: prueba → postulación → candidato

**Flujo:**
1. Empresa revisa postulaciones
2. Click en "Asignar prueba" (botón verde con icono clipboard-check)
3. Selecciona la prueba deseada
4. Opcional: Configura fecha límite e instrucciones
5. Confirma asignación
6. Sistema pregunta si desea cambiar estado a "Pruebas"

---

### **4. Página: Mis Pruebas (Candidato)**
**Archivos Actualizados:**
- `frontend/pages/candidato/pruebas.html`
- `frontend/pages/candidato/pruebas.js`

**Características:**
- ✅ Dashboard con estadísticas:
  - Total de pruebas asignadas
  - Pruebas pendientes
  - Pruebas completadas
  - Pruebas expiradas
- ✅ Listado de pruebas con tarjetas informativas:
  - Nombre y descripción de la prueba
  - Vacante y empresa asociada
  - Fecha de asignación
  - Fecha límite con contador visual
  - Estado (pendiente/completada/expirada)
  - Duración estimada
  - Número de preguntas
- ✅ Botón "Iniciar Prueba" para pruebas pendientes
- ✅ Botón "Ver Resultados" para pruebas completadas
- ✅ Indicador de tiempo restante con colores:
  - Gris: Más de 7 días
  - Amarillo: 3-7 días
  - Rojo parpadeante: Menos de 2 días
- ✅ Modal de resultados con:
  - Porcentaje obtenido
  - Puntaje numérico
  - Total de preguntas
  - Respuestas correctas/incorrectas
  - Estadísticas detalladas

**Acceso:** Menú lateral → "Pruebas" (icono clipboard-check)

---

### **5. Página: Realizar Prueba (Candidato)** ⭐ NUEVO
**Archivos:**
- `frontend/pages/candidato/realizar-prueba.html`
- `frontend/pages/candidato/realizar-prueba.js`

**Características Principales:**

#### Interfaz
- ✅ Header fijo con título de prueba y botones
- ✅ Temporizador visual en tiempo real (si la prueba tiene duración)
- ✅ Advertencia visual cuando quedan 5 minutos (parpadeo rojo)
- ✅ Auto-finalización cuando el tiempo se agota

#### Instrucciones Iniciales
- ✅ Pantalla de bienvenida con:
  - Descripción de la prueba
  - Total de preguntas
  - Duración (si aplica)
  - Puntuación mínima requerida
  - Instrucciones especiales del reclutador
  - Reglas importantes
- ✅ Botón "Comenzar Prueba" para iniciar

#### Durante la Prueba
- ✅ **Indicador de Progreso:**
  - Barra de progreso visual
  - Texto: "X/Y respondidas"
  - Badge con porcentaje
  - Puntos numerados clicables (navegación rápida)
  - Colores: Gris (sin responder), Verde (respondida), Azul (actual)

- ✅ **Navegación:**
  - Botones "Anterior" y "Siguiente"
  - Click en números para saltar a preguntas
  - Navegación libre entre preguntas

- ✅ **Tipos de Preguntas Soportados:**

  **1. Opción Múltiple / Verdadero-Falso:**
  - Tarjetas clicables con bordes destacados
  - Selección visual clara (fondo azul)
  - Radio buttons integrados
  - Auto-guardado al seleccionar

  **2. Respuesta Abierta:**
  - Textarea grande para escribir
  - Botón "Guardar Respuesta"
  - Texto de ayuda indicando evaluación manual

  **3. Escala de Valoración:**
  - Botones numéricos grandes (1-5)
  - Indicador visual "Menor ⟷ Mayor"
  - Auto-guardado al seleccionar
  - Highlight de la opción seleccionada

- ✅ **Auto-Guardado:**
  - Cada respuesta se guarda automáticamente en el backend
  - Notificación flotante: "Respuesta guardada" (2 segundos)
  - Sin necesidad de botón "Guardar" manual

- ✅ **Finalización:**
  - Botón "Finalizar Prueba" siempre visible
  - Confirmación antes de finalizar
  - Advertencia si hay preguntas sin responder
  - Cálculo automático de resultados
  - Redirección a página de resultados

#### Seguridad y UX
- ✅ Prevención de salida accidental (confirmación del navegador)
- ✅ Validación de prueba no completada previamente
- ✅ Validación de prueba no expirada
- ✅ Scroll automático al cambiar de pregunta
- ✅ Responsive design (funciona en móvil y desktop)
- ✅ Estilos modernos con animaciones sutiles

**URL de acceso:** `/pages/candidato/realizar-prueba.html?id={idAsignacion}`

---

## 🔄 FLUJO COMPLETO DEL SISTEMA

### Paso 1: Creación de Pruebas (Empresa)
1. Empresa ingresa a "Gestionar Pruebas"
2. Click en "Nueva Prueba"
3. Completa formulario:
   - Nombre: "Evaluación de Personalidad 16PF"
   - Tipo: "Personalidad"
   - Duración: 45 minutos
   - Puntuación mínima: 70
   - Intentos: 1
4. Guarda la prueba

### Paso 2: Agregar Preguntas (Empresa)
1. En la lista de pruebas, click en "Preguntas"
2. Se abre el tab de preguntas
3. Click en "Nueva Pregunta"
4. Completa:
   - Texto: "¿Cómo te describes en situaciones de estrés?"
   - Tipo: "Opción Múltiple"
   - Puntos: 5
5. Agrega opciones:
   - "Mantengo la calma y busco soluciones" ✅ (correcta)
   - "Me siento abrumado/a"
   - "Pido ayuda a otros"
   - "Evito la situación"
6. Guarda pregunta
7. Repite para todas las preguntas necesarias

### Paso 3: Asignación (Empresa)
1. Candidato postula a vacante (desde su dashboard)
2. Empresa revisa postulaciones
3. Click en botón "Asignar prueba" (verde)
4. Selecciona: "Evaluación de Personalidad 16PF"
5. Define fecha límite: 2025-11-15 18:00
6. Instrucciones: "Por favor completa en un solo intento"
7. Confirma asignación
8. Sistema pregunta: "¿Cambiar estado a Pruebas?" → Sí

### Paso 4: Notificación (Candidato)
1. Candidato ingresa a su dashboard
2. Ve en "Mis Pruebas" una nueva prueba asignada
3. Estado: PENDIENTE
4. Tiempo restante: "Vence en 7 días"

### Paso 5: Realización (Candidato)
1. Candidato click en "Iniciar Prueba"
2. Confirmación: "Una vez que inicies no podrás pausarla"
3. Confirma → Sistema llama backend `/iniciar/:id`
4. Pantalla de instrucciones con datos de la prueba
5. Click en "Comenzar Prueba"
6. **Temporizador inicia automáticamente**
7. **Primera pregunta se muestra**
8. Candidato responde pregunta → Auto-guardado
9. Click "Siguiente" → Segunda pregunta
10. Navega libremente entre preguntas
11. Responde todas las preguntas
12. Click "Finalizar Prueba"
13. Confirmación: "Has respondido 18 de 20 preguntas"
14. Confirma finalización
15. Backend calcula resultados automáticamente
16. Redirección a dashboard de pruebas

### Paso 6: Resultados (Candidato y Empresa)
1. **Candidato:** Click en "Ver Resultados"
   - Modal con porcentaje: 85%
   - Puntaje: 85/100
   - Correctas: 17, Incorrectas: 3

2. **Empresa:** En postulaciones ve:
   - Estado: "Pruebas Completadas"
   - Badge: "85% - Aprobado"
   - Puede ver detalles completos

---

## 📊 TIPOS DE PREGUNTAS - GUÍA RÁPIDA

### 1. Opción Múltiple
**Uso:** Preguntas con varias respuestas posibles, solo una correcta
**Ejemplo:**
```
Pregunta: ¿Cuál es la capital de Francia?
Opciones:
  ○ Madrid
  ● París (correcta)
  ○ Londres
  ○ Berlín
```
**Evaluación:** Automática

### 2. Verdadero/Falso
**Uso:** Afirmaciones que el candidato debe validar
**Ejemplo:**
```
Pregunta: JavaScript es un lenguaje de programación compilado
Opciones:
  ○ Verdadero
  ● Falso (correcta)
```
**Evaluación:** Automática

### 3. Respuesta Abierta
**Uso:** Preguntas que requieren análisis cualitativo
**Ejemplo:**
```
Pregunta: Describe una situación donde tuviste que liderar un equipo en crisis
Respuesta: [Campo de texto libre]
```
**Evaluación:** Manual por el reclutador

### 4. Escala de Valoración
**Uso:** Pruebas de personalidad, satisfacción, o autoevaluación
**Ejemplo:**
```
Pregunta: ¿Qué tan cómodo te sientes hablando en público?
Escala: [1] [2] [3] [4] [5]
        Nada         Muy cómodo
```
**Evaluación:** Automática por valor numérico

---

## 🔧 ENDPOINTS DEL BACKEND

Todos estos endpoints ya están implementados en el backend:

### Gestión de Pruebas
- `POST /api/pruebas-psicometricas` - Crear prueba
- `GET /api/pruebas-psicometricas` - Listar pruebas (con filtros opcionales)
- `GET /api/pruebas-psicometricas/:id` - Obtener prueba con preguntas
- `PUT /api/pruebas-psicometricas/:id` - Actualizar prueba
- `DELETE /api/pruebas-psicometricas/:id` - Eliminar prueba

### Gestión de Preguntas
- `POST /api/pruebas-psicometricas/preguntas` - Crear pregunta
- `PUT /api/pruebas-psicometricas/preguntas/:id` - Actualizar pregunta
- `DELETE /api/pruebas-psicometricas/preguntas/:id` - Eliminar pregunta

### Asignación y Realización
- `POST /api/pruebas-psicometricas/asignar` - Asignar prueba a candidato
- `GET /api/pruebas-psicometricas/mis-asignaciones` - Obtener mis pruebas (candidato)
- `GET /api/pruebas-psicometricas/asignacion/:id` - Obtener prueba completa para realizar
- `POST /api/pruebas-psicometricas/iniciar/:id_asignacion` - Iniciar prueba
- `POST /api/pruebas-psicometricas/respuesta` - Guardar respuesta
- `POST /api/pruebas-psicometricas/finalizar/:id_asignacion` - Finalizar prueba
- `GET /api/pruebas-psicometricas/resultado/:id_asignacion` - Obtener resultados

---

## 🗄️ ESTRUCTURA DE BASE DE DATOS

### 6 Tablas Principales:

**1. Pruebas**
- Almacena información general de cada prueba
- Campos: nombre, descripción, tipo, duración, puntuación_minima, activa, etc.

**2. Preguntas**
- Preguntas de cada prueba
- Campos: id_prueba, texto_pregunta, tipo_pregunta, puntos

**3. Opciones_Respuesta**
- Opciones para preguntas de tipo opción múltiple/verdadero-falso/escala
- Campos: id_pregunta, texto_opcion, es_correcta, valor_numerico

**4. Asignaciones_Prueba** (CRÍTICA)
- Relaciona: prueba → candidato → postulación
- Campos: id_prueba, id_candidato, id_postulacion, fecha_limite, estado, intentos_realizados

**5. Respuestas_Candidato**
- Respuestas individuales a cada pregunta
- Campos: id_asignacion, id_pregunta, id_opcion, texto_respuesta, tiempo_respuesta

**6. Resultados_Prueba**
- Resumen de resultados calculados
- Campos: id_asignacion, puntaje_obtenido, porcentaje, total_preguntas, respuestas_correctas, etc.

---

## 🎨 INTERFAZ DE USUARIO

### Colores y Estados
- **Azul (#0d6efd):** Principal, activo, en progreso
- **Verde (#198754):** Completado, correcto, aprobado
- **Amarillo (#ffc107):** Advertencia, pendiente
- **Rojo (#dc3545):** Error, expirado, reprobado
- **Gris (#6c757d):** Inactivo, sin responder

### Iconos Principales
- `bi-clipboard-check` - Pruebas/gestión
- `bi-speedometer2` - Dashboard
- `bi-clock` - Temporizador
- `bi-question-circle` - Preguntas
- `bi-check-circle` - Completado
- `bi-play-fill` - Iniciar
- `bi-arrow-left/right` - Navegación

---

## ✅ CHECKLIST DE FUNCIONALIDADES

### Para Empresas
- [x] Crear pruebas personalizadas
- [x] Definir tipos de prueba
- [x] Agregar preguntas de 4 tipos diferentes
- [x] Configurar puntuación y duración
- [x] Activar/desactivar pruebas
- [x] Editar pruebas y preguntas
- [x] Eliminar pruebas y preguntas
- [x] Asignar pruebas a candidatos desde postulaciones
- [x] Configurar fecha límite
- [x] Agregar instrucciones especiales
- [x] Ver resultados de candidatos

### Para Candidatos
- [x] Ver pruebas asignadas
- [x] Ver información detallada de cada prueba
- [x] Ver tiempo restante
- [x] Iniciar prueba
- [x] Responder preguntas de 4 tipos diferentes
- [x] Navegar libremente entre preguntas
- [x] Ver progreso en tiempo real
- [x] Auto-guardado de respuestas
- [x] Finalizar prueba
- [x] Ver resultados inmediatos

### Sistema
- [x] Auto-guardado de respuestas
- [x] Cálculo automático de resultados
- [x] Validación de intentos
- [x] Control de tiempo
- [x] Prevención de salida accidental
- [x] Responsive design
- [x] Integración completa con sistema de postulaciones

---

## 🚀 CÓMO USAR EL SISTEMA

### Como Empresa:
1. Login → Dashboard Empresa
2. Menú lateral → "Gestionar Pruebas"
3. Crear prueba → Agregar preguntas
4. Ir a "Postulaciones"
5. Asignar prueba a candidato deseado
6. Esperar a que complete la prueba
7. Ver resultados en postulaciones

### Como Candidato:
1. Login → Dashboard Candidato
2. Menú lateral → "Pruebas"
3. Ver pruebas asignadas
4. Click "Iniciar Prueba"
5. Completar todas las preguntas
6. Finalizar prueba
7. Ver resultados

---

## 📝 NOTAS TÉCNICAS

### Auto-Guardado
- Cada respuesta se guarda inmediatamente en el backend
- No se requiere botón "Guardar" manual
- Notificación visual confirma guardado exitoso
- Si hay error de red, muestra alerta

### Temporizador
- Solo se activa si la prueba tiene duración definida
- Cuenta regresiva en tiempo real
- Advertencia visual últimos 5 minutos
- Auto-finalización cuando llega a 0

### Navegación
- Libre entre preguntas
- Indicador visual de respondidas/sin responder
- Click en números para saltar directamente
- Botones anterior/siguiente deshabilitados en extremos

### Seguridad
- Validación de estado de prueba (no completada, no expirada)
- Confirmación antes de salir de la página
- Validación de intentos permitidos
- Control de fecha límite

---

## 🎓 EJEMPLOS DE USO

### Ejemplo 1: Prueba de Conocimientos Técnicos
```
Nombre: Evaluación JavaScript Avanzado
Tipo: Conocimientos
Duración: 30 minutos
Puntuación mínima: 75
Preguntas: 15 de opción múltiple
```

### Ejemplo 2: Prueba de Personalidad
```
Nombre: Test 16PF
Tipo: Personalidad
Duración: 45 minutos
Puntuación mínima: No aplica
Preguntas: 20 de escala (1-5)
```

### Ejemplo 3: Evaluación Mixta
```
Nombre: Evaluación Integral - Gerente
Tipo: Habilidades
Duración: 60 minutos
Puntuación mínima: 80
Preguntas:
  - 10 opción múltiple (conocimientos)
  - 5 respuesta abierta (análisis de casos)
  - 5 escala (autoevaluación)
```

---

## 🔍 TROUBLESHOOTING

### Problema: No aparece botón "Gestionar Pruebas"
**Solución:** Verifica que estés logueado como EMPRESA (no candidato)

### Problema: No puedo iniciar prueba
**Solución:** Verifica que la prueba no esté expirada o ya completada

### Problema: El temporizador no aparece
**Solución:** La prueba no tiene duración definida (es opcional)

### Problema: No se guardan las respuestas
**Solución:** Verifica conexión a internet y que el backend esté corriendo

### Problema: "Prueba no encontrada"
**Solución:** Verifica que el ID de asignación en la URL sea correcto

---

## 📚 DOCUMENTACIÓN ADICIONAL

Para más detalles técnicos sobre el backend:
- Ver: `/backend/DATABASE_STRUCTURE_REPORT.md`
- Ver: `/backend/PSYCHOMETRIC_TESTS_GUIDE.md`

---

## ✨ CONCLUSIÓN

El sistema de pruebas psicométricas está **100% funcional** e integrado con:
- ✅ Sistema de postulaciones
- ✅ Sistema de vacantes
- ✅ Sistema de candidatos
- ✅ Sistema de empresas

**Todas las funcionalidades están implementadas, probadas y listas para usar.**

---

**Fecha de creación:** 2025-11-07
**Versión:** 1.0.0
**Estado:** PRODUCCIÓN READY ✅
