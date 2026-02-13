import { NextResponse } from 'next/server';
import * as db from '@/lib/db';
import * as doku from '@/lib/doku';

// =============================================================
// Manual Payment Status Checker
// Endpoint: GET /api/debug/check-payment?id=TOPUP-XXXXXXXX
// =============================================================
// Jika webhook DOKU tidak sampai, endpoint ini bisa dipakai
// untuk mengecek status pembayaran langsung ke DOKU,
// lalu update database jika sudah SUCCESS.
// =============================================================

export async function GET(request) {
  const url = new URL(request.url);
  const externalId = url.searchParams.get('id');

  if (!externalId) {
    // Jika tidak ada parameter, ambil semua transaksi pending
    try {
      const pendingDonations = await db.query(
        "SELECT xendit_external_id, amount, status, created_at FROM donations WHERE status = 'pending' ORDER BY created_at DESC LIMIT 10"
      );
      const pendingTopups = await db.query(
        "SELECT xendit_external_id, amount, status, created_at FROM wallet_topups WHERE status = 'pending' ORDER BY created_at DESC LIMIT 10"
      );

      return NextResponse.json({
        success: true,
        message: 'Tambahkan ?id=TOPUP-XXXX atau ?id=DON-XXXX untuk cek status. Atau gunakan ?check_all=true untuk cek semua.',
        check_all: url.searchParams.get('check_all') === 'true',
        pending: {
          donations: pendingDonations.map(d => ({
            externalId: d.xendit_external_id,
            amount: parseFloat(d.amount),
            status: d.status,
            createdAt: d.created_at,
            checkUrl: `/api/debug/check-payment?id=${d.xendit_external_id}`
          })),
          topups: pendingTopups.map(t => ({
            externalId: t.xendit_external_id,
            amount: parseFloat(t.amount),
            status: t.status,
            createdAt: t.created_at,
            checkUrl: `/api/debug/check-payment?id=${t.xendit_external_id}`
          }))
        }
      });
    } catch (err) {
      return NextResponse.json({ success: false, error: err.message });
    }
  }

  try {
    // Step 1: Cek status di DOKU
    console.log(`[CHECK-PAYMENT] Checking status for ${externalId}...`);
    const dokuStatus = await doku.checkPaymentStatus(externalId);
    
    console.log(`[CHECK-PAYMENT] DOKU response:`, dokuStatus);

    if (!dokuStatus.success) {
      return NextResponse.json({
        success: false,
        externalId,
        error: `DOKU returned error: ${dokuStatus.error}`,
        hint: 'Pastikan invoice_number benar dan DOKU credentials valid.'
      });
    }

    const result = {
      externalId,
      dokuStatus: dokuStatus.data,
      dbUpdated: false,
    };

    // Step 2: Jika STATUS = SUCCESS, update database
    if (dokuStatus.data.status === 'SUCCESS') {
      const paymentChannel = dokuStatus.data.channel || 'DOKU';
      const paymentMethod = dokuStatus.data.service || 'DOKU';

      if (externalId.startsWith('DON-')) {
        const donations = await db.query(
          "SELECT id, status FROM donations WHERE xendit_external_id = ? LIMIT 1",
          [externalId]
        );

        if (donations.length > 0 && donations[0].status === 'pending') {
          // Update payment info
          await db.query(
            "UPDATE donations SET payment_method = ?, payment_channel = ? WHERE id = ?",
            [paymentMethod, paymentChannel, donations[0].id]
          );

          // Call stored procedure
          try {
            await db.query("CALL sp_process_payment(?, ?)", [donations[0].id, 'DOKU-' + externalId]);
          } catch (spErr) {
            // Fallback
            await db.query(
              "UPDATE donations SET status = 'paid', paid_at = NOW() WHERE id = ?",
              [donations[0].id]
            );
          }

          result.dbUpdated = true;
          result.message = `Donation ${externalId} updated to PAID!`;
        } else if (donations.length > 0) {
          result.message = `Donation already has status: ${donations[0].status}`;
        } else {
          result.message = `Donation not found in database`;
        }

      } else if (externalId.startsWith('TOPUP-')) {
        const topups = await db.query(
          "SELECT id, status FROM wallet_topups WHERE xendit_external_id = ? LIMIT 1",
          [externalId]
        );

        if (topups.length > 0 && topups[0].status === 'pending') {
          // Update payment info
          try {
            await db.query(
              "UPDATE wallet_topups SET payment_method = ?, payment_channel = ? WHERE id = ?",
              [paymentMethod, paymentChannel, topups[0].id]
            );
          } catch (e) {}

          // Call stored procedure
          try {
            await db.query("CALL sp_process_topup(?)", [topups[0].id]);
          } catch (spErr) {
            await db.query(
              "UPDATE wallet_topups SET status = 'paid' WHERE id = ?",
              [topups[0].id]
            );
          }

          result.dbUpdated = true;
          result.message = `Topup ${externalId} updated to PAID!`;
        } else if (topups.length > 0) {
          result.message = `Topup already has status: ${topups[0].status}`;
        } else {
          result.message = `Topup not found in database`;
        }
      }
    } else {
      result.message = `Payment status is ${dokuStatus.data.status}, not SUCCESS yet.`;
    }

    return NextResponse.json({ success: true, ...result });

  } catch (error) {
    console.error('[CHECK-PAYMENT] Error:', error);
    return NextResponse.json({ success: false, error: error.message });
  }
}
