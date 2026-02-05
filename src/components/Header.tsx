import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-blue-600 text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-xl font-bold hover:opacity-90">
            🚌 전국 버스 시간표
          </Link>
          <nav className="flex gap-6">
            <Link href="/고속버스/시간표" className="hover:underline">
              고속버스
            </Link>
            <Link href="/시외버스/시간표" className="hover:underline">
              시외버스
            </Link>
            <Link href="/터미널" className="hover:underline">
              터미널
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
