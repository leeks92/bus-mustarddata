/**
 * 시외버스 데이터 수집 스크립트
 * 
 * 사용법: BUS_API_KEY=xxx npm run fetch-intercity
 * 
 * ⚠️ 주의사항:
 * - 시외버스 API는 "당일 배차정보"만 제공 (미래 날짜 조회 불가)
 * - 반드시 오전 시간(06:00~10:00)에 실행해야 최대한 많은 노선 수집 가능
 * - 심야에 실행하면 이미 출발한 버스가 제외되어 노선이 거의 안 잡힘
 * - 고속버스 스크립트(fetch-express)와 별도 날짜에 실행 권장 (API 할당량)
 * 
 * 수집 대상:
 * - 시외버스 노선 + 시간표 (intercity-routes.json)
 * 
 * 수집 전략:
 * - "도착지 목록 조회" API가 없으므로 출발지×도착지 조합을 직접 조회
 * - 주요 터미널 174개 × 174개 = ~30,000 조합
 * - 기존 데이터를 병합 (신규 노선만 추가, 기존 노선은 시간표 업데이트)
 * 
 * 예상 소요: 약 30분
 * 예상 API 호출: 약 30,000회
 */

import {
  type Terminal, type RouteData,
  SERVICE_KEY, INTERCITY_URL,
  ensureDataDir, saveJson, loadJson, delay, formatTime, getTodayStr,
  checkApiKey, fetchApi, updateMetadata,
} from './common';

// ===== 시외버스 API 함수 =====

async function getIntercityTerminals(): Promise<Terminal[]> {
  console.log('시외버스 터미널 목록 조회...');
  const url = `${INTERCITY_URL}/getSuberbsBusTrminlList?serviceKey=${SERVICE_KEY}&numOfRows=1000&pageNo=1&_type=json`;
  return fetchApi<Terminal>(url);
}

async function getIntercitySchedules(depId: string, arrId: string, date: string) {
  const url = `${INTERCITY_URL}/getStrtpntAlocFndSuberbsBusInfo?serviceKey=${SERVICE_KEY}&depTerminalId=${depId}&arrTerminalId=${arrId}&depPlandTime=${date}&numOfRows=100&pageNo=1&_type=json`;
  return fetchApi<import('./common').BusSchedule>(url, true);
}

// ===== 주요 터미널 정의 =====

