import apiClient from './apiClient';
import * as TYPES from '../types/index';

// 토큰을 저장하는 위치 (예: 로컬 스토리지, 상태 관리 등)
const getToken = () => {
  return localStorage.getItem('accessToken');
};
/**
 * 로그아웃
 * @returns 
 */
export const getLogoutAuth = async (): Promise<any> => {
  const token = getToken();
  const response = await apiClient.get<any>(`/auth/logout`,{
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `${token}`,
    },
  });
  console.log(response);
  return response.data;
};
/**
 * 구글로그인
 * @returns 
 */
export const getGoogleLogin = async (): Promise<any> => {
  const response = await apiClient.get<any>(`/auth/google`,{
    headers: {
      'Content-Type': 'application/json',
    },
  });
  console.log(response);
  return response.data;
};

/**
 * 게시글 목록
 * @returns 
 */
export const getPosts = async (nickname:string, cursor?:string): Promise<any> => {
  const token = getToken();
  let url  = `/board/list/:${nickname}`;
  if(cursor){
    url  = `/board/list/:${nickname}?cursor=${cursor}`;
  }
  const response = await apiClient.get<any>(url,{
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `${token}`,
    },
  });
  console.log(response);
  return response;

};
/**
 * 게시글 상세
 * @returns 
 */
export const getPost = async (boardId:string): Promise<any> => {
  const token = getToken();
  const response = await apiClient.get<any>(`/board/:${boardId}`,{
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `${token}`,
    },
  });
  console.log(response.data);
  return response.data;

};
/**
 * 카테고리 조회
 * @returns 
 */
export const getCategory = async (nickname: string): Promise<TYPES.category[]> => {
  const token = getToken();
  const url = `/category/list/:${(nickname)}`;
  const response = await apiClient.get(url,{
    headers:{
      'Authorization': `${token}`,
    }
  });
  console.log(response,nickname,url);
  return response.data.data;
};