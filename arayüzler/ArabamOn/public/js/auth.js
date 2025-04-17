/**
 * ArabamOn Kimlik Doğrulama İşlemleri
 */

// API URL - Tüm uygulamada kullanılacak
window.API_URL = '/api';

// Token yönetimi
const TokenManager = {
  // Token'ı localStorage'a kaydet
  setToken(token) {
    localStorage.setItem('token', token);
  },
  
  // Token'ı localStorage'dan al
  getToken() {
    return localStorage.getItem('token');
  },
  
  // Token'ı sil
  removeToken() {
    localStorage.removeItem('token');
  },
  
  // Kullanıcı giriş durumunu ayarla
  setUserData(userData) {
    localStorage.setItem('userData', JSON.stringify(userData));
  },
  
  // Kullanıcı verilerini al
  getUserData() {
    const data = localStorage.getItem('userData');
    return data ? JSON.parse(data) : null;
  },
  
  // Kullanıcı verilerini sil
  removeUserData() {
    localStorage.removeItem('userData');
  },
  
  // Tüm kimlik bilgilerini temizle
  clearAuth() {
    this.removeToken();
    this.removeUserData();
  }
};

// API istekleri için temel fonksiyon
async function apiRequest(endpoint, method = 'GET', data = null) {
  const url = `${window.API_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json'
  };
  
  // Eğer token varsa ekle
  const token = TokenManager.getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const options = {
    method,
    headers
  };
  
  if (data) {
    options.body = JSON.stringify(data);
  }
  
  try {
    const response = await fetch(url, options);
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Bir hata oluştu');
    }
    
    return result;
  } catch (error) {
    console.error('API İsteği Hatası:', error);
    throw error;
  }
}

// Kullanıcı kaydı
async function register(userData) {
  try {
    const result = await apiRequest('/auth/register', 'POST', userData);
    
    if (result.success && result.token) {
      TokenManager.setToken(result.token);
      TokenManager.setUserData(result.data);
      return result.data;
    }
    
    throw new Error(result.message || 'Kayıt işlemi başarısız');
  } catch (error) {
    console.error('Kayıt Hatası:', error);
    throw error;
  }
}

// Kullanıcı girişi
async function login(email, password) {
  try {
    const result = await apiRequest('/auth/login', 'POST', { email, password });
    
    if (result.success && result.token) {
      TokenManager.setToken(result.token);
      TokenManager.setUserData(result.data);
      return result.data;
    }
    
    throw new Error(result.message || 'Giriş işlemi başarısız');
  } catch (error) {
    console.error('Giriş Hatası:', error);
    throw error;
  }
}

// Kullanıcı çıkışı
function logout() {
  try {
    // API'ye çıkış isteği göndermeye gerek yok, token client-side'da silinir
    TokenManager.clearAuth();
    return true;
  } catch (error) {
    console.error('Çıkış Hatası:', error);
    throw error;
  }
}

// Kullanıcı oturum kontrolü
function checkAuth() {
  const token = TokenManager.getToken();
  const userData = TokenManager.getUserData();
  
  return {
    isLoggedIn: Boolean(token && userData),
    userData
  };
}

// Sayfa yüklendiğinde çalışacak otomatik oturum kontrolü
document.addEventListener('DOMContentLoaded', function() {
  // Oturum durumunu kontrol et
  const { isLoggedIn, userData } = checkAuth();
  
  // Sayfaya göre yönlendirme yap
  const currentPath = window.location.pathname;
  
  if (isLoggedIn) {
    // Eğer login/register sayfalarındaysa ve giriş yapılmışsa, panele yönlendir
    if (currentPath.includes('login.html') || currentPath.includes('register.html')) {
      redirectUserByRole(userData.role);
    }
  } else {
    // Eğer korumalı bir sayfadaysa ve giriş yapılmamışsa, login sayfasına yönlendir
    if (
      currentPath.includes('admin-dashboard.html') ||
      currentPath.includes('business-dashboard.html') ||
      currentPath.includes('profile.html')
    ) {
      window.location.href = '/login.html';
    }
  }
  
  // Çıkış butonunu kontrol et
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
      logout();
      window.location.href = '/login.html';
    });
  }
});

// Kullanıcı rolüne göre yönlendirme
function redirectUserByRole(role) {
  switch (role) {
    case 'admin':
      window.location.href = '/admin-dashboard.html';
      break;
    case 'business':
      window.location.href = '/business-dashboard.html';
      break;
    default:
      window.location.href = '/profile.html';
  }
}

// Dışa aktarma
window.Auth = {
  register,
  login,
  logout,
  checkAuth,
  TokenManager
}; 