import { NextResponse } from 'next/server';
import * as db from '@/lib/db';

export async function POST(request, { params }) {
  const { id } = params;
  try {
    const { action, note } = await request.json(); // 'approve', 'reject', 'complete'

    if (!['approve', 'reject', 'complete'].includes(action)) {
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }

    const statusMap = {
        approve: 'approved',
        reject: 'rejected',
        complete: 'completed'
    };
    
    const newStatus = statusMap[action];

    // Check existing
    const rows = await db.query('SELECT * FROM withdrawals WHERE id = ?', [id]);
    if (rows.length === 0) return NextResponse.json({ success: false, error: 'Withdrawal not found' }, { status: 404 });

    const current = rows[0];
    if (current.status === newStatus) {
         return NextResponse.json({ success: false, error: 'Status already updated' }, { status: 400 });
    }

    // Update
    await db.update('withdrawals', { 
        status: newStatus,
        admin_note: note || null
    }, { id });

    return NextResponse.json({ success: true, message: `Withdrawal status updated to ${newStatus}` });
  } catch (error) {
    console.error('Action Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
