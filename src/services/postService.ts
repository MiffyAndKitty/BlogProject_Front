// services/postService.ts
import apiClient from './apiClient';
import { Numbers } from '../types';

export const addNumbers = async (postData: Numbers): Promise<any> => {
    const response = await apiClient.post<Numbers>('/', postData);
    console.log(response.data);
    return response.data;
};