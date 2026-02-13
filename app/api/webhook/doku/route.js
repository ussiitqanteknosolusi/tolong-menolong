import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import * as db from '@/lib/db';
import crypto from 'crypto';

// ============================================================
// DOKU Webhook Handler — Dedicated Route
// Endpoint: POST /api/webhook/doku
// ============================================================
// Ini adalah endpoint khusus untuk menerima HTTP Notification
// dari DOKU. Dipisahkan dari catch-all route agar:
// 1. Error handling lebih terkontrol
// 2. Signature verification bisa dilakukan
// 3. Tidak terganggu middleware/parsing lain
// ============================================================

// Disable body parsing — kita butuh raw body untuk signature verification
export const dynamic = 'force-dynamic';

// CORS headers khusus webhook
function webhookCorsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Client-Id, Request-Id, Request-Timestamp, Signature',
  };
}

// Handle OPTIONS (preflight) — penting agar DOKU tidak diblokir CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: webhookCorsHeaders(),
  });
}

// Handle GET — beri info bahwa endpoint ini hanya menerima POST
export async function GET() {
  return NextResponse.json(
    { 
      success: true, 
      message: 'DOKU Webhook endpoint is active. This endpoint only accepts POST requests from DOKU.' 
    },
    { headers: webhookCorsHeaders() }
  );
}

