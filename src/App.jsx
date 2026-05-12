import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SocketProvider } from './context/SocketContext';
import useAuthStore from './store/useAuthStore';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import RestaurantDashboard from './pages/dashboard/RestaurantDashboard';
import NGODashboard from './pages/dashboard/NGODashboard';
import VolunteerDashboard from './pages/dashboard/VolunteerDashboard';
import AdminPanel from './pages/dashboard/AdminPanel';
import LiveTrackingPage from './pages/LiveTrackingPage';
import NotFound from './pages/NotFound';

import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function ProtectedRoute({ children, roles }) {
  const { user, isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.role)) return <Navigate to={`/dashboard/${user?.role}`} replace />;
  return children;
}

function DashboardRouter() {
  const { user, isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  const routes = {
    restaurant: '/dashboard/restaurant',
    ngo: '/dashboard/ngo',
    volunteer: '/dashboard/volunteer',
    admin: '/dashboard/admin',
  };
  return <Navigate to={routes[user?.role] || '/login'} replace />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <SocketProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#111',
                color: '#fff',
                border: '1px solid #222',
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.875rem',
              },
              success: { iconTheme: { primary: '#22c55e', secondary: '#000' } },
              error: { iconTheme: { primary: '#ef4444', secondary: '#000' } },
            }}
          />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/dashboard" element={<DashboardRouter />} />
            <Route path="/dashboard/restaurant" element={
              <ProtectedRoute roles={['restaurant']}>
                <RestaurantDashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/ngo" element={
              <ProtectedRoute roles={['ngo']}>
                <NGODashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/volunteer" element={
              <ProtectedRoute roles={['volunteer']}>
                <VolunteerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/admin" element={
              <ProtectedRoute roles={['admin']}>
                <AdminPanel />
              </ProtectedRoute>
            } />
            <Route path="/tracking/:id" element={<LiveTrackingPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </SocketProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
