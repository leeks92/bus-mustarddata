import Link from 'next/link';
import Image from 'next/image';
import { getExpressTerminals, getIntercityTerminals, getExpressRoutes, getIntercityRoutes, getMetadata, getActiveTerminalCount, getAirportBuses } from '@/lib/data';
import { WebSiteJsonLd, OrganizationJsonLd, FAQJsonLd, ItemListJsonLd, HowToJsonLd, ServiceJsonLd } from '@/components/JsonLd';
import SearchForm from '@/components/SearchForm';
import { createRouteSlug, createTerminalSlug } from '@/lib/slugs';
import AdSense from '@/components/AdSense';

// 인기 노선 (실제 데이터 터미널 이름 기준)
const popularRoutes = [
  { dep: '서울경부', arr: '부산', depShort: '서울', arrShort: '부산' },
  { dep: '서울경부', arr: '동대구', depShort: '서울', arrShort: '대구' },
  { dep: '서울경부', arr: '대전복합', depShort: '서울', arrShort: '대전' },
  { dep: '동서울', arr: '강릉', depShort: '동서울', arrShort: '강릉' },
  { dep: '서울경부', arr: '강릉', depShort: '서울', arrShort: '강릉' },
  { dep: '서울호남', arr: '광주', depShort: '서울', arrShort: '광주' },
  { dep: '서울호남', arr: '전주', depShort: '서울', arrShort: '전주' },
  { dep: '서울경부', arr: '울산', depShort: '서울', arrShort: '울산' },
];

// 주요 터미널 목록 (SEO용 - 실제 데이터 터미널 이름 기준)
const majorTerminals = [
  '서울경부',
  '동서울',
  '센트럴시티(서울)',
  '부산',
  '동대구',
  '대전복합',
  '광주(유·스퀘어)',
  '강릉',
];

const BASE_URL = 'https://bus.mustarddata.com';

const faqItems = [
  {
    question: '고속버스와 시외버스의 차이점은 무엇인가요?',
    answer: '고속버스는 고속도로를 이용하여 주요 도시 간을 빠르게 연결하며, 시외버스는 일반 국도를 이용하여 중소도시와 읍면 지역까지 연결합니다. 고속버스가 더 빠르지만 시외버스는 더 많은 지역을 커버합니다.',
  },
  {
    question: '버스 예매는 어디서 할 수 있나요?',
    answer: '고속버스는 고속버스통합예매(KOBUS, www.kobus.co.kr), 시외버스는 버스타고(bustago.or.kr) 또는 티머니 시외버스(txbus.t-money.co.kr)에서 예매할 수 있습니다. 터미널 현장에서도 예매 가능합니다.',
  },
  {
    question: '버스 시간표는 얼마나 자주 업데이트되나요?',
    answer: '본 서비스의 시간표는 매주 업데이트됩니다. 명절이나 공휴일에는 임시 배차가 있을 수 있으므로 공식 예매 사이트에서 최종 확인을 권장합니다.',
  },
  {
    question: '고속버스 요금은 어떻게 되나요?',
    answer: '고속버스 요금은 노선과 버스 등급(일반, 우등, 프리미엄)에 따라 다릅니다. 예를 들어 서울-부산 구간은 일반 약 23,000원, 우등 약 34,000원, 프리미엄 약 40,000원입니다.',
  },
  {
    question: '버스 예매 취소는 어떻게 하나요?',
    answer: '예매한 사이트(KOBUS, 버스타고 등)에서 취소할 수 있습니다. 출발 1시간 전까지 무료 취소가 가능하며, 이후에는 수수료가 부과될 수 있습니다.',
  },
  {
    question: '어린이/청소년 할인은 어떻게 받나요?',
    answer: '만 13세 미만 어린이는 약 50% 할인, 만 13세~18세 청소년은 약 20% 할인이 적용됩니다. 예매 시 생년월일 입력 또는 현장에서 신분증 제시가 필요합니다.',
  },
];

// HowTo 스텝 (버스 이용 방법)
const howToSteps = [
  {
    name: '시간표 검색',
    text: '출발지와 도착지 터미널을 선택하여 버스 시간표를 검색합니다. 원하는 날짜의 운행 시간과 요금을 확인할 수 있습니다.',
  },
  {
    name: '버스 예매',
    text: '고속버스는 KOBUS(www.kobus.co.kr), 시외버스는 버스타고(bustago.or.kr)에서 온라인 예매합니다. 앱으로도 예매 가능합니다.',
  },
  {
    name: '터미널 방문',
    text: '출발 30분 전까지 터미널에 도착하여 발권기에서 티켓을 출력하거나 모바일 티켓을 준비합니다.',
  },
  {
    name: '버스 탑승',
    text: '해당 승강장에서 버스에 탑승합니다. 신분증을 지참하고, 좌석 번호를 확인 후 착석합니다.',
  },
];

