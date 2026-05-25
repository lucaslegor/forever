# Changelog Login Mobile

## Agregado

- Proyecto Expo TypeScript en `forever/mobile/`.
- `LoginScreen` con validaciones DNI/contraseña, loading y link WhatsApp.
- `AuthContext` con bootstrap de sesión, login, logout y gate rol DEPORTISTA.
- `authService` y `deportistaService` conectados al backend real.
- Cliente `api.ts` con axios e interceptor JWT desde SecureStore.
- `AppNavigator` con stacks Auth (Login) y App (Home, DebtStatus).
- `HomeScreen` mínimo con saludo, acceso a Estado de deuda y cerrar sesión.
- `DebtStatusScreen` placeholder para navegación MVP.
- `.env.example` con notas para emulador y celular físico.
- Documentación en `mobile/prompts/` (plan, prompt, response, changelog).

## Modificado

- `App.tsx` — integración AuthProvider + navegación.
- `package.json` — dependencias navigation, secure-store, axios.
- `app.json` — nombre Forever Mobile, plugin expo-secure-store.
- `.gitignore` — ignorar `.env`.

## Pendiente

- Implementar Estado de Deuda completo.
- Integrar botón de Mercado Pago.
- Prueba E2E login con backend Docker en Android.
- Refinar estilos según prototipo Pencil.
- Historial, Grupo Familiar, Noticias, Perfil (fuera de MVP).
