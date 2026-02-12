import { NextResponse } from 'next/server';
import * as db from '@/lib/db';

export async function GET() {
  try {
    const query = `
      SELECT v.*, u.name as user_name, u.email as user_email 
      FROM verification_requests v
      LEFT JOIN users u ON v.user_id = u.id
      WHERE v.status = 'pending'
      ORDER BY v.created_at ASC
    `;
    const requests = await db.query(query);

    return NextResponse.json({ success: true, data: requests.map(r => ({
        id: r.id,
        userId: r.user_id,
        userName: r.user_name,
        userEmail: r.user_email,
        ktpUrl: r.ktp_image_url,
        selfieUrl: r.selfie_image_url,
        bankName: r.bank_name,
        accountNumber: r.bank_account_number,
        accountHolder: r.bank_account_holder,
        createdAt: r.created_at
    })) });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
