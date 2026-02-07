import type { Metadata } from 'next';
import Link from 'next/link';
import { getAirportBuses, getAirportBusByNumber } from '@/lib/data';
import { BreadcrumbJsonLd, BusTripJsonLd } from '@/components/JsonLd';
import { notFound } from 'next/navigation';
import AdSense from '@/components/AdSense';

const BASE_URL = 'https://bus.mustarddata.com';

// 정적 페이지 생성
export function generateStaticParams() {
  const buses = getAirportBuses();
  const seen = new Set<string>();
  return buses
    .filter(b => {
      if (seen.has(b.busNumber)) return false;
      seen.add(b.busNumber);
      return true;
    })
    .map(b => ({ busNumber: b.busNumber }));
}

// 메타데이터
export async function generateMetadata({ params }: { params: Promise<{ busNumber: string }> }): Promise<Metadata> {
  const { busNumber } = await params;
  const bus = getAirportBusByNumber(decodeURIComponent(busNumber));
  if (!bus) {
    return { title: '공항버스 노선 정보' };
  }

  const stops = bus.routeInfo.split(',').map(s => s.trim()).filter(Boolean);
  const mainStops = stops.slice(0, 5).join(', ');

  return {
    title: `${bus.busNumber}번 공항버스 시간표 - 인천공항 ${bus.areaName} 리무진`,
    description: `인천공항 ${bus.busNumber}번 공항버스(${bus.busClass}) 시간표, 요금 ${bus.adultFare > 0 ? bus.adultFare.toLocaleString() + '원' : ''}, 승차위치. 주요 경유지: ${mainStops}. T1·T2 평일/주말 시간표.`,
    keywords: [
      `${bus.busNumber}번 공항버스`,
      `인천공항 ${bus.busNumber}`,
      '공항버스 시간표',
      '공항 리무진',
      `${bus.areaName} 공항버스`,
    ],
    alternates: {
      canonical: `${BASE_URL}/airport/schedule/${bus.busNumber}`,
    },
    openGraph: {
      title: `${bus.busNumber}번 공항버스 시간표 - 인천공항 리무진`,
      description: `인천공항 ${bus.busNumber}번 ${bus.busClass} 버스. 요금 ${bus.adultFare > 0 ? bus.adultFare.toLocaleString() + '원' : ''}. 경유지: ${mainStops}`,
      url: `${BASE_URL}/airport/schedule/${bus.busNumber}`,
    },
  };
}

