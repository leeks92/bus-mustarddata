import type { MetadataRoute } from 'next';
import {
  getExpressTerminals,
  getIntercityTerminals,
  getExpressRoutes,
  getIntercityRoutes,
  getMetadata,
} from '@/lib/data';
import { createTerminalSlug, createRouteSlug } from '@/lib/slugs';

// output: 'export' 호환을 위한 설정
export const dynamic = 'force-static';

const BASE_URL = 'https://bus.mustarddata.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const expressTerminals = getExpressTerminals();
  const intercityTerminals = getIntercityTerminals();
  const expressRoutes = getExpressRoutes();
  const intercityRoutes = getIntercityRoutes();
  const metadata = getMetadata();
  
  // 데이터 마지막 업데이트 날짜 (없으면 현재 날짜)
  const dataLastModified = metadata?.lastUpdated 
    ? new Date(metadata.lastUpdated) 
    : new Date();

  // 정적 페이지 (새 URL 구조)
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: dataLastModified,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${BASE_URL}/고속버스/시간표`,
      lastModified: dataLastModified,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/시외버스/시간표`,
      lastModified: dataLastModified,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
  ];

  // 고속버스 터미널 페이지 (중복 제거)
  const expressTerminalSlugs = new Set<string>();
  const expressTerminalPages: MetadataRoute.Sitemap = expressTerminals
    .filter(t => {
      const slug = createTerminalSlug(t.terminalNm);
      if (expressTerminalSlugs.has(slug)) return false;
      expressTerminalSlugs.add(slug);
      return true;
    })
    .map(t => ({
      url: `${BASE_URL}/고속버스/시간표/${createTerminalSlug(t.terminalNm)}`,
      lastModified: dataLastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

  // 시외버스 터미널 페이지 (중복 제거)
  const intercityTerminalSlugs = new Set<string>();
  const intercityTerminalPages: MetadataRoute.Sitemap = intercityTerminals
    .filter(t => {
      const slug = createTerminalSlug(t.terminalNm);
      if (intercityTerminalSlugs.has(slug)) return false;
      intercityTerminalSlugs.add(slug);
      return true;
    })
    .map(t => ({
      url: `${BASE_URL}/시외버스/시간표/${createTerminalSlug(t.terminalNm)}`,
      lastModified: dataLastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

  // 고속버스 노선 페이지 (중복 제거)
  const expressRouteSlugs = new Set<string>();
  const expressRoutePages: MetadataRoute.Sitemap = expressRoutes
    .filter(route => {
      const slug = createRouteSlug(route.depTerminalName, route.arrTerminalName);
      if (expressRouteSlugs.has(slug)) return false;
      expressRouteSlugs.add(slug);
      return true;
    })
    .map(route => ({
      url: `${BASE_URL}/고속버스/시간표/노선/${createRouteSlug(route.depTerminalName, route.arrTerminalName)}`,
      lastModified: dataLastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));

  // 시외버스 노선 페이지 (중복 제거)
  const intercityRouteSlugs = new Set<string>();
  const intercityRoutePages: MetadataRoute.Sitemap = intercityRoutes
    .filter(route => {
      const slug = createRouteSlug(route.depTerminalName, route.arrTerminalName);
      if (intercityRouteSlugs.has(slug)) return false;
      intercityRouteSlugs.add(slug);
      return true;
    })
    .map(route => ({
      url: `${BASE_URL}/시외버스/시간표/노선/${createRouteSlug(route.depTerminalName, route.arrTerminalName)}`,
      lastModified: dataLastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));

  return [
    ...staticPages,
    ...expressTerminalPages,
    ...intercityTerminalPages,
    ...expressRoutePages,
    ...intercityRoutePages,
  ];
}
