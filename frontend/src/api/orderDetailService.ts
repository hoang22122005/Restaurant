import httpClient from './httpClient';
import type { OrderDetail } from '../types';

const BASE = '/order-details';

export const orderDetailService = {
  getAll: (orderID?: string) =>
    httpClient.get<OrderDetail[]>(BASE, { params: orderID ? { orderID } : {} }).then(r => r.data),
  getById: (id: string) => httpClient.get<OrderDetail>(`${BASE}/${id}`).then(r => r.data),
  create: (data: Partial<OrderDetail>) => httpClient.post<OrderDetail>(BASE, data).then(r => r.data),
  update: (id: string, data: Partial<OrderDetail>) => httpClient.put<OrderDetail>(`${BASE}/${id}`, data).then(r => r.data),
  remove: (id: string) => httpClient.delete(`${BASE}/${id}`),
};
