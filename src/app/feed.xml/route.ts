import { getExpressRoutes, getMetadata, getAirportBuses } from '@/lib/data';
import { createRouteSlug } from '@/lib/slugs';

// output: 'export' 호환을 위한 설정
export const dynamic = 'force-static';

const BASE_URL = 'https://bus.mustarddata.com';

export async function GET() {
  const now = new Date();
  const routes = getExpressRoutes();
  const metadata = getMetadata();
  const lastUpdated = metadata?.lastUpdated ? new Date(metadata.lastUpdated).toUTCString() : now.toUTCString();

  const items: string[] = [];

  // 메인 페이지
  items.push(`
    <item>
      <title><![CDATA[버스 시간표 - 고속버스, 시외버스 시간표 조회]]></title>
      <link>${BASE_URL}</link>
      <guid>${BASE_URL}</guid>
      <description><![CDATA[전국 고속버스, 시외버스 시간표를 조회하세요. 출발지와 도착지를 선택하면 배차 시간, 요금, 소요 시간을 확인할 수 있습니다.]]></description>
      <pubDate>${lastUpdated}</pubDate>
    </item>`);

  // 고속버스 페이지
  items.push(`
    <item>
      <title><![CDATA[고속버스 시간표 - 전국 고속버스 터미널 및 노선 조회]]></title>
      <link>${BASE_URL}/express/schedule</link>
      <guid>${BASE_URL}/express/schedule</guid>
      <description><![CDATA[전국 고속버스 터미널 목록과 노선 정보를 제공합니다. 터미널을 선택하여 배차 시간표를 확인하세요.]]></description>
      <pubDate>${lastUpdated}</pubDate>
    </item>`);

  // 시외버스 페이지
  items.push(`
    <item>
      <title><![CDATA[시외버스 시간표 - 전국 시외버스 터미널 및 노선 조회]]></title>
      <link>${BASE_URL}/intercity/schedule</link>
      <guid>${BASE_URL}/intercity/schedule</guid>
      <description><![CDATA[전국 시외버스 터미널 목록과 노선 정보를 제공합니다. 터미널을 선택하여 배차 시간표를 확인하세요.]]></description>
      <pubDate>${lastUpdated}</pubDate>
    </item>`);

  // 터미널 목록 페이지
  items.push(`
    <item>
      <title><![CDATA[버스 터미널 목록 - 전국 고속/시외버스 터미널]]></title>
      <link>${BASE_URL}/terminal</link>
      <guid>${BASE_URL}/terminal</guid>
      <description><![CDATA[전국 고속버스, 시외버스 터미널 목록입니다. 터미널별 노선 정보와 시간표를 확인하세요.]]></description>
      <pubDate>${lastUpdated}</pubDate>
    </item>`);

  // 공항버스 페이지
  items.push(`
    <item>
      <title><![CDATA[인천공항 공항버스 시간표 - 리무진 버스 노선, 요금]]></title>
      <link>${BASE_URL}/airport/schedule</link>
      <guid>${BASE_URL}/airport/schedule</guid>
      <description><![CDATA[인천국제공항 T1·T2 공항버스(리무진) 전 노선 시간표, 요금, 승차 위치 정보를 제공합니다.]]></description>
      <pubDate>${lastUpdated}</pubDate>
    </item>`);

  // 공항버스 노선 (중복 제거)
  const airportBuses = getAirportBuses();
  const seenBus = new Set<string>();
  const uniqueAirportBuses = airportBuses.filter(b => {
    if (seenBus.has(b.busNumber)) return false;
    seenBus.add(b.busNumber);
    return true;
  });
  uniqueAirportBuses.slice(0, 10).forEach(bus => {
    items.push(`
    <item>
      <title><![CDATA[${bus.busNumber}번 공항버스 시간표 - 인천공항 ${bus.areaName} 리무진]]></title>
      <link>${BASE_URL}/airport/schedule/${bus.busNumber}</link>
      <guid>${BASE_URL}/airport/schedule/${bus.busNumber}</guid>
      <description><![CDATA[인천공항 ${bus.busNumber}번 공항버스(${bus.busClass}) 시간표. 요금 ${bus.adultFare > 0 ? bus.adultFare.toLocaleString() + '원' : ''}]]></description>
      <pubDate>${lastUpdated}</pubDate>
    </item>`);
  });

  // 인기 노선 (최대 20개)
  const popularRoutes = routes.slice(0, 20);
  popularRoutes.forEach(route => {
    const routeSlug = createRouteSlug(route.depTerminalName, route.arrTerminalName);
    const url = `${BASE_URL}/express/schedule/route/${routeSlug}`;
    
    items.push(`
    <item>
      <title><![CDATA[${route.depTerminalName} → ${route.arrTerminalName} 고속버스 시간표]]></title>
      <link>${url}</link>
      <guid>${url}</guid>
      <description><![CDATA[${route.depTerminalName}에서 ${route.arrTerminalName}까지 고속버스 시간표입니다. 배차 시간, 요금, 소요 시간을 확인하세요.]]></description>
      <pubDate>${lastUpdated}</pubDate>
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
