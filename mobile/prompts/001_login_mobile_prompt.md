# Prompt — Login Mobile MVP

**Fecha de ejecución:** 2026-05-25  
**Objetivo:** Implementar la pantalla de login de la app móvil del sistema de pago de cuotas del Club For Ever (React Native + Expo), conectada al backend existente, con navegación mínima hacia Home y preparación para Estado de Deuda.

## Contexto

- Proyecto web existente: React frontend + Node.js backend.
- App móvil en `/mobile` para deportistas únicamente (sin funciones administrativas).
- MVP: Login, Home, Estado de deuda (placeholder en esta iteración).

## Requisitos funcionales

### RF-MOB-LOGIN-01 — DNI
- Campo numérico, no vacío, 7–8 dígitos.

### RF-MOB-LOGIN-02 — Contraseña
- Campo seguro, no vacío, mínimo 6 caracteres.

### RF-MOB-LOGIN-03 — Autenticación backend
- Consumir endpoint existente de login web.

### RF-MOB-LOGIN-04 — Sesión
- Context API + expo-secure-store para token y usuario.

### RF-MOB-LOGIN-05 — Errores en español
- Mensajes claros para credenciales incorrectas, conexión, validación.

### RF-MOB-LOGIN-06 — Loading
- Botón deshabilitado + indicador durante login.

## UI esperada

- Logo "FE"
- "CLUB SOCIAL CULTURAL Y DEPORTIVO FOR EVER"
- "Sistema de socios"
- "Iniciar sesión"
- Campos DNI y Contraseña
- Botón "Ingresar"
- "Olvidar contraseña → WhatsApp"

## Restricciones

- No modificar backend salvo necesidad.
- No implementar admin, reportes, ABM, historial, noticias, perfil, grupo familiar.
- Documentar en `/mobile/prompts`.

## Documentación técnica E1

- React Native + Expo
- React Navigation
- Context API
- expo-secure-store
- Backend Node.js existente
- Android prioritario, compatible iOS
