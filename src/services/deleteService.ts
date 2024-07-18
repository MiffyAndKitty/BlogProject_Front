import apiClient from './apiClient';
import * as TYPES from '../types/index';

// 토큰을 저장하는 위치 (예: 로컬 스토리지, 상태 관리 등)
const getToken = () => {
  return localStorage.getItem('accessToken');
};

/**
 * 카테고리 삭제
 * @param categoryId 
 * @returns 
 */
export const deleteCategory = async (categoryId:string): Promise<any> => {
  const token = getToken();
  const response = await apiClient.delete<TYPES.deleteCategory>(`/category`, {
    headers:{
      'Authorization': `${token}`,
    },
    data:{
        categoryId
    }
  });
  console.log(categoryId,response.data)
  return response.data;
};