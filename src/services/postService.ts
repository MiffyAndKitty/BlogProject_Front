// services/postService.ts
import apiClient from './apiClient';
import { Numbers } from '../types';

export const addNumbers = async (postData: Numbers): Promise<any> => {
    const accessToken = localStorage.getItem('accessToken')as string || 'defaultToken'; // 또는 상태 관리 시스템에서 가져오기
    if (accessToken !== null) { // accessToken이 null이 아니면 실행
        const response = await apiClient.post<Numbers>('/', postData, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        console.log(response.data);
        return response.data;
    } else {
        // accessToken이 null일 때의 처리 로직
        console.error("No access token available.");
    }
};