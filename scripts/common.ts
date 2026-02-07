/**
 * 버스 데이터 수집 공통 유틸리티
 * - 타입 정의
 * - API 호출 헬퍼
 * - 포맷 함수
 */

import * as fs from 'fs';
import * as path from 'path';

// ===== 타입 정의 =====

export interface Terminal {
  terminalId: string;
  terminalNm: string;
  cityName?: string;
}

export interface TerminalShort {
  tmnCd: string;
  tmnNm: string;
}

export interface ArrivalTerminal {
  arrTmnCd: string;
  arrTmnNm: string;
}

export interface BusSchedule {
  routeId: string;
  depPlandTime: string;
  arrPlandTime: string;
  depPlaceNm: string;
  arrPlaceNm: string;
  gradeNm: string;
  charge: number;
}

export interface RouteData {
  depTerminalId: string;
  depTerminalName: string;
  arrTerminalId: string;
  arrTerminalName: string;
  schedules: {
    depTime: string;
    arrTime: string;
    grade: string;
    charge: number;
  }[];
}

export interface Metadata {
  lastUpdated: string;
  expressTerminalCount: number;
  intercityTerminalCount: number;
  expressRouteCount: number;
  intercityRouteCount: number;
}

// ===== 환경 변수 =====

export const SERVICE_KEY = process.env.BUS_API_KEY || '';
export const ARR_SERVICE_KEY = process.env.BUS_ARR_API_KEY || SERVICE_KEY;

// ===== API 엔드포인트 =====

export const EXPRESS_INFO_URL = 'http://apis.data.go.kr/1613000/ExpBusInfoService';
export const EXPRESS_ARR_URL = 'http://apis.data.go.kr/1613000/ExpBusArrInfoService';
export const INTERCITY_URL = 'http://apis.data.go.kr/1613000/SuburbsBusInfoService';

// ===== 유틸 함수 =====

export const DATA_DIR = path.join(process.cwd(), 'data');

export function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function saveJson(filename: string, data: unknown): void {
  fs.writeFileSync(path.join(DATA_DIR, filename), JSON.stringify(data, null, 2));
}

export function loadJson<T>(filename: string): T | null {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as T;
}

export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/** 시간 문자열 변환 (202301011030 -> 10:30) */
export function formatTime(timeStr: string): string {
  if (!timeStr || timeStr.length < 12) return '';
  const str = String(timeStr);
  return `${str.substring(8, 10)}:${str.substring(10, 12)}`;
}

/** 3자리 코드 -> NAEK 형식 변환 */
export function shortCodeToFullId(shortCode: string): string {
  return `NAEK${shortCode}`;
}

/** 오늘 날짜 (YYYYMMDD) */
export function getTodayStr(): string {
  return new Date().toISOString().slice(0, 10).replace(/-/g, '');
}

export function checkApiKey(): void {
  if (!SERVICE_KEY) {
    console.error('Error: BUS_API_KEY 환경 변수가 설정되지 않았습니다.');
    console.log('사용법: BUS_API_KEY=your_api_key npm run fetch-express');
    process.exit(1);
  }
}

// ===== API 호출 =====

export async function fetchApi<T>(url: string, silent: boolean = false): Promise<T[]> {
  try {
    const response = await fetch(url);
    const text = await response.text();

    if (text.includes('OpenAPI_ServiceResponse') || text.includes('SERVICE_ERROR')) {
      if (!silent) console.error('API Service Error');
      return [];
    }

    if (text.includes('API token quota exceeded')) {
      console.error('\n⚠️  API 일일 호출 할당량 초과! 내일 다시 시도하세요.');
      process.exit(1);
    }

    if (text.startsWith('<?xml') || text.startsWith('<')) {
      if (!silent) console.error('Unexpected XML response');
      return [];
    }

    if (!text || text.trim() === '') return [];

    const data = JSON.parse(text);

    if (data.response?.header?.resultCode !== '00') {
      if (!silent) {
        console.error('API Error:', data.response?.header?.resultCode, data.response?.header?.resultMsg);
      }
      return [];
    }

    const items = data.response?.body?.items?.item;
    if (!items) return [];

    return Array.isArray(items) ? items : [items];
  } catch (error) {
    if (!silent && !(error instanceof SyntaxError)) {
      console.error('Fetch error:', error);
    }
    return [];
  }
}

/** 메타데이터 업데이트 (기존 값 유지 + 전달된 필드만 덮어쓰기) */
export function updateMetadata(updates: Partial<Metadata>): void {
  const existing = loadJson<Metadata>('metadata.json') || {
    lastUpdated: '',
    expressTerminalCount: 0,
    intercityTerminalCount: 0,
    expressRouteCount: 0,
    intercityRouteCount: 0,
  };

  const merged: Metadata = {
    ...existing,
    ...updates,
    lastUpdated: new Date().toISOString(),
  };

  saveJson('metadata.json', merged);
}
