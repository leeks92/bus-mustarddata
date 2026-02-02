import type {
  Terminal,
  BusSchedule,
  City,
  BusGrade,
  ApiResponse,
} from './types';

const SERVICE_KEY = process.env.BUS_API_KEY || '';
const EXPRESS_BASE_URL = 'http://apis.data.go.kr/1613000/ExpBusInfoService';
const INTERCITY_BASE_URL = 'http://apis.data.go.kr/1613000/SuburbsBusInfoService';

// API 호출 헬퍼
async function fetchApi<T>(url: string): Promise<T[]> {
  try {
    const response = await fetch(url);
    const data: ApiResponse<T> = await response.json();

    if (data.response.header.resultCode !== '00') {
      console.error('API Error:', data.response.header.resultMsg);
      return [];
    }

    const items = data.response.body.items?.item;
    if (!items) return [];

    return Array.isArray(items) ? items : [items];
  } catch (error) {
    console.error('Fetch error:', error);
    return [];
  }
}

// 고속버스 터미널 목록 조회
export async function getExpressTerminals(): Promise<Terminal[]> {
  const url = `${EXPRESS_BASE_URL}/getExpBusTrminlList?serviceKey=${SERVICE_KEY}&numOfRows=1000&_type=json`;
  return fetchApi<Terminal>(url);
}

// 시외버스 터미널 목록 조회
export async function getIntercityTerminals(): Promise<Terminal[]> {
  const url = `${INTERCITY_BASE_URL}/getSuberbsBusTrminlList?serviceKey=${SERVICE_KEY}&numOfRows=1000&_type=json`;
  return fetchApi<Terminal>(url);
}

// 도시 코드 목록 조회
export async function getCities(): Promise<City[]> {
  const url = `${EXPRESS_BASE_URL}/getCtyCodeList?serviceKey=${SERVICE_KEY}&numOfRows=100&_type=json`;
  return fetchApi<City>(url);
}

// 고속버스 등급 목록 조회
export async function getExpressGrades(): Promise<BusGrade[]> {
  const url = `${EXPRESS_BASE_URL}/getExpBusGradList?serviceKey=${SERVICE_KEY}&numOfRows=100&_type=json`;
  return fetchApi<BusGrade>(url);
}

// 고속버스 시간표 조회 (출발-도착 기준)
export async function getExpressSchedules(
  depTerminalId: string,
  arrTerminalId: string,
  depDate: string // YYYYMMDD
): Promise<BusSchedule[]> {
  const url = `${EXPRESS_BASE_URL}/getStrtpntAlocFndExpbusInfo?serviceKey=${SERVICE_KEY}&depTerminalId=${depTerminalId}&arrTerminalId=${arrTerminalId}&depPlandTime=${depDate}&numOfRows=100&_type=json`;
  return fetchApi<BusSchedule>(url);
}

// 시외버스 시간표 조회 (출발-도착 기준)
// 주의: 시외버스는 당일만 조회 가능
export async function getIntercitySchedules(
  depTerminalId: string,
  arrTerminalId: string,
  depDate: string // YYYYMMDD
): Promise<BusSchedule[]> {
  const url = `${INTERCITY_BASE_URL}/getStrtpntAlocFndSuberbsBusInfo?serviceKey=${SERVICE_KEY}&depTerminalId=${depTerminalId}&arrTerminalId=${arrTerminalId}&depPlandTime=${depDate}&numOfRows=100&_type=json`;
  return fetchApi<BusSchedule>(url);
}

// 고속버스 도착지 목록 조회 (출발 터미널 기준)
export async function getExpressArrivalTerminals(
  depTerminalId: string
): Promise<Terminal[]> {
  const url = `${EXPRESS_BASE_URL}/getArrTrminlList?serviceKey=${SERVICE_KEY}&depTerminalId=${depTerminalId}&numOfRows=500&_type=json`;
  return fetchApi<Terminal>(url);
}

// 시외버스 도착지 목록 조회 (출발 터미널 기준)
export async function getIntercityArrivalTerminals(
  depTerminalId: string
): Promise<Terminal[]> {
  const url = `${INTERCITY_BASE_URL}/getArrTrminlList?serviceKey=${SERVICE_KEY}&depTerminalId=${depTerminalId}&numOfRows=500&_type=json`;
  return fetchApi<Terminal>(url);
}
