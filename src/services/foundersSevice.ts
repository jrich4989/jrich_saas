// src/services/founderService.ts

import { supabase } from '../lib/supabaseClient';
import type { Founder } from './types';

/**
 * 창업자 관련 API 서비스
 */
export const founderService = {
  /**
   * ID로 창업자 조회
   */
  async getById(founderId: number): Promise<Founder | null> {
    try {
      const { data, error } = await supabase
        .from('founders')
        .select('*')
        .eq('founder_id', founderId)
        .maybeSingle();
      
      if (error) {
        console.error('창업자 조회 에러:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('founderService.getById 에러:', error);
      throw error;
    }
  },

  /**
   * 창업자 목록 조회
   */
  async getList(filters?: {
    status?: string;
    keyword?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{
    data: Founder[];
    count: number;
  }> {
    try {
      let query = supabase
        .from('founders')
        .select('*', { count: 'exact' });
      
      // 필터 적용
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      
      // 키워드 검색 (이름, 연락처, 비고)
      if (filters?.keyword) {
        query = query.or(
          `name.ilike.%${filters.keyword}%,` +
          `contact.ilike.%${filters.keyword}%,` +
          `note.ilike.%${filters.keyword}%`
        );
      }
      
      // 페이지네이션
      if (filters?.page && filters?.pageSize) {
        const from = (filters.page - 1) * filters.pageSize;
        const to = from + filters.pageSize - 1;
        query = query.range(from, to);
      }
      
      // 최신순 정렬
      query = query.order('founder_id', { ascending: false });
      
      const { data, error, count } = await query;
      
      if (error) {
        console.error('창업자 목록 조회 에러:', error);
        throw error;
      }
      
      return {
        data: data || [],
        count: count || 0
      };
    } catch (error) {
      console.error('founderService.getList 에러:', error);
      throw error;
    }
  },

  /**
   * 창업자 생성
   */
  async create(founder: Omit<Founder, 'founder_id'>): Promise<Founder> {
    try {
      const { data, error } = await supabase
        .from('founders')
        .insert({
          ...founder,
          received_at: founder.received_at || new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) {
        console.error('창업자 생성 에러:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('founderService.create 에러:', error);
      throw error;
    }
  },

  /**
   * 창업자 수정
   */
  async update(
    founderId: number, 
    updates: Partial<Omit<Founder, 'founder_id'>>
  ): Promise<Founder> {
    try {
      const { data, error } = await supabase
        .from('founders')
        .update(updates)
        .eq('founder_id', founderId)
        .select()
        .single();
      
      if (error) {
        console.error('창업자 수정 에러:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('founderService.update 에러:', error);
      throw error;
    }
  },

  /**
   * 창업자 삭제
   */
  async delete(founderId: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('founders')
        .delete()
        .eq('founder_id', founderId);
      
      if (error) {
        console.error('창업자 삭제 에러:', error);
        throw error;
      }
    } catch (error) {
      console.error('founderService.delete 에러:', error);
      throw error;
    }
  }
};