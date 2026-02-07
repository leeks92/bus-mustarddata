import type { Metadata } from 'next';
import { getIntercityTerminals, getIntercityRoutes } from '@/lib/data';
import IntercityListClient from './IntercityListClient';

export const metadata: Metadata = {
  title: '시외버스 시간표 - 전국 시외버스 터미널 운행정보',
  description:
    '전국 시외버스 터미널 시간표와 요금 정보. 전국 방방곡곡을 연결하는 시외버스 운행 시간표를 확인하세요.',
  alternates: {
    canonical: 'https://bus.mustarddata.com/intercity/schedule',
  },
};

export default function IntercityListPage() {
  const terminals = getIntercityTerminals();
  const routes = getIntercityRoutes();

  return <IntercityListClient terminals={terminals} routes={routes} />;
}
