/**
 * 고속버스 데이터 수집 스크립트
 * 
 * 사용법: BUS_API_KEY=xxx npm run fetch-express
 * 
 * 수집 대상:
 * - 고속버스 터미널 목록 (express-terminals.json)
 * - 고속버스 노선 + 시간표 (express-routes.json)
 * 
 * 수집 방식:
 * 1. ExpBusArrInfoService의 도착지 목록 API로 효율적 노선 발견
 * 2. 주요 터미널 간 직접 조회로 누락 노선 보완
 * 
 * 예상 소요: 약 20분
 * 예상 API 호출: 약 5,000~8,000회
 */

import {
  type Terminal, type TerminalShort, type ArrivalTerminal, type RouteData,
  SERVICE_KEY, ARR_SERVICE_KEY,
  EXPRESS_INFO_URL, EXPRESS_ARR_URL, INTERCITY_URL,
  ensureDataDir, saveJson, delay, formatTime, shortCodeToFullId, getTodayStr,
  checkApiKey, fetchApi, updateMetadata,
} from './common';

// ===== 고속버스 API 함수 =====

async function getExpBusTmnList(): Promise<TerminalShort[]> {
  console.log('고속버스 터미널 목록 조회 (ExpBusArrInfoService)...');
  const url = `${EXPRESS_ARR_URL}/getExpBusTmnList?serviceKey=${ARR_SERVICE_KEY}&numOfRows=500&pageNo=1&_type=json`;

  try {
    const response = await fetch(url);
    const text = await response.text();

    if (text.includes('OpenAPI_ServiceResponse') || text.includes('SERVICE_ERROR')) {
      console.error('API Service Error');
      return [];
    }
    if (text.startsWith('<?xml') || text.startsWith('<')) {
      console.error('Unexpected XML response');
      return [];
    }

    const data = JSON.parse(text);
    if (data.response?.header?.resultCode !== '00') {
      console.error('API Error:', data.response?.header?.resultCode);
      return [];
    }

    const items = data.response?.body?.items?.item;
    if (!items) return [];
    return Array.isArray(items) ? items : [items];
  } catch (error) {
    console.error('Fetch error:', error);
    return [];
  }
}

async function getArrTmnFromDepTmn(depTmnCd: string): Promise<ArrivalTerminal[]> {
  const url = `${EXPRESS_ARR_URL}/getArrTmnFromDepTmn?serviceKey=${ARR_SERVICE_KEY}&depTmnCd=${depTmnCd}&numOfRows=500&pageNo=1&_type=json`;
  return fetchApi<ArrivalTerminal>(url, true);
}

async function getExpressTerminals(): Promise<Terminal[]> {
  console.log('고속버스 터미널 목록 조회 (ExpBusInfoService)...');
  const url = `${EXPRESS_INFO_URL}/getExpBusTrminlList?serviceKey=${SERVICE_KEY}&numOfRows=500&pageNo=1&_type=json`;
  return fetchApi<Terminal>(url);
}

async function getExpressSchedules(depId: string, arrId: string, date: string) {
  const url = `${EXPRESS_INFO_URL}/getStrtpntAlocFndExpbusInfo?serviceKey=${SERVICE_KEY}&depTerminalId=${depId}&arrTerminalId=${arrId}&depPlandTime=${date}&numOfRows=100&pageNo=1&_type=json`;
  return fetchApi<import('./common').BusSchedule>(url, true);
}

// 시외버스 터미널도 함께 갱신 (터미널 목록만, 노선은 별도 스크립트)
async function getIntercityTerminals(): Promise<Terminal[]> {
  console.log('시외버스 터미널 목록 조회...');
  const url = `${INTERCITY_URL}/getSuberbsBusTrminlList?serviceKey=${SERVICE_KEY}&numOfRows=1000&pageNo=1&_type=json`;
  return fetchApi<Terminal>(url);
}

// ===== 메인 =====

