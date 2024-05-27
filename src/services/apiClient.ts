import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://158.247.206.80:65020',
  headers: {
    'Content-Type': 'application/json',
    // 필요한 경우 추가 헤더 설정
  },
  withCredentials : true
});

export default apiClient;