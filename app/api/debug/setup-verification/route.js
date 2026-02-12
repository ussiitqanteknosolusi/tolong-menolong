import { NextResponse } from 'next/server';
import * as db from '@/lib/db';

export async function GET() {
  try {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS verification_requests (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        ktp_image_url TEXT,
        selfie_image_url TEXT,
        bank_name VARCHAR(100),
        bank_account_number VARCHAR(100),
        bank_account_holder VARCHAR(100),
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        rejection_reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX (user_id),
        INDEX (status)
      )
    `;

    await db.query(createTableQuery);

    return NextResponse.json({ success: true, message: 'Table verification_requests created/verified' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
