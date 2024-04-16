// services/postService.ts
import apiClient from './apiClient';
import { Numbers } from '../types';

export const addNumbers = async (postData: Numbers): Promise<Numbers> => {
    const response = await apiClient.post<Numbers>('/', postData);
    return response.data;
};