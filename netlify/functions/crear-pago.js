// netlify/functions/crear-pago.js
// ─────────────────────────────────────────────────────────────
// Crea una preferencia de pago en MercadoPago y devuelve la URL
// Variables de entorno requeridas en Netlify:
//   MP_ACCESS_TOKEN  → tu Access Token de MercadoPago (producción)
//   APP_URL          → https://tu-dominio.netlify.app
// ─────────────────────────────────────────────────────────────

const https = require('https');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Método no permitido' }) };
  }

  try {
    const { orderId, items, customer, total, shipping } = JSON.parse(event.body);

    const appUrl = process.env.APP_URL || 'https://tu-tienda.netlify.app';

    const preference = {
      external_reference: orderId,
      items: items.map(item => ({
        id: item.sku || item.tit,
        title: item.color ? `${item.tit} — ${item.color}` : item.tit,
        description: `${item.marca} · ${item.cat}`,
        quantity: item.qty,
        unit_price: parseFloat(item.price),
        currency_id: 'MXN',
        picture_url: item.img || undefined,
      })),
      // Costo de envío como ítem adicional
      ...(shipping > 0 && {
        items: [
          ...items.map(item => ({
            id: item.sku || item.tit,
            title: item.color ? `${item.tit} — ${item.color}` : item.tit,
            quantity: item.qty,
            unit_price: parseFloat(item.price),
            currency_id: 'MXN',
          })),
          {
            id: 'ENVIO',
            title: 'Costo de Envío',
            quantity: 1,
            unit_price: parseFloat(shipping),
            currency_id: 'MXN',
          },
        ],
      }),
      payer: {
        name: customer.name,
        email: customer.email,
        phone: { number: customer.phone },
        address: {
          street_name: customer.street,
          zip_code: customer.zip,
        },
      },
      back_urls: {
        success: `${appUrl}/gracias.html?order=${orderId}`,
        failure: `${appUrl}/pago-fallido.html?order=${orderId}`,
        pending: `${appUrl}/pago-pendiente.html?order=${orderId}`,
      },
      auto_return: 'approved',
      notification_url: `${appUrl}/.netlify/functions/mp-webhook`,
      statement_descriptor: 'Noviara Beauty',
      expires: true,
      expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24h
    };

    const mpResponse = await callMP('/checkout/preferences', preference);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        preference_id: mpResponse.id,
        init_point: mpResponse.init_point,
        sandbox_init_point: mpResponse.sandbox_init_point,
      }),
    };
  } catch (err) {
    console.error('Error crear-pago:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
};

function callMP(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const options = {
      hostname: 'api.mercadopago.com',
      port: 443,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        'Content-Length': Buffer.byteLength(data),
      },
    };
    const req = https.request(options, (res) => {
      let result = '';
      res.on('data', chunk => result += chunk);
      res.on('end', () => {
        const parsed = JSON.parse(result);
        if (res.statusCode >= 400) reject(new Error(parsed.message || 'Error MP'));
        else resolve(parsed);
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}
