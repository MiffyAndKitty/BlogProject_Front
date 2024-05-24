// services/postService.ts
import apiClient from './apiClient';
import { SignUpData,CheckDuplicatedData } from '../types';

export const setSignUp = async (postData: SignUpData): Promise<any> => {
    const response = await apiClient.post<SignUpData>('/auth/sign', postData);
        console.log(response.data);
        return response.data;
};

export const checkDuplicated = async (postData: CheckDuplicatedData): Promise<any> => {
    const response = await apiClient.post<SignUpData>('/users/duplication', postData);
        console.log(response.data);
        return response.data;
};