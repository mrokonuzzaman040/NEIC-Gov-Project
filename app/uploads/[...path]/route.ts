import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const filePath = path.join(process.cwd(), 'uploads', ...params.path);
    
    // Security check: ensure the file is within the uploads directory
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!filePath.startsWith(uploadsDir)) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // Check if file exists
    if (!existsSync(filePath)) {
      return new NextResponse('File not found', { status: 404 });
    }

    // Read and serve the file
    const fileBuffer = await readFile(filePath);
    
    // Determine content type based on file extension
    const ext = path.extname(filePath).toLowerCase();
    const contentTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
    };
    
    const contentType = contentTypes[ext] || 'application/octet-stream';

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000', // 1 year cache
      },
    });
  } catch (error) {
    console.error('Error serving uploaded file:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
