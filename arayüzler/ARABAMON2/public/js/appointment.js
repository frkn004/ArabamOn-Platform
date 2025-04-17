// Randevu oluşturma işlemleri için JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Randevu formunu seç
    const appointmentForm = document.getElementById('appointment-form');
    
    // İşletme türü seçimi yapıldığında
    const businessTypeSelect = document.getElementById('business-type');
    const businessSelect = document.getElementById('business');
    const serviceSelect = document.getElementById('service');
    const dateInput = document.getElementById('date');
    const timeSelect = document.getElementById('time');
    const mapContainer = document.getElementById('map-container');
    
    // Kullanıcının konumunu al
    let userLocation = null;
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                // Haritayı başlat
                initMap(userLocation);
            },
            (error) => {
                console.error('Konum alınamadı:', error);
                // Varsayılan konum (İstanbul)
                userLocation = { lat: 41.0082, lng: 28.9784 };
                initMap(userLocation);
            }
        );
    } else {
        console.error('Tarayıcınız konum hizmetini desteklemiyor.');
        // Varsayılan konum (İstanbul)
        userLocation = { lat: 41.0082, lng: 28.9784 };
        initMap(userLocation);
    }
    
    // Harita başlatma fonksiyonu
    function initMap(location) {
        if (!mapContainer) return;
        
        // Harita oluştur
        const map = new google.maps.Map(mapContainer, {
            center: location,
            zoom: 12
        });
        
        // Kullanıcı konumu işaretçisi
        new google.maps.Marker({
            position: location,
            map: map,
            title: 'Konumunuz',
            icon: {
                url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
            }
        });
        
        // İşletmeleri haritada göster
        fetchBusinesses().then(businesses => {
            businesses.forEach(business => {
                // İşletme türü filtresi
                if (businessTypeSelect.value && business.type !== businessTypeSelect.value) {
                    return;
                }
                
                const marker = new google.maps.Marker({
                    position: { lat: business.latitude, lng: business.longitude },
                    map: map,
                    title: business.name,
                    icon: getMarkerIcon(business.type)
                });
                
                // İşaretçiye tıklandığında işletmeyi seç
                marker.addListener('click', () => {
                    businessSelect.value = business.id;
                    businessSelect.dispatchEvent(new Event('change'));
                });
            });
        });
    }
    
    // İşletme türüne göre işaretçi ikonu
    function getMarkerIcon(type) {
        switch(type) {
            case 'aracyikama':
                return 'http://maps.google.com/mapfiles/ms/icons/blue.png';
            case 'ekspertiz':
                return 'http://maps.google.com/mapfiles/ms/icons/orange.png';
            case 'otopark':
                return 'http://maps.google.com/mapfiles/ms/icons/green.png';
            case 'lastikdegisim':
                return 'http://maps.google.com/mapfiles/ms/icons/red.png';
            default:
                return 'http://maps.google.com/mapfiles/ms/icons/purple.png';
        }
    }
    
    // İşletme türü değiştiğinde
    if (businessTypeSelect) {
        businessTypeSelect.addEventListener('change', async function() {
            const type = this.value;
            
            // İşletmeleri getir
            const businesses = await fetchBusinesses(type);
            
            // İşletme seçimini güncelle
            populateBusinessSelect(businesses);
            
            // Haritayı güncelle
            if (userLocation) {
                initMap(userLocation);
            }
        });
    }
    
    // İşletme seçildiğinde
    if (businessSelect) {
        businessSelect.addEventListener('change', async function() {
            const businessId = this.value;
            
            if (!businessId) return;
            
            // Hizmetleri getir
            const services = await fetchServices(businessId);
            
            // Hizmet seçimini güncelle
            populateServiceSelect(services);
            
            // Çalışma saatlerini getir
            const workingHours = await fetchWorkingHours(businessId);
            
            // Tarih seçim alanını güncelle
            updateDatePicker(workingHours);
        });
    }
    
    // Tarih seçildiğinde
    if (dateInput) {
        dateInput.addEventListener('change', async function() {
            const businessId = businessSelect.value;
            const date = this.value;
            
            if (!businessId || !date) return;
            
            // Seçilen gün için müsait saatleri getir
            const availableTimes = await fetchAvailableTimes(businessId, date);
            
            // Saat seçimini güncelle
            populateTimeSelect(availableTimes);
        });
    }
    
    // Form gönderildiğinde
    if (appointmentForm) {
        appointmentForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Form verilerini al
            const formData = {
                businessId: businessSelect.value,
                serviceId: serviceSelect.value,
                date: dateInput.value,
                time: timeSelect.value,
                notes: document.getElementById('notes').value
            };
            
            // Randevu oluştur
            const result = await createAppointment(formData);
            
            if (result.success) {
                alert('Randevunuz başarıyla oluşturuldu!');
                window.location.href = '/profile.html';
            } else {
                alert('Randevu oluşturulamadı: ' + result.message);
            }
        });
    }
    
    // API fonksiyonları
    
    // İşletme türlerine göre işletmeleri getir
    async function fetchBusinesses(type = '') {
        try {
            let url = '/api/businesses';
            if (type) {
                url += `?type=${type}`;
            }
            
            const token = localStorage.getItem('token');
            
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                return data.data;
            } else {
                console.error('İşletmeler getirilirken hata:', data.message);
                return [];
            }
        } catch (error) {
            console.error('İşletmeler getirilirken hata:', error);
            return [];
        }
    }
    
    // İşletmeye göre hizmetleri getir
    async function fetchServices(businessId) {
        try {
            const token = localStorage.getItem('token');
            
            const response = await fetch(`/api/services/business/${businessId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                return data.data;
            } else {
                console.error('Hizmetler getirilirken hata:', data.message);
                return [];
            }
        } catch (error) {
            console.error('Hizmetler getirilirken hata:', error);
            return [];
        }
    }
    
    // İşletmeye göre çalışma saatlerini getir
    async function fetchWorkingHours(businessId) {
        try {
            const token = localStorage.getItem('token');
            
            const response = await fetch(`/api/businesses/${businessId}/working-hours`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                return data.data;
            } else {
                console.error('Çalışma saatleri getirilirken hata:', data.message);
                return [];
            }
        } catch (error) {
            console.error('Çalışma saatleri getirilirken hata:', error);
            return [];
        }
    }
    
    // İşletme ve tarihe göre müsait saatleri getir
    async function fetchAvailableTimes(businessId, date) {
        try {
            const token = localStorage.getItem('token');
            
            const response = await fetch(`/api/businesses/${businessId}/available-times?date=${date}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                return data.data;
            } else {
                console.error('Müsait saatler getirilirken hata:', data.message);
                // Varsayılan saatler (gerçek API olmadığı için)
                return generateDefaultTimeSlots();
            }
        } catch (error) {
            console.error('Müsait saatler getirilirken hata:', error);
            // Varsayılan saatler (gerçek API olmadığı için)
            return generateDefaultTimeSlots();
        }
    }
    
    // Varsayılan saat dilimleri oluştur (30'ar dakikalık dilimler)
    function generateDefaultTimeSlots() {
        const times = [];
        for (let hour = 9; hour < 18; hour++) {
            times.push(`${hour}:00`);
            times.push(`${hour}:30`);
        }
        return times;
    }
    
    // Randevu oluştur
    async function createAppointment(formData) {
        try {
            const token = localStorage.getItem('token');
            
            const response = await fetch('/api/appointments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
            
            return await response.json();
        } catch (error) {
            console.error('Randevu oluşturulurken hata:', error);
            return {
                success: false,
                message: 'Bir hata oluştu, lütfen tekrar deneyin.'
            };
        }
    }
    
    // İşletme seçimini doldur
    function populateBusinessSelect(businesses) {
        if (!businessSelect) return;
        
        // Seçim alanını temizle
        businessSelect.innerHTML = '<option value="">İşletme Seçin</option>';
        
        // İşletmeleri ekle
        businesses.forEach(business => {
            const option = document.createElement('option');
            option.value = business.id;
            option.textContent = business.name;
            option.dataset.type = business.type;
            businessSelect.appendChild(option);
        });
    }
    
    // Hizmet seçimini doldur
    function populateServiceSelect(services) {
        if (!serviceSelect) return;
        
        // Seçim alanını temizle
        serviceSelect.innerHTML = '<option value="">Hizmet Seçin</option>';
        
        // Hizmetleri ekle
        services.forEach(service => {
            const option = document.createElement('option');
            option.value = service.id;
            option.textContent = `${service.name} - ${service.price} TL`;
            serviceSelect.appendChild(option);
        });
    }
    
    // Tarih seçimini güncelle
    function updateDatePicker(workingHours) {
        if (!dateInput) return;
        
        // Bugünün tarihini al
        const today = new Date();
        
        // Minimum tarihi bugün olarak ayarla
        dateInput.min = today.toISOString().split('T')[0];
        
        // Maksimum tarihi 2 ay sonrası olarak ayarla
        const maxDate = new Date();
        maxDate.setMonth(maxDate.getMonth() + 2);
        dateInput.max = maxDate.toISOString().split('T')[0];
        
        // Tarih seçimini temizle
        dateInput.value = '';
    }
    
    // Saat seçimini doldur
    function populateTimeSelect(availableTimes) {
        if (!timeSelect) return;
        
        // Seçim alanını temizle
        timeSelect.innerHTML = '<option value="">Saat Seçin</option>';
        
        // Saatleri ekle
        availableTimes.forEach(time => {
            const option = document.createElement('option');
            option.value = time;
            option.textContent = time;
            timeSelect.appendChild(option);
        });
    }
}); 

