import MercadoPagoConfig, { Payment } from 'mercadopago';
import { env } from '../config/env';

const config = new MercadoPagoConfig({
  accessToken: env.MERCADOPAGO_ACCESS_TOKEN,
});

const paymentClient = new Payment(config);

export interface CrearPreferenciaParams {
  pagoId: number;
  title: string;
  unitPrice: number;
}

export interface CrearPreferenciaResult {
  initPoint: string;
  sandboxInitPoint?: string;
  preferenceId: string;
}

export async function crearPreferenciaPago(params: CrearPreferenciaParams): Promise<CrearPreferenciaResult> {
  const { pagoId, title, unitPrice } = params;

  // Siempre usar FRONTEND_URL para back_urls (la redirección post-pago es al frontend)
  const base = (env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
  const successUrl = `${base}/pagos/success`;
  const failureUrl = `${base}/pagos/failure`;
  const pendingUrl = `${base}/pagos/pending`;

  // Llamada directa a la API REST (el SDK a veces provoca "back_url.success must be defined" con auto_return)
  const body: Record<string, unknown> = {
    items: [
      {
        id: `pago-${pagoId}`,
        title: title.length > 127 ? title.slice(0, 124) + '...' : title,
        quantity: 1,
        unit_price: Number(unitPrice),
        currency_id: 'ARS',
      },
    ],
    back_urls: {
      success: successUrl,
      failure: failureUrl,
      pending: pendingUrl,
    },
    external_reference: String(pagoId),
    payment_methods: {
      installments: 1,
      excluded_payment_types: [{ id: 'consumer_credits' }],
    },
  };
  // Sin auto_return: el usuario vuelve con el botón "Volver al sitio" (evita error de la API)
  // body.auto_return = 'approved';
  if (env.MERCADOPAGO_WEBHOOK_URL) {
    body.notification_url = env.MERCADOPAGO_WEBHOOK_URL;
  }

  if (process.env.NODE_ENV !== 'production') {
    console.log('[MercadoPago] Creando preferencia con back_urls:', body.back_urls);
  }

  const res = await fetch('https://api.mercadopago.com/checkout/preferences', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.MERCADOPAGO_ACCESS_TOKEN}`,
    },
    body: JSON.stringify(body),
  });

  const data = (await res.json()) as {
    init_point?: string;
    sandbox_init_point?: string;
    id?: string;
    message?: string;
    error?: string | string[];
  };

  if (!res.ok) {
    const msg = data.message ?? data.error ?? JSON.stringify(data);
    throw new Error(typeof msg === 'string' ? msg : Array.isArray(msg) ? msg.join(' ') : String(msg));
  }

  const initPoint = data.init_point || data.sandbox_init_point || '';
  const preferenceId = data.id || '';
  const response = { init_point: initPoint, sandbox_init_point: data.sandbox_init_point, id: preferenceId };

  return {
    initPoint,
    sandboxInitPoint: response.sandbox_init_point,
    preferenceId,
  };
}

/** Preferencia para pagar la seña de una reserva de cancha (external_reference = "reserva-{id}") */
export interface CrearPreferenciaReservaSenaParams {
  reservaId: number;
  title: string;
  unitPrice: number;
  /** Email del pagador; si se envía, Mercado Pago puede pre-llenar el checkout y habilitar el botón Pagar. */
  payerEmail?: string | null;
}

export async function crearPreferenciaReservaSena(
  params: CrearPreferenciaReservaSenaParams
): Promise<CrearPreferenciaResult> {
  const { reservaId, title, unitPrice, payerEmail } = params;
  const base = (env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
  const successUrl = `${base}/pagos/success?origen=reserva`;
  const failureUrl = `${base}/pagos/failure?origen=reserva`;
  const pendingUrl = `${base}/pagos/pending?origen=reserva`;

  const body: Record<string, unknown> = {
    items: [
      {
        id: `reserva-${reservaId}`,
        title: title.length > 127 ? title.slice(0, 124) + '...' : title,
        quantity: 1,
        unit_price: Number(unitPrice),
        currency_id: 'ARS',
      },
    ],
    back_urls: { success: successUrl, failure: failureUrl, pending: pendingUrl },
    external_reference: `reserva-${reservaId}`,
    payment_methods: {
      installments: 1,
      excluded_payment_types: [{ id: 'consumer_credits' }],
    },
  };
  if (payerEmail && payerEmail.trim()) {
    body.payer = { email: payerEmail.trim() };
  }
  if (env.MERCADOPAGO_WEBHOOK_URL) {
    body.notification_url = env.MERCADOPAGO_WEBHOOK_URL;
  }

  const res = await fetch('https://api.mercadopago.com/checkout/preferences', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.MERCADOPAGO_ACCESS_TOKEN}`,
    },
    body: JSON.stringify(body),
  });

  const data = (await res.json()) as {
    init_point?: string;
    sandbox_init_point?: string;
    id?: string;
    message?: string;
    error?: string | string[];
  };

  if (!res.ok) {
    const msg = data.message ?? data.error ?? JSON.stringify(data);
    throw new Error(typeof msg === 'string' ? msg : Array.isArray(msg) ? msg.join(' ') : String(msg));
  }

  return {
    initPoint: data.init_point || data.sandbox_init_point || '',
    sandboxInitPoint: data.sandbox_init_point,
    preferenceId: data.id || '',
  };
}

export async function getPaymentById(paymentId: string): Promise<{ external_reference?: string; status?: string } | null> {
  try {
    const payment = await paymentClient.get({ id: paymentId });
    return {
      external_reference: payment.external_reference,
      status: payment.status,
    };
  } catch {
    return null;
  }
}
