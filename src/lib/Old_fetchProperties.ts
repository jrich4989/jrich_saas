// /lib/fetchProperties.ts
import { supabase } from "../lib/supabaseClient";

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
}: FetchPropsArgs): Promise<FetchPropsResult> {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let q = supabase
    .from("properties")
    .select("*", { count: "exact" })
    .not("status", "in", '("진행종료","진행보류","계약완료")');

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

  q = q.order(orderBy, { ascending: asc }).range(from, to);

  const { data, count, error } = await q;
  if (error) throw error;

  return {
    items: (data ?? []) as Property[],
    total: count ?? 0,
    totalPages: Math.max(1, Math.ceil((count ?? 0) / pageSize)),
  };
}
