import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import fs from 'fs';
import path from 'path';
import { verifyToken } from '@/lib/adminAuth';

export async function POST(req: NextRequest) {
  try {
    // 1. Verify auth
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_session')?.value;
    if (!verifyToken(token)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. Parse form data
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // 3. Convert to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitize and prepare filename
    const origName = file.name || 'file';
    const ext = path.extname(origName);
    const baseName = path.basename(origName, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `${baseName}_${Date.now()}${ext}`;

    const isNetlify = typeof process.env.SITE_ID !== 'undefined' || 
                      typeof process.env.AWS_LAMBDA_FUNCTION_NAME !== 'undefined' ||
                      typeof process.env.NETLIFY_IMAGES_CDN_DOMAIN !== 'undefined';

    if (isNetlify) {
      const { getStore } = await import('@netlify/blobs');
      const store = getStore('portfolio-uploads');
      await store.set(filename, bytes);

      return NextResponse.json({
        success: true,
        url: `/api/uploads/${filename}`,
      });
    } else {
      const uploadDir = path.join(process.cwd(), 'public/uploads');
      if (!fs.existsSync(uploadDir)) {
        await fs.promises.mkdir(uploadDir, { recursive: true });
      }

      const filePath = path.join(uploadDir, filename);
      await fs.promises.writeFile(filePath, buffer);

      return NextResponse.json({
        success: true,
        url: `/uploads/${filename}`,
      });
    }
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || String(error) },
      { status: 500 }
    );
  }
}

