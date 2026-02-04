'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Terminal {
  terminalId: string;
  terminalNm: string;
  cityName?: string;
}

interface Props {
  expressTerminals: Terminal[];
  intercityTerminals: Terminal[];
}

export default function TerminalClient({ expressTerminals, intercityTerminals }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'express' | 'intercity'>('all');

  // 검색 필터링
  const filterTerminals = (terminals: Terminal[]) => {
    return terminals.filter(t => 
      t.terminalNm.includes(searchTerm) || (t.cityName && t.cityName.includes(searchTerm))
    );
  };

  const filteredExpress = filterTerminals(expressTerminals);
  const filteredIntercity = filterTerminals(intercityTerminals);

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* 헤더 섹션 */}
      <div className="bg-gray-900 text-white py-12 px-4 shadow-md">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">전국 버스 터미널</h1>
          <p className="text-gray-300 text-lg mb-8">
            고속버스 <strong className="text-white">{expressTerminals.length}</strong>개, 
            시외버스 <strong className="text-white">{intercityTerminals.length}</strong>개 터미널 정보
          </p>
          
          {/* 검색창 */}
          <div className="max-w-xl mx-auto relative">
            <input
              type="text"
              placeholder="터미널 또는 지역 이름 검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-4 px-6 rounded-full text-gray-900 shadow-lg focus:outline-none focus:ring-4 focus:ring-gray-500 text-lg placeholder-gray-500"
            />
            <div className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-500">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-8">
        {/* 탭 네비게이션 */}
        <div className="flex justify-center mb-8">
          <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-200 inline-flex">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'all' 
                  ? 'bg-gray-900 text-white shadow-md' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              전체 보기
            </button>
            <button
              onClick={() => setActiveTab('express')}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'express' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              고속버스
            </button>
            <button
              onClick={() => setActiveTab('intercity')}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'intercity' 
                  ? 'bg-green-600 text-white shadow-md' 
                  : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
              }`}
            >
              시외버스
            </button>
          </div>
        </div>

        {/* 검색 결과 없음 */}
        {filteredExpress.length === 0 && filteredIntercity.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">검색 결과가 없습니다.</p>
          </div>
        )}

        {/* 고속버스 터미널 */}
        {(activeTab === 'all' || activeTab === 'express') && filteredExpress.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-800">
              <span className="text-blue-600">🚌</span> 고속버스 터미널
              <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {filteredExpress.length}개
              </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredExpress.map(terminal => (
                <Link
                  key={terminal.terminalId}
                  href={`/terminal/${terminal.terminalId}`}
                  className="group bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg hover:border-blue-300 transition-all duration-200"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {terminal.terminalNm}
                      </h3>
                      {terminal.cityName && (
                        <p className="text-sm text-gray-600 mt-1 flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                          {terminal.cityName}
                        </p>
                      )}
                    </div>
                    <span className="text-xs font-semibold bg-blue-50 text-blue-600 px-2 py-1 rounded">고속</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 시외버스 터미널 */}
        {(activeTab === 'all' || activeTab === 'intercity') && filteredIntercity.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-800">
              <span className="text-green-600">🚐</span> 시외버스 터미널
              <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {filteredIntercity.length}개
              </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredIntercity.map(terminal => (
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
                        <p className="text-sm text-gray-600 mt-1 flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                          {terminal.cityName}
                        </p>
                      )}
                    </div>
                    <span className="text-xs font-semibold bg-green-50 text-green-600 px-2 py-1 rounded">시외</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
