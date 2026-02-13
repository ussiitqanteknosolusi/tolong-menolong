import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    current_base_url: process.env.NEXT_PUBLIC_BASE_URL || 'NOT SET',
    is_localhost: (process.env.NEXT_PUBLIC_BASE_URL || '').includes('localhost'),
    doku_client_id_configured: !!process.env.DOKU_CLIENT_ID,
    environment: process.env.NODE_ENV,
    hint: "Jika current_base_url adalah 'localhost' atau 'NOT SET', maka webhook DOKU tidak akan pernah masuk. Segera update Environment Variables di panel Hostinger Kakak."
  });
}
