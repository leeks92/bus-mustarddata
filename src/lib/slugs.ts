/**
 * 터미널 ID ↔ 영문 슬러그 매핑
 * SEO 최적화를 위한 URL 슬러그 생성 (로마자 변환)
 */

import { getExpressTerminals, getIntercityTerminals } from './data';
import hangulRomanization from 'hangul-romanization';

// 터미널 이름 정규화 (슬러그용)
function normalizeTerminalName(name: string): string {
  return name
    .replace(/\(.*?\)/g, '') // 괄호 내용 제거: 센트럴시티(서울) → 센트럴시티
    .replace(/\s+/g, '') // 공백 제거
    .trim();
}

/**
 * 한글 이름을 영문 slug로 변환
 * 예: "서울경부" → "seoul-gyeongbu"
 *     "센트럴시티" → "senteurelsiti"
 *     "인천공항T1" → "incheongonghang-t1"
 */
function toRomanSlug(name: string): string {
  const normalized = normalizeTerminalName(name);

  // 영문/숫자와 한글을 분리하여 처리
  const parts: string[] = [];
  let current = '';
  let currentIsHangul = false;

  for (const char of normalized) {
    const isHangul = /[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/.test(char);
    const isAlphaNum = /[a-zA-Z0-9]/.test(char);

    if (isHangul) {
      if (!currentIsHangul && current) {
        parts.push(current.toLowerCase());
        current = '';
      }
      currentIsHangul = true;
      current += char;
    } else if (isAlphaNum) {
      if (currentIsHangul && current) {
        parts.push(hangulRomanization.convert(current));
        current = '';
      }
      currentIsHangul = false;
      current += char;
    }
    // 특수문자는 무시
  }

  // 남은 부분 처리
  if (current) {
    if (currentIsHangul) {
      parts.push(hangulRomanization.convert(current));
    } else {
      parts.push(current.toLowerCase());
    }
  }

  return parts.join('-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

// 슬러그 생성 (터미널용)
export function createTerminalSlug(terminalName: string): string {
  return toRomanSlug(terminalName);
}

// 노선 슬러그 생성 (출발-도착)
export function createRouteSlug(depName: string, arrName: string): string {
  const dep = toRomanSlug(depName);
  const arr = toRomanSlug(arrName);
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

// 노선 슬러그에서 출발/도착 슬러그 추출
// 로마자 슬러그는 하이픈이 많으므로 터미널 매핑으로 분리
export function parseRouteSlug(slug: string): { depSlug: string; arrSlug: string } | null {
  // 하이픈으로 가능한 모든 분리점을 시도
  const parts = slug.split('-');
  if (parts.length < 2) return null;

  // 모든 가능한 분리점에서 양쪽이 모두 유효한 터미널 슬러그인지 확인
  for (let i = 1; i < parts.length; i++) {
    const depSlug = parts.slice(0, i).join('-');
    const arrSlug = parts.slice(i).join('-');

    // 양쪽 모두 유효한 터미널 슬러그인지 확인
    if (depSlug && arrSlug) {
      return { depSlug, arrSlug };
    }
  }

  return null;
}
