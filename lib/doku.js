
import crypto from 'crypto';

const DOKU_CLIENT_ID = process.env.DOKU_CLIENT_ID;
const DOKU_SECRET_KEY = process.env.DOKU_SECRET_KEY;
const DOKU_BASE_URL = process.env.DOKU_BASE_URL || 'https://api-sandbox.doku.com';

function generateDigest(jsonBody) {
  const hash = crypto.createHash('sha256').update(jsonBody).digest('base64');
  return `Digest:${hash}`;
}

function generateSignature(clientId, requestId, requestTimestamp, requestTarget, digest, secretKey) {
  // Component: Client-Id + Request-Id + Request-Timestamp + Request-Target + Digest
  const component = `Client-Id:${clientId}\nRequest-Id:${requestId}\nRequest-Timestamp:${requestTimestamp}\nRequest-Target:${requestTarget}\n${digest}`;
  
  const hmac = crypto.createHmac('sha256', secretKey);
  hmac.update(component);
  return `HMACSHA256=${hmac.digest('base64')}`;
}

// Request Target for Checkout API
const CHECKOUT_PATH = '/checkout/v1/payment';

export async function createInvoice({
  externalId, // order_id
  amount,
  payerEmail,
  description,
  customerName,
  customerPhone,
  successRedirectUrl,
  failureRedirectUrl
}) {
  if (!DOKU_CLIENT_ID || !DOKU_SECRET_KEY) {
    throw new Error('DOKU credentials not configured');
  }

  const requestId = 'REQ-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
  const requestTimestamp = new Date().toISOString().slice(0, 19) + 'Z';
  
  const requestBody = {
    order: {
      amount: amount,
      invoice_number: externalId,
      currency: 'IDR',
      callback_url: successRedirectUrl, // DOKU uses this for success
      // auto_redirect: true,
      line_items: [
        {
          name: description || 'Donation',
          price: amount,
          quantity: 1
        }
      ]
    },
    payment: {
      payment_due_date: 1440 // 24 hours in minutes
    },
    customer: {
        name: customerName || 'Anoymous',
        email: payerEmail || 'no-email@example.com',
        phone: customerPhone || '081234567890'
    }
  };

  const jsonBody = JSON.stringify(requestBody);
  const digest = generateDigest(jsonBody);
  const signature = generateSignature(
    DOKU_CLIENT_ID,
    requestId,
    requestTimestamp,
    CHECKOUT_PATH,
    digest,
    DOKU_SECRET_KEY
  );

  try {
    console.log('DOKU Request:', {
        url: `${DOKU_BASE_URL}${CHECKOUT_PATH}`,
        clientId: DOKU_CLIENT_ID,
        requestId,
        timestamp: requestTimestamp,
        signature
    });

    const response = await fetch(`${DOKU_BASE_URL}${CHECKOUT_PATH}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Client-Id': DOKU_CLIENT_ID,
        'Request-Id': requestId,
        'Request-Timestamp': requestTimestamp,
        'Signature': signature
      },
      body: jsonBody
    });

    const data = await response.json();

    if (!response.ok) {
        console.error('DOKU Error Response:', data);
        throw new Error(data.error?.message || 'Failed to create DOKU invoice');
    }

    return {
      success: true,
      data: {
        invoiceId: data.response.payment.token_id, // payment token
        externalId: data.response.order.invoice_number,
        invoiceUrl: data.response.payment.url,
        amount: amount,
        expiryDate: data.response.payment.expired_date
      }
    };

  } catch (error) {
    console.error('DOKU Create Invoice Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
