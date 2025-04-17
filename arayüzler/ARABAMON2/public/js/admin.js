// Admin Panel için JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Admin kullanıcısını kontrol et
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'admin') {
        window.location.href = '/login.html';
        return;
    }

    // Kullanıcı bilgilerini güncelle
    updateUserInfo();

    // Menü item'larını aktif yapma
    const menuItems = document.querySelectorAll('.admin-menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            if (item.id === 'logout-button') return;
            
            e.preventDefault();
            
            // Tüm menü öğelerinden active class'ını kaldır
            menuItems.forEach(menuItem => {
                menuItem.classList.remove('active');
            });
            
            // Tıklanan menü öğesine active class'ını ekle
            item.classList.add('active');
            
            // Panel ID'sini al
            const panelId = item.getAttribute('data-panel');
            
            // Tüm panelleri gizle
            const panels = document.querySelectorAll('.admin-panel');
            panels.forEach(panel => {
                panel.style.display = 'none';
            });
            
            // İlgili paneli göster
            document.getElementById(panelId).style.display = 'block';
            
            // URL'i güncelle
            window.history.pushState({}, '', item.getAttribute('href'));
        });
    });

    // URL hash değiştiğinde
    window.addEventListener('hashchange', function() {
        const hash = window.location.hash || '#dashboard';
        const menuItem = document.querySelector(`.admin-menu-item[href="${hash}"]`);
        if (menuItem) {
            menuItem.click();
        }
    });

    // Sayfa yüklendiğinde hash'e göre ilgili sekmeyi aç
    const hash = window.location.hash || '#dashboard';
    const menuItem = document.querySelector(`.admin-menu-item[href="${hash}"]`);
    if (menuItem) {
        menuItem.click();
    }

    // Form tabları için
    const formTabs = document.querySelectorAll('.form-tab');
    formTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabContentId = tab.getAttribute('data-tab');
            
            // Tüm tablardan active class'ını kaldır
            formTabs.forEach(t => t.classList.remove('active'));
            
            // Tüm tab içeriklerini gizle
            document.querySelectorAll('.form-tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            // Tıklanan taba active class'ını ekle
            tab.classList.add('active');
            
            // İlgili tab içeriğini göster
            document.getElementById(tabContentId).classList.add('active');
        });
    });

    // Çıkış yap butonu
    document.getElementById('logout-button').addEventListener('click', function(e) {
        e.preventDefault();
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userName');
        window.location.href = '/login.html';
    });

    // İşletme modalı
    setupBusinessModal();
    
    // Kullanıcı modalı
    setupUserModal();
    
    // Kupon modalı
    setupCouponModal();
    
    // Demo veriler ile istatistikleri güncelle
    updateDashboardStats();
    
    // Demo veriler ile tabloları doldur
    loadBusinessesTable();
    loadUsersTable();
    loadCouponsTable();
    updateBusinessTypeCounts();
});

// Kullanıcı bilgilerini güncelleme
function updateUserInfo() {
    const userName = localStorage.getItem('userName') || 'Admin';
    document.querySelector('.admin-user-name').textContent = userName;
    
    // Avatar baş harflerini al
    const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase();
    document.querySelector('.admin-avatar').textContent = initials;
}

// İşletme modal kurulumu
function setupBusinessModal() {
    const addBusinessBtn = document.getElementById('add-business-btn');
    const businessModal = document.getElementById('business-modal');
    const closeBusinessModal = document.getElementById('close-business-modal');
    const cancelBusiness = document.getElementById('cancel-business');
    const businessForm = document.getElementById('business-form');
    
    // Logo yükleme önizlemesi
    const businessLogoInput = document.getElementById('business-logo-input');
    const businessLogoInfo = document.getElementById('business-logo-info');
    const businessLogoPreview = document.getElementById('business-logo-preview');
    
    businessLogoInput.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            businessLogoInfo.textContent = file.name;
            
            const reader = new FileReader();
            reader.onload = function(e) {
                businessLogoPreview.innerHTML = `<img src="${e.target.result}" alt="Logo önizleme">`;
            }
            reader.readAsDataURL(file);
        } else {
            businessLogoInfo.textContent = 'Henüz dosya seçilmedi';
            businessLogoPreview.innerHTML = '';
        }
    });
    
    // Çalışma durumu toggle
    const dayStatusToggles = document.querySelectorAll('.day-status input[type="checkbox"]');
    dayStatusToggles.forEach(toggle => {
        toggle.addEventListener('change', function() {
            const statusText = this.parentElement.nextElementSibling;
            statusText.textContent = this.checked ? 'Açık' : 'Kapalı';
        });
    });
    
    // Modal açma
    addBusinessBtn.addEventListener('click', function() {
        document.getElementById('business-modal-title').textContent = 'Yeni İşletme Ekle';
        businessForm.reset();
        businessLogoPreview.innerHTML = '';
        businessLogoInfo.textContent = 'Henüz dosya seçilmedi';
        
        // İlk tab'ı aktif yap
        document.querySelector('.form-tab').click();
        
        businessModal.style.display = 'block';
    });
    
    // Modal kapatma
    closeBusinessModal.addEventListener('click', function() {
        businessModal.style.display = 'none';
    });
    
    cancelBusiness.addEventListener('click', function() {
        businessModal.style.display = 'none';
    });
    
    // Modal dışına tıklandığında kapatma
    window.addEventListener('click', function(e) {
        if (e.target === businessModal) {
            businessModal.style.display = 'none';
        }
    });
    
    // Form gönderimi
    businessForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Form verilerini al ve işle
        const formData = {
            id: document.getElementById('business-id').value || null,
            name: document.getElementById('business-name').value,
            type: document.getElementById('business-type').value,
            description: document.getElementById('business-description').value,
            slogan: document.getElementById('business-slogan').value,
            isActive: document.getElementById('business-status').value === '1',
            email: document.getElementById('business-email').value,
            phone: document.getElementById('business-phone').value,
            landline: document.getElementById('business-landline').value,
            ownerId: 2, // Varsayılan işletme sahibi ID'si
            ownerName: document.getElementById('owner-name').value,
            ownerSurname: document.getElementById('owner-surname').value,
            ibanName: document.getElementById('business-iban-name').value,
            iban: document.getElementById('business-iban').value,
            city: document.getElementById('business-city').value,
            district: document.getElementById('business-district').value,
            neighborhood: document.getElementById('business-neighborhood').value,
            street: document.getElementById('business-street').value,
            postalCode: document.getElementById('business-postal-code').value,
            latitude: parseFloat(document.getElementById('business-lat').value),
            longitude: parseFloat(document.getElementById('business-lng').value),
            workingHours: {
                monday: {
                    isOpen: document.getElementById('monday-status').checked,
                    openTime: document.getElementById('monday-open').value,
                    closeTime: document.getElementById('monday-close').value
                },
                tuesday: {
                    isOpen: document.getElementById('tuesday-status').checked,
                    openTime: document.getElementById('tuesday-open').value,
                    closeTime: document.getElementById('tuesday-close').value
                },
                wednesday: {
                    isOpen: document.getElementById('wednesday-status').checked,
                    openTime: document.getElementById('wednesday-open').value,
                    closeTime: document.getElementById('wednesday-close').value
                },
                thursday: {
                    isOpen: document.getElementById('thursday-status').checked,
                    openTime: document.getElementById('thursday-open').value,
                    closeTime: document.getElementById('thursday-close').value
                },
                friday: {
                    isOpen: document.getElementById('friday-status').checked,
                    openTime: document.getElementById('friday-open').value,
                    closeTime: document.getElementById('friday-close').value
                },
                saturday: {
                    isOpen: document.getElementById('saturday-status').checked,
                    openTime: document.getElementById('saturday-open').value,
                    closeTime: document.getElementById('saturday-close').value
                },
                sunday: {
                    isOpen: document.getElementById('sunday-status').checked,
                    openTime: document.getElementById('sunday-open').value,
                    closeTime: document.getElementById('sunday-close').value
                }
            },
            password: document.getElementById('business-password').value,
            isFeatured: document.getElementById('business-featured').checked
        };
        
        // Logo dosyası
        const logoFile = document.getElementById('business-logo-input').files[0];
        
        console.log('İşletme kaydedildi:', formData);
        
        // Demo olarak başarılı mesajı göster
        alert(formData.id ? 'İşletme başarıyla güncellendi!' : 'Yeni işletme başarıyla eklendi!');
        
        // Tabloyu güncelle
        loadBusinessesTable();
        updateBusinessTypeCounts();
        updateDashboardStats();
        
        // Modalı kapat
        businessModal.style.display = 'none';
    });
}

