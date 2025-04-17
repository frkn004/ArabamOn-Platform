/**
 * Kullanıcı Paneli JavaScript Fonksiyonları
 */
document.addEventListener('DOMContentLoaded', function() {
  initUserPanel();
});

/**
 * Kullanıcı panelini başlatan fonksiyon
 */
function initUserPanel() {
  // Sidebar toggle fonksiyonu
  initSidebar();
  
  // Kullanıcı bilgilerini yükle
  loadUserInfo();
  
  // Randevuları yükle
  loadAppointments();
  
  // Yaklaşan randevuları yükle
  loadUpcomingAppointments();
  
  // Değerlendirmeleri yükle
  loadReviews();

  // Araçları yükle
  loadVehicles();

  // Kuponları yükle
  loadCoupons();
  
  // Event listenerları ekle
  addUserPanelEventListeners();

  // Yeni randevu butonları için event listener ekle
  const newAppointmentBtns = document.querySelectorAll('#newAppointmentBtn, #newAppointmentBtn2');
  newAppointmentBtns.forEach(btn => {
    if (btn) {
      btn.addEventListener('click', () => {
        alert('Yeni randevu oluşturma formu açılacak. Bu işlevsellik şu anda yapım aşamasındadır.');
      });
    }
  });

  // Araç ekleme butonu için event listener ekle
  const addVehicleBtn = document.getElementById('addVehicleBtn');
  if (addVehicleBtn) {
    addVehicleBtn.addEventListener('click', showAddVehicleModal);
  }
}

/**
 * Sidebar toggle fonksiyonu
 */
function initSidebar() {
  const sidebarToggle = document.getElementById('sidebarToggle');
  const userSidebar = document.getElementById('userSidebar');
  const userContent = document.getElementById('userContent');
  
  if (sidebarToggle && userSidebar && userContent) {
    sidebarToggle.addEventListener('click', function() {
      userSidebar.classList.toggle('active');
      
      // İçerik alanını kaydır
      if (userSidebar.classList.contains('active')) {
        userContent.style.marginLeft = 'var(--sidebar-width)';
      } else {
        userContent.style.marginLeft = '0';
      }
    });
  }
}

/**
 * Kullanıcı bilgilerini yükleyen fonksiyon
 */
async function loadUserInfo() {
  try {
    // Kullanıcı bilgilerini getir
    const userData = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!userData) {
      window.location.href = 'login.html';
      return;
    }
    
    // Kullanıcı adını güncelle
    const userNameElement = document.querySelector('.user-menu span');
    if (userNameElement) {
      userNameElement.textContent = `${userData.firstName} ${userData.lastName}`;
    }
    
    // MOCK: Kullanıcı istatistiklerini güncelle
    const activeAppointmentsElement = document.querySelector('.info-card:nth-child(1) .number');
    if (activeAppointmentsElement) {
      activeAppointmentsElement.textContent = '2';
    }
    
    const pastAppointmentsElement = document.querySelector('.info-card:nth-child(2) .number');
    if (pastAppointmentsElement) {
      pastAppointmentsElement.textContent = '8';
    }
    
    const reviewsElement = document.querySelector('.info-card:nth-child(3) .number');
    if (reviewsElement) {
      reviewsElement.textContent = '5';
    }
    
    const vehiclesElement = document.querySelector('.info-card:nth-child(4) .number');
    if (vehiclesElement) {
      vehiclesElement.textContent = '3';
    }
    
  } catch (error) {
    console.error('Kullanıcı bilgileri yüklenirken hata:', error);
    showError('Kullanıcı bilgileri yüklenirken bir hata oluştu.');
  }
}

/**
 * Kullanıcı randevularını yükleyen fonksiyon
 */
