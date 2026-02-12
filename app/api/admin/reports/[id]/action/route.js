import { NextResponse } from 'next/server';
import * as db from '@/lib/db';

export async function POST(request, { params }) {
  const { id } = params;
  try {
    const { action } = await request.json(); // 'resolve', 'dismiss'

    if (!['resolve', 'dismiss'].includes(action)) {
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }

    const statusMap = {
        resolve: 'resolved',
        dismiss: 'dismissed'
    };
    
    // Update
    await db.update('reports', { status: statusMap[action] }, { id });

    return NextResponse.json({ success: true, message: `Report status updated to ${statusMap[action]}` });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