// Kullanıcı modal kurulumu
function setupUserModal() {
    const addUserBtn = document.getElementById('add-user-btn');
    const userModal = document.getElementById('user-modal');
    const closeUserModal = document.getElementById('close-user-modal');
    const cancelUser = document.getElementById('cancel-user');
    const userForm = document.getElementById('user-form');
    
    // Modal açma
    addUserBtn.addEventListener('click', function() {
        document.getElementById('user-modal-title').textContent = 'Yeni Kullanıcı Ekle';
        userForm.reset();
        document.getElementById('user-id').value = '';
        userModal.style.display = 'block';
    });
    
    // Modal kapatma
    closeUserModal.addEventListener('click', function() {
        userModal.style.display = 'none';
    });
    
    cancelUser.addEventListener('click', function() {
        userModal.style.display = 'none';
    });
    
    // Modal dışına tıklandığında kapatma
    window.addEventListener('click', function(e) {
        if (e.target === userModal) {
            userModal.style.display = 'none';
        }
    });
    
    // Form gönderimi
    userForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Form verilerini al ve işle
        const formData = {
            id: document.getElementById('user-id').value || null,
            name: document.getElementById('user-name').value,
            email: document.getElementById('user-email').value,
            phone: document.getElementById('user-phone').value,
            role: document.getElementById('user-role').value,
            password: document.getElementById('user-password').value,
            isActive: document.getElementById('user-status').value === '1'
        };
        
        console.log('Kullanıcı kaydedildi:', formData);
        
        // Demo olarak başarılı mesajı göster
        alert(formData.id ? 'Kullanıcı başarıyla güncellendi!' : 'Yeni kullanıcı başarıyla eklendi!');
        
        // Tabloyu güncelle
        loadUsersTable();
        updateDashboardStats();
        
        // Modalı kapat
        userModal.style.display = 'none';
    });
}

// Kupon modal kurulumu
function setupCouponModal() {
    const addCouponBtn = document.getElementById('add-coupon-btn');
    const couponModal = document.getElementById('coupon-modal');
    const closeCouponModal = document.getElementById('close-coupon-modal');
    const cancelCoupon = document.getElementById('cancel-coupon');
    const couponForm = document.getElementById('coupon-form');
    
    // Tüm işletme türleri checkbox'ı
    const allTypesCheckbox = document.getElementById('coupon-all-types');
    const businessTypeCheckboxes = document.querySelectorAll('.business-type-checkbox');
    
    allTypesCheckbox.addEventListener('change', function() {
        businessTypeCheckboxes.forEach(checkbox => {
            checkbox.checked = this.checked;
            checkbox.disabled = this.checked;
        });
    });
    
    // Modal açma
    addCouponBtn.addEventListener('click', function() {
        document.getElementById('coupon-modal-title').textContent = 'Yeni Kupon Ekle';
        couponForm.reset();
        document.getElementById('coupon-id').value = '';
        
        // Başlangıç ve bitiş tarihlerini ayarla
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('coupon-start-date').value = today;
        
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        document.getElementById('coupon-end-date').value = nextMonth.toISOString().split('T')[0];
        
        // İşletme türleri checkbox'larını sıfırla
        allTypesCheckbox.checked = true;
        businessTypeCheckboxes.forEach(checkbox => {
            checkbox.checked = true;
            checkbox.disabled = true;
        });
        
        couponModal.style.display = 'block';
    });
    
    // Modal kapatma
    closeCouponModal.addEventListener('click', function() {
        couponModal.style.display = 'none';
    });
    
    cancelCoupon.addEventListener('click', function() {
        couponModal.style.display = 'none';
    });
    
    // Modal dışına tıklandığında kapatma
    window.addEventListener('click', function(e) {
        if (e.target === couponModal) {
            couponModal.style.display = 'none';
        }
    });
    
    // Form gönderimi
    couponForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // İşletme türlerini al
        let businessTypes = [];
        if (allTypesCheckbox.checked) {
            businessTypes = ['all'];
        } else {
            businessTypeCheckboxes.forEach(checkbox => {
                if (checkbox.checked) {
                    businessTypes.push(checkbox.id.replace('coupon-', ''));
                }
            });
        }
        
        // Form verilerini al ve işle
        const formData = {
            id: document.getElementById('coupon-id').value || null,
            code: document.getElementById('coupon-code').value,
            description: document.getElementById('coupon-description').value,
            discountType: document.getElementById('coupon-discount-type').value,
            discountValue: parseFloat(document.getElementById('coupon-discount-value').value),
            minAmount: parseFloat(document.getElementById('coupon-min-amount').value) || 0,
            maxDiscount: parseFloat(document.getElementById('coupon-max-discount').value) || null,
            startDate: document.getElementById('coupon-start-date').value,
            endDate: document.getElementById('coupon-end-date').value,
            usageLimit: parseInt(document.getElementById('coupon-usage-limit').value) || null,
            userUsageLimit: parseInt(document.getElementById('coupon-user-usage-limit').value) || 1,
            businessTypes: businessTypes,
            isActive: document.getElementById('coupon-status').value === '1'
        };
        
        console.log('Kupon kaydedildi:', formData);
        
        // Demo olarak başarılı mesajı göster
        alert(formData.id ? 'Kupon başarıyla güncellendi!' : 'Yeni kupon başarıyla eklendi!');
        
        // Tabloyu güncelle
        loadCouponsTable();
        
        // Modalı kapat
        couponModal.style.display = 'none';
    });
}

