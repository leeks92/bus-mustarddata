'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createRouteSlug } from '@/lib/slug-utils';

interface Terminal {
  terminalId: string;
  terminalNm: string;
}

interface Props {
  expressTerminals: Terminal[];
  intercityTerminals: Terminal[];
}

// 검색 가능한 커스텀 드롭다운 컴포넌트
function SearchableSelect({
  terminals,
  value,
  onChange,
  placeholder,
  accentColor,
}: {
  terminals: Terminal[];
  value: string;
  onChange: (id: string) => void;
  placeholder: string;
  accentColor: 'indigo' | 'slate';
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlightIndex, setHighlightIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selectedTerminal = terminals.find(t => t.terminalId === value);

  // 검색 필터
  const filtered = query
    ? terminals.filter(t =>
        t.terminalNm.toLowerCase().includes(query.toLowerCase())
      )
    : terminals;

  // 외부 클릭 시 닫기
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setQuery('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 하이라이트 인덱스 변경 시 스크롤
  useEffect(() => {
    if (listRef.current && isOpen) {
      const item = listRef.current.children[highlightIndex] as HTMLElement;
      if (item) {
        item.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightIndex, isOpen]);

  const open = useCallback(() => {
    setIsOpen(true);
    setHighlightIndex(0);
    setTimeout(() => inputRef.current?.focus(), 0);
  }, []);

  const select = useCallback((id: string) => {
    onChange(id);
    setIsOpen(false);
    setQuery('');
  }, [onChange]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault();
        open();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightIndex(i => Math.min(i + 1, filtered.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightIndex(i => Math.max(i - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (filtered[highlightIndex]) {
          select(filtered[highlightIndex].terminalId);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setQuery('');
        break;
    }
  };

  const ringColor = accentColor === 'indigo' ? 'ring-indigo-500' : 'ring-slate-500';
  const borderFocus = accentColor === 'indigo' ? 'border-indigo-400' : 'border-slate-400';
  const hoverBg = accentColor === 'indigo' ? 'bg-indigo-50' : 'bg-slate-50';
  const activeBg = accentColor === 'indigo' ? 'bg-indigo-600' : 'bg-slate-600';

  return (
    <div ref={containerRef} className="relative">
      {/* 선택 버튼 (닫혀있을 때) */}
      <button
        type="button"
        onClick={open}
        onKeyDown={handleKeyDown}
        className={`w-full text-left border rounded-xl p-4 pr-10 transition-all bg-white hover:border-gray-400 ${
          isOpen ? `ring-2 ${ringColor} ${borderFocus}` : 'border-gray-300'
        } ${value ? 'text-gray-900' : 'text-gray-400'}`}
      >
        <span className="block truncate text-base">
          {selectedTerminal ? selectedTerminal.terminalNm : placeholder}
        </span>
        <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>

      {/* 드롭다운 패널 */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* 검색 입력 */}
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setHighlightIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder="터미널 검색..."
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 bg-gray-50 placeholder-gray-400"
                autoComplete="off"
              />
              {query && (
                <button
                  onClick={() => {
                    setQuery('');
                    inputRef.current?.focus();
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* 결과 목록 */}
          <ul ref={listRef} className="max-h-60 overflow-y-auto py-1 overscroll-contain">
            {filtered.length === 0 ? (
              <li className="px-4 py-8 text-center text-sm text-gray-400">
                <svg className="w-8 h-8 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                &apos;{query}&apos; 검색 결과가 없습니다
              </li>
            ) : (
              filtered.map((terminal, idx) => {
                const isSelected = terminal.terminalId === value;
                const isHighlighted = idx === highlightIndex;
                return (
                  <li
                    key={terminal.terminalId}
                    onClick={() => select(terminal.terminalId)}
                    onMouseEnter={() => setHighlightIndex(idx)}
                    className={`px-4 py-2.5 cursor-pointer text-sm flex items-center justify-between transition-colors ${
                      isSelected
                        ? `${activeBg} text-white`
                        : isHighlighted
                          ? `${hoverBg} text-gray-900`
                          : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="truncate">{terminal.terminalNm}</span>
                    {isSelected && (
                      <svg className="w-4 h-4 flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </li>
                );
              })
            )}
          </ul>

          {/* 결과 수 */}
          {query && filtered.length > 0 && (
            <div className="px-4 py-2 border-t border-gray-100 text-xs text-gray-400">
              {filtered.length}개 터미널
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SearchForm({ expressTerminals, intercityTerminals }: Props) {
  const router = useRouter();
  const [busType, setBusType] = useState<'express' | 'intercity'>('express');
  const [departure, setDeparture] = useState('');
  const [arrival, setArrival] = useState('');
  const [error, setError] = useState('');

  // 현재 선택된 버스 유형에 따른 터미널 목록
  const currentTerminals = busType === 'express' ? expressTerminals : intercityTerminals;

  // 이름 기준 중복 제거 + 이름순 정렬
  const uniqueTerminals = currentTerminals
    .reduce<Terminal[]>((acc, terminal) => {
      if (!acc.find(t => t.terminalNm === terminal.terminalNm)) {
        acc.push(terminal);
      }
      return acc;
    }, [])
    .sort((a, b) => a.terminalNm.localeCompare(b.terminalNm, 'ko'));

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
    
    const depTerminal = uniqueTerminals.find(t => t.terminalId === departure);
    const arrTerminal = uniqueTerminals.find(t => t.terminalId === arrival);
    
    if (!depTerminal || !arrTerminal) {
      setError('터미널 정보를 찾을 수 없습니다');
      return;
    }
    
    const routeSlug = createRouteSlug(depTerminal.terminalNm, arrTerminal.terminalNm);
    
    if (busType === 'express') {
      router.push(`/express/schedule/route/${routeSlug}`);
    } else {
      router.push(`/intercity/schedule/route/${routeSlug}`);
    }
  };

  const accentColor = busType === 'express' ? 'indigo' : 'slate';

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
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">출발지</label>
          <SearchableSelect
            terminals={uniqueTerminals}
            value={departure}
            onChange={(id) => { setDeparture(id); setError(''); }}
            placeholder="터미널 검색 또는 선택"
            accentColor={accentColor}
          />
        </div>
        
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">도착지</label>
          <SearchableSelect
            terminals={uniqueTerminals}
            value={arrival}
            onChange={(id) => { setArrival(id); setError(''); }}
            placeholder="터미널 검색 또는 선택"
            accentColor={accentColor}
          />
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
