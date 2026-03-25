"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.crearPreferenciaPago = crearPreferenciaPago;
exports.crearPreferenciaReservaSena = crearPreferenciaReservaSena;
exports.getPaymentById = getPaymentById;
const mercadopago_1 = __importStar(require("mercadopago"));
const env_1 = require("../config/env");
const config = new mercadopago_1.default({
    accessToken: env_1.env.MERCADOPAGO_ACCESS_TOKEN,
});
const paymentClient = new mercadopago_1.Payment(config);
async function crearPreferenciaPago(params) {
    const { pagoId, title, unitPrice, payerEmail } = params;
    // Siempre usar FRONTEND_URL para back_urls (la redirección post-pago es al frontend)
    const base = (env_1.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
    const successUrl = `${base}/pagos/success`;
    const failureUrl = `${base}/pagos/failure`;
    const pendingUrl = `${base}/pagos/pending`;
    // Llamada directa a la API REST (el SDK a veces provoca "back_url.success must be defined" con auto_return)
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
    if (payerEmail && payerEmail.trim().length > 0) {
        body.payer = { email: payerEmail.trim() };
    }
    // Sin auto_return: el usuario vuelve con el botón "Volver al sitio" (evita error de la API)
    // body.auto_return = 'approved';
    if (env_1.env.MERCADOPAGO_WEBHOOK_URL) {
        body.notification_url = env_1.env.MERCADOPAGO_WEBHOOK_URL;
    }
    const res = await fetch('https://api.mercadopago.com/checkout/preferences', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${env_1.env.MERCADOPAGO_ACCESS_TOKEN}`,
        },
        body: JSON.stringify(body),
    });
    const data = (await res.json());
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
async function crearPreferenciaReservaSena(params) {
    const { reservaId, title, unitPrice, payerEmail } = params;
    const base = (env_1.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
    const successUrl = `${base}/pagos/success?origen=reserva`;
    const failureUrl = `${base}/pagos/failure?origen=reserva`;
    const pendingUrl = `${base}/pagos/pending?origen=reserva`;
    const body = {
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
    if (env_1.env.MERCADOPAGO_WEBHOOK_URL) {
        body.notification_url = env_1.env.MERCADOPAGO_WEBHOOK_URL;
    }
    const res = await fetch('https://api.mercadopago.com/checkout/preferences', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${env_1.env.MERCADOPAGO_ACCESS_TOKEN}`,
        },
        body: JSON.stringify(body),
    });
    const data = (await res.json());
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
async function getPaymentById(paymentId) {
    try {
        const payment = await paymentClient.get({ id: paymentId });
        return {
            external_reference: payment.external_reference,
            status: payment.status,
        };
    }
    catch {
        return null;
    }
}
//# sourceMappingURL=mercadopago.service.js.map