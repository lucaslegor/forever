# Plan de Implementación — Login Mobile MVP

**Fecha:** 2026-05-25  
**Objetivo:** Implementar login mobile para deportistas del Club For Ever, conectado al backend existente, con sesión segura y navegación mínima hacia Home y placeholder de Estado de Deuda.

## Análisis del proyecto

| Área | Hallazgo |
|------|----------|
| `/mobile` | Solo contenía `forever-mobile.pen` y carpeta `export/` |
| Backend | Node.js + Express en puerto 3000 (Docker) |
| Login web | `POST /api/auth/login` con DNI en campo `email` |
| Referencia | `frontend/src/context/AuthContext.tsx`, `LoginForm.tsx` |

## Estructura implementada

```
mobile/
├── src/
│   ├── screens/       LoginScreen, HomeScreen, DebtStatusScreen
│   ├── navigation/    AppNavigator
│   ├── context/       AuthContext
│   ├── services/      authService, deportistaService
│   ├── config/        api, storageKeys
│   └── types/         auth
├── prompts/
├── App.tsx
├── .env.example
└── package.json
```

**Nota:** Se usó `src/` en lugar de `app/` para evitar conflicto futuro con Expo Router.

## Flujo de autenticación

1. Bootstrap lee token y usuario desde SecureStore.
2. Valida sesión con `GET /api/auth/me`.
3. Sin sesión → LoginScreen.
4. Login envía `{ email: dni, password }` a `POST /api/auth/login`.
5. Si rol !== DEPORTISTA → error.
6. Guarda token, obtiene perfil opcional, persiste usuario.
7. Navega a HomeScreen.
8. Logout limpia SecureStore.

## Endpoints utilizados

- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/deportistas/mi-perfil`

## Dependencias

- Expo SDK 56 + TypeScript
- React Navigation (native-stack)
- expo-secure-store, expo-linking
- axios

## Riesgos mitigados

| Riesgo | Mitigación |
|--------|------------|
| localhost en celular físico | Documentado en `.env.example` |
| Admin en mobile | Gate de rol DEPORTISTA |
| Token antes de getMiPerfil | Guardar token antes de llamada autenticada |

## Criterios de aceptación

- [x] App compila con Expo
- [x] LoginScreen funcional
- [x] Validaciones DNI/contraseña
- [x] Backend real consumido
- [x] Sesión en SecureStore
- [x] Navegación Login/Home
- [x] Errores en español
- [x] Logout funcional
- [x] Sin funciones administrativas
- [x] Backend sin cambios
- [x] Documentación en `/mobile/prompts`

## Pasos de implementación ejecutados

1. Scaffold Expo TypeScript
2. Infraestructura API y servicios
3. AuthContext con SecureStore
4. LoginScreen
5. Navegación + Home + placeholder DebtStatus
6. Verificación TypeScript + export Android
7. Documentación
