import httpClient from './httpClient';
import type { Dish } from '../types';

const BASE = '/dishes';

export const dishService = {
  getAll: () => httpClient.get<Dish[]>(BASE).then(r => r.data),
  getById: (id: string) => httpClient.get<Dish>(`${BASE}/${id}`).then(r => r.data),
  create: (data: Partial<Dish>) => httpClient.post<Dish>(BASE, data).then(r => r.data),
  update: (id: string, data: Partial<Dish>) => httpClient.put<Dish>(`${BASE}/${id}`, data).then(r => r.data),
  remove: (id: string) => httpClient.delete(`${BASE}/${id}`),
};