// Dashboard istatistiklerini güncelleme
function updateDashboardStats() {
    document.getElementById('total-users-count').textContent = '156';
    document.getElementById('total-businesses-count').textContent = '42';
    document.getElementById('total-appointments-count').textContent = '387';
    document.getElementById('total-reviews-count').textContent = '245';
}

// İşletme türlerine göre işletme sayılarını güncelleme
function updateBusinessTypeCounts() {
    document.getElementById('aracyikama-count').textContent = '12';
    document.getElementById('ekspertiz-count').textContent = '8';
    document.getElementById('otopark-count').textContent = '15';
    document.getElementById('lastikdegisim-count').textContent = '7';
}

// İşletmeler tablosunu doldurma
function loadBusinessesTable() {
    const tableBody = document.querySelector('#businesses-table tbody');
    
    // Demo veriler
    const businesses = [
        {
            id: 1,
            name: 'Kristal Oto Yıkama',
            type: 'aracyikama',
            location: 'İstanbul / Kadıköy',
            contact: 'info@kristalyikama.com',
            isActive: true
        },
        {
            id: 2,
            name: 'Pro Ekspertiz Merkezi',
            type: 'ekspertiz',
            location: 'İstanbul / Maltepe',
            contact: 'info@proekspertiz.com',
            isActive: true
        },
        {
            id: 3,
            name: 'Güvenli Otopark',
            type: 'otopark',
            location: 'İstanbul / Beşiktaş',
            contact: 'info@guvenliotopark.com',
            isActive: true
        },
        {
            id: 4,
            name: 'Hızlı Lastik Değişim',
            type: 'lastikdegisim',
            location: 'İstanbul / Şişli',
            contact: 'info@hizlilastik.com',
            isActive: true
        }
    ];
    
    // Tabloyu temizle
    tableBody.innerHTML = '';
    
    // Verileri tabloya ekle
    businesses.forEach(business => {
        const row = document.createElement('tr');
        
        // Türkçe tür isimlerini göster
        const typeLabels = {
            'aracyikama': 'Araç Yıkama',
            'ekspertiz': 'Ekspertiz',
            'otopark': 'Otopark',
            'lastikdegisim': 'Lastik Değişim'
        };
        
        row.innerHTML = `
            <td>${business.id}</td>
            <td><div class="business-logo-small">
                <img src="/img/${business.type}.png" alt="${business.name}">
            </div></td>
            <td>${business.name}</td>
            <td>${typeLabels[business.type]}</td>
            <td>${business.location}</td>
            <td>${business.contact}</td>
            <td>
                <span class="status-badge ${business.isActive ? 'active' : 'inactive'}">
                    ${business.isActive ? 'Aktif' : 'Pasif'}
                </span>
            </td>
            <td>
                <button class="btn btn-small btn-edit edit-business" data-id="${business.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-small btn-delete delete-business" data-id="${business.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // İşletme düzenleme
    const editButtons = document.querySelectorAll('.edit-business');
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const businessId = this.getAttribute('data-id');
            // Demo olarak işletme verilerini doldur
            document.getElementById('business-modal-title').textContent = 'İşletme Düzenle';
            document.getElementById('business-id').value = businessId;
            document.getElementById('business-name').value = businesses.find(b => b.id == businessId).name;
            document.getElementById('business-type').value = businesses.find(b => b.id == businessId).type;
            document.getElementById('business-email').value = businesses.find(b => b.id == businessId).contact;
            document.getElementById('business-status').value = businesses.find(b => b.id == businessId).isActive ? '1' : '0';
            
            // İlk tab'ı aktif yap
            document.querySelector('.form-tab').click();
            
            // Modalı aç
            document.getElementById('business-modal').style.display = 'block';
        });
    });
    
    // İşletme silme
    const deleteButtons = document.querySelectorAll('.delete-business');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const businessId = this.getAttribute('data-id');
            const businessName = businesses.find(b => b.id == businessId).name;
            
            if (confirm(`"${businessName}" işletmesini silmek istediğinizden emin misiniz?`)) {
                // Demo olarak silindi mesajı göster
                alert(`"${businessName}" işletmesi başarıyla silindi!`);
                loadBusinessesTable();
                updateBusinessTypeCounts();
                updateDashboardStats();
            }
        });
    });
}

// Kullanıcılar tablosunu doldurma
function loadUsersTable() {
    const tableBody = document.querySelector('#users-table tbody');
    
    // Demo veriler
    const users = [
        {
            id: 1,
            name: 'Admin Kullanıcı',
            email: 'admin@arabamon.com',
            phone: '5551234567',
            role: 'admin',
            createdAt: '01.01.2023',
            isActive: true
        },
        {
            id: 2,
            name: 'İşletme Sahibi',
            email: 'business@arabamon.com',
            phone: '5551234568',
            role: 'business',
            createdAt: '15.01.2023',
            isActive: true
        },
        {
            id: 3,
            name: 'Normal Kullanıcı',
            email: 'user@arabamon.com',
            phone: '5551234569',
            role: 'user',
            createdAt: '20.01.2023',
            isActive: true
        }
    ];
    
    // Tabloyu temizle
    tableBody.innerHTML = '';
    
    // Verileri tabloya ekle
    users.forEach(user => {
        const row = document.createElement('tr');
        
        // Türkçe rol isimlerini göster
        const roleLabels = {
            'admin': 'Admin',
            'business': 'İşletme',
            'user': 'Kullanıcı'
        };
        
        row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.phone}</td>
            <td>
                <span class="role-badge ${user.role}">
                    ${roleLabels[user.role]}
                </span>
            </td>
            <td>${user.createdAt}</td>
            <td>
                <span class="status-badge ${user.isActive ? 'active' : 'inactive'}">
                    ${user.isActive ? 'Aktif' : 'Pasif'}
                </span>
            </td>
            <td>
                <button class="btn btn-small btn-edit edit-user" data-id="${user.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-small btn-delete delete-user" data-id="${user.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Kullanıcı düzenleme
    const editButtons = document.querySelectorAll('.edit-user');
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const userId = this.getAttribute('data-id');
            // Demo olarak kullanıcı verilerini doldur
            document.getElementById('user-modal-title').textContent = 'Kullanıcı Düzenle';
            document.getElementById('user-id').value = userId;
            document.getElementById('user-name').value = users.find(u => u.id == userId).name;
            document.getElementById('user-email').value = users.find(u => u.id == userId).email;
            document.getElementById('user-phone').value = users.find(u => u.id == userId).phone;
            document.getElementById('user-role').value = users.find(u => u.id == userId).role;
            document.getElementById('user-status').value = users.find(u => u.id == userId).isActive ? '1' : '0';
            
            // Modalı aç
            document.getElementById('user-modal').style.display = 'block';
        });
    });
    
    // Kullanıcı silme
    const deleteButtons = document.querySelectorAll('.delete-user');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const userId = this.getAttribute('data-id');
            const userName = users.find(u => u.id == userId).name;
            
            if (confirm(`"${userName}" kullanıcısını silmek istediğinizden emin misiniz?`)) {
                // Demo olarak silindi mesajı göster
                alert(`"${userName}" kullanıcısı başarıyla silindi!`);
                loadUsersTable();
                updateDashboardStats();
            }
        });
    });
}

// Kuponlar tablosunu doldurma
function loadCouponsTable() {
    const tableBody = document.querySelector('#coupons-table tbody');
    
    // Demo veriler
    const coupons = [
        {
            id: 1,
            code: 'WELCOME20',
            discount: '%20',
            type: 'Yüzde',
            minAmount: '100 TL',
            startDate: '01.03.2023',
            endDate: '31.12.2023',
            usageLimit: '100',
            usageCount: '45',
            isActive: true
        },
        {
            id: 2,
            code: 'SUMMER50',
            discount: '%50',
            type: 'Yüzde',
            minAmount: '250 TL',
            startDate: '01.06.2023',
            endDate: '31.08.2023',
            usageLimit: '50',
            usageCount: '32',
            isActive: false
        },
        {
            id: 3,
            code: 'DISCOUNT100',
            discount: '100 TL',
            type: 'Sabit',
            minAmount: '500 TL',
            startDate: '15.05.2023',
            endDate: '15.06.2023',
            usageLimit: '20',
            usageCount: '20',
            isActive: false
        }
    ];
    
    // Tabloyu temizle
    tableBody.innerHTML = '';
    
    // Verileri tabloya ekle
    coupons.forEach(coupon => {
        const row = document.createElement('tr');
        
        let status = 'active';
        let statusText = 'Aktif';
        
        if (!coupon.isActive) {
            status = 'inactive';
            statusText = 'Pasif';
        }
        
        // Bitiş tarihi geçmiş mi kontrol et
        const now = new Date();
        const endDate = new Date(coupon.endDate.split('.').reverse().join('-'));
        
        if (endDate < now) {
            status = 'expired';
            statusText = 'Süresi Dolmuş';
        }
        
        row.innerHTML = `
            <td>${coupon.id}</td>
            <td><strong>${coupon.code}</strong></td>
            <td>${coupon.discount}</td>
            <td>${coupon.type}</td>
            <td>${coupon.minAmount}</td>
            <td>${coupon.startDate}</td>
            <td>${coupon.endDate}</td>
            <td>${coupon.usageLimit}</td>
            <td>${coupon.usageCount}</td>
            <td>
                <span class="status-badge ${status}">
                    ${statusText}
                </span>
            </td>
            <td>
                <button class="btn btn-small btn-edit edit-coupon" data-id="${coupon.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-small btn-delete delete-coupon" data-id="${coupon.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Kupon düzenleme
    const editButtons = document.querySelectorAll('.edit-coupon');
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const couponId = this.getAttribute('data-id');
            const coupon = coupons.find(c => c.id == couponId);
            
            // Demo olarak kupon verilerini doldur
            document.getElementById('coupon-modal-title').textContent = 'Kupon Düzenle';
            document.getElementById('coupon-id').value = couponId;
            document.getElementById('coupon-code').value = coupon.code;
            document.getElementById('coupon-discount-type').value = coupon.type === 'Yüzde' ? 'percentage' : 'fixed';
            document.getElementById('coupon-discount-value').value = coupon.discount.replace(/[^0-9\.]/g, '');
            document.getElementById('coupon-min-amount').value = coupon.minAmount.replace(/[^0-9\.]/g, '');
            
            // Başlangıç ve bitiş tarihlerini ayarla
            const startDate = coupon.startDate.split('.').reverse().join('-');
            const endDate = coupon.endDate.split('.').reverse().join('-');
            document.getElementById('coupon-start-date').value = startDate;
            document.getElementById('coupon-end-date').value = endDate;
            
            document.getElementById('coupon-usage-limit').value = coupon.usageLimit;
            document.getElementById('coupon-status').value = coupon.isActive ? '1' : '0';
            
            // Modalı aç
            document.getElementById('coupon-modal').style.display = 'block';
        });
    });
    
    // Kupon silme
    const deleteButtons = document.querySelectorAll('.delete-coupon');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const couponId = this.getAttribute('data-id');
            const couponCode = coupons.find(c => c.id == couponId).code;
            
            if (confirm(`"${couponCode}" kuponunu silmek istediğinizden emin misiniz?`)) {
                // Demo olarak silindi mesajı göster
                alert(`"${couponCode}" kuponu başarıyla silindi!`);
                loadCouponsTable();
            }
        });
    });
} 

