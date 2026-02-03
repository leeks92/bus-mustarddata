import type { Metadata } from 'next';
import Link from 'next/link';
import {
  getTerminal,
  getRoutesFromTerminal,
  getExpressTerminals,
  getIntercityTerminals,
  formatCharge,
} from '@/lib/data';

interface Props {
  params: Promise<{
    terminalId: string;
  }>;
}

// 정적 페이지 생성
export async function generateStaticParams() {
  const express = getExpressTerminals();
  const intercity = getIntercityTerminals();
  const all = [...express, ...intercity];
  const uniqueIds = [...new Set(all.map(t => t.terminalId))];

  return uniqueIds.map(id => ({
    terminalId: id,
  }));
}

// 동적 메타데이터
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { terminalId } = await params;
  const terminal = getTerminal(terminalId);

  if (!terminal) {
    return {
      title: '터미널을 찾을 수 없습니다',
    };
  }

  return {
    title: `${terminal.terminalNm} 시간표 - 버스 노선, 요금 안내`,
    description: `${terminal.terminalNm} 고속버스, 시외버스 시간표와 요금 정보. 출발 노선 및 운행 시간 조회.`,
  };
}

export default async function TerminalPage({ params }: Props) {
  const { terminalId } = await params;
  const terminal = getTerminal(terminalId);
  const routes = getRoutesFromTerminal(terminalId);

  if (!terminal) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">터미널을 찾을 수 없습니다</h1>
        <Link href="/express" className="text-blue-600 hover:underline">
          터미널 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  // 도착지별로 정렬
  const sortedRoutes = routes.sort((a, b) =>
    a.arrTerminalName.localeCompare(b.arrTerminalName)
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* 브레드크럼 */}
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-blue-600">
          홈
        </Link>
        <span className="mx-2">›</span>
        <Link href="/express" className="hover:text-blue-600">
          고속버스
        </Link>
        <span className="mx-2">›</span>
        <span className="text-gray-800">{terminal.terminalNm}</span>
      </nav>

      {/* 터미널 정보 헤더 */}
      <header className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-6 mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          {terminal.terminalNm}
        </h1>
        <p className="opacity-90">{terminal.cityName || '고속버스 터미널'}</p>
        <div className="mt-4">
          <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
            {routes.length}개 노선 운행
          </span>
        </div>
      </header>

      {/* 출발 노선 목록 */}
      <section>
        <h2 className="text-xl font-bold mb-4">출발 노선</h2>
        {routes.length === 0 ? (
          <p className="text-gray-500">운행 노선 정보가 없습니다.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedRoutes.map(route => {
              const minCharge = Math.min(...route.schedules.map(s => s.charge));

              return (
                <Link
                  key={route.arrTerminalId}
                  href={`/express/${terminalId}/${route.arrTerminalId}`}
                  className="bg-white border rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{route.arrTerminalName}</h3>
                    <span className="text-gray-400">→</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>{route.schedules.length}회/일</span>
                    <span className="font-medium text-blue-600">
                      {formatCharge(minCharge)}~
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* 터미널 안내 */}
      <section className="mt-12 bg-gray-100 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-900">터미널 안내</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium mb-2 text-gray-800">예매 안내</h3>
            <ul className="text-sm text-gray-700 space-y-2">
              <li>
                <a
                  href="https://www.kobus.co.kr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  고속버스통합예매 (KOBUS)
                </a>
              </li>
              <li>
                <a
                  href="https://txbus.t-money.co.kr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  시외버스 예매 (티머니)
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
