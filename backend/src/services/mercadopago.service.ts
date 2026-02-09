import MercadoPagoConfig, { Preference, Payment } from 'mercadopago';
import { env } from '../config/env';

const config = new MercadoPagoConfig({
  accessToken: env.MERCADOPAGO_ACCESS_TOKEN,
});

const preferenceClient = new Preference(config);
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

  const body = {
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
      success: env.MERCADOPAGO_SUCCESS_URL || undefined,
      failure: env.MERCADOPAGO_FAILURE_URL || undefined,
      pending: env.MERCADOPAGO_PENDING_URL || undefined,
    },
    auto_return: 'approved' as const,
    external_reference: String(pagoId),
    notification_url: env.MERCADOPAGO_WEBHOOK_URL || undefined,
  };

  const response = await preferenceClient.create({ body });

  const initPoint = response.init_point || response.sandbox_init_point || '';
  const preferenceId = response.id || '';

  return {
    initPoint,
    sandboxInitPoint: response.sandbox_init_point,
    preferenceId,
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
