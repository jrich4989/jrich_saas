import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { propertyService } from "../../services/propertyService";
import type { Property } from "../../services/types";

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const loadProperties = useCallback(async () => {
    try {
      setLoading(true);
      const result = await propertyService.getList({
        page,
        pageSize: 20,
      });
      setProperties(result.items);
      setTotal(result.total);
    } catch (error) {
      console.error(error);
      alert("매물 목록 조회 실패");
    } finally {
      setLoading(false);
    }
  }, [page]); // propertyService 제거

  useEffect(() => {
    loadProperties();
  }, [loadProperties]);

  return (
    <div className="max-w-6xl mx-auto p-5">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">매물 관리</h1>
        <Link href="/properties/new">
          <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            + 매물 등록
          </button>
        </Link>
      </div>

      {loading ? (
        <div>로딩중...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border">
            <thead className="bg-gray-50">
              <tr>
                <th className="border px-4 py-2">ID</th>
                <th className="border px-4 py-2">상호</th>
                <th className="border px-4 py-2">주소</th>
                <th className="border px-4 py-2">면적</th>
                <th className="border px-4 py-2">보증금</th>
                <th className="border px-4 py-2">월세</th>
                <th className="border px-4 py-2">상태</th>
                <th className="border px-4 py-2">액션</th>
              </tr>
            </thead>
            <tbody>
              {properties.map((property) => (
                <tr key={property.property_id}>
                  <td className="border px-4 py-2">{property.property_id}</td>
                  <td className="border px-4 py-2">{property.store_name}</td>
                  <td className="border px-4 py-2">
                    {property.sido} {property.sigungu}
                  </td>
                  <td className="border px-4 py-2">{property.area}㎡</td>
                  <td className="border px-4 py-2">{property.deposit}</td>
                  <td className="border px-4 py-2">{property.rent}</td>
                  <td className="border px-4 py-2">{property.status}</td>
                  <td className="border px-4 py-2">
                    <Link href={`/properties/${property.property_id}`}>
                      <button className="text-blue-500 hover:underline">
                        상세
                      </button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex justify-center gap-2 mt-4">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          이전
        </button>
        <span className="px-3 py-1">
          {page} 페이지 (총 {total}건)
        </span>
        <button
          onClick={() => setPage((p) => p + 1)}
          className="px-3 py-1 border rounded"
        >
          다음
        </button>
      </div>
    </div>
  );
}
