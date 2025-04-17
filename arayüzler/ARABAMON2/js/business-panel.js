/**
 * İşletme Paneli JavaScript Fonksiyonları
 */
document.addEventListener('DOMContentLoaded', function() {
  initBusinessPanel();
});

/**
 * İşletme panelini başlatan fonksiyon
 */
function initBusinessPanel() {
  // Sidebar toggle fonksiyonu
  initSidebar();
  
  // İşletme bilgilerini yükle
  loadBusinessInfo();
  
  // Randevuları yükle
  loadAppointments();
  
  // Hizmetleri yükle
  loadServices();
  
  // Değerlendirmeleri yükle
  loadReviews();

  // Kuponları yükle
  loadCoupons();

  // İstatistikleri yükle
  loadStatistics();
  
  // Event listenerları ekle
  addBusinessPanelEventListeners();

  // Yeni hizmet ekleme butonu için event listener ekle
  const addServiceBtn = document.getElementById('addServiceBtn');
  if (addServiceBtn) {
    addServiceBtn.addEventListener('click', () => {
      alert('Yeni hizmet ekleme formu açılacak. Bu işlevsellik şu anda yapım aşamasındadır.');
    });
  }

  // Fotoğraf ekleme butonu için event listener ekle
  const addPhotoBtn = document.getElementById('addPhotoBtn');
  if (addPhotoBtn) {
    addPhotoBtn.addEventListener('click', () => {
      alert('Fotoğraf yükleme ekranı açılacak. Bu işlevsellik şu anda yapım aşamasındadır.');
    });
  }
}

/**
 * Sidebar toggle fonksiyonu
 */
function initSidebar() {
  const sidebarToggle = document.getElementById('sidebarToggle');
  const businessSidebar = document.getElementById('businessSidebar');
  const businessContent = document.getElementById('businessContent');
  
  if (sidebarToggle && businessSidebar && businessContent) {
    sidebarToggle.addEventListener('click', function() {
      businessSidebar.classList.toggle('active');
      
      // İçerik alanını kaydır
      if (businessSidebar.classList.contains('active')) {
        businessContent.style.marginLeft = 'var(--sidebar-width)';
      } else {
        businessContent.style.marginLeft = '0';
      }
    });
  }
}

/**
 * İşletme bilgilerini yükleyen fonksiyon
 */
async function loadBusinessInfo() {
  try {
    // İşletme bilgilerini getir (mock data)
    const businessData = {
      id: '1',
      name: 'Lüks Oto Yıkama',
      logo: 'images/business1.jpg',
      address: 'Kadıköy, İstanbul',
      phone: '0216 123 45 67',
      email: 'info@luxotoyikama.com',
      website: 'www.luxotoyikama.com',
      description: 'Aracınızın bakımı için en lüks hizmet',
      openingHours: {
        monday: '09:00 - 18:00',
        tuesday: '09:00 - 18:00',
        wednesday: '09:00 - 18:00',
        thursday: '09:00 - 18:00',
        friday: '09:00 - 18:00',
        saturday: '10:00 - 17:00',
        sunday: 'Kapalı'
      }
    };
    
    // İşletme adını güncelle
    const businessNameElement = document.querySelector('.business-header .dropdown-toggle span');
    if (businessNameElement) {
      businessNameElement.textContent = businessData.name;
    }
    
    // İstatistikleri güncelle (mock data)
    const todayAppointments = document.querySelector('.stat-card:nth-child(1) .number');
    if (todayAppointments) {
      todayAppointments.textContent = '8';
    }
    
    const pendingAppointments = document.querySelector('.stat-card:nth-child(2) .number');
    if (pendingAppointments) {
      pendingAppointments.textContent = '24';
    }
    
    const newReviews = document.querySelector('.stat-card:nth-child(3) .number');
    if (newReviews) {
      newReviews.textContent = '12';
    }
    
    const activeServices = document.querySelector('.stat-card:nth-child(4) .number');
    if (activeServices) {
      activeServices.textContent = '6';
    }
    
  } catch (error) {
    console.error('İşletme bilgileri yüklenirken hata:', error);
    showError('İşletme bilgileri yüklenirken bir hata oluştu.');
  }
}

