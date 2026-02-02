import Link from 'next/link';
import type { Metadata } from 'next';
import { getExpressTerminals, getExpressRoutes } from '@/lib/data';

export const metadata: Metadata = {
  title: '고속버스 시간표 - 전국 고속버스 터미널 운행정보',
  description:
    '전국 고속버스 터미널 시간표와 요금 정보. 서울, 부산, 대구, 대전, 광주 등 주요 도시 고속버스 운행 시간표를 확인하세요.',
};

// 터미널을 지역별로 그룹화
function groupTerminalsByRegion(
  terminals: { terminalId: string; terminalNm: string; cityName?: string }[]
) {
  const regions: Record<string, typeof terminals> = {};

  terminals.forEach(terminal => {
    // 터미널 이름에서 지역 추출 (간단한 방식)
    let region = '기타';
    const name = terminal.terminalNm;

    if (name.includes('서울') || terminal.cityName?.includes('서울')) {
      region = '서울';
    } else if (name.includes('부산') || terminal.cityName?.includes('부산')) {
      region = '부산';
    } else if (name.includes('대구') || terminal.cityName?.includes('대구')) {
      region = '대구';
    } else if (name.includes('대전') || terminal.cityName?.includes('대전')) {
      region = '대전';
    } else if (name.includes('광주') || terminal.cityName?.includes('광주')) {
      region = '광주';
    } else if (name.includes('울산') || terminal.cityName?.includes('울산')) {
      region = '울산';
    } else if (name.includes('인천') || terminal.cityName?.includes('인천')) {
      region = '인천';
    } else if (name.includes('세종') || terminal.cityName?.includes('세종')) {
      region = '세종';
    } else if (terminal.cityName?.includes('경기')) {
      region = '경기';
    } else if (terminal.cityName?.includes('강원')) {
      region = '강원';
    } else if (terminal.cityName?.includes('충북')) {
      region = '충북';
    } else if (terminal.cityName?.includes('충남')) {
      region = '충남';
    } else if (terminal.cityName?.includes('경북')) {
      region = '경북';
    } else if (terminal.cityName?.includes('경남')) {
      region = '경남';
    } else if (terminal.cityName?.includes('전북')) {
      region = '전북';
    } else if (terminal.cityName?.includes('전남')) {
      region = '전남';
    } else if (terminal.cityName?.includes('제주')) {
      region = '제주';
    }

    if (!regions[region]) {
      regions[region] = [];
    }
    regions[region].push(terminal);
  });

  return regions;
}

export default function ExpressPage() {
  const terminals = getExpressTerminals();
  const routes = getExpressRoutes();
  const groupedTerminals = groupTerminalsByRegion(terminals);

  // 지역 순서 정의
  const regionOrder = [
    '서울',
    '경기',
    '인천',
    '부산',
    '대구',
    '대전',
    '광주',
    '울산',
    '세종',
    '강원',
    '충북',
    '충남',
    '경북',
    '경남',
    '전북',
    '전남',
    '제주',
    '기타',
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">고속버스 시간표</h1>
        <p className="text-gray-600">
          전국 {terminals.length}개 고속버스 터미널, {routes.length}개 노선 운행
          정보
        </p>
      </div>

      {/* 터미널 목록 */}
      <div className="space-y-8">
        {regionOrder.map(region => {
          const regionTerminals = groupedTerminals[region];
          if (!regionTerminals || regionTerminals.length === 0) return null;

          return (
            <section key={region}>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  {region}
                </span>
                <span className="text-gray-400 text-sm font-normal">
                  {regionTerminals.length}개 터미널
                </span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {regionTerminals.map(terminal => {
                  // 해당 터미널에서 출발하는 노선 수
                  const routeCount = routes.filter(
                    r => r.depTerminalId === terminal.terminalId
                  ).length;

                  return (
                    <Link
                      key={terminal.terminalId}
                      href={`/terminal/${terminal.terminalId}`}
                      className="bg-white border rounded-lg p-4 hover:shadow-md transition"
                    >
                      <h3 className="font-medium mb-1">{terminal.terminalNm}</h3>
                      <p className="text-sm text-gray-500">
                        {routeCount > 0 ? `${routeCount}개 노선` : '노선 정보 없음'}
                      </p>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
