import apiClient from './apiClient';
import * as TYPES from '../types/index';
import axios from 'axios';

const multipart = axios.create({
  baseURL: 'http://158.247.206.80:65020',
  headers: {
    'Content-Type': 'multipart/form-data',
    // 필요한 경우 추가 헤더 설정
  },
  withCredentials : true
});

// 토큰을 저장하는 위치 (예: 로컬 스토리지, 상태 관리 등)
const getToken = () => {
  return localStorage.getItem('accessToken');
};

/**
 * 게시글 수정
 * @returns 
 */
export const fixPost = async (postData: FormData): Promise<any> => {
  const token = getToken();
  const response = await multipart.put<any>(`/board`,postData,{
    headers: {
      'Content-Type': 'multipart/form-data',
      'Authorization': `${token}`,
    },
  });
  console.log(response);
  return response;

};

/**
 * 카테고리 수정
 * @returns 
 */
export const updateCategory = async (postData: TYPES.changeCategory): Promise<any> => {
  const token = getToken();
  const response = await apiClient.put<TYPES.changeCategory>(`/category/name`,postData,{
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `${token}`,
    },
  });
  console.log(response);
  return response;

};