async function loadAppointments() {
  try {
    // Mock randevu verileri (localStorage'dan al)
    const appointments = JSON.parse(localStorage.getItem('mockAppointments')) || [];
    
    // HTML içeriğini oluştur
    const appointmentsContainer = document.querySelector('#appointments .user-section-content');
    if (appointmentsContainer) {
      if (appointments.length === 0) {
        appointmentsContainer.innerHTML = '<p class="no-data">Henüz randevunuz bulunmamaktadır.</p>';
        return;
      }
      
      let html = '';
      
      appointments.forEach(appointment => {
        html += `
          <div class="appointment-card" data-id="${appointment.id}">
            <div class="appointment-header">
              <div class="appointment-date">
                <i class="fas fa-calendar-alt"></i>
                ${appointment.date} - ${appointment.time}
              </div>
              <div class="appointment-status ${appointment.status}">
                ${getStatusText(appointment.status)}
              </div>
            </div>
            <div class="appointment-body">
              <div class="appointment-business">
                <img src="${appointment.businessLogo}" alt="${appointment.businessName}" class="business-logo">
                <div class="business-info">
                  <h3>${appointment.businessName}</h3>
                  <p>${appointment.businessAddress}</p>
                </div>
              </div>
              <div class="appointment-service">
                <div class="service-name">${appointment.service}</div>
                <div class="service-details">
                  <div class="service-duration"><i class="fas fa-clock"></i> ${appointment.duration}</div>
                  <div class="service-price">${appointment.price}</div>
                </div>
              </div>
              <div class="appointment-actions">
                ${appointment.status !== 'completed' && appointment.status !== 'cancelled' ? `
                  <button class="btn-reschedule" data-id="${appointment.id}">
                    <i class="fas fa-calendar-alt"></i> Yeniden Planla
                  </button>
                  <button class="btn-cancel" data-id="${appointment.id}">
                    <i class="fas fa-times"></i> İptal Et
                  </button>
                ` : ''}
                ${appointment.status === 'completed' && !appointment.hasReview ? `
                  <button class="btn-review" data-id="${appointment.id}">
                    <i class="fas fa-star"></i> Değerlendir
                  </button>
                ` : ''}
              </div>
            </div>
          </div>
        `;
      });
      
      appointmentsContainer.innerHTML = html;
      
      // Event listener'ları ekle
      const rescheduleButtons = document.querySelectorAll('.btn-reschedule');
      rescheduleButtons.forEach(button => {
        button.addEventListener('click', function() {
          const appointmentId = this.getAttribute('data-id');
          rescheduleAppointment(appointmentId);
        });
      });
      
      const cancelButtons = document.querySelectorAll('.btn-cancel');
      cancelButtons.forEach(button => {
        button.addEventListener('click', function() {
          const appointmentId = this.getAttribute('data-id');
          cancelAppointment(appointmentId);
        });
      });
      
      const reviewButtons = document.querySelectorAll('.btn-review');
      reviewButtons.forEach(button => {
        button.addEventListener('click', function() {
          const appointmentId = this.getAttribute('data-id');
          reviewAppointment(appointmentId);
        });
      });
    }
  } catch (error) {
    console.error('Randevular yüklenirken hata:', error);
    showError('Randevular yüklenirken bir hata oluştu.');
  }
}

/**
 * Kullanıcı değerlendirmelerini yükleyen fonksiyon
 */
async function loadReviews() {
  try {
    // Mock değerlendirme verileri (localStorage'dan al)
    const reviews = JSON.parse(localStorage.getItem('mockReviews')) || [];
    
    // HTML içeriğini oluştur
    const reviewsContainer = document.querySelector('#reviews .user-section-content');
    if (reviewsContainer) {
      if (reviews.length === 0) {
        reviewsContainer.innerHTML = '<p class="no-data">Henüz değerlendirmeniz bulunmamaktadır.</p>';
        return;
      }
      
      let html = '';
      
      reviews.forEach(review => {
        // Yıldız HTML'ini oluştur
        let stars = '';
        for (let i = 1; i <= 5; i++) {
          stars += `<i class="fas fa-star${i <= review.rating ? '' : ' far'}"></i>`;
        }
        
        html += `
          <div class="review-item" data-id="${review.id}">
            <div class="review-business">
              <img src="${review.businessLogo}" alt="${review.businessName}" class="review-business-logo">
              <div class="review-business-name">${review.businessName}</div>
              <div class="review-business-service">${review.service}</div>
              <div class="review-date">
                <i class="fas fa-calendar-alt"></i> ${review.date}
              </div>
            </div>
            <div class="review-content">
              <div class="review-rating">
                ${stars}
              </div>
              <div class="review-text">${review.comment}</div>
              ${review.response ? `
                <div class="review-response">
                  <div class="response-label">İşletme Yanıtı:</div>
                  <div class="response-text">${review.response}</div>
                </div>
              ` : ''}
            </div>
          </div>
        `;
      });
      
      reviewsContainer.innerHTML = html;
    }
  } catch (error) {
    console.error('Değerlendirmeler yüklenirken hata:', error);
    showError('Değerlendirmeler yüklenirken bir hata oluştu.');
  }
}

