import type { Metadata } from 'next';
import Link from 'next/link';
import {
  getTerminal,
  getRoutesFromTerminal,
  getExpressTerminals,
  getIntercityTerminals,
  getExpressRoutes,
  getIntercityRoutes,
  formatCharge,
  getValidMinCharge,
} from '@/lib/data';
import { getTerminalInfo } from '@/lib/terminal-info';
import { getTerminalGuide } from '@/lib/terminal-guide';
import { BusStationJsonLd, BreadcrumbJsonLd, LocalBusinessJsonLd, FAQJsonLd } from '@/components/JsonLd';
import {
  getExpressTerminalIdBySlug,
  getIntercityTerminalIdBySlug,
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
  const expressTerminals = getExpressTerminals();
  const intercityTerminals = getIntercityTerminals();
  const allTerminals = [...expressTerminals, ...intercityTerminals];
  const slugSet = new Set<string>();
  
  return allTerminals
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
  
  // 고속버스 또는 시외버스 터미널 찾기
  let terminalId = getExpressTerminalIdBySlug(decodedSlug);
  if (!terminalId) {
    terminalId = getIntercityTerminalIdBySlug(decodedSlug);
  }
  
  const terminal = terminalId ? getTerminal(terminalId) : null;

  if (!terminal) {
    return {
      title: '터미널을 찾을 수 없습니다',
    };
  }

  const routes = getRoutesFromTerminal(terminalId!);

  return {
    title: `${terminal.terminalNm} 버스 시간표 - 고속버스·시외버스 노선 안내`,
    description: `${terminal.terminalNm}에서 출발하는 버스 시간표와 요금 정보. ${routes.length}개 노선 운행.`,
    alternates: {
      canonical: `${BASE_URL}/terminal/${decodedSlug}`,
    },
    openGraph: {
      title: `${terminal.terminalNm} 버스 시간표`,
      description: `${terminal.terminalNm} 버스 시간표와 요금 정보를 확인하세요.`,
      url: `${BASE_URL}/terminal/${decodedSlug}`,
      type: 'website',
    },
  };
}

