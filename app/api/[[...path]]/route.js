import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// Mock database for campaigns, donations, and users
let campaigns = [
  {
    id: '1',
    title: 'Bantu Anak Yatim Mendapat Pendidikan Layak',
    slug: 'bantu-anak-yatim-pendidikan',
    description: 'Mari bersama-sama membantu anak-anak yatim untuk mendapatkan pendidikan yang layak.',
    category: 'education',
    targetAmount: 150000000,
    currentAmount: 87500000,
    daysLeft: 23,
    donorCount: 342,
    isVerified: true,
    isUrgent: true,
    createdAt: new Date().toISOString(),
  },
];

let donations = [];
let users = [];

// Helper to add CORS headers
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': process.env.CORS_ORIGINS || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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
        { status: 'ok', message: 'BerbagiPath API is running' },
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

    // Get campaign by ID
    if (pathStr.startsWith('campaigns/')) {
      const id = path[1];
      const campaign = campaigns.find((c) => c.id === id);
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
      const campaignDonations = donations.filter((d) => d.campaignId === campaignId);
      return NextResponse.json(
        { success: true, data: campaignDonations },
        { headers: corsHeaders() }
      );
    }

    // Get user donations
    if (pathStr.startsWith('donations/user/')) {
      const userId = path[2];
      const userDonations = donations.filter((d) => d.userId === userId);
      return NextResponse.json(
        { success: true, data: userDonations },
        { headers: corsHeaders() }
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

    // Create new donation
    if (pathStr === 'donations') {
      const { campaignId, amount, name, message, isAnonymous, paymentMethod } = body;

      if (!campaignId || !amount || !paymentMethod) {
        return NextResponse.json(
          { success: false, error: 'Missing required fields' },
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

      const donation = {
        id: uuidv4(),
        campaignId,
        amount: parseInt(amount),
        name: isAnonymous ? 'Hamba Allah' : name || 'Anonim',
        message: message || '',
        isAnonymous: isAnonymous || false,
        paymentMethod,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      // Add to donations array
      donations.push(donation);

      // Update campaign stats (mock - in real app this would be after payment confirmation)
      campaign.currentAmount += donation.amount;
      campaign.donorCount += 1;

      // Mock payment response
      const paymentResponse = {
        invoiceId: `INV-${uuidv4().substring(0, 8).toUpperCase()}`,
        paymentCode: '8888 0812 3456 7890',
        expiredAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };

      return NextResponse.json(
        {
          success: true,
          data: {
            donation,
            payment: paymentResponse,
          },
          message: 'Donation created successfully (MOCK)',
        },
        { status: 201, headers: corsHeaders() }
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

    // Webhook handler for payment callback (MOCK)
    if (pathStr === 'webhook/payment') {
      const { invoiceId, status } = body;

      console.log('Payment webhook received:', { invoiceId, status });

      // In real implementation, verify signature and update donation status
      return NextResponse.json(
        { success: true, message: 'Webhook processed (MOCK)' },
        { headers: corsHeaders() }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Endpoint not found' },
      { status: 404, headers: corsHeaders() }
    );
  } catch (error) {
    console.error('POST Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
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
    // Delete campaign
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
