
import { NextResponse } from 'next/server';
import * as db from '@/lib/db';

export async function POST(request) {
    try {
        const { externalId } = await request.json();

        if (!externalId) {
            return NextResponse.json({ error: 'External ID is required' }, { status: 400 });
        }

        const donations = await db.query("SELECT * FROM donations WHERE xendit_external_id = ?", [externalId]);
        
        if (donations.length === 0) {
            return NextResponse.json({ error: 'Donation not found' }, { status: 404 });
        }
        
        const donation = donations[0];
        
        if (donation.status === 'paid') {
             return NextResponse.json({ success: true, message: 'Donation already paid' });
        }

        // Update donation status
        await db.query("UPDATE donations SET status = 'paid', paid_at = NOW() WHERE id = ?", [donation.id]);
        
        // Update campaign stats
        await db.query(`
            UPDATE campaigns 
            SET current_amount = current_amount + ?, 
                donor_count = donor_count + 1 
            WHERE id = ?`, 
            [donation.amount, donation.campaign_id]
        );

        // Create notification for organizer
        const campaignResult = await db.query("SELECT title, organizer_id FROM campaigns WHERE id = ?", [donation.campaign_id]);
        if (campaignResult.length > 0) {
            const campaign = campaignResult[0];
            const notificationId = Math.random().toString(36).substring(2, 11); // Simple random ID for debug
            const title = 'Kontribusi Baru!';
            const message = `Seseorang baru saja berdonasi Rp ${donation.amount.toLocaleString('id-ID')} untuk campaign: ${campaign.title}`;
            
            await db.query(
                "INSERT INTO notifications (id, user_id, title, message, type) VALUES (?, ?, ?, ?, ?)",
                [notificationId, campaign.organizer_id, title, message, 'donation']
            );
        }

        return NextResponse.json({ 
            success: true, 
            message: `Donation ${externalId} marked as PAID manually`,
            data: { ...donation, status: 'paid' }
        });

    } catch (error) {
        console.error("Debug Pay Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
