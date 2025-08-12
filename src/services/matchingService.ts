// src/services/matchingService.ts

import { supabase } from '../lib/supabaseClient';
import type { 
  Matching, 
  MatchingWithProperty, 
  RawMatchingRow 
} from './types';

/**
 * 매칭 관련 API 서비스
 */
export const matchingService = {
  /**
   * 창업자의 추천 매물 목록 조회
   */
  async getByFounderId(founderId: number): Promise<MatchingWithProperty[]> {
    try {
      const { data, error } = await supabase
        .from('matchings')
        .select(`
          matching_id,
          founder_id,
          property_id,
          matched_at,
          method,
          status,
          score,
          is_favorite,
          exclude_from_print,
          property:properties(*)
        `)
        .eq('founder_id', founderId)
        .order('matched_at', { ascending: false })
        .returns<RawMatchingRow[]>();
      
      if (error) {
        console.error('매칭 조회 에러:', error);
        throw error;
      }
      
      // 배열로 오는 경우 정규화
      const normalizedData: MatchingWithProperty[] = (data || []).map(row => ({
        ...row,
        property: Array.isArray(row.property) 
          ? row.property[0] || null 
          : row.property || null
      }));
      
      return normalizedData;
    } catch (error) {
      console.error('matchingService.getByFounderId 에러:', error);
      throw error;
    }
  },

  /**
   * 매칭 저장 (여러 개 한번에, 중복 무시)
   */
  async saveMatchings(
    founderId: number,
    propertyIds: number[]
  ): Promise<void> {
    try {
      // 매칭 데이터 생성
      const matchings = propertyIds.map(propertyId => ({
        founder_id: founderId,
        property_id: propertyId,
        matched_at: new Date().toISOString(),
        method: '수동',
        status: '추천',
        score: 0,
        is_favorite: false,
        exclude_from_print: false
      }));

      const { error } = await supabase
        .from('matchings')
        .upsert(matchings, {
          onConflict: 'founder_id,property_id',
          ignoreDuplicates: true  // 중복은 무시
        });
      
      if (error) {
        console.error('매칭 저장 에러:', error);
        throw error;
      }
    } catch (error) {
      console.error('matchingService.saveMatchings 에러:', error);
      throw error;
    }
  },

  /**
   * 매칭 삭제 (추천 취소)
   */
  async deleteMatching(
    founderId: number, 
    propertyId: number
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('matchings')
        .delete()
        .match({ 
          founder_id: founderId, 
          property_id: propertyId 
        });
      
      if (error) {
        console.error('매칭 삭제 에러:', error);
        throw error;
      }
    } catch (error) {
      console.error('matchingService.deleteMatching 에러:', error);
      throw error;
    }
  },

  /**
   * 매칭 플래그 업데이트 (즐겨찾기, 인쇄제외)
   */
  async updateFlag(
    matchingId: number,
    field: 'is_favorite' | 'exclude_from_print',
    value: boolean
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('matchings')
        .update({ [field]: value })
        .eq('matching_id', matchingId);
      
      if (error) {
        console.error('매칭 플래그 업데이트 에러:', error);
        throw error;
      }
    } catch (error) {
      console.error('matchingService.updateFlag 에러:', error);
      throw error;
    }
  },

  /**
   * 매칭 상태 변경
   */
  async updateStatus(
    matchingId: number,
    status: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('matchings')
        .update({ status })
        .eq('matching_id', matchingId);
      
      if (error) {
        console.error('매칭 상태 변경 에러:', error);
        throw error;
      }
    } catch (error) {
      console.error('matchingService.updateStatus 에러:', error);
      throw error;
    }
  },

  /**
   * 자동 매칭 실행 (조건 기반)
   */
  async autoMatch(founderId: number): Promise<number[]> {
    try {
      // 1. 창업자 정보 가져오기
      const { data: founder, error: founderError } = await supabase
        .from('founders')
        .select('*')
        .eq('founder_id', founderId)
        .single();
      
      if (founderError) throw founderError;
      if (!founder) throw new Error('창업자를 찾을 수 없습니다');

      // 2. 조건에 맞는 매물 검색
      let query = supabase
        .from('properties')
        .select('property_id')
        .eq('status', 'available');

      // 면적 조건
      if (founder.area) {
        const minArea = founder.area * 0.8;  // -20%
        const maxArea = founder.area * 1.2;  // +20%
        query = query.gte('area', minArea).lte('area', maxArea);
      }

      // 보증금 조건
      if (founder.deposit) {
        query = query.lte('deposit', founder.deposit);
      }

      // 월세 조건
      if (founder.rent) {
        query = query.lte('rent', founder.rent);
      }

      // 업종 조건
      if (founder.business_type) {
        query = query.eq('business_type', founder.business_type);
      }

      const { data: properties, error: propError } = await query;
      
      if (propError) throw propError;

      // 3. 매칭 저장
      if (properties && properties.length > 0) {
        const propertyIds = properties.map(p => p.property_id);
        await this.saveMatchings(founderId, propertyIds);
        return propertyIds;
      }

      return [];
    } catch (error) {
      console.error('matchingService.autoMatch 에러:', error);
      throw error;
    }
  }
};