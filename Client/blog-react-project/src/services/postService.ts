// services/postService.ts
import apiClient from './apiClient';
import { Post } from '../types';

export const createPost = async (postData: Post): Promise<Post> => {
    const response = await apiClient.post<Post>('/posts', postData);
    return response.data;
};