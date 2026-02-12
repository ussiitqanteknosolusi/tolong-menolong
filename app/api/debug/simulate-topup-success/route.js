import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request) {
  try {
    const { topupId } = await request.json();

    if (!topupId) {
      return NextResponse.json({ success: false, error: 'topupId is required' }, { status: 400 });
    }

    // Call the stored procedure directly to simulate Xendit success
    await query("CALL sp_process_topup(?)", [topupId]);

    return NextResponse.json({ 
      success: true, 
      message: `Topup ${topupId} successfully simulated as PAID and balance updated!` 
    });
  } catch (error) {
    console.error('Simulation error:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}
