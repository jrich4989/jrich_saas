"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  fetchProperties as fetchPropertyPage,
  type FetchPropsArgs,
} from "@/lib/fetchProperties";
import { useDebounce } from "@/hooks/useDebounce";

// 컴포넌트 import
import SaveBar from "@/components/match/SaveBar";
import FounderSelector from "@/components/match/FounderSelector";
import RecommendedList from "@/components/match/RecommendedList";
import PropertyList from "@/components/match/PropertyList";

// 타입 import (services/types.ts 사용)
import type {
  Founder,
  Property,
  PropertyFilter,
  MatchingWithProperty,
  RawMatchingRow,
} from "@/services/types";

// OrderBy 타입 추출
type OrderByField = NonNullable<FetchPropsArgs["orderBy"]>;

export default function MatchPage() {
  // ===== State 관리 =====
  const [founder, setFounder] = useState<Founder | null>(null);
  const [founderLoading, setFounderLoading] = useState(false);

  const [recommended, setRecommended] = useState<MatchingWithProperty[]>([]);
  const [recommendedLoading, setRecommendedLoading] = useState(false);

  const [properties, setProperties] = useState<Property[]>([]);
  const [listLoading, setListLoading] = useState(false);

  const [selectedPropertyIds, setSelectedPropertyIds] = useState<number[]>([]);

  // 페이지네이션 & 검색
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [searchText, setSearchText] = useState("");
  const [keyword, setKeyword] = useState("");
  const [orderBy, setOrderBy] = useState<OrderByField>("received_at");
  const [asc, setAsc] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // ===== 검색 디바운스 =====
  const applyKeyword = useCallback((value: string) => {
    setPage(1);
    setKeyword(value);
  }, []);

  const onChangeKeyword = useDebounce(applyKeyword, 300);

  // ===== 창업자 관련 함수 =====
  const fetchFounder = useCallback(async (founderId: number) => {
    setFounderLoading(true);
    try {
      const { data, error } = await supabase
        .from("founders")
        .select("*")
        .eq("founder_id", founderId)
        .maybeSingle();

      if (error) throw error;
      setFounder(data as Founder | null);
    } catch (e) {
      console.error(e);
      alert("창업자 조회 실패");
      setFounder(null);
    } finally {
      setFounderLoading(false);
    }
  }, []);

  // ===== 추천 매물 관련 함수 =====
  const fetchRecommended = useCallback(async (founderId: number) => {
    setRecommendedLoading(true);
    try {
      const { data, error } = await supabase
        .from("matchings")
        .select(
          `
          matching_id, founder_id, property_id, matched_at, 
          method, status, score, is_favorite, exclude_from_print,
          property:properties(*)
        `
        )
        .eq("founder_id", founderId)
        .order("matched_at", { ascending: false })
        .returns<RawMatchingRow[]>();

      if (error) throw error;

      // 배열 정규화
      const rows: MatchingWithProperty[] = (data ?? []).map((r) => ({
        ...r,
        property: Array.isArray(r.property)
          ? r.property[0] ?? null
          : r.property ?? null,
      }));

      setRecommended(rows);
    } catch (e) {
      console.error(e);
      alert("추천된 매물 목록 조회 실패");
      setRecommended([]);
    } finally {
      setRecommendedLoading(false);
    }
  }, []);

  // ===== 매물 목록 조회 =====
  useEffect(() => {
    let cancelled = false;

    const loadProperties = async () => {
      try {
        setListLoading(true);
        const { items, total, totalPages } = await fetchPropertyPage({
          page,
          pageSize,
          keyword,
          orderBy,
          asc,
        });

        if (!cancelled) {
          setProperties(items);
          setTotalCount(total);
          setTotalPages(totalPages);
        }
      } catch (e) {
        if (!cancelled) {
          console.error(e);
          alert("매물 목록 불러오기 실패");
        }
      } finally {
        if (!cancelled) {
          setListLoading(false);
        }
      }
    };

    loadProperties();

    return () => {
      cancelled = true;
    };
  }, [page, pageSize, keyword, orderBy, asc]);

  // ===== 창업자 변경시 초기화 =====
  useEffect(() => {
    setSelectedPropertyIds([]);
    if (founder?.founder_id) {
      fetchRecommended(founder.founder_id);
      setPage(1);
    }
  }, [founder?.founder_id, fetchRecommended]);

  // ===== 이벤트 핸들러 =====
  const toggleSelect = (propertyId: number) => {
    setSelectedPropertyIds((prev) =>
      prev.includes(propertyId)
        ? prev.filter((x) => x !== propertyId)
        : [...prev, propertyId]
    );
  };

  const saveRecommendations = async () => {
    if (!founder?.founder_id) {
      alert("창업자를 먼저 선택하세요.");
      return;
    }
    if (selectedPropertyIds.length === 0) {
      alert("선택된 매물이 없습니다.");
      return;
    }

    const payload = selectedPropertyIds.map((id) => ({
      founder_id: founder.founder_id,
      property_id: id,
      matched_at: new Date().toISOString(),
      method: "자동",
      status: "추천",
      score: 0,
      is_favorite: false,
      exclude_from_print: false,
    }));

    const { error } = await supabase.from("matchings").upsert(payload, {
      onConflict: "founder_id,property_id",
      ignoreDuplicates: true,
    });

    if (error) {
      console.error(error);
      alert("추천 저장 실패");
      return;
    }

    setSelectedPropertyIds([]);
    if (founder?.founder_id) {
      fetchRecommended(founder.founder_id);
    }
    alert("추천 저장 완료");
  };

  const cancelRecommendation = async (propertyId: number) => {
    if (!founder?.founder_id) return;

    const { error } = await supabase
      .from("matchings")
      .delete()
      .match({ founder_id: founder.founder_id, property_id: propertyId });

    if (error) {
      console.error(error);
      alert("추천 취소 실패");
      return;
    }

    if (founder?.founder_id) {
      fetchRecommended(founder.founder_id);
    }
  };

  const toggleFlag = async (
    matchingId: number,
    field: "is_favorite" | "exclude_from_print"
  ) => {
    const row = recommended.find((r) => r.matching_id === matchingId);
    if (!row) return;

    const next = !(row[field] ?? false);
    const { error } = await supabase
      .from("matchings")
      .update({ [field]: next })
      .eq("matching_id", matchingId);

    if (error) {
      console.error(error);
      alert("상태 변경 실패");
      return;
    }

    setRecommended((prev) =>
      prev.map((r) =>
        r.matching_id === matchingId ? { ...r, [field]: next } : r
      )
    );
  };

  // ===== 렌더링 =====
  return (
    <div className="max-w-6xl mx-auto p-5">
      <h1 className="text-3xl font-bold mb-4">매물 추천</h1>

      <SaveBar
        disabled={!founder || selectedPropertyIds.length === 0}
        count={selectedPropertyIds.length}
        onSave={saveRecommendations}
        onClear={() => setSelectedPropertyIds([])}
      />

      <FounderSelector
        founder={founder}
        loading={founderLoading}
        onSelect={fetchFounder}
      />

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold">
            추천된 매물 ({recommended.length}건)
          </h2>
        </div>

        <RecommendedList
          items={recommended}
          loading={recommendedLoading}
          onToggleFavorite={(id) => toggleFlag(id, "is_favorite")}
          onToggleExclude={(id) => toggleFlag(id, "exclude_from_print")}
          onCancel={cancelRecommendation}
        />
      </div>

      {/* 검색 컨트롤 */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b py-2 px-3 mb-3 flex flex-wrap gap-2 items-center">
        <input
          type="text"
          placeholder="매물 검색(상호/주소/메모/코드)"
          className="border rounded px-3 py-2 w-64"
          value={searchText}
          onChange={(e) => {
            const v = e.target.value;
            setSearchText(v);
            onChangeKeyword(v);
          }}
        />

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-500">정렬</label>
          <select
            className="border rounded px-2 py-2"
            value={orderBy}
            onChange={(e) => {
              setOrderBy(e.target.value as OrderByField);
              setPage(1);
            }}
          >
            <option value="received_at">최신순</option>
            <option value="area">면적</option>
            <option value="deposit">보증금</option>
            <option value="rent">월세</option>
          </select>
          <button
            className="border rounded px-2 py-2"
            onClick={() => setAsc((a) => !a)}
          >
            {asc ? "▲" : "▼"}
          </button>
        </div>

        <div className="ml-auto text-sm text-gray-600">
          총 {totalCount.toLocaleString()}건 / {page} / {totalPages}페이지
        </div>
      </div>

      {/* 후보 매물 목록 */}
      <PropertyList
        properties={properties}
        selectedIds={selectedPropertyIds}
        loading={listLoading}
        onToggleSelect={toggleSelect}
      />

      {/* 페이지네이션 */}
      <div className="flex items-center justify-center gap-2 my-4">
        <button
          className="border rounded px-3 py-2 disabled:opacity-50"
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          이전
        </button>

        <input
          type="number"
          value={page}
          min={1}
          max={totalPages}
          onChange={(e) =>
            setPage(Math.min(Math.max(1, Number(e.target.value)), totalPages))
          }
          className="w-16 text-center border rounded px-2 py-2"
        />
        <span className="text-sm">/ {totalPages}</span>

        <button
          className="border rounded px-3 py-2 disabled:opacity-50"
          disabled={page >= totalPages}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
        >
          다음
        </button>
      </div>
    </div>
  );
}