document.addEventListener('DOMContentLoaded', function() {
    // Admin kullanıcısını kontrol et
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'admin') {
        window.location.href = '/login.html';
        return;
    }

    // Kullanıcı bilgilerini güncelle
    updateUserInfo();

    // Menü item'larını aktif yapma
    const menuItems = document.querySelectorAll('.admin-menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            if (item.id === 'logout-button') return;
            
            e.preventDefault();
            
            // Tüm menü öğelerinden active class'ını kaldır
            menuItems.forEach(menuItem => {
                menuItem.classList.remove('active');
            });
            
            // Tıklanan menü öğesine active class'ını ekle
            item.classList.add('active');
            
            // Panel ID'sini al
            const panelId = item.getAttribute('data-panel');
            
            // Tüm panelleri gizle
            const panels = document.querySelectorAll('.admin-panel');
            panels.forEach(panel => {
                panel.style.display = 'none';
            });
            
            // İlgili paneli göster
            document.getElementById(panelId).style.display = 'block';
            
            // URL'i güncelle
            window.history.pushState({}, '', item.getAttribute('href'));
        });
    });

    // URL hash değiştiğinde
    window.addEventListener('hashchange', function() {
        const hash = window.location.hash || '#dashboard';
        const menuItem = document.querySelector(`.admin-menu-item[href="${hash}"]`);
        if (menuItem) {
            menuItem.click();
        }
    });

    // Sayfa yüklendiğinde hash'e göre ilgili sekmeyi aç
    const hash = window.location.hash || '#dashboard';
    const menuItem = document.querySelector(`.admin-menu-item[href="${hash}"]`);
    if (menuItem) {
        menuItem.click();
    }

    // Form tabları için
    const formTabs = document.querySelectorAll('.form-tab');
    formTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabContentId = tab.getAttribute('data-tab');
            
            // Tüm tablardan active class'ını kaldır
            formTabs.forEach(t => t.classList.remove('active'));
            
            // Tüm tab içeriklerini gizle
            document.querySelectorAll('.form-tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            // Tıklanan taba active class'ını ekle
            tab.classList.add('active');
            
            // İlgili tab içeriğini göster
            document.getElementById(tabContentId).classList.add('active');
        });
    });

    // Çıkış yap butonu
    document.getElementById('logout-button').addEventListener('click', function(e) {
        e.preventDefault();
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userName');
        window.location.href = '/login.html';
    });

    // İşletme modalı
    setupBusinessModal();
    
    // Kullanıcı modalı
    setupUserModal();
    
    // Kupon modalı
    setupCouponModal();
    
    // Demo veriler ile istatistikleri güncelle
    updateDashboardStats();
    
    // Demo veriler ile tabloları doldur
    loadBusinessesTable();
    loadUsersTable();
    loadCouponsTable();
    updateBusinessTypeCounts();
});

