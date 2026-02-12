import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
// Helper to add CORS headers
function corsHeaders() {
    return {
        'Access-Control-Allow-Origin': process.env.CORS_ORIGINS || '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Callback-Token',
    };
}

export async function POST(req) {
    try {
        const body = await req.json();
        const { campaignId, userId, amount, name, email, phone, message, isAnonymous } = body;

        // Validation
        if (!campaignId || !userId || !amount) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400, headers: corsHeaders() }
            );
        }

        // 1. Check User Balance & Get User Data
        const users = await query('SELECT balance, name, email FROM users WHERE id = ?', [userId]);
        const user = users[0];

        if (!user) {
             return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404, headers: corsHeaders() }
            );
        }

        if (parseFloat(user.balance) < parseFloat(amount)) {
             return NextResponse.json(
                { success: false, error: 'Insufficient balance' },
                { status: 400, headers: corsHeaders() }
            );
        }

        // 2. Start Transaction (Ideally use a transaction block if supported by db lib, but sequential is okay for now)
        // Deduct Balance
        await query('UPDATE users SET balance = balance - ? WHERE id = ?', [amount, userId]);

        // 3. Create Donation Record
        const donationId = uuidv4();
        const donorName = isAnonymous ? 'Hamba Allah' : (name || user.name);
        
        await query(`
            INSERT INTO donations (id, campaign_id, user_id, amount, status, donor_name, donor_email, donor_phone, message, is_anonymous, payment_method)
            VALUES (?, ?, ?, ?, 'paid', ?, ?, ?, ?, ?, 'wallet')
        `, [
            donationId, 
            campaignId, 
            userId, 
            amount, 
            donorName, 
            email || user.email, 
            phone, 
            message, 
            isAnonymous
        ]);

        // 4. Update Campaign Amount & Donor Count
        await query(`
            UPDATE campaigns 
            SET current_amount = current_amount + ?, 
                donor_count = donor_count + 1 
            WHERE id = ?
        `, [amount, campaignId]);

        // 5. Create Notification
        const notifId = uuidv4();
        await query(`
            INSERT INTO notifications (id, user_id, title, message, type)
            VALUES (?, ?, ?, ?, 'donation')
        `, [
            notifId,
            userId,
            'Donasi Berhasil',
            `Terima kasih! Donasi sebesar Rp ${parseInt(amount).toLocaleString('id-ID')} menggunakan saldo berhasil.`
        ]);

        return NextResponse.json(
            { 
                success: true, 
                data: {
                    id: donationId,
                    amount: amount,
                    status: 'paid',
                    method: 'wallet'
                } 
            },
            { status: 201, headers: corsHeaders() }
        );

    } catch (error) {
        console.error('Wallet Payment Error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500, headers: corsHeaders() }
        );
    }
}
