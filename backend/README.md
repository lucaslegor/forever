# Backend - Club Forever

API REST del sistema de gestión de cuotas del Club Forever (Node.js + Express + Prisma + PostgreSQL).

## Requisitos

- Node.js 18+
- PostgreSQL 14+
- Cuenta Mercado Pago (para pagos)

## Instalación

```bash
cd backend
npm install
cp .env.example .env
# Editar .env con DATABASE_URL, JWT_SECRET y variables de Mercado Pago
npx prisma generate
npx prisma migrate deploy
```

## Variables de entorno

Copiar `.env.example` a `.env` y configurar:

| Variable | Obligatorio | Descripción |
|----------|-------------|-------------|
| `DATABASE_URL` | Sí | URL de PostgreSQL (ej: `postgresql://user:pass@localhost:5432/forever`) |
| `JWT_SECRET` | Sí | Secret para firmar tokens (cambiar en producción) |
| `FRONTEND_URL` | Sí | URL del frontend para CORS (ej: `http://localhost:5173`) |
| `MERCADOPAGO_ACCESS_TOKEN` | Para pagos | Token de acceso de Mercado Pago |
| `MERCADOPAGO_PUBLIC_KEY` | Para pagos | Clave pública de Mercado Pago |
| `DESCUENTO_FAMILIAR` | No | Descuento grupo familiar (0-1, ej: 0.30 = 30%). Default: 0.30 |

Ver `.env.example` para el resto.

## Comandos

```bash
npm run dev          # Desarrollo (tsx watch)
npm run build        # Compilar TypeScript
npm start            # Producción (node dist/server.js)
npm test             # Tests unitarios
npm run test:integration  # Tests de integración
npx prisma studio    # UI de la base de datos
npx prisma migrate dev   # Crear migración
npx prisma generate  # Regenerar cliente Prisma
```

## Estructura

```
src/
  app.ts, server.ts
  config/       # env, prisma
  controllers/ # Lógica HTTP
  middlewares/ # auth, validación, upload, errores
  routes/      # Rutas por recurso
  services/    # Lógica de negocio
  validators/  # Schemas Zod
  utils/       # errors, response
  types/
  __tests__/
prisma/
  schema.prisma
  migrations/
```

## API principal

Las respuestas tienen formato `{ success: true, data: T }`. El payload está en `response.data.data` (axios).

- **Auth:** `POST /api/auth/login`, `POST /api/auth/register`, `GET /api/auth/me`
- **Cuotas:** `GET /api/cuotas/socio`, `GET /api/cuotas/administrativo`, `POST /api/cuotas/admin/generar`, `GET /api/cuotas/mi-estado`, `PATCH /api/cuotas/:id/estado`, `POST /api/cuotas/socio/:cuotaId/comprobante`
- **Pagos:** `POST /api/pagos` (crear), `POST /api/pagos/webhook` (Mercado Pago), `GET /api/pagos/mis-pagos`
- **Deportistas:** `GET /api/deportistas`, `GET /api/deportistas/pagos-pendientes`, `GET /api/deportistas/mi-perfil`, `GET /api/deportistas/mi-historial`
- **Reportes:** `GET /api/historial`, `GET /api/reportes/deportistas/pagos-pendientes`, `GET /api/reportes/deportistas`

## Webhook Mercado Pago

El front debe crear la preferencia de pago con **external_reference** = `pago.id` (el ID del registro Pago creado con `POST /api/pagos`). Así el webhook puede localizar el pago y confirmarlo al recibir el evento de MP.

**Seguridad:** En producción conviene validar la firma del webhook de Mercado Pago (header `x-signature` y body) según la [documentación de MP](https://www.mercadopago.com.ar/developers/es/docs/your-integrations/notifications/webhooks).

## Docker

Desde la raíz del proyecto:

```bash
docker-compose up -d
```

El backend corre en el puerto 3000 y aplica migraciones al arrancar.
