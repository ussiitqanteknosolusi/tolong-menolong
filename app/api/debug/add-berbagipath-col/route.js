import { NextResponse } from 'next/server';
import * as db from '@/lib/db';

export async function POST() {
    try {
        // Add is_berbagipath column to campaigns table
        await db.query(`
            ALTER TABLE campaigns 
            ADD COLUMN IF NOT EXISTS is_berbagipath BOOLEAN DEFAULT FALSE
        `).catch(() => {
            // MariaDB/MySQL < 10.0 might not support IF NOT EXISTS for columns
            // Try without it
            return db.query(`ALTER TABLE campaigns ADD COLUMN is_berbagipath BOOLEAN DEFAULT FALSE`).catch(() => {
                // Column might already exist
            });
        });

        return NextResponse.json({ 
            success: true, 
            message: 'is_berbagipath column added to campaigns table' 
        });
    } catch (error) {
        console.error('Migration error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
