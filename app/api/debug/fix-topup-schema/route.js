
import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Tambahkan kolom ke wallet_topups jika belum ada
    try {
        await query("ALTER TABLE wallet_topups ADD COLUMN payment_channel VARCHAR(50)");
    } catch (e) {}
    try {
        await query("ALTER TABLE wallet_topups ADD COLUMN payment_method VARCHAR(50)");
    } catch (e) {}

    return NextResponse.json({ success: true, message: 'Database wallet_topups updated' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