/**
 * Kullanıcı araçlarını yükleyen fonksiyon
 */
async function loadVehicles() {
  try {
    // Mock araç verileri (localStorage'dan al)
    const vehicles = JSON.parse(localStorage.getItem('mockVehicles')) || [];
    
    // HTML içeriğini oluştur
    const vehiclesContainer = document.querySelector('#vehicles .user-section-content');
    if (vehiclesContainer) {
      if (vehicles.length === 0) {
        vehiclesContainer.innerHTML = '<p class="no-data">Henüz araç kaydınız bulunmamaktadır.</p>';
        return;
      }
      
      let html = '<div class="vehicles-grid">';
      
      vehicles.forEach(vehicle => {
        html += `
          <div class="vehicle-card" data-id="${vehicle.id}">
            <div class="vehicle-header">
              <div class="vehicle-plate">${vehicle.plate}</div>
              <div class="vehicle-actions">
                <button class="vehicle-edit" data-id="${vehicle.id}">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="vehicle-delete" data-id="${vehicle.id}">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
            <div class="vehicle-body">
              <div class="vehicle-brand-model">${vehicle.brand} ${vehicle.model}</div>
              <div class="vehicle-details">
                <div class="vehicle-year"><i class="fas fa-calendar"></i> ${vehicle.year}</div>
                <div class="vehicle-type"><i class="fas fa-car"></i> ${vehicle.type}</div>
                <div class="vehicle-color"><i class="fas fa-palette"></i> ${vehicle.color}</div>
              </div>
            </div>
          </div>
        `;
      });
      
      html += `
        <div class="vehicle-card add-vehicle">
          <div class="add-vehicle-content">
            <div class="add-icon"><i class="fas fa-plus"></i></div>
            <div class="add-text">Yeni Araç Ekle</div>
          </div>
        </div>
      </div>`;
      
      vehiclesContainer.innerHTML = html;
      
      // Event listener'ları ekle
      const addVehicleButton = document.querySelector('.add-vehicle');
      if (addVehicleButton) {
        addVehicleButton.addEventListener('click', showAddVehicleModal);
      }
      
      const editButtons = document.querySelectorAll('.vehicle-edit');
      editButtons.forEach(button => {
        button.addEventListener('click', function() {
          const vehicleId = this.getAttribute('data-id');
          editVehicle(vehicleId);
        });
      });
      
      const deleteButtons = document.querySelectorAll('.vehicle-delete');
      deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
          const vehicleId = this.getAttribute('data-id');
          deleteVehicle(vehicleId);
        });
      });
    }
  } catch (error) {
    console.error('Araçlar yüklenirken hata:', error);
    showError('Araçlar yüklenirken bir hata oluştu.');
  }
}

/**
 * Randevu durumuna göre metin döndüren yardımcı fonksiyon
 * @param {string} status - Randevu durumu
 * @returns {string} - Durum metni
 */
function getStatusText(status) {
  switch (status) {
    case 'confirmed':
      return 'Onaylandı';
    case 'pending':
      return 'Bekliyor';
    case 'cancelled':
      return 'İptal Edildi';
    case 'completed':
      return 'Tamamlandı';
    default:
      return 'Bilinmiyor';
  }
}

