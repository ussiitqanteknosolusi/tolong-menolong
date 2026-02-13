
import crypto from 'crypto';

const DOKU_CLIENT_ID = process.env.DOKU_CLIENT_ID;
const DOKU_SECRET_KEY = process.env.DOKU_SECRET_KEY;
const DOKU_BASE_URL = process.env.DOKU_BASE_URL || 'https://api-sandbox.doku.com';

function generateDigest(jsonBody) {
  const hash = crypto.createHash('sha256').update(jsonBody).digest('base64');
  return `Digest:${hash}`;
}

function generateSignature(clientId, requestId, requestTimestamp, requestTarget, digest, secretKey) {
  const component = `Client-Id:${clientId}\nRequest-Id:${requestId}\nRequest-Timestamp:${requestTimestamp}\nRequest-Target:${requestTarget}\n${digest}`;
  
  const hmac = crypto.createHmac('sha256', secretKey);
  hmac.update(component);
  return `HMACSHA256=${hmac.digest('base64')}`;
}

// Request Target for Checkout API
const CHECKOUT_PATH = '/checkout/v1/payment';
const STATUS_PATH = '/checkout/v1/status';

export async function createInvoice({
  externalId,
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

  // Tentukan notification URL dari successRedirectUrl (sudah di-detect dinamis dari request)
  let notificationUrl;
  try {
    const urlObj = new URL(successRedirectUrl);
    notificationUrl = `${urlObj.origin}/api/webhook/doku`;
  } catch {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    notificationUrl = `${baseUrl}/api/webhook/doku`;
  }

  const requestId = 'REQ-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
  const requestTimestamp = new Date().toISOString().slice(0, 19) + 'Z';
  
  const requestBody = {
    order: {
      amount: amount,
      invoice_number: externalId,
      currency: 'IDR',
      callback_url: successRedirectUrl,
      callback_url_cancel: failureRedirectUrl || successRedirectUrl,
      line_items: [
        {
          name: description || 'Donation',
          price: amount,
          quantity: 1
        }
      ]
    },
    payment: {
      payment_due_date: 1440
    },
    customer: {
      name: customerName || 'Anonymous',
      email: payerEmail || 'no-email@example.com',
      phone: customerPhone || '081234567890'
    },
    // ✅ KUNCI: override_notification_url agar DOKU mengirim webhook ke URL kita
    additional_info: {
      override_notification_url: notificationUrl
    }
  };

  console.log('[DOKU] Notification URL set to:', notificationUrl);

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
    console.log('[DOKU] Creating invoice:', {
      url: `${DOKU_BASE_URL}${CHECKOUT_PATH}`,
      clientId: DOKU_CLIENT_ID,
      requestId,
      externalId,
      amount,
      notificationUrl,
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
      console.error('[DOKU] Error Response:', data);
      throw new Error(data.error?.message || data.message?.[0] || 'Failed to create DOKU invoice');
    }

    console.log('[DOKU] Invoice created successfully:', data.response?.order?.invoice_number);

    return {
      success: true,
      data: {
        invoiceId: data.response.payment.token_id,
        externalId: data.response.order.invoice_number,
        invoiceUrl: data.response.payment.url,
        amount: amount,
        expiryDate: data.response.payment.expired_date
      }
    };

  } catch (error) {
    console.error('[DOKU] Create Invoice Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// ============================================================
// Check Payment Status — Fallback jika webhook tidak sampai
// Endpoint DOKU: GET /orders/{invoice_number}
// ============================================================
export async function checkPaymentStatus(invoiceNumber) {
  if (!DOKU_CLIENT_ID || !DOKU_SECRET_KEY) {
    throw new Error('DOKU credentials not configured');
  }

  const requestId = 'REQ-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
  const requestTimestamp = new Date().toISOString().slice(0, 19) + 'Z';
  const requestTarget = `/orders/v1/status/${invoiceNumber}`;

  // GET request has empty body
  const emptyBody = '';
  const digest = generateDigest(emptyBody);
  const signature = generateSignature(
    DOKU_CLIENT_ID,
    requestId,
    requestTimestamp,
    requestTarget,
    digest,
    DOKU_SECRET_KEY
  );

  try {
    const response = await fetch(`${DOKU_BASE_URL}${requestTarget}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Client-Id': DOKU_CLIENT_ID,
        'Request-Id': requestId,
        'Request-Timestamp': requestTimestamp,
        'Signature': signature
      }
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[DOKU] Status Check Error:', data);
      return { success: false, error: data.error?.message || 'Failed to check status' };
    }

    return {
      success: true,
      data: {
        invoiceNumber: data.order?.invoice_number,
        status: data.transaction?.status,
        amount: data.order?.amount,
        channel: data.channel?.id || null,
        service: data.service?.id || null,
      }
    };

  } catch (error) {
    console.error('[DOKU] Check Status Error:', error);
    return { success: false, error: error.message };
  }
}

