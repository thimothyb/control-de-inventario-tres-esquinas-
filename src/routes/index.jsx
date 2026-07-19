import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '../components/Home';
import Layout from '../components/Layout';
import Login from '../components/Auth/Login';
import ForgotPassword from '../components/Auth/ForgotPassword';
import ResetPassword from '../components/Auth/ResetPassword';
import Dashboard from '../components/Dashboard';
import DashboardRedirect from '../components/DashboardRedirect';
import Products from '../components/Products';
import Providers from '../components/Providers';
import Sales from '../components/Sales';
import Debts from '../components/Debts';
import Clients from '../components/Clients';
import SupplierDebts from '../components/SupplierDebts';
import ClientDebts from '../components/ClientDebts';
import Categories from '../components/Categories';
import Reports from '../components/Reports';
import Users from '../components/Users';
import Billing from '../components/Billing';
import ProtectedRoute from '../components/ProtectedRoute';
import Shop from '../components/Shop';
import Cart from '../components/Cart';
import UserLayout from '../components/UserLayout';

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/login" element={<Login />} />
    <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route path="/reset-password" element={<ResetPassword />} />

    <Route path="/dashboard" element={<ProtectedRoute><DashboardRedirect /></ProtectedRoute>} />

    <Route path="/admin/dashboard" element={<ProtectedRoute adminOnly><Layout><Dashboard /></Layout></ProtectedRoute>} />
    <Route path="/admin/products" element={<ProtectedRoute adminOnly><Layout><Products /></Layout></ProtectedRoute>} />
    <Route path="/admin/providers" element={<ProtectedRoute adminOnly><Layout><Providers /></Layout></ProtectedRoute>} />
    <Route path="/admin/sales" element={<ProtectedRoute adminOnly><Layout><Sales /></Layout></ProtectedRoute>} />
    <Route path="/admin/debts" element={<ProtectedRoute adminOnly><Layout><Debts /></Layout></ProtectedRoute>} />
    <Route path="/admin/clients" element={<ProtectedRoute adminOnly><Layout><Clients /></Layout></ProtectedRoute>} />
    <Route path="/admin/supplier-debts" element={<ProtectedRoute adminOnly><Layout><SupplierDebts /></Layout></ProtectedRoute>} />
    <Route path="/admin/client-debts" element={<ProtectedRoute adminOnly><Layout><ClientDebts /></Layout></ProtectedRoute>} />
    <Route path="/admin/categories" element={<ProtectedRoute adminOnly><Layout><Categories /></Layout></ProtectedRoute>} />
    <Route path="/admin/billing" element={<ProtectedRoute adminOnly><Layout><Billing /></Layout></ProtectedRoute>} />
    <Route path="/admin/reports" element={<ProtectedRoute adminOnly><Layout><Reports /></Layout></ProtectedRoute>} />
    <Route path="/admin/users" element={<ProtectedRoute adminOnly><Layout><Users /></Layout></ProtectedRoute>} />

    <Route path="/" element={<ProtectedRoute><UserLayout /></ProtectedRoute>}>
      <Route path="shop" element={<Shop />} />
      <Route path="cart" element={<Cart />} />
      <Route path="clients" element={<Clients />} />
    </Route>
  </Routes>
);

export default AppRoutes;
