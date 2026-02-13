
import * as db from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  let invoice = searchParams.get('invoice');
  
  if (!invoice) {
      // Ambil donasi pending terakhir
      const lastPending = await db.query("SELECT xendit_external_id FROM donations WHERE status = 'pending' ORDER BY created_at DESC LIMIT 1");
      if (lastPending.length > 0) {
          invoice = lastPending[0].xendit_external_id;
      } else {
          return NextResponse.json({ success: false, error: 'No pending donation found to simulate.' });
      }
  }

  // Construct payload mirip DOKU
  const payload = {
      order: { invoice_number: invoice },
      transaction: { status: 'SUCCESS', date: new Date().toISOString() },
      channel: { id: 'VIRTUAL_ACCOUNT_BCA' } // Default simulation channel
  };

  // Panggil webhook handler internal logic (duplikasi logika karena sulit fetch self)
  try {
      if (invoice.startsWith('DON-')) {
         const donations = await db.query("SELECT id FROM donations WHERE xendit_external_id = ? LIMIT 1", [invoice]);
         if (donations.length > 0) {
             const channel = payload.channel.id;
             // Update payment info
             await db.query("UPDATE donations SET payment_method = 'DOKU', payment_channel = ?, status = 'paid', paid_at = NOW() WHERE id = ?", [channel, donations[0].id]);
             
             // Panggil SP jika ada, atau abaikan untuk simulasi ini (update manual sudah cukup untuk status)
             try {
                await db.query("CALL sp_process_payment(?, ?)", [donations[0].id, 'DOKU-' + invoice]);
             } catch (e) {
                console.log('SP call skipped or failed, but manual update done.');
             }

             return NextResponse.json({ success: true, message: `Simulated webhook for ${invoice}`, payload });
         }
      } else if (invoice.startsWith('TOPUP-')) {
          // Logic for topup
          const topups = await db.query("SELECT id FROM wallet_topups WHERE xendit_external_id = ? LIMIT 1", [invoice]);
          if (topups.length > 0) {
             const channel = payload.channel.id;
             await db.query("UPDATE wallet_topups SET payment_method = 'DOKU', payment_channel = ?, status = 'paid' WHERE id = ?", [channel, topups[0].id]);
             try {
                await db.query("CALL sp_process_topup(?)", [topups[0].id]);
             } catch (e) {}

             return NextResponse.json({ success: true, message: `Simulated webhook for Topup ${invoice}`, payload });
          }
      }
      
      return NextResponse.json({ success: false, error: 'Invoice not found in DB', invoice });

  } catch (error) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
