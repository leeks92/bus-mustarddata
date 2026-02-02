import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export', // GitHub Pages 정적 배포용
  images: {
    unoptimized: true, // GitHub Pages에서는 이미지 최적화 불가
  },
  trailingSlash: true, // GitHub Pages 호환성
};

export default nextConfig;
