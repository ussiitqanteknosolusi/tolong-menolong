import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST() {
  try {
    // Create recurring_donations table
    await query(`
      CREATE TABLE IF NOT EXISTS recurring_donations (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        campaign_id VARCHAR(36) NOT NULL,
        amount DECIMAL(15, 2) NOT NULL,
        frequency ENUM('weekly', 'monthly') NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        last_executed_at TIMESTAMP NULL,
        next_execution_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
        INDEX idx_recurring_user (user_id),
        INDEX idx_recurring_next (next_execution_at),
        INDEX idx_recurring_active (is_active)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    return NextResponse.json({ 
      success: true, 
      message: 'Table recurring_donations created successfully' 
    });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}
