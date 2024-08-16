import apiClient from './apiClient';
import * as TYPES from '../types/index';

// 토큰을 저장하는 위치 (예: 로컬 스토리지, 상태 관리 등)
const getToken = () => {
  return sessionStorage.getItem('accessToken');
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
 * 사용자별 게시글 목록 불러오기
 * @returns 
 */
export const getPosts = async (nickname:string, cursor?:string, isBefore?:boolean, categoryID?:string, query?: string,sort?: string): Promise<any> => {
  const token = getToken();
  let url  = `/board/list/:${nickname}`;
  const params: Record<string, any> = {};

  if(cursor){
    params.cursor = cursor;
  }
  if(isBefore){
    params['is-before'] = isBefore;
  }
  if(categoryID){
    params['category-id'] = categoryID;
  }
  if(query){
    params.query = query;
  }
  if(sort){
    params.sort = sort;
  }
  const queryString = new URLSearchParams(params).toString();
  if (queryString) {
    url += `?${queryString}`;
  }
  let response;

  if(token ===null ){
    response = await apiClient.get<any>(url,{
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }else{
    response = await apiClient.get<any>(url,{
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${token}`,
      },
    });
  }

  console.log(response);
  return response;

};
/**
 * 게시글 목록 불러오기
 * @returns 
 */
export const getALLPosts = async (pageSize:number, cursor?:string, isBefore?:boolean, categoryID?:string, query?: string, sort?: string): Promise<any> => {
  const token = getToken();
  let url  = `/board/list/`;
  const params: Record<string, any> = {};
  if(pageSize){
    params['page-size'] = pageSize;
  }
  if(cursor){
    params.cursor = cursor;
  }
  if(isBefore){
    params['is-before'] = isBefore;
  }
  if(categoryID){
    params['category-id'] = categoryID;
  }
  if(query){
    params.query = query;
  }
  if(sort){
    params.sort = sort;
  }
  const queryString = new URLSearchParams(params).toString();
  if (queryString) {
    url += `?${queryString}`;
  }
  
  let response;

  if(token ===null ){
    response = await apiClient.get<any>(url,{
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }else{
    response = await apiClient.get<any>(url,{
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${token}`,
      },
    });
  }


  console.log(response);
  return response;

};
/**
 * 게시글 상세
 * @returns 
 */
export const getPost = async (boardId:string): Promise<any> => {
  const token = getToken();
  let response;

  if(token ===null ){
    response = await apiClient.get<any>(`/board/:${boardId}`,{
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }else{
    response = await apiClient.get<any>(`/board/:${boardId}`,{
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${token}`,
      },
    });
  }
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
  let response;

  if(token ===null ){
    response = await apiClient.get(url,{
      headers:{
        
      }
    });
  }else{
    response = await apiClient.get(url,{
      headers:{
        'Authorization': `${token}`,
      }
    });
  }
  console.log(response,nickname,url);
  return response.data.data;
};

/**
 * 카테고리 전체 조회
 * @returns 
 */
export const getCategories = async (nickname: string): Promise<TYPES.categories[]> => {
  const token = getToken();
  
  const url = `/category/list/:${(nickname)}`;
  let response;

  if(token ===null ){
    response = await apiClient.get(url,{
      headers:{
        
      }
    });
  }else{
    response = await apiClient.get(url,{
      headers:{
        'Authorization': `${token}`,
      }
    });
  }
  
  console.log(response.data.data,nickname,url);
  return response.data.data;
};

/**
 * 1시간 내로 업로드 된 게시글에서 사용된 태그들 중 가장 많이 사용된 태그 10개를 조회합니다. 
 * @returns 
 */
export const getPopTags = async (): Promise<any> => {
  const response = await apiClient.get<any>(`/tag/popularity`,{
    headers: {
      'Content-Type': 'application/json',
    },
  });
  console.log(response);
  return response.data;
};

/**
 * 사용자 프로필 가져오기
 * @returns 
 */
export const getMyProfile = async (nickname: string): Promise<any> => {
  const token = getToken();
  const url = `/users/:${nickname}`;
  let response;

  if(token ===null ){
    response = await apiClient.get(url,{
      headers:{
        
      }
    });
  }else{
    response = await apiClient.get(url,{
      headers:{
        'Authorization': `${token}`,
      }
    });
  }

  console.log(response);
  return response.data;
};
/**
 * 팔로우/팔로워 목록 가져오기
 * @returns 
 */
export const getFollow = async (email: string): Promise<any> => {
  const token = getToken();
  const url = `/users/:${email}/follow?page=1&pageSize=`;
  let response;

  response = await apiClient.get(url,{
    headers:{
      'Authorization': `${token}`,
    }
  });

  console.log(response);
  return response.data;
};