/**
 * 공공 API에서 전체 버스 시간표 데이터를 수집하여 JSON 파일로 저장
 * 빌드 전에 실행하여 data/ 폴더에 저장
 * 
 * 사용 API:
 * 1. ExpBusInfoService - 고속버스정보 (시간표 조회)
 * 2. ExpBusArrInfoService - 고속버스도착정보 (터미널 목록, 도착지 목록)
 * 3. SuburbsBusInfoService - 시외버스정보
 */

import * as fs from 'fs';
import * as path from 'path';

const SERVICE_KEY = process.env.BUS_API_KEY || '';

// API 엔드포인트
const EXPRESS_INFO_URL = 'http://apis.data.go.kr/1613000/ExpBusInfoService';
const EXPRESS_ARR_URL = 'http://apis.data.go.kr/1613000/ExpBusArrInfoService';
const INTERCITY_URL = 'http://apis.data.go.kr/1613000/SuburbsBusInfoService';

interface Terminal {
  terminalId: string;   // NAEK010 형식 (ExpBusInfoService용)
  terminalNm: string;
  cityName?: string;
}

interface TerminalShort {
  tmnCd: string;        // 010 형식 (ExpBusArrInfoService용)
  tmnNm: string;
}

interface ArrivalTerminal {
  arrTmnCd: string;     // 도착 터미널 코드 (3자리)
  arrTmnNm: string;     // 도착 터미널명
}

