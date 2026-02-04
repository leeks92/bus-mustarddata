import type { Metadata } from 'next';
import Link from 'next/link';
import { getExpressRoute, getExpressRoutes, formatCharge } from '@/lib/data';

interface Props {
  params: Promise<{
    departure: string;
    arrival: string;
  }>;
}

// 정적 페이지 생성
export async function generateStaticParams() {
  const routes = getExpressRoutes();
  return routes.map(route => ({
    departure: route.depTerminalId,
    arrival: route.arrTerminalId,
  }));
}

// 동적 메타데이터
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { departure, arrival } = await params;
  const route = getExpressRoute(departure, arrival);

  if (!route) {
    return {
      title: '노선을 찾을 수 없습니다',
    };
  }

  const depName = route.depTerminalName.replace('터미널', '').replace('종합버스', '');
  const arrName = route.arrTerminalName.replace('터미널', '').replace('종합버스', '');

  return {
    title: `${depName} → ${arrName} 고속버스 시간표 - 요금, 소요시간`,
    description: `${route.depTerminalName}에서 ${route.arrTerminalName} 가는 고속버스 시간표. ${route.schedules.length}회 운행, 요금 ${formatCharge(route.schedules[0]?.charge || 0)}부터.`,
    keywords: [
      `${depName} ${arrName} 버스`,
      `${depName} ${arrName} 고속버스`,
      `${route.depTerminalName} 시간표`,
      `${route.arrTerminalName} 시간표`,
    ],
  };
}

// 등급별 배지 색상
function getGradeBadge(grade: string) {
  if (grade.includes('프리미엄')) {
    return 'bg-purple-100 text-purple-800';
  }
  if (grade.includes('우등')) {
    return 'bg-blue-100 text-blue-800';
  }
  return 'bg-gray-100 text-gray-800';
}

export default async function RoutePage({ params }: Props) {
  const { departure, arrival } = await params;
  const route = getExpressRoute(departure, arrival);

  if (!route) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">노선을 찾을 수 없습니다</h1>
        <p className="text-gray-600 mb-6">
          요청하신 노선 정보가 존재하지 않습니다.
        </p>
        <Link href="/express" className="text-blue-600 hover:underline">
          고속버스 터미널 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  const schedules = route.schedules;
  const minCharge = Math.min(...schedules.map(s => s.charge));
  const maxCharge = Math.max(...schedules.map(s => s.charge));

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

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* 브레드크럼 */}
      <nav className="text-sm text-gray-600 mb-6">
        <Link href="/" className="hover:text-blue-600">
          홈
        </Link>
        <span className="mx-2">›</span>
        <Link href="/express" className="hover:text-blue-600">
          고속버스
        </Link>
        <span className="mx-2">›</span>
        <span className="text-gray-800">
          {route.depTerminalName} → {route.arrTerminalName}
        </span>
      </nav>

      {/* 노선 정보 헤더 */}
      <header className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-6 mb-8">
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
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
        <p className="text-sm text-yellow-800">
          💡 <strong>예매 안내:</strong> 정확한 좌석 확인과 예매는 공식 사이트를
          이용해 주세요.
        </p>
        <div className="flex gap-4 mt-3">
          <a
            href="https://www.kobus.co.kr"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline text-sm"
          >
            고속버스통합예매 (KOBUS) →
          </a>
        </div>
      </div>

      {/* 시간표 테이블 */}
      <section className="bg-white rounded-xl shadow overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
          <h2 className="text-lg font-bold text-gray-900">시간표</h2>
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
              <p className="text-2xl font-bold text-blue-600">
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
          href={`/express/${arrival}/${departure}`}
          className="text-blue-600 hover:underline"
        >
          {route.arrTerminalName} → {route.depTerminalName} 시간표 보기
        </Link>
      </section>

      {/* SEO 텍스트 */}
      <section className="mt-12 text-sm text-gray-600">
        <p>
          {route.depTerminalName}에서 {route.arrTerminalName}까지 고속버스는 하루{' '}
          {schedules.length}회 운행됩니다. 첫차는 {schedules[0]?.depTime}, 막차는{' '}
          {schedules[schedules.length - 1]?.depTime}입니다. 요금은{' '}
          {formatCharge(minCharge)}부터 시작하며, 등급에 따라 상이합니다.
        </p>
      </section>
    </div>
  );
}
