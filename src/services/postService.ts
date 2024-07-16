// services/postService.ts
import apiClient from './apiClient';
import * as TYPES from '../types';

// 토큰을 저장하는 위치 (예: 로컬 스토리지, 상태 관리 등)
const getToken = () => {
    return localStorage.getItem('accessToken');
};

export const setSignUp = async (postData: TYPES.SignUpData): Promise<any> => {
    const response = await apiClient.post<TYPES.SignUpData>('/auth/sign', postData);
        console.log(response.data);
        return response.data;
};

export const checkDuplicated = async (postData: TYPES.CheckDuplicatedData): Promise<any> => {
    const response = await apiClient.post<TYPES.CheckDuplicatedData>('/users/duplication', postData);
        console.log(response.data);
        return response.data;
};

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
export const saveNewPost = async (postData: TYPES.newPost): Promise<any> => {
    const token = getToken();
    const response = await apiClient.post<TYPES.newPost>('/board/new', postData,{
        headers: {
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