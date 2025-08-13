import { useState } from "react";

interface Founder {
  founder_id: number;
  name?: string | null;
  contact?: string | null;
  area?: number | null;
  deposit?: number | null;
  rent?: number | null;
  premium?: number | null;
  business_type?: string | null;
}

interface FounderSelectorProps {
  founder: Founder | null;
  loading: boolean;
  onSelect: (founderId: number) => void;
}

export default function FounderSelector({
  founder,
  loading,
  onSelect,
}: FounderSelectorProps) {
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = () => {
    const founderId = Number(inputValue);
    if (!founderId) {
      alert("창업자 ID를 입력하세요.");
      return;
    }
    onSelect(founderId);
  };

  return (
    <div className="border rounded p-3 mb-4 flex flex-wrap items-end gap-2">
      <div>
        <label className="block text-sm text-gray-600">창업자 ID</label>
        <input
          type="number"
          className="border rounded px-3 py-2 w-40"
          placeholder="예: 1409"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
      </div>

      <button
        className="border rounded px-4 py-2"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? "불러오는 중..." : "창업자 선택"}
      </button>

      <div className="ml-4 text-sm">
        {founder ? (
          <div>
            <div>이름: {founder.name ?? "-"}</div>
            <div>연락처: {founder.contact ?? "-"}</div>
            <div>
              면적: {founder.area ?? "-"}㎡ / 보증금: {founder.deposit ?? "-"} /
              월세: {founder.rent ?? "-"} / 권리금: {founder.premium ?? 0}
            </div>
          </div>
        ) : (
          <div className="text-gray-500">창업자를 선택하세요.</div>
        )}
      </div>
    </div>
  );
}
