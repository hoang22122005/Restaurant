import httpClient from './httpClient';
import type { Employee } from '../types';

const BASE = '/employees';

export const employeeService = {
  getAll: (branchID?: string) =>
    httpClient.get<Employee[]>(BASE, { params: branchID ? { branchID } : {} }).then(r => r.data),
  getById: (id: string) => httpClient.get<Employee>(`${BASE}/${id}`).then(r => r.data),
  create: (data: Partial<Employee>) => httpClient.post<Employee>(BASE, data).then(r => r.data),
  update: (id: string, data: Partial<Employee>) => httpClient.put<Employee>(`${BASE}/${id}`, data).then(r => r.data),
  remove: (id: string) => httpClient.delete(`${BASE}/${id}`),
};
