import { NextResponse } from 'next/server';
import * as db from '@/lib/db';

export async function GET() {
  try {
    const query = `
      SELECT r.*, c.title as campaign_title, u.name as reporter_name 
      FROM reports r
      LEFT JOIN campaigns c ON r.campaign_id = c.id
      LEFT JOIN users u ON r.user_id = u.id
      ORDER BY FIELD(r.status, 'pending', 'resolved', 'dismissed'), r.created_at DESC
    `;
    const reports = await db.query(query);

    return NextResponse.json({ success: true, data: reports });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
