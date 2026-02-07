/**
 * 공항버스 데이터 수집 스크립트
 * 
 * 사용법: BUS_API_KEY=xxx npm run fetch-airport
 * 
 * 데이터 소스: 인천국제공항공사_버스정보 (B551177/BusInformation)
 * API 문서: https://www.data.go.kr/data/15095045/openapi.do
 * 
 * 수집 대상:
 * - 인천공항 T1, T2 공항버스 시간표 (airport-buses.json)
 * 
 * 지역 구분: 1:서울, 2:경기, 3:인천, 4:강원, 5:충청, 6:경상, 7:전라
 * 
 * ※ 이 API는 별도 서비스(B551177)로 기존 TAGO API(1613000)와 할당량 독립
 * 
 * 예상 API 호출: 7회 (지역별 1회씩)
 */

import {
  SERVICE_KEY,
  ensureDataDir, saveJson, delay,
  checkApiKey, updateMetadata,
} from './common';

// ===== 타입 정의 =====

interface AirportBusRaw {
  area: string;
  busnumber: string;
  toawfirst: string;
  toawlast: string;
  t1endfirst: string;
  t2endfirst: string;
  t1endlast: string;
  t2endlast: string;
  adultfare: string | number;
  busclass: string;
  cpname: string;
  t1wdayt: string;
  t1wt: string;
  t2wdayt: string;
  t2wt: string;
  routeinfo: string;
  t1ridelo: string;
  t2ridelo: string;
}

export interface AirportBus {
  busNumber: string;
  area: string;
  areaName: string;
  busClass: string;
  adultFare: number;
  company: string;
  routeInfo: string;
  t1: {
    weekdayTimes: string[];
    weekendTimes: string[];
    toAirportFirst: string;
    toAirportLast: string;
    toDestFirst: string;
    toDestLast: string;
    boarding: string;
  };
  t2: {
    weekdayTimes: string[];
    weekendTimes: string[];
    toAirportFirst: string;
    toAirportLast: string;
    toDestFirst: string;
    toDestLast: string;
    boarding: string;
  };
}

// ===== 상수 =====

const AIRPORT_API_URL = 'http://apis.data.go.kr/B551177/BusInformation';

const AREA_NAMES: Record<string, string> = {
  '1': '서울',
  '2': '경기',
  '3': '인천',
  '4': '강원',
  '5': '충청',
  '6': '경상',
  '7': '전라',
};

// ===== API 함수 =====

async function getAirportBuses(area: number): Promise<AirportBusRaw[]> {
  const url = `${AIRPORT_API_URL}/getBusInfo?serviceKey=${SERVICE_KEY}&numOfRows=100&pageNo=1&area=${area}&type=json`;

  try {
    const response = await fetch(url);
    const text = await response.text();

    if (text.includes('API token quota exceeded')) {
      console.error('\n⚠️  API 일일 호출 할당량 초과! 내일 다시 시도하세요.');
      process.exit(1);
    }

    if (text.includes('OpenAPI_ServiceResponse') || text.includes('SERVICE_ERROR')) {
      console.error(`지역 ${area} API Service Error`);
      return [];
    }

    if (text.startsWith('<?xml') || text.startsWith('<')) {
      // XML 응답인 경우 JSON으로 재요청
      console.warn(`지역 ${area}: XML 응답 수신, 재시도...`);
      return [];
    }

    if (!text || text.trim() === '') return [];

    const data = JSON.parse(text);

    if (data.response?.header?.resultCode !== '00') {
      console.error(`지역 ${area} API Error:`, data.response?.header?.resultCode, data.response?.header?.resultMsg);
      return [];
    }

    const items = data.response?.body?.items;
    if (!items) return [];

    // items가 빈 문자열인 경우 처리
    if (typeof items === 'string' && items.trim() === '') return [];

    // 이 API는 items가 { item: [...] } 형태가 아닌 배열(또는 인덱스 키 객체)로 반환됨
    if (Array.isArray(items)) {
      return items;
    }

    // items.item이 있는 경우 (표준 공공데이터 형식)
    if (items.item) {
      return Array.isArray(items.item) ? items.item : [items.item];
    }

    // items가 인덱스 키를 가진 객체인 경우 (이 API의 실제 응답 형식)
    const keys = Object.keys(items);
    if (keys.length > 0 && keys.every(k => /^\d+$/.test(k))) {
      return keys.map(k => items[k]);
    }

    return [];
  } catch (error) {
    console.error(`지역 ${area} Fetch error:`, error);
    return [];
  }
}

