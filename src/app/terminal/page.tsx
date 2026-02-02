import type { Metadata } from 'next';
import { getExpressTerminals, getIntercityTerminals } from '@/lib/data';
import TerminalClient from './TerminalClient';

export const metadata: Metadata = {
  title: '전국 버스 터미널 목록 - 고속버스, 시외버스 터미널',
  description:
    '전국 고속버스, 시외버스 터미널 목록. 서울, 부산, 대구, 대전, 광주 등 주요 도시 터미널 정보와 시간표를 확인하세요.',
};

export default function TerminalListPage() {
  const expressTerminals = getExpressTerminals();
  const intercityTerminals = getIntercityTerminals();

  return (
    <TerminalClient 
      expressTerminals={expressTerminals} 
      intercityTerminals={intercityTerminals} 
    />
  );
}
