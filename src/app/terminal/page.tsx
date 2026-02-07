import type { Metadata } from 'next';
import { getExpressTerminals, getIntercityTerminals, getExpressRoutes, getIntercityRoutes } from '@/lib/data';
import TerminalListClient from './TerminalListClient';

export const metadata: Metadata = {
  title: '전국 버스 터미널 - 고속버스·시외버스 터미널 안내',
  description:
    '전국 고속버스, 시외버스 터미널 목록과 운행 정보. 서울, 부산, 대구, 대전, 광주 등 주요 도시 터미널 안내.',
  alternates: {
    canonical: 'https://bus.mustarddata.com/terminal',
  },
};

export default function TerminalListPage() {
  const expressTerminals = getExpressTerminals();
  const intercityTerminals = getIntercityTerminals();
  const expressRoutes = getExpressRoutes();
  const intercityRoutes = getIntercityRoutes();

  return (
    <TerminalListClient
      expressTerminals={expressTerminals}
      intercityTerminals={intercityTerminals}
      expressRoutes={expressRoutes}
      intercityRoutes={intercityRoutes}
    />
  );
}
