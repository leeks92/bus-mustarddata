'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createTerminalSlug } from '@/lib/slug-utils';

interface Terminal {
  terminalId: string;
  terminalNm: string;
  cityName?: string;
}

interface Route {
  depTerminalId: string;
  arrTerminalId: string;
}

interface Props {
  expressTerminals: Terminal[];
  intercityTerminals: Terminal[];
  expressRoutes: Route[];
  intercityRoutes: Route[];
}

// 터미널을 지역별로 그룹화하는 함수
function groupTerminalsByRegion(terminals: Terminal[]) {
  const regions: Record<string, Terminal[]> = {};

  terminals.forEach(terminal => {
    let region = '기타';
    const name = terminal.terminalNm;
    const city = terminal.cityName || '';

    if (name.includes('서울') || city.includes('서울')) region = '서울';
    else if (name.includes('부산') || city.includes('부산')) region = '부산';
    else if (name.includes('대구') || city.includes('대구')) region = '대구';
    else if (name.includes('대전') || city.includes('대전')) region = '대전';
    else if (name.includes('광주') || city.includes('광주')) region = '광주';
    else if (name.includes('울산') || city.includes('울산')) region = '울산';
    else if (name.includes('인천') || city.includes('인천')) region = '인천';
    else if (name.includes('세종') || city.includes('세종')) region = '세종';
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

export default function TerminalListClient({ 
  expressTerminals, 
  intercityTerminals, 
  expressRoutes, 
  intercityRoutes 
}: Props) {
  const [activeTab, setActiveTab] = useState<'express' | 'intercity'>('express');
  const [searchTerm, setSearchTerm] = useState('');

  const [showAll, setShowAll] = useState(false);

  const currentTerminals = activeTab === 'express' ? expressTerminals : intercityTerminals;
  const currentRoutes = activeTab === 'express' ? expressRoutes : intercityRoutes;

  // 노선 데이터가 있는 터미널 ID 셋
  const depTerminalIds = new Set(currentRoutes.map(r => r.depTerminalId));

  // 검색 필터링
  const filteredTerminals = currentTerminals.filter(t => 
    t.terminalNm.includes(searchTerm) || (t.cityName && t.cityName.includes(searchTerm))
  );

  // 중복 제거
  const uniqueTerminals = filteredTerminals.reduce<Terminal[]>((acc, terminal) => {
    if (!acc.find(t => t.terminalNm === terminal.terminalNm)) {
      acc.push(terminal);
    }
    return acc;
  }, []);

  // 노선 있는 터미널 우선 표시
  const isSearching = searchTerm.length > 0;
  const displayTerminals = (isSearching || showAll)
    ? uniqueTerminals
    : uniqueTerminals.filter(t => depTerminalIds.has(t.terminalId));

  const hiddenCount = uniqueTerminals.length - uniqueTerminals.filter(t => depTerminalIds.has(t.terminalId)).length;
  const activeExpressCount = expressTerminals.filter(t => new Set(expressRoutes.map(r => r.depTerminalId)).has(t.terminalId)).length;
  const activeIntercityCount = intercityTerminals.filter(t => new Set(intercityRoutes.map(r => r.depTerminalId)).has(t.terminalId)).length;

  const groupedTerminals = groupTerminalsByRegion(displayTerminals);

  const getBusTypeUrl = (terminalSlug: string) => {
    return activeTab === 'express' 
      ? `/express/schedule/${terminalSlug}`
      : `/intercity/schedule/${terminalSlug}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* 헤더 섹션 */}
      <div className="bg-blue-600 text-white py-12 px-4 shadow-md">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">전국 버스 터미널</h1>
          <p className="text-blue-100 text-lg mb-8">
            고속버스 <strong className="text-white">{activeExpressCount}</strong>개, 
            시외버스 <strong className="text-white">{activeIntercityCount}</strong>개 터미널 운행 정보
          </p>
          
          {/* 검색창 */}
          <div className="max-w-xl mx-auto relative">
            <input
              type="text"
              placeholder="터미널 이름 검색 (예: 서울, 부산)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-4 px-6 rounded-full bg-white text-gray-900 shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-400 text-lg placeholder-gray-400"
            />
            <div className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-8">
        {/* 탭 */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-white rounded-xl p-1 shadow-sm border border-gray-200">
            <button
              onClick={() => { setActiveTab('express'); setSearchTerm(''); setShowAll(false); }}
              className={`px-6 py-3 rounded-lg font-bold transition-all ${
                activeTab === 'express'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
              }`}
            >
              🚌 고속버스 ({activeExpressCount})
            </button>
            <button
              onClick={() => { setActiveTab('intercity'); setSearchTerm(''); setShowAll(false); }}
              className={`px-6 py-3 rounded-lg font-bold transition-all ${
                activeTab === 'intercity'
                  ? 'bg-slate-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-slate-600 hover:bg-slate-50'
              }`}
            >
              🚐 시외버스 ({activeIntercityCount})
            </button>
          </div>
        </div>

        {/* 검색 결과 없음 */}
        {uniqueTerminals.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">검색 결과가 없습니다.</p>
          </div>
        )}

        {/* 지역별 터미널 목록 */}
        <div className="space-y-12">
          {regionOrder.map(region => {
            const regionTerminals = groupedTerminals[region];
            if (!regionTerminals || regionTerminals.length === 0) return null;

            return (
              <section key={region} className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-800 border-b pb-4">
                  <span className={`flex items-center justify-center w-10 h-10 rounded-full text-lg ${
                    activeTab === 'express' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {region.substring(0, 1)}
                  </span>
                  {region}
                  <span className="text-sm font-normal text-gray-500 ml-auto bg-gray-50 px-3 py-1 rounded-full">
                    {regionTerminals.filter(t => depTerminalIds.has(t.terminalId)).length > 0
                      ? `${regionTerminals.filter(t => depTerminalIds.has(t.terminalId)).length}개 터미널`
                      : `${regionTerminals.length}개 터미널`}
                  </span>
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {regionTerminals
                    .sort((a, b) => {
                      const aHas = depTerminalIds.has(a.terminalId) ? 0 : 1;
                      const bHas = depTerminalIds.has(b.terminalId) ? 0 : 1;
                      if (aHas !== bHas) return aHas - bHas;
                      return a.terminalNm.localeCompare(b.terminalNm);
                    })
                    .map(terminal => {
                    const routeCount = currentRoutes.filter(
                      r => r.depTerminalId === terminal.terminalId
                    ).length;
                    const terminalSlug = createTerminalSlug(terminal.terminalNm);
                    const hasRoutes = routeCount > 0;

                    return (
                      <Link
                        key={terminal.terminalId}
                        href={getBusTypeUrl(terminalSlug)}
                        className={`group block rounded-xl p-5 transition-all duration-200 ${
                          hasRoutes
                            ? `bg-gray-50 hover:bg-white border border-transparent hover:shadow-md ${activeTab === 'express' ? 'hover:border-indigo-200' : 'hover:border-slate-200'}`
                            : 'bg-gray-50/50 border border-gray-100 opacity-60 hover:opacity-80'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className={`text-lg font-bold transition-colors ${
                            hasRoutes
                              ? `text-gray-900 ${activeTab === 'express' ? 'group-hover:text-indigo-600' : 'group-hover:text-slate-600'}`
                              : 'text-gray-500'
                          }`}>
                            {terminal.terminalNm}
                          </h3>
                          {hasRoutes && (
                            <span className={`text-xs font-semibold px-2 py-1 rounded ${
                              activeTab === 'express' 
                                ? 'bg-indigo-100 text-indigo-700' 
                                : 'bg-slate-100 text-slate-700'
                            }`}>
                              {routeCount}개 노선
                            </span>
                          )}
                        </div>
                        <div className="flex items-center text-sm text-gray-600 mt-2">
                          <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 7m0 13V7"></path></svg>
                          {hasRoutes ? (
                            <span><strong className="text-gray-800">{routeCount}</strong>개 노선 운행</span>
                          ) : (
                            <span className="text-gray-400">시간표 준비중</span>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

        {/* 전체 터미널 보기 토글 */}
        {!isSearching && hiddenCount > 0 && (
          <div className="mt-12 text-center">
            <button
              onClick={() => setShowAll(!showAll)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 rounded-full text-sm text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm"
            >
              {showAll ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path></svg>
                  운행중인 터미널만 보기
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  시간표 준비중인 터미널 {hiddenCount.toLocaleString()}개 더보기
                </>
              )}
            </button>
            {!showAll && (
              <p className="text-xs text-gray-400 mt-2">시간표 데이터가 아직 수집되지 않은 터미널입니다</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
