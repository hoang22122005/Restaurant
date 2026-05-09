import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Store, MapPin, Utensils, Users,
  UserCheck, FileText, CreditCard, BarChart3,
} from 'lucide-react';
import { cn } from '../utils/cn';

const links = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/restaurants', icon: Store, label: 'Restaurant' },
  { to: '/branches', icon: MapPin, label: 'Branch' },
  { to: '/dishes', icon: Utensils, label: 'Dish' },
  { to: '/employees', icon: UserCheck, label: 'Employee' },
  { to: '/customers', icon: Users, label: 'Customer' },
  { to: '/orders', icon: FileText, label: 'Orders' },
  { to: '/payments', icon: CreditCard, label: 'Payment' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
];

const Sidebar: React.FC = () => (
  <aside className="w-60 bg-white border-r border-gray-100 flex flex-col sticky top-0 h-screen overflow-y-auto">
    <div className="p-5 border-b border-gray-100">
      <div className="flex items-center gap-3">
        <div className="bg-blue-600 h-9 w-9 rounded-xl flex items-center justify-center">
          <Utensils size={18} className="text-white" />
        </div>
        <span className="font-bold text-gray-800 text-sm">QLNH Phân Tán</span>
      </div>
    </div>

    <nav className="flex-1 p-3 space-y-0.5">
      {links.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
              isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
            )
          }
        >
          <Icon size={18} />
          {label}
        </NavLink>
      ))}
    </nav>

    <div className="p-4 border-t border-gray-100">
      <div className="bg-gray-50 px-3 py-2.5 rounded-xl">
        <p className="text-[10px] text-gray-400 font-medium">HỆ QUẢN TRỊ CSDLPT</p>
        <p className="text-xs font-bold text-gray-700">BTL Nhóm 01</p>
      </div>
    </div>
  </aside>
);

export default Sidebar;
