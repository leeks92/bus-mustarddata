import * as fs from 'fs';
import * as path from 'path';

interface Terminal {
  terminalId: string;
  terminalNm: string;
  cityName?: string;
  cityCode?: number;
}

interface RouteData {
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

interface Metadata {
  lastUpdated: string;
  expressTerminalCount: number;
  intercityTerminalCount: number;
  expressRouteCount: number;
  intercityRouteCount: number;
}

export interface AirportBus {
  busNumber: string;
  area: string;
  areaName: string;
  busClass: string;
  adultFare: number;
  company: string;
  routeInfo: string;
  t1: {
    weekdayTimes: string[];
    weekendTimes: string[];
    toAirportFirst: string;
    toAirportLast: string;
    toDestFirst: string;
    toDestLast: string;
    boarding: string;
  };
  t2: {
    weekdayTimes: string[];
    weekendTimes: string[];
    toAirportFirst: string;
    toAirportLast: string;
    toDestFirst: string;
    toDestLast: string;
    boarding: string;
  };
}

const dataDir = path.join(process.cwd(), 'data');

// 모듈 레벨 캐시 (빌드 시 동일 파일 반복 읽기 방지)
const cache = new Map<string, unknown>();

// JSON 파일 로드 헬퍼 (캐시 적용)
function loadJson<T>(filename: string): T | null {
  if (cache.has(filename)) {
    return cache.get(filename) as T;
  }
  try {
    const filePath = path.join(dataDir, filename);
    if (!fs.existsSync(filePath)) {
      return null;
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(content) as T;
    cache.set(filename, parsed);
    return parsed;
  } catch (error) {
    console.error(`Error loading ${filename}:`, error);
    return null;
  }
}

// 고속버스 터미널 목록
export function getExpressTerminals(): Terminal[] {
  return loadJson<Terminal[]>('express-terminals.json') || [];
}

// 시외버스 터미널 목록
export function getIntercityTerminals(): Terminal[] {
  return loadJson<Terminal[]>('intercity-terminals.json') || [];
}

// 고속버스 노선 목록
export function getExpressRoutes(): RouteData[] {
  return loadJson<RouteData[]>('express-routes.json') || [];
}

// 시외버스 노선 목록
export function getIntercityRoutes(): RouteData[] {
  return loadJson<RouteData[]>('intercity-routes.json') || [];
}

// 모든 노선 (고속 + 시외)
export function getAllRoutes(): RouteData[] {
  return [...getExpressRoutes(), ...getIntercityRoutes()];
}

// 메타데이터
export function getMetadata(): Metadata | null {
  return loadJson<Metadata>('metadata.json');
}

// 특정 노선 조회 (고속버스)
export function getExpressRoute(
  depTerminalId: string,
  arrTerminalId: string
): RouteData | null {
  const routes = getExpressRoutes();
  return (
    routes.find(
      r => r.depTerminalId === depTerminalId && r.arrTerminalId === arrTerminalId
    ) || null
  );
}

// 특정 노선 조회 (시외버스)
export function getIntercityRoute(
  depTerminalId: string,
  arrTerminalId: string
): RouteData | null {
  const routes = getIntercityRoutes();
  return (
    routes.find(
      r => r.depTerminalId === depTerminalId && r.arrTerminalId === arrTerminalId
    ) || null
  );
}

// 특정 노선 조회 (고속 + 시외)
export function getRoute(
  depTerminalId: string,
  arrTerminalId: string
): RouteData | null {
  return getExpressRoute(depTerminalId, arrTerminalId) || 
         getIntercityRoute(depTerminalId, arrTerminalId);
}

// 터미널별 출발 노선 목록 (고속 + 시외)
export function getRoutesFromTerminal(terminalId: string): RouteData[] {
  const expressRoutes = getExpressRoutes();
  const intercityRoutes = getIntercityRoutes();
  const allRoutes = [...expressRoutes, ...intercityRoutes];
  return allRoutes.filter(r => r.depTerminalId === terminalId);
}

// 터미널 정보 조회
export function getTerminal(terminalId: string): Terminal | null {
  const express = getExpressTerminals();
  const intercity = getIntercityTerminals();
  const all = [...express, ...intercity];
  return all.find(t => t.terminalId === terminalId) || null;
}

// 모든 고속버스 노선 조합 (정적 페이지 생성용)
export function getAllRouteParams(): { departure: string; arrival: string }[] {
  const routes = getExpressRoutes();
  return routes.map(r => ({
    departure: r.depTerminalId,
    arrival: r.arrTerminalId,
  }));
}

// 모든 시외버스 노선 조합 (정적 페이지 생성용)
export function getAllIntercityRouteParams(): { departure: string; arrival: string }[] {
  const routes = getIntercityRoutes();
  return routes.map(r => ({
    departure: r.depTerminalId,
    arrival: r.arrTerminalId,
  }));
}

// 모든 터미널 ID (정적 페이지 생성용)
export function getAllTerminalIds(): string[] {
  const express = getExpressTerminals();
  const intercity = getIntercityTerminals();
  const all = [...express, ...intercity];
  return [...new Set(all.map(t => t.terminalId))];
}

// 요금 포맷 (0원이면 '요금 미제공' 표시)
export function formatCharge(charge: number): string {
  if (!charge || charge <= 0) return '요금 미제공';
  return charge.toLocaleString('ko-KR') + '원';
}

// 유효한 최소 요금 (0원 제외)
export function getValidMinCharge(schedules: { charge: number }[]): number {
  const validCharges = schedules.map(s => s.charge).filter(c => c > 0);
  return validCharges.length > 0 ? Math.min(...validCharges) : 0;
}

// 유효한 최대 요금 (0원 제외)
export function getValidMaxCharge(schedules: { charge: number }[]): number {
  const validCharges = schedules.map(s => s.charge).filter(c => c > 0);
  return validCharges.length > 0 ? Math.max(...validCharges) : 0;
}

// 노선이 있는 터미널 수 (통계용 - 출발 터미널 기준, 이름 중복 제거)
export function getActiveTerminalCount(): { express: number; intercity: number } {
  const expressRoutes = getExpressRoutes();
  const intercityRoutes = getIntercityRoutes();
  const expressTerminals = getExpressTerminals();
  const intercityTerminals = getIntercityTerminals();

  const expressDepIds = new Set(expressRoutes.map(r => r.depTerminalId));
  const intercityDepIds = new Set(intercityRoutes.map(r => r.depTerminalId));

  // 이름 기준 중복 제거 후, 출발 노선이 있는 터미널만 카운트
  const seenExpress = new Set<string>();
  let expressCount = 0;
  for (const t of expressTerminals) {
    if (!seenExpress.has(t.terminalNm) && expressDepIds.has(t.terminalId)) {
      seenExpress.add(t.terminalNm);
      expressCount++;
    }
  }

  const seenIntercity = new Set<string>();
  let intercityCount = 0;
  for (const t of intercityTerminals) {
    if (!seenIntercity.has(t.terminalNm) && intercityDepIds.has(t.terminalId)) {
      seenIntercity.add(t.terminalNm);
      intercityCount++;
    }
  }

  return { express: expressCount, intercity: intercityCount };
}

// 공항버스 목록
export function getAirportBuses(): AirportBus[] {
  return loadJson<AirportBus[]>('airport-buses.json') || [];
}

// 공항버스 지역별 조회
export function getAirportBusesByArea(area: string): AirportBus[] {
  return getAirportBuses().filter(b => b.areaName === area);
}

// 공항버스 특정 노선 조회
export function getAirportBusByNumber(busNumber: string): AirportBus | null {
  return getAirportBuses().find(b => b.busNumber === busNumber) || null;
}

// 등급별 배지 클래스
export function getGradeBadgeClass(grade: string): string {
  if (grade.includes('프리미엄')) return 'badge-premium';
  if (grade.includes('우등')) return 'badge-deluxe';
  return 'badge-normal';
}
