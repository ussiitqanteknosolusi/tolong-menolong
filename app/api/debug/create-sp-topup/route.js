import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST() {
  try {
    // Verify and fix existing NULL balances by recalculating from scratch
    // This ensures consistency even if data was corrupted
    await query(`
      UPDATE users u
      SET balance = (
        SELECT COALESCE(SUM(amount), 0) 
        FROM wallet_topups 
        WHERE user_id = u.id AND status = 'paid'
      ) - (
        SELECT COALESCE(SUM(amount), 0) 
        FROM donations 
        WHERE user_id = u.id 
          AND status = 'paid' 
          AND (payment_method = 'wallet' OR (payment_method IS NULL AND xendit_invoice_id IS NULL))
      )
    `);

    // Create sp_process_topup stored procedure
    await query(`
      DROP PROCEDURE IF EXISTS sp_process_topup;
    `);

    await query(`
      CREATE PROCEDURE sp_process_topup(
        IN p_topup_id VARCHAR(36)
      )
      BEGIN
        DECLARE v_user_id VARCHAR(36);
        DECLARE v_amount DECIMAL(15, 2);
        DECLARE v_status VARCHAR(20);
        
        -- Get topup details
        SELECT user_id, amount, status INTO v_user_id, v_amount, v_status
        FROM wallet_topups
        WHERE id = p_topup_id;
        
        IF v_status = 'pending' THEN
          -- Update topup status
          UPDATE wallet_topups
          SET 
            status = 'paid',
            updated_at = NOW()
          WHERE id = p_topup_id;
          
          -- Update user balance (handle NULL)
          UPDATE users
          SET balance = COALESCE(balance, 0) + v_amount
          WHERE id = v_user_id;

          -- Add to notifications
          INSERT INTO notifications (id, user_id, title, message, type)
          VALUES (UUID(), v_user_id, 'Top Up Berhasil', CONCAT('Saldo sebesar Rp ', FORMAT(v_amount, 0, 'id_ID'), ' telah ditambahkan ke Kantong Donasimu.'), 'system');
        END IF;
      END
    `);

    return NextResponse.json({ 
      success: true, 
      message: 'Stored procedure sp_process_topup created successfully' 
    });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}
