"use client";

import { useState, useEffect } from "react";
import type { PropertyFilter, FilterPreset } from "@/services/types";

interface PropertyFilterProps {
  filter: PropertyFilter;
  onFilterChange: (filter: PropertyFilter) => void;
  onApply: () => void;
  onReset: () => void;
}

export default function PropertyFilterComponent({
  filter,
  onFilterChange,
  onApply,
  onReset,
}: PropertyFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [presets, setPresets] = useState<FilterPreset[]>([]);
  const [presetName, setPresetName] = useState("");
  const [showSavePreset, setShowSavePreset] = useState(false);

  // 층수 옵션 (string 타입으로 변경)
  const floorOptions = [
    { value: "지하", label: "지하" },
    { value: "1층", label: "1층" },
    { value: "2층", label: "2층" },
    { value: "3층", label: "3층" },
    { value: "4층이상", label: "4층 이상" },
  ];

  // 프리셋 불러오기
  useEffect(() => {
    const saved = localStorage.getItem("filterPresets");
    if (saved) {
      setPresets(JSON.parse(saved));
    }
  }, []);

  // 범위 입력 핸들러
  const handleRangeChange = (
    field: "area" | "deposit" | "rent" | "premium",
    type: "min" | "max",
    value: string
  ) => {
    const numValue = value === "" ? undefined : Number(value);
    onFilterChange({
      ...filter,
      [field]: {
        ...filter[field],
        [type]: numValue,
      },
    });
  };

  // 층수 선택 핸들러 (string 타입)
  const handleFloorToggle = (floor: string) => {
    const currentFloors = filter.floors || [];
    const newFloors = currentFloors.includes(floor)
      ? currentFloors.filter((f) => f !== floor)
      : [...currentFloors, floor];

    onFilterChange({
      ...filter,
      floors: newFloors.length > 0 ? newFloors : undefined,
    });
  };

  // 프리셋 저장
  const savePreset = () => {
    if (!presetName.trim()) return;

    const newPreset: FilterPreset = {
      id: Date.now().toString(),
      name: presetName,
      filter: { ...filter },
      created_at: new Date().toISOString(),
    };

    const updatedPresets = [...presets, newPreset];
    setPresets(updatedPresets);
    localStorage.setItem("filterPresets", JSON.stringify(updatedPresets));

    setPresetName("");
    setShowSavePreset(false);
  };

  // 프리셋 적용
  const applyPreset = (preset: FilterPreset) => {
    onFilterChange(preset.filter);
  };

  // 프리셋 삭제
  const deletePreset = (id: string) => {
    const updatedPresets = presets.filter((p) => p.id !== id);
    setPresets(updatedPresets);
    localStorage.setItem("filterPresets", JSON.stringify(updatedPresets));
  };

  // 활성 필터 개수 계산
  const getActiveFilterCount = () => {
    let count = 0;
    if (filter.area?.min || filter.area?.max) count++;
    if (filter.deposit?.min || filter.deposit?.max) count++;
    if (filter.rent?.min || filter.rent?.max) count++;
    if (filter.premium?.min || filter.premium?.max) count++;
    if (filter.floors && filter.floors.length > 0) count++;
    if (filter.keyword) count++;
    if (filter.sido) count++;
    if (filter.sigungu) count++;
    if (filter.business_types && filter.business_types.length > 0) count++;
    return count;
  };

  const activeCount = getActiveFilterCount();

  return (
    <div className="bg-white border rounded-lg shadow-sm mb-4">
      {/* 헤더 */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold">필터</h3>
            {activeCount > 0 && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                {activeCount}개 적용중
              </span>
            )}
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            {isExpanded ? "접기 ▲" : "펼치기 ▼"}
          </button>
        </div>

        {/* 간단 미리보기 */}
        {!isExpanded && activeCount > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {filter.area && (filter.area.min || filter.area.max) && (
              <span className="px-2 py-1 bg-gray-100 rounded text-sm">
                면적: {filter.area.min || "-"}~{filter.area.max || "-"}㎡
              </span>
            )}
            {filter.deposit && (filter.deposit.min || filter.deposit.max) && (
              <span className="px-2 py-1 bg-gray-100 rounded text-sm">
                보증금: {filter.deposit.min?.toLocaleString() || "-"}~
                {filter.deposit.max?.toLocaleString() || "-"}만원
              </span>
            )}
            {filter.rent && (filter.rent.min || filter.rent.max) && (
              <span className="px-2 py-1 bg-gray-100 rounded text-sm">
                월세: {filter.rent.min?.toLocaleString() || "-"}~
                {filter.rent.max?.toLocaleString() || "-"}만원
              </span>
            )}
            {filter.floors && filter.floors.length > 0 && (
              <span className="px-2 py-1 bg-gray-100 rounded text-sm">
                층수: {filter.floors.join(", ")}
              </span>
            )}
          </div>
        )}
      </div>

      {/* 상세 필터 */}
      {isExpanded && (
        <div className="border-t">
          {/* 프리셋 */}
          <div className="p-4 bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-sm text-gray-700">저장된 필터</h4>
              <button
                onClick={() => setShowSavePreset(!showSavePreset)}
                className="text-sm text-blue-600 hover:underline"
              >
                현재 설정 저장
              </button>
            </div>

            {showSavePreset && (
              <div className="mb-3 flex gap-2">
                <input
                  type="text"
                  placeholder="필터 이름..."
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded text-sm"
                />
                <button
                  onClick={savePreset}
                  disabled={!presetName.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  저장
                </button>
                <button
                  onClick={() => {
                    setShowSavePreset(false);
                    setPresetName("");
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
                >
                  취소
                </button>
              </div>
            )}

            {presets.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {presets.map((preset) => (
                  <div
                    key={preset.id}
                    className="flex items-center gap-1 bg-white border rounded-lg px-3 py-1"
                  >
                    <button
                      onClick={() => applyPreset(preset)}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {preset.name}
                    </button>
                    <button
                      onClick={() => deletePreset(preset.id)}
                      className="text-red-500 hover:text-red-700 text-sm ml-1"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">저장된 필터가 없습니다.</p>
            )}
          </div>

          {/* 필터 입력 */}
          <div className="p-4 space-y-4">
            {/* 위치 필터 */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  시/도
                </label>
                <input
                  type="text"
                  placeholder="예: 서울특별시"
                  value={filter.sido || ""}
                  onChange={(e) =>
                    onFilterChange({ ...filter, sido: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  시/군/구
                </label>
                <input
                  type="text"
                  placeholder="예: 강남구"
                  value={filter.sigungu || ""}
                  onChange={(e) =>
                    onFilterChange({ ...filter, sigungu: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
            </div>

            {/* 면적 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                면적 (㎡)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="최소"
                  value={filter.area?.min || ""}
                  onChange={(e) =>
                    handleRangeChange("area", "min", e.target.value)
                  }
                  className="flex-1 px-3 py-2 border rounded"
                />
                <span className="text-gray-500">~</span>
                <input
                  type="number"
                  placeholder="최대"
                  value={filter.area?.max || ""}
                  onChange={(e) =>
                    handleRangeChange("area", "max", e.target.value)
                  }
                  className="flex-1 px-3 py-2 border rounded"
                />
              </div>
            </div>

            {/* 보증금 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                보증금 (만원)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="최소"
                  value={filter.deposit?.min || ""}
                  onChange={(e) =>
                    handleRangeChange("deposit", "min", e.target.value)
                  }
                  className="flex-1 px-3 py-2 border rounded"
                />
                <span className="text-gray-500">~</span>
                <input
                  type="number"
                  placeholder="최대"
                  value={filter.deposit?.max || ""}
                  onChange={(e) =>
                    handleRangeChange("deposit", "max", e.target.value)
                  }
                  className="flex-1 px-3 py-2 border rounded"
                />
              </div>
            </div>

            {/* 월세 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                월세 (만원)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="최소"
                  value={filter.rent?.min || ""}
                  onChange={(e) =>
                    handleRangeChange("rent", "min", e.target.value)
                  }
                  className="flex-1 px-3 py-2 border rounded"
                />
                <span className="text-gray-500">~</span>
                <input
                  type="number"
                  placeholder="최대"
                  value={filter.rent?.max || ""}
                  onChange={(e) =>
                    handleRangeChange("rent", "max", e.target.value)
                  }
                  className="flex-1 px-3 py-2 border rounded"
                />
              </div>
            </div>

            {/* 권리금 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                권리금 (만원)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="최소"
                  value={filter.premium?.min || ""}
                  onChange={(e) =>
                    handleRangeChange("premium", "min", e.target.value)
                  }
                  className="flex-1 px-3 py-2 border rounded"
                />
                <span className="text-gray-500">~</span>
                <input
                  type="number"
                  placeholder="최대"
                  value={filter.premium?.max || ""}
                  onChange={(e) =>
                    handleRangeChange("premium", "max", e.target.value)
                  }
                  className="flex-1 px-3 py-2 border rounded"
                />
              </div>
            </div>

            {/* 층수 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                층수 (복수 선택 가능)
              </label>
              <div className="flex flex-wrap gap-2">
                {floorOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleFloorToggle(option.value)}
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      filter.floors?.includes(option.value)
                        ? "bg-blue-100 border-blue-300 text-blue-700"
                        : "bg-white border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 키워드 검색 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                키워드 검색
              </label>
              <input
                type="text"
                placeholder="상호명, 메모 등..."
                value={filter.keyword || ""}
                onChange={(e) =>
                  onFilterChange({ ...filter, keyword: e.target.value })
                }
                className="w-full px-3 py-2 border rounded"
              />
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="p-4 border-t bg-gray-50 flex gap-2">
            <button
              onClick={onApply}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              필터 적용
            </button>
            <button
              onClick={onReset}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
            >
              초기화
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
