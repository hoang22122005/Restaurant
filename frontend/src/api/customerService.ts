import httpClient from './httpClient';
import type { Customer } from '../types';

const BASE = '/customers';

export const customerService = {
  getAll: (branchID?: string) =>
    httpClient.get<Customer[]>(BASE, { params: branchID ? { branchID } : {} }).then(r => r.data),
  getById: (id: string) => httpClient.get<Customer>(`${BASE}/${id}`).then(r => r.data),
  create: (data: Partial<Customer>) => httpClient.post<Customer>(BASE, data).then(r => r.data),
  update: (id: string, data: Partial<Customer>) => httpClient.put<Customer>(`${BASE}/${id}`, data).then(r => r.data),
  remove: (id: string) => httpClient.delete(`${BASE}/${id}`),
};
