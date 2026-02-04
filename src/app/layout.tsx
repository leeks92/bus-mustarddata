import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const BASE_URL = 'https://bus.mustarddata.com';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: '전국 고속버스·시외버스 시간표 - 버스 운행정보 조회',
    template: '%s | 전국 버스 시간표',
  },
  description:
    '전국 고속버스, 시외버스 시간표와 요금 정보를 무료로 조회하세요. 서울, 부산, 대구, 대전, 강릉 등 전국 터미널 운행 정보 제공.',
  keywords: [
    '고속버스 시간표',
    '시외버스 시간표',
    '버스 요금',
    '터미널',
    '서울 부산 버스',
    '서울 강릉 버스',
  ],
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    title: '전국 고속버스·시외버스 시간표',
    description: '전국 버스 시간표와 요금 정보를 무료로 조회하세요.',
    type: 'website',
    locale: 'ko_KR',
    url: BASE_URL,
    siteName: '버스 시간표 - mustarddata',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: '전국 버스 시간표',
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
  verification: {
    google: 'YOUR_GOOGLE_VERIFICATION_CODE', // Google Search Console에서 발급받은 코드로 교체
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
        <meta name="google-adsense-account" content="ca-pub-9325661912203986" />
        <meta name="naver-site-verification" content="ba1ae0526ca8b81db47476c81df03aff8de31f39" />
      </head>
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
