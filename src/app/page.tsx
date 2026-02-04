import Link from 'next/link';
import Image from 'next/image';
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 히어로 섹션 */}
      <section className="relative h-[400px] flex flex-col justify-center items-center text-white overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero-bg.png"
            alt="Bus Travel Background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        
        <div className="relative z-10 text-center px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg">
            전국 고속버스·시외버스 시간표
          </h1>
          <p className="text-lg md:text-xl text-white mb-8 drop-shadow-md max-w-2xl mx-auto">
            출발지와 도착지를 선택하여 가장 빠르고 정확한 버스 시간표와 요금을 확인하세요
          </p>
        </div>
      </section>

      {/* 검색 섹션 (오버랩 효과) */}
      <section className="relative -mt-20 z-20 px-4 mb-16">
        <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className="text-2xl">🔍</span> 시간표 검색
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="relative">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                출발지
              </label>
              <div className="relative">
                <select className="w-full appearance-none border border-gray-300 rounded-xl p-4 pr-10 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-50 hover:bg-white text-lg">
                  <option value="">터미널 선택</option>
                  {terminals.map(t => (
                    <option key={t.terminalId} value={t.terminalId}>
                      {t.terminalNm}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                도착지
              </label>
              <div className="relative">
                <select className="w-full appearance-none border border-gray-300 rounded-xl p-4 pr-10 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-50 hover:bg-white text-lg">
                  <option value="">터미널 선택</option>
                  {terminals.map(t => (
                    <option key={t.terminalId} value={t.terminalId}>
                      {t.terminalNm}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            <div className="flex items-end">
              <button className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0">
                시간표 조회하기
              </button>
            </div>
          </div>

          {/* 통계 */}
          <div className="mt-8 pt-6 border-t border-gray-100 flex flex-wrap justify-center gap-8 md:gap-16 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span>터미널 <strong className="text-gray-900 text-lg ml-1">{terminals.length}</strong>개</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <span>노선 <strong className="text-gray-900 text-lg ml-1">{routes.length.toLocaleString()}</strong>개</span>
            </div>
            {metadata && (
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                <span>업데이트 <span className="text-gray-700 ml-1">{new Date(metadata.lastUpdated).toLocaleDateString('ko-KR')}</span></span>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 pb-16">
        {/* 버스 유형별 링크 */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <Link
            href="/express"
            className="group relative overflow-hidden bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Image src="/images/icon-express.png" alt="Express Bus" width={120} height={120} />
            </div>
            <div className="p-8">
              <div className="inline-block p-3 rounded-lg bg-blue-50 text-blue-600 mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">고속버스 시간표</h3>
              <p className="text-gray-700 mb-4">전국 주요 도시를 연결하는 고속버스 운행정보를 확인하세요.</p>
              <div className="flex items-center text-blue-700 font-medium">
                바로가기 
                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
              </div>
            </div>
          </Link>

          <Link
            href="/intercity"
            className="group relative overflow-hidden bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Image src="/images/icon-intercity.png" alt="Intercity Bus" width={120} height={120} />
            </div>
            <div className="p-8">
              <div className="inline-block p-3 rounded-lg bg-green-50 text-green-600 mb-4 group-hover:bg-green-600 group-hover:text-white transition-colors">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 7m0 13V7"></path></svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">시외버스 시간표</h3>
              <p className="text-gray-700 mb-4">전국 방방곡곡을 연결하는 시외버스 운행정보를 확인하세요.</p>
              <div className="flex items-center text-green-700 font-medium">
                준비 중
                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
              </div>
            </div>
          </Link>
        </section>

        {/* 인기 노선 */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">🔥 실시간 인기 노선</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {popularRoutes.map((route, index) => {
              const depName = route.dep.split('(')[0].replace('터미널', '').trim();
              const arrName = route.arr.split('터미널')[0].replace('종합버스', '').trim();
              
              return (
                <Link
                  key={index}
                  href={`/express/${encodeURIComponent(route.dep)}/${encodeURIComponent(route.arr)}`}
                  className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg hover:border-blue-300 transition-all group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">고속</span>
                    <span className="text-gray-400 group-hover:text-blue-500 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-lg font-bold text-gray-800">
                    <span>{depName}</span>
                    <span className="text-gray-300 mx-2">|</span>
                    <span>{arrName}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* 지역별 터미널 */}
        <section className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">📍 지역별 터미널 찾기</h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {['서울', '경기', '인천', '부산', '대구', '대전', '광주', '울산', '강원', '충북', '충남', '경북', '경남', '전북', '전남', '제주'].map(
              region => (
                <Link
                  key={region}
                  href={`/terminal?region=${region}`}
                  className="bg-gray-50 hover:bg-blue-50 border border-gray-100 hover:border-blue-200 rounded-lg py-3 text-center text-gray-700 hover:text-blue-700 font-medium transition-all"
                >
                  {region}
                </Link>
              )
            )}
          </div>
        </section>

        {/* SEO 텍스트 */}
        <section className="mt-16 bg-gray-100 rounded-xl p-6 text-gray-700 text-sm leading-relaxed">
          <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            전국 버스 시간표 서비스 안내
          </h2>
          <div className="space-y-2">
            <p>
              본 서비스는 국토교통부의 공공데이터포털 API를 활용하여 전국 고속버스 및 시외버스의 실시간 운행정보, 시간표, 요금 정보를 제공합니다. 
              서울고속버스터미널(경부/영동/호남), 동서울터미널 등 전국 주요 터미널의 최신 정보를 쉽고 빠르게 검색할 수 있습니다.
            </p>
            <p>
              제공되는 정보는 운수사의 사정에 따라 변경될 수 있으며, 명절이나 공휴일에는 임시 차량이 배치될 수 있습니다. 
              정확한 예매 및 좌석 확인은 <span className="font-semibold text-gray-900">고속버스통합예매(KOBUS)</span>, <span className="font-semibold text-gray-900">티머니 시외버스</span>, <span className="font-semibold text-gray-900">버스타고</span> 등 공식 예매 사이트 및 앱을 이용해 주시기 바랍니다.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