// ============================================================
// MAIN: Handle POST dari DOKU
// ============================================================
export async function POST(request) {
  let rawBody = '';
  let body = {};

  try {
    // ---- STEP 1: Baca Raw Body ----
    rawBody = await request.text();
    console.log('[WEBHOOK] Raw body received, length:', rawBody.length);
    console.log('[WEBHOOK] Raw body:', rawBody);

    // ---- STEP 2: Parse JSON ----
    try {
      body = JSON.parse(rawBody);
    } catch (parseError) {
      console.error('[WEBHOOK] Failed to parse JSON:', parseError.message);
      console.error('[WEBHOOK] Raw body was:', rawBody.substring(0, 500));
      return NextResponse.json(
        { success: false, error: 'Invalid JSON body' },
        { status: 400, headers: webhookCorsHeaders() }
      );
    }

    console.log('[WEBHOOK] Parsed body:', JSON.stringify(body, null, 2));

    // ---- STEP 3: Signature Verification (Opsional tapi Direkomendasikan) ----
    const clientId = request.headers.get('client-id');
    const requestId = request.headers.get('request-id');
    const requestTimestamp = request.headers.get('request-timestamp');
    const signatureHeader = request.headers.get('signature');
    const notificationPath = '/api/webhook/doku'; // Request target

    console.log('[WEBHOOK] Headers:', {
      clientId,
      requestId,
      requestTimestamp,
      hasSignature: !!signatureHeader,
    });

    // Verifikasi signature jika DOKU_SECRET_KEY tersedia
    if (process.env.DOKU_SECRET_KEY && signatureHeader) {
      try {
        const digest = crypto.createHash('sha256').update(rawBody).digest('base64');
        const digestComponent = `Digest:${digest}`;

        const componentSignature = `Client-Id:${clientId}\nRequest-Id:${requestId}\nRequest-Timestamp:${requestTimestamp}\nRequest-Target:${notificationPath}\n${digestComponent}`;

        const hmac = crypto.createHmac('sha256', process.env.DOKU_SECRET_KEY);
        hmac.update(componentSignature);
        const calculatedSignature = `HMACSHA256=${hmac.digest('base64')}`;

        if (calculatedSignature !== signatureHeader) {
          console.warn('[WEBHOOK] Signature mismatch!');
          console.warn('[WEBHOOK] Expected:', calculatedSignature);
          console.warn('[WEBHOOK] Received:', signatureHeader);
          // Di sandbox, kita log saja tapi TETAP proses (karena path mungkin berbeda)
          // Di production, uncomment baris di bawah untuk menolak request:
          // return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 401 });
        } else {
          console.log('[WEBHOOK] Signature VALID ✅');
        }
      } catch (sigError) {
        console.error('[WEBHOOK] Signature verification error:', sigError);
        // Lanjutkan proses meskipun verifikasi gagal (untuk sandbox)
      }
    }

    // ---- STEP 4: Log Webhook ke Database ----
    try {
      await db.insert('webhook_logs', {
        id: uuidv4(),
        event_type: 'DOKU_NOTIFY',
        payload: rawBody,
        status: 'received',
        created_at: new Date(),
      });
      console.log('[WEBHOOK] Logged to database ✅');
    } catch (logError) {
      console.error('[WEBHOOK] Failed to log to DB:', logError.message);
      // Jangan return error — tetap proses webhook
    }

    // ---- STEP 5: Extract Data dari Payload ----
    // DOKU Checkout API notification format:
    // body.order.invoice_number -> external ID kita
    // body.transaction.status -> SUCCESS, FAILED, dll
    // body.channel.id -> payment channel (e.g. VIRTUAL_ACCOUNT_BCA)
    const externalId = body.order?.invoice_number || body.invoice_number;
    const transactionStatus = body.transaction?.status || body.status;
    const paymentChannel = body.channel?.id || body.payment_channel || body.acquirer?.id || 'DOKU';
    const paymentMethod = body.service?.id || body.payment_method || 'DOKU';

    console.log('[WEBHOOK] Extracted:', { externalId, transactionStatus, paymentChannel, paymentMethod });

    if (!externalId) {
      console.warn('[WEBHOOK] No external ID found in payload');
      return NextResponse.json(
        { success: true, message: 'Acknowledged but no invoice number found' },
        { headers: webhookCorsHeaders() }
      );
    }

    // ---- STEP 6: Proses Berdasarkan Status ----
    if (transactionStatus === 'SUCCESS') {
      console.log(`[WEBHOOK] Processing SUCCESS for ${externalId}`);

      if (externalId.startsWith('DON-')) {
        // ==================== DONASI ====================
        const donations = await db.query(
          "SELECT id FROM donations WHERE xendit_external_id = ? LIMIT 1",
          [externalId]
        );

        if (donations.length > 0) {
          const donationId = donations[0].id;

          // Update payment info
          await db.query(
            "UPDATE donations SET payment_method = ?, payment_channel = ? WHERE id = ?",
            [paymentMethod, paymentChannel, donationId]
          );
          console.log(`[WEBHOOK] Updated payment info for donation ${donationId}`);

          // Panggil stored procedure untuk update status + saldo campaign
          try {
            await db.query("CALL sp_process_payment(?, ?)", [donationId, 'DOKU-' + externalId]);
            console.log(`[WEBHOOK] sp_process_payment called for ${donationId} ✅`);
          } catch (spError) {
            console.error(`[WEBHOOK] sp_process_payment failed:`, spError.message);
            // Fallback: update status manual jika SP gagal
            await db.query(
              "UPDATE donations SET status = 'paid', paid_at = NOW() WHERE id = ?",
              [donationId]
            );
            console.log(`[WEBHOOK] Fallback manual update done for ${donationId}`);
          }
        } else {
          console.warn(`[WEBHOOK] Donation not found for ${externalId}`);
        }

      } else if (externalId.startsWith('TOPUP-')) {
        // ==================== TOP UP ====================
        const topups = await db.query(
          "SELECT id FROM wallet_topups WHERE xendit_external_id = ? LIMIT 1",
          [externalId]
        );

        if (topups.length > 0) {
          const topupId = topups[0].id;

          // Update payment info (ignore error jika kolom belum ada)
          try {
            await db.query(
              "UPDATE wallet_topups SET payment_method = ?, payment_channel = ? WHERE id = ?",
              [paymentMethod, paymentChannel, topupId]
            );
          } catch (e) {
            console.warn('[WEBHOOK] Could not update payment info for topup:', e.message);
          }

          // Panggil stored procedure
          try {
            await db.query("CALL sp_process_topup(?)", [topupId]);
            console.log(`[WEBHOOK] sp_process_topup called for ${topupId} ✅`);
          } catch (spError) {
            console.error(`[WEBHOOK] sp_process_topup failed:`, spError.message);
            // Fallback: update status manual
            await db.query(
              "UPDATE wallet_topups SET status = 'paid' WHERE id = ?",
              [topupId]
            );
            console.log(`[WEBHOOK] Fallback manual update done for topup ${topupId}`);
          }
        } else {
          console.warn(`[WEBHOOK] Topup not found for ${externalId}`);
        }
      }

    } else if (transactionStatus === 'FAILED' || transactionStatus === 'EXPIRED') {
      console.log(`[WEBHOOK] Processing ${transactionStatus} for ${externalId}`);

      if (externalId.startsWith('DON-')) {
        await db.query(
          "UPDATE donations SET status = 'failed' WHERE xendit_external_id = ? AND status = 'pending'",
          [externalId]
        );
      } else if (externalId.startsWith('TOPUP-')) {
        await db.query(
          "UPDATE wallet_topups SET status = 'failed' WHERE xendit_external_id = ? AND status = 'pending'",
          [externalId]
        );
      }
    }

    // ---- STEP 7: Update log status ----
    try {
      await db.query(
        "UPDATE webhook_logs SET status = ? WHERE payload LIKE ? ORDER BY created_at DESC LIMIT 1",
        [`processed_${transactionStatus}`, `%${externalId}%`]
      );
    } catch (e) {
      // Non-critical
    }

    // ---- STEP 8: Return 200 OK ----
    // PENTING: Selalu return 200 agar DOKU tidak mengirim ulang terus-menerus
    return NextResponse.json(
      { success: true, message: `Webhook processed for ${externalId}` },
      { status: 200, headers: webhookCorsHeaders() }
    );

  } catch (error) {
    console.error('[WEBHOOK] CRITICAL ERROR:', error);
    console.error('[WEBHOOK] Raw body was:', rawBody.substring(0, 500));

    // Tetap return 200 agar DOKU tidak retry terus
    return NextResponse.json(
      { success: true, message: 'Acknowledged with error' },
      { status: 200, headers: webhookCorsHeaders() }
    );
  }
}
