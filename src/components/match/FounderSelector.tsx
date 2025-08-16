"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useDebounce } from "@/hooks/useDebounce";
import type { Founder } from "@/services/types";

interface FounderSelectorProps {
  founder: Founder | null;
  loading: boolean;
  onSelect: (founderId: number) => void;
}

export default function FounderSelector({
  founder,
  loading,
  onSelect,
}: FounderSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [founders, setFounders] = useState<Founder[]>([]);
  const [searching, setSearching] = useState(false);
  const [recentFounders, setRecentFounders] = useState<Founder[]>([]);
  const [activeTab, setActiveTab] = useState<"search" | "recent">("recent");

  // 검색어 디바운스
  const debouncedSearch = useDebounce(searchTerm, 300);

  // 창업자 검색 (contact 필드 사용)
  const searchFounders = useCallback(async (term: string) => {
    if (!term.trim()) {
      setFounders([]);
      return;
    }

    setSearching(true);
    try {
      const { data, error } = await supabase
        .from("founders")
        .select("*")
        .or(
          `name.ilike.%${term}%,contact.ilike.%${term}%,business_type.ilike.%${term}%`
        )
        .order("received_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      setFounders(data || []);
    } catch (error) {
      console.error("창업자 검색 실패:", error);
      setFounders([]);
    } finally {
      setSearching(false);
    }
  }, []);

  // 최근 선택한 창업자 불러오기
  const loadRecentFounders = useCallback(async () => {
    try {
      const recentIds = JSON.parse(
        localStorage.getItem("recentFounderIds") || "[]"
      ).slice(0, 5);

      if (recentIds.length === 0) return;

      const { data, error } = await supabase
        .from("founders")
        .select("*")
        .in("founder_id", recentIds)
        .order("received_at", { ascending: false });

      if (error) throw error;

      // localStorage 순서대로 정렬
      const sortedData = recentIds
        .map((id: number) => data?.find((f) => f.founder_id === id))
        .filter(Boolean);

      setRecentFounders(sortedData);
    } catch (error) {
      console.error("최근 창업자 불러오기 실패:", error);
    }
  }, []);

  // 검색어 변경 시
  useEffect(() => {
    if (debouncedSearch) {
      searchFounders(debouncedSearch);
      setActiveTab("search");
    } else {
      setFounders([]);
    }
  }, [debouncedSearch, searchFounders]);

  // 컴포넌트 마운트 시
  useEffect(() => {
    loadRecentFounders();
  }, [loadRecentFounders]);

  // 창업자 선택 처리
  const handleSelect = (selectedFounder: Founder) => {
    onSelect(selectedFounder.founder_id);
    setIsOpen(false);
    setSearchTerm("");

    // 최근 선택 목록 업데이트
    const recentIds = JSON.parse(
      localStorage.getItem("recentFounderIds") || "[]"
    );
    const updatedIds = [
      selectedFounder.founder_id,
      ...recentIds.filter((id: number) => id !== selectedFounder.founder_id),
    ].slice(0, 10);
    localStorage.setItem("recentFounderIds", JSON.stringify(updatedIds));
  };

  // 창업자 카드 컴포넌트
  const FounderCard = ({ f }: { f: Founder }) => (
    <button
      onClick={() => handleSelect(f)}
      className="w-full text-left p-4 border rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all group"
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="font-semibold text-lg group-hover:text-blue-600">
            {f.name || `창업자 #${f.founder_id}`}
          </p>
          <div className="mt-1 space-y-1 text-sm text-gray-600">
            {f.contact && <p>📞 {f.contact}</p>}
            {f.business_type && <p>💼 {f.business_type}</p>}
            {f.preferred_property && <p>🏢 희망매물: {f.preferred_property}</p>}
            {f.floor && <p>📍 희망층: {f.floor}</p>}
            {(f.deposit || f.rent) && (
              <p>
                💰 예산: 보증금 {f.deposit?.toLocaleString()}만원 / 월세{" "}
                {f.rent?.toLocaleString()}만원
              </p>
            )}
            {f.premium && <p>💵 권리금: {f.premium.toLocaleString()}만원</p>}
            {f.status && <p>📋 상태: {f.status}</p>}
          </div>
        </div>
        <div className="ml-4">
          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
            선택
          </span>
        </div>
      </div>
    </button>
  );

  return (
    <div className="border rounded-lg p-4 mb-4 bg-white shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">창업자 선택</h3>
        {founder && (
          <button
            onClick={() => setIsOpen(true)}
            className="text-sm text-blue-600 hover:underline"
          >
            다른 창업자 선택
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : founder ? (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <p className="font-semibold text-xl text-blue-900">
                  {founder.name || `창업자 #${founder.founder_id}`}
                </p>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                  선택됨
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                {founder.contact && <p>📞 {founder.contact}</p>}
                {founder.business_type && <p>💼 {founder.business_type}</p>}
                {founder.preferred_property && (
                  <p>🏢 {founder.preferred_property}</p>
                )}
                {founder.floor && <p>📍 희망층: {founder.floor}</p>}
                {founder.status && <p>📋 상태: {founder.status}</p>}
                {founder.category && <p>📁 카테고리: {founder.category}</p>}
              </div>
              {founder.note && (
                <p className="mt-2 text-sm text-gray-600 italic">
                  📝 {founder.note}
                </p>
              )}
            </div>
            <button
              onClick={() => setIsOpen(true)}
              className="ml-4 px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 text-sm"
            >
              변경
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-medium"
        >
          창업자 선택하기
        </button>
      )}

      {/* 검색 모달 */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
            {/* 헤더 */}
            <div className="px-6 py-4 border-b bg-gradient-to-r from-blue-500 to-indigo-500">
              <h2 className="text-xl font-bold text-white">창업자 검색</h2>
            </div>

            {/* 검색 입력 */}
            <div className="px-6 py-4 border-b bg-gray-50">
              <input
                type="text"
                placeholder="이름, 연락처, 업종으로 검색..."
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
            </div>

            {/* 탭 */}
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab("recent")}
                className={`flex-1 py-3 font-medium transition-colors ${
                  activeTab === "recent"
                    ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                최근 선택
              </button>
              <button
                onClick={() => setActiveTab("search")}
                className={`flex-1 py-3 font-medium transition-colors ${
                  activeTab === "search"
                    ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                검색 결과
              </button>
            </div>

            {/* 내용 */}
            <div className="flex-1 overflow-y-auto p-6">
              {searching ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-500">검색 중...</p>
                </div>
              ) : activeTab === "search" &&
                searchTerm &&
                founders.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-500 mb-3">
                    검색 결과 ({founders.length}건)
                  </p>
                  {founders.map((f) => (
                    <FounderCard key={f.founder_id} f={f} />
                  ))}
                </div>
              ) : activeTab === "search" &&
                searchTerm &&
                founders.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">검색 결과가 없습니다.</p>
                  <p className="text-sm text-gray-400 mt-2">
                    다른 검색어를 입력해보세요.
                  </p>
                </div>
              ) : activeTab === "recent" && recentFounders.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-500 mb-3">
                    최근 선택한 창업자
                  </p>
                  {recentFounders.map((f) => (
                    <FounderCard key={f.founder_id} f={f} />
                  ))}
                </div>
              ) : activeTab === "recent" ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">
                    최근 선택한 창업자가 없습니다.
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    검색을 통해 창업자를 찾아보세요.
                  </p>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-400">
                    검색어를 입력하여 창업자를 찾아보세요.
                  </p>
                </div>
              )}
            </div>

            {/* 하단 버튼 */}
            <div className="px-6 py-4 border-t bg-gray-50">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setSearchTerm("");
                  setActiveTab("recent");
                }}
                className="w-full px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