async function main() {
  checkApiKey();
  ensureDataDir();

  console.log('=== 고속버스 데이터 수집 시작 ===\n');

  // 1. 터미널 목록 조회
  const shortTerminals = await getExpBusTmnList();
  console.log(`고속버스 터미널 (3자리 코드): ${shortTerminals.length}개`);

  if (shortTerminals.length === 0) {
    console.error('Error: 터미널 목록을 가져올 수 없습니다. API 키를 확인하세요.');
    process.exit(1);
  }

  await delay(300);

  const expressTerminals = await getExpressTerminals();
  console.log(`고속버스 터미널 (NAEK 형식): ${expressTerminals.length}개`);
  await delay(300);

  // 시외버스 터미널 목록도 함께 갱신
  const intercityTerminals = await getIntercityTerminals();
  console.log(`시외버스 터미널: ${intercityTerminals.length}개`);

  // 터미널 데이터 저장
  saveJson('express-terminals.json', expressTerminals);
  saveJson('intercity-terminals.json', intercityTerminals);

  // 2. 터미널 코드 매핑 생성
  const terminalMap = new Map<string, string>();
  for (const short of shortTerminals) {
    const matched = expressTerminals.find(t =>
      t.terminalNm.includes(short.tmnNm) || short.tmnNm.includes(t.terminalNm.replace(/터미널|종합|고속/g, ''))
    );
    if (matched) {
      terminalMap.set(short.tmnCd, matched.terminalId);
    } else {
      terminalMap.set(short.tmnCd, shortCodeToFullId(short.tmnCd));
    }
  }
  console.log(`터미널 코드 매핑: ${terminalMap.size}개`);

  // 3. 노선 수집
  const routes: RouteData[] = [];
  const routeSet = new Set<string>();
  const today = getTodayStr();
  console.log(`\n조회 날짜: ${today}`);

  // 방식 1: 도착지 목록 API
  console.log('\n--- 방식 1: 도착지 목록 API 활용 ---');
  let idx = 0;
  for (const dep of shortTerminals) {
    idx++;
    await delay(100);
    const arrivals = await getArrTmnFromDepTmn(dep.tmnCd);

    if (arrivals.length > 0) {
      console.log(`[${idx}/${shortTerminals.length}] ${dep.tmnNm}: ${arrivals.length}개 도착지`);
      for (const arr of arrivals) {
        await delay(50);
        const depFullId = terminalMap.get(dep.tmnCd) || shortCodeToFullId(dep.tmnCd);
        const arrFullId = terminalMap.get(arr.arrTmnCd) || shortCodeToFullId(arr.arrTmnCd);
        const key = `${depFullId}-${arrFullId}`;
        if (routeSet.has(key)) continue;

        const schedules = await getExpressSchedules(depFullId, arrFullId, today);
        if (schedules.length > 0) {
          routeSet.add(key);
          routes.push({
            depTerminalId: depFullId,
            depTerminalName: dep.tmnNm,
            arrTerminalId: arrFullId,
            arrTerminalName: arr.arrTmnNm,
            schedules: schedules.map(s => ({
              depTime: formatTime(String(s.depPlandTime)),
              arrTime: formatTime(String(s.arrPlandTime)),
              grade: s.gradeNm || '일반',
              charge: s.charge || 0,
            })),
          });
        }
      }
    }

    if (idx % 10 === 0) {
      console.log(`진행: ${idx}/${shortTerminals.length} - 수집된 노선: ${routes.length}개`);
    }
  }
  console.log(`방식 1 완료: ${routes.length}개 노선`);
  saveJson('express-routes.json', routes);

  // 방식 2: 주요 터미널 직접 조회
  console.log('\n--- 방식 2: 주요 터미널 직접 조회 ---');
  const majorTerminals = expressTerminals.filter(t =>
    ['서울', '부산', '대구', '대전', '광주', '인천', '울산', '센트럴', '동서울',
     '수원', '성남', '청주', '전주', '천안', '창원', '포항', '경주', '강릉',
     '춘천', '원주', '제주'].some(name => t.terminalNm.includes(name))
  );
  console.log(`주요 터미널: ${majorTerminals.length}개`);

  let majorIdx = 0;
  for (const dep of majorTerminals) {
    majorIdx++;
    for (const arr of expressTerminals) {
      if (dep.terminalId === arr.terminalId) continue;
      const key = `${dep.terminalId}-${arr.terminalId}`;
      if (routeSet.has(key)) continue;
      await delay(30);

      const schedules = await getExpressSchedules(dep.terminalId, arr.terminalId, today);
      if (schedules.length > 0) {
        routeSet.add(key);
        routes.push({
          depTerminalId: dep.terminalId,
          depTerminalName: dep.terminalNm,
          arrTerminalId: arr.terminalId,
          arrTerminalName: arr.terminalNm,
          schedules: schedules.map(s => ({
            depTime: formatTime(String(s.depPlandTime)),
            arrTime: formatTime(String(s.arrPlandTime)),
            grade: s.gradeNm || '일반',
            charge: s.charge || 0,
          })),
        });
      }
    }

    if (majorIdx % 5 === 0) {
      console.log(`주요 터미널 진행: ${majorIdx}/${majorTerminals.length} - 총 노선: ${routes.length}개`);
      saveJson('express-routes.json', routes);
    }
  }

  // 최종 저장
  saveJson('express-routes.json', routes);
  updateMetadata({
    expressTerminalCount: expressTerminals.length,
    intercityTerminalCount: intercityTerminals.length,
    expressRouteCount: routes.length,
  });

  console.log('\n=== 고속버스 데이터 수집 완료 ===');
  console.log(`고속버스 터미널: ${expressTerminals.length}개`);
  console.log(`고속버스 노선: ${routes.length}개`);
}

main().catch(console.error);
