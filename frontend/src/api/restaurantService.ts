import httpClient from './httpClient';
import type { Restaurant } from '../types';

const BASE = '/restaurants';

export const restaurantService = {
  getAll: () => httpClient.get<Restaurant[]>(BASE).then(r => r.data),
  getById: (id: string) => httpClient.get<Restaurant>(`${BASE}/${id}`).then(r => r.data),
  create: (data: Partial<Restaurant>) => httpClient.post<Restaurant>(BASE, data).then(r => r.data),
  update: (id: string, data: Partial<Restaurant>) => httpClient.put<Restaurant>(`${BASE}/${id}`, data).then(r => r.data),
  remove: (id: string) => httpClient.delete(`${BASE}/${id}`),
};
