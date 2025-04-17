/**
 * Arabamon API Modülü
 * Backend ile frontend arasındaki iletişimi sağlar
 */

const api = {
    baseURL: '/api',
    
    // Token işlemleri
    getToken() {
        return localStorage.getItem('token');
    },
    
    setToken(token) {
        localStorage.setItem('token', token);
    },
    
    removeToken() {
        localStorage.removeItem('token');
    },
    
    // Kullanıcı işlemleri
    getCurrentUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },
    
    setCurrentUser(user) {
        localStorage.setItem('user', JSON.stringify(user));
    },
    
    // HTTP Header oluşturma
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        const token = this.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        return headers;
    },
    
    // Fetch işlemi için helper fonksiyon
    async fetcher(endpoint, options = {}) {
        try {
            const url = this.baseURL + endpoint;
            
            // Default headers
            const headers = {
                ...this.getHeaders(),
                ...options.headers
            };
            
            // Request options
            const requestOptions = {
                ...options,
                headers
            };
            
            // Fetch isteği
            const response = await fetch(url, requestOptions);
            
            // JSON yanıtı
            const data = await response.json();
            
            // Başarısız yanıtları kontrol et
            if (!response.ok) {
                throw new Error(data.message || 'Bir hata oluştu');
            }
            
            return data;
        } catch (error) {
            console.error('API Hatası:', error);
            
            // Ağ hatası varsa ve demo veri mevcutsa kullan
            if (error.message === 'Failed to fetch') {
                console.warn('API bağlantısı başarısız, demo veriler kullanılıyor.');
                return this.getDemoData(endpoint);
            }
            
            throw error;
        }
    },
    
    // HTTP GET isteği
    async get(endpoint) {
        return this.fetcher(endpoint, { method: 'GET' });
    },
    
    // HTTP POST isteği
    async post(endpoint, data) {
        return this.fetcher(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },
    
    // HTTP PUT isteği
    async put(endpoint, data) {
        return this.fetcher(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },
    
    // HTTP DELETE isteği
    async delete(endpoint, data) {
        return this.fetcher(endpoint, {
            method: 'DELETE',
            body: data ? JSON.stringify(data) : undefined
        });
    },
    
    // Demo veri sağlayıcı
    getDemoData(endpoint) {
        console.log('Demo veri kullanılıyor:', endpoint);
        
        // /businesses endpoint'i için demo veri
        if (endpoint.includes('/businesses') && !endpoint.includes('/services') && !endpoint.includes('/reviews') && !endpoint.includes('/appointments')) {
            // Tek bir işletme ID'si varsa
            if (endpoint.match(/\/businesses\/\d+$/)) {
                return {
                    success: true,
                    data: {
                        id: 1,
                        name: 'Merkez Oto Servis',
                        address: 'Atatürk Cad. No:123, Kadıköy/İstanbul',
                        description: 'Tüm araç markalarına profesyonel bakım ve onarım hizmeti sunuyoruz.',
                        phone: '0216 123 45 67',
                        email: 'info@merkezoto.com',
                        website: 'www.merkezoto.com',
                        type: 'otoservis',
                        street: 'Atatürk Cad. No:123',
                        city: 'İstanbul',
                        district: 'Kadıköy',
                        openingHours: {
                            monday: '09:00 - 18:00',
                            tuesday: '09:00 - 18:00',
                            wednesday: '09:00 - 18:00',
                            thursday: '09:00 - 18:00',
                            friday: '09:00 - 18:00',
                            saturday: '10:00 - 15:00',
                            sunday: 'Kapalı'
                        },
                        rating: 4.8,
                        categories: ['Motor', 'Bakım', 'Elektrik'],
                        reviews: 45
                    }
                };
            }
            
            // Tüm işletmeler
            return {
                success: true,
                data: [
                    {
                        id: 1,
                        name: 'Merkez Oto Servis',
                        address: 'Atatürk Cad. No:123, Kadıköy/İstanbul',
                        description: 'Tüm araç markalarına profesyonel bakım ve onarım hizmeti sunuyoruz.',
                        rating: 4.8,
                        categories: ['Motor', 'Bakım', 'Elektrik'],
                        reviews: 45
                    },
                    {
                        id: 2,
                        name: 'Expert Auto Center',
                        address: 'Bağdat Cad. No:45, Maltepe/İstanbul',
                        description: 'Premium araç servisi ve bakım hizmetleri. Profesyonel ekip ile kaliteli hizmet.',
                        rating: 4.6,
                        categories: ['Kaporta', 'Boya', 'Detaylı Bakım'],
                        reviews: 38
                    },
                    {
                        id: 3,
                        name: 'Yeşil Vadi Servis',
                        address: 'Yeşilçam Sok. No:7, Beşiktaş/İstanbul',
                        description: 'Elektrikli ve hibrit araçlar dahil tüm modellere özel bakım ve onarım.',
                        rating: 4.7,
                        categories: ['Elektrikli Araçlar', 'Şarj', 'Bakım'],
                        reviews: 29
                    }
                ]
            };
        }
        
        // /services endpoint'i için demo veri
        if (endpoint.includes('/services')) {
            return {
                success: true,
                data: [
                    {
                        id: 1,
                        name: 'Periyodik Bakım',
                        description: 'Araç üreticisinin belirlediği km aralıklarında yapılması gereken bakım.',
                        price: 750,
                        duration: 120, // dakika
                        businessId: 1
                    },
                    {
                        id: 2,
                        name: 'Yağ Değişimi',
                        description: 'Motor yağı ve filtre değişimi.',
                        price: 350,
                        duration: 30, // dakika
                        businessId: 1
                    },
                    {
                        id: 3,
                        name: 'Fren Bakımı',
                        description: 'Fren sisteminin kontrolü ve gerekli parçaların değişimi.',
                        price: 600,
                        duration: 60, // dakika
                        businessId: 1
                    }
                ]
            };
        }
        
        // /reviews endpoint'i için demo veri
        if (endpoint.includes('/reviews')) {
            return {
                success: true,
                data: [
                    {
                        id: 1,
                        rating: 5,
                        comment: 'Çok memnun kaldım, işlerini profesyonelce yapıyorlar. Kesinlikle tavsiye ederim.',
                        user: 'Ahmet Yılmaz',
                        date: '2023-10-15'
                    },
                    {
                        id: 2,
                        rating: 4,
                        comment: 'Fiyatlar biraz yüksek ama hizmet kalitesi çok iyi.',
                        user: 'Mehmet Demir',
                        date: '2023-09-22'
                    },
                    {
                        id: 3,
                        rating: 5,
                        comment: 'Randevuma tam zamanında alındım, araç temiz teslim edildi. Tekrar geleceğim.',
                        user: 'Ayşe Kaya',
                        date: '2023-10-01'
                    }
                ]
            };
        }
        
        // /appointments endpoint'i için demo veri
        if (endpoint.includes('/appointments')) {
            return {
                success: true,
                data: [
                    {
                        id: 1,
                        date: '2023-11-20',
                        time: '10:00',
                        status: 'onaylandı',
                        serviceName: 'Periyodik Bakım',
                        businessName: 'Merkez Oto Servis',
                        notes: 'Araç yıkama da isteniyor',
                        price: 750
                    },
                    {
                        id: 2,
                        date: '2023-12-05',
                        time: '14:30',
                        status: 'beklemede',
                        serviceName: 'Yağ Değişimi',
                        businessName: 'Expert Auto Center',
                        notes: '',
                        price: 400
                    }
                ]
            };
        }
        
        // Varsayılan boş yanıt
        return {
            success: true,
            data: []
        };
    },
    
    // Auth API'si
    auth: {
        // Kullanıcı girişi
        async login(credentials) {
            try {
                const result = await api.post('/auth/login', credentials);
                api.setToken(result.token);
                api.setCurrentUser(result.data);
                return result;
            } catch (err) {
                throw err;
            }
        },
        
        // Kullanıcı kaydı
        async register(userData) {
            try {
                const result = await api.post('/auth/register', userData);
                api.setToken(result.token);
                api.setCurrentUser(result.data);
                return result;
            } catch (err) {
                throw err;
            }
        },
        
        // Kullanıcı çıkışı
        logout() {
            api.removeToken();
            localStorage.removeItem('user');
            window.location.href = '/login.html';
        },
        
        // Oturum kontrolü
        isLoggedIn() {
            return !!api.getToken();
        },
        
        // Kullanıcı profili
        async getProfile() {
            try {
                return await api.get('/auth/me');
            } catch (err) {
                throw err;
            }
        },
        
        // Profil güncelleme
        async updateProfile(userData) {
            try {
                const result = await api.put('/auth/updatedetails', userData);
                api.setCurrentUser(result.data);
                return result;
            } catch (err) {
                throw err;
            }
        },
        
        // Şifre güncelleme
        async updatePassword(passwordData) {
            try {
                return await api.put('/auth/updatepassword', passwordData);
            } catch (err) {
                throw err;
            }
        }
    },
    
    // İşletme API'si
    businesses: {
        // Tüm işletmeleri getir
        async getAll(params = {}) {
            try {
                let queryString = '';
                if (Object.keys(params).length > 0) {
                    queryString = '?' + new URLSearchParams(params).toString();
                }
                return await api.get(`/businesses${queryString}`);
            } catch (err) {
                throw err;
            }
        },
        
        // Tek bir işletmeyi getir
        async getById(id) {
            try {
                return await api.get(`/businesses/${id}`);
            } catch (err) {
                throw err;
            }
        },
        
        // İşletme oluştur
        async create(businessData) {
            try {
                return await api.post('/businesses', businessData);
            } catch (err) {
                throw err;
            }
        },
        
        // İşletme güncelle
        async update(id, businessData) {
            try {
                return await api.put(`/businesses/${id}`, businessData);
            } catch (err) {
                throw err;
            }
        },
        
        // İşletme sil
        async delete(id) {
            try {
                return await api.delete(`/businesses/${id}`);
            } catch (err) {
                throw err;
            }
        },
        
        // İşletmeye ait hizmetleri getir
        async getServices(businessId) {
            try {
                return await api.get(`/businesses/${businessId}/services`);
            } catch (err) {
                throw err;
            }
        }
    },
    
    // Hizmet API'si
    services: {
        // Tüm hizmetleri getir
        async getAll() {
            try {
                return await api.get('/services');
            } catch (err) {
                throw err;
            }
        },
        
        // Tek bir hizmeti getir
        async getById(id) {
            try {
                return await api.get(`/services/${id}`);
            } catch (err) {
                throw err;
            }
        },
        
        // İşletmeye ait hizmetleri getir
        async getByBusiness(businessId) {
            try {
                return await api.get(`/businesses/${businessId}/services`);
            } catch (err) {
                throw err;
            }
        },
        
        // Hizmet oluştur
        async create(businessId, serviceData) {
            try {
                return await api.post(`/businesses/${businessId}/services`, serviceData);
            } catch (err) {
                throw err;
            }
        },
        
        // Hizmet güncelle
        async update(id, serviceData) {
            try {
                return await api.put(`/services/${id}`, serviceData);
            } catch (err) {
                throw err;
            }
        },
        
        // Hizmet sil
        async delete(id) {
            try {
                return await api.delete(`/services/${id}`);
            } catch (err) {
                throw err;
            }
        }
    },
    
    // Randevu API'si
    appointments: {
        // Kullanıcının randevularını getir
        async getAll() {
            try {
                return await api.get('/appointments');
            } catch (err) {
                throw err;
            }
        },
        
        // İşletmenin randevularını getir
        async getBusinessAppointments(businessId) {
            try {
                return await api.get(`/businesses/${businessId}/appointments`);
            } catch (err) {
                throw err;
            }
        },
        
        // Tek bir randevu getir
        async getById(id) {
            try {
                return await api.get(`/appointments/${id}`);
            } catch (err) {
                throw err;
            }
        },
        
        // Randevu oluştur
        async create(businessId, appointmentData) {
            try {
                return await api.post(`/businesses/${businessId}/appointments`, appointmentData);
            } catch (err) {
                throw err;
            }
        },
        
        // Randevu güncelle
        async update(id, appointmentData) {
            try {
                return await api.put(`/appointments/${id}`, appointmentData);
            } catch (err) {
                throw err;
            }
        },
        
        // Randevu iptal et
        async cancel(id, reason) {
            try {
                return await api.put(`/appointments/${id}/cancel`, { reason });
            } catch (err) {
                throw err;
            }
        }
    },
    
    // Değerlendirme API'si
    reviews: {
        // İşletmeye ait değerlendirmeleri getir
        async getBusinessReviews(businessId) {
            try {
                return await api.get(`/businesses/${businessId}/reviews`);
            } catch (err) {
                throw err;
            }
        },
        
        // Kullanıcının değerlendirmelerini getir
        async getUserReviews() {
            try {
                return await api.get('/reviews');
            } catch (err) {
                throw err;
            }
        },
        
        // Değerlendirme oluştur
        async create(businessId, reviewData) {
            try {
                return await api.post(`/businesses/${businessId}/reviews`, reviewData);
            } catch (err) {
                throw err;
            }
        },
        
        // Değerlendirme güncelle
        async update(id, reviewData) {
            try {
                return await api.put(`/reviews/${id}`, reviewData);
            } catch (err) {
                throw err;
            }
        },
        
        // Değerlendirme sil
        async delete(id) {
            try {
                return await api.delete(`/reviews/${id}`);
            } catch (err) {
                throw err;
            }
        }
    }
};

// Oturum durumuna göre navigasyon güncelleme
function updateNavigation() {
    document.addEventListener('DOMContentLoaded', () => {
        const isLoggedIn = api.auth.isLoggedIn();
        const currentUser = api.getCurrentUser();
        
        const navLoginEl = document.getElementById('navLogin');
        const navRegisterEl = document.getElementById('navRegister');
        const navProfileEl = document.getElementById('navProfile');
        const navLogoutEl = document.getElementById('navLogout');
        const navDashboardEl = document.getElementById('navDashboard');
        
        if (isLoggedIn && currentUser) {
            // Giriş yapılmış
            if (navLoginEl) navLoginEl.style.display = 'none';
            if (navRegisterEl) navRegisterEl.style.display = 'none';
            
            if (navProfileEl) {
                navProfileEl.style.display = 'block';
                navProfileEl.href = currentUser.role === 'business' ? '/business-dashboard.html' : '/profile.html';
            }
            
            if (navLogoutEl) {
                navLogoutEl.style.display = 'block';
                navLogoutEl.addEventListener('click', (e) => {
                    e.preventDefault();
                    api.auth.logout();
                });
            }
            
            if (navDashboardEl) {
                if (currentUser.role === 'admin') {
                    navDashboardEl.style.display = 'block';
                    navDashboardEl.href = '/admin-dashboard.html';
                } else if (currentUser.role === 'business') {
                    navDashboardEl.style.display = 'block';
                    navDashboardEl.href = '/business-dashboard.html';
                } else {
                    navDashboardEl.style.display = 'none';
                }
            }
        } else {
            // Giriş yapılmamış
            if (navLoginEl) navLoginEl.style.display = 'block';
            if (navRegisterEl) navRegisterEl.style.display = 'block';
            if (navProfileEl) navProfileEl.style.display = 'none';
            if (navLogoutEl) navLogoutEl.style.display = 'none';
            if (navDashboardEl) navDashboardEl.style.display = 'none';
        }
    });
}

// Sayfalarda uyarı gösterme
function showAlert(message, type = 'danger') {
    const alertsContainer = document.querySelector('.alerts-container') || document.createElement('div');
    
    if (!document.querySelector('.alerts-container')) {
        alertsContainer.className = 'alerts-container';
        document.body.appendChild(alertsContainer);
    }
    
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show`;
    alert.innerHTML = `${message} <button type="button" class="btn-close" data-bs-dismiss="alert"></button>`;
    
    alertsContainer.appendChild(alert);
    
    // 5 saniye sonra otomatik kapat
    setTimeout(() => {
        alert.remove();
    }, 5000);
}

// Tarih biçimlendirme
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('tr-TR', options);
}

// Global değişkenler
window.api = api;
window.updateNavigation = updateNavigation;
window.showAlert = showAlert;
window.formatDate = formatDate;

// Sayfa yüklendiğinde navigasyonu güncelle
updateNavigation(); 
 * Arabamon API Modülü
 * Backend ile frontend arasındaki iletişimi sağlar
 */

const api = {
    baseURL: '/api',
    
    // Token işlemleri
    getToken() {
        return localStorage.getItem('token');
    },
    
    setToken(token) {
        localStorage.setItem('token', token);
    },
    
    removeToken() {
        localStorage.removeItem('token');
    },
    
    // Kullanıcı işlemleri
    getCurrentUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },
    
    setCurrentUser(user) {
        localStorage.setItem('user', JSON.stringify(user));
    },
    
    // HTTP Header oluşturma
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        const token = this.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        return headers;
    },
    
    // Fetch işlemi için helper fonksiyon
    async fetcher(endpoint, options = {}) {
        try {
            const url = this.baseURL + endpoint;
            
            // Default headers
            const headers = {
                ...this.getHeaders(),
                ...options.headers
            };
            
            // Request options
            const requestOptions = {
                ...options,
                headers
            };
            
            // Fetch isteği
            const response = await fetch(url, requestOptions);
            
            // JSON yanıtı
            const data = await response.json();
            
            // Başarısız yanıtları kontrol et
            if (!response.ok) {
                throw new Error(data.message || 'Bir hata oluştu');
            }
            
            return data;
        } catch (error) {
            console.error('API Hatası:', error);
            
            // Ağ hatası varsa ve demo veri mevcutsa kullan
            if (error.message === 'Failed to fetch') {
                console.warn('API bağlantısı başarısız, demo veriler kullanılıyor.');
                return this.getDemoData(endpoint);
            }
            
            throw error;
        }
    },
    
    // HTTP GET isteği
    async get(endpoint) {
        return this.fetcher(endpoint, { method: 'GET' });
    },
    
    // HTTP POST isteği
    async post(endpoint, data) {
        return this.fetcher(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },
    
    // HTTP PUT isteği
    async put(endpoint, data) {
        return this.fetcher(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },
    
    // HTTP DELETE isteği
    async delete(endpoint, data) {
        return this.fetcher(endpoint, {
            method: 'DELETE',
            body: data ? JSON.stringify(data) : undefined
        });
    },
    
    // Demo veri sağlayıcı
    getDemoData(endpoint) {
        console.log('Demo veri kullanılıyor:', endpoint);
        
        // /businesses endpoint'i için demo veri
        if (endpoint.includes('/businesses') && !endpoint.includes('/services') && !endpoint.includes('/reviews') && !endpoint.includes('/appointments')) {
            // Tek bir işletme ID'si varsa
            if (endpoint.match(/\/businesses\/\d+$/)) {
                return {
                    success: true,
                    data: {
                        id: 1,
                        name: 'Merkez Oto Servis',
                        address: 'Atatürk Cad. No:123, Kadıköy/İstanbul',
                        description: 'Tüm araç markalarına profesyonel bakım ve onarım hizmeti sunuyoruz.',
                        phone: '0216 123 45 67',
                        email: 'info@merkezoto.com',
                        website: 'www.merkezoto.com',
                        type: 'otoservis',
                        street: 'Atatürk Cad. No:123',
                        city: 'İstanbul',
                        district: 'Kadıköy',
                        openingHours: {
                            monday: '09:00 - 18:00',
                            tuesday: '09:00 - 18:00',
                            wednesday: '09:00 - 18:00',
                            thursday: '09:00 - 18:00',
                            friday: '09:00 - 18:00',
                            saturday: '10:00 - 15:00',
                            sunday: 'Kapalı'
                        },
                        rating: 4.8,
                        categories: ['Motor', 'Bakım', 'Elektrik'],
                        reviews: 45
                    }
                };
            }
            
            // Tüm işletmeler
            return {
                success: true,
                data: [
                    {
                        id: 1,
                        name: 'Merkez Oto Servis',
                        address: 'Atatürk Cad. No:123, Kadıköy/İstanbul',
                        description: 'Tüm araç markalarına profesyonel bakım ve onarım hizmeti sunuyoruz.',
                        rating: 4.8,
                        categories: ['Motor', 'Bakım', 'Elektrik'],
                        reviews: 45
                    },
                    {
                        id: 2,
                        name: 'Expert Auto Center',
                        address: 'Bağdat Cad. No:45, Maltepe/İstanbul',
                        description: 'Premium araç servisi ve bakım hizmetleri. Profesyonel ekip ile kaliteli hizmet.',
                        rating: 4.6,
                        categories: ['Kaporta', 'Boya', 'Detaylı Bakım'],
                        reviews: 38
                    },
                    {
                        id: 3,
                        name: 'Yeşil Vadi Servis',
                        address: 'Yeşilçam Sok. No:7, Beşiktaş/İstanbul',
                        description: 'Elektrikli ve hibrit araçlar dahil tüm modellere özel bakım ve onarım.',
                        rating: 4.7,
                        categories: ['Elektrikli Araçlar', 'Şarj', 'Bakım'],
                        reviews: 29
                    }
                ]
            };
        }
        
        // /services endpoint'i için demo veri
        if (endpoint.includes('/services')) {
            return {
                success: true,
                data: [
                    {
                        id: 1,
                        name: 'Periyodik Bakım',
                        description: 'Araç üreticisinin belirlediği km aralıklarında yapılması gereken bakım.',
                        price: 750,
                        duration: 120, // dakika
                        businessId: 1
                    },
                    {
                        id: 2,
                        name: 'Yağ Değişimi',
                        description: 'Motor yağı ve filtre değişimi.',
                        price: 350,
                        duration: 30, // dakika
                        businessId: 1
                    },
                    {
                        id: 3,
                        name: 'Fren Bakımı',
                        description: 'Fren sisteminin kontrolü ve gerekli parçaların değişimi.',
                        price: 600,
                        duration: 60, // dakika
                        businessId: 1
                    }
                ]
            };
        }
        
        // /reviews endpoint'i için demo veri
        if (endpoint.includes('/reviews')) {
            return {
                success: true,
                data: [
                    {
                        id: 1,
                        rating: 5,
                        comment: 'Çok memnun kaldım, işlerini profesyonelce yapıyorlar. Kesinlikle tavsiye ederim.',
                        user: 'Ahmet Yılmaz',
                        date: '2023-10-15'
                    },
                    {
                        id: 2,
                        rating: 4,
                        comment: 'Fiyatlar biraz yüksek ama hizmet kalitesi çok iyi.',
                        user: 'Mehmet Demir',
                        date: '2023-09-22'
                    },
                    {
                        id: 3,
                        rating: 5,
                        comment: 'Randevuma tam zamanında alındım, araç temiz teslim edildi. Tekrar geleceğim.',
                        user: 'Ayşe Kaya',
                        date: '2023-10-01'
                    }
                ]
            };
        }
        
        // /appointments endpoint'i için demo veri
        if (endpoint.includes('/appointments')) {
            return {
                success: true,
                data: [
                    {
                        id: 1,
                        date: '2023-11-20',
                        time: '10:00',
                        status: 'onaylandı',
                        serviceName: 'Periyodik Bakım',
                        businessName: 'Merkez Oto Servis',
                        notes: 'Araç yıkama da isteniyor',
                        price: 750
                    },
                    {
                        id: 2,
                        date: '2023-12-05',
                        time: '14:30',
                        status: 'beklemede',
                        serviceName: 'Yağ Değişimi',
                        businessName: 'Expert Auto Center',
                        notes: '',
                        price: 400
                    }
                ]
            };
        }
        
        // Varsayılan boş yanıt
        return {
            success: true,
            data: []
        };
    },
    
    // Auth API'si
    auth: {
        // Kullanıcı girişi
        async login(credentials) {
            try {
                const result = await api.post('/auth/login', credentials);
                api.setToken(result.token);
                api.setCurrentUser(result.data);
                return result;
            } catch (err) {
                throw err;
            }
        },
        
        // Kullanıcı kaydı
        async register(userData) {
            try {
                const result = await api.post('/auth/register', userData);
                api.setToken(result.token);
                api.setCurrentUser(result.data);
                return result;
            } catch (err) {
                throw err;
            }
        },
        
        // Kullanıcı çıkışı
        logout() {
            api.removeToken();
            localStorage.removeItem('user');
            window.location.href = '/login.html';
        },
        
        // Oturum kontrolü
        isLoggedIn() {
            return !!api.getToken();
        },
        
        // Kullanıcı profili
        async getProfile() {
            try {
                return await api.get('/auth/me');
            } catch (err) {
                throw err;
            }
        },
        
        // Profil güncelleme
        async updateProfile(userData) {
            try {
                const result = await api.put('/auth/updatedetails', userData);
                api.setCurrentUser(result.data);
                return result;
            } catch (err) {
                throw err;
            }
        },
        
        // Şifre güncelleme
        async updatePassword(passwordData) {
            try {
                return await api.put('/auth/updatepassword', passwordData);
            } catch (err) {
                throw err;
            }
        }
    },
    
    // İşletme API'si
    businesses: {
        // Tüm işletmeleri getir
        async getAll(params = {}) {
            try {
                let queryString = '';
                if (Object.keys(params).length > 0) {
                    queryString = '?' + new URLSearchParams(params).toString();
                }
                return await api.get(`/businesses${queryString}`);
            } catch (err) {
                throw err;
            }
        },
        
        // Tek bir işletmeyi getir
        async getById(id) {
            try {
                return await api.get(`/businesses/${id}`);
            } catch (err) {
                throw err;
            }
        },
        
        // İşletme oluştur
        async create(businessData) {
            try {
                return await api.post('/businesses', businessData);
            } catch (err) {
                throw err;
            }
        },
        
        // İşletme güncelle
        async update(id, businessData) {
            try {
                return await api.put(`/businesses/${id}`, businessData);
            } catch (err) {
                throw err;
            }
        },
        
        // İşletme sil
        async delete(id) {
            try {
                return await api.delete(`/businesses/${id}`);
            } catch (err) {
                throw err;
            }
        },
        
        // İşletmeye ait hizmetleri getir
        async getServices(businessId) {
            try {
                return await api.get(`/businesses/${businessId}/services`);
            } catch (err) {
                throw err;
            }
        }
    },
    
    // Hizmet API'si
    services: {
        // Tüm hizmetleri getir
        async getAll() {
            try {
                return await api.get('/services');
            } catch (err) {
                throw err;
            }
        },
        
        // Tek bir hizmeti getir
        async getById(id) {
            try {
                return await api.get(`/services/${id}`);
            } catch (err) {
                throw err;
            }
        },
        
        // İşletmeye ait hizmetleri getir
        async getByBusiness(businessId) {
            try {
                return await api.get(`/businesses/${businessId}/services`);
            } catch (err) {
                throw err;
            }
        },
        
        // Hizmet oluştur
        async create(businessId, serviceData) {
            try {
                return await api.post(`/businesses/${businessId}/services`, serviceData);
            } catch (err) {
                throw err;
            }
        },
        
        // Hizmet güncelle
        async update(id, serviceData) {
            try {
                return await api.put(`/services/${id}`, serviceData);
            } catch (err) {
                throw err;
            }
        },
        
        // Hizmet sil
        async delete(id) {
            try {
                return await api.delete(`/services/${id}`);
            } catch (err) {
                throw err;
            }
        }
    },
    
    // Randevu API'si
    appointments: {
        // Kullanıcının randevularını getir
        async getAll() {
            try {
                return await api.get('/appointments');
            } catch (err) {
                throw err;
            }
        },
        
        // İşletmenin randevularını getir
        async getBusinessAppointments(businessId) {
            try {
                return await api.get(`/businesses/${businessId}/appointments`);
            } catch (err) {
                throw err;
            }
        },
        
        // Tek bir randevu getir
        async getById(id) {
            try {
                return await api.get(`/appointments/${id}`);
            } catch (err) {
                throw err;
            }
        },
        
        // Randevu oluştur
        async create(businessId, appointmentData) {
            try {
                return await api.post(`/businesses/${businessId}/appointments`, appointmentData);
            } catch (err) {
                throw err;
            }
        },
        
        // Randevu güncelle
        async update(id, appointmentData) {
            try {
                return await api.put(`/appointments/${id}`, appointmentData);
            } catch (err) {
                throw err;
            }
        },
        
        // Randevu iptal et
        async cancel(id, reason) {
            try {
                return await api.put(`/appointments/${id}/cancel`, { reason });
            } catch (err) {
                throw err;
            }
        }
    },
    
    // Değerlendirme API'si
    reviews: {
        // İşletmeye ait değerlendirmeleri getir
        async getBusinessReviews(businessId) {
            try {
                return await api.get(`/businesses/${businessId}/reviews`);
            } catch (err) {
                throw err;
            }
        },
        
        // Kullanıcının değerlendirmelerini getir
        async getUserReviews() {
            try {
                return await api.get('/reviews');
            } catch (err) {
                throw err;
            }
        },
        
        // Değerlendirme oluştur
        async create(businessId, reviewData) {
            try {
                return await api.post(`/businesses/${businessId}/reviews`, reviewData);
            } catch (err) {
                throw err;
            }
        },
        
        // Değerlendirme güncelle
        async update(id, reviewData) {
            try {
                return await api.put(`/reviews/${id}`, reviewData);
            } catch (err) {
                throw err;
            }
        },
        
        // Değerlendirme sil
        async delete(id) {
            try {
                return await api.delete(`/reviews/${id}`);
            } catch (err) {
                throw err;
            }
        }
    }
};

// Oturum durumuna göre navigasyon güncelleme
function updateNavigation() {
    document.addEventListener('DOMContentLoaded', () => {
        const isLoggedIn = api.auth.isLoggedIn();
        const currentUser = api.getCurrentUser();
        
        const navLoginEl = document.getElementById('navLogin');
        const navRegisterEl = document.getElementById('navRegister');
        const navProfileEl = document.getElementById('navProfile');
        const navLogoutEl = document.getElementById('navLogout');
        const navDashboardEl = document.getElementById('navDashboard');
        
        if (isLoggedIn && currentUser) {
            // Giriş yapılmış
            if (navLoginEl) navLoginEl.style.display = 'none';
            if (navRegisterEl) navRegisterEl.style.display = 'none';
            
            if (navProfileEl) {
                navProfileEl.style.display = 'block';
                navProfileEl.href = currentUser.role === 'business' ? '/business-dashboard.html' : '/profile.html';
            }
            
            if (navLogoutEl) {
                navLogoutEl.style.display = 'block';
                navLogoutEl.addEventListener('click', (e) => {
                    e.preventDefault();
                    api.auth.logout();
                });
            }
            
            if (navDashboardEl) {
                if (currentUser.role === 'admin') {
                    navDashboardEl.style.display = 'block';
                    navDashboardEl.href = '/admin-dashboard.html';
                } else if (currentUser.role === 'business') {
                    navDashboardEl.style.display = 'block';
                    navDashboardEl.href = '/business-dashboard.html';
                } else {
                    navDashboardEl.style.display = 'none';
                }
            }
        } else {
            // Giriş yapılmamış
            if (navLoginEl) navLoginEl.style.display = 'block';
            if (navRegisterEl) navRegisterEl.style.display = 'block';
            if (navProfileEl) navProfileEl.style.display = 'none';
            if (navLogoutEl) navLogoutEl.style.display = 'none';
            if (navDashboardEl) navDashboardEl.style.display = 'none';
        }
    });
}

// Sayfalarda uyarı gösterme
function showAlert(message, type = 'danger') {
    const alertsContainer = document.querySelector('.alerts-container') || document.createElement('div');
    
    if (!document.querySelector('.alerts-container')) {
        alertsContainer.className = 'alerts-container';
        document.body.appendChild(alertsContainer);
    }
    
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show`;
    alert.innerHTML = `${message} <button type="button" class="btn-close" data-bs-dismiss="alert"></button>`;
    
    alertsContainer.appendChild(alert);
    
    // 5 saniye sonra otomatik kapat
    setTimeout(() => {
        alert.remove();
    }, 5000);
}

// Tarih biçimlendirme
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('tr-TR', options);
}

// Global değişkenler
window.api = api;
window.updateNavigation = updateNavigation;
window.showAlert = showAlert;
window.formatDate = formatDate;

// Sayfa yüklendiğinde navigasyonu güncelle
updateNavigation(); 