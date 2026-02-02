// 터미널 정보
export interface Terminal {
  terminalId: string;
  terminalName: string;
  cityName: string;
  cityCode: number;
}

// 버스 노선 정보 (시간표)
export interface BusSchedule {
  routeId: string;
  depTerminalId: string;
  depTerminalName: string;
  arrTerminalId: string;
  arrTerminalName: string;
  depTime: string; // HHMM 형식
  arrTime: string; // HHMM 형식
  gradeId: string;
  gradeName: string; // 일반, 우등, 프리미엄
  charge: number; // 요금 (원)
}

// 노선별 시간표 그룹
export interface RouteSchedule {
  departure: Terminal;
  arrival: Terminal;
  schedules: BusSchedule[];
  busType: 'express' | 'intercity';
}

// 지역(도시) 정보
export interface City {
  cityCode: number;
  cityName: string;
}

// 버스 등급
export interface BusGrade {
  gradeId: string;
  gradeName: string;
}

// API 응답 타입
export interface ApiResponse<T> {
  response: {
    header: {
      resultCode: string;
      resultMsg: string;
    };
    body: {
      items: {
        item: T | T[];
      };
      numOfRows: number;
      pageNo: number;
      totalCount: number;
    };
  };
}

// 정적 데이터 저장용
export interface BusData {
  expressTerminals: Terminal[];
  intercityTerminals: Terminal[];
  expressRoutes: RouteSchedule[];
  intercityRoutes: RouteSchedule[];
  cities: City[];
  lastUpdated: string;
}
