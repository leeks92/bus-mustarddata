import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-100 border-t mt-12">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold mb-3 text-gray-900">버스 시간표</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>
                <Link href="/고속버스/시간표" className="hover:text-blue-600">
                  고속버스 시간표
                </Link>
              </li>
              <li>
                <Link href="/시외버스/시간표" className="hover:text-blue-600">
                  시외버스 시간표
                </Link>
              </li>
              <li>
                <Link href="/터미널" className="hover:text-blue-600">
                  전국 버스 터미널
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-3 text-gray-900">인기 노선</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>
                <Link href="/고속버스/시간표/노선/서울경부터미널-부산종합터미널" className="hover:text-blue-600">
                  서울 → 부산
                </Link>
              </li>
              <li>
                <Link href="/고속버스/시간표/노선/동서울터미널-강릉터미널" className="hover:text-blue-600">
                  동서울 → 강릉
                </Link>
              </li>
              <li>
                <Link href="/고속버스/시간표/노선/서울경부터미널-대전복합터미널" className="hover:text-blue-600">
                  서울 → 대전
                </Link>
              </li>
              <li>
                <Link href="/고속버스/시간표/노선/센트럴시티터미널-광주터미널" className="hover:text-blue-600">
                  서울 → 광주
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-3 text-gray-900">예매 사이트</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>
                <a
                  href="https://www.kobus.co.kr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-600"
                >
                  고속버스통합예매 (KOBUS)
                </a>
              </li>
              <li>
                <a
                  href="https://txbus.t-money.co.kr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-600"
                >
                  시외버스 예매 (티머니)
                </a>
              </li>
              <li>
                <a
                  href="https://www.bustago.or.kr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-600"
                >
                  버스타고
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-3 text-gray-900">관련 서비스</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>
                <a
                  href="https://calc.mustarddata.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-600"
                >
                  금융 계산기
                </a>
              </li>
              <li>
                <a
                  href="https://apt.mustarddata.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-600"
                >
                  부동산 실거래가
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t text-center text-sm text-gray-600">
          <p>
            © {currentYear} MustardData. 본 사이트의 시간표 정보는 공공데이터를
            기반으로 제공되며, 실제 운행 정보와 다를 수 있습니다.
          </p>
          <p className="mt-2">
            정확한 시간표와 예매는 각 버스 회사 공식 사이트를 이용해 주세요.
          </p>
        </div>
      </div>
    </footer>
  );
}
