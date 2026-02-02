import Link from 'next/link';
import type { Metadata } from 'next';
import { getIntercityTerminals } from '@/lib/data';

export const metadata: Metadata = {
  title: '시외버스 시간표 - 전국 시외버스 터미널 운행정보',
  description:
    '전국 시외버스 터미널 시간표와 요금 정보. 서울, 부산, 대구, 대전, 광주 등 주요 도시 시외버스 운행 시간표를 확인하세요.',
};

export default function IntercityPage() {
  const terminals = getIntercityTerminals();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">시외버스 시간표</h1>
        <p className="text-gray-600">
          전국 {terminals.length}개 시외버스 터미널 운행 정보
        </p>
      </div>

      {/* 안내 메시지 */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
        <p className="text-yellow-800">
          ⚠️ <strong>안내:</strong> 시외버스 시간표는 공공 API 제한으로 인해
          당일 조회만 가능합니다. 정확한 시간표는 아래 예매 사이트를 이용해
          주세요.
        </p>
        <div className="flex gap-4 mt-3">
          <a
            href="https://txbus.t-money.co.kr"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline text-sm"
          >
            티머니 시외버스 예매 →
          </a>
          <a
            href="https://www.bustago.or.kr"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline text-sm"
          >
            버스타고 →
          </a>
        </div>
      </div>

      {/* 터미널 목록 */}
      <section>
        <h2 className="text-xl font-bold mb-4">시외버스 터미널 목록</h2>
        {terminals.length === 0 ? (
          <p className="text-gray-500">터미널 정보를 불러오는 중입니다...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {terminals.map(terminal => (
              <Link
                key={terminal.terminalId}
                href={`/terminal/${terminal.terminalId}`}
                className="bg-white border rounded-lg p-4 hover:shadow-md transition"
              >
                <h3 className="font-medium">{terminal.terminalNm}</h3>
                {terminal.cityName && (
                  <p className="text-sm text-gray-500 mt-1">
                    {terminal.cityName}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