interface BusSchedule {
  routeId: string;
  depPlandTime: string;
  arrPlandTime: string;
  depPlaceNm: string;
  arrPlaceNm: string;
  gradeNm: string;
  charge: number;
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

// API 응답 처리
async function fetchApi<T>(url: string, silent: boolean = false): Promise<T[]> {
  try {
    const response = await fetch(url);
    const text = await response.text();
    
    // 에러 응답 체크 (XML 에러 메시지)
    if (text.includes('OpenAPI_ServiceResponse') || text.includes('SERVICE_ERROR')) {
      if (!silent) console.error('API Service Error');
      return [];
    }
    
    // XML 응답 체크
    if (text.startsWith('<?xml') || text.startsWith('<')) {
      if (!silent) console.error('Unexpected XML response');
      return [];
    }
    
    // 빈 응답 체크
    if (!text || text.trim() === '') {
      return [];
    }
    
    const data = JSON.parse(text);
    
    // API 에러 코드 체크
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

// 딜레이 함수
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ===== ExpBusArrInfoService API (도착정보 서비스) =====

// 고속버스 터미널 목록 조회 (3자리 코드 버전)
async function getExpBusTmnList(): Promise<TerminalShort[]> {
  console.log('Fetching express terminals (ExpBusArrInfoService)...');
  const url = `${EXPRESS_ARR_URL}/getExpBusTmnList?serviceKey=${SERVICE_KEY}&numOfRows=500&pageNo=1&_type=json`;
  return fetchApi<TerminalShort>(url);
}

// 출발지 기준 도착지 목록 조회
async function getArrTmnFromDepTmn(depTmnCd: string): Promise<ArrivalTerminal[]> {
  const url = `${EXPRESS_ARR_URL}/getArrTmnFromDepTmn?serviceKey=${SERVICE_KEY}&depTmnCd=${depTmnCd}&numOfRows=500&pageNo=1&_type=json`;
  return fetchApi<ArrivalTerminal>(url, true);
}

// ===== ExpBusInfoService API (고속버스정보 서비스) =====

// 고속버스 터미널 목록 조회 (NAEK 형식)
async function getExpressTerminals(): Promise<Terminal[]> {
  console.log('Fetching express terminals (ExpBusInfoService)...');
  const url = `${EXPRESS_INFO_URL}/getExpBusTrminlList?serviceKey=${SERVICE_KEY}&numOfRows=500&pageNo=1&_type=json`;
  return fetchApi<Terminal>(url);
}

// 고속버스 시간표 조회
async function getExpressSchedules(
  depTerminalId: string,
  arrTerminalId: string,
  depDate: string
): Promise<BusSchedule[]> {
  const url = `${EXPRESS_INFO_URL}/getStrtpntAlocFndExpbusInfo?serviceKey=${SERVICE_KEY}&depTerminalId=${depTerminalId}&arrTerminalId=${arrTerminalId}&depPlandTime=${depDate}&numOfRows=100&pageNo=1&_type=json`;
  return fetchApi<BusSchedule>(url, true);
}

// ===== SuburbsBusInfoService API (시외버스정보 서비스) =====

async function getIntercityTerminals(): Promise<Terminal[]> {
  console.log('Fetching intercity terminals...');
  const url = `${INTERCITY_URL}/getSuberbsBusTrminlList?serviceKey=${SERVICE_KEY}&numOfRows=1000&pageNo=1&_type=json`;
  return fetchApi<Terminal>(url);
}

// 시간 문자열 변환 (202301011030 -> 10:30)
function formatTime(timeStr: string): string {
  if (!timeStr || timeStr.length < 12) return '';
  const str = String(timeStr);
  const hour = str.substring(8, 10);
  const minute = str.substring(10, 12);
  return `${hour}:${minute}`;
}

// 3자리 코드 -> NAEK 형식 변환 (예: 010 -> NAEK010)
function shortCodeToFullId(shortCode: string): string {
  return `NAEK${shortCode}`;
}

async function main() {
  if (!SERVICE_KEY) {
    console.error('Error: BUS_API_KEY 환경 변수가 설정되지 않았습니다.');
    console.log('사용법: BUS_API_KEY=your_api_key npm run fetch-data');
    process.exit(1);
  }

  console.log('=== 버스 데이터 수집 시작 ===\n');
  console.log(`API Key: ${SERVICE_KEY.substring(0, 10)}...`);
  
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // 1. 터미널 목록 조회 (ExpBusArrInfoService - 3자리 코드)
  const shortTerminals = await getExpBusTmnList();
  console.log(`고속버스 터미널 (3자리 코드): ${shortTerminals.length}개`);
  
  if (shortTerminals.length === 0) {
    console.error('Error: 터미널 목록을 가져올 수 없습니다. API 키를 확인하세요.');
    process.exit(1);
  }
  
  await delay(300);

  // 2. 터미널 목록 조회 (ExpBusInfoService - NAEK 형식) - 저장용
  const expressTerminals = await getExpressTerminals();
  console.log(`고속버스 터미널 (NAEK 형식): ${expressTerminals.length}개`);
  
  await delay(300);
  
  // 시외버스 터미널
  const intercityTerminals = await getIntercityTerminals();
  console.log(`시외버스 터미널: ${intercityTerminals.length}개`);

  // 터미널 데이터 저장
  fs.writeFileSync(
    path.join(dataDir, 'express-terminals.json'),
    JSON.stringify(expressTerminals, null, 2)
  );
  fs.writeFileSync(
    path.join(dataDir, 'intercity-terminals.json'),
    JSON.stringify(intercityTerminals, null, 2)
  );

  // 3. 터미널 코드 매핑 생성 (3자리 코드 <-> NAEK 형식)
  // ExpBusArrInfoService의 tmnNm과 ExpBusInfoService의 terminalNm을 매칭
  const terminalMap = new Map<string, string>(); // 3자리코드 -> NAEK형식
  
  for (const short of shortTerminals) {
    // 이름으로 매칭 시도
    const matched = expressTerminals.find(t => 
      t.terminalNm.includes(short.tmnNm) || short.tmnNm.includes(t.terminalNm.replace(/터미널|종합|고속/g, ''))
    );
    if (matched) {
      terminalMap.set(short.tmnCd, matched.terminalId);
    } else {
      // 매칭 안되면 NAEK 형식으로 변환 시도
      terminalMap.set(short.tmnCd, shortCodeToFullId(short.tmnCd));
    }
  }
  
  console.log(`터미널 코드 매핑: ${terminalMap.size}개`);

  // 4. 고속버스 노선 수집 (도착지 목록 API 활용)
  console.log('\n=== 고속버스 노선 수집 ===');
  const expressRoutes: RouteData[] = [];
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  console.log(`조회 날짜: ${today}`);
  
  let terminalIndex = 0;
  const totalTerminals = shortTerminals.length;
  
  for (const depTerminal of shortTerminals) {
    terminalIndex++;
    await delay(100);
    
    // 출발지 기준 도착지 목록 조회
    const arrivals = await getArrTmnFromDepTmn(depTerminal.tmnCd);
    
    if (arrivals.length > 0) {
      console.log(`[${terminalIndex}/${totalTerminals}] ${depTerminal.tmnNm}: ${arrivals.length}개 도착지`);
      
      // 각 도착지별로 시간표 조회
      for (const arrival of arrivals) {
        await delay(50);
        
        // NAEK 형식 터미널 ID 찾기
        const depFullId = terminalMap.get(depTerminal.tmnCd) || shortCodeToFullId(depTerminal.tmnCd);
        const arrFullId = terminalMap.get(arrival.arrTmnCd) || shortCodeToFullId(arrival.arrTmnCd);
        
        const schedules = await getExpressSchedules(depFullId, arrFullId, today);
        
        if (schedules.length > 0) {
          expressRoutes.push({
            depTerminalId: depFullId,
            depTerminalName: depTerminal.tmnNm,
            arrTerminalId: arrFullId,
            arrTerminalName: arrival.arrTmnNm,
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
    
    // 진행 상황 (10개 터미널마다)
    if (terminalIndex % 10 === 0) {
      console.log(`진행: ${terminalIndex}/${totalTerminals} - 수집된 노선: ${expressRoutes.length}개`);
      
      // 중간 저장
      fs.writeFileSync(
        path.join(dataDir, 'express-routes.json'),
        JSON.stringify(expressRoutes, null, 2)
      );
    }
  }
  
  console.log(`\n고속버스 총 노선: ${expressRoutes.length}개`);
  
  // 최종 저장
  fs.writeFileSync(
    path.join(dataDir, 'express-routes.json'),
    JSON.stringify(expressRoutes, null, 2)
  );

  // 5. 메타데이터 저장
  const metadata = {
    lastUpdated: new Date().toISOString(),
    expressTerminalCount: expressTerminals.length,
    intercityTerminalCount: intercityTerminals.length,
    expressRouteCount: expressRoutes.length,
    intercityRouteCount: 0,
  };
  
  fs.writeFileSync(
    path.join(dataDir, 'metadata.json'),
    JSON.stringify(metadata, null, 2)
  );

  console.log('\n=== 데이터 수집 완료 ===');
  console.log(`저장 위치: ${dataDir}`);
  console.log(`고속버스 터미널: ${metadata.expressTerminalCount}개`);
  console.log(`고속버스 노선: ${metadata.expressRouteCount}개`);
  console.log(`최종 업데이트: ${metadata.lastUpdated}`);
}

main().catch(console.error);
