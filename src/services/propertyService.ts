// src/services/propertyService.ts

import { supabase } from '../lib/supabaseClient';
import type { 
  Property, 
  PropertyFilters, 
  PaginatedResponse 
} from './types';

/**
 * 매물 관련 API 서비스
 */
export const propertyService = {
  /**
   * 매물 목록 조회 (페이지네이션 포함)
   */
  async getList(params: {
    page?: number;
    pageSize?: number;
    filters?: PropertyFilters;
    orderBy?: string;
    asc?: boolean;
  }): Promise<PaginatedResponse<Property>> {
    try {
      const { 
        page = 1, 
        pageSize = 20, 
        filters = {}, 
        orderBy = 'received_at',
        asc = false 
      } = params;

      // 기본 쿼리
      let query = supabase
        .from('properties')
        .select('*', { count: 'exact' });

      // 필터 적용
      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.sido) {
        query = query.eq('sido', filters.sido);
      }

      if (filters.sigungu) {
        query = query.eq('sigungu', filters.sigungu);
      }

      if (filters.businessType) {
        query = query.eq('business_type', filters.businessType);
      }

      // 범위 필터
      if (filters.minArea) {
        query = query.gte('area', filters.minArea);
      }
      if (filters.maxArea) {
        query = query.lte('area', filters.maxArea);
      }

      if (filters.minDeposit) {
        query = query.gte('deposit', filters.minDeposit);
      }
      if (filters.maxDeposit) {
        query = query.lte('deposit', filters.maxDeposit);
      }

      if (filters.minRent) {
        query = query.gte('rent', filters.minRent);
      }
      if (filters.maxRent) {
        query = query.lte('rent', filters.maxRent);
      }

      // 키워드 검색
      if (filters.keyword) {
        query = query.or(
          `store_name.ilike.%${filters.keyword}%,` +
          `jibun.ilike.%${filters.keyword}%,` +
          `notes.ilike.%${filters.keyword}%,` +
          `property_code.ilike.%${filters.keyword}%`
        );
      }

      // 정렬
      query = query.order(orderBy, { ascending: asc });

      // 페이지네이션
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        console.error('매물 목록 조회 에러:', error);
        throw error;
      }

      const total = count || 0;
      const totalPages = Math.ceil(total / pageSize);

      return {
        items: data || [],
        total,
        totalPages
      };
    } catch (error) {
      console.error('propertyService.getList 에러:', error);
      throw error;
    }
  },

  /**
   * 매물 상세 조회
   */
  async getById(propertyId: number): Promise<Property | null> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('property_id', propertyId)
        .single();

      if (error) {
        console.error('매물 조회 에러:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('propertyService.getById 에러:', error);
      throw error;
    }
  },

  /**
   * 매물 생성
   */
  async create(property: Omit<Property, 'property_id'>): Promise<Property> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .insert({
          ...property,
          received_at: property.received_at || new Date().toISOString(),
          status: property.status || 'available'
        })
        .select()
        .single();

      if (error) {
        console.error('매물 생성 에러:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('propertyService.create 에러:', error);
      throw error;
    }
  },

  /**
   * 매물 수정
   */
  async update(
    propertyId: number,
    updates: Partial<Omit<Property, 'property_id'>>
  ): Promise<Property> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .update(updates)
        .eq('property_id', propertyId)
        .select()
        .single();

      if (error) {
        console.error('매물 수정 에러:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('propertyService.update 에러:', error);
      throw error;
    }
  },

  /**
   * 매물 삭제
   */
  async delete(propertyId: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('property_id', propertyId);

      if (error) {
        console.error('매물 삭제 에러:', error);
        throw error;
      }
    } catch (error) {
      console.error('propertyService.delete 에러:', error);
      throw error;
    }
  },

  /**
   * 매물 상태 변경
   */
  async updateStatus(
    propertyId: number,
    status: 'available' | 'contracted' | 'completed'
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('properties')
        .update({ status })
        .eq('property_id', propertyId);

      if (error) {
        console.error('매물 상태 변경 에러:', error);
        throw error;
      }
    } catch (error) {
      console.error('propertyService.updateStatus 에러:', error);
      throw error;
    }
  }
};