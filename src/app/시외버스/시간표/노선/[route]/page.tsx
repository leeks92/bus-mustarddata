import type { Metadata } from 'next';
import Link from 'next/link';
import { getIntercityRoute, getIntercityRoutes, getIntercityTerminals, formatCharge } from '@/lib/data';
import { BusTripJsonLd, BreadcrumbJsonLd, FAQJsonLd } from '@/components/JsonLd';
import {
  getIntercityTerminalIdBySlug,
  createTerminalSlug,
  createRouteSlug,
} from '@/lib/slugs';

const BASE_URL = 'https://bus.mustarddata.com';

interface Props {
  params: Promise<{
    route: string;
  }>;
}

// 노선 슬러그 파싱
function parseRouteSlugFromParam(slug: string): { depSlug: string; arrSlug: string } | null {
  const decodedSlug = decodeURIComponent(slug);
  
  // "터미널-" 패턴으로 분리 시도
  const terminalSplitIdx = decodedSlug.indexOf('터미널-');
  if (terminalSplitIdx !== -1) {
    return {
      depSlug: decodedSlug.substring(0, terminalSplitIdx + 3),
      arrSlug: decodedSlug.substring(terminalSplitIdx + 4),
    };
  }
  
  // 시외버스 터미널 목록에서 매칭
  const terminals = getIntercityTerminals();
  
  for (let i = 1; i < decodedSlug.length; i++) {
    if (decodedSlug[i] === '-') {
      const depPart = decodedSlug.substring(0, i);
      const arrPart = decodedSlug.substring(i + 1);
      
      const depTerminal = terminals.find(t => {
        const slug = createTerminalSlug(t.terminalNm);
        return slug === depPart + '터미널' || slug === depPart;
      });
      const arrTerminal = terminals.find(t => {
        const slug = createTerminalSlug(t.terminalNm);
        return slug === arrPart + '터미널' || slug === arrPart;
      });
      
      if (depTerminal && arrTerminal) {
        return {
          depSlug: createTerminalSlug(depTerminal.terminalNm),
          arrSlug: createTerminalSlug(arrTerminal.terminalNm),
        };
      }
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
  const minCharge = Math.min(...route.schedules.map(s => s.charge));
  const routeSlug = createRouteSlug(route.depTerminalName, route.arrTerminalName);

  return {
    title: `${depName} → ${arrName} 시외버스 시간표 - 요금, 소요시간`,
    description: `${route.depTerminalName}에서 ${route.arrTerminalName} 가는 시외버스 시간표. ${route.schedules.length}회 운행, 요금 ${formatCharge(minCharge)}부터.`,
    keywords: [
      `${depName} ${arrName} 버스`,
      `${depName} ${arrName} 시외버스`,
      `${route.depTerminalName} 시간표`,
      `${route.arrTerminalName} 시간표`,
    ],
    alternates: {
      canonical: `${BASE_URL}/시외버스/시간표/노선/${routeSlug}`,
    },
    openGraph: {
      title: `${depName} → ${arrName} 시외버스 시간표`,
      description: `${route.depTerminalName}에서 ${route.arrTerminalName} 가는 시외버스. ${route.schedules.length}회/일 운행, ${formatCharge(minCharge)}부터.`,
      url: `${BASE_URL}/시외버스/시간표/노선/${routeSlug}`,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: `${depName} → ${arrName} 시외버스 시간표`,
      description: `${route.schedules.length}회/일 운행, ${formatCharge(minCharge)}부터`,
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
        <Link href="/시외버스/시간표" className="text-slate-600 hover:underline">
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
        <Link href="/시외버스/시간표" className="text-slate-600 hover:underline">
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
        <Link href="/시외버스/시간표" className="text-slate-600 hover:underline">
          시외버스 터미널 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  const schedules = route.schedules;
  const minCharge = Math.min(...schedules.map(s => s.charge));
  const maxCharge = Math.max(...schedules.map(s => s.charge));
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
    { name: '시외버스 시간표', url: `${BASE_URL}/시외버스/시간표` },
    { name: route.depTerminalName, url: `${BASE_URL}/시외버스/시간표/${depTerminalSlug}` },
    { name: `${route.depTerminalName} → ${route.arrTerminalName}`, url: `${BASE_URL}/시외버스/시간표/노선/${routeSlug}` },
  ];

  // FAQ 데이터
  const faqItems = [
    {
      question: `${route.depTerminalName}에서 ${route.arrTerminalName}까지 버스 요금은 얼마인가요?`,
      answer: `${route.depTerminalName}에서 ${route.arrTerminalName}까지 시외버스 요금은 ${formatCharge(minCharge)}${minCharge !== maxCharge ? `부터 ${formatCharge(maxCharge)}` : ''}입니다.`,
    },
    {
      question: `${route.depTerminalName}에서 ${route.arrTerminalName}까지 첫차와 막차 시간은?`,
      answer: `첫차는 ${schedules[0]?.depTime || '-'}에 출발하고, 막차는 ${schedules[schedules.length - 1]?.depTime || '-'}에 출발합니다. 하루 총 ${schedules.length}회 운행됩니다.`,
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
        url={`${BASE_URL}/시외버스/시간표/노선/${routeSlug}`}
      />
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <FAQJsonLd items={faqItems} />

      {/* 브레드크럼 */}
      <nav className="text-sm text-gray-600 mb-6">
        <Link href="/" className="hover:text-slate-600">
          홈
        </Link>
        <span className="mx-2">›</span>
        <Link href="/시외버스/시간표" className="hover:text-slate-600">
          시외버스 시간표
        </Link>
        <span className="mx-2">›</span>
        <Link href={`/시외버스/시간표/${depTerminalSlug}`} className="hover:text-slate-600">
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
              {minCharge === maxCharge
                ? formatCharge(minCharge)
                : `${formatCharge(minCharge)} ~ ${formatCharge(maxCharge)}`}
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
                  <td className="font-medium">{schedule.depTime}</td>
                  <td>{schedule.arrTime}</td>
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

      {/* 반대 노선 링크 */}
      <section className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h2 className="font-bold mb-2">돌아오는 노선</h2>
        <Link
          href={`/시외버스/시간표/노선/${reverseRouteSlug}`}
          className="text-slate-600 hover:underline"
        >
          {route.arrTerminalName} → {route.depTerminalName} 시간표 보기
        </Link>
      </section>

      {/* SEO 텍스트 */}
      <section className="mt-12 text-sm text-gray-600">
        <p>
          {route.depTerminalName}에서 {route.arrTerminalName}까지 시외버스는 하루{' '}
          {schedules.length}회 운행됩니다. 첫차는 {schedules[0]?.depTime}, 막차는{' '}
          {schedules[schedules.length - 1]?.depTime}입니다. 요금은{' '}
          {formatCharge(minCharge)}부터 시작합니다.
        </p>
      </section>
    </div>
  );
}