/**
 * User panel event listener'larını ekleyen fonksiyon
 */
function addUserPanelEventListeners() {
  // Tab değiştirme fonksiyonu
  const sidebarMenuItems = document.querySelectorAll('.sidebar-menu a');
  const contentSections = document.querySelectorAll('.user-section');
  
  sidebarMenuItems.forEach(item => {
    item.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Aktif linkleri temizle
      sidebarMenuItems.forEach(i => i.classList.remove('active'));
      
      // Tıklanan linki aktif yap
      this.classList.add('active');
      
      // İçerik bölümünü göster/gizle
      const targetId = this.textContent.trim().toLowerCase().replace(' ', '-');
      
      contentSections.forEach(section => {
        if (section.id === targetId) {
          section.style.display = 'block';
        } else {
          section.style.display = 'none';
        }
      });
    });
  });
}

/**
 * Randevu yeniden planlama fonksiyonu
 * @param {string} appointmentId - Randevu ID'si
 */
function rescheduleAppointment(appointmentId) {
  alert(`${appointmentId} ID'li randevu için tarih seçimi açılacak`);
  // Burada randevu yeniden planlama modalını açacak kod gelecek
}

/**
 * Randevu iptal etme fonksiyonu
 * @param {string} appointmentId - Randevu ID'si
 */
function cancelAppointment(appointmentId) {
  if (confirm(`${appointmentId} ID'li randevuyu iptal etmek istediğinize emin misiniz?`)) {
    // Randevuyu localStorage'dan bul ve iptal et
    const allAppointments = JSON.parse(localStorage.getItem('mockAppointments')) || [];
    const appointmentIndex = allAppointments.findIndex(a => a.id === appointmentId);
    
    if (appointmentIndex !== -1) {
      allAppointments[appointmentIndex].status = 'cancelled';
      localStorage.setItem('mockAppointments', JSON.stringify(allAppointments));
      
      alert('Randevu başarıyla iptal edildi.');
      
      // Sayfayı yeniden yükle
      loadAppointments();
      loadUpcomingAppointments();
    }
  }
}

/**
 * Araç ekleme modalını gösteren fonksiyon
 */
function showAddVehicleModal() {
  alert('Yeni araç ekleme formu açılacak');
  // Burada yeni araç ekleme modalını açacak kod gelecek
}

/**
 * Araç düzenleme fonksiyonu
 * @param {string} vehicleId - Araç ID'si
 */
function editVehicle(vehicleId) {
  alert(`${vehicleId} ID'li araç için düzenleme formu açılacak`);
  // Burada araç düzenleme modalını açacak kod gelecek
}

/**
 * Araç silme fonksiyonu
 * @param {string} vehicleId - Araç ID'si
 */
function deleteVehicle(vehicleId) {
  if (confirm(`${vehicleId} ID'li aracı silmek istediğinize emin misiniz?`)) {
    // Burada araç silme API çağrısı yapılacak
    alert('Araç başarıyla silindi.');
    loadVehicles(); // Araçları yeniden yükle
  }
}

/**
 * Yaklaşan randevuları yükleyen fonksiyon
 */
