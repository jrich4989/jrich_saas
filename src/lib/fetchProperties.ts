// /lib/fetchProperties.ts
import { supabase } from "../lib/supabaseClient";
import type { PropertyFilter } from "@/services/types";

export interface Property {
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
  property_code?: string | null;
  status?: string | null;
  received_at?: string | null;
  notes?: string | null;
}

export type FetchPropsArgs = {
  page?: number;
  pageSize?: number;
  keyword?: string;
  orderBy?: "received_at" | "area" | "deposit" | "rent";
  asc?: boolean;
  filter?: PropertyFilter; // ✅ filter 추가
};

export type FetchPropsResult = {
  items: Property[];
  total: number;
  totalPages: number;
};

export async function fetchProperties({
  page = 1,
  pageSize = 20,
  keyword = "",
  orderBy = "received_at",
  asc = false,
  filter = {}, // ✅ filter 기본값
}: FetchPropsArgs): Promise<FetchPropsResult> {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let q = supabase
    .from("properties")
    .select("*", { count: "exact" })
    .not("status", "in", '("진행종료","진행보류","계약완료")');

  // 기존 키워드 검색
  if (keyword) {
    const k = `%${keyword}%`;
    q = q.or(
      [
        "store_name.ilike." + k,
        "beopjeongdong.ilike." + k,
        "sigungu.ilike." + k,
        "notes.ilike." + k,
        "property_code.ilike." + k,
      ].join(",")
    );
  }

  // ✅ 필터 적용 추가
  // 면적 필터
  if (filter?.area?.min) {
    q = q.gte("area", filter.area.min);
  }
  if (filter?.area?.max) {
    q = q.lte("area", filter.area.max);
  }

  // 보증금 필터
  if (filter?.deposit?.min) {
    q = q.gte("deposit", filter.deposit.min);
  }
  if (filter?.deposit?.max) {
    q = q.lte("deposit", filter.deposit.max);
  }

  // 월세 필터
  if (filter?.rent?.min) {
    q = q.gte("rent", filter.rent.min);
  }
  if (filter?.rent?.max) {
    q = q.lte("rent", filter.rent.max);
  }

  // 권리금 필터
  if (filter?.premium?.min) {
    q = q.gte("premium", filter.premium.min);
  }
  if (filter?.premium?.max) {
    q = q.lte("premium", filter.premium.max);
  }

  // 층수 필터 (string 타입)
  if (filter?.floors && filter.floors.length > 0) {
    q = q.in("floor", filter.floors);
  }

  // 위치 필터
  if (filter?.sido) {
    q = q.eq("sido", filter.sido);
  }
  if (filter?.sigungu) {
    q = q.eq("sigungu", filter.sigungu);
  }

  // 추가 상태 제외 필터
  if (filter?.excludeStatus && filter.excludeStatus.length > 0) {
    // 기존 제외 상태에 추가로 제외
    const allExcludeStatus = ["진행종료", "진행보류", "계약완료", ...filter.excludeStatus];
    q = q.not("status", "in", `(${allExcludeStatus.map(s => `"${s}"`).join(",")})`);
  }

  // 정렬 및 페이지네이션
  q = q.order(orderBy, { ascending: asc }).range(from, to);

  const { data, count, error } = await q;
  if (error) throw error;

  return {
    items: (data ?? []) as Property[],
    total: count ?? 0,
    totalPages: Math.max(1, Math.ceil((count ?? 0) / pageSize)),
  };
}