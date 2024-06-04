import apiClient from './apiClient';
import { Numbers} from '../types';

// 토큰을 저장하는 위치 (예: 로컬 스토리지, 상태 관리 등)
const getToken = () => {
  return localStorage.getItem('accessToken');
};
/**
 * 로그아웃
 * @returns 
 */
export const getLogoutAuth = async (): Promise<Numbers> => {
  const token = getToken();
  const response = await apiClient.get<Numbers>(`/auth/logout`,{
    headers: {
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
export const getGoogleLogin = async (): Promise<Numbers> => {
  const response = await apiClient.get<Numbers>(`/auth/google`);
  console.log(response);
  return response.data;
};

/**
 * 게시글 목록
 * @returns 
 */
export const getPosts = async (): Promise<Numbers> => {
  const token = getToken();
  const response = await apiClient.get<Numbers>(`/board/new`,{
    headers: {
      'Authorization': `${token}`,
    },
  });
  console.log(response);
  return response.data;
};