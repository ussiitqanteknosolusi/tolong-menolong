import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import * as db from '@/lib/db';

import * as doku from '@/lib/doku';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Helper to add CORS headers
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': process.env.CORS_ORIGINS || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Callback-Token',
  };
}

// User role helper (simple logic for now)
const getUserRole = async (userId) => {
    // Check if user is organizer
    const campaignCount = await db.query(
        "SELECT COUNT(*) as count FROM campaigns WHERE organizer_id = ?", 
        [userId]
    );
    return campaignCount[0].count > 0 ? 'organizer' : 'user';
};

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
      const dbConnected = await db.testConnection();
      return NextResponse.json(
        { 
          status: 'ok', 
          message: 'BerbagiPath API is running', 
          database: dbConnected ? 'connected' : 'disconnected',
          xenditConfigured: !!process.env.XENDIT_SECRET_KEY 
        },
        { headers: corsHeaders() }
      );
    }

    // Get Articles
    if (pathStr === 'articles' || (pathStr.startsWith('articles/') && path.length === 2)) {
        // Detail by slug or id
        if (path.length === 2) {
             const identifier = path[1];
             try {
                // Try find by slug first
                let result = await db.query("SELECT * FROM articles WHERE slug = ?", [identifier]);
                if (result.length === 0) {
                     // Try by ID
                     result = await db.query("SELECT * FROM articles WHERE id = ?", [identifier]);
                }
                
                if (result.length === 0) return NextResponse.json({ success: false, error: 'Article not found' }, { status: 404 });
                return NextResponse.json({ success: true, data: result[0] }, { headers: corsHeaders() });
             } catch (e) {
                 return NextResponse.json({ success: false, error: 'Article not found' }, { status: 404 });
             }
        }
        
        // List logic
        const url = new URL(request.url);
        const limit = parseInt(url.searchParams.get('limit')) || 10;
        const showAll = url.searchParams.get('all') === 'true';
        
        try {
             let query = "SELECT * FROM articles";
             const params = [];
             
             if (!showAll) {
                 query += " WHERE status = 'published'";
             }
             
             query += " ORDER BY created_at DESC LIMIT ?";
             params.push(limit);

             const articles = await db.query(query, params);
             return NextResponse.json({ success: true, data: articles }, { headers: corsHeaders() });
        } catch (e) {
             return NextResponse.json({ success: true, data: [] });
        }
    }
    // Get all campaigns
    if (pathStr === 'campaigns') {
      // Get query params
      const { searchParams } = new URL(request.url);
      const limit = parseInt(searchParams.get('limit') || 100);
      const offset = parseInt(searchParams.get('offset') || 0);
      const status = searchParams.get('status');
      
      let query = `
        SELECT c.*, 
               cat.name as category_name, 
               u.name as organizer_name,
               u.is_verified as organizer_is_verified,
               u.avatar_url as organizer_avatar
        FROM campaigns c
        LEFT JOIN categories cat ON c.category_id = cat.id
        LEFT JOIN users u ON c.organizer_id = u.id
      `;
      
      const queryParams = [];
      const conditions = [];

      if (status) {
        conditions.push("c.status = ?");
        queryParams.push(status);
      }

      const organizerId = searchParams.get('organizerId');
      if (organizerId) {
        conditions.push("c.organizer_id = ?");
        queryParams.push(organizerId);
      }

      if (conditions.length > 0) {
        query += " WHERE " + conditions.join(" AND ");
      }
      
      query += " ORDER BY c.created_at DESC LIMIT ? OFFSET ?";
      queryParams.push(limit, offset);

      const campaigns = await db.query(query, queryParams);
      
      // Transform data to match frontend expectations
      const transformedCampaigns = campaigns.map(c => ({
        ...c,
        category: c.category_name,
        targetAmount: parseFloat(c.target_amount),
        currentAmount: parseFloat(c.current_amount),
        isVerified: !!c.is_verified,
        isUrgent: !!c.is_urgent,
        isBerbagipath: !!c.is_berbagipath,
        image: c.image_url,
        daysLeft: c.days_left,
        donorCount: c.donor_count,
        organizer: {
            name: c.is_berbagipath ? 'BerbagiPath' : c.organizer_name,
            isVerified: !!c.organizer_is_verified || !!c.is_berbagipath,
            avatar: c.organizer_avatar
        }
      }));

      return NextResponse.json(
        { success: true, data: transformedCampaigns },
        { headers: corsHeaders() }
      );
    }

    // Get campaign donations
    if (pathStr.startsWith('campaigns/') && pathStr.endsWith('/donations')) {
        const parts = pathStr.split('/');
        const idOrSlug = parts[1]; // campaigns/:idOrSlug/donations

        // Resolve ID first because donations table uses campaign_id
        let campaignId = idOrSlug;
        // Check if slug
        const campaignCheck = await db.query("SELECT id FROM campaigns WHERE id = ? OR slug = ? LIMIT 1", [idOrSlug, idOrSlug]);
        if (campaignCheck.length === 0) {
             return NextResponse.json({ success: false, error: 'Campaign not found' }, { status: 404 });
        }
        campaignId = campaignCheck[0].id;

        const query = `
            SELECT d.donor_name, d.amount, d.message, d.created_at, d.is_anonymous, d.donor_email, u.avatar_url, u.name as user_name
            FROM donations d
            LEFT JOIN users u ON d.donor_email = u.email
            WHERE d.campaign_id = ? AND d.status = 'paid'
            ORDER BY d.created_at DESC
        `;
        const donations = await db.query(query, [campaignId]);
        
        const transformedDonations = donations.map(d => ({
            name: d.is_anonymous ? 'Hamba Allah' : (d.user_name || d.donor_name),
            amount: parseFloat(d.amount),
            message: d.message,
            createdAt: d.created_at,
            avatar: d.is_anonymous 
                ? `https://api.dicebear.com/7.x/avataaars/svg?seed=anonymous` 
                : (d.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${d.donor_name}`)
        }));

        return NextResponse.json(
            { success: true, data: transformedDonations },
            { headers: corsHeaders() }
        );
    }

    // Get campaign by ID or slug
    if (pathStr.startsWith('campaigns/')) {
      const idOrSlug = path[1];
      
      const query = `
        SELECT c.*, 
               cat.name as category_name, 
               u.name as organizer_name,
               u.is_verified as organizer_is_verified,
               u.avatar_url as organizer_avatar
        FROM campaigns c
        LEFT JOIN categories cat ON c.category_id = cat.id
        LEFT JOIN users u ON c.organizer_id = u.id
        WHERE c.id = ? OR c.slug = ?
        LIMIT 1
      `;
      
      const result = await db.query(query, [idOrSlug, idOrSlug]);
      
      if (result.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Campaign not found' },
          { status: 404, headers: corsHeaders() }
        );
      }
      
      const c = result[0];
      const campaign = {
        ...c,
        category: c.category_name,
        targetAmount: parseFloat(c.target_amount),
        currentAmount: parseFloat(c.current_amount),
        isVerified: !!c.is_verified,
        isUrgent: !!c.is_urgent,
        isBerbagipath: !!c.is_berbagipath,
        image: c.image_url,
        daysLeft: c.days_left,
        donorCount: c.donor_count,
        organizerName: c.is_berbagipath ? 'BerbagiPath' : c.organizer_name,
        organizer: {
            name: c.is_berbagipath ? 'BerbagiPath' : c.organizer_name,
            isVerified: !!c.organizer_is_verified || !!c.is_berbagipath,
            avatar: c.organizer_avatar
        }
      };

      return NextResponse.json(
        { success: true, data: campaign },
        { headers: corsHeaders() }
      );
    }
    
    // Get all categories
    if (pathStr === 'categories') {
      const query = `SELECT * FROM categories ORDER BY name ASC`;
      const categories = await db.query(query);
      
      // Get campaign count for each category (simplistic approach, ideally use JOIN/GROUP BY)
      // Or we can simple use a JOIN query
      const queryWithCount = `
          SELECT c.*, COUNT(cam.id) as campaign_count 
          FROM categories c
          LEFT JOIN campaigns cam ON c.id = cam.category_id
          GROUP BY c.id
          ORDER BY name ASC
      `;
      const categoriesWithCount = await db.query(queryWithCount);

      const transformedCategories = categoriesWithCount.map(c => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          icon: c.icon || 'Heart', // Default icon
          color: c.color || 'bg-emerald-100 text-emerald-600', // Default color
          isActive: true, // Assuming active by default or add column
          campaignCount: c.campaign_count
      }));

      return NextResponse.json(
        { success: true, data: transformedCategories },
        { headers: corsHeaders() }
      );
    }
    
    // Get all users (Admin)
    if (pathStr === 'users') {
      const query = `SELECT * FROM users ORDER BY created_at DESC`;
      const users = await db.query(query);
      
      // Get stats for each user
      const usersWithStats = await Promise.all(users.map(async (u) => {
        // Count donations
        const donationCount = await db.query(
          "SELECT COUNT(*) as count, SUM(amount) as total FROM donations WHERE user_id = ? AND status = 'paid'", 
          [u.id]
        );
        
        // Count campaigns
        const campaignCount = await db.query(
          "SELECT COUNT(*) as count FROM campaigns WHERE organizer_id = ?", 
          [u.id]
        );
        
        return {
          id: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone,
          role: u.role || 'user',
          balance: parseFloat(u.balance || 0),
          isVerified: !!u.is_verified,
          createdAt: u.created_at,
          donationCount: donationCount[0].count,
          totalDonations: parseFloat(donationCount[0].total || 0),
          campaignCount: campaignCount[0].count
        };
      }));

      return NextResponse.json(
        { success: true, data: usersWithStats },
        { headers: corsHeaders() }
      );
    }

    // Get user notifications
    if (pathStr.startsWith('users/') && pathStr.endsWith('/notifications')) {
        const parts = pathStr.split('/');
        const id = parts[1];
        
        const notifications = await db.query(
            "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50",
            [id]
        );
        
        return NextResponse.json(
            { success: true, data: notifications },
            { headers: corsHeaders() }
        );
    }

    // Get Recurring Donations
    if (pathStr === 'recurring-donations') {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        
        if (!userId) {
            return NextResponse.json({ success: false, error: 'User ID required' }, { status: 400 });
        }

        const recurring = await db.query(`
            SELECT rd.*, c.title as campaignTitle, c.slug as campaignSlug
            FROM recurring_donations rd
            JOIN campaigns c ON rd.campaign_id = c.id
            WHERE rd.user_id = ?
            ORDER BY rd.created_at DESC
        `, [userId]);

        return NextResponse.json(
            { success: true, data: recurring },
            { headers: corsHeaders() }
        );
    }
    
    // Get user donations (with pagination + date filter)
    if (pathStr.startsWith('users/') && pathStr.endsWith('/donations')) {
        const parts = pathStr.split('/');
        const id = parts[1]; // users/:id/donations

        const userResult = await db.query("SELECT email FROM users WHERE id = ?", [id]);
        if (userResult.length === 0) {
             return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
        }
        const userEmail = userResult[0].email;

        // ✅ Pagination & Date filter params
        const { searchParams } = new URL(request.url);
        const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100); // Max 100
        const offset = parseInt(searchParams.get('offset') || '0');
        const dateFrom = searchParams.get('dateFrom');
        const dateTo = searchParams.get('dateTo');
        const status = searchParams.get('status'); // 'paid', 'pending', 'all'

        let whereClause = 'd.donor_email = ?';
        const params = [userEmail];

        if (dateFrom) {
            whereClause += ' AND d.created_at >= ?';
            params.push(dateFrom);
        }
        if (dateTo) {
            whereClause += ' AND d.created_at <= ?';
            params.push(dateTo + ' 23:59:59');
        }
        if (status && status !== 'all') {
            whereClause += ' AND d.status = ?';
            params.push(status);
        }

        // Get total count for pagination
        const countResult = await db.query(
            `SELECT COUNT(*) as total FROM donations d WHERE ${whereClause}`,
            params
        );
        const totalCount = countResult[0]?.total || 0;

        // Get paginated data
        const donations = await db.query(
            `SELECT d.*, c.title as campaign_title, c.slug as campaign_slug 
             FROM donations d 
             JOIN campaigns c ON d.campaign_id = c.id 
             WHERE ${whereClause} 
             ORDER BY d.created_at DESC 
             LIMIT ? OFFSET ?`, 
            [...params, limit, offset]
        );

        const transformedDonations = donations.map(d => ({
            id: d.id,
            campaignId: d.campaign_id,
            campaignTitle: d.campaign_title,
            campaignSlug: d.campaign_slug,
            amount: parseFloat(d.amount),
            status: d.status,
            date: d.created_at || d.date,
            paymentUrl: d.payment_url,
            invoiceId: d.xendit_invoice_id,
            externalId: d.xendit_external_id,
            isAnonymous: !!d.is_anonymous,
            message: d.message
        }));

        return NextResponse.json(
            { 
                success: true, 
                data: transformedDonations,
                pagination: {
                    total: totalCount,
                    limit,
                    offset,
                    hasMore: offset + limit < totalCount
                }
            },
            { headers: corsHeaders() }
        );
    }

    // Get user topups (with pagination)
    if (pathStr.startsWith('users/') && pathStr.endsWith('/topups')) {
        const parts = pathStr.split('/');
        const id = parts[1];

        const { searchParams } = new URL(request.url);
        const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
        const offset = parseInt(searchParams.get('offset') || '0');

        const countResult = await db.query(
            "SELECT COUNT(*) as total FROM wallet_topups WHERE user_id = ?",
            [id]
        );
        const totalCount = countResult[0]?.total || 0;

        const topups = await db.query(
            "SELECT * FROM wallet_topups WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?",
            [id, limit, offset]
        );

        return NextResponse.json(
            { 
                success: true, 
                data: topups,
                pagination: {
                    total: totalCount,
                    limit,
                    offset,
                    hasMore: offset + limit < totalCount
                }
            },
            { headers: corsHeaders() }
        );
    }

    // Get user by ID
    if (pathStr.startsWith('users/')) {
      const id = path[1];
      const query = `SELECT * FROM users WHERE id = ? LIMIT 1`;
      const result = await db.query(query, [id]);
      
      if (result.length === 0) {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404, headers: corsHeaders() }
        );
      }
      
      const u = result[0];
      const role = await getUserRole(u.id);
      
      // Get donation stats
      const donationStats = await db.query(
        "SELECT COUNT(*) as count, SUM(amount) as total FROM donations WHERE donor_email = ? AND status = 'paid'",
        [u.email]
      );
      
      // Get campaign stats (if organizer)
      const campaignStats = await db.query(
        "SELECT COUNT(*) as count FROM campaigns WHERE organizer_id = ?",
        [u.id]
      );
      
      const user = {
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        role: role,
        isVerified: !!u.is_verified,
        createdAt: u.created_at,
        bio: u.bio,
        avatar: u.avatar_url,
        balance: parseFloat(u.balance || 0),
        donationCount: donationStats[0].count,
        totalDonations: parseFloat(donationStats[0].total || 0),
        campaignCount: campaignStats[0].count
      };

      return NextResponse.json(
        { success: true, data: user },
        { headers: corsHeaders() }
      );
    }




    // Get Admin Notifications
    if (pathStr === 'admin/notifications') {
        const notifications = [];
        try {
             // Check pending campaigns
             const pendingCampaigns = await db.query("SELECT COUNT(*) as count FROM campaigns WHERE status = 'pending'");
             if (pendingCampaigns[0].count > 0) {
                notifications.push({
                    id: 'camp-pending',
                    title: 'Verifikasi Campaign',
                    message: `${pendingCampaigns[0].count} campaign baru menunggu verifikasi.`,
                    href: '/admin/campaigns?status=pending',
                    type: 'alert',
                    created_at: new Date()
                });
            }
        } catch (e) { console.error('Error checking campaigns:', e); }

        try {
             // Check pending withdrawals (if table exists)
             const pendingWithdrawals = await db.query("SELECT COUNT(*) as count FROM withdrawals WHERE status = 'pending'");
             if (pendingWithdrawals[0].count > 0) {
                notifications.push({
                    id: 'wd-pending',
                    title: 'Permintaan Pencairan',
                    message: `${pendingWithdrawals[0][0]?.count || pendingWithdrawals[0]?.count || 0} permintaan pencairan dana menunggu persetujuan.`, 
                    href: '/admin/withdrawals?status=pending',
                    type: 'warning',
                    created_at: new Date()
                });
            }
        } catch (e) {
             // Ignore error if table doesn't exist
        }

        return NextResponse.json(
            { success: true, data: notifications },
            { headers: corsHeaders() }
        );
    }

    // Get donations (Admin)
    if (pathStr === 'donations' && !pathStr.includes('campaign/')) {
        const query = `
            SELECT d.*, c.title as campaign_title 
            FROM donations d
            LEFT JOIN campaigns c ON d.campaign_id = c.id
            ORDER BY d.created_at DESC
        `;
        const donations = await db.query(query);
        
        const transformedDonations = donations.map(d => ({
            id: d.id,
            externalId: d.xendit_external_id || d.id,
            donorName: d.donor_name,
            donorEmail: d.donor_email,
            donorPhone: d.donor_phone,
            campaignTitle: d.campaign_title,
            amount: parseFloat(d.amount),
            message: d.message,
            status: d.status,
            paymentMethod: d.payment_method,
            paymentChannel: d.payment_channel,
            createdAt: d.created_at || d.date || d.createdAt || new Date(),
            paidAt: d.paid_at,
            isAnonymous: !!d.is_anonymous
        }));

        return NextResponse.json(
            { success: true, data: transformedDonations },
            { headers: corsHeaders() }
        );
    }

    // Dashboard Stats
    if (pathStr === 'stats') {
      const totalDonations = await db.query("SELECT SUM(amount) as total FROM donations WHERE status = 'paid'");
      const totalCampaigns = await db.query("SELECT COUNT(*) as total FROM campaigns");
      const activeCampaigns = await db.query("SELECT COUNT(*) as total FROM campaigns WHERE status = 'active'");
      const totalDonors = await db.query("SELECT COUNT(DISTINCT donor_email) as total FROM donations WHERE status = 'paid'");
      const totalUsers = await db.query("SELECT COUNT(*) as total FROM users");

      // Recent donations for dashboard
      const recentDonationsQuery = `
        SELECT d.id, d.donor_name, c.title as campaign_title, d.amount
        FROM donations d
        JOIN campaigns c ON d.campaign_id = c.id
        WHERE d.status = 'paid'
        ORDER BY d.amount DESC
        LIMIT 5
      `;
      const recentDonations = await db.query(recentDonationsQuery);

      return NextResponse.json({
        success: true,
        data: {
          totalDonations: parseFloat(totalDonations[0].total || 0),
          totalCampaigns: totalCampaigns[0].total,
          activeCampaigns: activeCampaigns[0].total,
          totalDonors: totalDonors[0].total,
          totalUsers: totalUsers[0].total,
          recentDonations: recentDonations.map(d => ({
            id: d.id,
            donor: d.donor_name,
            campaign: d.campaign_title,
            amount: parseFloat(d.amount),
            time: new Date() // Fallback as column missing
          }))
        }
      }, { headers: corsHeaders() });
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
      
      // Get campaign
      const campaign = await db.findOne('campaigns', { id: campaignId });

      if (!campaign) {
        return NextResponse.json(
          { success: false, error: 'Campaign not found' },
          { status: 404, headers: corsHeaders() }
        );
      }

      const donationId = uuidv4();
      const externalId = `DON-${donationId.substring(0, 8).toUpperCase()}`;
      
      // Detect base URL dynamically from request
      const host = request.headers.get('host');
      const proto = request.headers.get('x-forwarded-proto') || 'https';
      const detectedBaseUrl = host ? `${proto}://${host}` : (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000');
      const baseUrl = detectedBaseUrl;

      // Create DOKU Invoice
      const invoiceResult = await doku.createInvoice({
          externalId: externalId,
          amount: parseInt(amount),
          payerEmail: email || 'donor@berbagipath.com',
          description: `Donasi untuk ${campaign.title}`,
          customerName: isAnonymous ? 'Hamba Allah' : (name || 'Anonim'),
          customerPhone: phone,
          successRedirectUrl: `${baseUrl}/payment/success?donation=${externalId}`,
          failureRedirectUrl: `${baseUrl}/payment/failed?donation=${externalId}`
      });

      // Insert donation to DB
      await db.insert('donations', {
        id: donationId,
        campaign_id: campaignId,
        donor_name: isAnonymous ? 'Hamba Allah' : (name || 'Anonim'),
        donor_email: email,
        donor_phone: phone,
        amount: amount,
        message: message,
        is_anonymous: isAnonymous,
        status: 'pending',
        xendit_external_id: externalId,
        xendit_invoice_id: invoiceResult.success ? invoiceResult.data.invoiceId : null,
        payment_url: invoiceResult.success ? invoiceResult.data.invoiceUrl : null,
        created_at: new Date()
      });

      if (!invoiceResult.success) {
        return NextResponse.json(
          { 
            success: false, 
            error: `Xendit Error: ${invoiceResult.error}`
          },
          { status: 400, headers: corsHeaders() }
        );
      }

      return NextResponse.json(
        {
          success: true,
          data: {
            donationId: donationId,
            externalId: externalId,
            invoiceUrl: invoiceResult.data.invoiceUrl,
            amount: invoiceResult.data.amount,
            expiryDate: invoiceResult.data.expiryDate,
          },
          message: 'Donation created. Please complete payment.',
        },
        { status: 201, headers: corsHeaders() }
      );
    }

    // Create Recurring Donation
    if (pathStr === 'recurring-donations') {
        const { campaignId, amount, frequency, userId } = body;
        
        if (!campaignId || !amount || !frequency || !userId) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400, headers: corsHeaders() }
            );
        }

        const id = uuidv4();
        const nextExec = new Date();
        
        if (frequency === 'minute') {
            nextExec.setMinutes(nextExec.getMinutes() + 1);
        } else if (frequency === 'daily') {
            nextExec.setDate(nextExec.getDate() + 1);
        } else if (frequency === 'weekly') {
            nextExec.setDate(nextExec.getDate() + 7);
        } else {
            nextExec.setMonth(nextExec.getMonth() + 1);
        }

        await db.query(`
            INSERT INTO recurring_donations (id, user_id, campaign_id, amount, frequency, next_execution_at)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [id, userId, campaignId, amount, frequency, nextExec]);

        return NextResponse.json(
            { success: true, message: 'Recurring donation created' },
            { status: 201, headers: corsHeaders() }
        );
    }

    // Wallet Top Up
    if (pathStr === 'wallet/topup') {
        const { userId, amount } = body;
        
        if (!userId || !amount) {
            return NextResponse.json({ success: false, error: 'Missing userId or amount' }, { status: 400 });
        }

        const topupId = uuidv4();
        const externalId = `TOPUP-${topupId.substring(0, 8).toUpperCase()}`;
        
        // Detect base URL dynamically from request
        const host = request.headers.get('host');
        const proto = request.headers.get('x-forwarded-proto') || 'https';
        const baseUrl = host ? `${proto}://${host}` : (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000');

        // Create DOKU Invoice for Topup
        const invoiceResult = await doku.createInvoice({
            externalId: externalId,
            amount: parseInt(amount),
            payerEmail: body.email || 'user@berbagipath.com', 
            description: 'Top Up Kantong Donasi BerbagiPath',
            customerName: body.name || 'User BerbagiPath',
            successRedirectUrl: `${baseUrl}/wallet?status=success`,
            failureRedirectUrl: `${baseUrl}/wallet?status=failed`,
        });

        if (!invoiceResult.success) {
            return NextResponse.json({ success: false, error: invoiceResult.error }, { status: 400 });
        }

        await db.insert('wallet_topups', {
            id: topupId,
            user_id: userId,
            amount: amount,
            status: 'pending',
            xendit_external_id: externalId,
            payment_url: invoiceResult.data.invoiceUrl,
        });

        return NextResponse.json({
            success: true,
            data: {
                paymentUrl: invoiceResult.data.invoiceUrl,
                amount: amount,
            }
        }, { status: 201 });
    }



    // DOKU Webhook handler
    if (pathStr === 'webhook/doku') {
        const externalId = body.order?.invoice_number;
        const status = body.transaction?.status;

        console.log('DOKU webhook received:', JSON.stringify(body, null, 2));

        // Log webhook (Safe)
        try {
            await db.insert('webhook_logs', {
               id: uuidv4(),
               event_type: 'DOKU_NOTIFY',
               payload: JSON.stringify(body),
               status: 'received',
               created_at: new Date()
            });
        } catch (e) {
            console.error('Failed to log webhook to DB:', e);
        }

        if (externalId && status === 'SUCCESS') {
             if (externalId.startsWith('DON-')) {
                 // Donation
                 const donations = await db.query("SELECT id FROM donations WHERE xendit_external_id = ? LIMIT 1", [externalId]);
                 if (donations.length > 0) {
                     // Update payment channel info from payload
                     const channel = body.channel?.id || 'DOKU';
                     await db.query("UPDATE donations SET payment_method = 'DOKU', payment_channel = ? WHERE id = ?", [channel, donations[0].id]);
                     
                     await db.query("CALL sp_process_payment(?, ?)", [donations[0].id, 'DOKU-' + externalId]);
                 }
             } else if (externalId.startsWith('TOPUP-')) {
                 // Topup
                 const topups = await db.query("SELECT id FROM wallet_topups WHERE xendit_external_id = ? LIMIT 1", [externalId]);
                 if (topups.length > 0) {
                     // Update payment channel info
                     const channel = body.channel?.id || 'DOKU';
                     // Note: wallet_topups might not have payment_channel/method columns yet, check schema if needed
                     // But if they do, update them here:
                     try {
                         await db.query("UPDATE wallet_topups SET payment_method = 'DOKU', payment_channel = ? WHERE id = ?", [channel, topups[0].id]);
                     } catch (e) {
                         // Ignore if columns don't exist
                     }
                     
                     await db.query("CALL sp_process_topup(?)", [topups[0].id]);
                 }
             }
        }
        
        return NextResponse.json({ success: true });
    }

    // Create new campaign
    if (pathStr === 'campaigns') {
      const { title, description, category, targetAmount, daysToRun, image, story, organizerId } = body;

      if (!title || !description || !targetAmount) {
        return NextResponse.json(
          { success: false, error: 'Missing required fields' },
          { status: 400, headers: corsHeaders() }
        );
      }
      
      // Find category ID from slug
      const catResult = await db.findOne('categories', { slug: category || 'social' });
      const categoryId = catResult ? catResult.id : (await db.findOne('categories', { slug: 'social' }))?.id;

      const campaignId = uuidv4();
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Math.floor(Math.random() * 1000);
      
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + (parseInt(daysToRun) || 30));

      await db.insert('campaigns', {
        id: campaignId,
        slug: slug,
        title,
        description,
        story: story || description,
        category_id: categoryId,
        organizer_id: organizerId || 'user-001', // Default user for now
        image_url: image,
        target_amount: targetAmount,
        current_amount: 0,
        donor_count: 0,
        start_date: new Date(),
        end_date: endDate,
        is_verified: false,
        is_urgent: false,
        status: 'pending' // Default pending approval
      });

      return NextResponse.json(
        { success: true, message: 'Campaign created successfully', id: campaignId, slug: slug },
        { status: 201, headers: corsHeaders() }
      );
    }
    
    // Create new category
    if (pathStr === 'categories') {
        const { name, icon, color } = body;
        
        if (!name) {
             return NextResponse.json(
              { success: false, error: 'Name is required' },
              { status: 400, headers: corsHeaders() }
            );
        }

        const id = 'cat-' + Date.now(); // or uuidv4()
        const slug = name.toLowerCase().replace(/\s+/g, '-');
        
        await db.insert('categories', {
            id,
            name,
            slug,
            icon,
            color
        });

        return NextResponse.json(
            { success: true, message: 'Category created', id: id },
            { status: 201, headers: corsHeaders() }
        );
    }
    
    // Create new user
    if (pathStr === 'users') {
        const { name, email, phone, password, role } = body; // Role might be handled differently in auth system
        
        if (!name || !email) {
            return NextResponse.json(
              { success: false, error: 'Name and Email are required' },
              { status: 400, headers: corsHeaders() }
            );
        }
        
        // Check existing
        const existing = await db.findOne('users', { email });
        if (existing) {
             return NextResponse.json(
              { success: false, error: 'Email already registered' },
              { status: 400, headers: corsHeaders() }
            );
        }

        const userId = uuidv4();
        await db.insert('users', {
            id: userId,
            name,
            email,
            phone,
            password_hash: 'hashed_password_placeholder', // Should hash password
            created_at: new Date(),
            is_verified: true // Auto verify manually created users?
        });

        return NextResponse.json(
            { success: true, message: 'User created successfully', id: userId },
            { status: 201, headers: corsHeaders() }
        );
    }

    // Create new article
    if (pathStr === 'articles') {
        const { title, content, image, status, authorId } = body;
        
        if (!title || !content) {
            return NextResponse.json({ success: false, error: 'Title and Content are required' }, { status: 400 });
        }

        // Check/Create Table (lazy init)
        try {
            await db.query(`
                CREATE TABLE IF NOT EXISTS articles (
                    id VARCHAR(36) PRIMARY KEY,
                    slug VARCHAR(255) UNIQUE NOT NULL,
                    title VARCHAR(255) NOT NULL,
                    excerpt TEXT,
                    content TEXT NOT NULL,
                    image_url VARCHAR(255),
                    author_id VARCHAR(36),
                    status VARCHAR(20) DEFAULT 'published',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP
                );
            `);
        } catch (e) {
            console.error('Table creation error', e); 
        }

        const id = uuidv4();
        // Simple slug generation
        const slugBase = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const slug = slugBase + '-' + id.substring(0,4);
        const excerpt = content.replace(/<[^>]*>/g, '').substring(0, 150) + '...'; // Strip tags for excerpt

        await db.insert('articles', {
            id,
            slug,
            title,
            excerpt,
            content,
            image_url: image,
            author_id: authorId || 'admin', 
            status: status || 'published',
            created_at: new Date()
        });

        return NextResponse.json({ success: true, message: 'Article created', id, slug }, { status: 201 });
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
    let body = {};
    try {
      body = await request.json();
    } catch (e) {
      // Body might be empty
    }

    // Update Article
    if (pathStr.startsWith('articles/')) {
        const id = path[1];
        
        const dbUpdates = {};
        if (body.title) dbUpdates.title = body.title;
        if (body.content) dbUpdates.content = body.content;
        if (body.image) dbUpdates.image_url = body.image;
        if (body.status) dbUpdates.status = body.status;
        if (body.excerpt) dbUpdates.excerpt = body.excerpt;
        
        if (Object.keys(dbUpdates).length > 0) {
            await db.update('articles', dbUpdates, { id: id });
        }
        
        return NextResponse.json(
            { success: true, message: 'Article updated' },
            { headers: corsHeaders() }
        );
    }

    // Update campaign
    if (pathStr.startsWith('campaigns/')) {
      const id = path[1];
      
      // Map frontend fields to DB columns
      const dbUpdates = {};
      if (body.status) dbUpdates.status = body.status;
      if (body.isVerified !== undefined) dbUpdates.is_verified = body.isVerified;
      if (body.isUrgent !== undefined) dbUpdates.is_urgent = body.isUrgent;
      if (body.isBerbagipath !== undefined) dbUpdates.is_berbagipath = body.isBerbagipath;
      if (body.title) dbUpdates.title = body.title;
      if (body.description) dbUpdates.description = body.description;
      if (body.story) dbUpdates.story = body.story;
      if (body.image) dbUpdates.image_url = body.image;
      if (body.targetAmount) dbUpdates.target_amount = parseFloat(body.targetAmount);
      if (body.category) {
        dbUpdates.category_id = body.category;
      }
      if (body.daysToRun) {
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + parseInt(body.daysToRun));
        dbUpdates.end_date = endDate;
      }

      if (Object.keys(dbUpdates).length > 0) {
        await db.update('campaigns', dbUpdates, { id: id });
      }

      return NextResponse.json(
        { success: true, message: 'Campaign updated' },
        { headers: corsHeaders() }
      );
    }
    
    // Update Category
    if (pathStr.startsWith('categories/')) {
        const id = path[1];
        
        const dbUpdates = {};
        if (body.name) {
             dbUpdates.name = body.name;
             dbUpdates.slug = body.name.toLowerCase().replace(/\s+/g, '-');
        }
        if (body.icon) dbUpdates.icon = body.icon;
        if (body.color) dbUpdates.color = body.color;
        
        await db.update('categories', dbUpdates, { id: id });
        
         return NextResponse.json(
            { success: true, message: 'Category updated' },
            { headers: corsHeaders() }
        );
    }

    // Update User
    if (pathStr.startsWith('users/')) {
        const id = path[1];
        
        // Specific verify endpoint
        if (pathStr.endsWith('/verify')) {
             const { isVerified } = body;
             await db.update('users', { is_verified: isVerified }, { id: id });
             return NextResponse.json(
                { success: true, message: 'User verification updated' },
                { headers: corsHeaders() }
            );
        }
        
        // General Update
        const dbUpdates = {};
        if (body.name) dbUpdates.name = body.name;
        if (body.email) dbUpdates.email = body.email;
        if (body.phone) dbUpdates.phone = body.phone;
        if (body.role) dbUpdates.role = body.role;
        if (body.avatar) {
            dbUpdates.avatar_url = body.avatar;
            
            // Delete old avatar if exists and is local file
            try {
                const oldUserQuery = await db.query("SELECT avatar_url FROM users WHERE id = ?", [id]);
                if (oldUserQuery.length > 0) {
                    const oldAvatar = oldUserQuery[0].avatar_url;
                    if (oldAvatar && oldAvatar.startsWith('/uploads/')) {
                        const oldFilePath = `${process.cwd()}/public${oldAvatar}`;
                        await fs.unlink(oldFilePath).catch(() => {}); // Ignore error
                    }
                }
            } catch (err) {
                console.error('Error cleaning up old avatar:', err);
            }
        }
        if (body.password) {
            dbUpdates.password_hash = hashPassword(body.password);
        }
        
        if (Object.keys(dbUpdates).length > 0) {
            await db.update('users', dbUpdates, { id: id });
        }
        
        return NextResponse.json(
            { success: true, message: 'User updated successfully' },
            { headers: corsHeaders() }
        );
    }

    // Mark notification as read
    if (pathStr.startsWith('notifications/') && pathStr.endsWith('/read')) {
        const parts = pathStr.split('/');
        const id = parts[1];
        
        await db.query("UPDATE notifications SET is_read = TRUE WHERE id = ?", [id]);
        
        return NextResponse.json(
            { success: true, message: 'Notification marked as read' },
            { headers: corsHeaders() }
        );
    }

    // Update Recurring Donation
    if (pathStr.startsWith('recurring-donations/')) {
        const id = path[1];
        const dbUpdates = {};
        if (body.isActive !== undefined) dbUpdates.is_active = body.isActive;
        if (body.amount) dbUpdates.amount = body.amount;
        if (body.frequency) {
            dbUpdates.frequency = body.frequency;
            // Update next execution date based on new frequency
            const nextExec = new Date();
            if (body.frequency === 'daily') nextExec.setDate(nextExec.getDate() + 1);
            else if (body.frequency === 'weekly') nextExec.setDate(nextExec.getDate() + 7);
            else nextExec.setMonth(nextExec.getMonth() + 1);
            dbUpdates.next_execution_at = nextExec;
        }

        if (Object.keys(dbUpdates).length > 0) {
            await db.update('recurring_donations', dbUpdates, { id: id });
        }

        return NextResponse.json(
            { success: true, message: 'Recurring donation updated' },
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
      // Delete Campaign
    if (pathStr.startsWith('campaigns/')) {
      const id = path[1];
      await db.remove('campaigns', { id });

      return NextResponse.json(
        { success: true, message: 'Campaign deleted' },
        { headers: corsHeaders() }
      );
    }

    // Delete Article
    if (pathStr.startsWith('articles/')) {
        const id = path[1];
        await db.remove('articles', { id });
        return NextResponse.json(
            { success: true, message: 'Article deleted' },
            { headers: corsHeaders() }
        );
    }

    // Delete Recurring Donation
    if (pathStr.startsWith('recurring-donations/')) {
        const id = path[1];
        await db.remove('recurring_donations', { id: id });
        return NextResponse.json(
            { success: true, message: 'Recurring donation deleted' },
            { headers: corsHeaders() }
        );
    }

    // Delete Category
    if (pathStr.startsWith('categories/')) {
        const id = path[1];
        
        // Find category to check for icon file
        const category = await db.findOne('categories', { id });

        if (category) {
            // Delete icon file if it's an uploaded image
            if (category.icon && category.icon.startsWith('/assets/icons/')) {
                try {
                    const filePath = path.join(process.cwd(), 'public', category.icon);
                    await fs.unlink(filePath);
                } catch (err) {
                    console.error('Failed to delete icon file:', err);
                }
            }
            
            await db.remove('categories', { id });
        }
        
        return NextResponse.json(
            { success: true, message: 'Category deleted' },
            { headers: corsHeaders() }
        );
    }
    
    // Delete Read Notifications
    if (pathStr.startsWith('users/') && pathStr.endsWith('/notifications/read')) {
        const parts = pathStr.split('/');
        const id = parts[1]; // user id
        
        await db.query("DELETE FROM notifications WHERE user_id = ? AND is_read = TRUE", [id]);
        
        return NextResponse.json(
            { success: true, message: 'Read notifications deleted' },
            { headers: corsHeaders() }
        );
    }

    // Delete User
    if (pathStr.startsWith('users/')) {
         const id = path[1];
         // Should delete related data or soft delete
         await db.remove('users', { id });
          return NextResponse.json(
            { success: true, message: 'User deleted' },
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
