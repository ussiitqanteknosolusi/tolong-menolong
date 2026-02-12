import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST() {
  try {
    // Add balance column to users table
    await query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS balance DECIMAL(15, 2) DEFAULT 0.00 AFTER is_verified
    `);

    return NextResponse.json({ 
      success: true, 
      message: 'Balance column added to users table' 
    });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}
