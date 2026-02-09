# Notificaciones de pago (Webhooks) – Mercado Pago

## ¿Puedo marcar "Configuré las notificaciones de pago"?

**Sí**, cuando tengas esto listo:

1. **MERCADOPAGO_WEBHOOK_URL** en el `.env` del backend apuntando a una **URL pública** (no `localhost`).
2. El backend levantado y accesible en esa URL (en desarrollo, con túnel; en producción, con tu servidor).

El código del webhook ya está implementado: solo falta que Mercado Pago pueda llegar a tu servidor.

---

## Cómo configurar bien el webhook

### Opción A: Desarrollo local (con túnel)

Mercado Pago no puede llamar a `localhost`, así que hay que exponer tu backend con un túnel.

1. **Instalá ngrok** (o similar): [ngrok.com](https://ngrok.com).

2. **Levantá tu backend** en el puerto que uses (ej. 3000):
   ```bash
   npm run dev
   ```

3. **Creá el túnel** hacia ese puerto:
   ```bash
   ngrok http 3000
   ```
   Ngrok te dará una URL tipo `https://abc123.ngrok-free.app`.

4. **Configurá el `.env` del backend** con la URL pública del webhook:
   ```env
   MERCADOPAGO_WEBHOOK_URL=https://abc123.ngrok-free.app/api/pagos/webhook
   ```
   Reemplazá `abc123.ngrok-free.app` por la URL que te dio ngrok.

5. **Reiniciá el backend** para que tome el nuevo `.env`.

Cada vez que reiniciés ngrok, la URL puede cambiar y tendrás que actualizar `MERCADOPAGO_WEBHOOK_URL` (y reiniciar el backend).

### Opción B: Producción

1. Tu API debe estar en un servidor con URL pública, por ejemplo:
   `https://api.tudominio.com` o `https://tudominio.com/api`.

2. En el `.env` del backend (en el servidor):
   ```env
   MERCADOPAGO_WEBHOOK_URL=https://api.tudominio.com/api/pagos/webhook
   ```
   Usá la URL real donde esté desplegado tu backend.

3. Asegurate de que la ruta `POST /api/pagos/webhook` no esté bloqueada por firewall ni requiera login (el webhook no envía JWT; va sin autenticación).

---

## Qué hace el sistema (ya implementado)

1. **Al crear una preferencia** (cuando el usuario hace clic en "Pagar Cuota"), se envía a Mercado Pago una `notification_url` con cada preferencia. Esa URL es la que usa Mercado Pago para avisar cuando el pago se aprueba, se rechaza o queda pendiente.

2. **Endpoint del webhook**: `POST /api/pagos/webhook`  
   - Recibe el POST de Mercado Pago con `type` y `data.id` (id del pago en MP).  
   - Consulta el pago en la API de MP para obtener `external_reference` (id de nuestro pago) y `status`.  
   - Actualiza el pago en la base de datos y, si está aprobado, marca la cuota como pagada y actualiza el estado del deportista.

---

## (Opcional) Validar la firma del webhook

Si en [Tus integraciones](https://www.mercadopago.com.ar/developers/panel/app) configurás también la URL en **Webhooks > Configurar notificaciones**, Mercado Pago envía un header `x-signature`. Podés validarlo para asegurarte de que la notificación viene de Mercado Pago:

1. En el panel, en Webhooks, revelá la **clave secreta**.
2. En el `.env` del backend agregá:
   ```env
   MERCADOPAGO_WEBHOOK_SECRET=tu_clave_secreta
   ```
3. Con eso, el backend validará la firma y rechazará (401) las peticiones que no coincidan.

Si **no** configurás Webhooks en el panel y solo usás la `notification_url` de la preferencia, **no** definas `MERCADOPAGO_WEBHOOK_SECRET`; en ese caso no se valida firma y las notificaciones siguen funcionando.

---

## Resumen

| Qué | Estado |
|-----|--------|
| Recibir notificación en `POST /api/pagos/webhook` | Hecho |
| Obtener pago de MP y actualizar nuestro pago/cuota | Hecho |
| Enviar `notification_url` al crear la preferencia | Hecho |
| Validación opcional con `x-signature` | Hecho (si definís `MERCADOPAGO_WEBHOOK_SECRET`) |
| **Vos tenés que:** poner `MERCADOPAGO_WEBHOOK_URL` con URL pública | Pendiente hasta que lo configures |

En resumen: **sí podés tocar "Configuré las notificaciones de pago"** cuando tengas `MERCADOPAGO_WEBHOOK_URL` apuntando a una URL pública (túnel en desarrollo o dominio en producción) y el backend respondiendo en esa ruta.
