import apiClient from './apiClient';
import { Numbers } from '../types';

export const getNumber = async (): Promise<Numbers> => {
  const response = await apiClient.get<Numbers>(`/`);
  return response.data;
};
