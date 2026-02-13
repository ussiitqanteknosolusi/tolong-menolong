
import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const columns = await query("SHOW COLUMNS FROM donations");
    return NextResponse.json({ success: true, columns });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
