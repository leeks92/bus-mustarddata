import type { Metadata } from 'next';
import Link from 'next/link';
import { getAirportBuses } from '@/lib/data';
import { BreadcrumbJsonLd, FAQJsonLd } from '@/components/JsonLd';

const BASE_URL = 'https://bus.mustarddata.com';

const AREA_ORDER = ['서울', '경기', '인천', '강원', '충청', '경상', '전라'];

const AREA_COLORS: Record<string, { bg: string; text: string; border: string; badge: string }> = {
  '서울': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', badge: 'bg-red-100 text-red-700' },
  '경기': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-700' },
  '인천': { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200', badge: 'bg-teal-100 text-teal-700' },
  '강원': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', badge: 'bg-emerald-100 text-emerald-700' },
  '충청': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-700' },
  '경상': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', badge: 'bg-purple-100 text-purple-700' },
  '전라': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', badge: 'bg-orange-100 text-orange-700' },
};

const faqItems = [
  {
    question: '인천공항 리무진 버스는 어디서 탈 수 있나요?',
    answer: '제1여객터미널(T1)은 1층 도착층, 제2여객터미널(T2)은 지하 1층 교통센터에서 탑승할 수 있습니다. 각 노선별 승차 위치(게이트 번호)가 다르므로 확인 후 이용하세요.',
  },
  {
    question: '공항버스 요금은 얼마인가요?',
    answer: '노선과 등급에 따라 다르지만, 일반 버스는 7,000~10,000원, 우등(리무진) 버스는 15,000~18,000원 수준입니다. 교통카드 및 현금 모두 이용 가능합니다.',
  },
  {
    question: '공항버스 평일과 주말 시간표가 다른가요?',
    answer: '대부분의 공항버스 노선은 평일과 주말 시간표가 동일하지만, 일부 노선은 주말에 감편 또는 증편 운행합니다. 각 노선 상세 페이지에서 평일/주말 시간표를 각각 확인할 수 있습니다.',
  },
  {
    question: 'T1과 T2 시간표가 다른가요?',
    answer: '네, 공항버스는 T2(제2여객터미널)에 먼저 정차한 후 T1(제1여객터미널)에 도착합니다. 따라서 T2 출발 시간이 T1보다 약 15~20분 빠릅니다.',
  },
];

export const metadata: Metadata = {
  title: '인천공항 공항버스 시간표 - 리무진 버스 노선, 요금, 첫차 막차',
  description: '인천국제공항 T1·T2 공항버스(리무진) 전 노선 시간표, 요금, 승차 위치를 확인하세요. 서울, 경기, 인천, 강원, 충청, 경상, 전라 지역별 공항 리무진 버스 정보.',
  keywords: [
    '공항버스', '인천공항 리무진', '공항버스 시간표', '인천공항 버스',
    '공항 리무진 요금', 'T1 버스', 'T2 버스', '인천공항 교통',
  ],
  alternates: {
    canonical: `${BASE_URL}/airport/schedule`,
  },
  openGraph: {
    title: '인천공항 공항버스 시간표 - 전 노선 조회',
    description: '인천국제공항 공항버스(리무진) 전 노선 시간표, 요금, 승차 위치 정보.',
    url: `${BASE_URL}/airport/schedule`,
  },
};

export default function AirportBusPage() {
  const allBuses = getAirportBuses();

  // 지역별 그룹화
  const byArea = new Map<string, typeof allBuses>();
  for (const bus of allBuses) {
    const list = byArea.get(bus.areaName) || [];
    list.push(bus);
    byArea.set(bus.areaName, list);
  }

  const breadcrumbs = [
    { name: '홈', url: BASE_URL },
    { name: '공항버스 시간표', url: `${BASE_URL}/airport/schedule` },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <BreadcrumbJsonLd items={breadcrumbs} />
      <FAQJsonLd items={faqItems} />

      {/* 헤더 */}
      <section className="bg-gradient-to-r from-sky-600 to-cyan-600 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <nav className="text-sky-200 text-sm mb-4">
            <Link href="/" className="hover:text-white">홈</Link>
            <span className="mx-2">/</span>
            <span className="text-white">공항버스 시간표</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            ✈️ 인천공항 공항버스 시간표
          </h1>
          <p className="text-sky-100 text-lg">
            인천국제공항 T1·T2 공항버스(리무진) {allBuses.length}개 노선의 시간표, 요금, 승차 위치 정보
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* 안내 카드 */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🛬</span>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">T1 (제1여객터미널)</h3>
                <p className="text-sm text-gray-600">1층 도착층에서 탑승</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🛬</span>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">T2 (제2여객터미널)</h3>
                <p className="text-sm text-gray-600">지하 1층 교통센터에서 탑승</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">ℹ️</span>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">운행 순서</h3>
                <p className="text-sm text-gray-600">T2 → T1 → 도착지 순으로 운행</p>
              </div>
            </div>
          </div>
        </div>

        {/* 지역별 노선 */}
        {AREA_ORDER.map(area => {
          const buses = byArea.get(area);
          if (!buses || buses.length === 0) return null;
          const colors = AREA_COLORS[area] || AREA_COLORS['서울'];

          return (
            <section key={area} className="mb-10">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${colors.badge}`}>{area}</span>
                <span>{area} 지역</span>
                <span className="text-sm font-normal text-gray-500 ml-2">{buses.length}개 노선</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {buses.map((bus, idx) => (
                  <Link
                    key={`${bus.busNumber}-${bus.area}-${idx}`}
                    href={`/airport/schedule/${bus.busNumber}`}
                    className={`bg-white border ${colors.border} rounded-xl p-5 hover:shadow-lg transition-all group`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`text-lg font-bold ${colors.text}`}>{bus.busNumber}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${colors.badge}`}>
                          {bus.busClass}
                        </span>
                      </div>
                      <span className="text-gray-400 group-hover:text-sky-500 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-2 mb-3">{bus.routeInfo}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>요금: <strong className="text-gray-800">{bus.adultFare > 0 ? `${bus.adultFare.toLocaleString()}원` : '-'}</strong></span>
                      <span>{bus.company.split('(')[0]}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}

        {/* FAQ 섹션 */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">❓ 자주 묻는 질문</h2>
          <div className="space-y-4">
            {faqItems.map((faq, index) => (
              <details key={index} className="bg-white border border-gray-200 rounded-lg group">
                <summary className="p-4 cursor-pointer font-medium text-gray-900 flex items-center justify-between hover:bg-gray-50">
                  <span>{faq.question}</span>
                  <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-4 pb-4 text-gray-700 text-sm leading-relaxed">{faq.answer}</div>
              </details>
            ))}
          </div>
        </section>

        {/* SEO 텍스트 */}
        <section className="mt-12 bg-gray-100 rounded-xl p-6 text-gray-700 text-sm leading-relaxed">
          <h2 className="text-base font-bold text-gray-900 mb-3">인천공항 공항버스(리무진) 이용 안내</h2>
          <div className="space-y-3">
            <p>
              인천국제공항에서 서울, 경기, 인천, 강원, 충청, 경상, 전라 등 전국 주요 도시로 운행하는 공항버스(리무진 버스) 시간표를 제공합니다.
              공항버스는 제2여객터미널(T2)에서 먼저 출발하여 제1여객터미널(T1)을 경유한 후 목적지로 향합니다.
            </p>
            <p>
              <strong>승차 위치:</strong> T1은 1층 도착층의 각 게이트(예: 4A, 7A 등), T2는 지하 1층(B1F) 교통센터의 각 게이트에서 탑승합니다.
              노선별로 승차 게이트가 다르므로 사전에 확인해 주세요.
            </p>
            <p>
              <strong>요금 안내:</strong> 일반 버스는 7,000~10,000원, 우등(리무진) 버스는 15,000~18,000원 수준이며, 
              교통카드(T-money, 캐시비) 및 현금으로 결제할 수 있습니다. 
              심야 버스(N 노선)는 별도 요금이 적용될 수 있습니다.
            </p>
            <p>
              본 시간표는 인천국제공항공사 공공데이터를 기반으로 제공되며, 교통 상황이나 운수사 사정에 따라 실제 운행과 차이가 있을 수 있습니다.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
