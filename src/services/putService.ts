import apiClient from './apiClient';
import * as TYPES from '../types/index';
import axios from 'axios';

const multipart = axios.create({
  baseURL: 'https://mk-blogservice.site/api',
  headers: {
    'Content-Type': 'multipart/form-data',
    // 필요한 경우 추가 헤더 설정
  },
  withCredentials : true
});

// 토큰을 저장하는 위치 (예: 로컬 스토리지, 상태 관리 등)
const getToken = () => {
  return sessionStorage.getItem('accessToken');
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
 * 임시저장 게시글 수정
 * @returns 
 */
export const fixTempPost = async (postData: FormData): Promise<any> => {
  const token = getToken();
  const response = await multipart.put<any>(`/draft`,postData,{
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
/**
 * 카테고리 레벨 수정
 * @returns 
 */
export const updateCategoryLevel = async (postData: Object): Promise<any> => {
  const token = getToken();
  const response = await apiClient.put<TYPES.changeCategory>(`/category/Level`,postData,{
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `${token}`,
    },
  });
  console.log(response);
  return response;

};
/**
 * 프로필 데이터 수정
 * @returns 
 */
export const updateProfile = async (postData:Object): Promise<any> => {
  const token = getToken();
  const response = await multipart.put<any>(`/users`,postData,{
    headers: {
      
      'Authorization': `${token}`,
    },
  });
  console.log(response);
  return response;

};

/**
 * 댓글 수정
 * @returns 
 */
export const fixComment = async (postData: object): Promise<any> => {
  const token = getToken();
  const response = await apiClient.put<any>(`/comment`,postData,{
    headers: {
      'Authorization': `${token}`,
    },
  });
  console.log(response);
  return response;

};

