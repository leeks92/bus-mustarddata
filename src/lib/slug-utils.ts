/**
 * 터미널 이름 → 슬러그 변환 유틸리티 (클라이언트/서버 공용)
 * fs 모듈을 사용하지 않음
 */

// 터미널 이름 정규화 (슬러그용)
export function normalizeTerminalName(name: string): string {
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
