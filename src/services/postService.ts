// services/postService.ts
import apiClient from './apiClient';
import * as TYPES from '../types';
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
 * 회원가입
 * @param postData 
 * @returns 
 */
export const setSignUp = async (postData: TYPES.SignUpData): Promise<any> => {
    const response = await apiClient.post<TYPES.SignUpData>('/auth/sign', postData);
        console.log(response.data);
        return response.data;
};
/**
 * 아이디와 닉네임 중복 확인
 * @param postData 
 * @returns 
 */
export const checkDuplicated = async (postData: TYPES.CheckDuplicatedData): Promise<any> => {
    const response = await apiClient.post<TYPES.CheckDuplicatedData>('/users/duplication', postData);
        console.log(response.data);
        return response.data;
};
/**
 * 로그인
 * @param postData 
 * @returns 
 */
export const setLogin = async (postData: TYPES.loginData): Promise<any> => {
    const response = await apiClient.post<TYPES.loginData>('/auth/login', postData);
        console.log(response);
        return response;
};
/**
 * 게시글 저장
 * @param postData 
 * @returns 
 */
export const saveNewPost = async (postData: FormData): Promise<any> => {
    const token = getToken();
    const response = await multipart.post<TYPES.newPost>('/board/new', postData,{
        headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `${token}`,
          },
    });
        console.log(response);
        return response;
};

/**
 * 카테고리 저장
 * @param postData 
 * @returns 
 */
export const saveNewCategory = async (newCategory: TYPES.newCategory): Promise<any> => {
    const token = getToken();
    const response = await apiClient.post<TYPES.newCategory>('/category', newCategory,{
        headers: {
            'Authorization': `${token}`,
          },
    });
        console.log(response);
        return response;
};

/**
 * 좋아요 추가
 * @param postData 
 * @returns 
 */
export const addLike = async (boardId: Object): Promise<any> => {
    const token = getToken();
    const response = await apiClient.post<TYPES.newCategory>('/board/like', boardId,{
        headers: {
            'Authorization': `${token}`,
          },
    });
        console.log(response);
        return response;
};

/**
 * 좋아요 삭제
 * @param postData 
 * @returns 
 */
export const deleteLike = async (boardId: Object): Promise<any> => {
    const token = getToken();
    const response = await apiClient.post<TYPES.newCategory>('/board/unlike', boardId,{
        headers: {
            'Authorization': `${token}`,
          },
    });
        console.log(response);
        return response;
};
/**
 * 비밀번호 확인
 * @param postData 
 * @returns 
 */
export const checkPassword = async (password: Object): Promise<any> => {
    const token = getToken();
    const response = await apiClient.post<Object>('/users/duplication/password', password,{
        headers: {
            'Authorization': `${token}`,
          },
    });
        console.log(response.data);
        return response.data;
};

/**
 * 팔로우 하기
 * @param postData 
 * @returns 
 */
export const followUser = async (email: Object): Promise<any> => {
    const token = getToken();
    const response = await apiClient.post<TYPES.newCategory>('/users/follow', email,{
        headers: {
            'Authorization': `${token}`,
          },
    });
        console.log(response);
        return response;
};

/**
 * 댓글 작성하기
 * @param postData 
 * @returns 
 */
export const newComment = async (commentData: TYPES.commentData): Promise<any> => {
    const token = getToken();
    const response = await apiClient.post<TYPES.commentData>('/comment', commentData,{
        headers: {
            'Authorization': `${token}`,
          },
    });
        console.log(response);
        return response;
};