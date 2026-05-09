import React, { useEffect, useState } from 'react';
import { reportService } from '../api/reportService';
import type { RevenueReport } from '../types';
import { useSite } from '../context/SiteContext';
import PageHeader from '../components/PageHeader';
import ErrorState from '../components/ErrorState';
import { formatVND } from '../utils/formatters';
import { SITE_OPTIONS } from '../utils/constants';

const ReportPage: React.FC = () => {
  const { branchId, siteId } = useSite();
  const [byBranch, setByBranch] = useState<RevenueReport[]>([]);
  const [byMonth, setByMonth] = useState<RevenueReport[]>([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [filterBranch, setFilterBranch] = useState(branchId);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try {
      const [b, m] = await Promise.all([
        reportService.revenueByBranch(),
        reportService.revenueByMonth(filterBranch, year),
      ]);
      setByBranch(b);
      setByMonth(m);
    } catch { setError('Failed to load reports'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filterBranch, year, siteId]);

  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="space-y-6">
      <PageHeader title="Reports" description="Revenue analytics" onRefresh={load} />

      <div className="flex gap-3 items-center">
        <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm" value={filterBranch} onChange={e => setFilterBranch(e.target.value)}>
          <option value="">All Branches</option>
          {SITE_OPTIONS.map(s => <option key={s.branchId} value={s.branchId}>{s.label} ({s.branchId})</option>)}
        </select>
        <input type="number" className="px-3 py-2 border border-gray-200 rounded-lg text-sm w-24" value={year} onChange={e => setYear(Number(e.target.value))} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-base font-bold text-gray-800 mb-4">Revenue by Branch</h3>
          {loading ? <div className="h-40 animate-pulse bg-gray-50 rounded-xl" /> : (
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-100">
                <th className="py-2 px-3 text-left text-xs font-semibold text-gray-500 uppercase">Branch</th>
                <th className="py-2 px-3 text-left text-xs font-semibold text-gray-500 uppercase">Orders</th>
                <th className="py-2 px-3 text-right text-xs font-semibold text-gray-500 uppercase">Revenue</th>
              </tr></thead>
              <tbody>
                {byBranch.map((r, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="py-2 px-3 font-medium">{r.branchName || r.branchID}</td>
                    <td className="py-2 px-3 text-gray-600">{r.orderCount}</td>
                    <td className="py-2 px-3 text-right font-semibold text-blue-600">{formatVND(r.totalRevenue)}</td>
                  </tr>
                ))}
                {byBranch.length === 0 && <tr><td colSpan={3} className="py-8 text-center text-gray-400">No data</td></tr>}
              </tbody>
            </table>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-base font-bold text-gray-800 mb-4">Revenue by Month ({year})</h3>
          {loading ? <div className="h-40 animate-pulse bg-gray-50 rounded-xl" /> : (
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-100">
                <th className="py-2 px-3 text-left text-xs font-semibold text-gray-500 uppercase">Period</th>
                <th className="py-2 px-3 text-left text-xs font-semibold text-gray-500 uppercase">Orders</th>
                <th className="py-2 px-3 text-right text-xs font-semibold text-gray-500 uppercase">Revenue</th>
              </tr></thead>
              <tbody>
                {byMonth.map((r, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="py-2 px-3 font-medium">{r.period}</td>
                    <td className="py-2 px-3 text-gray-600">{r.orderCount}</td>
                    <td className="py-2 px-3 text-right font-semibold text-emerald-600">{formatVND(r.totalRevenue)}</td>
                  </tr>
                ))}
                {byMonth.length === 0 && <tr><td colSpan={3} className="py-8 text-center text-gray-400">No data</td></tr>}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportPage;