/**
 * İşletme randevularını yükleyen fonksiyon
 */
async function loadAppointments() {
  try {
    // Mock randevu verileri (localStorage'dan al)
    const allAppointments = JSON.parse(localStorage.getItem('mockAppointments')) || [];
    // İşletmenin ID'si ile filtrele (bu örnekte işletme ID'si 2)
    const appointments = allAppointments.filter(appointment => appointment.businessId === '2');
    
    // Tablo satırlarını oluştur
    const appointmentsTableBody = document.querySelector('.appointment-table tbody');
    if (appointmentsTableBody) {
      let html = '';
      
      appointments.forEach(appointment => {
        html += `
          <tr data-id="${appointment.id}">
            <td>${appointment.userId}</td>
            <td>${appointment.service}</td>
            <td>${appointment.date} - ${appointment.time}</td>
            <td><span class="appointment-status ${appointment.status}">${getStatusText(appointment.status)}</span></td>
            <td>
              <div class="appointment-actions">
                ${appointment.status === 'pending' ? 
                  `<button class="action-button confirm" data-id="${appointment.id}">Onayla</button>` : 
                  appointment.status === 'confirmed' ? 
                  `<button class="action-button complete" data-id="${appointment.id}">Tamamla</button>` : ''}
                ${appointment.status !== 'completed' && appointment.status !== 'cancelled' ? 
                  `<button class="action-button cancel" data-id="${appointment.id}">İptal</button>` : ''}
              </div>
            </td>
          </tr>
        `;
      });
      
      appointmentsTableBody.innerHTML = html;
      
      // Event listener'ları ekle
      const confirmButtons = document.querySelectorAll('.action-button.confirm');
      confirmButtons.forEach(button => {
        button.addEventListener('click', function() {
          const appointmentId = this.getAttribute('data-id');
          confirmAppointment(appointmentId);
        });
      });
      
      const completeButtons = document.querySelectorAll('.action-button.complete');
      completeButtons.forEach(button => {
        button.addEventListener('click', function() {
          const appointmentId = this.getAttribute('data-id');
          completeAppointment(appointmentId);
        });
      });
      
      const cancelButtons = document.querySelectorAll('.action-button.cancel');
      cancelButtons.forEach(button => {
        button.addEventListener('click', function() {
          const appointmentId = this.getAttribute('data-id');
          cancelAppointment(appointmentId);
        });
      });
    }
  } catch (error) {
    console.error('Randevular yüklenirken hata:', error);
    showError('Randevular yüklenirken bir hata oluştu.');
  }
}

/**
 * İşletme hizmetlerini yükleyen fonksiyon
 */
async function loadServices() {
  try {
    // Mock hizmet verileri (localStorage'dan al)
    const services = JSON.parse(localStorage.getItem('mockServices')) || [];
    
    // HTML içeriğini oluştur
    const servicesContainer = document.querySelector('.services-grid');
    if (servicesContainer) {
      let html = '';
      
      services.forEach(service => {
        html += `
          <div class="service-card" data-id="${service.id}">
            <div class="service-header">
              <div class="service-title">
                <h3>${service.name}</h3>
              </div>
              <div class="service-price">${service.price}</div>
            </div>
            <div class="service-body">
              <div class="service-description">
                <p>${service.description}</p>
              </div>
              <div class="service-meta">
                <div class="service-duration">
                  <i class="fas fa-clock"></i> ${service.duration}
                </div>
                <div class="service-status">
                  <i class="fas fa-circle"></i> ${service.status}
                </div>
              </div>
            </div>
            <div class="service-footer">
              <button class="edit" data-id="${service.id}">
                <i class="fas fa-edit"></i> Düzenle
              </button>
              <button class="delete" data-id="${service.id}">
                <i class="fas fa-trash"></i> Sil
              </button>
            </div>
          </div>
        `;
      });
      
      servicesContainer.innerHTML = html;
      
      // Event listener'ları ekle
      const editButtons = document.querySelectorAll('.service-footer .edit');
      editButtons.forEach(button => {
        button.addEventListener('click', function() {
          const serviceId = this.getAttribute('data-id');
          editService(serviceId);
        });
      });
      
      const deleteButtons = document.querySelectorAll('.service-footer .delete');
      deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
          const serviceId = this.getAttribute('data-id');
          deleteService(serviceId);
        });
      });
    }
  } catch (error) {
    console.error('Hizmetler yüklenirken hata:', error);
    showError('Hizmetler yüklenirken bir hata oluştu.');
  }
}

