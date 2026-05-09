import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import DashboardPage from '../pages/DashboardPage';
import RestaurantPage from '../pages/RestaurantPage';
import BranchPage from '../pages/BranchPage';
import DishPage from '../pages/DishPage';
import EmployeePage from '../pages/EmployeePage';
import CustomerPage from '../pages/CustomerPage';
import OrderPage from '../pages/OrderPage';
import PaymentPage from '../pages/PaymentPage';
import ReportPage from '../pages/ReportPage';

const AppRoutes: React.FC = () => (
  <Routes>
    <Route element={<AppLayout />}>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/restaurants" element={<RestaurantPage />} />
      <Route path="/branches" element={<BranchPage />} />
      <Route path="/dishes" element={<DishPage />} />
      <Route path="/employees" element={<EmployeePage />} />
      <Route path="/customers" element={<CustomerPage />} />
      <Route path="/orders" element={<OrderPage />} />
      <Route path="/payments" element={<PaymentPage />} />
      <Route path="/reports" element={<ReportPage />} />
    </Route>
  </Routes>
);

export default AppRoutes;
