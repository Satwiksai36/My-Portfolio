import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import fs from 'fs';
import path from 'path';
import { verifyToken } from '@/lib/adminAuth';

const DATA_FILE = path.join(process.cwd(), 'src/lib/data.json');

export async function GET() {
  return NextResponse.json({
    deployedAt: new Date().toISOString(),
    version: 'debug-v2',
    envKeys: Object.keys(process.env).filter(k => 
      !k.includes('SECRET') && 
      !k.includes('TOKEN') && 
      !k.includes('KEY') && 
      !k.includes('PASS')
    ),
    isNetlifyCheck: {
      SITE_ID: typeof process.env.SITE_ID !== 'undefined',
      AWS_LAMBDA_FUNCTION_NAME: typeof process.env.AWS_LAMBDA_FUNCTION_NAME !== 'undefined',
      NETLIFY_IMAGES_CDN_DOMAIN: typeof process.env.NETLIFY_IMAGES_CDN_DOMAIN !== 'undefined',
    }
  });
}

export async function POST(req: NextRequest) {
  try {
    // 1. Verify authentication
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_session')?.value;
    
    if (!verifyToken(token)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. Parse body data
    const newData = await req.json();

    // 3. Write data (Netlify Blobs in production, Vercel KV, or local file in development)
    const isNetlify = typeof process.env.SITE_ID !== 'undefined' || 
                      typeof process.env.AWS_LAMBDA_FUNCTION_NAME !== 'undefined' ||
                      typeof process.env.NETLIFY_IMAGES_CDN_DOMAIN !== 'undefined';
    if (isNetlify) {
      const { getStore } = await import('@netlify/blobs');
      const store = getStore('portfolio-data');
      await store.setJSON('data', newData);
    } else {
      const isVercelKV = typeof process.env.KV_REST_API_URL !== 'undefined' && 
                         typeof process.env.KV_REST_API_TOKEN !== 'undefined';
      if (isVercelKV) {
        const response = await fetch(process.env.KV_REST_API_URL!, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.KV_REST_API_TOKEN!}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(['SET', 'data', JSON.stringify(newData)])
        });
        if (!response.ok) {
          throw new Error(`Vercel KV REST API set-data error: ${response.statusText}`);
        }
      } else {
        await fs.promises.writeFile(
          DATA_FILE,
          JSON.stringify(newData, null, 2),
          'utf8'
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Save data API error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || String(error) },
      { status: 500 }
    );
  }
}

