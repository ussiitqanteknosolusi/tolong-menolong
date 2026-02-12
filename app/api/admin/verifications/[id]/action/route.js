import { NextResponse } from 'next/server';
import * as db from '@/lib/db';

export async function POST(request, { params }) {
  const { id } = params;
  try {
    const { action, reason } = await request.json(); // action: 'approve' or 'reject'

    if (!['approve', 'reject'].includes(action)) {
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }

    // Get request
    const requests = await db.query("SELECT * FROM verification_requests WHERE id = ?", [id]);
    if (requests.length === 0) return NextResponse.json({ success: false, error: 'Request not found' }, { status: 404 });
    const reqData = requests[0];

    if (reqData.status !== 'pending') {
        return NextResponse.json({ success: false, error: 'Request already processed' }, { status: 400 });
    }

    if (action === 'approve') {
        // Update request status
        await db.update('verification_requests', { status: 'approved' }, { id });
        
        // Update user status
        await db.update('users', { is_verified: true, role: 'organizer' }, { id: reqData.user_id });
    } else {
        await db.update('verification_requests', { status: 'rejected', rejection_reason: reason || 'Data tidak valid' }, { id });
    }

    return NextResponse.json({ success: true, message: `Request ${action}d` });
  } catch (error) {
    console.error('Action Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