// Kullanıcı bilgilerini güncelleme
function updateUserInfo() {
    const userName = localStorage.getItem('userName') || 'Admin';
    document.querySelector('.admin-user-name').textContent = userName;
    
    // Avatar baş harflerini al
    const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase();
    document.querySelector('.admin-avatar').textContent = initials;
}

// İşletme modal kurulumu
function setupBusinessModal() {
    const addBusinessBtn = document.getElementById('add-business-btn');
    const businessModal = document.getElementById('business-modal');
    const closeBusinessModal = document.getElementById('close-business-modal');
    const cancelBusiness = document.getElementById('cancel-business');
    const businessForm = document.getElementById('business-form');
    
    // Logo yükleme önizlemesi
    const businessLogoInput = document.getElementById('business-logo-input');
    const businessLogoInfo = document.getElementById('business-logo-info');
    const businessLogoPreview = document.getElementById('business-logo-preview');
    
    businessLogoInput.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            businessLogoInfo.textContent = file.name;
            
            const reader = new FileReader();
            reader.onload = function(e) {
                businessLogoPreview.innerHTML = `<img src="${e.target.result}" alt="Logo önizleme">`;
            }
            reader.readAsDataURL(file);
        } else {
            businessLogoInfo.textContent = 'Henüz dosya seçilmedi';
            businessLogoPreview.innerHTML = '';
        }
    });
    
    // Çalışma durumu toggle
    const dayStatusToggles = document.querySelectorAll('.day-status input[type="checkbox"]');
    dayStatusToggles.forEach(toggle => {
        toggle.addEventListener('change', function() {
            const statusText = this.parentElement.nextElementSibling;
            statusText.textContent = this.checked ? 'Açık' : 'Kapalı';
        });
    });
    
    // Modal açma
    addBusinessBtn.addEventListener('click', function() {
        document.getElementById('business-modal-title').textContent = 'Yeni İşletme Ekle';
        businessForm.reset();
        businessLogoPreview.innerHTML = '';
        businessLogoInfo.textContent = 'Henüz dosya seçilmedi';
        
        // İlk tab'ı aktif yap
        document.querySelector('.form-tab').click();
        
        businessModal.style.display = 'block';
    });
    
    // Modal kapatma
    closeBusinessModal.addEventListener('click', function() {
        businessModal.style.display = 'none';
    });
    
    cancelBusiness.addEventListener('click', function() {
        businessModal.style.display = 'none';
    });
    
    // Modal dışına tıklandığında kapatma
    window.addEventListener('click', function(e) {
        if (e.target === businessModal) {
            businessModal.style.display = 'none';
        }
    });
    
    // Form gönderimi
    businessForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Form verilerini al ve işle
        const formData = {
            id: document.getElementById('business-id').value || null,
            name: document.getElementById('business-name').value,
            type: document.getElementById('business-type').value,
            description: document.getElementById('business-description').value,
            slogan: document.getElementById('business-slogan').value,
            isActive: document.getElementById('business-status').value === '1',
            email: document.getElementById('business-email').value,
            phone: document.getElementById('business-phone').value,
            landline: document.getElementById('business-landline').value,
            ownerId: 2, // Varsayılan işletme sahibi ID'si
            ownerName: document.getElementById('owner-name').value,
            ownerSurname: document.getElementById('owner-surname').value,
            ibanName: document.getElementById('business-iban-name').value,
            iban: document.getElementById('business-iban').value,
            city: document.getElementById('business-city').value,
            district: document.getElementById('business-district').value,
            neighborhood: document.getElementById('business-neighborhood').value,
            street: document.getElementById('business-street').value,
            postalCode: document.getElementById('business-postal-code').value,
            latitude: parseFloat(document.getElementById('business-lat').value),
            longitude: parseFloat(document.getElementById('business-lng').value),
            workingHours: {
                monday: {
                    isOpen: document.getElementById('monday-status').checked,
                    openTime: document.getElementById('monday-open').value,
                    closeTime: document.getElementById('monday-close').value
                },
                tuesday: {
                    isOpen: document.getElementById('tuesday-status').checked,
                    openTime: document.getElementById('tuesday-open').value,
                    closeTime: document.getElementById('tuesday-close').value
                },
                wednesday: {
                    isOpen: document.getElementById('wednesday-status').checked,
                    openTime: document.getElementById('wednesday-open').value,
                    closeTime: document.getElementById('wednesday-close').value
                },
                thursday: {
                    isOpen: document.getElementById('thursday-status').checked,
                    openTime: document.getElementById('thursday-open').value,
                    closeTime: document.getElementById('thursday-close').value
                },
                friday: {
                    isOpen: document.getElementById('friday-status').checked,
                    openTime: document.getElementById('friday-open').value,
                    closeTime: document.getElementById('friday-close').value
                },
                saturday: {
                    isOpen: document.getElementById('saturday-status').checked,
                    openTime: document.getElementById('saturday-open').value,
                    closeTime: document.getElementById('saturday-close').value
                },
                sunday: {
                    isOpen: document.getElementById('sunday-status').checked,
                    openTime: document.getElementById('sunday-open').value,
                    closeTime: document.getElementById('sunday-close').value
                }
            },
            password: document.getElementById('business-password').value,
            isFeatured: document.getElementById('business-featured').checked
        };
        
        // Logo dosyası
        const logoFile = document.getElementById('business-logo-input').files[0];
        
        console.log('İşletme kaydedildi:', formData);
        
        // Demo olarak başarılı mesajı göster
        alert(formData.id ? 'İşletme başarıyla güncellendi!' : 'Yeni işletme başarıyla eklendi!');
        
        // Tabloyu güncelle
        loadBusinessesTable();
        updateBusinessTypeCounts();
        updateDashboardStats();
        
        // Modalı kapat
        businessModal.style.display = 'none';
    });
}

