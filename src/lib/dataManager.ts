import fs from 'fs';
import path from 'path';
import { PortfolioData, PORTFOLIO_DATA } from './data';

const DATA_FILE = path.join(process.cwd(), 'src/lib/data.json');

export async function getPortfolioData(): Promise<PortfolioData> {
  // Try to load from Netlify Blobs if running on Netlify
  const isNetlify = typeof process.env.SITE_ID !== 'undefined' || 
                    typeof process.env.AWS_LAMBDA_FUNCTION_NAME !== 'undefined' ||
                    typeof process.env.NETLIFY_IMAGES_CDN_DOMAIN !== 'undefined';
  if (isNetlify) {
    try {
      const { getStore } = await import('@netlify/blobs');
      const store = getStore('portfolio-data');
      const data = await store.get('data', { type: 'json' });
      if (data) {
        return data as PortfolioData;
      }
    } catch (blobError) {
      console.error('Error reading portfolio data from Netlify Blobs:', blobError);
    }
  }

  // Check for Vercel KV REST API configuration
  const isVercelKV = typeof process.env.KV_REST_API_URL !== 'undefined' && 
                     typeof process.env.KV_REST_API_TOKEN !== 'undefined';
  if (isVercelKV) {
    try {
      const response = await fetch(process.env.KV_REST_API_URL!, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.KV_REST_API_TOKEN!}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(['GET', 'data'])
      });
      if (response.ok) {
        const data = await response.json();
        if (data && data.result) {
          return JSON.parse(data.result) as PortfolioData;
        }
      } else {
        console.error('Vercel KV REST API get-data error:', response.statusText);
      }
    } catch (kvError) {
      console.error('Error reading portfolio data from Vercel KV:', kvError);
    }
  }

  // Fallback to local file read
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = await fs.promises.readFile(DATA_FILE, 'utf8');
      return JSON.parse(content) as PortfolioData;
    }
  } catch (fileError) {
    console.error('Error reading local portfolio data file:', fileError);
  }

  return PORTFOLIO_DATA;
}


