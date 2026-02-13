
import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS webhook_logs (
        id VARCHAR(36) PRIMARY KEY,
        event_type VARCHAR(50),
        payload TEXT,
        status VARCHAR(20),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Juga pastikan kolom payment_channel dan payment_method ada di tabel donations
    // Gunakan try-catch karena ADD COLUMN akan error jika sudah ada di beberapa versi MySQL tanpa IF NOT EXISTS
    try {
        await query("ALTER TABLE donations ADD COLUMN payment_channel VARCHAR(50)");
    } catch (e) {}
    try {
        await query("ALTER TABLE donations ADD COLUMN payment_method VARCHAR(50)");
    } catch (e) {}

    return NextResponse.json({ success: true, message: 'Updated tables and created webhook_logs' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
