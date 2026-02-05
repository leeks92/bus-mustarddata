import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const BASE_URL = 'https://bus.mustarddata.com';
const GA_ID = 'G-LLZSJL8J5X'; // Google Analytics 측정 ID

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#2563eb',
};

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: '전국 고속버스·시외버스 시간표 조회 - 요금, 소요시간, 첫차 막차',
    template: '%s | 버스 시간표',
  },
  description:
    '전국 고속버스, 시외버스 시간표와 요금 정보를 무료로 조회하세요. 서울, 부산, 대구, 대전, 광주, 강릉 등 전국 터미널 운행 정보, 첫차·막차 시간, 버스 요금 비교. 고속버스통합예매(KOBUS), 버스타고 예매 안내.',
  keywords: [
    '고속버스 시간표',
    '시외버스 시간표',
    '버스 요금',
    '버스 터미널',
    '서울 부산 버스',
    '서울 강릉 버스',
    '서울 대전 버스',
    '서울 광주 버스',
    '동서울 강릉 버스',
    '고속버스 예매',
    '시외버스 예매',
    '버스 첫차',
    '버스 막차',
    '고속버스 요금',
    '시외버스 요금',
    'KOBUS',
    '버스타고',
    '고속버스 터미널',
    '시외버스 터미널',
  ],
  alternates: {
    canonical: BASE_URL,
    types: {
      'application/rss+xml': `${BASE_URL}/feed.xml`,
    },
  },
  openGraph: {
    title: '전국 고속버스·시외버스 시간표 - 요금, 첫차, 막차 조회',
    description: '전국 버스 시간표와 요금 정보를 무료로 조회하세요. 서울, 부산, 대구, 대전, 광주, 강릉 등 전국 터미널 운행 정보 제공.',
    type: 'website',
    locale: 'ko_KR',
    url: BASE_URL,
    siteName: '전국 버스 시간표',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: '전국 고속버스 시외버스 시간표 조회',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '전국 고속버스·시외버스 시간표',
    description: '전국 버스 시간표와 요금 정보를 무료로 조회하세요.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  // Google Search Console 인증: 루트 도메인(mustarddata.com)에서 상속됨
  category: '교통',
  creator: 'MustardData',
  publisher: 'MustardData',
  formatDetection: {
    telephone: true,
    date: true,
    address: true,
    email: false,
  },
  other: {
    'naver-site-verification': 'ba1ae0526ca8b81db47476c81df03aff8de31f39',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="google-adsense-account" content="ca-pub-9325661912203986" />
        {/* 네이버 서치어드바이저 */}
        <meta name="naver-site-verification" content="ba1ae0526ca8b81db47476c81df03aff8de31f39" />
        {/* 네이버 SEO 최적화 메타태그 */}
        <meta name="NaverBot" content="All" />
        <meta name="NaverBot" content="index,follow" />
        <meta name="Yeti" content="All" />
        <meta name="Yeti" content="index,follow" />
        {/* 다음 SEO */}
        <meta name="daumsa" content="index,follow" />
        {/* 모바일 최적화 */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="버스 시간표" />
        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://www.kobus.co.kr" />
      </head>
      <body className="min-h-screen flex flex-col">
        {/* Google Analytics */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}', {
              page_title: document.title,
              page_location: window.location.href,
            });
          `}
        </Script>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
