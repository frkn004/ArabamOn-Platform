/**
 * API İşlemleri
 */

// API URL'leri
const API_BASE_URL = 'https://api.arabamon.com';
const API_ENDPOINTS = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  USER_PROFILE: '/users/profile',
  BUSINESSES: '/businesses',
  BUSINESS_DETAIL: (id) => `/businesses/${id}`,
  APPOINTMENTS: '/appointments',
  APPOINTMENT_DETAIL: (id) => `/appointments/${id}`,
  REVIEWS: '/reviews',
};

// MOCK API - Geçici test datası
const MOCK_USERS = [
  {
    id: '1',
    firstName: 'Test',
    lastName: 'Kullanıcı',
    email: 'test@example.com',
    password: '123456', // Gerçek uygulamada şifreler asla plain text saklanmamalı
    phone: '5551112233',
    role: 'user'
  },
  {
    id: '2',
    firstName: 'Admin',
    lastName: 'Kullanıcı',
    email: 'admin@arabamon.com',
    password: 'admin123',
    phone: '5559998877',
    role: 'admin'
  }
];

// Mock businesses
const MOCK_BUSINESSES = [];

// API istek fonksiyonu
async function apiRequest(endpoint, options = {}) {
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Cookie'leri otomatik olarak gönder
  };
  
  // Token'ı localStorage'dan al ve ekle
  const token = localStorage.getItem('token');
  if (token) {
    defaultOptions.headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Opsiyonları birleştir
  const requestOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };
  
  // MOCK API kontrolü - gerçek bir backend olmadığı için mock cevaplar döneceğiz
  if (!window.useMockAPI) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, requestOptions);
      
      // JSON yanıtını parse et
      const data = await response.json();
      
      // Hata durumunda hata fırlat
      if (!response.ok) {
        throw {
          status: response.status,
          message: data.message || 'Bir hata oluştu',
          errors: data.errors,
        };
      }
      
      return data;
    } catch (error) {
      console.error('API isteği sırasında hata:', error);
      throw error;
    }
  } else {
    // MOCK API cevapları
    return mockApiResponse(endpoint, options);
  }
}

// MOCK API cevapları
async function mockApiResponse(endpoint, options) {
  // Gecikme simülasyonu
  await new Promise(resolve => setTimeout(resolve, 500));
  
  console.log('MOCK API Çağrısı:', endpoint, options);
  
  // Login endpoint'i
  if (endpoint === API_ENDPOINTS.LOGIN && options.method === 'POST') {
    const data = JSON.parse(options.body);
    const user = MOCK_USERS.find(u => u.email === data.email && u.password === data.password);
    
    if (user) {
      // Başarılı giriş
      const token = `mock_token_${user.id}_${Date.now()}`;
      // Kullanıcı bilgilerini saklayalım
      const userData = { ...user };
      delete userData.password; // Şifreyi saklamayalım
      localStorage.setItem('currentUser', JSON.stringify(userData));
      
      return {
        token,
        user: userData,
        message: 'Giriş başarılı'
      };
    } else {
      // Başarısız giriş
      throw {
        status: 401,
        message: 'Geçersiz e-posta veya şifre',
      };
    }
  }
  
  // Register endpoint'i
  if (endpoint === API_ENDPOINTS.REGISTER && options.method === 'POST') {
    const data = JSON.parse(options.body);
    
    // Email kontrolü
    const existingUser = MOCK_USERS.find(u => u.email === data.email);
    if (existingUser) {
      throw {
        status: 400,
        message: 'Bu e-posta adresi zaten kullanımda',
      };
    }
    
    // Yeni kullanıcı oluştur
    const newUser = {
      id: `user_${Date.now()}`,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password, // Gerçek uygulamada şifreler asla plain text saklanmamalı
      phone: data.phone,
      role: 'user'
    };
    
    MOCK_USERS.push(newUser);
    
    // Token oluştur
    const token = `mock_token_${newUser.id}_${Date.now()}`;
    
    // Kullanıcı bilgilerini saklayalım
    const userData = { ...newUser };
    delete userData.password; // Şifreyi saklamayalım
    localStorage.setItem('currentUser', JSON.stringify(userData));
    
    return {
      token,
      user: userData,
      message: 'Kayıt başarılı'
    };
  }
  
  // Logout endpoint'i
  if (endpoint === API_ENDPOINTS.LOGOUT && options.method === 'POST') {
    localStorage.removeItem('currentUser');
    return {
      message: 'Çıkış başarılı'
    };
  }
  
  // User profile endpoint'i
  if (endpoint === API_ENDPOINTS.USER_PROFILE) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
      throw {
        status: 401,
        message: 'Oturum açmanız gerekiyor',
      };
    }
    
    return {
      user: currentUser
    };
  }
  
  // Default cevap
  return {
    message: 'Mock API cevabı',
    success: true
  };
}

/**
 * Kullanıcı Girişi
 * @param {string} email - Kullanıcı e-posta adresi
 * @param {string} password - Kullanıcı şifresi
 * @returns {Promise} - Kullanıcı bilgilerini içeren Promise
 */