async function loadUpcomingAppointments() {
  try {
    // Mock randevu verileri (localStorage'dan al)
    const allAppointments = JSON.parse(localStorage.getItem('mockAppointments')) || [];
    
    // Sadece aktif randevuları filtrele (confirmed veya pending)
    const appointments = allAppointments.filter(appointment => 
      appointment.status === 'confirmed' || appointment.status === 'pending'
    );
    
    // HTML içeriğini oluştur
    const upcomingAppointmentsContainer = document.getElementById('upcomingAppointments');
    if (upcomingAppointmentsContainer) {
      if (appointments.length === 0) {
        upcomingAppointmentsContainer.innerHTML = '<p class="no-data">Yaklaşan randevunuz bulunmamaktadır.</p>';
        return;
      }
      
      let html = '';
      
      appointments.forEach(appointment => {
        html += `
          <div class="appointment-card" data-id="${appointment.id}">
            <div class="appointment-header">
              <div class="appointment-date">
                <i class="fas fa-calendar-alt"></i>
                ${appointment.date} - ${appointment.time}
              </div>
              <div class="appointment-status ${appointment.status}">
                ${getStatusText(appointment.status)}
              </div>
            </div>
            <div class="appointment-body">
              <div class="appointment-business">
                <img src="${appointment.businessLogo}" alt="${appointment.businessName}" class="business-logo">
                <div class="business-info">
                  <h3>${appointment.businessName}</h3>
                  <p>${appointment.businessAddress}</p>
                </div>
              </div>
              <div class="appointment-service">
                <div class="service-name">${appointment.service}</div>
                <div class="service-details">
                  <div class="service-duration"><i class="fas fa-clock"></i> ${appointment.duration}</div>
                  <div class="service-price">${appointment.price}</div>
                </div>
              </div>
              <div class="appointment-actions">
                <button class="btn-reschedule" data-id="${appointment.id}">
                  <i class="fas fa-calendar-alt"></i> Yeniden Planla
                </button>
                <button class="btn-cancel" data-id="${appointment.id}">
                  <i class="fas fa-times"></i> İptal Et
                </button>
              </div>
            </div>
          </div>
        `;
      });
      
      upcomingAppointmentsContainer.innerHTML = html;
      
      // Event listener'ları ekle
      const rescheduleButtons = upcomingAppointmentsContainer.querySelectorAll('.btn-reschedule');
      rescheduleButtons.forEach(button => {
        button.addEventListener('click', function() {
          const appointmentId = this.getAttribute('data-id');
          rescheduleAppointment(appointmentId);
        });
      });
      
      const cancelButtons = upcomingAppointmentsContainer.querySelectorAll('.btn-cancel');
      cancelButtons.forEach(button => {
        button.addEventListener('click', function() {
          const appointmentId = this.getAttribute('data-id');
          cancelAppointment(appointmentId);
        });
      });
    }
  } catch (error) {
    console.error('Yaklaşan randevular yüklenirken hata:', error);
    showError('Yaklaşan randevular yüklenirken bir hata oluştu.');
  }
}

/**
 * Kullanıcı kuponlarını yükleyen fonksiyon
 */
async function loadCoupons() {
  try {
    // Mock kupon verileri (localStorage'dan al)
    const coupons = JSON.parse(localStorage.getItem('mockUserCoupons')) || [];
    
    // Kupon istatistiğini güncelle
    const couponStatsElement = document.querySelector('.info-card:nth-child(4) .number');
    if (couponStatsElement) {
      couponStatsElement.textContent = coupons.length.toString();
    }
    
    // Kuponlar paneli varsa içeriğini oluştur
    const couponsSection = document.getElementById('kuponlarım');
    if (couponsSection) {
      const couponsContainer = couponsSection.querySelector('.user-section-content');
      
      if (coupons.length === 0) {
        couponsContainer.innerHTML = '<p class="no-data">Henüz kuponunuz bulunmamaktadır.</p>';
        return;
      }
      
      let html = '<div class="coupons-grid">';
      
      coupons.forEach(coupon => {
        html += `
          <div class="coupon-card" data-id="${coupon.id}">
            <div class="coupon-header">
              <div class="coupon-code">${coupon.code}</div>
              <div class="coupon-status ${coupon.status === 'active' ? 'active' : 'expired'}">
                ${coupon.status === 'active' ? 'Aktif' : 'Süresi Dolmuş'}
              </div>
            </div>
            <div class="coupon-body">
              <div class="coupon-business">${coupon.businessName}</div>
              <div class="coupon-description">${coupon.description}</div>
              <div class="coupon-discount">${coupon.discount}</div>
              <div class="coupon-validity">Geçerlilik: ${coupon.validUntil}</div>
            </div>
            <div class="coupon-footer">
              <button class="btn-use-coupon" data-id="${coupon.id}">
                <i class="fas fa-ticket-alt"></i> Kuponu Kullan
              </button>
            </div>
          </div>
        `;
      });
      
      html += '</div>';
      
      couponsContainer.innerHTML = html;
      
      // Event listener'ları ekle
      const useCouponButtons = couponsContainer.querySelectorAll('.btn-use-coupon');
      useCouponButtons.forEach(button => {
        button.addEventListener('click', function() {
          const couponId = this.getAttribute('data-id');
          useCoupon(couponId);
        });
      });
    }
  } catch (error) {
    console.error('Kuponlar yüklenirken hata:', error);
    showError('Kuponlar yüklenirken bir hata oluştu.');
  }
}