const MAJOR_INTERCITY_IDS = new Set([
  // 서울·수도권
  'NAI0511601',  // 동서울
  'NAI0671801',  // 서울남부
  'NAI0162503',  // 수락터미널(도심공항)
  'NAI0654501',  // 서울고속버스터미널(경부)
  'NAI0654601',  // 센트럴
  'NAI2224201',  // 인천
  'NAI2238201',  // 인천공항1터미널
  'NAI2238202',  // 인천공항2터미널
  'NAI0550201',  // 잠실역
  'NAI0616401',  // 코엑스(도심공항)
  'NAI0636201',  // 수서역
  'NAI0750501',  // 김포공항
  'NAI0619501',  // 노원
  // 경기
  'NAI1174901',  // 의정부
  'NAI1045001',  // 고양(백석)
  'NAI1194401',  // 구리
  'NAI1706301',  // 용인
  'NAI1737301',  // 이천
  'NAI1758501',  // 안성
  'NAI1791901',  // 평택
  'NAI1787001',  // 용이동
  'NAI1242001',  // 가평
  'NAI1697301',  // 신갈(수원)
  // 강원
  'NAI2443501',  // 춘천
  'NAI2482701',  // 속초
  'NAI2503101',  // 양양
  'NAI2463501',  // 인제
  'NAI2461201',  // 원통
  'NAI2452401',  // 양구
  'NAI2573501',  // 동해
  'NAI2592901',  // 삼척
  'NAI2600701',  // 태백
  // 충북
  'NAI2839701',  // 청주
  'NAI2812001',  // 청주북부터미널
  'NAI2848501',  // 북청주
  'NAI2814201',  // 청주공항
  'NAI2746901',  // 교통대
  'NAI2891101',  // 보은
  'NAI2914101',  // 영동
  'NAI2903301',  // 옥천
  'NAI2769501',  // 음성
  'NAI2803301',  // 괴산
  'NAI2793101',  // 증평
  'NAI2783101',  // 진천
  // 충남·세종
  'NAI3112001',  // 천안
  'NAI3151704',  // 아산(온양)
  'NAI3198101',  // 서산
  'NAI3214401',  // 태안
  'NAI3177101',  // 당진
  'NAI3295401',  // 논산
  'NAI3258501',  // 공주
  'NAI3345801',  // 보령(대천)
  'NAI3222001',  // 홍성
  'NAI3315201',  // 부여
  'NAI3273501',  // 금산
  'NAI3332601',  // 청양
  'NAI3216401',  // 안면도
  'NAI3240601',  // 덕산스파
  'NAI3242801',  // 예산
  'NAI3241601',  // 내포시
  'NAI3015401',  // 세종
  'NAI3002601',  // 조치원
  'NAI3147001',  // 천안아산(KTX)역
  'NAI3364501',  // 서천
  // 대전
  'NAI3455101',  // 대전복합
  'NAI3498701',  // 대전서남부
  'NAI3417501',  // 유성
  'NAI3520501',  // 대전청사
  'NAI3405501',  // 대전도룡
  'NAI3403801',  // 북대전IC
  'NAI3463901',  // 대전신흥
  // 전북
  'NAI5576001',  // 남원
  'NAI5615801',  // 정읍
  'NAI5643301',  // 고창
  'NAI5630801',  // 부안
  'NAI5592801',  // 임실
  'NAI5563201',  // 장수
  'NAI5561401',  // 장계
  'NAI5551501',  // 무주
  'NAI5603501',  // 순창
  // 전남
  'NAI6193701',  // 광주(유·스퀘어)
  'NAI5796001',  // 순천
  'NAI5971501',  // 여수
  'NAI5775801',  // 광양
  'NAI5825501',  // 나주
  'NAI5734401',  // 담양
  'NAI5841101',  // 영암
  'NAI5812001',  // 화순
  'NAI5945801',  // 보성
  'NAI5942301',  // 벌교
  'NAI5932401',  // 장흥
  'NAI5955501',  // 녹동
  'NAI5954001',  // 고흥
  'NAI5704301',  // 영광
  'NAI5715301',  // 함평
  'NAI5765401',  // 구례
  'NAI5754201',  // 곡성
  // 경북
  'NAI4124601',  // 동대구
  'NAI4248201',  // 대구서부
  'NAI4171101',  // 대구북부
  'NAI3815701',  // 경주시외
  'NAI3923301',  // 구미
  'NAI3958601',  // 김천
  'NAI3607801',  // 영주
  'NAI3888501',  // 영천
  'NAI4002701',  // 성주
  'NAI3643101',  // 영덕
  'NAI3632601',  // 울진
  // 경남
  'NAI4620401',  // 부산동부
  'NAI4696901',  // 부산서부(사상)
  'NAI4809501',  // 부산해운대
  'NAI4773401',  // 부산동래
  'NAI5139301',  // 창원
  'NAI5135601',  // 마산
  'NAI5170301',  // 진해
  'NAI5093801',  // 김해
  'NAI4472001',  // 울산
  'NAI4463201',  // 울산신복
  'NAI5023301',  // 합천
  'NAI5213801',  // 의령
  'NAI5003901',  // 함양
]);

const NAME_PATTERNS = [
  '동서울', '서울남부', '수락', '인천', '인천공항',
  '춘천', '속초', '강릉', '원주',
  '청주', '충주', '제천',
  '천안', '아산', '서산', '당진', '논산', '공주', '보령', '홍성', '태안', '부여', '세종', '조치원',
  '대전', '유성',
  '전주', '익산', '군산', '남원', '정읍',
  '광주', '순천', '여수', '목포', '광양', '나주', '담양',
  '대구', '경주', '포항', '구미', '안동', '영주', '김천',
  '부산', '울산', '창원', '마산', '진해', '김해', '진주', '통영',
];

function getMajorTerminals(allTerminals: Terminal[]): Terminal[] {
  const ids = new Set(MAJOR_INTERCITY_IDS);
  const result = allTerminals.filter(t => ids.has(t.terminalId));

  // 이름 패턴으로 추가
  for (const terminal of allTerminals) {
    if (ids.has(terminal.terminalId)) continue;
    if (NAME_PATTERNS.some(p => terminal.terminalNm.includes(p))) {
      result.push(terminal);
      ids.add(terminal.terminalId);
    }
  }

  // 중복 제거
  return [...new Map(result.map(t => [t.terminalId, t])).values()];
}

