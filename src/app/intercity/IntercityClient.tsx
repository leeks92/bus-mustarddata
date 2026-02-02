'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Terminal {
  terminalId: string;
  terminalNm: string;
  cityName?: string;
}

interface Props {
  terminals: Terminal[];
}

export default function IntercityClient({ terminals }: Props) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTerminals = terminals.filter(t => 
    t.terminalNm.includes(searchTerm) || (t.cityName && t.cityName.includes(searchTerm))
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* 헤더 섹션 */}
      <div className="bg-green-600 text-white py-12 px-4 shadow-md">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">시외버스 시간표</h1>
          <p className="text-green-100 text-lg mb-8">
            전국 <strong className="text-white">{terminals.length}</strong>개 시외버스 터미널 운행 정보
          </p>
          
          {/* 검색창 */}
          <div className="max-w-xl mx-auto relative">
            <input
              type="text"
              placeholder="터미널 이름 검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-4 px-6 rounded-full text-gray-900 shadow-lg focus:outline-none focus:ring-4 focus:ring-green-400 text-lg placeholder-gray-400"
            />
            <div className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-8">
        {/* 검색 결과 없음 */}
        {filteredTerminals.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-500">검색 결과가 없습니다.</p>
          </div>
        )}

        {/* 터미널 목록 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTerminals.map(terminal => (
            <Link
              key={terminal.terminalId}
              href={`/terminal/${terminal.terminalId}`}
              className="group bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg hover:border-green-300 transition-all duration-200"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                    {terminal.terminalNm}
                  </h3>
                  {terminal.cityName && (
                    <p className="text-sm text-gray-500 mt-1 flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                      {terminal.cityName}
                    </p>
                  )}
                </div>
                <div className="bg-gray-50 p-2 rounded-full group-hover:bg-green-50 transition-colors">
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
