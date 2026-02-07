import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-blue-600 text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-lg md:text-xl font-bold hover:opacity-90 shrink-0">
            🚌 버스 시간표
          </Link>
          <nav className="flex gap-3 md:gap-6 text-sm md:text-base">
            <Link href="/express/schedule" className="hover:underline">
              고속버스
            </Link>
            <Link href="/intercity/schedule" className="hover:underline">
              시외버스
            </Link>
            <Link href="/airport/schedule" className="hover:underline">
              공항버스
            </Link>
            <Link href="/terminal" className="hover:underline">
              터미널
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
