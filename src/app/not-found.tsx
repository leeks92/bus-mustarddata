'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

/**
 * 이전 URL 구조에서 새 URL 구조로 리다이렉트 처리
 */
function normalizeTerminalName(name: string): string {
  return name
    .replace(/\(.*?\)/g, '') // 괄호 내용 제거
    .replace(/\s+/g, '') // 공백 제거
    .replace(/[^\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318Fa-zA-Z0-9]/g, ''); // 특수문자 제거
}

function addTerminalSuffix(name: string): string {
  const normalized = normalizeTerminalName(name);
  if (normalized.endsWith('터미널') || normalized.endsWith('정류장') || normalized.endsWith('정류소')) {
    return normalized;
  }
  return normalized + '터미널';
}

function getRedirectUrl(pathname: string): string | null {
  // /express/... → /고속버스/시간표/...
  if (pathname.startsWith('/express')) {
    const subPath = pathname.replace(/^\/express\/?/, '').replace(/\/$/, '');
    const parts = subPath.split('/').filter(Boolean);
    
    if (parts.length === 0) {
      return '/고속버스/시간표';
    } else if (parts.length === 1) {
      const terminal = decodeURIComponent(parts[0]);
      const slug = addTerminalSuffix(terminal);
      return `/고속버스/시간표/${encodeURIComponent(slug)}`;
    } else if (parts.length >= 2) {
      const dep = normalizeTerminalName(decodeURIComponent(parts[0]));
      const arr = normalizeTerminalName(decodeURIComponent(parts[1]));
      return `/고속버스/시간표/노선/${encodeURIComponent(`${dep}-${arr}`)}`;
    }
  }
  
  // /intercity/... → /시외버스/시간표/...
  if (pathname.startsWith('/intercity')) {
    const subPath = pathname.replace(/^\/intercity\/?/, '').replace(/\/$/, '');
    const parts = subPath.split('/').filter(Boolean);
    
    if (parts.length === 0) {
      return '/시외버스/시간표';
    } else if (parts.length === 1) {
      const terminal = decodeURIComponent(parts[0]);
      const slug = addTerminalSuffix(terminal);
      return `/시외버스/시간표/${encodeURIComponent(slug)}`;
    } else if (parts.length >= 2) {
      const dep = normalizeTerminalName(decodeURIComponent(parts[0]));
      const arr = normalizeTerminalName(decodeURIComponent(parts[1]));
      return `/시외버스/시간표/노선/${encodeURIComponent(`${dep}-${arr}`)}`;
    }
  }
  
  // /terminal/... → /터미널/...
  if (pathname.startsWith('/terminal')) {
    const subPath = pathname.replace(/^\/terminal\/?/, '').replace(/\/$/, '');
    if (subPath) {
      return `/터미널/${subPath}`;
    }
    return '/터미널';
  }
  
  return null;
}

export default function NotFound() {
  const pathname = usePathname();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    const redirectUrl = getRedirectUrl(pathname);
    if (redirectUrl) {
      setIsRedirecting(true);
      router.replace(redirectUrl);
    }
  }, [pathname, router]);

  if (isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">페이지를 이동하고 있습니다...</p>
          <p className="text-sm text-gray-400 mt-2">잠시만 기다려주세요</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* 404 아이콘 */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-blue-50 text-blue-600 mb-4">
            <svg
              className="w-12 h-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-6xl font-bold text-gray-900 mb-2">404</h1>
          <p className="text-xl text-gray-600">페이지를 찾을 수 없습니다</p>
        </div>

        {/* 설명 */}
        <p className="text-gray-500 mb-8">
          요청하신 페이지가 삭제되었거나 주소가 변경되었을 수 있습니다.
          <br />
          아래 링크를 통해 원하시는 정보를 찾아보세요.
        </p>

        {/* 주요 링크 */}
        <div className="space-y-3">
          <Link
            href="/"
            className="block w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            메인 페이지로 이동
          </Link>
          
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/고속버스/시간표"
              className="block bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition text-sm"
            >
              고속버스 시간표
            </Link>
            <Link
              href="/시외버스/시간표"
              className="block bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition text-sm"
            >
              시외버스 시간표
            </Link>
          </div>
          
          <Link
            href="/터미널"
            className="block bg-gray-50 text-gray-600 py-3 px-6 rounded-lg font-medium hover:bg-gray-100 transition text-sm"
          >
            전체 터미널 목록 보기
          </Link>
        </div>

        {/* 인기 노선 */}
        <div className="mt-10 pt-8 border-t border-gray-200">
          <h2 className="text-sm font-medium text-gray-500 mb-4">인기 노선 바로가기</h2>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { name: '서울 → 부산', href: '/고속버스/시간표/노선/서울경부터미널-부산터미널' },
              { name: '서울 → 대전', href: '/고속버스/시간표/노선/서울경부터미널-대전복합터미널' },
              { name: '서울 → 강릉', href: '/고속버스/시간표/노선/서울경부터미널-강릉터미널' },
            ].map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
              >
                {route.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
