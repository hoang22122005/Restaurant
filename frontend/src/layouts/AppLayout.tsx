import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const AppLayout: React.FC = () => (
  <div className="flex min-h-screen bg-slate-50">
    <Sidebar />
    <div className="flex-1 flex flex-col min-w-0">
      <Header />
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  </div>
);

export default AppLayout;
