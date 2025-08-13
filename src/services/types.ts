// src/services/types.ts

// ============ 기본 엔티티 타입 ============

export interface Founder {
  founder_id: number;
  name?: string | null;
  contact?: string | null;
  area?: number | null;
  deposit?: number | null;
  rent?: number | null;
  premium?: number | null;
  business_type?: string | null;
  preferred_property?: string | null;
  status?: string | null;
  category?: string | null;
  floor?: string | null;
  note?: string | null;
  received_at?: string | null;
}

export interface Property {
  property_id: number;
  property_code?: string | null;
  received_at?: string | null;
  
  // 위치 정보
  sido?: string | null;
  sigungu?: string | null;
  beopjeongdong?: string | null;
  jibun?: string | null;
  
  // 매물 정보
  store_name?: string | null;
  business_type?: string | null;
  status?: string | null;
  floor?: string | null;
  area?: number | null;
  
  // 금액 정보
  deposit?: number | null;
  rent?: number | null;
  premium?: number | null;
  maintenance_fee?: number | null;
  
  // 관계 정보
  landlord_id?: number | null;
  business_owner_id?: number | null;
  manager_id?: number | null;
  
  // 기타
  notes?: string | null;
  youtube_url?: string | null;
}

export interface Matching {
  matching_id: number;
  founder_id: number;
  property_id: number;
  matched_at: string | null;
  method: string | null;
  status: string | null;
  score: number | null;
  is_favorite: boolean | null;
  exclude_from_print: boolean | null;
}

// 조합된 타입 (매칭과 매물 정보)
export interface MatchingWithProperty extends Matching {
  property: Property | null;
}

// Supabase 조인 결과용 (배열로 올 수 있음)
export type RawMatchingRow = Matching & { 
  property: Property | Property[] | null 
};

// fetchProperties 함수용 타입
export interface FetchPropsArgs {
  page: number;
  pageSize: number;
  keyword?: string;
  orderBy?: 'received_at' | 'area' | 'deposit' | 'rent';
  asc?: boolean;
}

// ============ 유틸리티 타입 ============

export interface PaginationParams {
  page: number;
  pageSize: number;
  orderBy?: string;
  asc?: boolean;
  keyword?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  totalPages: number;
}

// ============ 필터/검색 타입 ============

export interface PropertyFilters {
  status?: string;
  sido?: string;
  sigungu?: string;
  businessType?: string;
  minArea?: number;
  maxArea?: number;
  minDeposit?: number;
  maxDeposit?: number;
  minRent?: number;
  maxRent?: number;
  keyword?: string;
}

export interface FounderFilters {
  status?: string;
  category?: string;
  businessType?: string;
  keyword?: string;
}