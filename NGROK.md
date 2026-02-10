# Configuración con ngrok – Paso a paso

Con ngrok exponés tu backend (y opcionalmente el frontend) a internet para que Mercado Pago pueda enviar notificaciones al webhook y, si querés, usar la app desde una URL pública.

---

## 1. Instalar ngrok (una sola vez)

1. Entrá a [ngrok.com](https://ngrok.com), creá cuenta y descargá ngrok.
2. Descomprimí y dejá `ngrok.exe` en una carpeta del PATH, o usá desde la carpeta donde lo descargaste.

---

## 2. Autenticar ngrok (una sola vez)

Abrí una **terminal** (PowerShell o CMD) y ejecutá (reemplazá por tu Authtoken si es otro):

```bash
ngrok config add-authtoken 39RjLqWeL8Wave5HouISvtxDxDa_5WNJG6UXL3bcjNGBF1Mbx
```

Eso guarda el token en tu configuración local. Solo hace falta hacerlo una vez.

---

## 3. Exponer el backend (para el webhook de Mercado Pago)

### Paso A: Levantar el backend

En una terminal:

```bash
cd backend
npm run dev
```

Dejalo corriendo (puerto 3000 por defecto).

### Paso B: Crear el túnel con ngrok

En **otra** terminal:

```bash
ngrok http 3000
```

Se abre la consola de ngrok. Copiá la URL **HTTPS** que te muestra, algo como:

```
https://abc123.ngrok-free.app
```

### Paso C: Configurar el .env del backend

En el archivo **`backend/.env`**, actualizá la línea del webhook con la URL de ngrok:

```env
MERCADOPAGO_WEBHOOK_URL=https://abc123.ngrok-free.app/api/pagos/webhook
```

(Reemplazá `abc123.ngrok-free.app` por la URL que te dio ngrok.)

### Paso D: Reiniciar el backend

Volvé a la terminal donde corre el backend, detenelo (Ctrl+C) y volvé a ejecutar:

```bash
npm run dev
```

Listo: Mercado Pago ya puede notificar a tu backend cuando haya un pago.

---

## 4. Frontend: usar en local (recomendado con plan gratuito)

**En el plan gratuito de ngrok solo podés tener un túnel activo a la vez.** Si ya tenés `ngrok http 3000` para el backend, al ejecutar `ngrok http 5173` para el frontend aparece el error *"The endpoint ... is already online"* (ERR_NGROK_334).

**Solución recomendada:** Dejá **un solo túnel** (el del backend, puerto 3000) y usá la app así:

1. **Terminal 1 – Backend:** `cd backend && npm run dev`
2. **Terminal 2 – ngrok:** `ngrok http 3000` (dejalo abierto; esa URL está en `MERCADOPAGO_WEBHOOK_URL`)
3. **Terminal 3 – Frontend:** `cd frontend && npm run dev`

Abrí el navegador en **http://localhost:5173** y usá la app desde ahí. Las llamadas a la API van a `localhost:3000` y el webhook de Mercado Pago llega por la URL de ngrok. No hace falta exponer el frontend.

---

## 5. (Opcional) Exponer también el frontend

Solo es posible si tenés **dos túneles** (plan de pago de ngrok o otra herramienta). Con un solo túnel tenés que elegir:

- **Opción A:** Un túnel al **backend** (como ahora) → webhook OK, app en http://localhost:5173.
- **Opción B:** Cerrar ngrok del backend, abrir un túnel al **frontend** (5173) → la app sería pública pero Mercado Pago no podría notificar (el backend ya no está expuesto).

Para tener backend y frontend públicos a la vez necesitás dos túneles (por ejemplo ngrok de pago o dos instancias con `--domain` si tu plan lo permite).

---

## Resumen rápido

| Objetivo | Qué hacer |
|----------|-----------|
| Webhook de Mercado Pago + usar la app | Un túnel: `ngrok http 3000`. App en **http://localhost:5173**. Backend en 3000, frontend en 5173. |
| App por URL pública (celular, compartir) | Plan gratuito: no podés tener backend y frontend expuestos a la vez. Usá la app en localhost:5173. |

Cada vez que cierres y vuelvas a abrir ngrok, la URL puede cambiar (plan gratuito). Cuando cambie, actualizá `MERCADOPAGO_WEBHOOK_URL` en `backend/.env` y reiniciá el backend.
