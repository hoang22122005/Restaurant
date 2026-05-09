import httpClient from './httpClient';
import type { RevenueReport } from '../types';

export const reportService = {
  revenueByBranch: () =>
    httpClient.get<RevenueReport[]>('/reports/revenue-by-branch').then(r => r.data),
  revenueByMonth: (branchID?: string, year?: number) =>
    httpClient.get<RevenueReport[]>('/reports/revenue-by-month', {
      params: { ...(branchID && { branchID }), ...(year && { year }) },
    }).then(r => r.data),
};
