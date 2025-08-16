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

// ============ 기존 types.ts 끝에 추가할 내용 ============

// ============ 개선된 필터 타입 ============

// 매물 필터 (기존 필드명 사용)
export interface PropertyFilter {
  // 범위 필터
  area?: { min: number; max: number };        // 면적 범위
  deposit?: { min: number; max: number };     // 보증금 범위
  rent?: { min: number; max: number };        // 월세 범위
  premium?: { min: number; max: number };     // 권리금 범위
  
  // 층수 필터 (floor가 string이므로 다르게 처리)
  floors?: string[];                          // 층수 (복수 선택) 예: ["1층", "2층", "지하"]
  
  // 선택 필터
  business_types?: string[];                  // 업종 (복수 선택)
  status?: string[];                          // 상태 필터
  
  // 위치 필터
  sido?: string;
  sigungu?: string;
  
  // 텍스트 검색
  keyword?: string;                           // store_name, notes 등 검색
  
  // 제외 필터
  excludeStatus?: string[];                   // 제외할 상태들 예: ["계약완료", "진행종료"]
}

// 저장된 필터 프리셋
export interface FilterPreset {
  id: string;
  name: string;
  filter: PropertyFilter;
  created_at: string;
  is_default?: boolean;
}

// 창업자 검색용 확장 타입
export interface FounderSearchParams {
  searchTerm?: string;      // name, contact 검색
  business_type?: string;   // 업종 필터
  status?: string;          // 상태 필터
  category?: string;        // 카테고리 필터
  // 예산 범위 필터
  minDeposit?: number;
  maxDeposit?: number;
  minRent?: number;
  maxRent?: number;
}

// 매칭 점수 계산용 타입
export interface MatchingScore {
  total: number;
  breakdown: {
    area?: number;         // 면적 매칭 점수
    deposit?: number;      // 보증금 매칭 점수
    rent?: number;         // 월세 매칭 점수
    premium?: number;      // 권리금 매칭 점수
    floor?: number;        // 층수 매칭 점수
    location?: number;     // 위치 매칭 점수
  };
}

// 매칭 추천 요청 타입
export interface MatchingRequest {
  founder_id: number;
  property_ids: number[];
  method: '자동' | '수동';
  auto_match_config?: {
    tolerance_percentage?: number;  // 허용 오차 범위 (%)
    min_score?: number;             // 최소 매칭 점수
    max_results?: number;           // 최대 결과 수
  };
}