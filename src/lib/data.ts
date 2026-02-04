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

const dataDir = path.join(process.cwd(), 'data');

// JSON 파일 로드 헬퍼
function loadJson<T>(filename: string): T | null {
  try {
    const filePath = path.join(dataDir, filename);
    if (!fs.existsSync(filePath)) {
      return null;
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
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

// 요금 포맷
export function formatCharge(charge: number): string {
  return charge.toLocaleString('ko-KR') + '원';
}

// 등급별 배지 클래스
export function getGradeBadgeClass(grade: string): string {
  if (grade.includes('프리미엄')) return 'badge-premium';
  if (grade.includes('우등')) return 'badge-deluxe';
  return 'badge-normal';
}
