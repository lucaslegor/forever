# Login implementation for mobile app
_Exported on 5/25/2026 at 17:44:28 GMT-3 from Cursor (3.5.33)_

---

**User**

@forever/mobile/forever-mobile.pen @forever/docs/doc_tecnica_e1.pdf @forever/docs/alcance_e1_app_movil.pdf 

Necesito que implementes el LOGIN de la aplicación móvil del sistema de pago de cuotas del Club For Ever.

## Contexto del proyecto

El sistema ya existe en versión web de escritorio, desarrollado con React en el frontend y Node.js en el backend.  
La versión web contiene funcionalidades administrativas, gestión de cuotas, pagos, reportes y usuarios.

Ahora se está desarrollando una versión móvil usando React Native + Expo, ubicada dentro de la carpeta:

/mobile

Esta app móvil será utilizada únicamente por usuarios/deportistas del club.  
No debe incluir funcionalidades administrativas. 

## Alcance del MVP móvil

Para esta primera entrega, el MVP móvil solo debe contemplar:

1. Pantalla de Login.
2. Pantalla principal o menú inicial.
3. Acceso a Estado de Deuda.
4. Pantalla de Estado de Deuda.
5. Flujo posterior hacia Mercado Pago, si ya existe integración backend disponible.

En esta tarea, necesito que te enfoques específicamente en implementar el Login de la app mobile y dejar preparada la navegación mínima para continuar luego con Estado de Deuda.

## Documentación técnica a respetar

La app móvil debe respetar la documentación técnica definida para E1:

- Framework: React Native con Expo.
- Ubicación del proyecto móvil: `/mobile`.
- Navegación: usar React Navigation.
- Gestión de estado: usar Context API para manejar sesión/autenticación.
- Comunicación con backend: consumir el backend ya existente de la versión web.
- Plataforma objetivo: Android como prioridad, dejando compatibilidad con iOS.
- La app debe ser simple, clara, con diseño mobile-first.
- El usuario objetivo es el deportista, no el administrador.
- No implementar reportes, ABM de usuarios, administración de cuotas ni funcionalidades administrativas.
- El login debe autenticar contra el backend existente.

## Objetivo de esta implementación

Implementar una pantalla de inicio de sesión mobile que permita al deportista ingresar con:

- DNI
- Contraseña

Al presionar “Ingresar”, la app debe enviar las credenciales al backend existente y, si la respuesta es correcta, guardar la sesión del usuario y redirigir al menú principal del MVP.

Si las credenciales son incorrectas o hay un error, debe mostrar un mensaje claro en español.

## Vista esperada del Login

La pantalla debe respetar el diseño conceptual del prototipo:

- Encabezado con logo o iniciales del club: “FE”.
- Texto: “CLUB SOCIAL CULTURAL Y DEPORTIVO FOR EVER”.
- Subtítulo: “Sistema de socios”.
- Título: “Iniciar sesión”.
- Campo DNI.
- Campo Contraseña.
- Botón principal: “Ingresar”.
- Link o texto secundario: “Olvidar contraseña → WhatsApp”.

El diseño debe ser prolijo, centrado, simple y adaptado a celular.

No hace falta que sea exactamente igual pixel por pixel, pero sí debe respetar la estructura visual y la intención del prototipo.

## Requisitos funcionales del Login

Implementar:

### RF-MOB-LOGIN-01 — Ingreso de DNI

El usuario debe poder ingresar su DNI en un campo de texto.

Validaciones mínimas:

- El DNI no puede estar vacío.
- Debe aceptar solo números.
- Debe tener una longitud razonable para DNI argentino.

### RF-MOB-LOGIN-02 — Ingreso de contraseña

El usuario debe poder ingresar su contraseña en un campo seguro.

Validaciones mínimas:

- La contraseña no puede estar vacía.
- Debe ocultarse el texto ingresado.

### RF-MOB-LOGIN-03 — Autenticación contra backend

Al presionar “Ingresar”, la app debe enviar DNI y contraseña al backend existente.

Antes de implementar, revisar el backend para identificar:

- Endpoint de login existente.
- Método HTTP.
- Body esperado.
- Formato de respuesta.
- Token o datos de usuario devueltos.

No inventar endpoints si ya existe uno.  
Si no existe endpoint de login, dejar documentado qué endpoint sería necesario crear, pero no modificar el backend sin necesidad.

