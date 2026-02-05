import type { Metadata } from 'next';
import Link from 'next/link';
import {
  getTerminal,
  getRoutesFromTerminal,
  getExpressTerminals,
  getExpressRoutes,
  formatCharge,
} from '@/lib/data';
import { getTerminalInfo } from '@/lib/terminal-info';
import { BusStationJsonLd, BreadcrumbJsonLd } from '@/components/JsonLd';
import {
  getExpressTerminalIdBySlug,
  getExpressSlugByTerminalId,
  createTerminalSlug,
  createRouteSlug,
} from '@/lib/slugs';

const BASE_URL = 'https://bus.mustarddata.com';

interface Props {
  params: Promise<{
    terminal: string;
  }>;
}

// 정적 페이지 생성
export async function generateStaticParams() {
  const terminals = getExpressTerminals();
  const slugSet = new Set<string>();
  
  return terminals
    .map(t => {
      const slug = createTerminalSlug(t.terminalNm);
      if (slugSet.has(slug)) return null;
      slugSet.add(slug);
      return { terminal: slug };
    })
    .filter((p): p is { terminal: string } => p !== null);
}

// 동적 메타데이터
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { terminal: terminalSlug } = await params;
  const decodedSlug = decodeURIComponent(terminalSlug);
  const terminalId = getExpressTerminalIdBySlug(decodedSlug);
  const terminal = terminalId ? getTerminal(terminalId) : null;

  if (!terminal) {
    return {
      title: '터미널을 찾을 수 없습니다',
    };
  }

  const routes = getRoutesFromTerminal(terminalId!);

  return {
    title: `${terminal.terminalNm} 고속버스 시간표 - 요금, 노선 안내`,
    description: `${terminal.terminalNm}에서 출발하는 고속버스 시간표와 요금 정보. ${routes.length}개 노선 운행, 전국 주요 도시 연결.`,
    keywords: [
      `${terminal.terminalNm} 고속버스`,
      `${terminal.terminalNm} 시간표`,
      `${terminal.terminalNm} 버스 요금`,
      '고속버스 예매',
    ],
    alternates: {
      canonical: `${BASE_URL}/고속버스/시간표/${decodedSlug}`,
    },
    openGraph: {
      title: `${terminal.terminalNm} 고속버스 시간표`,
      description: `${terminal.terminalNm} 고속버스 시간표와 요금 정보를 확인하세요. ${routes.length}개 노선 운행.`,
      url: `${BASE_URL}/고속버스/시간표/${decodedSlug}`,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: `${terminal.terminalNm} 고속버스 시간표`,
      description: `${terminal.terminalNm} 고속버스 시간표와 요금 정보를 확인하세요.`,
    },
  };
}

