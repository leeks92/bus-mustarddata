/**
 * 터미널 ID ↔ 한글 슬러그 매핑
 * SEO 최적화를 위한 URL 슬러그 생성
 */

import { getExpressTerminals, getIntercityTerminals } from './data';

// 터미널 이름 정규화 (슬러그용)
function normalizeTerminalName(name: string): string {
  return name
    .replace(/\(.*?\)/g, '') // 괄호 내용 제거: 센트럴시티(서울) → 센트럴시티
    .replace(/\s+/g, '') // 공백 제거
    .replace(/[^\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318Fa-zA-Z0-9]/g, '') // 특수문자 제거
    .trim();
}

// 터미널 이름에서 "터미널" 접미사 추가 (없는 경우)
function addTerminalSuffix(name: string): string {
  const normalized = normalizeTerminalName(name);
  if (normalized.endsWith('터미널') || normalized.endsWith('정류장') || normalized.endsWith('정류소')) {
    return normalized;
  }
  return normalized + '터미널';
}

// 슬러그 생성 (터미널용)
export function createTerminalSlug(terminalName: string): string {
  return addTerminalSuffix(terminalName);
}

// 노선 슬러그 생성 (출발-도착)
export function createRouteSlug(depName: string, arrName: string): string {
  const dep = normalizeTerminalName(depName);
  const arr = normalizeTerminalName(arrName);
  return `${dep}-${arr}`;
}

// 슬러그 → 터미널 ID 매핑 캐시
let expressSlugToIdMap: Map<string, string> | null = null;
let intercitySlugToIdMap: Map<string, string> | null = null;
let expressIdToSlugMap: Map<string, string> | null = null;
let intercityIdToSlugMap: Map<string, string> | null = null;

// 고속버스 슬러그 매핑 초기화
function initExpressSlugMaps() {
  if (expressSlugToIdMap && expressIdToSlugMap) return;
  
  expressSlugToIdMap = new Map();
  expressIdToSlugMap = new Map();
  
  const terminals = getExpressTerminals();
  const slugCount = new Map<string, number>();
  
  // 먼저 슬러그 중복 체크
  for (const terminal of terminals) {
    const slug = createTerminalSlug(terminal.terminalNm);
    slugCount.set(slug, (slugCount.get(slug) || 0) + 1);
  }
  
  // 매핑 생성 (중복 시 ID 추가)
  const usedSlugs = new Map<string, boolean>();
  for (const terminal of terminals) {
    let slug = createTerminalSlug(terminal.terminalNm);
    
    // 중복 슬러그인 경우 ID 일부 추가
    if ((slugCount.get(slug) || 0) > 1) {
      if (usedSlugs.has(slug)) {
        // 이미 사용된 슬러그면 ID 뒤 3자리 추가
        slug = `${slug}-${terminal.terminalId.slice(-3)}`;
      }
      usedSlugs.set(createTerminalSlug(terminal.terminalNm), true);
    }
    
    expressSlugToIdMap!.set(slug, terminal.terminalId);
    expressIdToSlugMap!.set(terminal.terminalId, slug);
  }
}

// 시외버스 슬러그 매핑 초기화
function initIntercitySlugMaps() {
  if (intercitySlugToIdMap && intercityIdToSlugMap) return;
  
  intercitySlugToIdMap = new Map();
  intercityIdToSlugMap = new Map();
  
  const terminals = getIntercityTerminals();
  const slugCount = new Map<string, number>();
  
  // 먼저 슬러그 중복 체크
  for (const terminal of terminals) {
    const slug = createTerminalSlug(terminal.terminalNm);
    slugCount.set(slug, (slugCount.get(slug) || 0) + 1);
  }
  
  // 매핑 생성 (중복 시 ID 추가)
  const usedSlugs = new Map<string, boolean>();
  for (const terminal of terminals) {
    let slug = createTerminalSlug(terminal.terminalNm);
    
    // 중복 슬러그인 경우 ID 일부 추가
    if ((slugCount.get(slug) || 0) > 1) {
      if (usedSlugs.has(slug)) {
        slug = `${slug}-${terminal.terminalId.slice(-4)}`;
      }
      usedSlugs.set(createTerminalSlug(terminal.terminalNm), true);
    }
    
    intercitySlugToIdMap!.set(slug, terminal.terminalId);
    intercityIdToSlugMap!.set(terminal.terminalId, slug);
  }
}

// 고속버스: 슬러그 → 터미널 ID
export function getExpressTerminalIdBySlug(slug: string): string | null {
  initExpressSlugMaps();
  return expressSlugToIdMap!.get(slug) || null;
}

// 고속버스: 터미널 ID → 슬러그
export function getExpressSlugByTerminalId(terminalId: string): string | null {
  initExpressSlugMaps();
  return expressIdToSlugMap!.get(terminalId) || null;
}

// 시외버스: 슬러그 → 터미널 ID
export function getIntercityTerminalIdBySlug(slug: string): string | null {
  initIntercitySlugMaps();
  return intercitySlugToIdMap!.get(slug) || null;
}

// 시외버스: 터미널 ID → 슬러그
export function getIntercitySlugByTerminalId(terminalId: string): string | null {
  initIntercitySlugMaps();
  return intercityIdToSlugMap!.get(terminalId) || null;
}

// 터미널 ID → 슬러그 (고속/시외 자동 판별)
export function getSlugByTerminalId(terminalId: string): string | null {
  // 고속버스 먼저 확인
  const expressSlug = getExpressSlugByTerminalId(terminalId);
  if (expressSlug) return expressSlug;
  
  // 시외버스 확인
  return getIntercitySlugByTerminalId(terminalId);
}

// 모든 고속버스 터미널 슬러그 목록
export function getAllExpressTerminalSlugs(): string[] {
  initExpressSlugMaps();
  return Array.from(expressIdToSlugMap!.values());
}

// 모든 시외버스 터미널 슬러그 목록
export function getAllIntercityTerminalSlugs(): string[] {
  initIntercitySlugMaps();
  return Array.from(intercityIdToSlugMap!.values());
}

// 노선 슬러그에서 터미널 ID 추출
export function parseRouteSlug(slug: string): { depSlug: string; arrSlug: string } | null {
  const parts = slug.split('-');
  if (parts.length < 2) return null;
  
  // "서울경부-대전복합" 형태에서 분리
  // 하이픈이 여러 개일 수 있으므로 마지막 터미널 이름 기준으로 분리
  // 예: "서울경부터미널-대전복합터미널"
  const lastTerminalIdx = slug.lastIndexOf('터미널-');
  if (lastTerminalIdx === -1) {
    // 터미널 접미사가 없는 경우 단순 분리
    const midIdx = Math.floor(parts.length / 2);
    return {
      depSlug: parts.slice(0, midIdx).join('-'),
      arrSlug: parts.slice(midIdx).join('-'),
    };
  }
  
  return {
    depSlug: slug.substring(0, lastTerminalIdx + 3), // "터미널" 포함
    arrSlug: slug.substring(lastTerminalIdx + 4), // "-" 이후
  };
}