### RF-MOB-LOGIN-04 — Manejo de sesión

Si el login es exitoso:

- Guardar el token o datos de sesión necesarios.
- Usar Context API para manejar el estado global de autenticación.
- Redirigir al usuario al menú principal de la app móvil.

Se recomienda usar `expo-secure-store` para guardar tokens o información sensible.

### RF-MOB-LOGIN-05 — Manejo de errores

Si ocurre un error:

- Mostrar mensaje en español.
- Ejemplo: “DNI o contraseña incorrectos”.
- Ejemplo: “No se pudo conectar con el servidor”.
- Ejemplo: “Completá todos los campos para continuar”.

No mostrar errores técnicos crudos al usuario.

### RF-MOB-LOGIN-06 — Estado de carga

Mientras se procesa el login:

- Deshabilitar el botón.
- Mostrar un indicador de carga o cambiar el texto del botón a “Ingresando...”.

## Requisitos no funcionales

Cumplir con:

### RNF-MOB-01 — Usabilidad

La pantalla debe ser simple, clara y fácil de usar por deportistas del club.

### RNF-MOB-02 — Accesibilidad básica

Agregar:

- Labels claros.
- Placeholders descriptivos.
- Botones visibles.
- Buen contraste.
- Tamaños de texto cómodos para móvil.

### RNF-MOB-03 — Seguridad

- No guardar contraseñas.
- No imprimir credenciales en consola.
- No dejar tokens hardcodeados.
- Usar variables de entorno para la URL del backend.
- Guardar tokens con `expo-secure-store`, no en texto plano.

### RNF-MOB-04 — Mantenibilidad

Separar responsabilidades:

- Pantallas en carpeta `screens`.
- Navegación en carpeta `navigation`.
- Contexto de autenticación en carpeta `context`.
- Servicios de API en carpeta `services`.
- Componentes reutilizables en carpeta `components`, si corresponde.
- Configuración en carpeta `config`, si corresponde.

### RNF-MOB-05 — Compatibilidad

Debe funcionar con Expo en Android.  
Evitar librerías que requieran configuración nativa compleja salvo que sean necesarias.

## Estructura esperada dentro de `/mobile`

Revisar primero si ya existe una estructura.  
No borrar archivos existentes sin necesidad.

Si no existe estructura clara, organizar de forma similar a esta:

mobile/
├── app/
│   ├── screens/
│   │   ├── LoginScreen.tsx
│   │   └── HomeScreen.tsx
│   ├── navigation/
│   │   └── AppNavigator.tsx
│   ├── context/
│   │   └── AuthContext.tsx
│   ├── services/
│   │   └── authService.ts
│   ├── config/
│   │   └── api.ts
│   └── components/
├── prompts/
│   └── 001_login_mobile.md
├── App.tsx
├── package.json
└── .env.example

Si el proyecto ya usa otra estructura, adaptarse a la existente sin romperla.

## Variables de entorno

Configurar la URL base del backend con variable de entorno.

Ejemplo:

EXPO_PUBLIC_API_URL=http://localhost:3000

Crear o actualizar:

.env.example

con las variables necesarias, pero no incluir datos sensibles reales.

Tener en cuenta que, si se prueba desde un celular físico, `localhost` no apunta a la computadora.  
Agregar una nota en la documentación indicando que para probar en celular se debe usar la IP local de la máquina o una URL pública del backend.

## Navegación mínima esperada

Implementar navegación con React Navigation.

Flujo esperado:

- Si el usuario NO está autenticado:
  - Mostrar LoginScreen.

- Si el usuario está autenticado:
  - Mostrar HomeScreen.

HomeScreen por ahora puede ser simple, pero debe dejar preparado el acceso a:

- Estado de deuda

No implementar todavía toda la lógica de Estado de Deuda salvo que ya exista y sea necesario para compilar.

## Pantalla Home mínima

Luego del login exitoso, mostrar una pantalla simple con:

- Texto: “Hola”
- Texto: “Bienvenido al club”
- Botón u opción: “Estado de deuda”
- Opción para cerrar sesión

No implementar Historial, Grupo Familiar, Noticias ni Perfil en esta tarea, porque no forman parte del MVP actual.

## Conexión con backend existente

Antes de codificar el login:

