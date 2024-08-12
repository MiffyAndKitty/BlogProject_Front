import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://mk-blogservice.site/api',
  headers: {
    'Content-Type': 'application/json',
    // 필요한 경우 추가 헤더 설정
  },
  withCredentials : true
});

export default apiClient;