export default async function AirportBusDetailPage({ params }: { params: Promise<{ busNumber: string }> }) {
  const { busNumber } = await params;
  const bus = getAirportBusByNumber(decodeURIComponent(busNumber));
  if (!bus) return notFound();

  const stops = bus.routeInfo.split(',').map(s => s.trim()).filter(Boolean);

  const breadcrumbs = [
    { name: '홈', url: BASE_URL },
    { name: '공항버스 시간표', url: `${BASE_URL}/airport/schedule` },
    { name: `${bus.busNumber}번`, url: `${BASE_URL}/airport/schedule/${bus.busNumber}` },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <BreadcrumbJsonLd items={breadcrumbs} />
      <BusTripJsonLd
        departureStation="인천국제공항"
        arrivalStation={stops[stops.length - 1] || bus.areaName}
        price={bus.adultFare}
        url={`${BASE_URL}/airport/schedule/${bus.busNumber}`}
      />

      {/* 헤더 */}
      <section className="bg-gradient-to-r from-sky-600 to-cyan-600 text-white py-10">
        <div className="max-w-6xl mx-auto px-4">
          <nav className="text-sky-200 text-sm mb-4">
            <Link href="/" className="hover:text-white">홈</Link>
            <span className="mx-2">/</span>
            <Link href="/airport/schedule" className="hover:text-white">공항버스</Link>
            <span className="mx-2">/</span>
            <span className="text-white">{bus.busNumber}번</span>
          </nav>
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="text-5xl font-bold">{bus.busNumber}</span>
              <div>
                <span className="inline-block bg-white/20 text-white text-sm px-3 py-1 rounded-full font-medium">
                  {bus.busClass}
                </span>
                <span className="inline-block bg-white/20 text-white text-sm px-3 py-1 rounded-full font-medium ml-2">
                  {bus.areaName}
                </span>
              </div>
            </div>
            <div className="md:ml-auto text-right">
              {bus.adultFare > 0 && (
                <div className="text-3xl font-bold">{bus.adultFare.toLocaleString()}원</div>
              )}
              {bus.company && (
                <div className="text-sky-200 text-sm mt-1">{bus.company}</div>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* 기본 정보 카드 */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">기본 정보</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-500 mb-1">공항행 첫차</div>
              <div className="text-lg font-bold text-gray-900">{bus.t1.toAirportFirst || '-'}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-500 mb-1">공항행 막차</div>
              <div className="text-lg font-bold text-gray-900">{bus.t1.toAirportLast || '-'}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-500 mb-1">T1 승차 위치</div>
              <div className="text-lg font-bold text-sky-700">{bus.t1.boarding || '-'}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-500 mb-1">T2 승차 위치</div>
              <div className="text-lg font-bold text-sky-700">{bus.t2.boarding || '-'}</div>
            </div>
          </div>
        </div>

        {/* 경유지 */}
        {stops.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">🚏 경유지</h2>
            <div className="flex flex-wrap gap-2">
              {stops.map((stop, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 bg-gray-100 text-gray-800 text-sm px-3 py-1.5 rounded-lg"
                >
                  {i === 0 && <span className="text-sky-600 font-bold text-xs">출발</span>}
                  {i === stops.length - 1 && <span className="text-red-500 font-bold text-xs">종점</span>}
                  {stop}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* T1 시간표 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-sky-50 border-b border-sky-200 px-6 py-4">
              <h2 className="text-lg font-bold text-sky-800">🛬 T1 (제1여객터미널) 시간표</h2>
              <div className="flex gap-4 mt-2 text-sm text-sky-600">
                <span>첫차: <strong>{bus.t1.toDestFirst || '-'}</strong></span>
                <span>막차: <strong>{bus.t1.toDestLast || '-'}</strong></span>
                <span>승차: <strong>{bus.t1.boarding || '-'}</strong></span>
              </div>
            </div>
            <div className="p-6">
              {/* 평일 */}
              <div className="mb-6">
                <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  평일 시간표
                  <span className="text-xs font-normal text-gray-400">({bus.t1.weekdayTimes.length}회 운행)</span>
                </h3>
                {bus.t1.weekdayTimes.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {bus.t1.weekdayTimes.map((time, i) => (
                      <span key={i} className="text-sm bg-blue-50 text-blue-800 px-2.5 py-1 rounded-md font-mono">
                        {time}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">시간표 정보 없음</p>
                )}
              </div>

              {/* 주말 */}
              <div>
                <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  주말·공휴일 시간표
                  <span className="text-xs font-normal text-gray-400">({bus.t1.weekendTimes.length}회 운행)</span>
                </h3>
                {bus.t1.weekendTimes.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {bus.t1.weekendTimes.map((time, i) => (
                      <span key={i} className="text-sm bg-red-50 text-red-800 px-2.5 py-1 rounded-md font-mono">
                        {time}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">시간표 정보 없음</p>
                )}
              </div>
            </div>
          </div>

          {/* T2 시간표 */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-cyan-50 border-b border-cyan-200 px-6 py-4">
              <h2 className="text-lg font-bold text-cyan-800">🛬 T2 (제2여객터미널) 시간표</h2>
              <div className="flex gap-4 mt-2 text-sm text-cyan-600">
                <span>첫차: <strong>{bus.t2.toDestFirst || '-'}</strong></span>
                <span>막차: <strong>{bus.t2.toDestLast || '-'}</strong></span>
                <span>승차: <strong>{bus.t2.boarding || '-'}</strong></span>
              </div>
            </div>
            <div className="p-6">
              {/* 평일 */}
              <div className="mb-6">
                <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  평일 시간표
                  <span className="text-xs font-normal text-gray-400">({bus.t2.weekdayTimes.length}회 운행)</span>
                </h3>
                {bus.t2.weekdayTimes.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {bus.t2.weekdayTimes.map((time, i) => (
                      <span key={i} className="text-sm bg-blue-50 text-blue-800 px-2.5 py-1 rounded-md font-mono">
                        {time}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">시간표 정보 없음</p>
                )}
              </div>

              {/* 주말 */}
              <div>
                <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  주말·공휴일 시간표
                  <span className="text-xs font-normal text-gray-400">({bus.t2.weekendTimes.length}회 운행)</span>
                </h3>
                {bus.t2.weekendTimes.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {bus.t2.weekendTimes.map((time, i) => (
                      <span key={i} className="text-sm bg-red-50 text-red-800 px-2.5 py-1 rounded-md font-mono">
                        {time}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">시간표 정보 없음</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 광고 */}
        <AdSense slot="" format="auto" className="mb-8" />

        {/* 이용 안내 */}
        <div className="bg-sky-50 rounded-xl border border-sky-200 p-6 mb-8">
          <h2 className="text-lg font-bold text-sky-800 mb-4">이용 안내</h2>
          <ul className="space-y-2 text-sm text-sky-900">
            <li className="flex items-start gap-2">
              <span className="text-sky-500 mt-0.5">•</span>
              공항버스는 T2(제2터미널)에서 먼저 출발하여 T1(제1터미널)을 경유합니다.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-sky-500 mt-0.5">•</span>
              교통 상황에 따라 실제 운행 시간이 달라질 수 있습니다.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-sky-500 mt-0.5">•</span>
              교통카드(T-money, 캐시비) 및 현금 모두 이용 가능합니다.
            </li>
            {bus.company && (
              <li className="flex items-start gap-2">
                <span className="text-sky-500 mt-0.5">•</span>
                운수사: {bus.company}
              </li>
            )}
          </ul>
        </div>

        {/* 하단 네비게이션 */}
        <div className="text-center">
          <Link
            href="/airport/schedule"
            className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-8 py-3 rounded-xl font-bold transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            전체 노선 보기
          </Link>
        </div>
      </div>
    </div>
  );
}
