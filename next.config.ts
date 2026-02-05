import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export', // GitHub Pages 정적 배포용
  images: {
    unoptimized: true, // GitHub Pages에서는 이미지 최적화 불가
  },
  trailingSlash: true, // GitHub Pages 호환성
  
  // 성능 최적화
  compress: true,
  poweredByHeader: false, // X-Powered-By 헤더 제거 (보안)
  
  // 실험적 기능
  experimental: {
    optimizeCss: true, // CSS 최적화
  },
  
  // 헤더 설정 (SEO & 캐싱)
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
