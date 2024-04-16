import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://13.125.96.119:65020',
  headers: {
    'Content-Type': 'application/json',
    // 필요한 경우 추가 헤더 설정
  },
});

export default apiClient;