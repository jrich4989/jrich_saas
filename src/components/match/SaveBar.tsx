interface SaveBarProps {
  disabled: boolean;
  count: number;
  onSave: () => void;
  onClear: () => void;
}

export default function SaveBar({
  disabled,
  count,
  onSave,
  onClear,
}: SaveBarProps) {
  if (count === 0) return null;

  return (
    <div className="sticky top-0 z-20 bg-blue-500 text-white p-3 flex items-center justify-between shadow-lg">
      <div className="font-medium">선택된 매물: {count}건</div>
      <div className="flex gap-2">
        <button
          onClick={onClear}
          className="bg-white text-blue-500 px-4 py-2 rounded hover:bg-gray-100"
        >
          선택 해제
        </button>
        <button
          onClick={onSave}
          disabled={disabled}
          className="bg-blue-700 px-4 py-2 rounded hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          추천 저장
        </button>
      </div>
    </div>
  );
}
