import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import * as xendit from '@/lib/xendit';

// In-memory storage (fallback when MySQL is not available)
let campaigns = [
  {
    id: '1',
    title: 'Bantu Anak Yatim Mendapat Pendidikan Layak',
    slug: 'bantu-anak-yatim-pendidikan',
    description: 'Mari bersama-sama membantu anak-anak yatim untuk mendapatkan pendidikan yang layak.',
    category: 'education',
    image: 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?w=800&auto=format&fit=crop',
    targetAmount: 150000000,
    currentAmount: 87500000,
    daysLeft: 23,
    donorCount: 342,
    isVerified: true,
    isUrgent: true,
    organizerName: 'Yayasan Cahaya Harapan',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Operasi Jantung untuk Bayi Raffa',
    slug: 'operasi-jantung-bayi-raffa',
    description: 'Bayi Raffa membutuhkan operasi jantung segera.',
    category: 'medical',
    image: 'https://images.unsplash.com/photo-1620841713108-18ad2b52d15c?w=800&auto=format&fit=crop',
    targetAmount: 250000000,
    currentAmount: 198750000,
    daysLeft: 7,
    donorCount: 1203,
    isVerified: true,
    isUrgent: true,
    organizerName: 'Keluarga Raffa',
    createdAt: new Date().toISOString(),
  },
];

let donations = [];
let webhookLogs = [];

// Helper to add CORS headers
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': process.env.CORS_ORIGINS || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Callback-Token',
  };
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}

