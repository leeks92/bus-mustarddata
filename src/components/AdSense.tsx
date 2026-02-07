'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    adsbygoogle: Array<Record<string, unknown>>;
  }
}

interface AdSenseProps {
  /** 광고 슬롯 ID (애드센스에서 발급) - 빈 문자열이면 자동 광고 */
  slot?: string;
  /** 광고 포맷 */
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal' | 'vertical';
  /** 반응형 광고 여부 */
  responsive?: boolean;
  /** 추가 클래스 */
  className?: string;
}

export default function AdSense({
  slot,
  format = 'auto',
  responsive = true,
  className = '',
}: AdSenseProps) {
  const adRef = useRef<HTMLModElement>(null);
  const isLoaded = useRef(false);

  useEffect(() => {
    if (isLoaded.current) return;
    
    try {
      if (typeof window !== 'undefined' && adRef.current) {
        // 이미 광고가 로드된 경우 중복 push 방지
        const adElement = adRef.current;
        if (adElement.getAttribute('data-ad-status')) return;
        
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        isLoaded.current = true;
      }
    } catch (e) {
      console.error('AdSense error:', e);
    }
  }, []);

  // 슬롯이 없으면 렌더링하지 않음 (자동 광고만 사용하는 경우)
  if (!slot) return null;

  return (
    <div className={`ad-container overflow-hidden text-center ${className}`}>
      <ins
        className="adsbygoogle"
        ref={adRef}
        style={{ display: 'block' }}
        data-ad-client="ca-pub-3224638013189545"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  );
}

/** 인피드 광고 (목록 사이에 삽입) */
export function AdSenseInFeed({
  slot,
  layoutKey,
  className = '',
}: {
  slot: string;
  layoutKey?: string;
  className?: string;
}) {
  const adRef = useRef<HTMLModElement>(null);
  const isLoaded = useRef(false);

  useEffect(() => {
    if (isLoaded.current) return;
    
    try {
      if (typeof window !== 'undefined' && adRef.current) {
        const adElement = adRef.current;
        if (adElement.getAttribute('data-ad-status')) return;

        (window.adsbygoogle = window.adsbygoogle || []).push({});
        isLoaded.current = true;
      }
    } catch (e) {
      console.error('AdSense InFeed error:', e);
    }
  }, []);

  return (
    <div className={`ad-container overflow-hidden ${className}`}>
      <ins
        className="adsbygoogle"
        ref={adRef}
        style={{ display: 'block' }}
        data-ad-client="ca-pub-3224638013189545"
        data-ad-slot={slot}
        data-ad-format="fluid"
        data-ad-layout-key={layoutKey || undefined}
      />
    </div>
  );
}
