import Link from 'next/link';
import type { Metadata } from 'next';
import { getExpressTerminals, getIntercityTerminals } from '@/lib/data';

export const metadata: Metadata = {
  title: '전국 버스 터미널 목록 - 고속버스, 시외버스 터미널',
  description:
    '전국 고속버스, 시외버스 터미널 목록. 서울, 부산, 대구, 대전, 광주 등 주요 도시 터미널 정보와 시간표를 확인하세요.',
};

export default function TerminalListPage() {
  const expressTerminals = getExpressTerminals();
  const intercityTerminals = getIntercityTerminals();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">전국 버스 터미널</h1>
      <p className="text-gray-600 mb-8">
        고속버스 {expressTerminals.length}개, 시외버스{' '}
        {intercityTerminals.length}개 터미널
      </p>

      {/* 고속버스 터미널 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          🚌 고속버스 터미널
          <span className="text-sm font-normal text-gray-500">
            ({expressTerminals.length}개)
          </span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {expressTerminals.map(terminal => (
            <Link
              key={terminal.terminalId}
              href={`/terminal/${terminal.terminalId}`}
              className="bg-white border rounded-lg p-4 hover:shadow-md transition"
            >
              <h3 className="font-medium">{terminal.terminalNm}</h3>
              {terminal.cityName && (
                <p className="text-sm text-gray-500 mt-1">{terminal.cityName}</p>
              )}
            </Link>
          ))}
        </div>
      </section>

      {/* 시외버스 터미널 */}
      <section>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          🚐 시외버스 터미널
          <span className="text-sm font-normal text-gray-500">
            ({intercityTerminals.length}개)
          </span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {intercityTerminals.map(terminal => (
            <Link
              key={terminal.terminalId}
              href={`/terminal/${terminal.terminalId}`}
              className="bg-white border rounded-lg p-4 hover:shadow-md transition"
            >
              <h3 className="font-medium">{terminal.terminalNm}</h3>
              {terminal.cityName && (
                <p className="text-sm text-gray-500 mt-1">{terminal.cityName}</p>
              )}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
