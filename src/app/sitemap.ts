import type { MetadataRoute } from 'next';
import {
  getExpressTerminals,
  getIntercityTerminals,
  getExpressRoutes,
  getMetadata,
} from '@/lib/data';

// output: 'export' 호환을 위한 설정
export const dynamic = 'force-static';

const BASE_URL = 'https://bus.mustarddata.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const expressTerminals = getExpressTerminals();
  const intercityTerminals = getIntercityTerminals();
  const routes = getExpressRoutes();
  const metadata = getMetadata();
  
  // 데이터 마지막 업데이트 날짜 (없으면 현재 날짜)
  const dataLastModified = metadata?.lastUpdated 
    ? new Date(metadata.lastUpdated) 
    : new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: dataLastModified,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${BASE_URL}/express`,
      lastModified: dataLastModified,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/intercity`,
      lastModified: dataLastModified,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/terminal`,
      lastModified: dataLastModified,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];

  // 터미널 페이지
  const allTerminals = [...expressTerminals, ...intercityTerminals];
  const uniqueTerminalIds = [...new Set(allTerminals.map(t => t.terminalId))];
  const terminalPages: MetadataRoute.Sitemap = uniqueTerminalIds.map(id => ({
    url: `${BASE_URL}/terminal/${id}`,
    lastModified: dataLastModified,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // 노선 페이지
  const routePages: MetadataRoute.Sitemap = routes.map(route => ({
    url: `${BASE_URL}/express/${route.depTerminalId}/${route.arrTerminalId}`,
    lastModified: dataLastModified,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [...staticPages, ...terminalPages, ...routePages];
}
