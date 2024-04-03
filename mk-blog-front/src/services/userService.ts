import apiClient from './apiClient';
import { User } from '../types';

export const getUser = async (userId: string): Promise<User> => {
  const response = await apiClient.get<User>(`/users/${userId}`);
  return response.data;
};
