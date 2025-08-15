import { useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabaseClient";

interface PropertyFormData {
  store_name: string;
  sido: string;
  sigungu: string;
  beopjeongdong: string;
  jibun: string;
  area: number | "";
  deposit: number | "";
  rent: number | "";
  premium: number | "";
  property_code: string;
  status: string;
  notes: string;
}

export default function CreateProperty() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<PropertyFormData>({
    store_name: "",
    sido: "",
    sigungu: "",
    beopjeongdong: "",
    jibun: "",
    area: "",
    deposit: "",
    rent: "",
    premium: "",
    property_code: "",
    status: "접수",
    notes: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    // 숫자 필드 처리
    if (["area", "deposit", "rent", "premium"].includes(name)) {
      setFormData({
        ...formData,
        [name]: value === "" ? "" : Number(value),
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.store_name || !formData.beopjeongdong) {
      alert("상호명과 법정동은 필수 입력 항목입니다.");
      return;
    }

    setLoading(true);

    try {
      // 빈 문자열을 null로 변환
      const dataToSubmit = {
        ...formData,
        area: formData.area === "" ? null : formData.area,
        deposit: formData.deposit === "" ? null : formData.deposit,
        rent: formData.rent === "" ? null : formData.rent,
        premium: formData.premium === "" ? null : formData.premium,
        received_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("properties")
        .insert([dataToSubmit]);

      if (error) throw error;

      alert("매물이 성공적으로 등록되었습니다.");
      router.push("/properties");
    } catch (error) {
      console.error("Error:", error);
      alert("매물 등록 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">매물 등록</h1>
        <p className="text-gray-600 mt-2">새로운 매물 정보를 입력하세요</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white shadow rounded-lg p-6"
      >
        {/* 기본 정보 */}
        <div className="border-b pb-6">
          <h2 className="text-xl font-semibold mb-4">기본 정보</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                상호명 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="store_name"
                value={formData.store_name}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                매물 코드
              </label>
              <input
                type="text"
                name="property_code"
                value={formData.property_code}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="예: A001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                상태
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="접수">접수</option>
                <option value="진행중">진행중</option>
                <option value="진행중">1순위</option>
                <option value="진행중">2순위</option>
                <option value="진행중">3순위</option>
                <option value="진행보류">진행보류</option>
                <option value="진행종료">진행종료</option>
                <option value="계약완료">계약완료</option>
              </select>
            </div>
          </div>
        </div>

        {/* 위치 정보 */}
        <div className="border-b pb-6">
          <h2 className="text-xl font-semibold mb-4">위치 정보</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                시/도
              </label>
              <input
                type="text"
                name="sido"
                value={formData.sido}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="예: 서울특별시"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                시/군/구
              </label>
              <input
                type="text"
                name="sigungu"
                value={formData.sigungu}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="예: 강남구"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                법정동 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="beopjeongdong"
                value={formData.beopjeongdong}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="예: 역삼동"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                지번
              </label>
              <input
                type="text"
                name="jibun"
                value={formData.jibun}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="예: 123-45"
              />
            </div>
          </div>
        </div>

        {/* 매물 조건 */}
        <div className="border-b pb-6">
          <h2 className="text-xl font-semibold mb-4">매물 조건</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                면적 (㎡)
              </label>
              <input
                type="number"
                name="area"
                value={formData.area}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                보증금 (만원)
              </label>
              <input
                type="number"
                name="deposit"
                value={formData.deposit}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                월세 (만원)
              </label>
              <input
                type="number"
                name="rent"
                value={formData.rent}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                권리금 (만원)
              </label>
              <input
                type="number"
                name="premium"
                value={formData.premium}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
                min="0"
              />
            </div>
          </div>
        </div>

        {/* 메모 */}
        <div>
          <h2 className="text-xl font-semibold mb-4">추가 정보</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              메모
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="추가 정보를 입력하세요..."
            />
          </div>
        </div>

        {/* 버튼 */}
        <div className="flex justify-end space-x-3 pt-6">
          <button
            type="button"
            onClick={() => router.push("/properties")}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            disabled={loading}
          >
            취소
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "등록 중..." : "매물 등록"}
          </button>
        </div>
      </form>
    </div>
  );
}
