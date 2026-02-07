/**
 * 터미널 이름 → 슬러그 변환 유틸리티 (클라이언트/서버 공용)
 * fs 모듈을 사용하지 않음
 * 한글 → 로마자 변환 기반 영문 슬러그
 */

import hangulRomanization from 'hangul-romanization';

// 터미널 이름 정규화 (슬러그용)
export function normalizeTerminalName(name: string): string {
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
  // 각 연속된 한글/영숫자 그룹을 변환
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
