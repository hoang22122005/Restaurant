import httpClient from './httpClient';
import type { DashboardStats } from '../types';

export const dashboardService = {
  getStats: () => httpClient.get<DashboardStats>('/dashboard').then(r => r.data),
};
