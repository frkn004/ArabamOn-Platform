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

  // API URL - dinamik olarak ayarlandı
  const currentHost = window.location.hostname;
  const API_PORT = 3001;
  const API_URL = currentHost === 'localhost' || currentHost === '127.0.0.1' 
    ? `http://${currentHost}:${API_PORT}/api` 
    : currentHost === 'arac.duftech.com.tr' 
      ? `https://${currentHost}/api` 
      : `http://${currentHost}/api`;
  
  console.log("API URL:", API_URL);

  // Axios instance
  const api = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json'
    },
    withCredentials: false
  });

  // Request interceptor
  api.interceptors.request.use(
    (config) => {
      const currentToken = localStorage.getItem('token');
      if (currentToken) {
        config.headers.Authorization = `Bearer ${currentToken}`;
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
      console.error("API Hatası:", error.response?.status, error.response?.data || error.message);
      if (error.response && error.response.status === 401) {
        console.log("401 hatası - oturum kapatılıyor");
        logout();
      }
      return Promise.reject(error);
    }
  );

  // Kullanıcı bilgisini yükle
  const loadUser = async () => {
    if (token) {
      try {
        console.log("Kullanıcı bilgisi yükleniyor...");
        const res = await api.get('/auth/me');
        console.log("Kullanıcı bilgisi:", res.data);
        setUser({...res.data.data, token});
        setIsAuthenticated(true);
      } catch (err) {
        console.error("Kullanıcı yükleme hatası:", err.response?.data || err.message);
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
      console.log("Giriş yapılıyor:", `${API_URL}/auth/login`);
      
      const res = await api.post('/auth/login', { email, password });
      
      console.log("Giriş başarılı:", res.data);
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser({...res.data.user, token: res.data.token});
      setIsAuthenticated(true);
      setError(null);
      return res.data;
    } catch (err) {
      console.error("Giriş hatası:", err.response?.data || err.message);
      setError(err.response?.data?.message || 'Giriş başarısız');
      throw err;
    }
  };

  // Kayıt ol
  const register = async (name, email, password) => {
    try {
      const res = await api.post('/auth/register', { name, email, password });
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser({...res.data.user, token: res.data.token});
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
      
      const userRes = await api.post('/auth/register', userData);
      
      // Sonra provider bilgilerini kaydet
      const token = userRes.data.token;
      
      const providerData = {
        name: businessName,
        address: businessAddress,
        phone,
        specialties,
        description
      };
      
      // Token'ı ayarla
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      const providerRes = await api.post('/providers', providerData);
      
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