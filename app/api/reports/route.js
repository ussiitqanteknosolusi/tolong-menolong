import { NextResponse } from 'next/server';
import * as db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request) {
  try {
    const body = await request.json();
    const { campaignId, userId, reason, description } = body;

    if (!campaignId || !reason) {
        return NextResponse.json({ success: false, error: 'Data tidak lengkap' }, { status: 400 });
    }

    await db.query(`
        INSERT INTO reports (id, campaign_id, user_id, reason, description, status)
        VALUES (?, ?, ?, ?, ?, 'pending')
    `, [uuidv4(), campaignId, userId || 'anonymous', reason, description || '']);

    return NextResponse.json({ success: true, message: 'Laporan berhasil dikirim' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