1. Revisar el backend de Node.js.
2. Buscar rutas relacionadas con auth, login, users, usuarios o session.
3. Identificar cómo autentica la versión web.
4. Reutilizar el mismo endpoint y formato.
5. Si la versión web ya tiene un service o cliente HTTP, tomarlo como referencia para mobile.

No duplicar lógica innecesaria.

## Librerías sugeridas

Usar o instalar si no están presentes:

- `@react-navigation/native`
- `@react-navigation/native-stack`
- `react-native-screens`
- `react-native-safe-area-context`
- `expo-secure-store`
- `axios` o `fetch`

Elegir una sola forma de consumir API.  
Preferentemente usar `axios` si el proyecto web ya lo usa; si no, usar `fetch`.

## Manejo de tipos

Si el proyecto mobile usa TypeScript, mantener TypeScript.

Definir interfaces mínimas:

- LoginRequest
- LoginResponse
- AuthUser
- AuthContextType

Evitar `any` salvo que sea estrictamente necesario.

## Criterios de aceptación

La tarea se considera completa cuando:

1. La app mobile compila correctamente con Expo.
2. Existe una pantalla de Login funcional.
3. El usuario puede ingresar DNI y contraseña.
4. Se validan campos vacíos.
5. Se consume el backend real del proyecto.
6. Si el login es exitoso, se guarda sesión y navega al Home.
7. Si el login falla, se muestra error en español.
8. Se puede cerrar sesión desde Home.
9. No se implementan funcionalidades administrativas.
10. No se implementan reportes.
11. No se implementan pantallas fuera del MVP salvo placeholders mínimos necesarios.
12. El código queda organizado y mantenible.
13. Se crea la carpeta `/mobile/prompts`.
14. Se guarda este prompt, la respuesta de Cursor y un resumen de lo implementado en archivos `.md`.

## Requisito obligatorio de documentación en `/mobile/prompts`

Crear una carpeta:

mobile/prompts/

Dentro de esa carpeta guardar archivos Markdown con el seguimiento de lo realizado.

Crear como mínimo:

mobile/prompts/001_login_mobile_prompt.md

Debe contener:

- Este prompt completo.
- Fecha de ejecución.
- Objetivo de la tarea.

Crear también:

mobile/prompts/001_login_mobile_response.md

Debe contener:

- Resumen de lo que se implementó.
- Archivos creados.
- Archivos modificados.
- Endpoints utilizados.
- Librerías instaladas.
- Decisiones técnicas tomadas.
- Problemas encontrados.
- Pendientes para la próxima iteración.

Crear además:

mobile/prompts/001_login_mobile_changelog.md

Debe contener un listado claro de cambios, por ejemplo:

# Changelog Login Mobile

## Agregado
- LoginScreen.
- AuthContext.
- Servicio de autenticación.
- Navegación entre Login y Home.
- Guardado de token con SecureStore.

## Modificado
- App.tsx.
- package.json, si se instalaron dependencias.

## Pendiente
- Implementar Estado de Deuda.
- Integrar botón de Mercado Pago.
- Mejorar estilos finales si corresponde.

## Restricciones importantes

No hacer lo siguiente:

- No implementar módulo administrativo.
- No implementar reportes.
- No implementar ABM de usuarios.
- No implementar gestión de cuotas desde la app móvil.
- No implementar historial de pagos en esta tarea.
- No implementar noticias.
- No implementar grupo familiar.
- No implementar perfil completo.
- No modificar el backend salvo que sea estrictamente necesario.
- No cambiar la lógica existente de la versión web.
- No eliminar archivos importantes del proyecto.
- No hardcodear credenciales.
- No guardar contraseñas.

## Resultado esperado

Al finalizar, necesito que el proyecto tenga el login móvil funcionando dentro de `/mobile`, conectado al backend existente, con navegación básica hacia Home y con toda la documentación de lo realizado guardada en `/mobile/prompts` en archivos `.md`.

Antes de aplicar cambios grandes, revisar la estructura actual del proyecto y adaptar la implementación a lo que ya existe.

---

**Cursor**

Estoy en modo Ask, así que no puedo implementar cambios; primero reviso el proyecto, el backend y la documentación para darte un plan concreto de implementación del login.


Estoy en **modo Ask**, así que no puedo crear archivos ni implementar el login en el repo. Para que lo haga automáticamente (scaffold Expo, pantallas, contexto, docs en `/mobile/prompts`), cambiá a **modo Agent**.

Mientras tanto, revisé el proyecto y te dejo un plan concreto basado en lo que ya existe.

