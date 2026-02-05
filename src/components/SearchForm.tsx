'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Terminal {
  terminalId: string;
  terminalNm: string;
}

interface Props {
  expressTerminals: Terminal[];
  intercityTerminals: Terminal[];
}

// 터미널 이름 정규화 (슬러그용)
function normalizeTerminalName(name: string): string {
  return name
    .replace(/\(.*?\)/g, '')
    .replace(/\s+/g, '')
    .replace(/[^\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318Fa-zA-Z0-9]/g, '')
    .trim();
}

// 터미널 슬러그 생성
function createTerminalSlug(name: string): string {
  const normalized = normalizeTerminalName(name);
  if (normalized.endsWith('터미널') || normalized.endsWith('정류장') || normalized.endsWith('정류소')) {
    return normalized;
  }
  return normalized + '터미널';
}

// 노선 슬러그 생성
function createRouteSlug(depName: string, arrName: string): string {
  const dep = normalizeTerminalName(depName);
  const arr = normalizeTerminalName(arrName);
  return `${dep}-${arr}`;
}

export default function SearchForm({ expressTerminals, intercityTerminals }: Props) {
  const router = useRouter();
  const [busType, setBusType] = useState<'express' | 'intercity'>('express');
  const [departure, setDeparture] = useState('');
  const [arrival, setArrival] = useState('');
  const [error, setError] = useState('');

  // 현재 선택된 버스 유형에 따른 터미널 목록
  const currentTerminals = busType === 'express' ? expressTerminals : intercityTerminals;

  // 이름 기준 중복 제거 (같은 이름의 터미널은 첫 번째만 표시)
  const uniqueTerminals = currentTerminals.reduce<Terminal[]>((acc, terminal) => {
    if (!acc.find(t => t.terminalNm === terminal.terminalNm)) {
      acc.push(terminal);
    }
    return acc;
  }, []);

  const handleBusTypeChange = (type: 'express' | 'intercity') => {
    setBusType(type);
    setDeparture('');
    setArrival('');
    setError('');
  };

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
    
    // 선택된 터미널 이름 찾기
    const depTerminal = uniqueTerminals.find(t => t.terminalId === departure);
    const arrTerminal = uniqueTerminals.find(t => t.terminalId === arrival);
    
    if (!depTerminal || !arrTerminal) {
      setError('터미널 정보를 찾을 수 없습니다');
      return;
    }
    
    // 한글 슬러그로 URL 생성
    const routeSlug = createRouteSlug(depTerminal.terminalNm, arrTerminal.terminalNm);
    
    if (busType === 'express') {
      router.push(`/고속버스/시간표/노선/${routeSlug}`);
    } else {
      router.push(`/시외버스/시간표/노선/${routeSlug}`);
    }
  };

  return (
    <div>
      {/* 버스 유형 선택 탭 */}
      <div className="flex mb-6">
        <button
          onClick={() => handleBusTypeChange('express')}
          className={`flex-1 py-3 px-4 text-center font-bold rounded-l-xl border transition-all ${
            busType === 'express'
              ? 'bg-indigo-600 text-white border-indigo-600'
              : 'bg-gray-50 text-gray-600 border-gray-300 hover:bg-gray-100'
          }`}
        >
          🚌 고속버스
        </button>
        <button
          onClick={() => handleBusTypeChange('intercity')}
          className={`flex-1 py-3 px-4 text-center font-bold rounded-r-xl border-t border-r border-b transition-all ${
            busType === 'intercity'
              ? 'bg-slate-600 text-white border-slate-600'
              : 'bg-gray-50 text-gray-600 border-gray-300 hover:bg-gray-100'
          }`}
        >
          🚐 시외버스
        </button>
      </div>

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
              className={`w-full appearance-none border border-gray-300 rounded-xl p-4 pr-10 text-gray-900 focus:ring-2 transition-colors bg-gray-50 hover:bg-white text-lg ${
            busType === 'express'
              ? 'focus:ring-indigo-500 focus:border-indigo-500' 
              : 'focus:ring-slate-500 focus:border-slate-500'
              }`}
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
              className={`w-full appearance-none border border-gray-300 rounded-xl p-4 pr-10 text-gray-900 focus:ring-2 transition-colors bg-gray-50 hover:bg-white text-lg ${
            busType === 'express'
              ? 'focus:ring-indigo-500 focus:border-indigo-500' 
              : 'focus:ring-slate-500 focus:border-slate-500'
              }`}
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
            className={`w-full text-white py-4 rounded-xl font-bold text-lg transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 ${
              busType === 'express'
                ? 'bg-indigo-600 hover:bg-indigo-700'
                : 'bg-slate-600 hover:bg-slate-700'
            }`}
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
