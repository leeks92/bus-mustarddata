import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
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
  openGraph: {
    title: '전국 고속버스·시외버스 시간표',
    description: '전국 버스 시간표와 요금 정보를 무료로 조회하세요.',
    type: 'website',
    locale: 'ko_KR',
  },
  robots: {
    index: true,
    follow: true,
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