// GET handler
export async function GET(request, { params }) {
  const path = params?.path || [];
  const pathStr = path.join('/');

  try {
    // Health check
    if (pathStr === '' || pathStr === 'health') {
      return NextResponse.json(
        { status: 'ok', message: 'BerbagiPath API is running', xenditConfigured: !!process.env.XENDIT_SECRET_KEY },
        { headers: corsHeaders() }
      );
    }

    // Get all campaigns
    if (pathStr === 'campaigns') {
      return NextResponse.json(
        { success: true, data: campaigns },
        { headers: corsHeaders() }
      );
    }

    // Get campaign by ID or slug
    if (pathStr.startsWith('campaigns/')) {
      const idOrSlug = path[1];
      const campaign = campaigns.find((c) => c.id === idOrSlug || c.slug === idOrSlug);
      if (!campaign) {
        return NextResponse.json(
          { success: false, error: 'Campaign not found' },
          { status: 404, headers: corsHeaders() }
        );
      }
      return NextResponse.json(
        { success: true, data: campaign },
        { headers: corsHeaders() }
      );
    }

    // Get donations for a campaign
    if (pathStr.startsWith('donations/campaign/')) {
      const campaignId = path[2];
      const campaignDonations = donations.filter((d) => d.campaignId === campaignId && d.status === 'paid');
      return NextResponse.json(
        { success: true, data: campaignDonations },
        { headers: corsHeaders() }
      );
    }

    // Get donation by ID
    if (pathStr.startsWith('donations/')) {
      const donationId = path[1];
      const donation = donations.find((d) => d.id === donationId);
      if (!donation) {
        return NextResponse.json(
          { success: false, error: 'Donation not found' },
          { status: 404, headers: corsHeaders() }
        );
      }
      return NextResponse.json(
        { success: true, data: donation },
        { headers: corsHeaders() }
      );
    }

    // Get payment status from Xendit
    if (pathStr.startsWith('payment/status/')) {
      const invoiceId = path[2];
      const result = await xendit.getInvoiceStatus(invoiceId);
      return NextResponse.json(
        result,
        { status: result.success ? 200 : 400, headers: corsHeaders() }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Endpoint not found' },
      { status: 404, headers: corsHeaders() }
    );
  } catch (error) {
    console.error('GET Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

// POST handler
export async function POST(request, { params }) {
  const path = params?.path || [];
  const pathStr = path.join('/');

  try {
    const body = await request.json();

    // Create donation with Xendit Invoice
    if (pathStr === 'donations') {
      const { 
        campaignId, 
        amount, 
        name, 
        email,
        phone,
        message, 
        isAnonymous,
      } = body;

      if (!campaignId || !amount) {
        return NextResponse.json(
          { success: false, error: 'Missing required fields: campaignId, amount' },
          { status: 400, headers: corsHeaders() }
        );
      }

      const campaign = campaigns.find((c) => c.id === campaignId);
      if (!campaign) {
        return NextResponse.json(
          { success: false, error: 'Campaign not found' },
          { status: 404, headers: corsHeaders() }
        );
      }

      const donationId = uuidv4();
      const externalId = `DON-${donationId.substring(0, 8).toUpperCase()}`;
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

      // Create Xendit Invoice
      const invoiceResult = await xendit.createInvoice({
        externalId: externalId,
        amount: parseInt(amount),
        payerEmail: email || 'donor@berbagipath.com',
        description: `Donasi untuk ${campaign.title}`,
        successRedirectUrl: `${baseUrl}/payment/success?donation=${donationId}`,
        failureRedirectUrl: `${baseUrl}/payment/failed?donation=${donationId}`,
        customerName: isAnonymous ? 'Hamba Allah' : (name || 'Anonim'),
        customerPhone: phone,
      });

      // Create donation record
      const donation = {
        id: donationId,
        campaignId,
        campaignTitle: campaign.title,
        externalId: externalId,
        amount: parseInt(amount),
        name: isAnonymous ? 'Hamba Allah' : (name || 'Anonim'),
        email: email || null,
        phone: phone || null,
        message: message || '',
        isAnonymous: isAnonymous || false,
        status: 'pending',
        xenditInvoiceId: invoiceResult.success ? invoiceResult.data.invoiceId : null,
        invoiceUrl: invoiceResult.success ? invoiceResult.data.invoiceUrl : null,
        expiredAt: invoiceResult.success ? invoiceResult.data.expiryDate : null,
        createdAt: new Date().toISOString(),
      };

      donations.push(donation);

      if (!invoiceResult.success) {
        return NextResponse.json(
          { 
            success: false, 
            error: `Xendit Error: ${invoiceResult.error}`,
            donation: donation,
          },
          { status: 400, headers: corsHeaders() }
        );
      }

      return NextResponse.json(
        {
          success: true,
          data: {
            donation: donation,
            payment: {
              invoiceId: invoiceResult.data.invoiceId,
              invoiceUrl: invoiceResult.data.invoiceUrl,
              amount: invoiceResult.data.amount,
              expiryDate: invoiceResult.data.expiryDate,
            },
          },
          message: 'Donation created. Please complete payment.',
        },
        { status: 201, headers: corsHeaders() }
      );
    }

    // Create payment with specific method (QRIS)
    if (pathStr === 'payment/qris') {
      const { donationId } = body;
      const donation = donations.find(d => d.id === donationId);
      
      if (!donation) {
        return NextResponse.json(
          { success: false, error: 'Donation not found' },
          { status: 404, headers: corsHeaders() }
        );
      }

      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const result = await xendit.createQRIS({
        externalId: donation.externalId,
        amount: donation.amount,
        callbackUrl: `${baseUrl}/api/webhook/xendit`,
      });

      if (!result.success) {
        return NextResponse.json(
          { success: false, error: result.error },
          { status: 400, headers: corsHeaders() }
        );
      }

      // Update donation with QRIS info
      donation.qrString = result.data.qrString;
      donation.paymentMethod = 'QRIS';

      return NextResponse.json(
        { success: true, data: result.data },
        { headers: corsHeaders() }
      );
    }

    // Create Virtual Account payment
    if (pathStr === 'payment/va') {
      const { donationId, bankCode } = body;
      const donation = donations.find(d => d.id === donationId);
      
      if (!donation) {
        return NextResponse.json(
          { success: false, error: 'Donation not found' },
          { status: 404, headers: corsHeaders() }
        );
      }

      const result = await xendit.createVirtualAccount({
        externalId: donation.externalId,
        bankCode: bankCode || 'BCA',
        name: donation.name,
        amount: donation.amount,
      });

      if (!result.success) {
        return NextResponse.json(
          { success: false, error: result.error },
          { status: 400, headers: corsHeaders() }
        );
      }

      // Update donation with VA info
      donation.vaNumber = result.data.accountNumber;
      donation.paymentMethod = `VA_${bankCode || 'BCA'}`;
      donation.paymentChannel = bankCode || 'BCA';

      return NextResponse.json(
        { success: true, data: result.data },
        { headers: corsHeaders() }
      );
    }

    // Create E-Wallet payment
    if (pathStr === 'payment/ewallet') {
      const { donationId, ewalletType, mobileNumber } = body;
      const donation = donations.find(d => d.id === donationId);
      
      if (!donation) {
        return NextResponse.json(
          { success: false, error: 'Donation not found' },
          { status: 404, headers: corsHeaders() }
        );
      }

      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const result = await xendit.createEWalletPayment({
        externalId: donation.externalId,
        amount: donation.amount,
        ewalletType: ewalletType || 'DANA',
        successRedirectUrl: `${baseUrl}/payment/success?donation=${donationId}`,
        failureRedirectUrl: `${baseUrl}/payment/failed?donation=${donationId}`,
        mobileNumber: mobileNumber,
      });

      if (!result.success) {
        return NextResponse.json(
          { success: false, error: result.error },
          { status: 400, headers: corsHeaders() }
        );
      }

      // Update donation with e-wallet info
      donation.redirectUrl = result.data.redirectUrl;
      donation.paymentMethod = 'EWALLET';
      donation.paymentChannel = ewalletType || 'DANA';

      return NextResponse.json(
        { success: true, data: result.data },
        { headers: corsHeaders() }
      );
    }

    // Xendit Webhook handler
    if (pathStr === 'webhook/xendit') {
      const callbackToken = request.headers.get('x-callback-token');
      
      // Verify webhook token
      if (!xendit.verifyWebhookToken(callbackToken)) {
        console.warn('Invalid webhook token received');
        // Still return 200 to prevent retry spam, but log it
        return NextResponse.json(
          { success: false, error: 'Invalid callback token' },
          { status: 200, headers: corsHeaders() }
        );
      }

      // Log webhook
      const webhookLog = {
        id: uuidv4(),
        eventType: body.event || 'unknown',
        payload: body,
        receivedAt: new Date().toISOString(),
      };
      webhookLogs.push(webhookLog);
      console.log('Xendit webhook received:', JSON.stringify(body, null, 2));

      // Handle different webhook events
      const externalId = body.external_id || body.data?.external_id;
      const status = body.status || body.data?.status;

      if (externalId) {
        const donation = donations.find(d => d.externalId === externalId);
        
        if (donation) {
          // Update donation status based on payment status
          if (status === 'PAID' || status === 'SETTLED' || status === 'COMPLETED') {
            donation.status = 'paid';
            donation.paidAt = new Date().toISOString();
            donation.paymentMethod = body.payment_method || body.payment_channel || donation.paymentMethod;
            donation.paymentChannel = body.payment_channel || donation.paymentChannel;

            // Update campaign stats
            const campaign = campaigns.find(c => c.id === donation.campaignId);
            if (campaign) {
              campaign.currentAmount += donation.amount;
              campaign.donorCount += 1;
            }

            console.log(`Payment successful for donation ${donation.id}`);
          } else if (status === 'EXPIRED' || status === 'FAILED') {
            donation.status = status.toLowerCase();
            console.log(`Payment ${status.toLowerCase()} for donation ${donation.id}`);
          }
        }
      }

      // Always return 200 to acknowledge webhook receipt
      return NextResponse.json(
        { success: true, message: 'Webhook processed' },
        { headers: corsHeaders() }
      );
    }

    // Create new campaign
    if (pathStr === 'campaigns') {
      const { title, description, category, targetAmount, daysToRun } = body;

      if (!title || !description || !targetAmount) {
        return NextResponse.json(
          { success: false, error: 'Missing required fields' },
          { status: 400, headers: corsHeaders() }
        );
      }

      const campaign = {
        id: uuidv4(),
        title,
        slug: title.toLowerCase().replace(/\s+/g, '-').substring(0, 50),
        description,
        category: category || 'social',
        targetAmount: parseInt(targetAmount),
        currentAmount: 0,
        daysLeft: parseInt(daysToRun) || 30,
        donorCount: 0,
        isVerified: false,
        isUrgent: false,
        createdAt: new Date().toISOString(),
      };

      campaigns.push(campaign);

      return NextResponse.json(
        { success: true, data: campaign, message: 'Campaign created successfully' },
        { status: 201, headers: corsHeaders() }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Endpoint not found' },
      { status: 404, headers: corsHeaders() }
    );
  } catch (error) {
    console.error('POST Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

// PUT handler
export async function PUT(request, { params }) {
  const path = params?.path || [];
  const pathStr = path.join('/');

  try {
    const body = await request.json();

    // Update campaign
    if (pathStr.startsWith('campaigns/')) {
      const id = path[1];
      const campaignIndex = campaigns.findIndex((c) => c.id === id);

      if (campaignIndex === -1) {
        return NextResponse.json(
          { success: false, error: 'Campaign not found' },
          { status: 404, headers: corsHeaders() }
        );
      }

      campaigns[campaignIndex] = {
        ...campaigns[campaignIndex],
        ...body,
        updatedAt: new Date().toISOString(),
      };

      return NextResponse.json(
        { success: true, data: campaigns[campaignIndex] },
        { headers: corsHeaders() }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Endpoint not found' },
      { status: 404, headers: corsHeaders() }
    );
  } catch (error) {
    console.error('PUT Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

// DELETE handler
export async function DELETE(request, { params }) {
  const path = params?.path || [];
  const pathStr = path.join('/');

  try {
    if (pathStr.startsWith('campaigns/')) {
      const id = path[1];
      const campaignIndex = campaigns.findIndex((c) => c.id === id);

      if (campaignIndex === -1) {
        return NextResponse.json(
          { success: false, error: 'Campaign not found' },
          { status: 404, headers: corsHeaders() }
        );
      }

      campaigns.splice(campaignIndex, 1);

      return NextResponse.json(
        { success: true, message: 'Campaign deleted successfully' },
        { headers: corsHeaders() }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Endpoint not found' },
      { status: 404, headers: corsHeaders() }
    );
  } catch (error) {
    console.error('DELETE Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500, headers: corsHeaders() }
    );
  }
}
