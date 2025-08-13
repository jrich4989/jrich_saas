import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import SaveBar from "../components/match/SaveBar";

import {
  fetchProperties as fetchPropertyPage,
  type FetchPropsArgs,
  type Property,
} from "../lib/fetchProperties";

// Supabase 조인 결과가 가끔 배열로 오는 케이스까지 커버
type RawRecommendedRow = Matching & { property: Property | Property[] | null };
// 우리가 실제로 쓰고 싶은 정규화 타입
type RecommendedRow = Matching & { property: Property | null };

/** --------- 유틸: 단일 인자 디바운스 --------- */
function debounce1<T>(fn: (arg: T) => void, ms = 300) {
  let t: ReturnType<typeof setTimeout> | null = null;
  const debounced = (arg: T) => {
    if (t) clearTimeout(t);
    t = setTimeout(() => fn(arg), ms);
  };
  (debounced as typeof debounced & { cancel: () => void }).cancel = () => {
    if (t) clearTimeout(t);
  };
  return debounced as ((arg: T) => void) & { cancel: () => void };
}

// 타입 import 추가
import type {
  Founder,
  Property,
  Matching,
  MatchingWithProperty,
  RawMatchingRow,
} from "../services/types";

/** --------- 페이지 --------- */
export default function MatchPage() {
  /** 창업자 */
  const [founderIdInput, setFounderIdInput] = useState<string>("");
  const [founder, setFounder] = useState<Founder | null>(null);
  const [founderLoading, setFounderLoading] = useState<boolean>(false);

  /** 이미 추천된 매물 */
  // 기존: const [recommended, setRecommended] = useState<(Matching & { property: Property | null })[]>([]);
  const [recommended, setRecommended] = useState<RecommendedRow[]>([]);

  const [recommendedLoading, setRecommendedLoading] = useState<boolean>(false);

  /** 후보 매물(검색/정렬/페이지) */
  const [properties, setProperties] = useState<Property[]>([]);
  const [listLoading, setListLoading] = useState<boolean>(false);

  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);
  const [searchText, setSearchText] = useState<string>("");
  const [keyword, setKeyword] = useState<string>("");
  const [orderBy, setOrderBy] =
    useState<FetchPropsArgs["orderBy"]>("received_at");
  const [asc, setAsc] = useState<boolean>(false);

  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  /** 선택 체크박스 */
  const [selectedPropertyIds, setSelectedPropertyIds] = useState<number[]>([]);

  /** 검색 디바운스 */
  const applyKeyword = useCallback((v: string) => {
    setPage(1);
    setKeyword(v);
  }, []);
  const onChangeKeyword = useMemo(
    () => debounce1<string>(applyKeyword, 300),
    [applyKeyword]
  );
  useEffect(() => () => onChangeKeyword.cancel(), [onChangeKeyword]);

  /** 창업자 불러오기 */
  const fetchFounder = useCallback(async (idNum: number) => {
    setFounderLoading(true);
    try {
      const { data, error } = await supabase
        .from("founders")
        .select("*")
        .eq("founder_id", idNum)
        .maybeSingle();
      if (error) throw error;
      setFounder(data as Founder);
    } catch (e) {
      console.error(e);
      alert("창업자 조회 실패");
      setFounder(null);
    } finally {
      setFounderLoading(false);
    }
  }, []);

  /** 이미 추천된 매물 불러오기 */
  const fetchRecommended = useCallback(async (fid: number) => {
    setRecommendedLoading(true);
    try {
      const { data, error } = await supabase
        .from("matchings")
        .select(
          `
        matching_id, founder_id, property_id, matched_at, method, status, score, is_favorite, exclude_from_print,
        property:properties(*)
      `
        )
        .eq("founder_id", fid)
        .order("matched_at", { ascending: false })
        .returns<RawRecommendedRow[]>(); // ⬅️ 조인 원자료 타입 힌트

      if (error) throw error;

      // ⬅️ 배열로 올 수도 있어 방탄 정규화
      const rows: RecommendedRow[] = (data ?? []).map((r) => ({
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

  /** 후보 매물 목록 불러오기 */
  useEffect(() => {
    let cancelled = false;
    (async () => {
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
        console.error(e);
        alert("매물 목록 불러오기 실패");
      } finally {
        if (!cancelled) setListLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [page, pageSize, keyword, orderBy, asc]);

  /** 창업자 바뀌면 추천목록/선택 초기화 */
  useEffect(() => {
    setSelectedPropertyIds([]);
    if (founder?.founder_id) {
      fetchRecommended(founder.founder_id);
      setPage(1);
    }
  }, [founder?.founder_id, fetchRecommended]);

  /** 체크 토글 */
  const toggleSelect = (pid: number) => {
    setSelectedPropertyIds((prev) =>
      prev.includes(pid) ? prev.filter((x) => x !== pid) : [...prev, pid]
    );
  };

  /** 추천 저장(upsert, 중복 무시) */
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
    // 저장 후 UI 업데이트
    setSelectedPropertyIds([]);
    if (founder?.founder_id) fetchRecommended(founder.founder_id);
    alert("추천 저장 완료");
  };

  /** 추천 취소(해당 founder_id + property_id 삭제) */
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
    if (founder?.founder_id) fetchRecommended(founder.founder_id);
  };

  /** 즐겨찾기/인쇄제외 토글(옵션) */
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
    // 로컬 반영
    setRecommended((prev) =>
      prev.map((r) =>
        r.matching_id === matchingId ? { ...r, [field]: next } : r
      )
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-5">
      <h1 className="text-3xl font-bold mb-4">매물 추천</h1>

      <SaveBar
        disabled={!founder || selectedPropertyIds.length === 0}
        count={selectedPropertyIds.length}
        onSave={saveRecommendations}
        onClear={() => setSelectedPropertyIds([])}
      />

      {/* 창업자 선택 */}
      <div className="border rounded p-3 mb-4 flex flex-wrap items-end gap-2">
        <div>
          <label className="block text-sm text-gray-600">창업자 ID</label>
          <input
            type="number"
            className="border rounded px-3 py-2 w-40"
            placeholder="예: 1409"
            value={founderIdInput}
            onChange={(e) => setFounderIdInput(e.target.value)}
          />
        </div>
        <button
          className="border rounded px-4 py-2"
          onClick={() => {
            const idNum = Number(founderIdInput);
            if (!idNum) {
              alert("창업자 ID를 입력하세요.");
              return;
            }
            fetchFounder(idNum);
          }}
          disabled={founderLoading}
        >
          {founderLoading ? "불러오는 중..." : "창업자 선택"}
        </button>

        <div className="ml-4 text-sm">
          {founder ? (
            <div>
              <div>이름: {founder.name ?? "-"}</div>
              <div>연락처: {founder.contact ?? "-"}</div>
              <div>
                면적: {founder.area ?? "-"}㎡ / 보증금: {founder.deposit ?? "-"}{" "}
                / 월세: {founder.rent ?? "-"} / 권리금: {founder.premium ?? 0}
              </div>
            </div>
          ) : (
            <div className="text-gray-500">창업자를 선택하세요.</div>
          )}
        </div>
      </div>

      {/* 이미 추천된 매물 */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold">
            추천된 매물 ({recommended.length}건)
          </h2>
        </div>

        {recommendedLoading ? (
          <div className="p-4 text-gray-500">불러오는 중...</div>
        ) : recommended.length === 0 ? (
          <div className="p-4">아직 추천된 매물이 없습니다.</div>
        ) : (
          <ul className="divide-y rounded border">
            {recommended.map((r) => (
              <li key={r.matching_id} className="p-3 flex items-start gap-3">
                <div className="flex-1">
                  <div className="font-medium">
                    {r.property?.store_name ?? "-"}
                  </div>
                  <div className="text-sm text-gray-600">
                    {r.property?.sido ?? ""} {r.property?.sigungu ?? ""}{" "}
                    {r.property?.beopjeongdong ?? ""} {r.property?.jibun ?? ""}
                  </div>
                  <div className="text-sm">
                    면적 {r.property?.area ?? "-"}㎡ / 보증금{" "}
                    {r.property?.deposit ?? "-"} / 월세{" "}
                    {r.property?.rent ?? "-"} / 권리금{" "}
                    {r.property?.premium ?? 0}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className={`border rounded px-2 py-1 ${
                      r.is_favorite ? "bg-yellow-100" : ""
                    }`}
                    onClick={() => toggleFlag(r.matching_id, "is_favorite")}
                  >
                    ★
                  </button>
                  <button
                    className={`border rounded px-2 py-1 ${
                      r.exclude_from_print ? "bg-gray-200" : ""
                    }`}
                    onClick={() =>
                      toggleFlag(r.matching_id, "exclude_from_print")
                    }
                  >
                    인쇄제외
                  </button>
                  <button
                    className="border rounded px-3 py-1"
                    onClick={() => cancelRecommendation(r.property_id)}
                  >
                    추천 취소
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 컨트롤 바 */}
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
            value={orderBy ?? "received_at"}
            onChange={(e) => {
              setOrderBy(e.target.value as FetchPropsArgs["orderBy"]);
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
            title="오름/내림 전환"
          >
            {asc ? "▲" : "▼"}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-500">페이지당</label>
          <select
            className="border rounded px-2 py-2"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
          >
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>

        <div className="ml-auto text-sm text-gray-600">
          총 {totalCount.toLocaleString()}건 / {page} / {totalPages}페이지
        </div>

        <button
          className="ml-3 border rounded px-4 py-2 disabled:opacity-50"
          onClick={saveRecommendations}
          disabled={!founder || selectedPropertyIds.length === 0}
        >
          추천 저장({selectedPropertyIds.length}건)
        </button>
      </div>

      {/* 후보 매물 목록 */}
      {listLoading ? (
        <div className="p-6 text-gray-500">불러오는 중...</div>
      ) : properties.length === 0 ? (
        <div className="p-6">데이터 없음</div>
      ) : (
        <ul className="divide-y rounded border">
          {properties.map((p) => {
            const checked = selectedPropertyIds.includes(p.property_id);
            return (
              <li key={p.property_id} className="p-3 flex items-start gap-3">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={checked}
                  onChange={() => toggleSelect(p.property_id)}
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
      )}

      {/* 페이지네이터 */}
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