// Kullanıcı modal kurulumu
function setupUserModal() {
    const addUserBtn = document.getElementById('add-user-btn');
    const userModal = document.getElementById('user-modal');
    const closeUserModal = document.getElementById('close-user-modal');
    const cancelUser = document.getElementById('cancel-user');
    const userForm = document.getElementById('user-form');
    
    // Modal açma
    addUserBtn.addEventListener('click', function() {
        document.getElementById('user-modal-title').textContent = 'Yeni Kullanıcı Ekle';
        userForm.reset();
        document.getElementById('user-id').value = '';
        userModal.style.display = 'block';
    });
    
    // Modal kapatma
    closeUserModal.addEventListener('click', function() {
        userModal.style.display = 'none';
    });
    
    cancelUser.addEventListener('click', function() {
        userModal.style.display = 'none';
    });
    
    // Modal dışına tıklandığında kapatma
    window.addEventListener('click', function(e) {
        if (e.target === userModal) {
            userModal.style.display = 'none';
        }
    });
    
    // Form gönderimi
    userForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Form verilerini al ve işle
        const formData = {
            id: document.getElementById('user-id').value || null,
            name: document.getElementById('user-name').value,
            email: document.getElementById('user-email').value,
            phone: document.getElementById('user-phone').value,
            role: document.getElementById('user-role').value,
            password: document.getElementById('user-password').value,
            isActive: document.getElementById('user-status').value === '1'
        };
        
        console.log('Kullanıcı kaydedildi:', formData);
        
        // Demo olarak başarılı mesajı göster
        alert(formData.id ? 'Kullanıcı başarıyla güncellendi!' : 'Yeni kullanıcı başarıyla eklendi!');
        
        // Tabloyu güncelle
        loadUsersTable();
        updateDashboardStats();
        
        // Modalı kapat
        userModal.style.display = 'none';
    });
}

// Kupon modal kurulumu
function setupCouponModal() {
    const addCouponBtn = document.getElementById('add-coupon-btn');
    const couponModal = document.getElementById('coupon-modal');
    const closeCouponModal = document.getElementById('close-coupon-modal');
    const cancelCoupon = document.getElementById('cancel-coupon');
    const couponForm = document.getElementById('coupon-form');
    
    // Tüm işletme türleri checkbox'ı
    const allTypesCheckbox = document.getElementById('coupon-all-types');
    const businessTypeCheckboxes = document.querySelectorAll('.business-type-checkbox');
    
    allTypesCheckbox.addEventListener('change', function() {
        businessTypeCheckboxes.forEach(checkbox => {
            checkbox.checked = this.checked;
            checkbox.disabled = this.checked;
        });
    });
    
    // Modal açma
    addCouponBtn.addEventListener('click', function() {
        document.getElementById('coupon-modal-title').textContent = 'Yeni Kupon Ekle';
        couponForm.reset();
        document.getElementById('coupon-id').value = '';
        
        // Başlangıç ve bitiş tarihlerini ayarla
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('coupon-start-date').value = today;
        
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        document.getElementById('coupon-end-date').value = nextMonth.toISOString().split('T')[0];
        
        // İşletme türleri checkbox'larını sıfırla
        allTypesCheckbox.checked = true;
        businessTypeCheckboxes.forEach(checkbox => {
            checkbox.checked = true;
            checkbox.disabled = true;
        });
        
        couponModal.style.display = 'block';
    });
    
    // Modal kapatma
    closeCouponModal.addEventListener('click', function() {
        couponModal.style.display = 'none';
    });
    
    cancelCoupon.addEventListener('click', function() {
        couponModal.style.display = 'none';
    });
    
    // Modal dışına tıklandığında kapatma
    window.addEventListener('click', function(e) {
        if (e.target === couponModal) {
            couponModal.style.display = 'none';
        }
    });
    
    // Form gönderimi
    couponForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // İşletme türlerini al
        let businessTypes = [];
        if (allTypesCheckbox.checked) {
            businessTypes = ['all'];
        } else {
            businessTypeCheckboxes.forEach(checkbox => {
                if (checkbox.checked) {
                    businessTypes.push(checkbox.id.replace('coupon-', ''));
                }
            });
        }
        
        // Form verilerini al ve işle
        const formData = {
            id: document.getElementById('coupon-id').value || null,
            code: document.getElementById('coupon-code').value,
            description: document.getElementById('coupon-description').value,
            discountType: document.getElementById('coupon-discount-type').value,
            discountValue: parseFloat(document.getElementById('coupon-discount-value').value),
            minAmount: parseFloat(document.getElementById('coupon-min-amount').value) || 0,
            maxDiscount: parseFloat(document.getElementById('coupon-max-discount').value) || null,
            startDate: document.getElementById('coupon-start-date').value,
            endDate: document.getElementById('coupon-end-date').value,
            usageLimit: parseInt(document.getElementById('coupon-usage-limit').value) || null,
            userUsageLimit: parseInt(document.getElementById('coupon-user-usage-limit').value) || 1,
            businessTypes: businessTypes,
            isActive: document.getElementById('coupon-status').value === '1'
        };
        
        console.log('Kupon kaydedildi:', formData);
        
        // Demo olarak başarılı mesajı göster
        alert(formData.id ? 'Kupon başarıyla güncellendi!' : 'Yeni kupon başarıyla eklendi!');
        
        // Tabloyu güncelle
        loadCouponsTable();
        
        // Modalı kapat
        couponModal.style.display = 'none';
    });
}

