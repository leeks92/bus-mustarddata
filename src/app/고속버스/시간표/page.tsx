import type { Metadata } from 'next';
import { getExpressTerminals, getExpressRoutes } from '@/lib/data';
import ExpressListClient from './ExpressListClient';

export const metadata: Metadata = {
  title: '고속버스 시간표 - 전국 고속버스 터미널 운행정보',
  description:
    '전국 고속버스 터미널 시간표와 요금 정보. 서울, 부산, 대구, 대전, 광주 등 주요 도시 고속버스 운행 시간표를 확인하세요.',
  alternates: {
    canonical: 'https://bus.mustarddata.com/고속버스/시간표',
  },
};

export default function ExpressListPage() {
  const terminals = getExpressTerminals();
  const routes = getExpressRoutes();

  return <ExpressListClient terminals={terminals} routes={routes} />;
}
