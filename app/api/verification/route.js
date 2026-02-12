import { NextResponse } from 'next/server';
import * as db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ success: false, error: 'User ID required' }, { status: 400 });
  }

  try {
    const requests = await db.query(
      'SELECT * FROM verification_requests WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
      [userId]
    );
    
    // Map snake_case to camelCase for frontend consistency
    const data = requests.length > 0 ? {
        id: requests[0].id,
        userId: requests[0].user_id,
        ktpUrl: requests[0].ktp_image_url,
        selfieUrl: requests[0].selfie_image_url,
        bankName: requests[0].bank_name,
        accountNumber: requests[0].bank_account_number,
        accountHolder: requests[0].bank_account_holder,
        status: requests[0].status,
        rejectionReason: requests[0].rejection_reason,
        createdAt: requests[0].created_at
    } : null;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, ktpUrl, selfieUrl, bankName, accountNumber, accountHolder } = body;

    if (!userId || !ktpUrl || !selfieUrl || !bankName || !accountNumber || !accountHolder) {
      return NextResponse.json({ success: false, error: 'Semua field harus diisi' }, { status: 400 });
    }
    
    // Check pending request
    const existing = await db.query(
        "SELECT * FROM verification_requests WHERE user_id = ? AND status = 'pending'",
        [userId]
    );

    if (existing.length > 0) {
        return NextResponse.json({ success: false, error: 'Anda sudah memiliki permintaan verifikasi yang sedang diproses.' }, { status: 400 });
    }

    const id = uuidv4();
    await db.insert('verification_requests', {
      id,
      user_id: userId,
      ktp_image_url: ktpUrl,
      selfie_image_url: selfieUrl,
      bank_name: bankName,
      bank_account_number: accountNumber,
      bank_account_holder: accountHolder,
      status: 'pending',
      created_at: new Date()
    });

    return NextResponse.json({ success: true, message: 'Permintaan verifikasi dikirim' }, { status: 201 });
  } catch (error) {
     console.error("Verification POST error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
