import { NextResponse } from 'next/server';
import * as db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export async function POST(request) {
  try {
    const { name, email, password, phone } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Nama, Email, dan Password wajib diisi' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await db.findOne('users', { email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Email sudah terdaftar' },
        { status: 400 }
      );
    }

    const userId = uuidv4();
    const hashedPassword = hashPassword(password);

    await db.insert('users', {
      id: userId,
      name,
      email,
      phone,
      password_hash: hashedPassword,
      role: 'user',
      is_verified: false,
      created_at: new Date(),
    });

    return NextResponse.json(
      { success: true, message: 'Registrasi berhasil' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Register Error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan sistem' },
      { status: 500 }
    );
  }
}
