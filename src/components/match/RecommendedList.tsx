interface Property {
  property_id: number;
  store_name?: string | null;
  sido?: string | null;
  sigungu?: string | null;
  beopjeongdong?: string | null;
  jibun?: string | null;
  area?: number | null;
  deposit?: number | null;
  rent?: number | null;
  premium?: number | null;
}

interface MatchingWithProperty {
  matching_id: number;
  founder_id: number;
  property_id: number;
  is_favorite: boolean | null;
  exclude_from_print: boolean | null;
  property: Property | null;
}

interface RecommendedListProps {
  items: MatchingWithProperty[];
  loading: boolean;
  onToggleFavorite: (matchingId: number) => void;
  onToggleExclude: (matchingId: number) => void;
  onCancel: (propertyId: number) => void;
}

export default function RecommendedList({
  items,
  loading,
  onToggleFavorite,
  onToggleExclude,
  onCancel,
}: RecommendedListProps) {
  if (loading) {
    return <div className="p-4 text-gray-500">불러오는 중...</div>;
  }

  if (items.length === 0) {
    return <div className="p-4">아직 추천된 매물이 없습니다.</div>;
  }

  return (
    <ul className="divide-y rounded border">
      {items.map((r) => (
        <li key={r.matching_id} className="p-3 flex items-start gap-3">
          <div className="flex-1">
            <div className="font-medium">{r.property?.store_name ?? "-"}</div>
            <div className="text-sm text-gray-600">
              {r.property?.sido ?? ""} {r.property?.sigungu ?? ""}{" "}
              {r.property?.beopjeongdong ?? ""} {r.property?.jibun ?? ""}
            </div>
            <div className="text-sm">
              면적 {r.property?.area ?? "-"}㎡ / 보증금{" "}
              {r.property?.deposit ?? "-"} / 월세 {r.property?.rent ?? "-"} /
              권리금 {r.property?.premium ?? 0}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              className={`border rounded px-2 py-1 ${
                r.is_favorite ? "bg-yellow-100" : ""
              }`}
              onClick={() => onToggleFavorite(r.matching_id)}
            >
              ★
            </button>
            <button
              className={`border rounded px-2 py-1 ${
                r.exclude_from_print ? "bg-gray-200" : ""
              }`}
              onClick={() => onToggleExclude(r.matching_id)}
            >
              인쇄제외
            </button>
            <button
              className="border rounded px-3 py-1"
              onClick={() => onCancel(r.property_id)}
            >
              추천 취소
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
