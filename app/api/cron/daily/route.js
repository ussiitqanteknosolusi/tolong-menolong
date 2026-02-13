
import { NextResponse } from 'next/server';
import * as db from '@/lib/db';

// Force dynamic agar tidak dicache static
export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    // 1. Validasi Keamanan (Opsional tapi DIANJURKAN)
    // Cek header Authorization: Bearer <CRON_SECRET>
    // Pastikan Anda menambahkan CRON_SECRET=bebasaja di .env
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        // Jika akses dari browser langsung tanpa header, tolak atau izinkan saat dev
        // return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[CRON] Starting daily jobs...');
    const logs = [];

    // --- JOB 1: Update Campaign Status (Expired) ---
    // Update campaign yang end_date-nya sudah lewat dan masih 'active' menjadi 'completed' atau 'expired'
    const today = new Date().toISOString().split('T')[0];
    
    // Cari campaign expired
    const expiredCampaigns = await db.query(
        "SELECT id, title FROM campaigns WHERE end_date < NOW() AND status = 'active'"
    );

    if (expiredCampaigns.length > 0) {
        // Update status masal
        await db.query("UPDATE campaigns SET status = 'completed' WHERE end_date < NOW() AND status = 'active'");
        logs.push(`Updated ${expiredCampaigns.length} campaigns to completed: ${expiredCampaigns.map(c => c.title).join(', ')}`);
    } else {
        logs.push('No expired campaigns found.');
    }

    // --- JOB 2: Process Recurring Donations (Simple Mock) ---
    // Di sini logika untuk cek recurring_donations yang next_execution_at <= NOW()
    // Lalu buat Invoice Xendit baru dan kirim email ke user (atau auto-charge jika pakai kartu kredit tokenized)
    
    // Contoh sederhana:
    const dueRecurring = await db.query(
        "SELECT * FROM recurring_donations WHERE next_execution_at <= NOW() AND is_active = TRUE"
    );
    
    if (dueRecurring.length > 0) {
        // Untuk setiap recurring, kita harus:
        // 1. Buat record donasi baru (pending)
        // 2. Kirim notifikasi tagihan ke user
        // 3. Update next_execution_at
        
        for (const rec of dueRecurring) {
            // Update next execution date
            let nextDate = new Date(rec.next_execution_at);
            if (rec.frequency === 'daily') nextDate.setDate(nextDate.getDate() + 1);
            else if (rec.frequency === 'weekly') nextDate.setDate(nextDate.getDate() + 7);
            else if (rec.frequency === 'monthly') nextDate.setMonth(nextDate.getMonth() + 1);
            
            await db.query("UPDATE recurring_donations SET next_execution_at = ? WHERE id = ?", [nextDate, rec.id]);
            
            // TODO: Integrasi pembuatan invoice Xendit sungguhan di sini
            logs.push(`Processed recurring id ${rec.id}. Next run: ${nextDate}`);
        }
    } else {
        logs.push('No recurring donations due.');
    }

    console.log('[CRON] Finished.', logs);

    return NextResponse.json({ 
        success: true, 
        message: 'Daily cron executed successfully',
        logs 
    });

  } catch (error) {
    console.error('[CRON] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
