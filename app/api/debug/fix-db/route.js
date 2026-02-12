import { NextResponse } from 'next/server';
import * as db from '@/lib/db';

export async function GET() {
  try {
    // Check columns
    const columns = await db.query("SHOW COLUMNS FROM users");
    const columnNames = columns.map(c => c.Field);
    
    const updates = [];

    if (!columnNames.includes('password_hash')) {
        await db.query("ALTER TABLE users ADD COLUMN password_hash VARCHAR(255)");
        updates.push("Added password_hash");
    }
    
    if (!columnNames.includes('role')) {
        await db.query("ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'user'");
        updates.push("Added role");
    }

    if (!columnNames.includes('is_verified')) {
        await db.query("ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT FALSE");
        updates.push("Added is_verified");
    }
    
    if (!columnNames.includes('phone')) {
         await db.query("ALTER TABLE users ADD COLUMN phone VARCHAR(20)");
         updates.push("Added phone");
    }

    return NextResponse.json({ success: true, updates, currentColumns: columnNames });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
