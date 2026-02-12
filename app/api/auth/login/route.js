import { NextResponse } from 'next/server';
import * as db from '@/lib/db';
import crypto from 'crypto';

function verifyPassword(password, hash) {
  return crypto.createHash('sha256').update(password).digest('hex') === hash;
}

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email dan password wajib diisi' },
        { status: 400 }
      );
    }

    const user = await db.findOne('users', { email });

    if (!user || !verifyPassword(password, user.password_hash)) {
      return NextResponse.json(
        { success: false, error: 'Email atau password salah' },
        { status: 401 }
      );
    }

    // Return user info (excluding password)
    const { password_hash, ...userInfo } = user;
    
    // Add mock token for client usage
    const token = crypto.randomBytes(32).toString('hex');
    
    // In a real app, you'd create a session in DB or sign a JWT here.
    // For this prototype, we trust the client session storage + API checks if needed.
    
    return NextResponse.json(
      { success: true, user: userInfo, token },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login Error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan sistem' },
      { status: 500 }
    );
  }
}