/**
 * İşletme değerlendirmelerini yükleyen fonksiyon
 */
async function loadReviews() {
  try {
    // Mock değerlendirme verileri (localStorage'dan al)
    const allReviews = JSON.parse(localStorage.getItem('mockReviews')) || [];
    // İşletmenin ID'si ile filtrele (bu örnekte işletme ID'si 2)
    const reviews = allReviews.filter(review => review.businessId === '2');
    
    // HTML içeriğini oluştur
    const reviewsContainer = document.querySelector('#reviews .business-section-content');
    if (reviewsContainer) {
      if (reviews.length === 0) {
        reviewsContainer.innerHTML = '<p class="no-data">Henüz değerlendirme bulunmamaktadır.</p>';
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
          <div class="review-card" data-id="${review.id}">
            <div class="review-header">
              <div class="review-customer">${review.userId}</div>
              <div class="review-rating">${stars}</div>
            </div>
            <div class="review-content">
              <div class="review-service">${review.service} - ${review.date}</div>
              <div class="review-comment">${review.comment}</div>
              ${review.response ? 
                `<div class="review-response">
                  <div class="response-label">Yanıtınız:</div>
                  <div class="response-text">${review.response}</div>
                </div>` : 
                `<div class="review-response-form">
                  <textarea class="form-control" placeholder="Bu değerlendirmeye yanıt verin..."></textarea>
                  <button class="btn-respond" data-id="${review.id}">Yanıtla</button>
                </div>`
              }
            </div>
          </div>
        `;
      });
      
      reviewsContainer.innerHTML = html;
      
      // Event listener'ları ekle
      const respondButtons = document.querySelectorAll('.btn-respond');
      respondButtons.forEach(button => {
        button.addEventListener('click', function() {
          const reviewId = this.getAttribute('data-id');
          const responseText = this.previousElementSibling.value.trim();
          
          if (responseText) {
            respondToReview(reviewId, responseText);
          } else {
            alert('Lütfen bir yanıt girin.');
          }
        });
      });
    }
  } catch (error) {
    console.error('Değerlendirmeler yüklenirken hata:', error);
    showError('Değerlendirmeler yüklenirken bir hata oluştu.');
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
 * İşletme paneli event listener'larını ekleyen fonksiyon
 */
function addBusinessPanelEventListeners() {
  // Tab değiştirme fonksiyonu
  const sidebarMenuItems = document.querySelectorAll('.sidebar-menu a');
  const contentSections = document.querySelectorAll('.business-section');
  
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
 * Randevu onaylama fonksiyonu
 * @param {string} appointmentId - Randevu ID'si
 */
function confirmAppointment(appointmentId) {
  if (confirm(`${appointmentId} ID'li randevuyu onaylamak istiyor musunuz?`)) {
    // Randevuyu localStorage'dan bul ve onayla
    const allAppointments = JSON.parse(localStorage.getItem('mockAppointments')) || [];
    const appointmentIndex = allAppointments.findIndex(a => a.id === appointmentId);
    
    if (appointmentIndex !== -1) {
      allAppointments[appointmentIndex].status = 'confirmed';
      localStorage.setItem('mockAppointments', JSON.stringify(allAppointments));
      
      alert('Randevu başarıyla onaylandı.');
      loadAppointments(); // Randevuları yeniden yükle
    }
  }
}

/**
 * Randevu tamamlama fonksiyonu
 * @param {string} appointmentId - Randevu ID'si
 */
function completeAppointment(appointmentId) {
  if (confirm(`${appointmentId} ID'li randevuyu tamamlandı olarak işaretlemek istiyor musunuz?`)) {
    // Randevuyu localStorage'dan bul ve tamamla
    const allAppointments = JSON.parse(localStorage.getItem('mockAppointments')) || [];
    const appointmentIndex = allAppointments.findIndex(a => a.id === appointmentId);
    
    if (appointmentIndex !== -1) {
      allAppointments[appointmentIndex].status = 'completed';
      localStorage.setItem('mockAppointments', JSON.stringify(allAppointments));
      
      alert('Randevu başarıyla tamamlandı.');
      loadAppointments(); // Randevuları yeniden yükle
    }
  }
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
      loadAppointments(); // Randevuları yeniden yükle
    }
  }
}

