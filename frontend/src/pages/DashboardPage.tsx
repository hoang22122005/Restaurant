import React, { useEffect, useState } from 'react';
import { useSite } from '../context/SiteContext';
import { dashboardService } from '../api/dashboardService';
import { reportService } from '../api/reportService';
import type { DashboardStats, RevenueReport } from '../types';
import StatCard from '../components/StatCard';
import ErrorState from '../components/ErrorState';
import { MapPin, Utensils, Users, FileText, DollarSign } from 'lucide-react';
import { formatVND } from '../utils/formatters';

const DashboardPage: React.FC = () => {
  const { siteId } = useSite();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [revenue, setRevenue] = useState<RevenueReport[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [s, r] = await Promise.all([dashboardService.getStats(), reportService.revenueByBranch()]);
      setStats(s);
      setRevenue(r);
    } catch { setError('Failed to load dashboard'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [siteId]);

  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-500 text-sm">Overview of the restaurant management system.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => <div key={i} className="h-24 bg-white rounded-2xl animate-pulse border border-gray-100" />)}
        </div>
      ) : stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard icon={MapPin} label="Branches" value={stats.totalBranches} color="bg-indigo-500" />
          <StatCard icon={Utensils} label="Dishes" value={stats.totalDishes} color="bg-emerald-500" />
          <StatCard icon={Users} label="Customers" value={stats.totalCustomers} color="bg-orange-500" />
          <StatCard icon={FileText} label="Orders" value={stats.totalOrders} color="bg-blue-500" />
          <StatCard icon={DollarSign} label="Revenue" value={formatVND(stats.totalRevenue)} color="bg-rose-500" />
        </div>
      )}

      {revenue.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-base font-bold text-gray-800 mb-4">Revenue by Branch</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead><tr className="border-b border-gray-100">
                <th className="py-2 px-3 text-xs font-semibold text-gray-500 uppercase">Branch</th>
                <th className="py-2 px-3 text-xs font-semibold text-gray-500 uppercase">Orders</th>
                <th className="py-2 px-3 text-xs font-semibold text-gray-500 uppercase text-right">Revenue</th>
              </tr></thead>
              <tbody>
                {revenue.map((r, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="py-2.5 px-3 font-medium text-gray-700">{r.branchName || r.branchID}</td>
                    <td className="py-2.5 px-3 text-gray-600">{r.orderCount}</td>
                    <td className="py-2.5 px-3 text-right font-semibold text-blue-600">{formatVND(r.totalRevenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
