import Link from 'next/link';
import { getExpressTerminals, getExpressRoutes, getMetadata } from '@/lib/data';

// 인기 노선 (하드코딩 - 추후 트래픽 기반으로 변경 가능)
const popularRoutes = [
  { dep: '서울고속버스터미널(경부 영동선)', arr: '부산종합버스터미널' },
  { dep: '서울고속버스터미널(경부 영동선)', arr: '대구동대구터미널' },
  { dep: '서울고속버스터미널(경부 영동선)', arr: '대전복합터미널' },
  { dep: '동서울종합터미널', arr: '강릉고속버스터미널' },
  { dep: '서울고속버스터미널(경부 영동선)', arr: '강릉고속버스터미널' },
  { dep: '센트럴시티터미널(호남선)', arr: '광주종합버스터미널' },
  { dep: '센트럴시티터미널(호남선)', arr: '전주고속버스터미널' },
  { dep: '서울고속버스터미널(경부 영동선)', arr: '울산고속버스터미널' },
];

export default function HomePage() {
  const terminals = getExpressTerminals();
  const routes = getExpressRoutes();
  const metadata = getMetadata();

  // 터미널 이름으로 ID 찾기
  const findTerminalId = (name: string) => {
    const terminal = terminals.find(t => t.terminalNm.includes(name.split('(')[0]));
    return terminal?.terminalId || '';
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* 히어로 섹션 */}
      <section className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          전국 고속버스·시외버스 시간표
        </h1>
        <p className="text-gray-600 text-lg mb-6">
          출발지와 도착지를 선택하여 버스 시간표와 요금을 확인하세요
        </p>
        
        {/* 통계 */}
        <div className="flex justify-center gap-8 text-sm text-gray-500">
          <div>
            <span className="font-bold text-2xl text-blue-600">
              {terminals.length}
            </span>
            <span className="block">터미널</span>
          </div>
          <div>
            <span className="font-bold text-2xl text-blue-600">
              {routes.length.toLocaleString()}
            </span>
            <span className="block">노선</span>
          </div>
          {metadata && (
            <div>
              <span className="font-bold text-sm text-gray-400">
                {new Date(metadata.lastUpdated).toLocaleDateString('ko-KR')}
              </span>
              <span className="block">업데이트</span>
            </div>
          )}
        </div>
      </section>

      {/* 검색 섹션 */}
      <section className="bg-white rounded-xl shadow-lg p-6 mb-12">
        <h2 className="text-xl font-bold mb-4">🔍 시간표 검색</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              출발지
            </label>
            <select className="w-full border rounded-lg p-3">
              <option value="">터미널 선택</option>
              {terminals.map(t => (
                <option key={t.terminalId} value={t.terminalId}>
                  {t.terminalNm}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              도착지
            </label>
            <select className="w-full border rounded-lg p-3">
              <option value="">터미널 선택</option>
              {terminals.map(t => (
                <option key={t.terminalId} value={t.terminalId}>
                  {t.terminalNm}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition">
              검색
            </button>
          </div>
        </div>
      </section>

      {/* 인기 노선 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">🔥 인기 노선</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {popularRoutes.map((route, index) => {
            const depName = route.dep.split('(')[0].replace('터미널', '').trim();
            const arrName = route.arr.split('터미널')[0].replace('종합버스', '').trim();
            
            return (
              <Link
                key={index}
                href={`/express/${encodeURIComponent(route.dep)}/${encodeURIComponent(route.arr)}`}
                className="bg-white border rounded-lg p-4 hover:shadow-md transition"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{depName}</span>
                  <span className="text-gray-400">→</span>
                  <span className="font-medium">{arrName}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 버스 유형별 링크 */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <Link
          href="/express"
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-8 hover:shadow-lg transition"
        >
          <h3 className="text-2xl font-bold mb-2">🚌 고속버스</h3>
          <p className="opacity-90">전국 고속버스 터미널 시간표 조회</p>
          <p className="text-sm opacity-75 mt-2">
            {terminals.length}개 터미널 · {routes.length}개 노선
          </p>
        </Link>
        <Link
          href="/intercity"
          className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl p-8 hover:shadow-lg transition"
        >
          <h3 className="text-2xl font-bold mb-2">🚐 시외버스</h3>
          <p className="opacity-90">전국 시외버스 터미널 시간표 조회</p>
          <p className="text-sm opacity-75 mt-2">준비 중</p>
        </Link>
      </section>

      {/* 지역별 터미널 */}
      <section>
        <h2 className="text-2xl font-bold mb-6">📍 지역별 터미널</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {['서울', '경기', '인천', '부산', '대구', '대전', '광주', '울산', '강원', '충북', '충남', '경북'].map(
            region => (
              <Link
                key={region}
                href={`/terminal?region=${region}`}
                className="bg-gray-50 border rounded-lg p-4 text-center hover:bg-gray-100 transition"
              >
                <span className="font-medium">{region}</span>
              </Link>
            )
          )}
        </div>
      </section>

      {/* SEO 텍스트 */}
      <section className="mt-16 text-gray-600 text-sm">
        <h2 className="text-lg font-bold text-gray-800 mb-4">
          전국 버스 시간표 안내
        </h2>
        <p className="mb-4">
          본 사이트는 국토교통부 공공데이터를 활용하여 전국 고속버스 및 시외버스
          시간표 정보를 제공합니다. 서울고속버스터미널, 동서울터미널,
          센트럴시티터미널 등 주요 터미널의 시간표와 요금 정보를 한눈에 확인할 수
          있습니다.
        </p>
        <p className="mb-4">
          서울-부산, 서울-대구, 서울-강릉 등 인기 노선의 고속버스 시간표와 우등,
          프리미엄 등급별 요금 정보를 제공합니다. 정확한 예매와 좌석 확인은
          고속버스통합예매(KOBUS), 티머니 시외버스, 버스타고 등 공식 예매
          사이트를 이용해 주세요.
        </p>
      </section>
    </div>
  );
}
