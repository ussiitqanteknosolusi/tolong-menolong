
import * as db from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Ambil 5 log webhook terakhir
    const logs = await db.query("SELECT * FROM webhook_logs ORDER BY created_at DESC LIMIT 5");
    
    // Parse payload JSON agar mudah dibaca
    const parsedLogs = logs.map(log => ({
      ...log,
      payload: typeof log.payload === 'string' ? JSON.parse(log.payload) : log.payload
    }));

    return NextResponse.json({ success: true, count: logs.length, data: parsedLogs });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
