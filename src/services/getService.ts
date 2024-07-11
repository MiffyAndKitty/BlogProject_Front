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
export const getPosts = async (nickname:string): Promise<TYPES.newPost[]> => {
  const token = getToken();
  const response = await apiClient.get<TYPES.newPost[]>(`/board/list/${nickname}`,{
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `${token}`,
    },
  });
  console.log(response);
  return response.data;
//임시 데이터 반환 (API를 설정하지 않은 경우)
// return [
//   {  title: '첫 번째 게시물', content: '<p>첫 번째 게시물 내용입니다.</p>', public:true, categoryId:"1", tagNames:['test'], uploaded_files:null},
//   {  title: '두 번째 게시물', content: '<p>두 번째 게시물 내용입니다.</p>' , public:false,categoryId:"2", tagNames:['test'], uploaded_files:null},
//   { title: '세 번째 게시물', content: '<p>세 번째 게시물 내용입니다.</p>' , public:true,categoryId:"3", tagNames:['test'], uploaded_files:null}
// ];
};

/**
 * 카테고리 조회
 * @returns 
 */
export const getCategory = async (): Promise<TYPES.category[]> => {
  const token = getToken();
  const response = await apiClient.get(`/category/list`,{
    headers:{
      'Authorization': `${token}`,
    }
  });
  console.log(response);
  return response.data.data;
};