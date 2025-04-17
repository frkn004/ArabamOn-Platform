document.addEventListener('DOMContentLoaded', () => {
    // Giriş kontrolü ve yönlendirme
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const userRole = localStorage.getItem('userRole');
    
    if (isLoggedIn !== 'true' || userRole !== 'admin') {
        // Eğer geldiğimiz sayfa login sayfası değilse yönlendir
        if (document.referrer.indexOf('login.html') === -1) {
            window.location.href = '/login.html';
            return;
        }
    }

    // API endpoint'leri
    const API_URL = '/api';
    const BUSINESSES_URL = `${API_URL}/businesses`;
    const USERS_URL = `${API_URL}/auth/users`;
    const REVIEWS_URL = `${API_URL}/reviews`;
    const SERVICES_URL = `${API_URL}/services`;
    const APPOINTMENTS_URL = `${API_URL}/appointments`;

    // İstatistikleri yükle
    loadStatistics();
    
    // İşletmeleri yükle
    loadBusinesses();
    
    // Kullanıcıları yükle
    loadUsers();
    
    // Yorumları yükle
    loadReviews();

    // İşletme ekleme formunu ayarla
    setupBusinessForm();

    // İşletme ekleme butonuna tıklama
    const addBusinessBtn = document.getElementById('add-business-btn');
    if (addBusinessBtn) {
        addBusinessBtn.addEventListener('click', () => {
            document.getElementById('business-modal').style.display = 'flex';
            document.getElementById('business-form').reset();
            document.getElementById('business-id').value = '';
            document.querySelector('#business-modal .modal-title').textContent = 'Yeni İşletme Ekle';
        });
    }

    // İşletme formu iptal butonuna tıklama
    const cancelBusinessBtn = document.getElementById('cancel-business');
    if (cancelBusinessBtn) {
        cancelBusinessBtn.addEventListener('click', () => {
            document.getElementById('business-modal').style.display = 'none';
        });
    }

    // Modal dışı tıklamada kapatma
    window.addEventListener('click', (e) => {
        const businessModal = document.getElementById('business-modal');
        const userModal = document.getElementById('user-modal');
        
        if (businessModal && e.target === businessModal) {
            businessModal.style.display = 'none';
        }
        
        if (userModal && e.target === userModal) {
            userModal.style.display = 'none';
        }
    });
    
    // Çıkış butonuna tıklama
    const logoutLink = document.querySelector('.logout-btn');
    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('userRole');
            localStorage.removeItem('userName');
            window.location.href = '/login.html';
        });
    }
    
    // İstatistikleri yükleme fonksiyonu
    async function loadStatistics() {
        try {
            const response = await fetch(`${API_URL}/statistics`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            }).catch(error => {
                console.log('API bağlantısı başarısız, demo veriler kullanılıyor');
                return { ok: false };
            });
            
            // Gerçek veri yerine şu an için demo veri kullanıyoruz
            const stats = {
                users: {
                    count: 12,
                    trend: '+3 bu hafta',
                    icon: 'user'
                },
                businesses: {
                    count: 15,
                    trend: '+5 bu hafta',
                    icon: 'building'
                },
                appointments: {
                    count: 67,
                    trend: '+22 bu hafta',
                    icon: 'calendar'
                },
                reviews: {
                    count: 84,
                    trend: '+18 bu hafta',
                    icon: 'star'
                }
            };
            
            // İstatistikleri DOM'a ekle
            const userCountElement = document.getElementById('user-count');
            const businessCountElement = document.getElementById('business-count');
            const reviewCountElement = document.getElementById('review-count');
            const appointmentCountElement = document.getElementById('appointment-count');
            
            if (userCountElement) userCountElement.textContent = stats.users.count;
            if (businessCountElement) businessCountElement.textContent = stats.businesses.count;
            if (reviewCountElement) reviewCountElement.textContent = stats.reviews.count;
            if (appointmentCountElement) appointmentCountElement.textContent = stats.appointments.count;
            
        } catch (error) {
            console.error('İstatistikler yüklenirken hata:', error);
            showNotification('İstatistikler yüklenemedi.', 'error');
        }
    }
    
    // İşletmeleri yükleme fonksiyonu
    async function loadBusinesses() {
        try {
            const response = await fetch(BUSINESSES_URL, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            }).catch(error => {
                console.log('API bağlantısı başarısız, demo veriler kullanılıyor');
                return { ok: false };
            });
            
            // Demo veri - Gerçek veri seti
            const demoBusinesses = [
                { id: 1, name: 'Kristal Oto Yıkama', type: 'aracyikama', city: 'İstanbul', district: 'Kadıköy', isActive: true, averageRating: 4.8 },
                { id: 2, name: 'Pro Ekspertiz Merkezi', type: 'ekspertiz', city: 'İstanbul', district: 'Maltepe', isActive: true, averageRating: 4.6 },
                { id: 3, name: 'Güvenli Otopark', type: 'otopark', city: 'İstanbul', district: 'Beşiktaş', isActive: true, averageRating: 4.7 },
                { id: 4, name: 'Hızlı Lastik Değişim', type: 'lastikdegisim', city: 'İstanbul', district: 'Şişli', isActive: true, averageRating: 4.5 },
                { id: 5, name: 'Parlak Oto Yıkama', type: 'aracyikama', city: 'İstanbul', district: 'Ataşehir', isActive: true, averageRating: 4.5 },
                { id: 6, name: 'Detaylı Ekspertiz', type: 'ekspertiz', city: 'İstanbul', district: 'Kartal', isActive: false, averageRating: 4.1 },
                { id: 7, name: 'Merkez Kapalı Otopark', type: 'otopark', city: 'İstanbul', district: 'Şişli', isActive: true, averageRating: 4.6 },
                { id: 8, name: 'Profesyonel Lastik Servisi', type: 'lastikdegisim', city: 'İstanbul', district: 'Beylikdüzü', isActive: true, averageRating: 4.9 },
                { id: 9, name: 'VIP Detaylı Oto Bakım', type: 'aracyikama', city: 'Ankara', district: 'Çankaya', isActive: true, averageRating: 4.9 },
                { id: 10, name: 'Teknik Ekspertiz Merkezi', type: 'ekspertiz', city: 'Bursa', district: 'Nilüfer', isActive: false, averageRating: 4.0 },
                { id: 11, name: 'Elit Rezidans Otoparkı', type: 'otopark', city: 'İzmir', district: 'Konak', isActive: true, averageRating: 4.8 },
                { id: 12, name: 'Usta Lastik ve Balans', type: 'lastikdegisim', city: 'Antalya', district: 'Kepez', isActive: true, averageRating: 4.6 },
                { id: 13, name: 'Avrupa Oto Yıkama', type: 'aracyikama', city: 'İzmir', district: 'Bornova', isActive: true, averageRating: 4.7 },
                { id: 14, name: 'Modern Ekspertiz', type: 'ekspertiz', city: 'Ankara', district: 'Keçiören', isActive: true, averageRating: 4.3 },
                { id: 15, name: 'Şehir Merkezi Otopark', type: 'otopark', city: 'Antalya', district: 'Muratpaşa', isActive: true, averageRating: 4.4 }
            ];
            
            const businessesTableBody = document.querySelector('#businesses-table tbody');
            if (businessesTableBody) {
                businessesTableBody.innerHTML = '';
                
                demoBusinesses.forEach(business => {
                    const row = document.createElement('tr');
                    
                    // İşletme türünü Türkçe olarak göster
                    const businessType = getBusinessTypeText(business.type);
                    
                    row.innerHTML = `
                        <td>${business.id}</td>
                        <td>${business.name}</td>
                        <td>${businessType}</td>
                        <td>${business.city}</td>
                        <td>${business.district}</td>
                        <td><span class="status ${business.isActive ? 'active' : 'inactive'}">${business.isActive ? 'Aktif' : 'Pasif'}</span></td>
                        <td>${business.averageRating || 0}</td>
                        <td class="actions">
                            <button class="action-btn edit-business" data-id="${business.id}" title="Düzenle"><i class="fas fa-edit"></i></button>
                            <button class="action-btn ${business.isActive ? 'deactivate-business' : 'activate-business'}" data-id="${business.id}" title="${business.isActive ? 'Pasifleştir' : 'Aktifleştir'}">
                                <i class="fas ${business.isActive ? 'fa-ban' : 'fa-check'}"></i>
                            </button>
                            <button class="action-btn delete-business" data-id="${business.id}" title="Sil"><i class="fas fa-trash"></i></button>
                            <button class="action-btn view-services" data-id="${business.id}" title="Hizmetler"><i class="fas fa-list"></i></button>
                        </td>
                    `;
                    
                    businessesTableBody.appendChild(row);
                });
                
                // İşletme düzenleme butonlarına tıklama
                document.querySelectorAll('.edit-business').forEach(button => {
                    button.addEventListener('click', async () => {
                        const businessId = button.getAttribute('data-id');
                        const business = demoBusinesses.find(b => b.id === parseInt(businessId));
                        
                        if (!business) {
                            showNotification('İşletme bulunamadı.', 'error');
                            return;
                        }
                        
                        const businessModal = document.getElementById('business-modal');
                        if (businessModal) {
                            // Form değerlerini doldur
                            document.getElementById('business-id').value = business.id;
                            document.getElementById('business-name').value = business.name;
                            document.getElementById('business-type').value = business.type;
                            document.getElementById('business-city').value = business.city;
                            document.getElementById('business-district').value = business.district;
                            
                            // Modalı göster
                            businessModal.style.display = 'flex';
                            document.querySelector('#business-modal .modal-title').textContent = 'İşletmeyi Düzenle';
                        } else {
                            // Modal yoksa alert ile düzenleme yapılacağını bildir
                            alert(`${business.name} işletmesini düzenleme modalı hazırlanıyor...`);
                        }
                    });
                });
                
                // İşletme aktivasyon/deaktivasyon butonlarına tıklama
                document.querySelectorAll('.activate-business, .deactivate-business').forEach(button => {
                    button.addEventListener('click', async () => {
                        const businessId = button.getAttribute('data-id');
                        const isActivate = button.classList.contains('activate-business');
                        const business = demoBusinesses.find(b => b.id === parseInt(businessId));
                        
                        if (!business) {
                            showNotification('İşletme bulunamadı.', 'error');
                            return;
                        }
                        
                        try {
                            // API isteği yerine demo olarak
                            business.isActive = isActivate;
                            showNotification(`${business.name} işletmesi başarıyla ${isActivate ? 'aktifleştirildi' : 'pasifleştirildi'}.`, 'success');
                            
                            // Sayfayı yenile
                            setTimeout(() => {
                                loadBusinesses();
                            }, 1000);
                        } catch (error) {
                            console.error('İşletme durumu değiştirilirken hata:', error);
                            showNotification('İşletme durumu değiştirilemedi.', 'error');
                        }
                    });
                });
                
                // İşletme silme butonlarına tıklama
                document.querySelectorAll('.delete-business').forEach(button => {
                    button.addEventListener('click', async () => {
                        const businessId = button.getAttribute('data-id');
                        const business = demoBusinesses.find(b => b.id === parseInt(businessId));
                        
                        if (!business) {
                            showNotification('İşletme bulunamadı.', 'error');
                            return;
                        }
                        
                        if (confirm(`${business.name} işletmesini silmek istediğinize emin misiniz?`)) {
                            try {
                                // Demo için işletmeyi listeden çıkar
                                const index = demoBusinesses.findIndex(b => b.id === parseInt(businessId));
                                if (index !== -1) {
                                    demoBusinesses.splice(index, 1);
                                }
                                
                                showNotification(`${business.name} işletmesi başarıyla silindi.`, 'success');
                                
                                // Sayfayı yenile
                                setTimeout(() => {
                                    loadBusinesses();
                                }, 1000);
                            } catch (error) {
                                console.error('İşletme silinirken hata:', error);
                                showNotification('İşletme silinemedi.', 'error');
                            }
                        }
                    });
                });
                
                // Hizmetleri görüntüleme butonlarına tıklama
                document.querySelectorAll('.view-services').forEach(button => {
                    button.addEventListener('click', () => {
                        const businessId = button.getAttribute('data-id');
                        const business = demoBusinesses.find(b => b.id === parseInt(businessId));
                        
                        if (!business) {
                            showNotification('İşletme bulunamadı.', 'error');
                            return;
                        }
                        
                        // Demo hizmetler
                        const services = [
                            { id: 1, name: 'Standart Yıkama', price: '120 TL', duration: '30 dk' },
                            { id: 2, name: 'Premium Yıkama', price: '250 TL', duration: '60 dk' },
                            { id: 3, name: 'İç Detaylı Temizlik', price: '180 TL', duration: '45 dk' }
                        ];
                        
                        let servicesList = `<h3>${business.name} İşletmesi Hizmetleri:</h3><ul>`;
                        services.forEach(service => {
                            servicesList += `<li>${service.name} - ${service.price} (${service.duration})</li>`;
                        });
                        servicesList += '</ul>';
                        
                        alert(servicesList);
                    });
                });
            }
            
        } catch (error) {
            console.error('İşletmeler yüklenirken hata:', error);
            showNotification('İşletmeler yüklenemedi.', 'error');
        }
    }
    
    // Kullanıcıları yükleme fonksiyonu
    async function loadUsers() {
        try {
            const response = await fetch(USERS_URL, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            }).catch(error => {
                console.log('API bağlantısı başarısız, demo veriler kullanılıyor');
                return { ok: false };
            });
            
            // Demo kullanıcı verileri - Gerçek veri seti
            const demoUsers = [
                { id: 1, name: 'Admin Kullanıcı', email: 'admin@arabamon.com', phone: '5551234567', role: 'admin', isActive: true },
                { id: 2, name: 'İşletme Sahibi', email: 'business@arabamon.com', phone: '5551234568', role: 'business', isActive: true },
                { id: 3, name: 'Normal Kullanıcı', email: 'user@arabamon.com', phone: '5551234569', role: 'user', isActive: true },
                { id: 4, name: 'Ahmet Yılmaz', email: 'ahmet@arabamon.com', phone: '5551234570', role: 'business', isActive: true },
                { id: 5, name: 'Mehmet Kaya', email: 'mehmet@arabamon.com', phone: '5551234571', role: 'business', isActive: true },
                { id: 6, name: 'Ayşe Demir', email: 'ayse@arabamon.com', phone: '5551234572', role: 'business', isActive: false },
                { id: 7, name: 'Fatma Şahin', email: 'fatma@arabamon.com', phone: '5551234573', role: 'user', isActive: true },
                { id: 8, name: 'Hasan Korkmaz', email: 'hasan@arabamon.com', phone: '5551234574', role: 'user', isActive: true },
                { id: 9, name: 'Zeynep Çelik', email: 'zeynep@arabamon.com', phone: '5551234575', role: 'user', isActive: true },
                { id: 10, name: 'Mustafa Demir', email: 'mustafa@arabamon.com', phone: '5551234576', role: 'business', isActive: true },
                { id: 11, name: 'Ali Yıldız', email: 'ali@arabamon.com', phone: '5551234577', role: 'user', isActive: false },
                { id: 12, name: 'Selin Kara', email: 'selin@arabamon.com', phone: '5551234578', role: 'user', isActive: true }
            ];
            
            const usersTableBody = document.querySelector('#users-table tbody');
            if (usersTableBody) {
                usersTableBody.innerHTML = '';
                
                demoUsers.forEach(user => {
                    const row = document.createElement('tr');
                    
                    const roleText = {
                        'admin': 'Yönetici',
                        'business': 'İşletme',
                        'user': 'Kullanıcı'
                    }[user.role] || 'Kullanıcı';
                    
                    row.innerHTML = `
                        <td>${user.id}</td>
                        <td>${user.name}</td>
                        <td>${user.email}</td>
                        <td>${user.phone || '-'}</td>
                        <td>${roleText}</td>
                        <td><span class="status ${user.isActive ? 'active' : 'inactive'}">${user.isActive ? 'Aktif' : 'Pasif'}</span></td>
                        <td class="actions">
                            <button class="action-btn edit-user" data-id="${user.id}" title="Düzenle"><i class="fas fa-edit"></i></button>
                            <button class="action-btn ${user.isActive ? 'deactivate-user' : 'activate-user'}" data-id="${user.id}" title="${user.isActive ? 'Pasifleştir' : 'Aktifleştir'}">
                                <i class="fas ${user.isActive ? 'fa-ban' : 'fa-check'}"></i>
                            </button>
                            <button class="action-btn delete-user" data-id="${user.id}" title="Sil"><i class="fas fa-trash"></i></button>
                        </td>
                    `;
                    
                    usersTableBody.appendChild(row);
                });
                
                // Kullanıcı düzenleme butonlarına tıklama
                document.querySelectorAll('.edit-user').forEach(button => {
                    button.addEventListener('click', async () => {
                        const userId = button.getAttribute('data-id');
                        const user = demoUsers.find(u => u.id === parseInt(userId));
                        
                        if (!user) {
                            showNotification('Kullanıcı bulunamadı.', 'error');
                            return;
                        }
                        
                        // Burada kullanıcı düzenleme modalı gösterilebilir
                        alert(`${user.name} kullanıcısını düzenlemek için form burada gösterilecek.`);
                    });
                });
                
                // Kullanıcı aktivasyon/deaktivasyon butonlarına tıklama
                document.querySelectorAll('.activate-user, .deactivate-user').forEach(button => {
                    button.addEventListener('click', async () => {
                        const userId = button.getAttribute('data-id');
                        const isActivate = button.classList.contains('activate-user');
                        const user = demoUsers.find(u => u.id === parseInt(userId));
                        
                        if (!user) {
                            showNotification('Kullanıcı bulunamadı.', 'error');
                            return;
                        }
                        
                        try {
                            // API isteği yerine demo olarak
                            user.isActive = isActivate;
                            showNotification(`${user.name} kullanıcısı başarıyla ${isActivate ? 'aktifleştirildi' : 'pasifleştirildi'}.`, 'success');
                            
                            // Sayfayı yenile
                            setTimeout(() => {
                                loadUsers();
                            }, 1000);
                        } catch (error) {
                            console.error('Kullanıcı durumu değiştirilirken hata:', error);
                            showNotification('Kullanıcı durumu değiştirilemedi.', 'error');
                        }
                    });
                });
                
                // Kullanıcı silme butonlarına tıklama
                document.querySelectorAll('.delete-user').forEach(button => {
                    button.addEventListener('click', async () => {
                        const userId = button.getAttribute('data-id');
                        const user = demoUsers.find(u => u.id === parseInt(userId));
                        
                        if (!user) {
                            showNotification('Kullanıcı bulunamadı.', 'error');
                            return;
                        }
                        
                        if (confirm(`${user.name} kullanıcısını silmek istediğinize emin misiniz?`)) {
                            try {
                                // Demo için kullanıcıyı listeden çıkar
                                const index = demoUsers.findIndex(u => u.id === parseInt(userId));
                                if (index !== -1) {
                                    demoUsers.splice(index, 1);
                                }
                                
                                showNotification(`${user.name} kullanıcısı başarıyla silindi.`, 'success');
                                
                                // Sayfayı yenile
                                setTimeout(() => {
                                    loadUsers();
                                }, 1000);
                            } catch (error) {
                                console.error('Kullanıcı silinirken hata:', error);
                                showNotification('Kullanıcı silinemedi.', 'error');
                            }
                        }
                    });
                });
            }
            
        } catch (error) {
            console.error('Kullanıcılar yüklenirken hata:', error);
            showNotification('Kullanıcılar yüklenemedi.', 'error');
        }
    }
    
    // Yorumları yükleme fonksiyonu
    async function loadReviews() {
        try {
            const response = await fetch(REVIEWS_URL, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            }).catch(error => {
                console.log('API bağlantısı başarısız, demo veriler kullanılıyor');
                return { ok: false };
            });
            
            // Demo yorum verileri - Gerçek veri seti
            const demoReviews = [
                { id: 1, businessName: 'Kristal Oto Yıkama', userName: 'Normal Kullanıcı', rating: 5, comment: 'Çok memnun kaldım, aracım tertemiz oldu. Fiyat/performans açısından harika.', isApproved: true, createdAt: '2023-11-15' },
                { id: 2, businessName: 'Pro Ekspertiz Merkezi', userName: 'Normal Kullanıcı', rating: 4, comment: 'Ekspertiz raporları çok detaylı hazırlanıyor, teşekkürler.', isApproved: true, createdAt: '2023-11-22' },
                { id: 3, businessName: 'Parlak Oto Yıkama', userName: 'Ali Yıldız', rating: 5, comment: 'Çok memnun kaldım, kesinlikle tavsiye ederim.', isApproved: true, createdAt: '2023-12-05' },
                { id: 4, businessName: 'Detaylı Ekspertiz', userName: 'Hasan Korkmaz', rating: 4, comment: 'Harika bir hizmet, çalışanlar çok ilgiliydi.', isApproved: true, createdAt: '2023-12-10' },
                { id: 5, businessName: 'Merkez Kapalı Otopark', userName: 'Selin Kara', rating: 5, comment: 'Fiyat/performans açısından oldukça başarılı.', isApproved: true, createdAt: '2023-12-15' },
                { id: 6, businessName: 'Profesyonel Lastik Servisi', userName: 'Fatma Şahin', rating: 5, comment: 'Beklentilerimin üzerinde bir deneyimdi.', isApproved: false, createdAt: '2023-12-20' },
                { id: 7, businessName: 'VIP Detaylı Oto Bakım', userName: 'Zeynep Çelik', rating: 4, comment: 'Profesyonel hizmet anlayışı için teşekkürler.', isApproved: false, createdAt: '2023-12-25' },
                { id: 8, businessName: 'Kristal Oto Yıkama', userName: 'Zeynep Çelik', rating: 3, comment: 'Ortalama bir hizmet deneyimi, biraz daha özen gösterilebilir.', isApproved: true, createdAt: '2024-01-05' },
                { id: 9, businessName: 'Güvenli Otopark', userName: 'Hasan Korkmaz', rating: 5, comment: 'Aracımı gönül rahatlığıyla park edebildiğim nadir yerlerden biri.', isApproved: true, createdAt: '2024-01-10' },
                { id: 10, businessName: 'Hızlı Lastik Değişim', userName: 'Selin Kara', rating: 4, comment: 'İsminin hakkını veriyor, hızlı ve kaliteli hizmet.', isApproved: true, createdAt: '2024-01-15' },
                { id: 11, businessName: 'Avrupa Oto Yıkama', userName: 'Fatma Şahin', rating: 5, comment: 'Aracım yepyeni gibi oldu, çok teşekkürler.', isApproved: false, createdAt: '2024-01-20' },
                { id: 12, businessName: 'Modern Ekspertiz', userName: 'Ali Yıldız', rating: 3, comment: 'Rapor detaylı hazırlanmış ancak biraz bekledim.', isApproved: false, createdAt: '2024-01-25' },
                { id: 13, businessName: 'Elit Rezidans Otoparkı', userName: 'Normal Kullanıcı', rating: 5, comment: 'Premium hizmet, güvenli otopark.', isApproved: true, createdAt: '2024-02-01' },
                { id: 14, businessName: 'Usta Lastik ve Balans', userName: 'Zeynep Çelik', rating: 4, comment: 'Fiyatlar biraz yüksek ama hizmet kaliteli.', isApproved: true, createdAt: '2024-02-05' }
            ];
            
            const reviewsTableBody = document.querySelector('#reviews-table tbody');
            if (reviewsTableBody) {
                reviewsTableBody.innerHTML = '';
                
                demoReviews.forEach(review => {
                    const row = document.createElement('tr');
                    
                    row.innerHTML = `
                        <td>${review.id}</td>
                        <td>${review.businessName}</td>
                        <td>${review.userName}</td>
                        <td>${'★'.repeat(review.rating)}</td>
                        <td>${review.comment}</td>
                        <td><span class="status ${review.isApproved ? 'active' : 'pending'}">${review.isApproved ? 'Onaylı' : 'Beklemede'}</span></td>
                        <td>${new Date(review.createdAt).toLocaleDateString('tr-TR')}</td>
                        <td class="actions">
                            <button class="action-btn ${review.isApproved ? 'disapprove-review' : 'approve-review'}" data-id="${review.id}" title="${review.isApproved ? 'Onayı Kaldır' : 'Onayla'}">
                                <i class="fas ${review.isApproved ? 'fa-ban' : 'fa-check'}"></i>
                            </button>
                            <button class="action-btn delete-review" data-id="${review.id}" title="Sil"><i class="fas fa-trash"></i></button>
                        </td>
                    `;
                    
                    reviewsTableBody.appendChild(row);
                });
                
                // Yorum onaylama/onay kaldırma butonlarına tıklama
                document.querySelectorAll('.approve-review, .disapprove-review').forEach(button => {
                    button.addEventListener('click', async () => {
                        const reviewId = button.getAttribute('data-id');
                        const isApprove = button.classList.contains('approve-review');
                        const review = demoReviews.find(r => r.id === parseInt(reviewId));
                        
                        if (!review) {
                            showNotification('Yorum bulunamadı.', 'error');
                            return;
                        }
                        
                        try {
                            // API isteği yerine demo olarak
                            review.isApproved = isApprove;
                            showNotification(`'${review.comment.substring(0, 30)}...' yorumu başarıyla ${isApprove ? 'onaylandı' : 'onayı kaldırıldı'}.`, 'success');
                            
                            // Sayfayı yenile
                            setTimeout(() => {
                                loadReviews();
                            }, 1000);
                        } catch (error) {
                            console.error('Yorum durumu değiştirilirken hata:', error);
                            showNotification('Yorum durumu değiştirilemedi.', 'error');
                        }
                    });
                });
                
                // Yorum silme butonlarına tıklama
                document.querySelectorAll('.delete-review').forEach(button => {
                    button.addEventListener('click', async () => {
                        const reviewId = button.getAttribute('data-id');
                        const review = demoReviews.find(r => r.id === parseInt(reviewId));
                        
                        if (!review) {
                            showNotification('Yorum bulunamadı.', 'error');
                            return;
                        }
                        
                        if (confirm(`'${review.comment.substring(0, 30)}...' yorumunu silmek istediğinize emin misiniz?`)) {
                            try {
                                // Demo için yorumu listeden çıkar
                                const index = demoReviews.findIndex(r => r.id === parseInt(reviewId));
                                if (index !== -1) {
                                    demoReviews.splice(index, 1);
                                }
                                
                                showNotification('Yorum başarıyla silindi.', 'success');
                                
                                // Sayfayı yenile
                                setTimeout(() => {
                                    loadReviews();
                                }, 1000);
                            } catch (error) {
                                console.error('Yorum silinirken hata:', error);
                                showNotification('Yorum silinemedi.', 'error');
                            }
                        }
                    });
                });
            }
            
        } catch (error) {
            console.error('Yorumlar yüklenirken hata:', error);
            showNotification('Yorumlar yüklenemedi.', 'error');
        }
    }
    
    // İşletme formu ayarlama fonksiyonu
    function setupBusinessForm() {
        const businessForm = document.getElementById('business-form');
        if (!businessForm) return;
        
        businessForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const businessId = document.getElementById('business-id').value;
            const isUpdate = businessId !== '';
            
            const formData = {
                name: document.getElementById('business-name').value,
                type: document.getElementById('business-type').value,
                email: document.getElementById('business-email').value,
                phone: document.getElementById('business-phone').value,
                city: document.getElementById('business-city').value,
                district: document.getElementById('business-district').value,
                street: document.getElementById('business-street').value,
                latitude: parseFloat(document.getElementById('business-lat').value || 0),
                longitude: parseFloat(document.getElementById('business-lng').value || 0),
                description: document.getElementById('business-description').value,
                isActive: true
            };
            
            try {
                // API isteği yerine demo olarak göster
                showNotification(`İşletme başarıyla ${isUpdate ? 'güncellendi' : 'oluşturuldu'}.`, 'success');
                
                // Modalı kapat
                document.getElementById('business-modal').style.display = 'none';
                
                // Sayfayı yenile
                setTimeout(() => {
                    loadBusinesses();
                }, 1000);
            } catch (error) {
                console.error('İşletme kaydedilirken hata:', error);
                showNotification('İşletme kaydedilemedi.', 'error');
            }
        });
    }
    
    // Yardımcı fonksiyonlar
    function getBusinessTypeText(type) {
        const types = {
            'aracyikama': 'Araç Yıkama',
            'ekspertiz': 'Ekspertiz',
            'otopark': 'Otopark',
            'lastikdegisim': 'Lastik Değişim'
        };
        
        return types[type] || type;
    }
    
    function showNotification(message, type = 'info') {
        // Bildirim alanı HTML'de varsa kullan
        const notificationArea = document.getElementById('notification-area');
        if (notificationArea) {
            const notification = document.createElement('div');
            notification.className = `notification ${type}`;
            notification.textContent = message;
            
            notificationArea.appendChild(notification);
            
            // 3 saniye sonra bildirimi kaldır
            setTimeout(() => {
                notification.remove();
            }, 3000);
        } else {
            // Yoksa alert kullan
            alert(message);
        }
    }
}); 