/**
 * Hizmet düzenleme fonksiyonu
 * @param {string} serviceId - Hizmet ID'si
 */
function editService(serviceId) {
  alert(`${serviceId} ID'li hizmet için düzenleme formu açılacak`);
  // Hizmet düzenleme modalını aç
}

/**
 * Hizmet silme fonksiyonu
 * @param {string} serviceId - Hizmet ID'si
 */
function deleteService(serviceId) {
  if (confirm(`${serviceId} ID'li hizmeti silmek istediğinize emin misiniz?`)) {
    // API çağrısı burada yapılacak
    alert('Hizmet başarıyla silindi.');
    loadServices(); // Hizmetleri yeniden yükle
  }
}

/**
 * Değerlendirmeye yanıt verme fonksiyonu
 * @param {string} reviewId - Değerlendirme ID'si
 * @param {string} responseText - Yanıt metni
 */
function respondToReview(reviewId, responseText) {
  // Değerlendirmeyi localStorage'dan bul ve yanıt ekle
  const allReviews = JSON.parse(localStorage.getItem('mockReviews')) || [];
  const reviewIndex = allReviews.findIndex(r => r.id === reviewId);
  
  if (reviewIndex !== -1) {
    allReviews[reviewIndex].response = responseText;
    localStorage.setItem('mockReviews', JSON.stringify(allReviews));
    
    alert('Yanıtınız başarıyla kaydedildi.');
    loadReviews(); // Değerlendirmeleri yeniden yükle
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
 * İşletme kuponlarını yükleyen fonksiyon
 */
async function loadCoupons() {
  try {
    // Mock kupon verileri (localStorage'dan al)
    const coupons = JSON.parse(localStorage.getItem('mockBusinessCoupons')) || [];
    
    // Kuponlar paneli varsa içeriğini oluştur
    const couponsSection = document.getElementById('kuponlarım');
    if (couponsSection) {
      const couponsContainer = couponsSection.querySelector('.business-section-content');
      
      if (!couponsContainer) return;
      
      if (coupons.length === 0) {
        couponsContainer.innerHTML = '<p class="no-data">Henüz kupon oluşturmadınız.</p>';
        return;
      }
      
      let html = `
        <div class="coupons-actions">
          <button class="btn btn-primary" id="createCouponBtn">+ Yeni Kupon Oluştur</button>
        </div>
        <table class="coupons-table">
          <thead>
            <tr>
              <th>Kupon Kodu</th>
              <th>Açıklama</th>
              <th>İndirim</th>
              <th>Geçerlilik</th>
              <th>Kullanım</th>
              <th>Durum</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
      `;
      
      coupons.forEach(coupon => {
        const discountText = coupon.type === 'percent' ? `%${coupon.value}` : 
                            coupon.type === 'fixed' ? `${coupon.value} ₺` : 'Ücretsiz';
        
        html += `
          <tr data-id="${coupon.id}">
            <td><strong>${coupon.code}</strong></td>
            <td>${coupon.description}</td>
            <td>${discountText}</td>
            <td>${coupon.validFrom} - ${coupon.validUntil}</td>
            <td>${coupon.usageCount}/${coupon.usageLimit}</td>
            <td>
              <span class="coupon-status ${coupon.status === 'active' ? 'active' : 'expired'}">
                ${coupon.status === 'active' ? 'Aktif' : 'Süresi Dolmuş'}
              </span>
            </td>
            <td>
              <div class="table-actions">
                <button class="action-button edit" data-id="${coupon.id}">Düzenle</button>
                <button class="action-button cancel" data-id="${coupon.id}">İptal</button>
              </div>
            </td>
          </tr>
        `;
      });
      
      html += `
          </tbody>
        </table>
      `;
      
      couponsContainer.innerHTML = html;
      
      // Event listener'ları ekle
      const createCouponBtn = document.getElementById('createCouponBtn');
      if (createCouponBtn) {
        createCouponBtn.addEventListener('click', () => {
          alert('Yeni kupon oluşturma formu açılacak. Bu işlevsellik şu anda yapım aşamasındadır.');
        });
      }
      
      const editButtons = couponsContainer.querySelectorAll('.action-button.edit');
      editButtons.forEach(button => {
        button.addEventListener('click', function() {
          const couponId = this.getAttribute('data-id');
          editCoupon(couponId);
        });
      });
      
      const cancelButtons = couponsContainer.querySelectorAll('.action-button.cancel');
      cancelButtons.forEach(button => {
        button.addEventListener('click', function() {
          const couponId = this.getAttribute('data-id');
          cancelCoupon(couponId);
        });
      });
    }
  } catch (error) {
    console.error('Kuponlar yüklenirken hata:', error);
    showError('Kuponlar yüklenirken bir hata oluştu.');
  }
}

/**
 * İstatistikleri yükleyen fonksiyon
 */
async function loadStatistics() {
  try {
    // Mock istatistik verileri (localStorage'dan al)
    const stats = JSON.parse(localStorage.getItem('mockStatistics')) || {
      appointments: {
        total: 0,
        completed: 0,
        cancelled: 0,
        conversionRate: 0
      },
      revenue: {
        total: 0,
        currentMonth: 0,
        previousMonth: 0,
        growthRate: 0
      },
      customer: {
        averageRating: 0,
        totalReviews: 0,
        currentMonthReviews: 0,
        fiveStarRate: 0
      }
    };
    
    // İstatistik verilerini güncelle
    updateStatistics(stats);
    
    // Grafikleri oluştur
    createCharts();
    
  } catch (error) {
    console.error('İstatistikler yüklenirken hata:', error);
    showError('İstatistikler yüklenirken bir hata oluştu.');
  }
}

/**
 * İstatistik verilerini güncelleme fonksiyonu
 * @param {Object} stats - İstatistik verileri
 */
function updateStatistics(stats) {
  // Randevu istatistikleri
  const totalAppointments = document.querySelector('#raporlar .report-card:nth-child(1) .report-stat:nth-child(1) .stat-value');
  if (totalAppointments) totalAppointments.textContent = stats.appointments.total;
  
  const completedAppointments = document.querySelector('#raporlar .report-card:nth-child(1) .report-stat:nth-child(2) .stat-value');
  if (completedAppointments) completedAppointments.textContent = stats.appointments.completed;
  
  const cancelledAppointments = document.querySelector('#raporlar .report-card:nth-child(1) .report-stat:nth-child(3) .stat-value');
  if (cancelledAppointments) cancelledAppointments.textContent = stats.appointments.cancelled;
  
  const conversionRate = document.querySelector('#raporlar .report-card:nth-child(1) .report-stat:nth-child(4) .stat-value');
  if (conversionRate) conversionRate.textContent = `${stats.appointments.conversionRate}%`;
  
  // Gelir istatistikleri
  const totalRevenue = document.querySelector('#raporlar .report-card:nth-child(2) .report-stat:nth-child(1) .stat-value');
  if (totalRevenue) totalRevenue.textContent = `₺${stats.revenue.total}`;
  
  const currentMonthRevenue = document.querySelector('#raporlar .report-card:nth-child(2) .report-stat:nth-child(2) .stat-value');
  if (currentMonthRevenue) currentMonthRevenue.textContent = `₺${stats.revenue.currentMonth}`;
  
  const previousMonthRevenue = document.querySelector('#raporlar .report-card:nth-child(2) .report-stat:nth-child(3) .stat-value');
  if (previousMonthRevenue) previousMonthRevenue.textContent = `₺${stats.revenue.previousMonth}`;
  
  const growthRate = document.querySelector('#raporlar .report-card:nth-child(2) .report-stat:nth-child(4) .stat-value');
  if (growthRate) growthRate.textContent = `+${stats.revenue.growthRate}%`;
  
  // Müşteri istatistikleri
  const averageRating = document.querySelector('#raporlar .report-card:nth-child(3) .report-stat:nth-child(1) .stat-value');
  if (averageRating) averageRating.textContent = `${stats.customer.averageRating}/5`;
  
  const totalReviews = document.querySelector('#raporlar .report-card:nth-child(3) .report-stat:nth-child(2) .stat-value');
  if (totalReviews) totalReviews.textContent = stats.customer.totalReviews;
  
  const currentMonthReviews = document.querySelector('#raporlar .report-card:nth-child(3) .report-stat:nth-child(3) .stat-value');
  if (currentMonthReviews) currentMonthReviews.textContent = stats.customer.currentMonthReviews;
  
  const fiveStarRate = document.querySelector('#raporlar .report-card:nth-child(3) .report-stat:nth-child(4) .stat-value');
  if (fiveStarRate) fiveStarRate.textContent = `${stats.customer.fiveStarRate}%`;
}

/**
 * Grafikleri oluşturan fonksiyon (şu an için sadece placeholder)
 */
function createCharts() {
  // Bu fonksiyon gerçek bir grafik kütüphanesi ile genişletilebilir
  // Şu an için sadece placeholder metin gösteriyoruz
  const chartPlaceholders = document.querySelectorAll('.chart-placeholder div');
  chartPlaceholders.forEach(placeholder => {
    placeholder.textContent = '[Grafik Gösterimi - Gerçek grafikler için bir grafik kütüphanesi eklenecektir]';
  });
}

/**
 * Kupon düzenleme fonksiyonu
 * @param {string} couponId - Kupon ID'si
 */
function editCoupon(couponId) {
  alert(`${couponId} ID'li kupon için düzenleme formu açılacak`);
  // Kupon düzenleme modalını aç
}

/**
 * Kupon iptal etme fonksiyonu
 * @param {string} couponId - Kupon ID'si
 */
function cancelCoupon(couponId) {
  if (confirm(`${couponId} ID'li kuponu iptal etmek istediğinize emin misiniz?`)) {
    // Kuponu localStorage'dan bul ve iptal et
    const coupons = JSON.parse(localStorage.getItem('mockBusinessCoupons')) || [];
    const couponIndex = coupons.findIndex(c => c.id === couponId);
    
    if (couponIndex !== -1) {
      coupons[couponIndex].status = 'expired';
      localStorage.setItem('mockBusinessCoupons', JSON.stringify(coupons));
      
      alert('Kupon başarıyla iptal edildi.');
      loadCoupons(); // Kuponları yeniden yükle
    }
  }
}

// CSS stillerini ekle
const style = document.createElement('style');
style.textContent = `
  .review-card {
    background-color: white;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    margin-bottom: 1.5rem;
    overflow: hidden;
  }
  
  .review-header {
    padding: 1rem;
    background-color: #f9fafb;
    border-bottom: 1px solid #e5e7eb;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .review-customer {
    font-weight: 600;
    color: #1f2937;
  }
  
  .review-rating {
    color: #f59e0b;
  }
  
  .review-content {
    padding: 1rem;
  }
  
  .review-service {
    font-size: 0.875rem;
    color: #6b7280;
    margin-bottom: 0.5rem;
  }
  
  .review-comment {
    color: #1f2937;
    margin-bottom: 1rem;
  }
  
  .review-response {
    background-color: #f9fafb;
    padding: 1rem;
    border-radius: 0.375rem;
    margin-top: 0.5rem;
  }
  
  .response-label {
    font-weight: 500;
    color: #1e3a8a;
    margin-bottom: 0.25rem;
  }
  
  .response-text {
    color: #4b5563;
  }
  
  .review-response-form {
    margin-top: 0.5rem;
  }
  
  .review-response-form textarea {
    width: 100%;
    min-height: 80px;
    margin-bottom: 0.5rem;
  }
  
  .btn-respond {
    background-color: #1e3a8a;
    color: white;
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 0.375rem;
    cursor: pointer;
  }
  
  .btn-respond:hover {
    background-color: #1e40af;
  }
  
  .no-data {
    color: #6b7280;
    font-style: italic;
    text-align: center;
    padding: 2rem;
  }
  
  .coupons-actions {
    margin-bottom: 1.5rem;
    display: flex;
    justify-content: flex-end;
  }
  
  .coupons-table {
    width: 100%;
    border-collapse: collapse;
  }
  
  .coupons-table th, .coupons-table td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid #e5e7eb;
  }
  
  .coupons-table th {
    font-weight: 600;
    color: #4b5563;
    background-color: #f9fafb;
  }
  
  .coupons-table tr:last-child td {
    border-bottom: none;
  }
  
  .coupon-status {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    border-radius: 50px;
    font-size: 0.75rem;
    font-weight: 500;
  }
  
  .coupon-status.active {
    background-color: rgba(16, 185, 129, 0.1);
    color: #10b981;
  }
  
  .coupon-status.expired {
    background-color: rgba(239, 68, 68, 0.1);
    color: #ef4444;
  }
  
  .table-actions {
    display: flex;
    gap: 0.5rem;
  }
  
  .btn-primary {
    padding: 0.5rem 1rem;
    background-color: #1e3a8a;
    color: white;
    border: none;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }
  
  .btn-primary:hover {
    background-color: #1e40af;
  }
  
  .report-filters {
    margin-bottom: 1.5rem;
  }
  
  .date-range-picker {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .report-cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }
  
  .report-card {
    background-color: white;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    overflow: hidden;
  }
  
  .report-card-header {
    padding: 1rem;
    background-color: #f9fafb;
    border-bottom: 1px solid #e5e7eb;
  }
  
  .report-card-header h3 {
    margin: 0;
    font-size: 1.125rem;
    color: #1e3a8a;
  }
  
  .report-card-body {
    padding: 1rem;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
  
  .report-stat {
    padding: 0.5rem;
  }
  
  .stat-label {
    font-size: 0.875rem;
    color: #6b7280;
    margin-bottom: 0.25rem;
  }
  
  .stat-value {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1e3a8a;
  }
  
  .stat-value.positive {
    color: #10b981;
  }
  
  .stat-value.negative {
    color: #ef4444;
  }
  
  .report-charts {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    gap: 1.5rem;
  }
  
  .report-chart {
    background-color: white;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    overflow: hidden;
    padding: 1rem;
  }
  
  .report-chart h3 {
    margin: 0 0 1rem 0;
    font-size: 1.125rem;
    color: #1e3a8a;
  }
  
  .chart-placeholder {
    background-color: #f9fafb;
    border-radius: 0.375rem;
    height: 250px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #6b7280;
  }
  
  @media (max-width: 768px) {
    .report-card-body {
      grid-template-columns: 1fr;
    }
    
    .report-charts {
      grid-template-columns: 1fr;
    }
  }
`;
document.head.appendChild(style); 