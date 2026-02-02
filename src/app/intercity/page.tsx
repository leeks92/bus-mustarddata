import type { Metadata } from 'next';
import { getIntercityTerminals } from '@/lib/data';
import IntercityClient from './IntercityClient';

export const metadata: Metadata = {
  title: '시외버스 시간표 - 전국 시외버스 터미널 운행정보',
  description:
    '전국 시외버스 터미널 시간표와 요금 정보. 서울, 부산, 대구, 대전, 광주 등 주요 도시 시외버스 운행 시간표를 확인하세요.',
};

export default function IntercityPage() {
  const terminals = getIntercityTerminals();

  return <IntercityClient terminals={terminals} />;
}
