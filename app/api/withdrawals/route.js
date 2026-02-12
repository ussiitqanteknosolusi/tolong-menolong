import { NextResponse } from 'next/server';
import * as db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request) {
  try {
    const body = await request.json();
    const { campaignId, userId, amount, bankName, accountNumber, accountHolder } = body;

    if (!amount || amount <= 0) {
        return NextResponse.json({ success: false, error: 'Jumlah penarikan tidak valid' }, { status: 400 });
    }

    // 1. Verify Campaign Ownership
    const campaigns = await db.query('SELECT * FROM campaigns WHERE id = ? AND organizer_id = ?', [campaignId, userId]);
    if (campaigns.length === 0) {
        return NextResponse.json({ success: false, error: 'Campaign tidak ditemukan atau Anda bukan pemiliknya' }, { status: 403 });
    }
    const campaign = campaigns[0];

    // 2. Check Balance (Current Amount - Total Pending/Approved/Completed Withdrawals)
    const withdrawalStats = await db.query(`
        SELECT SUM(amount) as total_claimed 
        FROM withdrawals 
        WHERE campaign_id = ? AND status IN ('pending', 'approved', 'completed')
    `, [campaignId]);
    
    const claimedAmount = parseFloat(withdrawalStats[0]?.total_claimed || 0);
    const currentAmount = parseFloat(campaign.current_amount || 0); // Assuming current_amount exists in campaigns table
    // Note: Schema uses current_amount (snake_case) or currentAmount (camel)? 
    // Usually DB uses snake_case. API returns camel. Let's check previous files. Step 843 used current_amount and currentAmount in API.
    // Let's assume current_amount column.

    const available = currentAmount - claimedAmount;

    if (parseFloat(amount) > available) {
        return NextResponse.json({ 
            success: false, 
            error: `Saldo tidak mencukupi. Tersedia: Rp ${available.toLocaleString('id-ID')}` 
        }, { status: 400 });
    }

    // 3. Create Request
    await db.query(`
        INSERT INTO withdrawals (id, campaign_id, user_id, amount, bank_name, account_number, account_holder, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
    `, [uuidv4(), campaignId, userId, amount, bankName, accountNumber, accountHolder]);

    return NextResponse.json({ success: true, message: 'Permintaan pencairan berhasil dibuat' });
  } catch (error) {
    console.error('Withdrawal Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const campaignId = searchParams.get('campaignId');

    try {
        let query = `
            SELECT w.*, c.title as campaign_title 
            FROM withdrawals w
            JOIN campaigns c ON w.campaign_id = c.id
        `;
        const params = [];
        const conditions = [];

        if (userId) {
            conditions.push("w.user_id = ?");
            params.push(userId);
        }
        if (campaignId) {
            conditions.push("w.campaign_id = ?");
            params.push(campaignId);
        }

        if (conditions.length > 0) {
            query += " WHERE " + conditions.join(" AND ");
        }

        query += " ORDER BY w.created_at DESC";

        const withdrawals = await db.query(query, params);

        return NextResponse.json({ success: true, data: withdrawals });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