/**
 * Kupon kullanma fonksiyonu
 * @param {string} couponId - Kupon ID'si
 */
function useCoupon(couponId) {
  const coupons = JSON.parse(localStorage.getItem('mockUserCoupons')) || [];
  const coupon = coupons.find(c => c.id === couponId);
  
  if (coupon) {
    alert(`"${coupon.code}" kuponu kullanıldı! ${coupon.discount} indirim uygulandı.`);
    
    // Gerçek bir uygulamada burada randevu oluşturma ekranına yönlendirme yapılacak
    // Şimdilik kuponu kullanıldı olarak işaretleyelim
    const couponIndex = coupons.findIndex(c => c.id === couponId);
    coupons[couponIndex].status = 'used';
    localStorage.setItem('mockUserCoupons', JSON.stringify(coupons));
    
    // Kuponları yeniden yükle
    loadCoupons();
  }
}

/**
 * Hata mesajı gösteren fonksiyon
 * @param {string} message - Hata mesajı
 */
function showError(message) {
  // Hata mesajını göster
  alert(message); // Basit bir alert, gerçek uygulamada daha iyi bir UI kullanılabilir
}

/**
 * Tamamlanan randevuyu değerlendirme fonksiyonu
 * @param {string} appointmentId - Randevu ID'si
 */
function reviewAppointment(appointmentId) {
  alert(`${appointmentId} ID'li randevu için değerlendirme formu açılacak`);
  // Değerlendirme formunu aç
}

