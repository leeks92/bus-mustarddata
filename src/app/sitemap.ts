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

// 인기 노선 (높은 우선순위 부여)
const popularRouteNames = [
  '서울고속버스터미널(경부 영동선)-부산종합버스터미널',
  '서울고속버스터미널(경부 영동선)-대구동대구터미널',
  '서울고속버스터미널(경부 영동선)-대전복합터미널',
  '동서울종합터미널-강릉고속버스터미널',
  '센트럴시티터미널(호남선)-광주종합버스터미널',
];

// 주요 터미널 (높은 우선순위 부여)
const majorTerminalNames = [
  '서울고속버스터미널',
  '동서울종합터미널',
  '센트럴시티터미널',
  '부산종합버스터미널',
  '대구동대구터미널',
  '대전복합터미널',
  '광주종합버스터미널',
  '강릉고속버스터미널',
];

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
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/고속버스/시간표`,
      lastModified: dataLastModified,
      changeFrequency: 'daily',
      priority: 0.95,
    },
    {
      url: `${BASE_URL}/시외버스/시간표`,
      lastModified: dataLastModified,
      changeFrequency: 'daily',
      priority: 0.95,
    },
    {
      url: `${BASE_URL}/터미널`,
      lastModified: dataLastModified,
      changeFrequency: 'daily',
      priority: 0.95,
    },
  ];
  
  // 터미널 상세 페이지 (통합 - 중복 제거)
  const allTerminals = [...expressTerminals, ...intercityTerminals];
  const terminalSlugs = new Set<string>();
  const terminalPages: MetadataRoute.Sitemap = allTerminals
    .filter(t => {
      const slug = createTerminalSlug(t.terminalNm);
      if (terminalSlugs.has(slug)) return false;
      terminalSlugs.add(slug);
      return true;
    })
    .map(t => ({
      url: `${BASE_URL}/터미널/${createTerminalSlug(t.terminalNm)}`,
      lastModified: dataLastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

  // 고속버스 터미널 페이지 (중복 제거, 주요 터미널 우선순위 높임)
  const expressTerminalSlugs = new Set<string>();
  const expressTerminalPages: MetadataRoute.Sitemap = expressTerminals
    .filter(t => {
      const slug = createTerminalSlug(t.terminalNm);
      if (expressTerminalSlugs.has(slug)) return false;
      expressTerminalSlugs.add(slug);
      return true;
    })
    .map(t => {
      const isMajor = majorTerminalNames.some(name => t.terminalNm.includes(name.replace('터미널', '')));
      return {
        url: `${BASE_URL}/고속버스/시간표/${createTerminalSlug(t.terminalNm)}`,
        lastModified: dataLastModified,
        changeFrequency: 'daily' as const,
        priority: isMajor ? 0.9 : 0.8,
      };
    });

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

  // 고속버스 노선 페이지 (중복 제거, 인기 노선 우선순위 높임)
  const expressRouteSlugs = new Set<string>();
  const expressRoutePages: MetadataRoute.Sitemap = expressRoutes
    .filter(route => {
      const slug = createRouteSlug(route.depTerminalName, route.arrTerminalName);
      if (expressRouteSlugs.has(slug)) return false;
      expressRouteSlugs.add(slug);
      return true;
    })
    .map(route => {
      const routeKey = `${route.depTerminalName}-${route.arrTerminalName}`;
      const isPopular = popularRouteNames.includes(routeKey);
      return {
        url: `${BASE_URL}/고속버스/시간표/노선/${createRouteSlug(route.depTerminalName, route.arrTerminalName)}`,
        lastModified: dataLastModified,
        changeFrequency: 'daily' as const,
        priority: isPopular ? 0.85 : 0.7,
      };
    });

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
      changeFrequency: 'daily' as const,
      priority: 0.65,
    }));

  return [
    ...staticPages,
    ...terminalPages,
    ...expressTerminalPages,
    ...intercityTerminalPages,
    ...expressRoutePages,
    ...intercityRoutePages,
  ];
}
