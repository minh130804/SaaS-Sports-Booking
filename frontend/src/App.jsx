import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import AdminLogin from './pages/auth/AdminLogin';
import TenantLogin from './pages/auth/TenantLogin';

import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import CreateTenant from './pages/admin/CreateTenant';
import TenantList from './pages/admin/TenantList';
import PlanList from './pages/admin/PlanList';
import SubscriptionPaymentList from './pages/admin/SubscriptionPaymentList';

import OwnerLayout from './layouts/OwnerLayout';
import OwnerDashboard from './pages/owner/OwnerDashboard';
import CustomerLayout from './layouts/CustomerLayout';
import FieldList from './pages/owner/FieldList';
import StaffList from './pages/owner/StaffList';
import PlanSelection from './pages/owner/PlanSelection';
import SubscriptionResult from './pages/owner/SubscriptionResult';
import CustomerHome from './pages/customer/CustomerHome';
import FieldBooking from './pages/customer/FieldBooking';
import BookingHistory from './pages/customer/BookingHistory'; 
import FieldsPage from './pages/customer/FieldsPage';
import PaymentResult from './pages/customer/PaymentResult';
import Profile from './pages/customer/Profile';
import BookingManagement from './pages/owner/BookingManagement';
import OfflineBooking from './pages/owner/OfflineBooking';

import Customers from './pages/owner/Customers';
import Settings from './pages/owner/Settings';

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Navigate to="/admin/login" replace />} />

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="tenants" element={<TenantList />} />
            <Route path="tenants/create" element={<CreateTenant />} />
            <Route path="plans" element={<PlanList />} />
            <Route path="payments" element={<SubscriptionPaymentList />} />
        </Route>

        <Route path="/:domain/login" element={<TenantLogin />} />
        
        <Route element={<CustomerLayout />}>
            <Route path="/:domain" element={<CustomerHome />} />
            <Route path="/:domain/fields" element={<FieldsPage />} />
            <Route path="/:domain/booking" element={<FieldBooking />} />
            <Route path="/:domain/history" element={<BookingHistory />} />
            <Route path="/:domain/payment-result" element={<PaymentResult />} />
            <Route path="/:domain/profile" element={<Profile />} />
        </Route>

        <Route element={<OwnerLayout />}>
            <Route path="/:domain/owner/dashboard" element={<OwnerDashboard />} />
            <Route path="/:domain/owner/fields" element={<FieldList />} />
            <Route path="/:domain/owner/staffs" element={<StaffList />} />
            <Route path="/:domain/owner/plans" element={<PlanSelection />} />
            <Route path="/:domain/owner/subscription-result" element={<SubscriptionResult />} />
            <Route path="/:domain/owner/bookings" element={<BookingManagement />} />
            <Route path="/:domain/owner/offline-booking" element={<OfflineBooking />} />
            <Route path="/:domain/owner/customers" element={<Customers />} />
            <Route path="/:domain/owner/profile" element={<Profile />} />
            <Route path="/:domain/owner/settings" element={<Settings />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;