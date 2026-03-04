# Notificaciones de pago (Webhooks) – Mercado Pago

## "Algo salió mal... Una de las partes es de prueba"

Ese mensaje aparece cuando **mezclás entorno de prueba con producción**:

- Tu app usa **credenciales de producción** (Access Token / Public Key de “Producción” en el panel) y quien paga es un **usuario de prueba**, **o**
- Tu app usa **credenciales de prueba** y quien paga es un usuario/cuenta **real** (tu cuenta de Mercado Pago).

Para que el pago funcione, ambos lados tienen que estar en el mismo modo.

### Cómo probar pagos sin cobrar de verdad (modo prueba)

**Importante:** Con credenciales de prueba, **quien paga también tiene que ser un comprador de prueba**. Si entrás al checkout con tu cuenta real de Mercado Pago, siempre va a salir "Una de las partes es de prueba".

1. En [Tus integraciones](https://www.mercadopago.com.ar/developers/panel/app) → tu aplicación → **Credenciales**.
2. Elegí **Credenciales de prueba** (no Producción).
3. Copiá el **Access Token** y la **Public Key** de prueba y ponelos en el `.env` del backend:
   - `MERCADOPAGO_ACCESS_TOKEN=` (el de prueba)
   - `MERCADOPAGO_PUBLIC_KEY=` (la de prueba)
4. Reiniciá el backend.
5. **Obtener el comprador de prueba:** En [Tus integraciones](https://www.mercadopago.com.ar/developers/panel/app) → tu app → menú **Cuentas de prueba** → **Comprador**. Ahí ves el **usuario** (email) y la **contraseña** del comprador de prueba.
6. **Pagar siempre con ese comprador:** Al hacer clic en "Pagar cuota" te redirige al checkout de Mercado Pago. Ahí **no** debes estar logueado con tu cuenta real. Abrí el link de pago en **ventana de incógnito** (o cerrá sesión en MP) y, cuando pida iniciar sesión, usá el **usuario** y **contraseña** del comprador de prueba del paso 5.
7. En el checkout hacé clic en **"Elegir otro medio de pago"** y agregá una tarjeta. Si preferís usuario de prueba, usá un **usuario de prueba** de Mercado Pago (creado en el panel en “Usuarios de prueba”) o las **tarjetas de prueba** que indica la documentación:  
   En el checkout hacé clic en **"Elegir otro medio de pago"** y agregá una tarjeta con estos datos de prueba:

   | Tipo        | Número               | CVV  | Vencimiento |
   |-------------|----------------------|------|-------------|
   | Visa crédito| 4509 9535 6623 3704 | 123  | 11/30       |
   | Mastercard crédito | 5031 7557 3453 0604 | 123 | 11/30  |
   | Visa débito| 4002 7686 9439 5619 | 123  | 11/30       |

   **Titular para pago aprobado:** nombre y apellido = **APRO**, DNI = **12345678**. Más escenarios en [Tarjetas de prueba](https://www.mercadopago.com.ar/developers/es/docs/your-integrations/test/cards).

Con credenciales de **producción** solo podés recibir pagos reales de usuarios reales (no de usuarios de prueba).

---

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

2. **¿Hay que poner el ID del pago a mano?** En general **no**:
   - **En producción:** Si tu backend tiene URL pública y tenés `MERCADOPAGO_WEBHOOK_URL` bien configurada, Mercado Pago llama al webhook cuando se aprueba el pago y **el sistema se actualiza solo**. El deportista no tiene que hacer nada.
   - **Al volver del checkout:** Cuando el usuario hace clic en "Volver al sitio" en Mercado Pago, la redirección suele incluir `payment_id` (o `collection_id`) en la URL. Al cargar la página de éxito, el frontend **sincroniza automáticamente** con ese ID; no hace falta escribir nada.
   - **Solo como respaldo:** Si el webhook no llegó (ej. en desarrollo sin ngrok) y además la URL de éxito no trajo el ID, en la página de éxito hay una opción para pegar el ID del pago y sincronizar a mano.

3. **Endpoint del webhook**: `POST /api/pagos/webhook`  
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
