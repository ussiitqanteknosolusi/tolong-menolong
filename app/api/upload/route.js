
import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request) {
  try {
      const data = await request.formData();
      const file = data.get('file');
      const folder = data.get('folder') || ''; // Optional subfolder

      if (!file) {
        return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Ensure uploads directory exists
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);
      try {
          await mkdir(uploadDir, { recursive: true });
      } catch (e) {
          // Ignore if exists
      }

      // Sanitize filename
      const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '-')}`;
      const filepath = path.join(uploadDir, filename);

      await writeFile(filepath, buffer);
      
      const relativePath = folder ? `/uploads/${folder}/${filename}` : `/uploads/${filename}`;

      return NextResponse.json({ 
          success: true, 
          url: relativePath 
      });
  } catch (error) {
      console.error('Upload error:', error);
      return NextResponse.json({ success: false, error: 'Upload failed' }, { status: 500 });
  }
}
