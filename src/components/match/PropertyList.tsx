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

interface PropertyListProps {
  properties: Property[];
  selectedIds: number[];
  loading: boolean;
  onToggleSelect: (propertyId: number) => void;
}

export default function PropertyList({
  properties,
  selectedIds,
  loading,
  onToggleSelect,
}: PropertyListProps) {
  if (loading) {
    return <div className="p-6 text-gray-500">불러오는 중...</div>;
  }

  if (properties.length === 0) {
    return <div className="p-6">데이터 없음</div>;
  }

  return (
    <ul className="divide-y rounded border">
      {properties.map((p) => {
        const checked = selectedIds.includes(p.property_id);
        return (
          <li key={p.property_id} className="p-3 flex items-start gap-3">
            <input
              type="checkbox"
              className="mt-1"
              checked={checked}
              onChange={() => onToggleSelect(p.property_id)}
            />
            <div className="flex-1">
              <div className="font-medium">{p.store_name ?? "-"}</div>
              <div className="text-sm text-gray-600">
                {p.sido ?? ""} {p.sigungu ?? ""} {p.beopjeongdong ?? ""}{" "}
                {p.jibun ?? ""}
              </div>
              <div className="text-sm">
                면적 {p.area ?? "-"}㎡ / 보증금 {p.deposit ?? "-"} / 월세{" "}
                {p.rent ?? "-"} / 권리금 {p.premium ?? 0}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
