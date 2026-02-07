# 전국 고속버스·시외버스·공항버스 시간표

전국 고속버스, 시외버스, 공항버스 시간표와 요금 정보를 제공하는 정적 웹사이트입니다.

## 🚌 주요 기능

- 전국 고속버스 터미널 시간표 조회
- 전국 시외버스 터미널 시간표 조회
- 공항버스 노선별 시간표 조회
- 노선별 요금 및 등급 정보
- 터미널 상세 정보 (주소, 전화번호, 편의시설, 교통 가이드)
- SEO 최적화된 정적 페이지

## 🛠️ 기술 스택

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS 4
- **Language**: TypeScript
- **Hosting**: GitHub Pages
- **Data Source**: 국토교통부 공공데이터 API (TAGO)

## 📁 프로젝트 구조

```
bus-mustarddata/
├── src/
│   ├── app/                    # Next.js App Router 페이지
│   │   ├── express/           # 고속버스 페이지
│   │   │   └── schedule/
│   │   │       ├── [terminal]/     # 터미널별 노선 목록
│   │   │       └── route/[route]/  # 노선별 시간표
│   │   ├── intercity/         # 시외버스 페이지
│   │   │   └── schedule/
│   │   │       ├── [terminal]/     # 터미널별 노선 목록
│   │   │       └── route/[route]/  # 노선별 시간표
│   │   ├── airport/           # 공항버스 페이지
│   │   │   └── schedule/
│   │   │       └── [busNumber]/    # 노선별 시간표
│   │   └── terminal/          # 터미널 상세 페이지
│   │       └── [terminal]/         # 터미널별 상세 정보
│   ├── components/            # 공통 컴포넌트
│   └── lib/                   # 유틸리티 함수
├── scripts/                   # 데이터 수집 스크립트
├── data/                      # 수집된 버스 데이터 (JSON)
└── .github/workflows/         # GitHub Actions
```

## 📄 페이지 구성

### 메인 페이지
- `/` - 메인 (검색, 인기 노선, 통계)
- `/express/schedule` - 고속버스 메인 (지역별 터미널 분류)
- `/intercity/schedule` - 시외버스 메인 (지역별 터미널 분류)
- `/airport/schedule` - 공항버스 메인 (지역별 노선 분류)
- `/terminal` - 터미널 목록 (탭 네비게이션)

### 동적 페이지
- `/express/schedule/[terminal]` - 고속버스 터미널별 노선 목록
- `/express/schedule/route/[route]` - 고속버스 노선별 시간표
- `/intercity/schedule/[terminal]` - 시외버스 터미널별 노선 목록
- `/intercity/schedule/route/[route]` - 시외버스 노선별 시간표
- `/airport/schedule/[busNumber]` - 공항버스 노선별 시간표
- `/terminal/[terminal]` - 터미널 상세 (주소, 전화번호, 편의시설, 교통 가이드)

### 기타 페이지
- `/not-found` - 404 페이지 (주요 링크 안내)

## 🚀 시작하기

### 환경 설정

1. 의존성 설치
```bash
npm install
```

2. 공공데이터 API 키 발급
   - [공공데이터포털](https://data.go.kr)에서 API 키 발급
   - 고속버스정보 서비스, 시외버스정보 서비스 활용 신청

3. 데이터 수집
```bash
BUS_API_KEY=your_api_key npm run fetch-data
```

4. 개발 서버 실행
```bash
npm run dev
```

### 빌드

```bash
npm run build
```

빌드 결과물은 `out/` 폴더에 정적 파일로 생성됩니다.

## 📦 데이터 수집

### 수동 수집
```bash
BUS_API_KEY=your_api_key npm run fetch-data
```

### 자동 수집 (GitHub Actions)
- 매주 일요일 자동 실행
- `BUS_API_KEY` secret 설정 필요

## 🌐 배포

GitHub Pages를 통해 자동 배포됩니다.

1. GitHub Secrets에 `BUS_API_KEY` 설정
2. Repository Settings → Pages → Source: GitHub Actions
3. `main` 브랜치 푸시 또는 수동 트리거

## 📊 사용하는 공공 API

- **고속버스정보 서비스** (ExpBusInfoService)
  - 터미널 목록 조회
  - 노선별 시간표 조회
  - 요금 정보 조회

- **시외버스정보 서비스** (SuburbsBusInfoService)
  - 터미널 목록 조회
  - 노선별 시간표 조회 (당일만 가능)

- **공항버스정보 서비스**
  - 노선 목록 조회
  - 노선별 시간표 조회

## 📝 라이선스

MIT License

## 🔗 관련 서비스

- [calc.mustarddata.com](https://calc.mustarddata.com) - 금융 계산기
- [apt.mustarddata.com](https://apt.mustarddata.com) - 부동산 실거래가
- [mustarddata.com](https://mustarddata.com) - 메인 블로그
