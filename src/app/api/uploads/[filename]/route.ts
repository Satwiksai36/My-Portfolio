import { NextRequest, NextResponse } from 'next/server';

function getContentType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'pdf': return 'application/pdf';
    case 'jpg':
    case 'jpeg': return 'image/jpeg';
    case 'png': return 'image/png';
    case 'gif': return 'image/gif';
    case 'svg': return 'image/svg+xml';
    case 'webp': return 'image/webp';
    case 'avif': return 'image/avif';
    case 'mp4': return 'video/mp4';
    case 'webm': return 'video/webm';
    default: return 'application/octet-stream';
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;

    // Check if running on Netlify
    const isNetlify = typeof process.env.SITE_ID !== 'undefined' || 
                      typeof process.env.AWS_LAMBDA_FUNCTION_NAME !== 'undefined' ||
                      typeof process.env.NETLIFY_IMAGES_CDN_DOMAIN !== 'undefined';

    if (isNetlify) {
      const { getStore } = await import('@netlify/blobs');
      const store = getStore('portfolio-uploads');
      const blob = await store.get(filename, { type: 'blob' });
      
      if (!blob) {
        return new Response('File not found', { status: 404 });
      }

      return new Response(blob, {
        headers: {
          'Content-Type': getContentType(filename),
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    } else {
      // Local development fallback: Redirect to public folder uploads
      return NextResponse.redirect(new URL(`/uploads/${filename}`, req.url));
    }
  } catch (error) {
    console.error('Error fetching upload blob:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
