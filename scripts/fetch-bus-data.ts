/**
 * 공공 API에서 전체 버스 시간표 데이터를 수집하여 JSON 파일로 저장
 * 빌드 전에 실행하여 data/ 폴더에 저장
 * 
 * API 문서 참고:
 * - 고속버스: ExpBusInfoService
 * - 시외버스: SuburbsBusInfoService
 */

import * as fs from 'fs';
import * as path from 'path';

const SERVICE_KEY = process.env.BUS_API_KEY || '';
const EXPRESS_BASE_URL = 'http://apis.data.go.kr/1613000/ExpBusInfoService';
const INTERCITY_BASE_URL = 'http://apis.data.go.kr/1613000/SuburbsBusInfoService';

interface Terminal {
  terminalId: string;
  terminalNm: string;
  cityName?: string;
  cityCode?: number;
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
    // JSON 파싱 에러는 조용히 처리 (노선이 없는 경우)
    if (!silent && !(error instanceof SyntaxError)) {
      console.error('Fetch error:', error);
    }
    return [];
  }
}

// 딜레이 함수 (API 호출 제한 대응)
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 고속버스 터미널 목록 조회
async function getExpressTerminals(): Promise<Terminal[]> {
  console.log('Fetching express terminals...');
  const url = `${EXPRESS_BASE_URL}/getExpBusTrminlList?serviceKey=${SERVICE_KEY}&numOfRows=500&pageNo=1&_type=json`;
  return fetchApi<Terminal>(url);
}

// 시외버스 터미널 목록 조회
async function getIntercityTerminals(): Promise<Terminal[]> {
  console.log('Fetching intercity terminals...');
  const url = `${INTERCITY_BASE_URL}/getSuberbsBusTrminlList?serviceKey=${SERVICE_KEY}&numOfRows=1000&pageNo=1&_type=json`;
  return fetchApi<Terminal>(url);
}

// 고속버스 시간표 조회 (출발-도착 기준)
async function getExpressSchedules(
  depTerminalId: string,
  arrTerminalId: string,
  depDate: string
): Promise<BusSchedule[]> {
  const url = `${EXPRESS_BASE_URL}/getStrtpntAlocFndExpbusInfo?serviceKey=${SERVICE_KEY}&depTerminalId=${depTerminalId}&arrTerminalId=${arrTerminalId}&depPlandTime=${depDate}&numOfRows=100&pageNo=1&_type=json`;
  return fetchApi<BusSchedule>(url, true); // silent mode - 노선 없으면 조용히 스킵
}

// 시외버스 시간표 조회 (출발-도착 기준) - 당일만 조회 가능
async function getIntercitySchedules(
  depTerminalId: string,
  arrTerminalId: string,
  depDate: string
): Promise<BusSchedule[]> {
  const url = `${INTERCITY_BASE_URL}/getStrtpntAlocFndSuberbsBusInfo?serviceKey=${SERVICE_KEY}&depTerminalId=${depTerminalId}&arrTerminalId=${arrTerminalId}&depPlandTime=${depDate}&numOfRows=100&pageNo=1&_type=json`;
  return fetchApi<BusSchedule>(url, true);
}

// 시간 문자열 변환 (202301011030 -> 10:30)
function formatTime(timeStr: string): string {
  if (!timeStr || timeStr.length < 12) return '';
  const str = String(timeStr);
  const hour = str.substring(8, 10);
  const minute = str.substring(10, 12);
  return `${hour}:${minute}`;
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

  // 1. 터미널 목록 조회
  const expressTerminals = await getExpressTerminals();
  console.log(`고속버스 터미널: ${expressTerminals.length}개`);
  
  if (expressTerminals.length === 0) {
    console.error('Error: 고속버스 터미널 목록을 가져올 수 없습니다. API 키를 확인하세요.');
    process.exit(1);
  }
  
  await delay(300);
  
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

  // 2. 고속버스 노선별 시간표 수집
  // 모든 터미널 조합을 시도 (도착지 목록 API가 없으므로)
  console.log('\n=== 고속버스 노선 수집 ===');
  const expressRoutes: RouteData[] = [];
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  console.log(`조회 날짜: ${today}`);
  
  const totalCombinations = expressTerminals.length * expressTerminals.length;
  console.log(`총 조합 수: ${totalCombinations} (${expressTerminals.length} x ${expressTerminals.length})`);
  
  let checkedCount = 0;
  let foundCount = 0;
  
  for (const depTerminal of expressTerminals) {
    for (const arrTerminal of expressTerminals) {
      // 같은 터미널은 스킵
      if (depTerminal.terminalId === arrTerminal.terminalId) {
        checkedCount++;
        continue;
      }
      
      await delay(50); // API 호출 제한 대응 (초당 30 TPS)
      
      const schedules = await getExpressSchedules(
        depTerminal.terminalId,
        arrTerminal.terminalId,
        today
      );
      
      checkedCount++;
      
      if (schedules.length > 0) {
        expressRoutes.push({
          depTerminalId: depTerminal.terminalId,
          depTerminalName: depTerminal.terminalNm,
          arrTerminalId: arrTerminal.terminalId,
          arrTerminalName: arrTerminal.terminalNm,
          schedules: schedules.map(s => ({
            depTime: formatTime(String(s.depPlandTime)),
            arrTime: formatTime(String(s.arrPlandTime)),
            grade: s.gradeNm || '일반',
            charge: s.charge || 0,
          })),
        });
        foundCount++;
      }
      
      // 진행 상황 출력 (1000개마다)
      if (checkedCount % 1000 === 0) {
        const progress = ((checkedCount / totalCombinations) * 100).toFixed(1);
        console.log(`진행: ${checkedCount}/${totalCombinations} (${progress}%) - 발견된 노선: ${foundCount}개`);
        
        // 중간 저장
        fs.writeFileSync(
          path.join(dataDir, 'express-routes.json'),
          JSON.stringify(expressRoutes, null, 2)
        );
      }
    }
  }
  
  console.log(`\n고속버스 총 노선: ${expressRoutes.length}개`);
  
  // 고속버스 노선 데이터 저장
  fs.writeFileSync(
    path.join(dataDir, 'express-routes.json'),
    JSON.stringify(expressRoutes, null, 2)
  );

  // 3. 메타데이터 저장
  const metadata = {
    lastUpdated: new Date().toISOString(),
    expressTerminalCount: expressTerminals.length,
    intercityTerminalCount: intercityTerminals.length,
    expressRouteCount: expressRoutes.length,
    intercityRouteCount: 0, // 시외버스는 당일만 조회 가능하여 별도 처리 필요
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
