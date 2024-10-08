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

  return response.data;
};


/**
 * 사용자별 게시글 목록 불러오기
 * @returns 
 */
export const getPosts = async (nickname:string, page?:number, cursor?:string, isBefore?:boolean, categoryID?:string, query?: string,sort?: string): Promise<any> => {
  const token = getToken();
  let url  = `/board/list/:${nickname}`;
  const params: Record<string, any> = {};

  if(cursor){
    params.cursor = cursor;
  }
  if(page){
    params.page = page;
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

  
  return response;

};

/**
 * 사용자별 임시저장 게시글 목록 불러오기
 * @param pageSize 
 * @param page 
 * @param cursor 
 * @param isBefore 
 * @returns 
 */
export const getTempPostList = async (pageSize?:number, page?:number,cursor?:string, isBefore?:boolean): Promise<any> => {
  const token = getToken();
  let url  = `/draft/list`;
  const params: Record<string, any> = {};

  if(pageSize){
    params['page-size'] = pageSize;
  }
  if(page){
    params.page = page;
  }
  if(cursor){
    params.cursor = cursor;
  }
  if(isBefore){
    params['is-before'] = isBefore;
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


  return response;

};
/**
 * 게시글 목록 불러오기
 * @returns 
 */
export const getALLPosts = async (pageSize:number,page:number, cursor?:string, isBefore?:boolean, categoryID?:string, query?: string, sort?: string, tag?:string): Promise<any> => {
  const token = getToken();
  let url  = `/board/list/`;
  const params: Record<string, any> = {};
  if(pageSize){
    params['page-size'] = pageSize;
  }
  if(page){
    params.page = page;
  }
  if(tag){
    params.tag = tag;
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

  return response.data;

};
/**
 * 임시저장 게시글 상세
 * @returns 
 */
export const getTempPost = async (draftId:string): Promise<any> => {
  const token = getToken();
  let response;

  if(token ===null ){
    response = await apiClient.get<any>(`/draft/:${draftId}`,{
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }else{
    response = await apiClient.get<any>(`/draft/:${draftId}`,{
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${token}`,
      },
    });
  }

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
 
  return response.data;
};
/**
 * 지난 주 동안 가장 많은 팔로워를 보유한 블로거의 목록과 그들의 팔로워 수를 조회합니다.
  만약 블로거의 수가 지정한 limit에 미치지 못할 경우, 추가 태그가 0점으로 채워집니다.
 * @returns 
 */
export const getPopFollower = async (): Promise<any> => {
  const response = await apiClient.get<any>(`/users/top-followers`,{
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return response.data;
};

/**
 * 사용자 프로필 가져오기
 * @returns 
 */
export const getMyProfile = async (email: string): Promise<any> => {
  const token = getToken();
  const url = `/users/:${email}`;
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

  return response.data;
};

/**
 * 닉네임으로 사용자의 프로필 가져오기
 * @param nickname 
 * @returns 
 */
export const getProfiles = async (nickname: string): Promise<any> => {
  const token = getToken();
  const url = `/users/nickname/:${nickname}`;
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


  return response.data;
};
/**
 * 팔로우/팔로워 목록 가져오기
 * @returns 
 */
export const getFollow = async (email: string,page: number): Promise<any> => {
  const token = getToken();
  const url = `/users/:${email}/follow?page=${page}&pageSize=`;
  let response;

  if(token ===null ){
    response = await apiClient.get<any>(url,{
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }else{
    response = await apiClient.get(url,{
      headers:{
        'Authorization': `${token}`,
      }
    });
  }
 


  return response.data;
};

/**
 * 특정 ID의 알림 정보 조회
 * @returns 
 */
export const getNotification = async (notificationId:string): Promise<any> => {
  const token = getToken();
  const url = `/notifications/:${notificationId}`;
  let response;

  response = await apiClient.get(url,{
    headers:{
      'Authorization': `${token}`,
    }
  });


  return response.data;
};

/**
 * 유저의 모든 알림 정보 리스트 조회
 * @returns 
 */
export const getNotificationsList = async (sort?:string, pageSize?:number, cursor?:string, isBefore?:boolean, page?:number): Promise<any> => {
  const token = getToken();
  let url = `/notifications/list`;
  const params: Record<string, any> = {};
  if(sort){
    params['sort'] = sort;
  }
  if(pageSize){
    params['page-size'] = pageSize;
  }
  if(cursor){
    params.cursor = cursor;
  }
  if(page){
    params.page = page;
  }
  if(isBefore){
    params['is-before'] = isBefore;
  }
  const queryString = new URLSearchParams(params).toString();
  if (queryString) {
    url += `?${queryString}`;
  }
  let response;

  response = await apiClient.get(url,{
    headers:{
      'Authorization': `${token}`,
    }
  });


  return response.data;
};

/**
 * 특정 게시글의 댓글 조회
 * @returns 
 */
export const getComments = async (boardId:string, sort?:string, pageSize?:number, cursor?:string, isBefore?:boolean): Promise<any> => {

  const token = getToken();
  let url = `/board/:${boardId}/comments`;
  const params: Record<string, any> = {};

  if(sort){
    params['sort'] = sort;
  }

  if(pageSize){
    params['page-size'] = pageSize;
  }
  if(cursor){
    params.cursor = cursor;
  }
  if(isBefore){
    params['is-before'] = isBefore;
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

  return response.data;
};

/**
 * 특정 댓글의 답글 조회
 * @returns 
 */
export const getCommentReplies = async (parentCommentId:string, sort?:string, pageSize?:number, cursor?:string, isBefore?:boolean): Promise<any> => {
  const token = getToken();
  let url = `/comment/:${parentCommentId}/replies`;
  const params: Record<string, any> = {};

  if(sort){
    params['sort'] = sort;
  }

  if(pageSize){
    params['page-size'] = pageSize;
  }
  if(cursor){
    params.cursor = cursor;
  }
  if(isBefore){
    params['is-before'] = isBefore;
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

  return response.data;
};

/**
 * 해당 임시 저장된 게시글이 현재 로그인한 유저의 게시글인지 확인합니다.
 * @param draftId 
 * @returns 
 */
export const getIsTempPostDraftId = async (draftId: string): Promise<any> => {
  const token = getToken();
  const url = `/draft/:${draftId}/user-check`;
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

  return response.data;
}