document.addEventListener('DOMContentLoaded', function() {
    // Randevu formunu seç
    const appointmentForm = document.getElementById('appointment-form');
    
    // İşletme türü seçimi yapıldığında
    const businessTypeSelect = document.getElementById('business-type');
    const businessSelect = document.getElementById('business');
    const serviceSelect = document.getElementById('service');
    const dateInput = document.getElementById('date');
    const timeSelect = document.getElementById('time');
    const mapContainer = document.getElementById('map-container');
    
    // Kullanıcının konumunu al
    let userLocation = null;
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                // Haritayı başlat
                initMap(userLocation);
            },
            (error) => {
                console.error('Konum alınamadı:', error);
                // Varsayılan konum (İstanbul)
                userLocation = { lat: 41.0082, lng: 28.9784 };
                initMap(userLocation);
            }
        );
    } else {
        console.error('Tarayıcınız konum hizmetini desteklemiyor.');
        // Varsayılan konum (İstanbul)
        userLocation = { lat: 41.0082, lng: 28.9784 };
        initMap(userLocation);
    }
    
    // Harita başlatma fonksiyonu
    function initMap(location) {
        if (!mapContainer) return;
        
        // Harita oluştur
        const map = new google.maps.Map(mapContainer, {
            center: location,
            zoom: 12
        });
        
        // Kullanıcı konumu işaretçisi
        new google.maps.Marker({
            position: location,
            map: map,
            title: 'Konumunuz',
            icon: {
                url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
            }
        });
        
        // İşletmeleri haritada göster
        fetchBusinesses().then(businesses => {
            businesses.forEach(business => {
                // İşletme türü filtresi
                if (businessTypeSelect.value && business.type !== businessTypeSelect.value) {
                    return;
                }
                
                const marker = new google.maps.Marker({
                    position: { lat: business.latitude, lng: business.longitude },
                    map: map,
                    title: business.name,
                    icon: getMarkerIcon(business.type)
                });
                
                // İşaretçiye tıklandığında işletmeyi seç
                marker.addListener('click', () => {
                    businessSelect.value = business.id;
                    businessSelect.dispatchEvent(new Event('change'));
                });
            });
        });
    }
    
    // İşletme türüne göre işaretçi ikonu
    function getMarkerIcon(type) {
        switch(type) {
            case 'aracyikama':
                return 'http://maps.google.com/mapfiles/ms/icons/blue.png';
            case 'ekspertiz':
                return 'http://maps.google.com/mapfiles/ms/icons/orange.png';
            case 'otopark':
                return 'http://maps.google.com/mapfiles/ms/icons/green.png';
            case 'lastikdegisim':
                return 'http://maps.google.com/mapfiles/ms/icons/red.png';
            default:
                return 'http://maps.google.com/mapfiles/ms/icons/purple.png';
        }
    }
    
    // İşletme türü değiştiğinde
    if (businessTypeSelect) {
        businessTypeSelect.addEventListener('change', async function() {
            const type = this.value;
            
            // İşletmeleri getir
            const businesses = await fetchBusinesses(type);
            
            // İşletme seçimini güncelle
            populateBusinessSelect(businesses);
            
            // Haritayı güncelle
            if (userLocation) {
                initMap(userLocation);
            }
        });
    }
    
    // İşletme seçildiğinde
    if (businessSelect) {
        businessSelect.addEventListener('change', async function() {
            const businessId = this.value;
            
            if (!businessId) return;
            
            // Hizmetleri getir
            const services = await fetchServices(businessId);
            
            // Hizmet seçimini güncelle
            populateServiceSelect(services);
            
            // Çalışma saatlerini getir
            const workingHours = await fetchWorkingHours(businessId);
            
            // Tarih seçim alanını güncelle
            updateDatePicker(workingHours);
        });
    }
    
    // Tarih seçildiğinde
    if (dateInput) {
        dateInput.addEventListener('change', async function() {
            const businessId = businessSelect.value;
            const date = this.value;
            
            if (!businessId || !date) return;
            
            // Seçilen gün için müsait saatleri getir
            const availableTimes = await fetchAvailableTimes(businessId, date);
            
            // Saat seçimini güncelle
            populateTimeSelect(availableTimes);
        });
    }
    
    // Form gönderildiğinde
    if (appointmentForm) {
        appointmentForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Form verilerini al
            const formData = {
                businessId: businessSelect.value,
                serviceId: serviceSelect.value,
                date: dateInput.value,
                time: timeSelect.value,
                notes: document.getElementById('notes').value
            };
            
            // Randevu oluştur
            const result = await createAppointment(formData);
            
            if (result.success) {
                alert('Randevunuz başarıyla oluşturuldu!');
                window.location.href = '/profile.html';
            } else {
                alert('Randevu oluşturulamadı: ' + result.message);
            }
        });
    }
    
    // API fonksiyonları
    
    // İşletme türlerine göre işletmeleri getir
    async function fetchBusinesses(type = '') {
        try {
            let url = '/api/businesses';
            if (type) {
                url += `?type=${type}`;
            }
            
            const token = localStorage.getItem('token');
            
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                return data.data;
            } else {
                console.error('İşletmeler getirilirken hata:', data.message);
                return [];
            }
        } catch (error) {
            console.error('İşletmeler getirilirken hata:', error);
            return [];
        }
    }
    
    // İşletmeye göre hizmetleri getir
    async function fetchServices(businessId) {
        try {
            const token = localStorage.getItem('token');
            
            const response = await fetch(`/api/services/business/${businessId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                return data.data;
            } else {
                console.error('Hizmetler getirilirken hata:', data.message);
                return [];
            }
        } catch (error) {
            console.error('Hizmetler getirilirken hata:', error);
            return [];
        }
    }
    
    // İşletmeye göre çalışma saatlerini getir
    async function fetchWorkingHours(businessId) {
        try {
            const token = localStorage.getItem('token');
            
            const response = await fetch(`/api/businesses/${businessId}/working-hours`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                return data.data;
            } else {
                console.error('Çalışma saatleri getirilirken hata:', data.message);
                return [];
            }
        } catch (error) {
            console.error('Çalışma saatleri getirilirken hata:', error);
            return [];
        }
    }
    
    // İşletme ve tarihe göre müsait saatleri getir
    async function fetchAvailableTimes(businessId, date) {
        try {
            const token = localStorage.getItem('token');
            
            const response = await fetch(`/api/businesses/${businessId}/available-times?date=${date}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                return data.data;
            } else {
                console.error('Müsait saatler getirilirken hata:', data.message);
                // Varsayılan saatler (gerçek API olmadığı için)
                return generateDefaultTimeSlots();
            }
        } catch (error) {
            console.error('Müsait saatler getirilirken hata:', error);
            // Varsayılan saatler (gerçek API olmadığı için)
            return generateDefaultTimeSlots();
        }
    }
    
    // Varsayılan saat dilimleri oluştur (30'ar dakikalık dilimler)
    function generateDefaultTimeSlots() {
        const times = [];
        for (let hour = 9; hour < 18; hour++) {
            times.push(`${hour}:00`);
            times.push(`${hour}:30`);
        }
        return times;
    }
    
    // Randevu oluştur
    async function createAppointment(formData) {
        try {
            const token = localStorage.getItem('token');
            
            const response = await fetch('/api/appointments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
            
            return await response.json();
        } catch (error) {
            console.error('Randevu oluşturulurken hata:', error);
            return {
                success: false,
                message: 'Bir hata oluştu, lütfen tekrar deneyin.'
            };
        }
    }
    
    // İşletme seçimini doldur
    function populateBusinessSelect(businesses) {
        if (!businessSelect) return;
        
        // Seçim alanını temizle
        businessSelect.innerHTML = '<option value="">İşletme Seçin</option>';
        
        // İşletmeleri ekle
        businesses.forEach(business => {
            const option = document.createElement('option');
            option.value = business.id;
            option.textContent = business.name;
            option.dataset.type = business.type;
            businessSelect.appendChild(option);
        });
    }
    
    // Hizmet seçimini doldur
    function populateServiceSelect(services) {
        if (!serviceSelect) return;
        
        // Seçim alanını temizle
        serviceSelect.innerHTML = '<option value="">Hizmet Seçin</option>';
        
        // Hizmetleri ekle
        services.forEach(service => {
            const option = document.createElement('option');
            option.value = service.id;
            option.textContent = `${service.name} - ${service.price} TL`;
            serviceSelect.appendChild(option);
        });
    }
    
    // Tarih seçimini güncelle
    function updateDatePicker(workingHours) {
        if (!dateInput) return;
        
        // Bugünün tarihini al
        const today = new Date();
        
        // Minimum tarihi bugün olarak ayarla
        dateInput.min = today.toISOString().split('T')[0];
        
        // Maksimum tarihi 2 ay sonrası olarak ayarla
        const maxDate = new Date();
        maxDate.setMonth(maxDate.getMonth() + 2);
        dateInput.max = maxDate.toISOString().split('T')[0];
        
        // Tarih seçimini temizle
        dateInput.value = '';
    }
    
    // Saat seçimini doldur
    function populateTimeSelect(availableTimes) {
        if (!timeSelect) return;
        
        // Seçim alanını temizle
        timeSelect.innerHTML = '<option value="">Saat Seçin</option>';
        
        // Saatleri ekle
        availableTimes.forEach(time => {
            const option = document.createElement('option');
            option.value = time;
            option.textContent = time;
            timeSelect.appendChild(option);
        });
    }
}); 