---

## Estado actual del proyecto

| Área | Estado |
|------|--------|
| `/mobile` | Solo existe `forever-mobile.pen` (prototipo). **No hay proyecto Expo/React Native.** |
| Backend | Login listo en `POST /api/auth/login` |
| Frontend web | Login funcional con DNI + contraseña, reutilizable como referencia |
| `alcance_e1_app_movil.pdf` | No está en `forever/docs/` (solo `doc_tecnica_e1.pdf`) |

Hay que **inicializar el proyecto Expo** dentro de `/mobile` antes de implementar pantallas.

---

## Backend: endpoint de login (ya existe)

No hace falta crear un endpoint nuevo.

**Request**
- **Método:** `POST`
- **URL:** `http://<host>:3000/api/auth/login`
- **Body:**

```json
{
  "email": "12345678",
  "password": "tuContraseña"
}
```

Importante: aunque el campo se llame `email`, el backend acepta **DNI** ahí (igual que la web).

```17:40:forever/backend/src/services/auth.service.ts
  async login(data: LoginDTO): Promise<AuthResponse> {
    // Intentar login por email O por DNI (deportista/admin)
    let cuenta = await prisma.cuentaUsuario.findUnique({
      where: { email: data.email },
      // ...
    });

    // Si no se encuentra por email, buscar por DNI de deportista
    if (!cuenta) {
      const deportista = await prisma.deportista.findUnique({
        where: { dni: data.email }, // El frontend envía DNI en el campo 'email'
```

**Respuesta exitosa (200)**

```json
{
  "success": true,
  "data": {
    "token": "eyJ...",
    "user": {
      "id": 1,
      "email": "juan.perez@email.com",
      "rol": "DEPORTISTA",
      "nombre": "Juan",
      "apellido": "Pérez"
    }
  },
  "message": "Inicio de sesion exitoso"
}
```

**Errores típicos**

| Código | Mensaje backend |
|--------|-----------------|
| 401 | `Email o contrasena incorrectos` |
| 403 | `Usuario inhabilitado...` / `Usuario bloqueado temporalmente...` |
| 400 | `Error de validacion` (campos vacíos, contraseña &lt; 6 chars) |

**Endpoints útiles post-login**
- `GET /api/auth/me` — usuario autenticado
- `GET /api/deportistas/mi-perfil` — perfil del deportista (como en la web)

**Puerto del backend:** por defecto `3000` (`docker-compose.yml` y `backend/src/config/env.ts`). La web documenta `5000` en algunos archivos; verificá con el backend corriendo.

**CORS:** React Native no aplica CORS del navegador, así que la app móvil puede llamar al backend sin cambios en el backend.

---

## Referencia web a reutilizar

La web ya implementa el flujo que necesitás:

```5:7:forever/frontend/src/services/auth.service.ts
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', credentials);
    return response.data;
```

```81:85:forever/frontend/src/context/AuthContext.tsx
  const login = useCallback(async (dni: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    try {
      const response = await authService.login({ email: dni, password });
```

Para mobile: misma lógica, pero con `expo-secure-store` en lugar de `localStorage`.

---

## Plan de implementación recomendado

### 1. Inicializar Expo en `/mobile`

```bash
cd forever/mobile
npx create-expo-app@latest . --template blank-typescript
```

Instalar dependencias:

```bash
npx expo install @react-navigation/native @react-navigation/native-stack react-native-screens react-native-safe-area-context expo-secure-store
npm install axios
```

### 2. Estructura de carpetas

```
mobile/
├── app/
│   ├── screens/
│   │   ├── LoginScreen.tsx
│   │   └── HomeScreen.tsx
│   ├── navigation/
│   │   └── AppNavigator.tsx
│   ├── context/
│   │   └── AuthContext.tsx
│   ├── services/
│   │   └── authService.ts
│   ├── config/
│   │   └── api.ts
│   └── types/
│       └── auth.ts
├── prompts/
│   ├── 001_login_mobile_prompt.md
│   ├── 001_login_mobile_response.md
│   └── 001_login_mobile_changelog.md
├── App.tsx
├── .env.example
└── package.json
```

### 3. Variables de entorno

`.env.example`:

```env
# Emulador Android: http://10.0.2.2:3000/api
# Celular físico: http://192.168.x.x:3000/api (IP de tu PC)
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

Nota para celular físico: `localhost` apunta al teléfono, no a tu PC. Usá la IP local de la máquina (ej. `http://192.168.1.10:3000/api`).

