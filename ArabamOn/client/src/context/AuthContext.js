
import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

// Context oluştur
const AuthContext = createContext();

// useAuth hook'u ekle
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth hook must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // API URL
  const API_URL = 'http://localhost:3001/api';

  // Axios instance
  const api = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json'
    }
  });

  // Request interceptor
  api.interceptors.request.use(
    (config) => {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        logout();
      }
      return Promise.reject(error);
    }
  );

  // Kullanıcı bilgisini yükle
  const loadUser = async () => {
    if (token) {
      try {
        const res = await api.get('/auth/me');
        setUser(res.data.data);
        setIsAuthenticated(true);
      } catch (err) {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
        setError('Oturum süresi doldu, lütfen tekrar giriş yapın');
      }
    }
    setLoading(false);
  };

  // Sayfa yüklendiğinde kullanıcı bilgisini kontrol et
  useEffect(() => {
    loadUser();
  }, [token]);

  // Giriş yap
  const login = async (email, password) => {
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      setIsAuthenticated(true);
      setError(null);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Giriş başarısız');
      throw err;
    }
  };

  // Kayıt ol
  const register = async (name, email, password) => {
    try {
      const res = await axios.post(`${API_URL}/auth/register`, { name, email, password });
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      setIsAuthenticated(true);
      setError(null);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Kayıt başarısız');
      throw err;
    }
  };

  // Hizmet sağlayıcı kaydı
  const registerProvider = async (name, email, password, businessName, businessAddress, phone, specialties, description) => {
    try {
      // Önce normal kullanıcı kaydı yap
      const userData = {
        name,
        email,
        password,
        role: 'provider'
      };
      
      const userRes = await axios.post(`${API_URL}/auth/register`, userData);
      
      // Sonra provider bilgilerini kaydet
      const token = userRes.data.token;
      
      const providerData = {
        name: businessName,
        address: businessAddress,
        phone,
        specialties,
        description
      };
      
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      };
      
      const providerRes = await axios.post(`${API_URL}/providers`, providerData, config);
      
      return providerRes.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Hizmet sağlayıcı kaydı başarısız');
      throw err;
    }
  };

  // Çıkış yap
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
  };

  // Hata mesajını temizle
  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loading,
        error,
        login,
        register,
        registerProvider,
        logout,
        clearError,
        api
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 