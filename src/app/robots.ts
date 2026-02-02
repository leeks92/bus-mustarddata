import type { MetadataRoute } from 'next';

// output: 'export' 호환을 위한 설정
export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: 'https://bus.mustarddata.com/sitemap.xml',
  };
}
