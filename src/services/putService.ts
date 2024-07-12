import apiClient from './apiClient';
import * as TYPES from '../types/index';

// 토큰을 저장하는 위치 (예: 로컬 스토리지, 상태 관리 등)
const getToken = () => {
  return localStorage.getItem('accessToken');
};

/**
 * 게시글 수정
 * @returns 
 */
export const fixPost = async (postData: TYPES.newPost): Promise<any> => {
  const token = getToken();
  const response = await apiClient.put<any>(`/board`,postData,{
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `${token}`,
    },
  });
  console.log(response);
  return response;

};
