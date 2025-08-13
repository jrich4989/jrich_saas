import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8">상업용 부동산 중개 플랫폼</h1>

      <div className="space-y-4">
        <Link href="/match/match">
          <div className="p-4 border rounded hover:bg-gray-50 cursor-pointer">
            → 매물 매칭 페이지
          </div>
        </Link>
      </div>
    </div>
  );
}
