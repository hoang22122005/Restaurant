import httpClient from './httpClient';
import type { Payment } from '../types';

const BASE = '/payments';

export const paymentService = {
  getAll: (orderID?: string) =>
    httpClient.get<Payment[]>(BASE, { params: orderID ? { orderID } : {} }).then(r => r.data),
  getById: (id: string) => httpClient.get<Payment>(`${BASE}/${id}`).then(r => r.data),
  create: (data: Partial<Payment>) => httpClient.post<Payment>(BASE, data).then(r => r.data),
  update: (id: string, data: Partial<Payment>) => httpClient.put<Payment>(`${BASE}/${id}`, data).then(r => r.data),
  remove: (id: string) => httpClient.delete(`${BASE}/${id}`),
};