### 4. Tipos mínimos (`app/types/auth.ts`)

```typescript
export interface LoginRequest {
  email: string; // DNI va aquí
  password: string;
}

export interface AuthUser {
  id: number;
  email: string;
  rol: string;
  loginId: string; // DNI ingresado
  deportistaId?: number;
}

export interface LoginResponse {
  success: boolean;
  data: {
    token: string;
    user: {
      id: number;
      email: string;
      rol: string;
      nombre?: string;
      apellido?: string;
    };
  };
  message?: string;
}
```

### 5. Cliente API (`app/config/api.ts`)

Patrón similar a la web, con token desde SecureStore:

```typescript
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

### 6. AuthContext (adaptación mobile)

Diferencias clave vs web:
- `SecureStore` para `token` y `forever_auth`
- Sin `console.log` de credenciales
- Tras login exitoso, opcionalmente llamar `GET /deportistas/mi-perfil` para `deportistaId`
- **Rechazar roles admin** en mobile: si `rol !== 'DEPORTISTA'`, mostrar *"Esta app es solo para deportistas del club"*

Mensajes de error en español (mapear desde `error.response?.data?.error`):
- Sin conexión → *"No se pudo conectar con el servidor"*
- 401 → *"DNI o contraseña incorrectos"*
- Validación local → *"Completá todos los campos para continuar"*

### 7. LoginScreen — UI según prototipo

Elementos:
- Logo/iniciales **"FE"** (círculo con fondo `#003366`, color web)
- *"CLUB SOCIAL CULTURAL Y DEPORTIVO FOR EVER"*
- *"Sistema de socios"*
- *"Iniciar sesión"*
- Campo DNI (`keyboardType="numeric"`, `maxLength={8}`)
- Campo contraseña (`secureTextEntry`)
- Botón *"Ingresar"* / *"Ingresando..."* con `ActivityIndicator`
- Link WhatsApp (como en web: `5492211234567`)

Validaciones DNI:
- No vacío
- Solo números: `/^\d+$/`
- Longitud 7–8 dígitos (DNI argentino)

### 8. Navegación (`AppNavigator.tsx`)

```typescript
// Si !user → LoginScreen
// Si user → HomeScreen (stack con placeholder DebtStatusScreen opcional)
```

`HomeScreen` mínima:
- "Hola"
- "Bienvenido al club"
- Botón "Estado de deuda" → placeholder `DebtStatusScreen`
- Botón "Cerrar sesión"

### 9. Documentación en `/mobile/prompts`

Los 3 archivos `.md` que pediste deben crearse al implementar (en Agent mode).

---

## Decisiones técnicas sugeridas

| Decisión | Recomendación |
|----------|---------------|
| HTTP client | `axios` (igual que la web) |
| Almacenamiento | `expo-secure-store` para token y usuario |
| Estado global | Context API (`AuthProvider`) |
| Navegación | `@react-navigation/native-stack` |
| Campo login backend | Enviar DNI en `email` (convención existente) |
| Solo deportistas | Validar `rol === 'DEPORTISTA'` post-login |
| URL backend | `EXPO_PUBLIC_API_URL` con `/api` al final |

---

## Criterios de aceptación — checklist

- [ ] Proyecto Expo inicializado en `/mobile`
- [ ] LoginScreen con validaciones DNI/contraseña
- [ ] `POST /api/auth/login` consumido
- [ ] Sesión en SecureStore + AuthContext
- [ ] Navegación Login ↔ Home según autenticación
- [ ] Errores en español, sin logs de credenciales
- [ ] Home con logout y acceso placeholder a Estado de Deuda
- [ ] `.env.example` con nota de IP para celular físico
- [ ] `/mobile/prompts/*.md` documentados

---

## Próximo paso

Si querés que lo implemente completo (scaffold, código, dependencias y documentación), **cambiá a modo Agent** y repetí el pedido (o decí "implementá el login mobile según el plan").

En Agent mode puedo:
1. Crear el proyecto Expo en `/mobile` sin borrar `forever-mobile.pen`
2. Implementar login conectado al backend real
3. Dejar Home + navegación mínima
4. Generar los 3 archivos en `/mobile/prompts`

---

**User**

# Prompt para Cursor — Plan de implementación Login Mobile MVP

