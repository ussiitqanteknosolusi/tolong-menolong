// Xendit Payment Gateway Integration
// Documentation: https://docs.xendit.co

const XENDIT_SECRET_KEY = process.env.XENDIT_SECRET_KEY;
const XENDIT_BASE_URL = 'https://api.xendit.co';

// Helper to create auth headers
function getAuthHeaders() {
  const auth = Buffer.from(`${XENDIT_SECRET_KEY}:`).toString('base64');
  return {
    'Authorization': `Basic ${auth}`,
    'Content-Type': 'application/json',
  };
}

// Create Invoice (supports multiple payment methods)
export async function createInvoice({
  externalId,
  amount,
  payerEmail,
  description,
  successRedirectUrl,
  failureRedirectUrl,
  customerName,
  customerPhone,
}) {
  try {
    const response = await fetch(`${XENDIT_BASE_URL}/v2/invoices`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        external_id: externalId,
        amount: amount,
        payer_email: payerEmail,
        description: description,
        success_redirect_url: successRedirectUrl,
        failure_redirect_url: failureRedirectUrl,
        customer: {
          given_names: customerName,
          mobile_number: customerPhone,
        },
        currency: 'IDR',
        payment_methods: ['QRIS', 'BCA', 'MANDIRI', 'BRI', 'OVO', 'DANA', 'LINKAJA', 'SHOPEEPAY'],
        invoice_duration: 86400, // 24 hours
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create invoice');
    }

    const data = await response.json();
    return {
      success: true,
      data: {
        invoiceId: data.id,
        externalId: data.external_id,
        invoiceUrl: data.invoice_url,
        amount: data.amount,
        status: data.status,
        expiryDate: data.expiry_date,
      },
    };
  } catch (error) {
    console.error('Xendit createInvoice error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Create Virtual Account Payment
export async function createVirtualAccount({
  externalId,
  bankCode, // BCA, MANDIRI, BRI, BNI, PERMATA, etc.
  name,
  amount,
  isClosed = true,
  isSingleUse = true,
  expirationDate,
}) {
  try {
    const response = await fetch(`${XENDIT_BASE_URL}/callback_virtual_accounts`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        external_id: externalId,
        bank_code: bankCode,
        name: name,
        expected_amount: amount,
        is_closed: isClosed,
        is_single_use: isSingleUse,
        expiration_date: expirationDate || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create virtual account');
    }

    const data = await response.json();
    return {
      success: true,
      data: {
        vaId: data.id,
        externalId: data.external_id,
        accountNumber: data.account_number,
        bankCode: data.bank_code,
        merchantCode: data.merchant_code,
        name: data.name,
        amount: data.expected_amount,
        expirationDate: data.expiration_date,
        status: data.status,
      },
    };
  } catch (error) {
    console.error('Xendit createVirtualAccount error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Create QRIS Payment
export async function createQRIS({
  externalId,
  amount,
  callbackUrl,
}) {
  try {
    const response = await fetch(`${XENDIT_BASE_URL}/qr_codes`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        external_id: externalId,
        type: 'DYNAMIC',
        currency: 'IDR',
        amount: amount,
        callback_url: callbackUrl,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create QRIS');
    }

    const data = await response.json();
    return {
      success: true,
      data: {
        qrId: data.id,
        externalId: data.external_id,
        qrString: data.qr_string,
        amount: data.amount,
        status: data.status,
      },
    };
  } catch (error) {
    console.error('Xendit createQRIS error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Create E-Wallet Payment (OVO, DANA, LinkAja, ShopeePay)
export async function createEWalletPayment({
  externalId,
  amount,
  ewalletType, // OVO, DANA, LINKAJA, SHOPEEPAY
  successRedirectUrl,
  failureRedirectUrl,
  mobileNumber, // Required for OVO
}) {
  try {
    const channelCode = ewalletType.toUpperCase();
    const channelProperties = {
      success_redirect_url: successRedirectUrl,
      failure_redirect_url: failureRedirectUrl,
    };

    // OVO requires mobile number
    if (channelCode === 'OVO' || channelCode === 'ID_OVO') {
      channelProperties.mobile_number = mobileNumber;
    }

    const response = await fetch(`${XENDIT_BASE_URL}/ewallets/charges`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        reference_id: externalId,
        currency: 'IDR',
        amount: amount,
        checkout_method: 'ONE_TIME_PAYMENT',
        channel_code: `ID_${channelCode}`,
        channel_properties: channelProperties,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create e-wallet payment');
    }

    const data = await response.json();
    
    // Get redirect URL from actions
    let redirectUrl = null;
    if (data.actions) {
      const webAction = data.actions.find(a => a.url_type === 'WEB' || a.url_type === 'MOBILE');
      if (webAction) {
        redirectUrl = webAction.url;
      }
    }

    return {
      success: true,
      data: {
        chargeId: data.id,
        externalId: data.reference_id,
        redirectUrl: redirectUrl,
        amount: data.charge_amount,
        status: data.status,
        channelCode: data.channel_code,
      },
    };
  } catch (error) {
    console.error('Xendit createEWalletPayment error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Get Invoice Status
export async function getInvoiceStatus(invoiceId) {
  try {
    const response = await fetch(`${XENDIT_BASE_URL}/v2/invoices/${invoiceId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get invoice status');
    }

    const data = await response.json();
    return {
      success: true,
      data: {
        invoiceId: data.id,
        externalId: data.external_id,
        status: data.status,
        amount: data.amount,
        paidAmount: data.paid_amount,
        paidAt: data.paid_at,
        paymentMethod: data.payment_method,
        paymentChannel: data.payment_channel,
      },
    };
  } catch (error) {
    console.error('Xendit getInvoiceStatus error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Verify webhook callback token
export function verifyWebhookToken(callbackToken) {
  const expectedToken = process.env.XENDIT_CALLBACK_TOKEN;
  return callbackToken === expectedToken;
}

// Simulate payment (for testing only)
export async function simulateVAPayment(externalId, amount) {
  if (!XENDIT_SECRET_KEY.includes('development')) {
    throw new Error('Simulation only available in test mode');
  }

  try {
    const response = await fetch(
      `${XENDIT_BASE_URL}/callback_virtual_accounts/external_id=${externalId}/simulate_payment`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ amount }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to simulate payment');
    }

    return { success: true };
  } catch (error) {
    console.error('Xendit simulatePayment error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}
