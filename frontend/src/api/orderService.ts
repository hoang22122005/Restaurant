import httpClient from './httpClient';
import type { Order } from '../types';

const BASE = '/orders';

export const orderService = {
  getAll: (branchID?: string) =>
    httpClient.get<Order[]>(BASE, { params: branchID ? { branchID } : {} }).then(r => r.data),
  getById: (id: string) => httpClient.get<Order>(`${BASE}/${id}`).then(r => r.data),
  create: (data: Partial<Order>) => httpClient.post<Order>(BASE, data).then(r => r.data),
  update: (id: string, data: Partial<Order>) => httpClient.put<Order>(`${BASE}/${id}`, data).then(r => r.data),
  remove: (id: string) => httpClient.delete(`${BASE}/${id}`),
};