// Dashboard istatistiklerini güncelleme
function updateDashboardStats() {
    document.getElementById('total-users-count').textContent = '156';
    document.getElementById('total-businesses-count').textContent = '42';
    document.getElementById('total-appointments-count').textContent = '387';
    document.getElementById('total-reviews-count').textContent = '245';
}

// İşletme türlerine göre işletme sayılarını güncelleme
function updateBusinessTypeCounts() {
    document.getElementById('aracyikama-count').textContent = '12';
    document.getElementById('ekspertiz-count').textContent = '8';
    document.getElementById('otopark-count').textContent = '15';
    document.getElementById('lastikdegisim-count').textContent = '7';
}

// İşletmeler tablosunu doldurma
function loadBusinessesTable() {
    const tableBody = document.querySelector('#businesses-table tbody');
    
    // Demo veriler
    const businesses = [
        {
            id: 1,
            name: 'Kristal Oto Yıkama',
            type: 'aracyikama',
            location: 'İstanbul / Kadıköy',
            contact: 'info@kristalyikama.com',
            isActive: true
        },
        {
            id: 2,
            name: 'Pro Ekspertiz Merkezi',
            type: 'ekspertiz',
            location: 'İstanbul / Maltepe',
            contact: 'info@proekspertiz.com',
            isActive: true
        },
        {
            id: 3,
            name: 'Güvenli Otopark',
            type: 'otopark',
            location: 'İstanbul / Beşiktaş',
            contact: 'info@guvenliotopark.com',
            isActive: true
        },
        {
            id: 4,
            name: 'Hızlı Lastik Değişim',
            type: 'lastikdegisim',
            location: 'İstanbul / Şişli',
            contact: 'info@hizlilastik.com',
            isActive: true
        }
    ];
    
    // Tabloyu temizle
    tableBody.innerHTML = '';
    
    // Verileri tabloya ekle
    businesses.forEach(business => {
        const row = document.createElement('tr');
        
        // Türkçe tür isimlerini göster
        const typeLabels = {
            'aracyikama': 'Araç Yıkama',
            'ekspertiz': 'Ekspertiz',
            'otopark': 'Otopark',
            'lastikdegisim': 'Lastik Değişim'
        };
        
        row.innerHTML = `
            <td>${business.id}</td>
            <td><div class="business-logo-small">
                <img src="/img/${business.type}.png" alt="${business.name}">
            </div></td>
            <td>${business.name}</td>
            <td>${typeLabels[business.type]}</td>
            <td>${business.location}</td>
            <td>${business.contact}</td>
            <td>
                <span class="status-badge ${business.isActive ? 'active' : 'inactive'}">
                    ${business.isActive ? 'Aktif' : 'Pasif'}
                </span>
            </td>
            <td>
                <button class="btn btn-small btn-edit edit-business" data-id="${business.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-small btn-delete delete-business" data-id="${business.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // İşletme düzenleme
    const editButtons = document.querySelectorAll('.edit-business');
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const businessId = this.getAttribute('data-id');
            // Demo olarak işletme verilerini doldur
            document.getElementById('business-modal-title').textContent = 'İşletme Düzenle';
            document.getElementById('business-id').value = businessId;
            document.getElementById('business-name').value = businesses.find(b => b.id == businessId).name;
            document.getElementById('business-type').value = businesses.find(b => b.id == businessId).type;
            document.getElementById('business-email').value = businesses.find(b => b.id == businessId).contact;
            document.getElementById('business-status').value = businesses.find(b => b.id == businessId).isActive ? '1' : '0';
            
            // İlk tab'ı aktif yap
            document.querySelector('.form-tab').click();
            
            // Modalı aç
            document.getElementById('business-modal').style.display = 'block';
        });
    });
    
    // İşletme silme
    const deleteButtons = document.querySelectorAll('.delete-business');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const businessId = this.getAttribute('data-id');
            const businessName = businesses.find(b => b.id == businessId).name;
            
            if (confirm(`"${businessName}" işletmesini silmek istediğinizden emin misiniz?`)) {
                // Demo olarak silindi mesajı göster
                alert(`"${businessName}" işletmesi başarıyla silindi!`);
                loadBusinessesTable();
                updateBusinessTypeCounts();
                updateDashboardStats();
            }
        });
    });
}

// Kullanıcılar tablosunu doldurma
function loadUsersTable() {
    const tableBody = document.querySelector('#users-table tbody');
    
    // Demo veriler
    const users = [
        {
            id: 1,
            name: 'Admin Kullanıcı',
            email: 'admin@arabamon.com',
            phone: '5551234567',
            role: 'admin',
            createdAt: '01.01.2023',
            isActive: true
        },
        {
            id: 2,
            name: 'İşletme Sahibi',
            email: 'business@arabamon.com',
            phone: '5551234568',
            role: 'business',
            createdAt: '15.01.2023',
            isActive: true
        },
        {
            id: 3,
            name: 'Normal Kullanıcı',
            email: 'user@arabamon.com',
            phone: '5551234569',
            role: 'user',
            createdAt: '20.01.2023',
            isActive: true
        }
    ];
    
    // Tabloyu temizle
    tableBody.innerHTML = '';
    
    // Verileri tabloya ekle
    users.forEach(user => {
        const row = document.createElement('tr');
        
        // Türkçe rol isimlerini göster
        const roleLabels = {
            'admin': 'Admin',
            'business': 'İşletme',
            'user': 'Kullanıcı'
        };
        
        row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.phone}</td>
            <td>
                <span class="role-badge ${user.role}">
                    ${roleLabels[user.role]}
                </span>
            </td>
            <td>${user.createdAt}</td>
            <td>
                <span class="status-badge ${user.isActive ? 'active' : 'inactive'}">
                    ${user.isActive ? 'Aktif' : 'Pasif'}
                </span>
            </td>
            <td>
                <button class="btn btn-small btn-edit edit-user" data-id="${user.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-small btn-delete delete-user" data-id="${user.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Kullanıcı düzenleme
    const editButtons = document.querySelectorAll('.edit-user');
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const userId = this.getAttribute('data-id');
            // Demo olarak kullanıcı verilerini doldur
            document.getElementById('user-modal-title').textContent = 'Kullanıcı Düzenle';
            document.getElementById('user-id').value = userId;
            document.getElementById('user-name').value = users.find(u => u.id == userId).name;
            document.getElementById('user-email').value = users.find(u => u.id == userId).email;
            document.getElementById('user-phone').value = users.find(u => u.id == userId).phone;
            document.getElementById('user-role').value = users.find(u => u.id == userId).role;
            document.getElementById('user-status').value = users.find(u => u.id == userId).isActive ? '1' : '0';
            
            // Modalı aç
            document.getElementById('user-modal').style.display = 'block';
        });
    });
    
    // Kullanıcı silme
    const deleteButtons = document.querySelectorAll('.delete-user');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const userId = this.getAttribute('data-id');
            const userName = users.find(u => u.id == userId).name;
            
            if (confirm(`"${userName}" kullanıcısını silmek istediğinizden emin misiniz?`)) {
                // Demo olarak silindi mesajı göster
                alert(`"${userName}" kullanıcısı başarıyla silindi!`);
                loadUsersTable();
                updateDashboardStats();
            }
        });
    });
}

// Kuponlar tablosunu doldurma
function loadCouponsTable() {
    const tableBody = document.querySelector('#coupons-table tbody');
    
    // Demo veriler
    const coupons = [
        {
            id: 1,
            code: 'WELCOME20',
            discount: '%20',
            type: 'Yüzde',
            minAmount: '100 TL',
            startDate: '01.03.2023',
            endDate: '31.12.2023',
            usageLimit: '100',
            usageCount: '45',
            isActive: true
        },
        {
            id: 2,
            code: 'SUMMER50',
            discount: '%50',
            type: 'Yüzde',
            minAmount: '250 TL',
            startDate: '01.06.2023',
            endDate: '31.08.2023',
            usageLimit: '50',
            usageCount: '32',
            isActive: false
        },
        {
            id: 3,
            code: 'DISCOUNT100',
            discount: '100 TL',
            type: 'Sabit',
            minAmount: '500 TL',
            startDate: '15.05.2023',
            endDate: '15.06.2023',
            usageLimit: '20',
            usageCount: '20',
            isActive: false
        }
    ];
    
    // Tabloyu temizle
    tableBody.innerHTML = '';
    
    // Verileri tabloya ekle
    coupons.forEach(coupon => {
        const row = document.createElement('tr');
        
        let status = 'active';
        let statusText = 'Aktif';
        
        if (!coupon.isActive) {
            status = 'inactive';
            statusText = 'Pasif';
        }
        
        // Bitiş tarihi geçmiş mi kontrol et
        const now = new Date();
        const endDate = new Date(coupon.endDate.split('.').reverse().join('-'));
        
        if (endDate < now) {
            status = 'expired';
            statusText = 'Süresi Dolmuş';
        }
        
        row.innerHTML = `
            <td>${coupon.id}</td>
            <td><strong>${coupon.code}</strong></td>
            <td>${coupon.discount}</td>
            <td>${coupon.type}</td>
            <td>${coupon.minAmount}</td>
            <td>${coupon.startDate}</td>
            <td>${coupon.endDate}</td>
            <td>${coupon.usageLimit}</td>
            <td>${coupon.usageCount}</td>
            <td>
                <span class="status-badge ${status}">
                    ${statusText}
                </span>
            </td>
            <td>
                <button class="btn btn-small btn-edit edit-coupon" data-id="${coupon.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-small btn-delete delete-coupon" data-id="${coupon.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Kupon düzenleme
    const editButtons = document.querySelectorAll('.edit-coupon');
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const couponId = this.getAttribute('data-id');
            const coupon = coupons.find(c => c.id == couponId);
            
            // Demo olarak kupon verilerini doldur
            document.getElementById('coupon-modal-title').textContent = 'Kupon Düzenle';
            document.getElementById('coupon-id').value = couponId;
            document.getElementById('coupon-code').value = coupon.code;
            document.getElementById('coupon-discount-type').value = coupon.type === 'Yüzde' ? 'percentage' : 'fixed';
            document.getElementById('coupon-discount-value').value = coupon.discount.replace(/[^0-9\.]/g, '');
            document.getElementById('coupon-min-amount').value = coupon.minAmount.replace(/[^0-9\.]/g, '');
            
            // Başlangıç ve bitiş tarihlerini ayarla
            const startDate = coupon.startDate.split('.').reverse().join('-');
            const endDate = coupon.endDate.split('.').reverse().join('-');
            document.getElementById('coupon-start-date').value = startDate;
            document.getElementById('coupon-end-date').value = endDate;
            
            document.getElementById('coupon-usage-limit').value = coupon.usageLimit;
            document.getElementById('coupon-status').value = coupon.isActive ? '1' : '0';
            
            // Modalı aç
            document.getElementById('coupon-modal').style.display = 'block';
        });
    });
    
    // Kupon silme
    const deleteButtons = document.querySelectorAll('.delete-coupon');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const couponId = this.getAttribute('data-id');
            const couponCode = coupons.find(c => c.id == couponId).code;
            
            if (confirm(`"${couponCode}" kuponunu silmek istediğinizden emin misiniz?`)) {
                // Demo olarak silindi mesajı göster
                alert(`"${couponCode}" kuponu başarıyla silindi!`);
                loadCouponsTable();
            }
        });
    });
} 