Necesito que antes de implementar código hagas un PLAN TÉCNICO COMPLETO para desarrollar el login de la aplicación móvil del sistema de pago de cuotas del Club For Ever.

## Contexto general

El proyecto ya tiene una versión web de escritorio desarrollada con React y Node.js.

Ahora se está desarrollando una aplicación móvil dentro de la carpeta:

/mobile

La app móvil se hará con:

- React Native
- Expo
- TypeScript si el proyecto ya lo usa
- React Navigation
- Context API para manejar autenticación
- Backend existente de la versión web

La app móvil será utilizada solamente por deportistas/usuarios del club.

No debe incluir funcionalidades administrativas.

## Alcance actual del MVP móvil

El MVP móvil se va a enfocar solamente en:

1. Login.
2. Home/Menu principal.
3. Estado de deuda.
4. Detalle de cuotas pendientes dentro de Estado de deuda.
5. Botón de pago con Mercado Pago si ya existe integración disponible.

Pero en esta primera tarea solo quiero planificar e implementar el Login, dejando preparada la navegación hacia Home y Estado de deuda.

## Objetivo de este prompt

No quiero que implementes directamente.

Primero necesito que hagas un PLAN detallado de trabajo para implementar el login mobile correctamente.

El plan debe explicar:

- Qué archivos vas a revisar.
- Qué carpetas vas a usar.
- Qué dependencias hacen falta.
- Qué endpoints del backend vas a buscar.
- Cómo vas a manejar la sesión.
- Cómo vas a organizar la navegación.
- Cómo vas a validar los campos.
- Cómo vas a manejar errores.
- Cómo vas a dejar documentado todo dentro de `/mobile/prompts`.

## Documentación técnica a respetar

La implementación debe respetar la documentación técnica definida para la app mobile:

- Framework elegido: React Native + Expo.
- Plataforma objetivo: Android como prioridad, compatible con iOS.
- Navegación: React Navigation.
- Gestión de estado: Context API.
- Persistencia segura de sesión: preferentemente `expo-secure-store`.
- Comunicación con backend: usar el backend existente de Node.js.
- La app debe estar dentro de `/mobile`.
- La app debe consumir el backend real de la versión web.
- No crear lógica administrativa en mobile.
- No implementar reportes.
- No implementar ABM de usuarios.
- No implementar gestión de cuotas desde mobile.
- No implementar historial de pagos, noticias, perfil o grupo familiar en esta etapa.

## Tarea principal

Crear un plan para implementar una pantalla de Login mobile con:

- Campo DNI.
- Campo Contraseña.
- Botón “Ingresar”.
- Texto “Olvidar contraseña → WhatsApp”.
- Validaciones básicas.
- Conexión al backend.
- Manejo de sesión.
- Redirección al Home si el login es correcto.
- Mensajes de error en español si falla.

## Antes de planificar código

Primero revisá el proyecto actual y respondé:

1. ¿Existe ya la carpeta `/mobile`?
2. ¿Qué estructura tiene actualmente?
3. ¿Tiene Expo configurado?
4. ¿Usa JavaScript o TypeScript?
5. ¿Qué dependencias mobile ya están instaladas?
6. ¿Existe una estructura de navegación?
7. ¿Existe algún contexto global o manejo de sesión?
8. ¿Qué backend existe?
9. ¿Dónde están las rutas de autenticación del backend?
10. ¿Cómo hace login actualmente la versión web?
11. ¿Qué endpoint usa la versión web para iniciar sesión?
12. ¿Qué formato de request espera el backend?
13. ¿Qué formato de response devuelve el backend?
14. ¿Devuelve token, usuario, rol u otros datos?
15. ¿Dónde se debería guardar la URL base del backend?

## Plan técnico esperado

El plan debe estar dividido en fases.

Usar esta estructura:

# Plan de Implementación — Login Mobile MVP

## 1. Análisis inicial del proyecto

Explicar qué se encontró en:

- `/mobile`
- frontend web
- backend
- rutas de autenticación
- servicios existentes
- variables de entorno

## 2. Alcance exacto de la implementación

Indicar claramente qué se va a implementar:

- LoginScreen.
- AuthContext.
- Servicio de autenticación.
- Configuración de API.
- Navegación inicial.
- HomeScreen mínimo.
- Guardado seguro de sesión.
- Logout básico.

Indicar también qué NO se va a implementar:

