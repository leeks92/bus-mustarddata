import type { Metadata } from 'next';
import Link from 'next/link';
import { getIntercityRoute, getIntercityRoutes, getIntercityTerminals, formatCharge, getValidMinCharge, getValidMaxCharge } from '@/lib/data';
import { BusTripJsonLd, BreadcrumbJsonLd, FAQJsonLd, TableJsonLd } from '@/components/JsonLd';
import {
  getIntercityTerminalIdBySlug,
  createTerminalSlug,
  createRouteSlug,
} from '@/lib/slugs';
import { getTerminalGuide } from '@/lib/terminal-guide';
import AdSense from '@/components/AdSense';

const BASE_URL = 'https://bus.mustarddata.com';

interface Props {
  params: Promise<{
    route: string;
  }>;
}

// 노선 슬러그 파싱 (romanized slug 형태)
function parseRouteSlugFromParam(slug: string): { depSlug: string; arrSlug: string } | null {
  const decodedSlug = decodeURIComponent(slug);
  
  // 터미널 슬러그 목록 빌드
  const terminals = getIntercityTerminals();
  const terminalSlugs = new Set<string>();
  for (const t of terminals) {
    terminalSlugs.add(createTerminalSlug(t.terminalNm));
  }
  
  // 모든 가능한 하이픈 분리점에서 양쪽이 유효한 터미널 슬러그인지 확인
  const parts = decodedSlug.split('-');
  for (let i = 1; i < parts.length; i++) {
    const depSlug = parts.slice(0, i).join('-');
    const arrSlug = parts.slice(i).join('-');
    
    if (terminalSlugs.has(depSlug) && terminalSlugs.has(arrSlug)) {
      return { depSlug, arrSlug };
    }
  }
  
  // ID suffix가 있는 경우도 시도 (중복 터미널)
  for (let i = 1; i < parts.length; i++) {
    const depSlug = parts.slice(0, i).join('-');
    const arrSlug = parts.slice(i).join('-');
    
    const depId = getIntercityTerminalIdBySlug(depSlug);
    const arrId = getIntercityTerminalIdBySlug(arrSlug);
    
    if (depId && arrId) {
      return { depSlug, arrSlug };
    }
  }
  
  return null;
}

// 정적 페이지 생성
export async function generateStaticParams() {
  const routes = getIntercityRoutes();
  const slugSet = new Set<string>();
  
  return routes
    .map(route => {
      const slug = createRouteSlug(route.depTerminalName, route.arrTerminalName);
      if (slugSet.has(slug)) return null;
      slugSet.add(slug);
      return { route: slug };
    })
    .filter((p): p is { route: string } => p !== null);
}

// 동적 메타데이터
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const routeParam = (await params).route;
  const parsed = parseRouteSlugFromParam(routeParam);
  
  if (!parsed) {
    return { title: '노선을 찾을 수 없습니다' };
  }
  
  const depTerminalId = getIntercityTerminalIdBySlug(parsed.depSlug);
  const arrTerminalId = getIntercityTerminalIdBySlug(parsed.arrSlug);
  
  if (!depTerminalId || !arrTerminalId) {
    return { title: '노선을 찾을 수 없습니다' };
  }
  
  const route = getIntercityRoute(depTerminalId, arrTerminalId);

  if (!route) {
    return { title: '노선을 찾을 수 없습니다' };
  }

  const depName = route.depTerminalName.replace('터미널', '').replace('종합버스', '');
  const arrName = route.arrTerminalName.replace('터미널', '').replace('종합버스', '');
  const metaMinCharge = getValidMinCharge(route.schedules);
  const routeSlug = createRouteSlug(route.depTerminalName, route.arrTerminalName);
  const chargeText = metaMinCharge > 0 ? `, 요금 ${formatCharge(metaMinCharge)}부터` : '';

  return {
    title: `${depName} → ${arrName} 시외버스 시간표 - 요금, 소요시간`,
    description: `${route.depTerminalName}에서 ${route.arrTerminalName} 가는 시외버스 시간표. ${route.schedules.length}회 운행${chargeText}.`,
    keywords: [
      `${depName} ${arrName} 버스`,
      `${depName} ${arrName} 시외버스`,
      `${route.depTerminalName} 시간표`,
      `${route.arrTerminalName} 시간표`,
    ],
    alternates: {
      canonical: `${BASE_URL}/intercity/schedule/route/${routeSlug}`,
    },
    openGraph: {
      title: `${depName} → ${arrName} 시외버스 시간표`,
      description: `${route.depTerminalName}에서 ${route.arrTerminalName} 가는 시외버스. ${route.schedules.length}회/일 운행${chargeText}.`,
      url: `${BASE_URL}/intercity/schedule/route/${routeSlug}`,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: `${depName} → ${arrName} 시외버스 시간표`,
      description: `${route.schedules.length}회/일 운행${chargeText}`,
    },
  };
}

