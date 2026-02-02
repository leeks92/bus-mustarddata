/**
 * 공공 API에서 전체 버스 시간표 데이터를 수집하여 JSON 파일로 저장
 * 빌드 전에 실행하여 data/ 폴더에 저장
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
async function fetchApi<T>(url: string): Promise<T[]> {
  try {
    const response = await fetch(url);
    const text = await response.text();
    
    // XML 응답 체크
    if (text.startsWith('<?xml')) {
      console.error('XML response received, expected JSON');
      return [];
    }
    
    const data = JSON.parse(text);
    
    if (data.response?.header?.resultCode !== '00') {
      console.error('API Error:', data.response?.header?.resultMsg);
      return [];
    }
    
    const items = data.response?.body?.items?.item;
    if (!items) return [];
    
    return Array.isArray(items) ? items : [items];
  } catch (error) {
    console.error('Fetch error:', url, error);
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
  const url = `${EXPRESS_BASE_URL}/getExpBusTrminlList?serviceKey=${SERVICE_KEY}&numOfRows=500&_type=json`;
  return fetchApi<Terminal>(url);
}

// 시외버스 터미널 목록 조회
async function getIntercityTerminals(): Promise<Terminal[]> {
  console.log('Fetching intercity terminals...');
  const url = `${INTERCITY_BASE_URL}/getSuberbsBusTrminlList?serviceKey=${SERVICE_KEY}&numOfRows=1000&_type=json`;
  return fetchApi<Terminal>(url);
}

// 고속버스 도착지 목록 조회
async function getExpressArrivalTerminals(depTerminalId: string): Promise<Terminal[]> {
  const url = `${EXPRESS_BASE_URL}/getArrTrminlList?serviceKey=${SERVICE_KEY}&depTerminalId=${depTerminalId}&numOfRows=500&_type=json`;
  return fetchApi<Terminal>(url);
}

// 시외버스 도착지 목록 조회  
async function getIntercityArrivalTerminals(depTerminalId: string): Promise<Terminal[]> {
  const url = `${INTERCITY_BASE_URL}/getArrTrminlList?serviceKey=${SERVICE_KEY}&depTerminalId=${depTerminalId}&numOfRows=500&_type=json`;
  return fetchApi<Terminal>(url);
}

// 고속버스 시간표 조회
async function getExpressSchedules(
  depTerminalId: string,
  arrTerminalId: string,
  depDate: string
): Promise<BusSchedule[]> {
  const url = `${EXPRESS_BASE_URL}/getStrtpntAlocFndExpbusInfo?serviceKey=${SERVICE_KEY}&depTerminalId=${depTerminalId}&arrTerminalId=${arrTerminalId}&depPlandTime=${depDate}&numOfRows=100&_type=json`;
  return fetchApi<BusSchedule>(url);
}

// 시간 문자열 변환 (202301011030 -> 10:30)
function formatTime(timeStr: string): string {
  if (!timeStr || timeStr.length < 12) return '';
  const hour = timeStr.substring(8, 10);
  const minute = timeStr.substring(10, 12);
  return `${hour}:${minute}`;
}

// 터미널 ID에서 slug 생성
function createSlug(terminalId: string, terminalName: string): string {
  // 한글 이름 기반 slug 생성
  return terminalId;
}

async function main() {
  if (!SERVICE_KEY) {
    console.error('Error: BUS_API_KEY 환경 변수가 설정되지 않았습니다.');
    console.log('사용법: BUS_API_KEY=your_api_key npm run fetch-data');
    process.exit(1);
  }

  console.log('=== 버스 데이터 수집 시작 ===\n');
  
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // 1. 터미널 목록 조회
  const expressTerminals = await getExpressTerminals();
  console.log(`고속버스 터미널: ${expressTerminals.length}개`);
  
  await delay(500);
  
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
  console.log('\n=== 고속버스 노선 수집 ===');
  const expressRoutes: RouteData[] = [];
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  
  let expressCount = 0;
  for (const depTerminal of expressTerminals) {
    await delay(200); // API 호출 제한 대응
    
    const arrivals = await getExpressArrivalTerminals(depTerminal.terminalId);
    
    for (const arrTerminal of arrivals) {
      await delay(100);
      
      const schedules = await getExpressSchedules(
        depTerminal.terminalId,
        arrTerminal.terminalId,
        today
      );
      
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
        expressCount++;
        
        if (expressCount % 100 === 0) {
          console.log(`고속버스 노선 수집 중... ${expressCount}개`);
        }
      }
    }
  }
  
  console.log(`고속버스 총 노선: ${expressRoutes.length}개`);
  
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
  console.log(`최종 업데이트: ${metadata.lastUpdated}`);
}

main().catch(console.error);
