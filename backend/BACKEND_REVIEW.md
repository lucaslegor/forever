# Revisión del Backend - Club Forever

Resumen de lo que falta corregir o mejorar en el backend.

**Implementado (feb 2025):** Endpoints para el front (GET/POST /cuotas/socio, /administrativo, /admin/generar, PATCH estado, POST comprobante), webhook MP con external_reference, validación body confirmar pago, DATABASE_URL al arrancar, DESCUENTO_FAMILIAR en .env.example, README backend, rutas /api/historial y /api/reportes/deportistas.

---

## Crítico (bugs / incoherencias)

### 1. **Cuota: verificación de cuota existente sin `anio`**
**Archivo:** `src/services/cuota.service.ts` (método `asignar`)

La verificación de cuota duplicada usa solo `deportistaId`, `nroCuota` y `disciplinaId`, pero el modelo tiene `@@unique([deportistaId, nroCuota, anio, disciplinaId])`. Debe incluirse `anio` para no bloquear el mismo mes en otro año.

```ts
// Actual (incompleto)
where: {
  deportistaId: data.deportistaId,
  nroCuota: data.nroCuota,
  disciplinaId: data.disciplinaId,
}
// Debe incluir: anio: fechaEmision.getFullYear()
```

### 2. **Webhook Mercado Pago: no se encuentra el pago**
**Archivos:** `src/controllers/pago.controller.ts`, `src/services/pago.service.ts`

En el webhook se busca el pago por `getByMercadoPagoId(paymentId)`, pero en `pago.service.crear()` el `Pago` se crea **sin** `mercadoPagoId`. Ese ID solo se setea en `confirmarPago()`. Resultado: el webhook nunca encuentra el pago y no confirma.

**Opciones:**
- Al crear el pago con el SDK de Mercado Pago, guardar el `payment_id` (o `preference_id`) en `Pago.mercadoPagoId` (o en un campo auxiliar) antes de redirigir al usuario.
- O usar un `external_reference` / metadata en la preferencia de MP y en el webhook buscar por ese dato (ej. `pagoId` o `cuotaId`) en lugar de por `mercadoPagoId`.

### 3. **Params `deportistaId` sin validar**
**Archivos:** `src/routes/cuota.routes.ts`, `src/routes/pago.routes.ts`

Las rutas que usan `:deportistaId` no validan que sea un número:
- `GET /api/cuotas/deportista/:deportistaId`
- `GET /api/cuotas/estado-cuenta/:deportistaId`
- `GET /api/pagos/deportista/:deportistaId`

Si se envía algo como `deportistaId=abc`, `parseInt` devuelve `NaN` y Prisma puede devolver vacío o comportarse raro. Conviene un validador de params (ej. schema Zod para `deportistaId`) y responder 400 si no es numérico.

---

## Medio (consistencia y buenas prácticas)

### 4. **Uso de string en lugar de enum en `cuota.service`**
**Archivo:** `src/services/cuota.service.ts` (método `getEstadoCuenta`)

```ts
where: { estadoPago: 'APROBADO' }
```

Para consistencia y tipo, es mejor usar el enum de Prisma:

```ts
import { EstadoPago } from '@prisma/client';
// ...
where: { estadoPago: EstadoPago.APROBADO }
```

### 5. **Ruta POST `/pagos/:id/confirmar` sin validar body**
**Archivo:** `src/routes/pago.routes.ts`, `src/controllers/pago.controller.ts`

El controller espera `{ mercadoPagoId, status }` en el body pero no hay validador Zod. Si faltan o son inválidos, el error puede ser poco claro. Conviene un schema (ej. `confirmarPagoSchema`) y `validateBody(confirmarPagoSchema)` en la ruta.

### 6. **`DATABASE_URL` vacío en desarrollo**
**Archivo:** `src/config/env.ts`

Si `DATABASE_URL` no está en `.env`, queda `''` y `prisma.$connect()` falla con un mensaje poco amigable. Se puede:
- Validar al arrancar y lanzar un error claro si está vacío, o
- Documentar en README / .env.example que es obligatorio.

### 7. **Variable `DESCUENTO_FAMILIAR` no documentada en .env.example**
**Archivo:** `.env.example`

`env.ts` usa `DESCUENTO_FAMILIAR` (default 0.30). No está en `.env.example`. Conviene añadirla para que quien clone sepa que existe y puede configurarla.

---

## Menor (opcional)

### 8. **Código muerto en `cuota.controller.getEstadoCuenta`**
**Archivo:** `src/controllers/cuota.controller.ts`

La ruta `GET /api/cuotas/estado-cuenta/:deportistaId` tiene `requireAdministrativo`, por lo que `req.user.rol` nunca es `DEPORTISTA` en ese handler. La rama `if (req.user!.rol === Rol.DEPORTISTA)` no se ejecuta. Se puede simplificar y usar siempre `req.params.deportistaId` en esa ruta (y dejar el “mi estado” solo en `getMiEstadoCuenta`).

### 9. **Respuestas paginadas no unificadas**
En algunos endpoints se devuelve `{ data, total, page, limit, totalPages }` y en otros podría usarse `sendPaginated()` de `utils/response.ts` para un formato único. Revisar `user.service.getAllUsers`, `cuota.service.getByDeportista`, `pago.service.getByDeportista`, etc., y alinear con `PaginatedResponse`.

### 10. **Webhook de Mercado Pago sin verificación de firma**
**Archivo:** `src/controllers/pago.controller.ts` (método `webhook`)

El endpoint acepta cualquier POST. En producción conviene validar la firma/headers de MP para asegurarse de que el request viene de Mercado Pago (ver documentación de MP para webhooks).

---

## Resumen de acciones recomendadas

| Prioridad | Acción |
|-----------|--------|
| Crítico   | Incluir `anio` en la verificación de cuota existente en `cuota.service.asignar`. |
| Crítico   | Definir flujo para que el webhook de MP pueda encontrar el pago (guardar id de MP al crear pago o usar external_reference). |
| Crítico   | Validar param `deportistaId` en rutas de cuotas y pagos (Zod + validateParams). |
| Medio     | Usar `EstadoPago.APROBADO` en `cuota.service.getEstadoCuenta`. |
| Medio     | Añadir validador de body para `POST /pagos/:id/confirmar`. |
| Medio     | Validar o documentar `DATABASE_URL` obligatorio; añadir `DESCUENTO_FAMILIAR` a `.env.example`. |
| Menor     | Simplificar `getEstadoCuenta` y unificar formato de respuestas paginadas; opcionalmente firmar webhook MP. |
