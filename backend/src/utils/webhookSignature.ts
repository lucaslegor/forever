import crypto from 'crypto';
import { env } from '../config/env';

/**
 * Valida la firma x-signature de notificaciones Webhook de Mercado Pago.
 * Documentación: https://www.mercadopago.com.ar/developers/es/docs/your-integrations/notifications/webhooks
 */
export function validateMercadoPagoWebhookSignature(
  req: { body: { data?: { id?: string | number } }; headers: Record<string, string | string[] | undefined> }
): boolean {
  const secret = env.MERCADOPAGO_WEBHOOK_SECRET;
  if (!secret) return true;

  const xSignature = req.headers['x-signature'];
  const xRequestId = req.headers['x-request-id'];
  const dataId = req.body?.data?.id;
  if (typeof xSignature !== 'string' || !dataId) return false;

  const parts = xSignature.split(',');
  let ts = '';
  let hash = '';
  for (const part of parts) {
    const [key, value] = part.split('=').map((s) => s.trim());
    if (key === 'ts') ts = value || '';
    else if (key === 'v1') hash = value || '';
  }
  if (!ts || !hash) return false;

  const dataIdStr = String(dataId);
  const idForManifest = /^[a-zA-Z0-9]+$/.test(dataIdStr) ? dataIdStr.toLowerCase() : dataIdStr;
  const requestId = typeof xRequestId === 'string' ? xRequestId : Array.isArray(xRequestId) ? xRequestId[0] : '';
  const manifest = `id:${idForManifest};request-id:${requestId};ts:${ts};`;

  const computed = crypto.createHmac('sha256', secret).update(manifest).digest('hex');
  return computed === hash;
}
