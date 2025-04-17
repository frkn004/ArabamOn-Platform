// Randevu oluşturma işlemleri için JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Kullanıcı oturum kontrolü
    const { isLoggedIn } = window.Auth ? window.Auth.checkAuth() : { isLoggedIn: false };
    
    // Kullanıcı giriş yapmamışsa giriş uyarısını göster, yapmışsa randevu formunu göster
    const loginPrompt = document.getElementById('login-prompt');
    const appointmentContent = document.querySelectorAll('.step-content');
    
    if (!isLoggedIn) {
        loginPrompt.style.display = 'block';
        appointmentContent.forEach(content => {
            content.style.display = 'none';
        });
    } else {
        loginPrompt.style.display = 'none';
        document.getElementById('step1-content').style.display = 'block';
    }
    
    // Giriş Yap butonuna tıklama
    document.getElementById('login-btn').addEventListener('click', function() {
        document.getElementById('login-register-container').style.display = 'block';
        document.getElementById('login-form').style.display = 'block';
        document.getElementById('register-form').style.display = 'none';
        document.getElementById('auth-form-title').textContent = 'Giriş Yap';
    });
    
    // Kayıt Ol butonuna tıklama
    document.getElementById('register-btn').addEventListener('click', function() {
        document.getElementById('login-register-container').style.display = 'block';
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('register-form').style.display = 'block';
        document.getElementById('auth-form-title').textContent = 'Kayıt Ol';
    });
    
    // Formlar arası geçiş
    document.getElementById('switch-to-register').addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('register-form').style.display = 'block';
        document.getElementById('auth-form-title').textContent = 'Kayıt Ol';
    });
    
    document.getElementById('switch-to-login').addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('login-form').style.display = 'block';
        document.getElementById('register-form').style.display = 'none';
        document.getElementById('auth-form-title').textContent = 'Giriş Yap';
    });
    
    // Giriş formunu gönderme
    document.getElementById('login-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        try {
            const result = await window.Auth.login(email, password);
            if (result) {
                // Giriş başarılı
                loginPrompt.style.display = 'none';
                document.getElementById('login-register-container').style.display = 'none';
                document.getElementById('step1-content').style.display = 'block';
            }
        } catch (error) {
            alert('Giriş yapılırken hata oluştu: ' + error.message);
        }
    });
    
    // Kayıt formunu gönderme
    document.getElementById('register-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const phone = document.getElementById('register-phone').value;
        const password = document.getElementById('register-password').value;
        const passwordConfirm = document.getElementById('register-password-confirm').value;
        
        if (password !== passwordConfirm) {
            alert('Şifreler eşleşmiyor!');
            return;
        }
        
        try {
            const result = await window.Auth.register({
                name,
                email,
                phone,
                password
            });
            
            if (result) {
                // Kayıt başarılı
                loginPrompt.style.display = 'none';
                document.getElementById('login-register-container').style.display = 'none';
                document.getElementById('step1-content').style.display = 'block';
            }
        } catch (error) {
            alert('Kayıt olurken hata oluştu: ' + error.message);
        }
    });
    
    // Adımlar arası geçiş
    const goToStep = (step) => {
        // Tüm adımları gizle
        document.querySelectorAll('.step-content').forEach(content => {
            content.classList.remove('active');
        });
        
        // Tüm göstergeleri pasif yap
        document.querySelectorAll('.step').forEach(indicator => {
            indicator.classList.remove('active', 'completed');
        });
        
        // İlgili adıma kadar tüm adımların tamamlandığını işaretle
        for (let i = 1; i < step; i++) {
            document.getElementById(`step${i}-indicator`).classList.add('completed');
        }
        
        // Aktif adımı göster ve işaretle
        document.getElementById(`step${step}-content`).classList.add('active');
        document.getElementById(`step${step}-indicator`).classList.add('active');
    };
    
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
    
    // Adım 1'den 2'ye geçiş
    document.getElementById('step1-next').addEventListener('click', function() {
        const businessType = document.getElementById('business-type').value;
        const business = document.getElementById('business').value;
        const service = document.getElementById('service').value;
        
        if (!businessType || !business || !service) {
            alert('Lütfen tüm alanları doldurun!');
            return;
        }
        
        goToStep(2);
    });
    
    // Adım 2'den 1'e geçiş
    document.getElementById('step2-prev').addEventListener('click', function() {
        goToStep(1);
    });
    
    // Adım 2'den 3'e geçiş
    document.getElementById('step2-next').addEventListener('click', function() {
        const date = document.getElementById('date').value;
        const time = document.getElementById('time').value;
        
        if (!date || !time) {
            alert('Lütfen tarih ve saat seçin!');
                    return;
                }
                
        goToStep(3);
    });
    
    // Adım 3'ten 2'ye geçiş
    document.getElementById('step3-prev').addEventListener('click', function() {
        goToStep(2);
    });
    
    // Adım 3'ten 4'e geçiş
    document.getElementById('step3-next').addEventListener('click', function() {
        const tcNo = document.getElementById('tc-no').value;
        const vehiclePlate = document.getElementById('vehicle-plate').value;
        const vehicleModel = document.getElementById('vehicle-model').value;
        
        if (!tcNo || tcNo.length !== 11 || !/^\d+$/.test(tcNo)) {
            alert('Lütfen geçerli bir T.C. Kimlik Numarası girin!');
            return;
        }
        
        if (!vehiclePlate || !vehicleModel) {
            alert('Lütfen araç bilgilerini girin!');
            return;
        }
        
        // Özet bilgileri doldur
        const businessSelect = document.getElementById('business');
        const serviceSelect = document.getElementById('service');
        const dateInput = document.getElementById('date');
        const timeSelect = document.getElementById('time');
        const notesTextarea = document.getElementById('notes');
        
        document.getElementById('summary-business').textContent = 
            businessSelect.options[businessSelect.selectedIndex].text;
        
        document.getElementById('summary-service').textContent = 
            serviceSelect.options[serviceSelect.selectedIndex].text;
        
        const formattedDate = new Date(dateInput.value).toLocaleDateString('tr-TR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
        
        document.getElementById('summary-datetime').textContent = 
            `${formattedDate}, ${timeSelect.value}`;
        
        document.getElementById('summary-tc').textContent = 
            tcNo.substring(0, 3) + '*****' + tcNo.substring(8);
        
        document.getElementById('summary-vehicle').textContent = 
            `${vehicleModel} (${vehiclePlate})`;
        
        document.getElementById('summary-notes').textContent = 
            notesTextarea.value || '-';
        
        goToStep(4);
    });
    
    // Adım 4'ten 3'e geçiş
    document.getElementById('step4-prev').addEventListener('click', function() {
        goToStep(3);
    });
    
    // Randevu onaylama
    document.getElementById('submit-appointment').addEventListener('click', async function(e) {
            e.preventDefault();
            
        const termsCheck = document.getElementById('terms-check').checked;
        
        if (!termsCheck) {
            alert('Lütfen kullanım şartlarını kabul edin!');
            return;
        }
        
        // Randevu verilerini topla
        const appointmentData = {
            businessId: document.getElementById('business').value,
            serviceId: document.getElementById('service').value,
            date: document.getElementById('date').value,
            time: document.getElementById('time').value,
            tcNo: document.getElementById('tc-no').value,
            vehiclePlate: document.getElementById('vehicle-plate').value,
            vehicleModel: document.getElementById('vehicle-model').value,
                notes: document.getElementById('notes').value
            };
            
        try {
            // Mevcut createAppointment fonksiyonunu kullanıyoruz
            const result = await createAppointment(appointmentData);
            
            if (result.success) {
                alert('Randevunuz başarıyla oluşturuldu!');
                window.location.href = '/profile.html';
            } else {
                alert('Randevu oluşturulamadı: ' + result.message);
            }
        } catch (error) {
            alert('Randevu oluşturulurken hata: ' + error.message);
        }
    });
    
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
            // API üzerinden randevu oluşturma
            const token = localStorage.getItem('token');
            const userData = JSON.parse(localStorage.getItem('userData'));
            
            if (!token || !userData) {
                return {
                    success: false,
                    message: 'Oturum bilgileriniz bulunamadı. Lütfen tekrar giriş yapın.'
                };
            }
            
            const response = await fetch(`/api/appointments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Randevu başarıyla oluşturuldu
                
                // Randevu detaylarını düzenle
                const businessSelect = document.getElementById('business');
                const serviceSelect = document.getElementById('service');
                const businessName = businessSelect.options[businessSelect.selectedIndex].text;
                const serviceName = serviceSelect.options[serviceSelect.selectedIndex].text;
                
                const appointmentDetails = {
                    id: result.data.id || Date.now(),
                    userId: userData.id,
                    userName: userData.name,
                    userEmail: userData.email,
                    businessId: formData.businessId,
                    businessName: businessName,
                    serviceId: formData.serviceId,
                    serviceName: serviceName,
                    date: formData.date,
                    time: formData.time,
                    tcNo: formData.tcNo,
                    vehiclePlate: formData.vehiclePlate,
                    vehicleModel: formData.vehicleModel,
                    notes: formData.notes,
                    status: 'beklemede',
                    createdAt: new Date().toISOString()
                };
                
                // Bildirimleri gönder
                sendNotificationToBusinessAndAdmin(appointmentDetails);
                
                // Kullanıcı bildirimlerini localStorage'a kaydet
                let userNotifications = JSON.parse(localStorage.getItem(`user_notifications_${userData.id}`)) || [];
                
                const userNotification = {
                    id: Date.now() + 2,
                    type: 'appointment_created',
                    title: 'Randevu Oluşturuldu',
                    message: `${businessName} işletmesine ${formData.date} tarihinde ${formData.time} saatine randevunuz oluşturuldu. İşletme onayı bekleniyor.`,
                    appointment: appointmentDetails,
                    isRead: false,
                    createdAt: new Date().toISOString()
                };
                
                userNotifications.push(userNotification);
                localStorage.setItem(`user_notifications_${userData.id}`, JSON.stringify(userNotifications));
                
                return result;
            } else {
                console.error('Randevu oluşturulurken hata:', result.message);
                return result;
            }
        } catch (error) {
            console.error('Randevu oluşturulurken hata:', error);
            return {
                success: false,
                message: 'Bir hata oluştu, lütfen tekrar deneyin.'
            };
        }
    }
    
    // İşletmeye ve admin'e bildirim gönder (demo)
    function sendNotificationToBusinessAndAdmin(appointment) {
        // Demo - gerçek sistemde WebSocket veya push notification kullanılabilir
        
        // İşletmeye giden bildirimler için localStorage'a kaydet
        let businessNotifications = JSON.parse(localStorage.getItem(`business_notifications_${appointment.businessId}`)) || [];
        
        const businessNotification = {
            id: Date.now(),
            type: 'new_appointment',
            title: 'Yeni Randevu',
            message: `${appointment.userName} tarafından ${appointment.date} tarihinde ${appointment.time} saatine "${appointment.serviceName}" hizmeti için yeni bir randevu oluşturuldu.`,
            appointment: appointment,
            isRead: false,
            createdAt: new Date().toISOString()
        };
        
        businessNotifications.push(businessNotification);
        localStorage.setItem(`business_notifications_${appointment.businessId}`, JSON.stringify(businessNotifications));
        
        // Admin bildirimlerini localStorage'a kaydet
        let adminNotifications = JSON.parse(localStorage.getItem('admin_notifications')) || [];
        
        const adminNotification = {
            id: Date.now() + 1,
            type: 'new_appointment',
            title: 'Yeni Randevu',
            message: `${appointment.userName} tarafından ${appointment.businessName} işletmesine ${appointment.date} tarihinde yeni bir randevu oluşturuldu.`,
            appointment: appointment,
            isRead: false,
            createdAt: new Date().toISOString()
        };
        
        adminNotifications.push(adminNotification);
        localStorage.setItem('admin_notifications', JSON.stringify(adminNotifications));
        
        console.log('Bildirimler işletmeye ve admine gönderildi', businessNotification, adminNotification);
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