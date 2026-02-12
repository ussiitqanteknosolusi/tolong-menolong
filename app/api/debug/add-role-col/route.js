import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST() {
  try {
    // Check if column exists
    const cols = await query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'role' AND TABLE_SCHEMA = DATABASE()
    `);

    if (cols.length === 0) {
      await query(`
        ALTER TABLE users 
        ADD COLUMN role ENUM('user', 'organizer', 'admin') DEFAULT 'user'
      `);
    }

    // Set some users as admin for testing (optional, but good for the user)
    // We can't know which users are admins yet, but we can set the one who asked maybe?
    // For now just add the column.

    return NextResponse.json({ 
      success: true, 
      message: 'Role column added to users table' 
    });
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}