export default function HomePage() {
  const expressTerminals = getExpressTerminals();
  const intercityTerminals = getIntercityTerminals();
  const expressRoutes = getExpressRoutes();
  const intercityRoutes = getIntercityRoutes();
  const metadata = getMetadata();
  const activeTerminals = getActiveTerminalCount();
  const airportBuses = getAirportBuses();
  const totalRoutes = expressRoutes.length + intercityRoutes.length;

  // ItemList용 인기 노선 데이터
  const popularRouteItems = popularRoutes.map((route, index) => ({
    name: `${route.depShort} → ${route.arrShort} 고속버스`,
    url: `${BASE_URL}/express/schedule/route/${createRouteSlug(route.dep, route.arr)}`,
    description: `${route.depShort}에서 ${route.arrShort}까지 고속버스 시간표`,
    position: index + 1,
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* JSON-LD 구조화 데이터 - SEO 최적화 */}
      <WebSiteJsonLd
        name="전국 고속버스·시외버스 시간표 조회"
        url={BASE_URL}
        description="전국 고속버스, 시외버스 시간표와 요금 정보를 무료로 조회하세요. 서울, 부산, 대구, 대전, 광주, 강릉 등 전국 터미널 운행 정보 제공."
      />
      <OrganizationJsonLd />
      <FAQJsonLd items={faqItems} />
      <ItemListJsonLd items={popularRouteItems} name="인기 버스 노선" />
      <HowToJsonLd
        name="고속버스/시외버스 이용 방법"
        description="전국 고속버스와 시외버스를 예매하고 이용하는 방법을 안내합니다."
        steps={howToSteps}
        totalTime="PT30M"
      />
      <ServiceJsonLd
        name="전국 버스 시간표 서비스"
        description="전국 고속버스, 시외버스 시간표와 요금 정보를 무료로 제공하는 서비스입니다."
        provider="MustardData"
        areaServed={['서울', '부산', '대구', '대전', '광주', '울산', '강릉', '전주', '청주', '천안']}
      />
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
          <SearchForm expressTerminals={expressTerminals} intercityTerminals={intercityTerminals} />

          {/* 통계 */}
          <div className="mt-8 pt-6 border-t border-gray-100 flex flex-wrap justify-center gap-6 md:gap-12 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              <span>고속 터미널 <strong className="text-gray-900 text-lg ml-1">{activeTerminals.express}</strong>개</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-500"></span>
              <span>시외 터미널 <strong className="text-gray-900 text-lg ml-1">{activeTerminals.intercity}</strong>개</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <span>노선 <strong className="text-gray-900 text-lg ml-1">{totalRoutes.toLocaleString()}</strong>개</span>
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
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <Link
            href="/express/schedule"
            className="group relative overflow-hidden bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Image src="/images/icon-express.png" alt="Express Bus" width={120} height={120} />
            </div>
            <div className="p-6">
              <div className="inline-block p-3 rounded-lg bg-indigo-50 text-indigo-600 mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">고속버스 시간표</h3>
              <p className="text-gray-700 mb-4 text-sm">전국 주요 도시를 연결하는 고속버스 운행정보</p>
              <div className="flex items-center text-indigo-700 font-medium text-sm">
                바로가기 
                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
              </div>
            </div>
          </Link>

          <Link
            href="/intercity/schedule"
            className="group relative overflow-hidden bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Image src="/images/icon-intercity.png" alt="Intercity Bus" width={120} height={120} />
            </div>
            <div className="p-6">
              <div className="inline-block p-3 rounded-lg bg-slate-50 text-slate-600 mb-4 group-hover:bg-slate-600 group-hover:text-white transition-colors">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 7m0 13V7"></path></svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">시외버스 시간표</h3>
              <p className="text-gray-700 mb-4 text-sm">전국 방방곡곡을 연결하는 시외버스 운행정보</p>
              <div className="flex items-center text-slate-700 font-medium text-sm">
                바로가기
                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
              </div>
            </div>
          </Link>

          <Link
            href="/airport/schedule"
            className="group relative overflow-hidden bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100"
          >
            <div className="p-6">
              <div className="inline-block p-3 rounded-lg bg-sky-50 text-sky-600 mb-4 group-hover:bg-sky-600 group-hover:text-white transition-colors">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">공항버스 시간표</h3>
              <p className="text-gray-700 mb-4 text-sm">인천공항 T1·T2 리무진 {airportBuses.length}개 노선</p>
              <div className="flex items-center text-sky-700 font-medium text-sm">
                바로가기
                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
              </div>
            </div>
          </Link>
        </section>

        {/* 인기 노선 */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">🚌 주요 노선</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {popularRoutes.map((route, index) => {
              const depName = route.dep.split('(')[0].replace('터미널', '').trim();
              const arrName = route.arr.split('터미널')[0].replace('종합버스', '').trim();
              
              return (
                <Link
                  key={index}
                  href={`/express/schedule/route/${createRouteSlug(route.dep, route.arr)}`}
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

        {/* 광고 */}
        <AdSense slot="" format="horizontal" className="mb-16" />

        {/* 터미널 찾기 */}
        <section className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">📍 터미널 찾기</h2>
          <div className="text-center">
            <Link
              href="/terminal"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-md hover:shadow-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              전국 버스 터미널 보기
            </Link>
            <p className="text-gray-500 mt-4 text-sm">고속버스·시외버스 터미널 목록과 운행 정보를 확인하세요</p>
          </div>
        </section>

        {/* FAQ 섹션 */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">❓ 자주 묻는 질문</h2>
          <div className="space-y-4">
            {faqItems.slice(0, 4).map((faq, index) => (
              <details key={index} className="bg-white border border-gray-200 rounded-lg group">
                <summary className="p-4 cursor-pointer font-medium text-gray-900 flex items-center justify-between hover:bg-gray-50">
                  <span>{faq.question}</span>
                  <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-4 pb-4 text-gray-700 text-sm leading-relaxed">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* 광고 */}
        <AdSense slot="" format="auto" className="mt-16" />

        {/* 주요 터미널 링크 (SEO용 내부 링크) */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">🏢 주요 버스 터미널</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {majorTerminals.map((terminal, index) => (
              <Link
                key={index}
                href={`/terminal/${createTerminalSlug(terminal)}`}
                className="bg-white border border-gray-200 rounded-lg p-3 text-center hover:border-blue-300 hover:shadow-md transition-all text-sm font-medium text-gray-800"
              >
                {terminal.replace(/\(.*?\)/g, '')}
              </Link>
            ))}
          </div>
        </section>

        {/* SEO 텍스트 */}
        <section className="mt-16 bg-gray-100 rounded-xl p-6 text-gray-700 text-sm leading-relaxed">
          <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            전국 버스 시간표 서비스 안내
          </h2>
          <div className="space-y-3">
            <p>
              본 서비스는 국토교통부의 공공데이터포털 API를 활용하여 전국 고속버스 및 시외버스의 실시간 운행정보, 시간표, 요금 정보를 제공합니다. 
              서울고속버스터미널(경부/영동/호남), 동서울터미널, 센트럴시티터미널 등 전국 주요 터미널의 최신 정보를 쉽고 빠르게 검색할 수 있습니다.
            </p>
            <p>
              <strong>고속버스</strong>는 고속도로를 이용해 서울-부산, 서울-대구, 서울-대전, 서울-광주 등 주요 도시를 빠르게 연결합니다. 
              <strong>시외버스</strong>는 일반 국도를 이용해 전국 방방곡곡의 중소도시와 읍면 지역까지 연결하여 더 많은 지역을 커버합니다.
            </p>
            <p>
              버스 등급은 <strong>일반</strong>, <strong>우등</strong>, <strong>프리미엄</strong>으로 구분되며, 등급에 따라 좌석 간격, 편의시설, 요금이 다릅니다. 
              프리미엄 버스는 1+2 좌석 배열, 개인 모니터, 와이파이 등 고급 서비스를 제공합니다.
            </p>
            <p>
              제공되는 정보는 운수사의 사정에 따라 변경될 수 있으며, 명절이나 공휴일에는 임시 차량이 배치될 수 있습니다. 
              정확한 예매 및 좌석 확인은 <a href="https://www.kobus.co.kr" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-semibold">고속버스통합예매(KOBUS)</a>, 
              <a href="https://txbus.t-money.co.kr" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-semibold ml-1">티머니 시외버스</a>, 
              <a href="https://www.bustago.or.kr" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-semibold ml-1">버스타고</a> 등 공식 예매 사이트 및 앱을 이용해 주시기 바랍니다.
            </p>
          </div>
        </section>

        {/* 버스 이용 방법 (HowTo) */}
        <section className="mt-12 bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">🚌 고속버스/시외버스 이용 방법</h2>
          <ol className="space-y-3">
            {howToSteps.map((step, index) => (
              <li key={index} className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </span>
                <div>
                  <strong className="text-gray-900">{step.name}</strong>
                  <p className="text-sm text-gray-600 mt-1">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}
