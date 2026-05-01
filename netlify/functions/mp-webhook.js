// netlify/functions/mp-webhook.js
// ─────────────────────────────────────────────────────────────
// Recibe notificaciones de MercadoPago y actualiza el pedido
// Variables de entorno requeridas:
//   MP_ACCESS_TOKEN   → Access Token de MercadoPago
//   SUPABASE_URL      → https://xxx.supabase.co
//   SUPABASE_SERVICE_KEY → service_role key de Supabase
// ─────────────────────────────────────────────────────────────

const https = require('https');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 200, body: 'ok' };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    console.log('MP Webhook recibido:', JSON.stringify(body));

    // Solo procesar pagos
    if (body.type !== 'payment') {
      return { statusCode: 200, body: 'ignored' };
    }

    const paymentId = body.data?.id;
    if (!paymentId) return { statusCode: 200, body: 'no payment id' };

    // Consultar el pago a MP
    const payment = await getMP(`/v1/payments/${paymentId}`);
    console.log('Payment status:', payment.status, 'Order:', payment.external_reference);

    const orderId = payment.external_reference;
    if (!orderId) return { statusCode: 200, body: 'no order ref' };

    // Mapear estado MP → estado Noviara
    const statusMap = {
      approved: { status: 'pagado', payment_status: 'approved' },
      rejected: { status: 'pendiente', payment_status: 'rejected' },
      cancelled: { status: 'cancelado', payment_status: 'cancelled' },
      pending:  { status: 'pendiente', payment_status: 'pending' },
      in_process: { status: 'pendiente', payment_status: 'pending' },
    };

    const newStatus = statusMap[payment.status] || { payment_status: payment.status };

    // Actualizar en Supabase
    await updateSupabase(orderId, {
      ...newStatus,
      mp_payment_id: String(paymentId),
    });

    return { statusCode: 200, body: 'updated' };
  } catch (err) {
    console.error('Webhook error:', err);
    return { statusCode: 200, body: 'error handled' }; // Siempre 200 para MP
  }
};

function getMP(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.mercadopago.com',
      port: 443,
      path,
      method: 'GET',
      headers: { 'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}` },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(JSON.parse(data)));
    });
    req.on('error', reject);
    req.end();
  });
}

function updateSupabase(orderId, fields) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(fields);
    const url = new URL(`${process.env.SUPABASE_URL}/rest/v1/orders?id=eq.${orderId}`);
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
        'apikey': process.env.SUPABASE_SERVICE_KEY,
        'Content-Length': Buffer.byteLength(body),
        'Prefer': 'return=minimal',
      },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}
