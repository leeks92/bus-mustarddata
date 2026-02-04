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

// 터미널을 지역별로 그룹화하는 함수
function groupTerminalsByRegion(terminals: Terminal[]) {
  const regions: Record<string, Terminal[]> = {};

  terminals.forEach(terminal => {
    let region = '기타';
    const name = terminal.terminalNm;
    const city = terminal.cityName || '';

    // 광역시/특별시 (cityName에서 "서울특별시", "부산광역시" 등 매칭)
    if (name.includes('서울') || city.includes('서울')) region = '서울';
    else if (name.includes('부산') || city.includes('부산')) region = '부산';
    else if (name.includes('대구') || city.includes('대구')) region = '대구';
    else if (name.includes('대전') || city.includes('대전')) region = '대전';
    else if (name.includes('광주') || city.includes('광주')) region = '광주';
    else if (name.includes('울산') || city.includes('울산')) region = '울산';
    else if (name.includes('인천') || city.includes('인천')) region = '인천';
    else if (name.includes('세종') || city.includes('세종')) region = '세종';
    // 도 단위 (약어 + 전체 이름 모두 매칭)
    else if (city.includes('경기')) region = '경기';
    else if (city.includes('강원')) region = '강원';
    else if (city.includes('충청북') || city.includes('충북')) region = '충북';
    else if (city.includes('충청남') || city.includes('충남')) region = '충남';
    else if (city.includes('경상북') || city.includes('경북')) region = '경북';
    else if (city.includes('경상남') || city.includes('경남')) region = '경남';
    else if (city.includes('전라북') || city.includes('전북')) region = '전북';
    else if (city.includes('전라남') || city.includes('전남')) region = '전남';
    else if (city.includes('제주')) region = '제주';

    if (!regions[region]) {
      regions[region] = [];
    }
    regions[region].push(terminal);
  });

  return regions;
}

const regionOrder = [
  '서울', '경기', '인천', '부산', '대구', '대전', '광주', '울산', '세종',
  '강원', '충북', '충남', '경북', '경남', '전북', '전남', '제주', '기타'
];

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
  
  // 지역별 그룹화
  const groupedExpress = groupTerminalsByRegion(filteredExpress);
  const groupedIntercity = groupTerminalsByRegion(filteredIntercity);

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

        {/* 지역별 터미널 목록 */}
        <div className="space-y-12">
          {regionOrder.map(region => {
            const expressInRegion = (activeTab === 'all' || activeTab === 'express') ? (groupedExpress[region] || []) : [];
            const intercityInRegion = (activeTab === 'all' || activeTab === 'intercity') ? (groupedIntercity[region] || []) : [];
            const totalInRegion = expressInRegion.length + intercityInRegion.length;
            
            if (totalInRegion === 0) return null;

            return (
              <section key={region} className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-800 border-b pb-4">
                  <span className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 text-gray-700 text-lg">
                    {region.substring(0, 1)}
                  </span>
                  {region}
                  <span className="text-sm font-normal text-gray-500 ml-auto bg-gray-50 px-3 py-1 rounded-full">
                    {totalInRegion}개 터미널
                  </span>
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* 고속버스 터미널 */}
                  {expressInRegion.map(terminal => (
                    <Link
                      key={`express-${terminal.terminalId}`}
                      href={`/terminal/${terminal.terminalId}`}
                      className="group block bg-gray-50 hover:bg-white border border-transparent hover:border-blue-200 rounded-xl p-5 transition-all duration-200 hover:shadow-md"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {terminal.terminalNm}
                        </h3>
                        <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          고속
                        </span>
                      </div>
                      {terminal.cityName && (
                        <p className="text-sm text-gray-600 flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                          {terminal.cityName}
                        </p>
                      )}
                    </Link>
                  ))}
                  
                  {/* 시외버스 터미널 */}
                  {intercityInRegion.map(terminal => (
                    <Link
                      key={`intercity-${terminal.terminalId}`}
                      href={`/terminal/${terminal.terminalId}`}
                      className="group block bg-gray-50 hover:bg-white border border-transparent hover:border-green-200 rounded-xl p-5 transition-all duration-200 hover:shadow-md"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                          {terminal.terminalNm}
                        </h3>
                        <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-1 rounded">
                          시외
                        </span>
                      </div>
                      {terminal.cityName && (
                        <p className="text-sm text-gray-600 flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                          {terminal.cityName}
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
