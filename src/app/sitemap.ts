import { getPortfolioData } from '@/lib/dataManager';
import type { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const data = await getPortfolioData();
  const baseUrl = data.baseUrl || 'http://localhost:3000';
  
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
  ];
}