// ===== 메인 =====

async function main() {
  checkApiKey();
  ensureDataDir();

  // 시간대 경고
  const hour = new Date().getHours();
  if (hour >= 20 || hour < 5) {
    console.warn('⚠️  현재 심야 시간대입니다. 시외버스 API는 당일 배차정보만 제공하므로');
    console.warn('   오전 6~10시에 실행하는 것이 가장 많은 노선을 수집할 수 있습니다.');
    console.warn('   계속 진행합니다...\n');
  }

  console.log('=== 시외버스 데이터 수집 시작 ===');
  console.log('※ 시외버스 API는 당일 배차정보만 제공합니다.\n');

  // 1. 터미널 목록 조회
  const allTerminals = await getIntercityTerminals();
  console.log(`시외버스 터미널 전체: ${allTerminals.length}개`);

  // 터미널 목록 저장
  saveJson('intercity-terminals.json', allTerminals);

  // 2. 주요 터미널 선별
  const majorTerminals = getMajorTerminals(allTerminals);
  console.log(`주요 터미널: ${majorTerminals.length}개`);
  console.log(`총 조합 수: ~${majorTerminals.length * majorTerminals.length}`);
  console.log(`예상 소요: ~${Math.round(majorTerminals.length * majorTerminals.length * 60 / 1000 / 60)}분\n`);

  // 3. 기존 데이터 로드 (병합용)
  const existingRoutes = loadJson<RouteData[]>('intercity-routes.json') || [];
  const routeSet = new Set<string>();
  const routes: RouteData[] = [];

  // 기존 데이터 유지 (키만 등록, 새로 수집된 데이터로 업데이트됨)
  for (const r of existingRoutes) {
    routeSet.add(`${r.depTerminalId}-${r.arrTerminalId}`);
  }
  console.log(`기존 노선 데이터: ${existingRoutes.length}개 (병합 대상)\n`);

  const today = getTodayStr();
  console.log(`조회 날짜: ${today}`);

  // 4. 노선 수집
  let idx = 0;
  let apiCalls = 0;
  const startTime = Date.now();

  for (const dep of majorTerminals) {
    idx++;

    for (const arr of majorTerminals) {
      if (dep.terminalId === arr.terminalId) continue;

      await delay(50);
      apiCalls++;

      const schedules = await getIntercitySchedules(dep.terminalId, arr.terminalId, today);

      if (schedules.length > 0) {
        const key = `${dep.terminalId}-${arr.terminalId}`;
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

    if (idx % 10 === 0) {
      const elapsed = Math.round((Date.now() - startTime) / 1000 / 60);
      console.log(`진행: ${idx}/${majorTerminals.length} 출발지 - API: ${apiCalls}회 - 노선: ${routes.length}개 (${elapsed}분 경과)`);
      
      // 중간 저장 (신규 + 기존 병합)
      const merged = mergeRoutes(existingRoutes, routes);
      saveJson('intercity-routes.json', merged);
    }
  }

  // 5. 최종 병합 및 저장
  const finalRoutes = mergeRoutes(existingRoutes, routes);
  saveJson('intercity-routes.json', finalRoutes);

  updateMetadata({
    intercityTerminalCount: allTerminals.length,
    intercityRouteCount: finalRoutes.length,
  });

  const totalMinutes = Math.round((Date.now() - startTime) / 1000 / 60);
  console.log('\n=== 시외버스 데이터 수집 완료 ===');
  console.log(`신규 수집: ${routes.length}개`);
  console.log(`기존 유지: ${existingRoutes.length}개`);
  console.log(`최종 노선: ${finalRoutes.length}개`);
  console.log(`API 호출: ${apiCalls}회`);
  console.log(`소요 시간: ${totalMinutes}분`);
}

/** 기존 데이터와 신규 데이터 병합 (동일 노선은 신규로 교체) */
function mergeRoutes(existing: RouteData[], newRoutes: RouteData[]): RouteData[] {
  const map = new Map<string, RouteData>();

  // 기존 데이터 먼저 등록
  for (const r of existing) {
    map.set(`${r.depTerminalId}-${r.arrTerminalId}`, r);
  }

  // 신규 데이터로 덮어쓰기 (시간표 업데이트)
  for (const r of newRoutes) {
    map.set(`${r.depTerminalId}-${r.arrTerminalId}`, r);
  }

  return [...map.values()];
}

main().catch(console.error);
