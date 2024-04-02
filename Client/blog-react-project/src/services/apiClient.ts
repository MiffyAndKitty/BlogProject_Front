import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://your-api-server.com/api',
  headers: {
    'Content-Type': 'application/json',
    // 필요한 경우 추가 헤더 설정
  },
});

export default apiClient;