export default async function TerminalDetailPage({ params }: Props) {
  const { terminal: terminalSlug } = await params;
  const decodedSlug = decodeURIComponent(terminalSlug);
  
  // 고속버스 또는 시외버스 터미널 찾기
  let terminalId = getExpressTerminalIdBySlug(decodedSlug);
  let busType: 'express' | 'intercity' = 'express';
  
  if (!terminalId) {
    terminalId = getIntercityTerminalIdBySlug(decodedSlug);
    busType = 'intercity';
  }
  
  const terminal = terminalId ? getTerminal(terminalId) : null;
  const routes = terminalId ? getRoutesFromTerminal(terminalId) : [];
  const terminalInfo = terminal ? getTerminalInfo(terminal.terminalNm) : null;
  const terminalGuide = terminal ? getTerminalGuide(terminal.terminalNm) : null;
  
  const expressRoutes = getExpressRoutes();
  const intercityRoutes = getIntercityRoutes();

  if (!terminal || !terminalId) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">터미널을 찾을 수 없습니다</h1>
        <Link href="/terminal" className="text-blue-600 hover:underline">
          터미널 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  // 고속버스/시외버스 노선 분리
  const expressOnlyRoutes = routes.filter(r => 
    expressRoutes.some(er => er.depTerminalId === r.depTerminalId && er.arrTerminalId === r.arrTerminalId)
  );
  const intercityOnlyRoutes = routes.filter(r => 
    intercityRoutes.some(ir => ir.depTerminalId === r.depTerminalId && ir.arrTerminalId === r.arrTerminalId)
  );

  const breadcrumbItems = [
    { name: '홈', url: BASE_URL },
    { name: '터미널', url: `${BASE_URL}/terminal` },
    { name: terminal.terminalNm, url: `${BASE_URL}/terminal/${decodedSlug}` },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* JSON-LD 구조화 데이터 */}
      <BusStationJsonLd
        name={terminal.terminalNm}
        address={terminalInfo?.address}
        telephone={terminalInfo?.phone}
        url={`${BASE_URL}/terminal/${decodedSlug}`}
      />
      {terminalInfo && (
        <LocalBusinessJsonLd
          name={terminal.terminalNm}
          address={terminalInfo.address}
          telephone={terminalInfo.phone}
          url={`${BASE_URL}/terminal/${decodedSlug}`}
          openingHours="Mo-Su 05:00-23:00"
        />
      )}
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <FAQJsonLd items={[
        {
          question: `${terminal.terminalNm}에서 출발하는 버스 노선은 몇 개인가요?`,
          answer: `${terminal.terminalNm}에서는 ${expressOnlyRoutes.length > 0 ? `고속버스 ${expressOnlyRoutes.length}개 노선` : ''}${expressOnlyRoutes.length > 0 && intercityOnlyRoutes.length > 0 ? ', ' : ''}${intercityOnlyRoutes.length > 0 ? `시외버스 ${intercityOnlyRoutes.length}개 노선` : ''}이 운행됩니다.`,
        },
        {
          question: `${terminal.terminalNm} 주소와 연락처는?`,
          answer: `${terminalInfo?.address ? `주소: ${terminalInfo.address}` : '주소 정보는 현장에서 확인 가능합니다.'}${terminalInfo?.phone ? `, 전화번호: ${terminalInfo.phone}` : ''}`,
        },
        {
          question: `${terminal.terminalNm} 편의시설은 어떤 것이 있나요?`,
          answer: terminalInfo?.facilities && terminalInfo.facilities.length > 0
            ? `${terminal.terminalNm}에는 ${terminalInfo.facilities.join(', ')} 등의 편의시설이 있습니다.`
            : `${terminal.terminalNm}에는 매표소, 대합실 등 기본 편의시설이 갖추어져 있습니다.`,
        },
      ]} />

      {/* 브레드크럼 */}
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-blue-600">홈</Link>
        <span className="mx-2">›</span>
        <Link href="/terminal" className="hover:text-blue-600">터미널</Link>
        <span className="mx-2">›</span>
        <span className="text-gray-800">{terminal.terminalNm}</span>
      </nav>

      {/* 터미널 정보 헤더 */}
      <header className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-6 mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          {terminal.terminalNm}
        </h1>
        <p className="opacity-90">{terminal.cityName || '버스 터미널'}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {expressOnlyRoutes.length > 0 && (
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
              고속버스 {expressOnlyRoutes.length}개 노선
            </span>
          )}
          {intercityOnlyRoutes.length > 0 && (
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
              시외버스 {intercityOnlyRoutes.length}개 노선
            </span>
          )}
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

      {/* B5: 터미널 가이드 (교통 연결, 주차, 주변 정보) */}
      {terminalGuide && (
        <section className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold mb-5 text-gray-900 flex items-center gap-2">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 7m0 13V7"></path></svg>
            교통 연결 및 이용 가이드
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 대중교통 */}
            <div>
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"></path></svg>
                </span>
                대중교통 연결
              </h3>
              <ul className="space-y-3 text-sm text-gray-700">
                {terminalGuide.transport.subway && (
                  <li className="flex gap-3 items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">M</span>
                    <div><span className="font-medium text-gray-900">지하철</span> <span className="block text-gray-600 mt-0.5">{terminalGuide.transport.subway}</span></div>
                  </li>
                )}
                {terminalGuide.transport.bus && (
                  <li className="flex gap-3 items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">B</span>
                    <div><span className="font-medium text-gray-900">시내버스</span> <span className="block text-gray-600 mt-0.5">{terminalGuide.transport.bus}</span></div>
                  </li>
                )}
                {terminalGuide.transport.taxi && (
                  <li className="flex gap-3 items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-xs font-bold">T</span>
                    <div><span className="font-medium text-gray-900">택시</span> <span className="block text-gray-600 mt-0.5">{terminalGuide.transport.taxi}</span></div>
                  </li>
                )}
                {terminalGuide.transport.train && (
                  <li className="flex gap-3 items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">K</span>
                    <div><span className="font-medium text-gray-900">KTX/철도</span> <span className="block text-gray-600 mt-0.5">{terminalGuide.transport.train}</span></div>
                  </li>
                )}
              </ul>
            </div>

            {/* 주차 & 주변 */}
            <div className="space-y-5">
              {terminalGuide.parking && (
                <div>
                  <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                    <span className="w-8 h-8 bg-gray-100 text-gray-600 rounded-lg flex items-center justify-center text-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                    </span>
                    주차 정보
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-700">{terminalGuide.parking.info}</p>
                  </div>
                </div>
              )}
              {terminalGuide.nearby && (
                <div>
                  <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                    <span className="w-8 h-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center text-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    </span>
                    주변 시설
                  </h3>
                  <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-sm text-gray-700">{terminalGuide.nearby}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 이용 팁 */}
          {terminalGuide.tips && terminalGuide.tips.length > 0 && (
            <div className="mt-5 bg-blue-50 rounded-lg p-4">
              <h3 className="font-bold text-blue-800 mb-3 text-sm flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
                이용 팁
              </h3>
              <ul className="space-y-2">
                {terminalGuide.tips.map((tip, idx) => (
                  <li key={idx} className="text-sm text-blue-700 flex gap-2">
                    <span className="flex-shrink-0 w-5 h-5 bg-blue-200 text-blue-800 rounded-full flex items-center justify-center text-xs font-bold">{idx + 1}</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {/* 고속버스 노선 */}
      {expressOnlyRoutes.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center text-sm">🚌</span>
            고속버스 노선
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {expressOnlyRoutes.sort((a, b) => a.arrTerminalName.localeCompare(b.arrTerminalName)).map(route => {
              const minCharge = getValidMinCharge(route.schedules);
              const routeSlug = createRouteSlug(route.depTerminalName, route.arrTerminalName);

              return (
                <Link
                  key={route.arrTerminalId}
                  href={`/express/schedule/route/${routeSlug}`}
                  className="bg-white border rounded-lg p-4 hover:shadow-md hover:border-indigo-200 transition"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{route.arrTerminalName}</h3>
                    <span className="text-indigo-500">→</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>{route.schedules.length}회/일</span>
                    <span className="font-medium text-indigo-600">
                      {minCharge > 0 ? `${formatCharge(minCharge)}~` : '요금 미제공'}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* 시외버스 노선 */}
      {intercityOnlyRoutes.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-slate-100 text-slate-600 rounded-lg flex items-center justify-center text-sm">🚐</span>
            시외버스 노선
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {intercityOnlyRoutes.sort((a, b) => a.arrTerminalName.localeCompare(b.arrTerminalName)).map(route => {
              const minCharge = getValidMinCharge(route.schedules);
              const routeSlug = createRouteSlug(route.depTerminalName, route.arrTerminalName);

              return (
                <Link
                  key={route.arrTerminalId}
                  href={`/intercity/schedule/route/${routeSlug}`}
                  className="bg-white border rounded-lg p-4 hover:shadow-md hover:border-slate-200 transition"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{route.arrTerminalName}</h3>
                    <span className="text-slate-500">→</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>{route.schedules.length}회/일</span>
                    <span className="font-medium text-slate-600">
                      {minCharge > 0 ? `${formatCharge(minCharge)}~` : '요금 미제공'}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* 노선 없음 */}
      {expressOnlyRoutes.length === 0 && intercityOnlyRoutes.length === 0 && (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-500 mb-4">현재 수집된 노선 정보가 없습니다.</p>
          <p className="text-sm text-gray-400">정확한 시간과 요금은 예매 사이트에서 확인하세요.</p>
        </div>
      )}

      {/* 예매 안내 */}
      <section className="mt-8 bg-gray-100 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-900">예매 안내</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium mb-2 text-gray-800">온라인 예매</h3>
            <ul className="text-sm text-gray-700 space-y-2">
              <li>
                <a href="https://www.kobus.co.kr" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  고속버스통합예매 (KOBUS) →
                </a>
              </li>
              <li>
                <a href="https://www.bustago.or.kr" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  버스타고 (시외버스 예매) →
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
    </div>
  );
}
