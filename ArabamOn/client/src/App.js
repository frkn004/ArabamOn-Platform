import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Bileşenleri içe aktar
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/user/Dashboard';
import ProviderDashboard from './pages/provider/Dashboard';
import AdminDashboard from './pages/admin/Dashboard';
import ProviderRegister from './pages/ProviderRegister';
import ProviderList from './pages/ProviderList';
import ProviderDetail from './pages/ProviderDetail';
import ServiceList from './pages/ServiceList';
import Appointment from './pages/Appointment';
import NotFound from './pages/NotFound';
import ProviderProfile from './pages/provider/Profile';

// Auth bağlamı
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthContext from './context/AuthContext';

const App = () => {
  return (
    <AuthProvider>
      <div className="d-flex flex-column min-vh-100">
        <Navbar />
        <main className="flex-grow-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/register/provider" element={<ProviderRegister />} />
            <Route path="/providers" element={<ProviderList />} />
            <Route path="/providers/:id" element={<ProviderDetail />} />
            <Route path="/services" element={<ServiceList />} />
            <Route path="/appointments/:id" element={<Appointment />} />
            
            {/* Korumalı rotalar */}
            <Route path="/dashboard" element={
              <PrivateRoute>
                <UserDashboard />
              </PrivateRoute>
            } />
            
            <Route path="/provider/dashboard" element={
              <ProviderRoute>
                <ProviderDashboard />
              </ProviderRoute>
            } />

            <Route path="/provider/profile" element={
              <ProviderRoute>
                <ProviderProfile />
              </ProviderRoute>
            } />
            
            <Route path="/admin/dashboard" element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
};

// Korumalı rotalar için yardımcı bileşenler
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  
  if (loading) return <div className="text-center py-5"><div className="spinner-border" role="status"></div></div>;
  
  if (!isAuthenticated) return <Navigate to="/login" />;
  
  if (user.role === 'provider') return <Navigate to="/provider/dashboard" />;
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" />;
  
  return children;
};

const ProviderRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  
  if (loading) return <div className="text-center py-5"><div className="spinner-border" role="status"></div></div>;
  
  if (!isAuthenticated) return <Navigate to="/login" />;
  
  if (user.role !== 'provider') return <Navigate to="/dashboard" />;
  
  return children;
};

const AdminRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  
  if (loading) return <div className="text-center py-5"><div className="spinner-border" role="status"></div></div>;
  
  if (!isAuthenticated) return <Navigate to="/login" />;
  
  if (user.role !== 'admin') return <Navigate to="/dashboard" />;
  
  return children;
};

export default App; 