export default async function ExpressTerminalPage({ params }: Props) {
  const { terminal: terminalSlug } = await params;
  const decodedSlug = decodeURIComponent(terminalSlug);
  const terminalId = getExpressTerminalIdBySlug(decodedSlug);
  const terminal = terminalId ? getTerminal(terminalId) : null;
  const routes = terminalId ? getRoutesFromTerminal(terminalId) : [];
  const expressRoutes = getExpressRoutes();
  const terminalInfo = terminal ? getTerminalInfo(terminal.terminalNm) : null;

  if (!terminal || !terminalId) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">터미널을 찾을 수 없습니다</h1>
        <Link href="/고속버스/시간표" className="text-blue-600 hover:underline">
          고속버스 터미널 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  // 고속버스 노선만 필터링
  const expressOnlyRoutes = routes.filter(r => 
    expressRoutes.some(er => er.depTerminalId === r.depTerminalId && er.arrTerminalId === r.arrTerminalId)
  );

  // 도착지별로 정렬
  const sortedRoutes = expressOnlyRoutes.sort((a, b) =>
    a.arrTerminalName.localeCompare(b.arrTerminalName)
  );

  const breadcrumbItems = [
    { name: '홈', url: BASE_URL },
    { name: '고속버스 시간표', url: `${BASE_URL}/고속버스/시간표` },
    { name: terminal.terminalNm, url: `${BASE_URL}/고속버스/시간표/${decodedSlug}` },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* JSON-LD 구조화 데이터 */}
      <BusStationJsonLd
        name={terminal.terminalNm}
        address={terminalInfo?.address}
        telephone={terminalInfo?.phone}
        url={`${BASE_URL}/고속버스/시간표/${decodedSlug}`}
      />
      <BreadcrumbJsonLd items={breadcrumbItems} />

      {/* 브레드크럼 */}
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-blue-600">
          홈
        </Link>
        <span className="mx-2">›</span>
        <Link href="/고속버스/시간표" className="hover:text-blue-600">
          고속버스 시간표
        </Link>
        <span className="mx-2">›</span>
        <span className="text-gray-800">{terminal.terminalNm}</span>
      </nav>

      {/* 터미널 정보 헤더 */}
      <header className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl p-6 mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-white/20 px-2 py-1 rounded text-sm">고속버스</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          {terminal.terminalNm} 고속버스 시간표
        </h1>
        <p className="opacity-90">{terminal.cityName || '고속버스 터미널'}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
            {sortedRoutes.length}개 노선 운행
          </span>
        </div>
      </header>

      {/* 터미널 상세 정보 */}
      {terminalInfo && (
        <section className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-900">터미널 정보</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {terminalInfo.address && (
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">주소</p>
                    <p className="text-gray-900">{terminalInfo.address}</p>
                  </div>
                </div>
              )}
              {terminalInfo.phone && (
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">전화번호</p>
                    <a href={`tel:${terminalInfo.phone}`} className="text-blue-600 hover:underline font-medium">
                      {terminalInfo.phone}
                    </a>
                  </div>
                </div>
              )}
            </div>
            {terminalInfo.facilities && terminalInfo.facilities.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">편의시설</p>
                <div className="flex flex-wrap gap-2">
                  {terminalInfo.facilities.map((facility, index) => (
                    <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                      {facility}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 출발 노선 목록 */}
      <section>
        <h2 className="text-xl font-bold mb-4">{terminal.terminalNm}에서 출발하는 고속버스</h2>
        {sortedRoutes.length === 0 ? (
          <p className="text-gray-500">운행 노선 정보가 없습니다.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedRoutes.map(route => {
              const minCharge = Math.min(...route.schedules.map(s => s.charge));
              const routeSlug = createRouteSlug(terminal.terminalNm, route.arrTerminalName);

              return (
                <Link
                  key={route.arrTerminalId}
                  href={`/고속버스/시간표/노선/${routeSlug}`}
                  className="bg-white border rounded-lg p-4 hover:shadow-md hover:border-indigo-200 transition"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{route.arrTerminalName}</h3>
                    <span className="text-indigo-500">→</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>{route.schedules.length}회/일</span>
                    <span className="font-medium text-indigo-600">
                      {formatCharge(minCharge)}~
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* 예매 안내 */}
      <section className="mt-12 bg-gray-100 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-900">예매 안내</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium mb-2 text-gray-800">온라인 예매</h3>
            <ul className="text-sm text-gray-700 space-y-2">
              <li>
                <a
                  href="https://www.kobus.co.kr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  고속버스통합예매 (KOBUS) →
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2 text-gray-800">이용 안내</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• 출발 30분 전 도착 권장</li>
              <li>• 신분증 필수 지참</li>
              <li>• 성수기 사전 예매 필수</li>
            </ul>
          </div>
        </div>
      </section>

      {/* SEO 텍스트 */}
      <section className="mt-8 text-sm text-gray-600">
        <p>
          {terminal.terminalNm}에서 출발하는 고속버스 시간표입니다. 
          총 {sortedRoutes.length}개 노선이 운행되며, 전국 주요 도시로 연결됩니다.
          정확한 시간과 요금은 예매 사이트에서 확인하세요.
        </p>
      </section>
    </div>
  );
}
