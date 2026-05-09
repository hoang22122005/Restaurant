import httpClient from './httpClient';
import type { Branch } from '../types';

const BASE = '/branches';

export const branchService = {
  getAll: () => httpClient.get<Branch[]>(BASE).then(r => r.data),
  getById: (id: string) => httpClient.get<Branch>(`${BASE}/${id}`).then(r => r.data),
  create: (data: Partial<Branch>) => httpClient.post<Branch>(BASE, data).then(r => r.data),
  update: (id: string, data: Partial<Branch>) => httpClient.put<Branch>(`${BASE}/${id}`, data).then(r => r.data),
  remove: (id: string) => httpClient.delete(`${BASE}/${id}`),
};