async function login(email, password) {
  const response = await apiRequest(API_ENDPOINTS.LOGIN, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  
  // Token'ı localStorage'a kaydet
  if (response.token) {
    localStorage.setItem('token', response.token);
  }
  
  return response;
}

/**
 * Kullanıcı Kaydı
 * @param {Object} userData - Kullanıcı bilgileri
 * @returns {Promise} - Kayıt sonucunu içeren Promise
 */
async function register(userData) {
  const response = await apiRequest(API_ENDPOINTS.REGISTER, {
    method: 'POST',
    body: JSON.stringify(userData),
  });
  
  // Token'ı localStorage'a kaydet
  if (response.token) {
    localStorage.setItem('token', response.token);
  }
  
  return response;
}

/**
 * Kullanıcı Çıkışı
 * @returns {Promise} - Çıkış sonucunu içeren Promise
 */
async function logout() {
  const response = await apiRequest(API_ENDPOINTS.LOGOUT, {
    method: 'POST',
  });
  
  // Token'ı localStorage'dan kaldır
  localStorage.removeItem('token');
  
  return response;
}

/**
 * Kullanıcı Profilini Getir
 * @returns {Promise} - Kullanıcı profilini içeren Promise
 */
async function getUserProfile() {
  return await apiRequest(API_ENDPOINTS.USER_PROFILE);
}

/**
 * Kullanıcı Profilini Güncelle
 * @param {Object} profileData - Güncellenecek profil bilgileri
 * @returns {Promise} - Güncellenmiş profil bilgilerini içeren Promise
 */
async function updateUserProfile(profileData) {
  return await apiRequest(API_ENDPOINTS.USER_PROFILE, {
    method: 'PATCH',
    body: JSON.stringify(profileData),
  });
}

/**
 * İşletmeleri Getir
 * @param {Object} filters - Filtre parametreleri (opsiyonel)
 * @returns {Promise} - İşletme listesini içeren Promise
 */
async function getBusinesses(filters = {}) {
  // Filtreleri query string'e dönüştür
  const queryParams = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, value);
    }
  });
  
  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
  
  return await apiRequest(`${API_ENDPOINTS.BUSINESSES}${queryString}`);
}

/**
 * İşletme Detayını Getir
 * @param {string} id - İşletme ID'si
 * @returns {Promise} - İşletme detayını içeren Promise
 */
async function getBusinessDetail(id) {
  return await apiRequest(API_ENDPOINTS.BUSINESS_DETAIL(id));
}

/**
 * Randevu Oluştur
 * @param {Object} appointmentData - Randevu bilgileri
 * @returns {Promise} - Oluşturulan randevu bilgilerini içeren Promise
 */
async function createAppointment(appointmentData) {
  return await apiRequest(API_ENDPOINTS.APPOINTMENTS, {
    method: 'POST',
    body: JSON.stringify(appointmentData),
  });
}

/**
 * Randevuları Getir
 * @param {Object} filters - Filtre parametreleri (opsiyonel)
 * @returns {Promise} - Randevu listesini içeren Promise
 */
async function getAppointments(filters = {}) {
  // Filtreleri query string'e dönüştür
  const queryParams = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, value);
    }
  });
  
  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
  
  return await apiRequest(`${API_ENDPOINTS.APPOINTMENTS}${queryString}`);
}

/**
 * Randevu Detayını Getir
 * @param {string} id - Randevu ID'si
 * @returns {Promise} - Randevu detayını içeren Promise
 */
async function getAppointmentDetail(id) {
  return await apiRequest(API_ENDPOINTS.APPOINTMENT_DETAIL(id));
}

/**
 * Randevu Güncelle
 * @param {string} id - Randevu ID'si
 * @param {Object} appointmentData - Güncellenecek randevu bilgileri
 * @returns {Promise} - Güncellenmiş randevu bilgilerini içeren Promise
 */
async function updateAppointment(id, appointmentData) {
  return await apiRequest(API_ENDPOINTS.APPOINTMENT_DETAIL(id), {
    method: 'PATCH',
    body: JSON.stringify(appointmentData),
  });
}

/**
 * Randevu İptal Et
 * @param {string} id - Randevu ID'si
 * @returns {Promise} - İptal sonucunu içeren Promise
 */
async function cancelAppointment(id) {
  return await apiRequest(API_ENDPOINTS.APPOINTMENT_DETAIL(id), {
    method: 'DELETE',
  });
}

/**
 * Değerlendirme Oluştur
 * @param {Object} reviewData - Değerlendirme bilgileri
 * @returns {Promise} - Oluşturulan değerlendirme bilgilerini içeren Promise
 */
async function createReview(reviewData) {
  return await apiRequest(API_ENDPOINTS.REVIEWS, {
    method: 'POST',
    body: JSON.stringify(reviewData),
  });
}

/**
 * İşletmeye ait değerlendirmeleri getir
 * @param {string} businessId - İşletme ID'si
 * @returns {Promise} - Değerlendirme listesini içeren Promise
 */
async function getBusinessReviews(businessId) {
  return await apiRequest(`${API_ENDPOINTS.REVIEWS}?businessId=${businessId}`);
}

// Mock API'yi etkinleştir
window.useMockAPI = true;

// Modülleri dışa aktar
window.arabamonAPI = {
  login,
  register,
  logout,
  getUserProfile,
  updateUserProfile,
  getBusinesses,
  getBusinessDetail,
  createAppointment,
  getAppointments,
  getAppointmentDetail,
  updateAppointment,
  cancelAppointment,
  createReview,
  getBusinessReviews,
}; 