// 등급별 배지 색상
function getGradeBadge(grade: string) {
  if (grade.includes('프리미엄')) {
    return 'bg-purple-100 text-purple-800';
  }
  if (grade.includes('우등')) {
    return 'bg-slate-100 text-slate-800';
  }
  return 'bg-gray-100 text-gray-800';
}

export default async function IntercityRoutePage({ params }: Props) {
  const routeParam = (await params).route;
  const parsed = parseRouteSlugFromParam(routeParam);
  
  if (!parsed) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">노선을 찾을 수 없습니다</h1>
        <p className="text-gray-600 mb-6">요청하신 노선 정보가 존재하지 않습니다.</p>
        <Link href="/intercity/schedule" className="text-slate-600 hover:underline">
          시외버스 터미널 목록으로 돌아가기
        </Link>
      </div>
    );
  }
  
  const depTerminalId = getIntercityTerminalIdBySlug(parsed.depSlug);
  const arrTerminalId = getIntercityTerminalIdBySlug(parsed.arrSlug);
  
  if (!depTerminalId || !arrTerminalId) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">노선을 찾을 수 없습니다</h1>
        <p className="text-gray-600 mb-6">요청하신 노선 정보가 존재하지 않습니다.</p>
        <Link href="/intercity/schedule" className="text-slate-600 hover:underline">
          시외버스 터미널 목록으로 돌아가기
        </Link>
      </div>
    );
  }
  
  const route = getIntercityRoute(depTerminalId, arrTerminalId);

  if (!route) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">노선을 찾을 수 없습니다</h1>
        <p className="text-gray-600 mb-6">요청하신 노선 정보가 존재하지 않습니다.</p>
        <Link href="/intercity/schedule" className="text-slate-600 hover:underline">
          시외버스 터미널 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  const schedules = route.schedules;
  const minCharge = getValidMinCharge(schedules);
  const maxCharge = getValidMaxCharge(schedules);
  const routeSlug = createRouteSlug(route.depTerminalName, route.arrTerminalName);
  const reverseRouteSlug = createRouteSlug(route.arrTerminalName, route.depTerminalName);
  const depTerminalSlug = createTerminalSlug(route.depTerminalName);

  // 등급별 그룹화
  const gradeGroups = schedules.reduce(
    (acc, s) => {
      const grade = s.grade || '일반';
      if (!acc[grade]) acc[grade] = [];
      acc[grade].push(s);
      return acc;
    },
    {} as Record<string, typeof schedules>
  );

  // 브레드크럼 데이터
  const breadcrumbItems = [
    { name: '홈', url: BASE_URL },
    { name: '시외버스 시간표', url: `${BASE_URL}/intercity/schedule` },
    { name: route.depTerminalName, url: `${BASE_URL}/intercity/schedule/${depTerminalSlug}` },
    { name: `${route.depTerminalName} → ${route.arrTerminalName}`, url: `${BASE_URL}/intercity/schedule/route/${routeSlug}` },
  ];

  // 소요시간 계산 (첫 번째 스케줄 기준)
  const firstSchedule = schedules[0];
  const estimatedDuration = (() => {
    if (!firstSchedule?.depTime || !firstSchedule?.arrTime) return null;
    const [depH, depM] = firstSchedule.depTime.split(':').map(Number);
    const [arrH, arrM] = firstSchedule.arrTime.split(':').map(Number);
    let diff = (arrH * 60 + arrM) - (depH * 60 + depM);
    if (diff < 0) diff += 24 * 60;
    const hours = Math.floor(diff / 60);
    const mins = diff % 60;
    return hours > 0 ? `약 ${hours}시간 ${mins > 0 ? `${mins}분` : ''}` : `약 ${mins}분`;
  })();

  // 등급 목록
  const gradeList = [...new Set(schedules.map(s => s.grade || '일반'))].join(', ');

  // FAQ 데이터 (확장된 5-6개)
  const faqItems = [
    {
      question: `${route.depTerminalName}에서 ${route.arrTerminalName}까지 시외버스 요금은 얼마인가요?`,
      answer: `${route.depTerminalName}에서 ${route.arrTerminalName}까지 시외버스 요금은 ${formatCharge(minCharge)}${minCharge !== maxCharge ? `부터 ${formatCharge(maxCharge)}` : ''}입니다. 등급(${gradeList})에 따라 요금이 다릅니다.`,
    },
    {
      question: `${route.depTerminalName}에서 ${route.arrTerminalName}까지 첫차와 막차 시간은?`,
      answer: `첫차는 ${schedules[0]?.depTime || '-'}에 출발하고, 막차는 ${schedules[schedules.length - 1]?.depTime || '-'}에 출발합니다. 하루 총 ${schedules.length}회 운행됩니다.`,
    },
    {
      question: `${route.depTerminalName}에서 ${route.arrTerminalName}까지 소요시간은 얼마나 걸리나요?`,
      answer: `${route.depTerminalName}에서 ${route.arrTerminalName}까지 시외버스 소요시간은 ${estimatedDuration || '노선에 따라 상이합니다'}입니다. 도로 상황에 따라 달라질 수 있습니다.`,
    },
    {
      question: `${route.depTerminalName} ${route.arrTerminalName} 시외버스 하루 몇 회 운행하나요?`,
      answer: `${route.depTerminalName}에서 ${route.arrTerminalName}까지 하루 총 ${schedules.length}회 운행됩니다. 성수기에는 임시 배차가 추가될 수 있습니다.`,
    },
    {
      question: `${route.depTerminalName} ${route.arrTerminalName} 시외버스 예매는 어디서 하나요?`,
      answer: `버스타고(bustago.or.kr) 또는 티머니 시외버스(txbus.t-money.co.kr)에서 온라인 예매가 가능합니다. 앱으로도 예매 가능하며, 터미널 현장에서도 발권 가능합니다.`,
    },
    {
      question: `${route.depTerminalName} ${route.arrTerminalName} 시외버스 어린이·청소년 할인이 되나요?`,
      answer: `만 13세 미만 어린이는 약 50% 할인, 만 13세~18세 청소년은 약 20% 할인이 적용됩니다. 예매 시 생년월일 입력 또는 현장에서 신분증 제시가 필요합니다.`,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* JSON-LD 구조화 데이터 */}
      <BusTripJsonLd
        departureStation={route.depTerminalName}
        arrivalStation={route.arrTerminalName}
        departureTime={schedules[0]?.depTime}
        price={minCharge}
        url={`${BASE_URL}/intercity/schedule/route/${routeSlug}`}
      />
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <FAQJsonLd items={faqItems} />
      <TableJsonLd
        name={`${route.depTerminalName} → ${route.arrTerminalName} 시외버스 시간표`}
        description={`${route.depTerminalName}에서 ${route.arrTerminalName}까지 시외버스 시간표. ${schedules.length}회 운행, ${formatCharge(minCharge)}부터.`}
        columns={['출발시간', '도착시간', '등급', '요금']}
        rows={schedules.slice(0, 10).map(s => [s.depTime, s.arrTime, s.grade, formatCharge(s.charge)])}
      />

      {/* 브레드크럼 */}
      <nav className="text-sm text-gray-600 mb-6">
        <Link href="/" className="hover:text-slate-600">
          홈
        </Link>
        <span className="mx-2">›</span>
        <Link href="/intercity/schedule" className="hover:text-slate-600">
          시외버스 시간표
        </Link>
        <span className="mx-2">›</span>
        <Link href={`/intercity/schedule/${depTerminalSlug}`} className="hover:text-slate-600">
          {route.depTerminalName}
        </Link>
        <span className="mx-2">›</span>
        <span className="text-gray-800">
          {route.arrTerminalName}
        </span>
      </nav>

      {/* 노선 정보 헤더 */}
      <header className="bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-xl p-6 mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-white/20 px-2 py-1 rounded text-sm">시외버스</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mb-4">
          {route.depTerminalName}
          <span className="mx-4 opacity-75">→</span>
          {route.arrTerminalName}
        </h1>
        <div className="flex flex-wrap gap-6 text-sm">
          <div>
            <span className="opacity-75">운행 횟수</span>
            <p className="text-xl font-bold">{schedules.length}회/일</p>
          </div>
          <div>
            <span className="opacity-75">첫차</span>
            <p className="text-xl font-bold">{schedules[0]?.depTime || '-'}</p>
          </div>
          <div>
            <span className="opacity-75">막차</span>
            <p className="text-xl font-bold">
              {schedules[schedules.length - 1]?.depTime || '-'}
            </p>
          </div>
          <div>
            <span className="opacity-75">요금</span>
            <p className="text-xl font-bold">
              {minCharge > 0
                ? (minCharge === maxCharge
                    ? formatCharge(minCharge)
                    : `${formatCharge(minCharge)} ~ ${formatCharge(maxCharge)}`)
                : '요금 미제공'}
            </p>
          </div>
        </div>
      </header>

      {/* 예매 링크 */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-8">
        <p className="text-sm text-slate-800">
          💡 <strong>예매 안내:</strong> 정확한 좌석 확인과 예매는 공식 사이트를
          이용해 주세요.
        </p>
        <div className="flex gap-4 mt-3">
          <a
            href="https://www.bustago.or.kr"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-600 hover:underline text-sm"
          >
            버스타고 (시외버스 예매) →
          </a>
        </div>
      </div>

      {/* 시간표 테이블 */}
      <section className="bg-white rounded-xl shadow overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
          <h2 className="text-lg font-bold text-gray-900">{route.depTerminalName} → {route.arrTerminalName} 시간표</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="schedule-table">
            <thead>
              <tr>
                <th className="w-24">출발</th>
                <th className="w-24">도착</th>
                <th className="w-28">등급</th>
                <th className="w-32 text-right">요금 (어른)</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((schedule, index) => (
                <tr key={index}>
                  <td className="font-medium">
                    <time dateTime={`T${schedule.depTime}:00`}>{schedule.depTime}</time>
                  </td>
                  <td>
                    <time dateTime={`T${schedule.arrTime}:00`}>{schedule.arrTime}</time>
                  </td>
                  <td>
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-medium ${getGradeBadge(schedule.grade)}`}
                    >
                      {schedule.grade}
                    </span>
                  </td>
                  <td className="text-right font-medium">
                    {formatCharge(schedule.charge)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 광고 */}
      <AdSense slot="" format="auto" className="mt-8" />

      {/* 등급별 요약 */}
      <section className="mt-8">
        <h2 className="text-xl font-bold mb-4">등급별 요금 안내</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(gradeGroups).map(([grade, items]) => (
            <div key={grade} className="bg-white border rounded-lg p-4">
              <h3 className="font-bold mb-2">{grade}</h3>
              <p className="text-2xl font-bold text-slate-600">
                {formatCharge(items[0].charge)}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {items.length}회 운행
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* B2: 시간대별 추천 가이드 */}
      <TimeGuideSection schedules={schedules} depName={route.depTerminalName} arrName={route.arrTerminalName} />

      {/* B1: 출발 터미널 꿀팁 */}
      <TerminalTipsSection terminalName={route.depTerminalName} label="출발" />

      {/* B4: 명절/성수기 안내 */}
      <SeasonalNotice depName={route.depTerminalName} arrName={route.arrTerminalName} />

      {/* 반대 노선 링크 */}
      <section className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h2 className="font-bold mb-2">돌아오는 노선</h2>
        <Link
          href={`/intercity/schedule/route/${reverseRouteSlug}`}
          className="text-slate-600 hover:underline"
        >
          {route.arrTerminalName} → {route.depTerminalName} 시간표 보기
        </Link>
      </section>

      {/* 관련 노선 추천 (내부 링크 강화) */}
      <RelatedRoutes
        currentDepTerminal={route.depTerminalName}
        currentArrTerminal={route.arrTerminalName}
      />

      {/* 광고 */}
      <AdSense slot="" format="auto" className="mt-8" />

      {/* SEO 텍스트 강화 */}
      <section className="mt-12 bg-gray-100 rounded-lg p-6 text-sm text-gray-700 leading-relaxed">
        <h2 className="font-bold text-gray-900 mb-3">{route.depTerminalName} → {route.arrTerminalName} 시외버스 안내</h2>
        <div className="space-y-2">
          <p>
            {route.depTerminalName}에서 {route.arrTerminalName}까지 시외버스는 하루 총 <strong>{schedules.length}회</strong> 운행됩니다. 
            첫차는 <strong>{schedules[0]?.depTime}</strong>에 출발하고, 막차는 <strong>{schedules[schedules.length - 1]?.depTime}</strong>에 출발합니다.
          </p>
          <p>
            요금은 버스 등급에 따라 <strong>{formatCharge(minCharge)}</strong>부터 <strong>{formatCharge(maxCharge)}</strong>까지 다양합니다.
          </p>
          <p>
            예매는 <a href="https://www.bustago.or.kr" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">버스타고</a> 또는 
            <a href="https://txbus.t-money.co.kr" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">티머니 시외버스</a>에서 
            온라인으로 가능합니다.
          </p>
        </div>
      </section>
    </div>
  );
}

// 관련 노선 추천 컴포넌트
function RelatedRoutes({ currentDepTerminal, currentArrTerminal }: { currentDepTerminal: string; currentArrTerminal: string }) {
  const allRoutes = getIntercityRoutes();
  
  // 같은 출발지에서 다른 도착지로 가는 인기 노선
  const sameDepRoutes = allRoutes
    .filter(r => r.depTerminalName === currentDepTerminal && r.arrTerminalName !== currentArrTerminal)
    .slice(0, 4);
  
  // 같은 도착지로 가는 다른 출발지 노선
  const sameArrRoutes = allRoutes
    .filter(r => r.arrTerminalName === currentArrTerminal && r.depTerminalName !== currentDepTerminal)
    .slice(0, 4);

  if (sameDepRoutes.length === 0 && sameArrRoutes.length === 0) return null;

  return (
    <section className="mt-8">
      <h2 className="text-xl font-bold mb-4">🔗 관련 노선</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sameDepRoutes.length > 0 && (
          <div>
            <h3 className="font-medium text-gray-700 mb-3">{currentDepTerminal.replace('터미널', '').replace('종합버스', '')}에서 출발하는 다른 노선</h3>
            <div className="space-y-2">
              {sameDepRoutes.map((r, idx) => (
                <Link
                  key={idx}
                  href={`/intercity/schedule/route/${createRouteSlug(r.depTerminalName, r.arrTerminalName)}`}
                  className="block bg-white border border-gray-200 rounded-lg p-3 hover:border-slate-300 hover:shadow-sm transition"
                >
                  <span className="font-medium text-gray-900">→ {r.arrTerminalName.replace('터미널', '').replace('종합버스', '')}</span>
                  <span className="text-sm text-gray-500 ml-2">{r.schedules.length}회/일</span>
                </Link>
              ))}
            </div>
          </div>
        )}
        {sameArrRoutes.length > 0 && (
          <div>
            <h3 className="font-medium text-gray-700 mb-3">{currentArrTerminal.replace('터미널', '').replace('종합버스', '')}으로 가는 다른 노선</h3>
            <div className="space-y-2">
              {sameArrRoutes.map((r, idx) => (
                <Link
                  key={idx}
                  href={`/intercity/schedule/route/${createRouteSlug(r.depTerminalName, r.arrTerminalName)}`}
                  className="block bg-white border border-gray-200 rounded-lg p-3 hover:border-slate-300 hover:shadow-sm transition"
                >
                  <span className="font-medium text-gray-900">{r.depTerminalName.replace('터미널', '').replace('종합버스', '')} →</span>
                  <span className="text-sm text-gray-500 ml-2">{r.schedules.length}회/일</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// B2: 시간대별 추천 가이드 컴포넌트
function TimeGuideSection({ schedules, depName, arrName }: { schedules: { depTime: string; arrTime: string; grade: string; charge: number }[]; depName: string; arrName: string }) {
  if (schedules.length < 3) return null;

  const morningSchedules = schedules.filter(s => {
    const hour = parseInt(s.depTime.split(':')[0]);
    return hour >= 5 && hour < 10;
  });
  const afternoonSchedules = schedules.filter(s => {
    const hour = parseInt(s.depTime.split(':')[0]);
    return hour >= 10 && hour < 17;
  });
  const eveningSchedules = schedules.filter(s => {
    const hour = parseInt(s.depTime.split(':')[0]);
    return hour >= 17 || hour < 5;
  });

  return (
    <section className="mt-8 bg-white border border-gray-200 rounded-xl p-6">
      <h2 className="text-xl font-bold mb-4 text-gray-900">
        <span className="mr-2">&#x1F551;</span> 시간대별 운행 가이드
      </h2>
      <p className="text-sm text-gray-600 mb-4">{depName} → {arrName} 노선의 시간대별 운행 현황입니다.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
          <h3 className="font-bold text-orange-800 mb-1">오전 (05:00~10:00)</h3>
          <p className="text-2xl font-bold text-orange-600">{morningSchedules.length}회</p>
          {morningSchedules.length > 0 && (
            <p className="text-xs text-orange-700 mt-2">
              첫차 <strong>{morningSchedules[0].depTime}</strong>
              {morningSchedules.length > 1 && <> · 마지막 {morningSchedules[morningSchedules.length - 1].depTime}</>}
            </p>
          )}
          <p className="text-xs text-gray-500 mt-1">이른 아침 출발에 적합</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <h3 className="font-bold text-blue-800 mb-1">낮 (10:00~17:00)</h3>
          <p className="text-2xl font-bold text-blue-600">{afternoonSchedules.length}회</p>
          {afternoonSchedules.length > 0 && (
            <p className="text-xs text-blue-700 mt-2">
              {afternoonSchedules[0].depTime} ~ {afternoonSchedules[afternoonSchedules.length - 1].depTime}
            </p>
          )}
          <p className="text-xs text-gray-500 mt-1">여유로운 이동에 적합</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
          <h3 className="font-bold text-purple-800 mb-1">저녁/심야 (17:00~)</h3>
          <p className="text-2xl font-bold text-purple-600">{eveningSchedules.length}회</p>
          {eveningSchedules.length > 0 && (
            <p className="text-xs text-purple-700 mt-2">
              {eveningSchedules[0].depTime} ~ 막차 {eveningSchedules[eveningSchedules.length - 1].depTime}
            </p>
          )}
          <p className="text-xs text-gray-500 mt-1">퇴근 후 이동에 적합</p>
        </div>
      </div>
    </section>
  );
}

// B1: 출발 터미널 꿀팁 컴포넌트
function TerminalTipsSection({ terminalName, label }: { terminalName: string; label: string }) {
  const guide = getTerminalGuide(terminalName);
  if (!guide) return null;

  return (
    <section className="mt-8 bg-white border border-gray-200 rounded-xl p-6">
      <h2 className="text-xl font-bold mb-4 text-gray-900">
        <span className="mr-2">&#x1F4CD;</span> {terminalName} {label} 꿀팁
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span className="w-7 h-7 bg-blue-100 text-blue-600 rounded flex items-center justify-center text-sm">&#x1F687;</span>
            대중교통 연결
          </h3>
          <ul className="space-y-2 text-sm text-gray-700">
            {guide.transport.subway && <li className="flex gap-2"><span className="text-blue-500 font-bold">&#x2022;</span> {guide.transport.subway}</li>}
            {guide.transport.bus && <li className="flex gap-2"><span className="text-green-500 font-bold">&#x2022;</span> {guide.transport.bus}</li>}
            {guide.transport.taxi && <li className="flex gap-2"><span className="text-yellow-600 font-bold">&#x2022;</span> {guide.transport.taxi}</li>}
            {guide.transport.train && <li className="flex gap-2"><span className="text-red-500 font-bold">&#x2022;</span> {guide.transport.train}</li>}
          </ul>
        </div>
        <div>
          {guide.parking && (
            <div className="mb-4">
              <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                <span className="w-7 h-7 bg-gray-100 text-gray-600 rounded flex items-center justify-center text-sm">&#x1F17F;</span>
                주차 정보
              </h3>
              <p className="text-sm text-gray-700">{guide.parking.info}</p>
            </div>
          )}
          {guide.nearby && (
            <div>
              <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                <span className="w-7 h-7 bg-green-100 text-green-600 rounded flex items-center justify-center text-sm">&#x1F3EA;</span>
                주변 정보
              </h3>
              <p className="text-sm text-gray-700">{guide.nearby}</p>
            </div>
          )}
        </div>
      </div>
      {guide.tips && guide.tips.length > 0 && (
        <div className="mt-4 bg-slate-50 rounded-lg p-4">
          <h3 className="font-bold text-slate-800 mb-2 text-sm">이용 팁</h3>
          <ul className="space-y-1">
            {guide.tips.map((tip, idx) => (
              <li key={idx} className="text-sm text-slate-700 flex gap-2">
                <span className="flex-shrink-0">&#x1F4A1;</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

// B4: 명절/성수기 안내 컴포넌트
function SeasonalNotice({ depName, arrName }: { depName: string; arrName: string }) {
  return (
    <section className="mt-8 bg-amber-50 border border-amber-200 rounded-xl p-6">
      <h2 className="text-lg font-bold mb-3 text-amber-900 flex items-center gap-2">
        <span>&#x1F4C5;</span> 명절·성수기 이용 안내
      </h2>
      <div className="space-y-3 text-sm text-amber-800">
        <div className="flex gap-3">
          <span className="flex-shrink-0 w-6 h-6 bg-amber-200 text-amber-800 rounded-full flex items-center justify-center text-xs font-bold">1</span>
          <p><strong>설날·추석 연휴:</strong> {depName} → {arrName} 노선은 명절 연휴 기간에 좌석이 빠르게 매진됩니다. 버스타고(bustago.or.kr)에서 사전 예매를 하는 것이 좋습니다.</p>
        </div>
        <div className="flex gap-3">
          <span className="flex-shrink-0 w-6 h-6 bg-amber-200 text-amber-800 rounded-full flex items-center justify-center text-xs font-bold">2</span>
          <p><strong>임시 배차:</strong> 명절 연휴, 여름 휴가철(7~8월)에는 임시 배차가 추가될 수 있습니다. 정확한 시간표는 출발일 기준 예매 사이트에서 확인하세요.</p>
        </div>
        <div className="flex gap-3">
          <span className="flex-shrink-0 w-6 h-6 bg-amber-200 text-amber-800 rounded-full flex items-center justify-center text-xs font-bold">3</span>
          <p><strong>혼잡 시간대:</strong> 금요일 오후~저녁, 일요일 오후가 가장 혼잡합니다. 가능하면 평일 또는 오전 시간대를 이용하면 여유롭게 탑승할 수 있습니다.</p>
        </div>
      </div>
    </section>
  );
}