- Reportes.
- ABM usuarios.
- Panel administrativo.
- Gestión de cuotas.
- Historial de pagos.
- Noticias.
- Perfil completo.
- Grupo familiar.
- Estado de deuda completo, salvo navegación placeholder si hace falta.

## 3. Arquitectura propuesta dentro de `/mobile`

Proponer una estructura clara de carpetas.

Ejemplo orientativo:

mobile/
├── app/
│   ├── screens/
│   │   ├── LoginScreen.tsx
│   │   └── HomeScreen.tsx
│   ├── navigation/
│   │   └── AppNavigator.tsx
│   ├── context/
│   │   └── AuthContext.tsx
│   ├── services/
│   │   └── authService.ts
│   ├── config/
│   │   └── api.ts
│   ├── types/
│   │   └── auth.ts
│   └── components/
├── prompts/
│   ├── 001_login_mobile_plan.md
│   ├── 001_login_mobile_prompt.md
│   ├── 001_login_mobile_response.md
│   └── 001_login_mobile_changelog.md
├── App.tsx
├── .env.example
└── package.json

Si el proyecto ya tiene otra estructura, adaptar el plan a la estructura existente sin romperla.

## 4. Dependencias necesarias

Listar dependencias necesarias y explicar para qué sirve cada una.

Considerar:

- `@react-navigation/native`
- `@react-navigation/native-stack`
- `react-native-screens`
- `react-native-safe-area-context`
- `expo-secure-store`
- `axios` o `fetch`

Antes de instalar, verificar si ya existen.

No instalar dependencias duplicadas.

## 5. Variables de entorno

Planificar cómo manejar la URL del backend.

Crear o actualizar:

.env.example

Ejemplo:

EXPO_PUBLIC_API_URL=http://localhost:3000

Agregar una nota indicando que si se prueba desde celular físico, no debe usarse `localhost`, sino la IP local de la computadora o una URL pública del backend.

## 6. Flujo de autenticación

Explicar el flujo completo:

1. Usuario abre la app.
2. Si no hay sesión guardada, ve LoginScreen.
3. Ingresa DNI y contraseña.
4. Se validan campos.
5. Se envía request al backend.
6. Si login es exitoso, se guarda token/datos de sesión.
7. Se actualiza AuthContext.
8. Se redirige a HomeScreen.
9. Si falla, se muestra error en español.
10. Si cierra sesión, se borra token y vuelve al Login.

## 7. Validaciones del formulario

Definir validaciones:

- DNI obligatorio.
- DNI solo numérico.
- DNI con longitud razonable.
- Contraseña obligatoria.
- No enviar formulario si hay errores.
- Mostrar mensajes claros en español.

Ejemplos:

- “Ingresá tu DNI.”
- “El DNI debe contener solo números.”
- “Ingresá tu contraseña.”
- “DNI o contraseña incorrectos.”
- “No se pudo conectar con el servidor.”

## 8. Conexión con backend

Buscar y documentar:

- Endpoint exacto de login.
- Método HTTP.
- Body esperado.
- Headers necesarios.
- Respuesta exitosa.
- Respuesta con error.
- Dónde se guarda el token.
- Cómo identifica el rol del usuario.

Importante:

No inventar endpoints si ya existe uno.

Si no existe un endpoint compatible, explicar qué endpoint haría falta crear, pero no modificar backend sin autorización.

## 9. Seguridad

Planificar medidas mínimas:

- No guardar contraseñas.
- No mostrar credenciales en consola.
- No hardcodear tokens.
- No hardcodear URL final del backend.
- Usar `expo-secure-store` para token.
- Manejar errores sin exponer detalles técnicos al usuario.
- Verificar que el usuario autenticado sea deportista o usuario mobile, no administrador.

## 10. Navegación

Planificar navegación con React Navigation.

Flujo mínimo:

- AuthStack:
  - LoginScreen

- AppStack:
  - HomeScreen
  - EstadoDeDeudaScreen placeholder si hace falta

En esta tarea, HomeScreen puede ser básico y Estado de Deuda puede quedar como pantalla pendiente o placeholder.

## 11. Diseño del Login

Planificar la pantalla con esta estructura visual:

- Logo o círculo con “FE”.
- Nombre: “CLUB SOCIAL CULTURAL Y DEPORTIVO FOR EVER”.
- Subtítulo: “Sistema de socios”.
- Título: “Iniciar sesión”.
- Input DNI.
- Input Contraseña.
- Botón “Ingresar”.
- Link “Olvidar contraseña → WhatsApp”.