// CSS stillerini ekle
const style = document.createElement('style');
style.textContent = `
  .vehicles-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1.5rem;
  }
  
  .vehicle-card {
    background-color: white;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    overflow: hidden;
    transition: all 0.3s ease;
  }
  
  .vehicle-card:hover {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  }
  
  .vehicle-header {
    padding: 1rem;
    background-color: #f9fafb;
    border-bottom: 1px solid #e5e7eb;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .vehicle-plate {
    font-weight: 600;
    font-size: 1.1rem;
    color: #3949ab;
  }
  
  .vehicle-actions {
    display: flex;
    gap: 0.5rem;
  }
  
  .vehicle-actions button {
    background: none;
    border: none;
    color: #6b7280;
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 0.25rem;
    transition: all 0.2s ease;
  }
  
  .vehicle-actions button:hover {
    background-color: #f3f4f6;
  }
  
  .vehicle-edit:hover {
    color: #3949ab;
  }
  
  .vehicle-delete:hover {
    color: #f44336;
  }
  
  .vehicle-body {
    padding: 1rem;
  }
  
  .vehicle-brand-model {
    font-size: 1.1rem;
    font-weight: 500;
    margin-bottom: 0.75rem;
    color: #1f2937;
  }
  
  .vehicle-details {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
    color: #6b7280;
    font-size: 0.875rem;
  }
  
  .vehicle-details i {
    margin-right: 0.25rem;
    width: 16px;
    text-align: center;
  }
  
  .add-vehicle {
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    background-color: #f9fafb;
    border: 2px dashed #d1d5db;
  }
  
  .add-vehicle:hover {
    border-color: #3949ab;
    background-color: rgba(57, 73, 171, 0.05);
  }
  
  .add-vehicle-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 2rem 1rem;
  }
  
  .add-icon {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background-color: rgba(57, 73, 171, 0.1);
    color: #3949ab;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1.5rem;
    margin-bottom: 0.75rem;
  }
  
  .add-text {
    color: #3949ab;
    font-weight: 500;
  }
  
  .no-data {
    color: #6b7280;
    font-style: italic;
    text-align: center;
    padding: 2rem;
  }
  
  .coupons-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
  }
  
  .coupon-card {
    background-color: white;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    overflow: hidden;
    transition: all 0.3s ease;
  }
  
  .coupon-card:hover {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    transform: translateY(-5px);
  }
  
  .coupon-header {
    padding: 1rem;
    background-color: #f9fafb;
    border-bottom: 1px solid #e5e7eb;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .coupon-code {
    font-weight: 600;
    font-size: 1.1rem;
    color: #3949ab;
    letter-spacing: 1px;
  }
  
  .coupon-status {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    border-radius: 50px;
    font-size: 0.75rem;
    font-weight: 500;
  }
  
  .coupon-status.active {
    background-color: rgba(0, 200, 83, 0.1);
    color: #00c853;
  }
  
  .coupon-status.expired {
    background-color: rgba(244, 67, 54, 0.1);
    color: #f44336;
  }
  
  .coupon-body {
    padding: 1rem;
  }
  
  .coupon-business {
    font-weight: 500;
    margin-bottom: 0.5rem;
    color: #4b5563;
  }
  
  .coupon-description {
    font-size: 0.875rem;
    color: #6b7280;
    margin-bottom: 0.75rem;
  }
  
  .coupon-discount {
    font-size: 1.25rem;
    font-weight: 600;
    color: #3949ab;
    margin-bottom: 0.5rem;
  }
  
  .coupon-validity {
    font-size: 0.75rem;
    color: #6b7280;
  }
  
  .coupon-footer {
    padding: 0.75rem 1rem;
    border-top: 1px solid #e5e7eb;
    display: flex;
    justify-content: center;
  }
  
  .btn-use-coupon {
    padding: 0.5rem 1rem;
    background-color: #3949ab;
    color: white;
    border: none;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    transition: background-color 0.2s ease;
  }
  
  .btn-use-coupon i {
    margin-right: 0.375rem;
  }
  
  .btn-use-coupon:hover {
    background-color: #303f9f;
  }
  
  .favorites-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
  }
  
  .favorite-card {
    background-color: white;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    overflow: hidden;
    transition: all 0.3s ease;
  }
  
  .favorite-card:hover {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    transform: translateY(-5px);
  }
  
  .favorite-img {
    width: 100%;
    height: 160px;
    object-fit: cover;
  }
  
  .favorite-content {
    padding: 1rem;
  }
  
  .favorite-content h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1.125rem;
    color: #1f2937;
  }
  
  .favorite-location {
    color: #6b7280;
    font-size: 0.875rem;
    margin-bottom: 0.5rem;
  }
  
  .favorite-rating {
    color: #f59e0b;
    margin-bottom: 0.5rem;
  }
  
  .favorite-rating i {
    margin-right: 0.125rem;
  }
  
  .favorite-actions {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    border-top: 1px solid #e5e7eb;
  }
  
  .favorite-actions button {
    padding: 0.5rem;
    border: none;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }
  
  .favorite-actions button i {
    margin-right: 0.375rem;
  }
  
  .favorite-actions .book {
    background-color: #3949ab;
    color: white;
  }
  
  .favorite-actions .book:hover {
    background-color: #303f9f;
  }
  
  .favorite-actions .remove-fav {
    background-color: rgba(244, 67, 54, 0.1);
    color: #f44336;
  }
  
  .favorite-actions .remove-fav:hover {
    background-color: rgba(244, 67, 54, 0.2);
  }
  
  .btn-sm {
    padding: 0.5rem 1rem;
    background-color: #3949ab;
    color: white;
    border: none;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }
  
  .btn-sm:hover {
    background-color: #303f9f;
  }
  
  .btn-outline {
    background-color: transparent;
    border: 1px solid #d1d5db;
    color: #4b5563;
  }
  
  .btn-outline:hover {
    background-color: #f3f4f6;
    border-color: #9ca3af;
    color: #1f2937;
  }
`;
document.head.appendChild(style); 