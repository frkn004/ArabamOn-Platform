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