# Respuesta de implementación — Login Mobile MVP

**Fecha:** 2026-05-25

## Resumen

Se inicializó el proyecto Expo TypeScript en `forever/mobile/` (preservando `forever-mobile.pen`) e implementó el flujo completo de login para deportistas, con sesión persistente en SecureStore, navegación condicional y Home mínimo con acceso placeholder a Estado de Deuda.

## Archivos creados

| Archivo | Descripción |
|---------|-------------|
| `src/types/auth.ts` | Tipos LoginRequest, LoginResponse, AuthUser, AuthContextType |
| `src/config/api.ts` | Cliente axios con interceptor JWT |
| `src/config/storageKeys.ts` | Claves SecureStore |
| `src/services/authService.ts` | login, getMe |
| `src/services/deportistaService.ts` | getMiPerfil |
| `src/context/AuthContext.tsx` | Sesión global, bootstrap, login, logout |
| `src/screens/LoginScreen.tsx` | UI login con validaciones |
| `src/screens/HomeScreen.tsx` | Home mínimo post-login |
| `src/screens/DebtStatusScreen.tsx` | Placeholder MVP |
| `src/navigation/AppNavigator.tsx` | Auth gate + stacks |
| `src/navigation/types.ts` | Tipos de navegación |
| `.env.example` | URL backend documentada |
| `prompts/*.md` | Documentación del sprint |

## Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `App.tsx` | AuthProvider + SafeAreaProvider + AppNavigator |
| `package.json` | Nombre `forever-mobile`, dependencias navigation/axios/secure-store |
| `app.json` | Nombre/slug Forever Mobile, plugin expo-secure-store |
| `.gitignore` | Ignorar `.env` |

## Endpoints utilizados

| Método | Ruta | Uso |
|--------|------|-----|
| POST | `/api/auth/login` | Autenticación con DNI en campo `email` |
| GET | `/api/auth/me` | Restaurar sesión al iniciar app |
| GET | `/api/deportistas/mi-perfil` | Obtener deportistaId post-login |

## Librerías instaladas

- `@react-navigation/native`, `@react-navigation/native-stack`
- `react-native-screens`, `react-native-safe-area-context`
- `expo-secure-store`, `expo-linking`
- `axios`

## Decisiones técnicas

1. **Carpeta `src/`** en lugar de `app/` para evitar conflicto con Expo Router.
2. **axios** como cliente HTTP (misma convención que la web).
3. **DNI en campo `email`** del backend (convención existente).
4. **Gate DEPORTISTA** — rechaza ADMIN/ADMINISTRATIVO con mensaje claro.
5. **Token guardado antes de getMiPerfil** para que el interceptor funcione.
6. **Validación inline** sin react-hook-form/yup (MVP simple).
7. **WhatsApp** reutiliza número de la web: `5492211234567`.

## Verificación

- `npx tsc --noEmit` — OK
- `npx expo export --platform android` — OK (819 módulos)

## Problemas encontrados

- `create-expo-app` no permite directorio no vacío → scaffold en `_expo-tmp` y copia manual.
- Prompt interactivo de git durante scaffold → resuelto copiando archivos manualmente.

## Pendientes próxima iteración

- Implementar Estado de Deuda completo (cuotas pendientes, total adeudado).
- Integrar botón Mercado Pago si backend lo expone.
- Probar login end-to-end con backend Docker en dispositivo/emulador Android.
- Ajustar estilos finales según prototipo `forever-mobile.pen`.
- Agregar pantalla de splash/bootstrap branding.

## Cómo ejecutar

```bash
cd forever/mobile
cp .env.example .env   # ajustar EXPO_PUBLIC_API_URL según entorno
npm start
```

Para emulador Android con backend local: `EXPO_PUBLIC_API_URL=http://10.0.2.2:3000/api`  
Para celular físico: usar IP LAN de la PC, ej. `http://192.168.x.x:3000/api`
