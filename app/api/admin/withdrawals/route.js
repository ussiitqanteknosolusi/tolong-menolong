import { NextResponse } from 'next/server';
import * as db from '@/lib/db';

export async function GET() {
  try {
    const query = `
      SELECT w.*, c.title as campaign_title, u.name as organizer_name, u.email as organizer_email
      FROM withdrawals w
      LEFT JOIN campaigns c ON w.campaign_id = c.id
      LEFT JOIN users u ON w.user_id = u.id
      ORDER BY FIELD(w.status, 'pending', 'approved', 'completed', 'rejected'), w.created_at ASC
    `;
    const withdrawals = await db.query(query);

    return NextResponse.json({ success: true, data: withdrawals });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
