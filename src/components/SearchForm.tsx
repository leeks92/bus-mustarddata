'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Terminal {
  terminalId: string;
  terminalNm: string;
}

interface Props {
  terminals: Terminal[];
}

export default function SearchForm({ terminals }: Props) {
  const router = useRouter();
  const [departure, setDeparture] = useState('');
  const [arrival, setArrival] = useState('');
  const [error, setError] = useState('');

  // 이름 기준 중복 제거 (같은 이름의 터미널은 첫 번째만 표시)
  const uniqueTerminals = terminals.reduce<Terminal[]>((acc, terminal) => {
    if (!acc.find(t => t.terminalNm === terminal.terminalNm)) {
      acc.push(terminal);
    }
    return acc;
  }, []);

  const handleSearch = () => {
    if (!departure) {
      setError('출발지를 선택해주세요');
      return;
    }
    if (!arrival) {
      setError('도착지를 선택해주세요');
      return;
    }
    if (departure === arrival) {
      setError('출발지와 도착지가 같습니다');
      return;
    }
    
    setError('');
    router.push(`/express/${departure}/${arrival}`);
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="relative">
          <label className="block text-sm font-bold text-gray-700 mb-2">
            출발지
          </label>
          <div className="relative">
            <select 
              value={departure}
              onChange={(e) => {
                setDeparture(e.target.value);
                setError('');
              }}
              className="w-full appearance-none border border-gray-300 rounded-xl p-4 pr-10 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-50 hover:bg-white text-lg"
            >
              <option value="">터미널 선택</option>
              {uniqueTerminals.map(t => (
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
            <select 
              value={arrival}
              onChange={(e) => {
                setArrival(e.target.value);
                setError('');
              }}
              className="w-full appearance-none border border-gray-300 rounded-xl p-4 pr-10 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-50 hover:bg-white text-lg"
            >
              <option value="">터미널 선택</option>
              {uniqueTerminals.map(t => (
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
          <button 
            onClick={handleSearch}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
          >
            시간표 조회하기
          </button>
        </div>
      </div>
      
      {error && (
        <div className="mt-4 text-red-600 text-sm font-medium flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          {error}
        </div>
      )}
    </div>
  );
}
