// services/postService.ts
import apiClient from './apiClient';
import { SignUpData,CheckDuplicatedData,loginData,newPost } from '../types';

// 토큰을 저장하는 위치 (예: 로컬 스토리지, 상태 관리 등)
const getToken = () => {
    return localStorage.getItem('accessToken');
};

export const setSignUp = async (postData: SignUpData): Promise<any> => {
    const response = await apiClient.post<SignUpData>('/auth/sign', postData);
        console.log(response.data);
        return response.data;
};

export const checkDuplicated = async (postData: CheckDuplicatedData): Promise<any> => {
    const response = await apiClient.post<CheckDuplicatedData>('/users/duplication', postData);
        console.log(response.data);
        return response.data;
};

export const setLogin = async (postData: loginData): Promise<any> => {
    const response = await apiClient.post<loginData>('/auth/login', postData);
        console.log(response);
        return response;
};
/**
 * 게시글 저장
 * @param postData 
 * @returns 
 */
export const saveNewPost = async (postData: newPost): Promise<any> => {
    const token = getToken();
    const response = await apiClient.post<loginData>('/board/new', postData,{
        headers: {
            'Authorization': `${token}`,
          },
    });
        console.log(response);
        return response;
};