// ===== 변환 함수 =====

function parseTimes(timeStr: string): string[] {
  if (!timeStr || timeStr.trim() === '') return [];
  return timeStr
    .split(',')
    .map(t => t.trim())
    .filter(t => t.length > 0)
    .map(t => {
      // "0835" → "08:35", "835" → "08:35"
      const padded = t.padStart(4, '0');
      return `${padded.slice(0, 2)}:${padded.slice(2, 4)}`;
    });
}

function formatFirstLast(time: string | number): string {
  if (!time) return '';
  const str = String(time).trim();
  if (str.length === 0) return '';
  const padded = str.padStart(4, '0');
  return `${padded.slice(0, 2)}:${padded.slice(2, 4)}`;
}

function transformBus(raw: AirportBusRaw): AirportBus {
  const areaCode = String(raw.area);
  return {
    busNumber: String(raw.busnumber || '').trim(),
    area: areaCode,
    areaName: AREA_NAMES[areaCode] || `지역${areaCode}`,
    busClass: String(raw.busclass || '일반').trim(),
    adultFare: Number(raw.adultfare) || 0,
    company: String(raw.cpname || '').trim(),
    routeInfo: String(raw.routeinfo || '').trim(),
    t1: {
      weekdayTimes: parseTimes(String(raw.t1wdayt || '')),
      weekendTimes: parseTimes(String(raw.t1wt || '')),
      toAirportFirst: formatFirstLast(raw.toawfirst),
      toAirportLast: formatFirstLast(raw.toawlast),
      toDestFirst: formatFirstLast(raw.t1endfirst),
      toDestLast: formatFirstLast(raw.t1endlast),
      boarding: String(raw.t1ridelo || '').trim(),
    },
    t2: {
      weekdayTimes: parseTimes(String(raw.t2wdayt || '')),
      weekendTimes: parseTimes(String(raw.t2wt || '')),
      toAirportFirst: formatFirstLast(raw.toawfirst),
      toAirportLast: formatFirstLast(raw.toawlast),
      toDestFirst: formatFirstLast(raw.t2endfirst),
      toDestLast: formatFirstLast(raw.t2endlast),
      boarding: String(raw.t2ridelo || '').trim(),
    },
  };
}

// ===== 메인 =====

async function main() {
  checkApiKey();
  ensureDataDir();

  console.log('=== 공항버스 데이터 수집 시작 ===');
  console.log('데이터 소스: 인천국제공항공사_버스정보 (B551177)\n');

  const allBuses: AirportBus[] = [];
  const areas = [1, 2, 3, 4, 5, 6, 7];

  for (const area of areas) {
    const areaName = AREA_NAMES[String(area)];
    console.log(`[${area}/7] ${areaName} 지역 조회 중...`);

    const rawBuses = await getAirportBuses(area);
    if (rawBuses.length > 0) {
      const buses = rawBuses
        .filter(raw => raw.busnumber) // 버스번호가 없는 항목 제외
        .map(transformBus);
      allBuses.push(...buses);
      console.log(`  → ${buses.length}개 노선 수집 (원본 ${rawBuses.length}개 중 유효)`);
    } else {
      console.log(`  → 노선 없음`);
    }

    await delay(300);
  }

  // 버스번호 기준 정렬
  allBuses.sort((a, b) => a.busNumber.localeCompare(b.busNumber, 'ko', { numeric: true }));

  // 저장
  saveJson('airport-buses.json', allBuses);

  // 메타데이터 업데이트 (기존 필드 유지)
  updateMetadata({} as any);

  console.log(`\n=== 공항버스 데이터 수집 완료 ===`);
  console.log(`총 공항버스 노선: ${allBuses.length}개`);

  // 지역별 통계
  const byArea = new Map<string, number>();
  for (const bus of allBuses) {
    byArea.set(bus.areaName, (byArea.get(bus.areaName) || 0) + 1);
  }
  for (const [area, count] of byArea) {
    console.log(`  ${area}: ${count}개`);
  }
}

main().catch(console.error);
