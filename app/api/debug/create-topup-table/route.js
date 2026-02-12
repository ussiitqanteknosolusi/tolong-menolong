import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST() {
  try {
    // Create wallet_topups table
    await query(`
      CREATE TABLE IF NOT EXISTS wallet_topups (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        amount DECIMAL(15, 2) NOT NULL,
        status ENUM('pending', 'paid', 'failed') DEFAULT 'pending',
        xendit_external_id VARCHAR(100),
        payment_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_topup_user (user_id),
        INDEX idx_topup_status (status),
        INDEX idx_topup_external (xendit_external_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    return NextResponse.json({ 
      success: true, 
      message: 'Table wallet_topups created successfully' 
    });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}