El diseño debe ser simple, limpio y mobile-first.

## 12. Archivos a crear o modificar

Armar una tabla con:

| Archivo | Acción | Motivo |
|---|---|---|
| mobile/App.tsx | Modificar | Conectar navegación y AuthProvider |
| mobile/app/screens/LoginScreen.tsx | Crear | Pantalla de login |
| mobile/app/screens/HomeScreen.tsx | Crear | Pantalla inicial posterior al login |
| mobile/app/context/AuthContext.tsx | Crear | Manejo global de sesión |
| mobile/app/services/authService.ts | Crear | Comunicación con backend |
| mobile/app/config/api.ts | Crear | Configuración de URL base |
| mobile/app/types/auth.ts | Crear | Tipos de autenticación |
| mobile/.env.example | Crear/Modificar | Variables necesarias |
| mobile/prompts/001_login_mobile_plan.md | Crear | Guardar plan |
| mobile/prompts/001_login_mobile_response.md | Crear | Guardar respuesta |
| mobile/prompts/001_login_mobile_changelog.md | Crear | Guardar cambios |

Adaptar esta tabla según la estructura real del proyecto.

## 13. Criterios de aceptación

El plan debe indicar que la implementación se considerará terminada cuando:

1. La app mobile compile con Expo.
2. Se vea la pantalla de Login.
3. El usuario pueda ingresar DNI y contraseña.
4. Se validen campos vacíos y DNI inválido.
5. Se consuma el endpoint real del backend.
6. Login exitoso guarde sesión.
7. Login exitoso redirija a Home.
8. Login fallido muestre error en español.
9. Se pueda cerrar sesión.
10. No haya funcionalidades administrativas.
11. No se modifique backend salvo necesidad justificada.
12. Se documenten los cambios en `/mobile/prompts`.

## 14. Riesgos y decisiones pendientes

Identificar posibles riesgos:

- No encontrar endpoint de login.
- Diferencia entre login web y login mobile.
- Problemas de CORS o conexión desde celular.
- Backend usando `localhost`.
- Formato de respuesta no documentado.
- Falta de token o sesión persistente.
- Usuarios administradores entrando a mobile.
- Dependencias incompatibles con Expo.

Para cada riesgo, proponer una solución.

## 15. Documentación obligatoria en `/mobile/prompts`

Crear la carpeta:

mobile/prompts/

Guardar el plan en:

mobile/prompts/001_login_mobile_plan.md

Este archivo debe incluir:

- El objetivo.
- El análisis del proyecto.
- La estructura propuesta.
- El flujo de autenticación.
- Los endpoints encontrados.
- Los archivos a modificar.
- Los riesgos.
- Los criterios de aceptación.
- Los pasos de implementación.

Además, cuando luego se implemente, se deberá guardar:

mobile/prompts/001_login_mobile_prompt.md  
mobile/prompts/001_login_mobile_response.md  
mobile/prompts/001_login_mobile_changelog.md

## Formato de respuesta esperado

Primero respondé únicamente con el plan.

No implementes código todavía.

Al final del plan, agregá una sección:

## Próximo paso recomendado

Indicar exactamente qué se debería implementar primero y pedir confirmación antes de tocar archivos.

## Restricciones importantes

No hacer todavía:

- No crear código.
- No modificar archivos.
- No instalar dependencias.
- No cambiar backend.
- No implementar pantallas fuera del login.
- No implementar reportes.
- No implementar funciones administrativas.

Primero necesito revisar y aprobar el plan.

---

**Cursor**

Reviso el estado actual del proyecto para armar un plan técnico preciso antes de proponer la implementación.


Tengo el contexto del backend, la web y el estado de `/mobile`; armo el plan técnico completo.


---

**User**

Implement the plan as specified, it is attached for your reference. Do NOT edit the plan file itself.

To-do's from the plan have already been created. Do not create them again. Mark them as in_progress as you work, starting with the first one. Don't stop until you have completed all the to-dos.

---

**Cursor**

Implementando el plan: inicializo Expo en `/mobile` y avanzo fase por fase.


Creando la infraestructura y los archivos de la app en `src/`.


Corrigiendo el flujo de login: guardar el token antes de llamar a `getMiPerfil`.


