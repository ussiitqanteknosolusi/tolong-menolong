import { NextResponse } from 'next/server';
import { db, query } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request) {
  try {
    // Check for secret/auth to prevent public trigger if needed
    // For now, let's just implement the logic

    const now = new Date();
    
    // 1. Fetch due recurring donations
    const dueDonations = await query(`
      SELECT rd.*, u.name as user_name, u.email as user_email, u.balance as user_balance,
             c.title as campaign_title, c.slug as campaign_slug
      FROM recurring_donations rd
      JOIN users u ON rd.user_id = u.id
      JOIN campaigns c ON rd.campaign_id = c.id
      WHERE rd.is_active = TRUE 
      AND (rd.next_execution_at <= ? OR rd.next_execution_at IS NULL)
    `, [now]);

    const results = [];

    for (const rd of dueDonations) {
      const amount = parseFloat(rd.amount);
      const balance = parseFloat(rd.user_balance);

      if (balance >= amount) {
        // EXECUTE DONATION
        const donationId = uuidv4();
        
        // Use a transaction or sequential queries
        // a. Deduct balance from user
        await query("UPDATE users SET balance = balance - ? WHERE id = ?", [amount, rd.user_id]);
        
        // b. Insert into donations table as 'paid'
        await query(`
          INSERT INTO donations (id, campaign_id, user_id, donor_name, donor_email, amount, status, xendit_external_id, paid_at)
          VALUES (?, ?, ?, ?, ?, ?, 'paid', ?, ?)
        `, [donationId, rd.campaign_id, rd.user_id, rd.user_name, rd.user_email, amount, `AUTO-${donationId.substring(0,8).toUpperCase()}`, now]);

        // c. Update campaign amount via stored procedure
        await query("CALL sp_update_campaign_amount(?, ?)", [rd.campaign_id, amount]);

        // d. Update recurring_donations schedule
        const nextExec = new Date();
        if (rd.frequency === 'minute') {
            nextExec.setMinutes(nextExec.getMinutes() + 1);
        } else if (rd.frequency === 'daily') {
            nextExec.setDate(nextExec.getDate() + 1);
        } else if (rd.frequency === 'weekly') {
            nextExec.setDate(nextExec.getDate() + 7);
        } else {
            nextExec.setMonth(nextExec.getMonth() + 1);
        }

        await query(`
          UPDATE recurring_donations 
          SET last_executed_at = ?, next_execution_at = ?
          WHERE id = ?
        `, [now, nextExec, rd.id]);

        // e. Notify user
        await query(`
          INSERT INTO notifications (id, user_id, title, message, type)
          VALUES (UUID(), ?, 'Donasi Otomatis Berhasil', ?, 'system')
        `, [rd.user_id, `Donasi otomatis Rp ${amount.toLocaleString('id-ID')} untuk "${rd.campaign_title}" telah berhasil dipotong dari saldomu.`]);

        results.push({ id: rd.id, status: 'success', campaign: rd.campaign_title });
      } else {
        // INSUFFICIENT BALANCE
        // a. Notify user
        await query(`
          INSERT INTO notifications (id, user_id, title, message, type)
          VALUES (UUID(), ?, 'Gagal Donasi Otomatis', ?, 'system')
        `, [rd.user_id, `Donasi otomatis untuk "${rd.campaign_title}" gagal karena saldo tidak mencukupi (Rp ${amount.toLocaleString('id-ID')}). Silakan top up saldo Kantong Donasimu.`]);
        
        // b. Push schedule slightly forward so we don't spam notifications every few minutes if the check is frequent
        // but here we just leave it so it can be re-tried when they top up. 
        // Or better, set next check to tomorrow.
        const retryDate = new Date();
        retryDate.setDate(retryDate.getDate() + 1);
        await query("UPDATE recurring_donations SET next_execution_at = ? WHERE id = ?", [retryDate, rd.id]);

        results.push({ id: rd.id, status: 'failed_insufficient_balance', campaign: rd.campaign_title });
      }
    }

    return NextResponse.json({ 
      success: true, 
      processed_count: dueDonations.length,
      details: results
    });

  } catch (error) {
    console.error('Recurring Processing Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
