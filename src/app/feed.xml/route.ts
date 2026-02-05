import {
  getExpressTerminals,
  getIntercityTerminals,
  getExpressRoutes,
} from '@/lib/data';

// output: 'export' 호환을 위한 설정
export const dynamic = 'force-static';

const BASE_URL = 'https://bus.mustarddata.com';

export async function GET() {
  const now = new Date();
  const expressTerminals = getExpressTerminals();
  const intercityTerminals = getIntercityTerminals();
  const routes = getExpressRoutes();

  // 터미널 이름 맵 생성
  const terminalNameMap = new Map<string, string>();
  [...expressTerminals, ...intercityTerminals].forEach(t => {
    terminalNameMap.set(t.terminalId, t.terminalNm);
  });

  const items: string[] = [];

  // 메인 페이지
  items.push(`
    <item>
      <title><![CDATA[버스 시간표 - 고속버스, 시외버스 시간표 조회]]></title>
      <link>${BASE_URL}</link>
      <guid>${BASE_URL}</guid>
      <description><![CDATA[전국 고속버스, 시외버스 시간표를 조회하세요. 출발지와 도착지를 선택하면 배차 시간, 요금, 소요 시간을 확인할 수 있습니다.]]></description>
      <pubDate>${new Date('2026-02-02').toUTCString()}</pubDate>
    </item>`);

  // 고속버스 페이지
  items.push(`
    <item>
      <title><![CDATA[고속버스 시간표 - 전국 고속버스 터미널 및 노선 조회]]></title>
      <link>${BASE_URL}/고속버스/시간표</link>
      <guid>${BASE_URL}/고속버스/시간표</guid>
      <description><![CDATA[전국 고속버스 터미널 목록과 노선 정보를 제공합니다. 터미널을 선택하여 배차 시간표를 확인하세요.]]></description>
      <pubDate>${new Date('2026-02-02').toUTCString()}</pubDate>
    </item>`);

  // 시외버스 페이지
  items.push(`
    <item>
      <title><![CDATA[시외버스 시간표 - 전국 시외버스 터미널 및 노선 조회]]></title>
      <link>${BASE_URL}/시외버스/시간표</link>
      <guid>${BASE_URL}/시외버스/시간표</guid>
      <description><![CDATA[전국 시외버스 터미널 목록과 노선 정보를 제공합니다. 터미널을 선택하여 배차 시간표를 확인하세요.]]></description>
      <pubDate>${new Date('2026-02-02').toUTCString()}</pubDate>
    </item>`);

  // 터미널 목록 페이지
  items.push(`
    <item>
      <title><![CDATA[버스 터미널 목록 - 전국 고속/시외버스 터미널]]></title>
      <link>${BASE_URL}/터미널</link>
      <guid>${BASE_URL}/터미널</guid>
      <description><![CDATA[전국 고속버스, 시외버스 터미널 목록입니다. 터미널별 노선 정보와 시간표를 확인하세요.]]></description>
      <pubDate>${new Date('2026-02-02').toUTCString()}</pubDate>
    </item>`);

  // 인기 노선 (최대 20개)
  const popularRoutes = routes.slice(0, 20);
  popularRoutes.forEach(route => {
    const depName = terminalNameMap.get(route.depTerminalId) || route.depTerminalId;
    const arrName = terminalNameMap.get(route.arrTerminalId) || route.arrTerminalId;
    const url = `${BASE_URL}/express/${route.depTerminalId}/${route.arrTerminalId}`;
    
    items.push(`
    <item>
      <title><![CDATA[${depName} → ${arrName} 고속버스 시간표]]></title>
      <link>${url}</link>
      <guid>${url}</guid>
      <description><![CDATA[${depName}에서 ${arrName}까지 고속버스 시간표입니다. 배차 시간, 요금, 소요 시간을 확인하세요.]]></description>
      <pubDate>${new Date('2026-02-02').toUTCString()}</pubDate>
    </item>`);
  });

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>버스 시간표 - 고속버스, 시외버스</title>
    <link>${BASE_URL}</link>
    <description>전국 고속버스, 시외버스 시간표를 조회하세요. 출발지와 도착지를 선택하면 배차 시간, 요금, 소요 시간을 확인할 수 있습니다.</description>
    <language>ko</language>
    <lastBuildDate>${now.toUTCString()}</lastBuildDate>
    <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
    ${items.join('')}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=604800, s-maxage=604800', // 7일 캐시
    },
  });
}
