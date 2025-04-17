/**
 * Ana JavaScript dosyası
 */
document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
});

/**
 * Uygulama başlatma fonksiyonu
 */
function initializeApp() {
  // Aktif sayfanın navbar linkini işaretle
  highlightActiveNavLink();
  
  // Form validasyonlarını aktifleştir
  initFormValidation();
  
  // Animasyonları başlat
  initAnimations();
  
  // Event listenerları ekle
  addEventListeners();
  
  // Randevu işlemleri için gerekli dinleyicileri ekle
  setupAppointmentListeners();
}

/**
 * Aktif sayfanın navbar linkini işaretleme fonksiyonu
 */
function highlightActiveNavLink() {
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.navbar-links a');
  
  navLinks.forEach(link => {
    const linkPath = link.getAttribute('href');
    
    if (currentPath === linkPath || 
        (linkPath !== '/' && currentPath.startsWith(linkPath))) {
      link.classList.add('active');
    }
  });
}

/**
 * Form validasyonlarını başlatma fonksiyonu
 */
function initFormValidation() {
  const forms = document.querySelectorAll('form');
  
  forms.forEach(form => {
    form.addEventListener('submit', function(event) {
      if (!validateForm(form)) {
        event.preventDefault();
      }
    });
  });
}

/**
 * Form validasyonu yapan fonksiyon
 * @param {HTMLFormElement} form - Valide edilecek form elementi
 * @returns {boolean} - Form geçerli ise true, değilse false
 */
function validateForm(form) {
  let isValid = true;
  const inputs = form.querySelectorAll('input, select, textarea');
  
  inputs.forEach(input => {
    // required attribute'u olan inputları kontrol et
    if (input.hasAttribute('required') && !input.value.trim()) {
      isValid = false;
      showError(input, 'Bu alan zorunludur');
    } else if (input.type === 'email' && input.value.trim() && !validateEmail(input.value)) {
      isValid = false;
      showError(input, 'Geçerli bir e-posta adresi giriniz');
    } else {
      clearError(input);
    }
  });
  
  return isValid;
}

/**
 * Email validasyonu yapan fonksiyon
 * @param {string} email - Kontrol edilecek email
 * @returns {boolean} - Email geçerli ise true, değilse false
 */
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Input için hata mesajı gösteren fonksiyon
 * @param {HTMLElement} input - Hata gösterilecek input
 * @param {string} message - Hata mesajı
 */
function showError(input, message) {
  clearError(input);
  
  input.classList.add('is-invalid');
  
  const errorDiv = document.createElement('div');
  errorDiv.className = 'invalid-feedback';
  errorDiv.textContent = message;
  
  input.parentNode.appendChild(errorDiv);
}

/**
 * Input için hata mesajını temizleyen fonksiyon
 * @param {HTMLElement} input - Hatası temizlenecek input
 */
function clearError(input) {
  input.classList.remove('is-invalid');
  
  const errorDiv = input.parentNode.querySelector('.invalid-feedback');
  if (errorDiv) {
    errorDiv.remove();
  }
}

/**
 * Animasyonları başlatan fonksiyon
 */
function initAnimations() {
  // Görünür hale gelen elementlere animasyon ekle
  const animatedElements = document.querySelectorAll('.fade-in, .slide-in-up');
  
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.visibility = 'visible';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    
    animatedElements.forEach(el => {
      el.style.visibility = 'hidden';
      observer.observe(el);
    });
  } else {
    // IntersectionObserver desteklenmeyen tarayıcılar için fallback
    animatedElements.forEach(el => {
      el.style.visibility = 'visible';
    });
  }
}

/**
 * Event listener'ları ekleyen fonksiyon
 */
function addEventListeners() {
  // Örnek: Modal açma/kapama
  const modalTriggers = document.querySelectorAll('[data-toggle="modal"]');
  const modalCloses = document.querySelectorAll('.modal-close, .modal-overlay');
  
  modalTriggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(trigger.getAttribute('data-target'));
      if (target) {
        target.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });
  
  modalCloses.forEach(close => {
    close.addEventListener('click', () => {
      const modal = close.closest('.modal');
      if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  });
  
  // Sayfa dışı tıklamalarda modal'ı kapat
  document.addEventListener('click', (e) => {
    const modals = document.querySelectorAll('.modal.active');
    modals.forEach(modal => {
      if (e.target === modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  });
}

/**
 * Randevu işlemleri için gerekli dinleyicileri ekler
 */
function setupAppointmentListeners() {
  // Randevu için giriş yapma butonu
  const loginToBookBtn = document.getElementById('loginToBookBtn');
  if (loginToBookBtn) {
    loginToBookBtn.addEventListener('click', function() {
      // Doğrudan login sayfasına yönlendir
      window.location.href = 'login.html?redirect=appointment.html';
    });
  }
  
  // Randevu işlemleri için diğer event listenerlar
  const appointmentForm = document.getElementById('appointmentForm');
  if (appointmentForm) {
    appointmentForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Kullanıcı oturum açmış mı kontrol et
      const token = localStorage.getItem('token');
      if (token) {
        // Oturum açmışsa randevu modalını göster
        const appointmentModal = document.getElementById('appointmentModal');
        if (appointmentModal) {
          appointmentModal.classList.add('show');
        }
      } else {
        // Oturum açmamışsa login sayfasına yönlendir
        window.location.href = 'login.html?redirect=appointment.html';
      }
    });
  }
}

/**
 * Sayfa yüklendiğinde çalışacak animasyon kontrolü
 */
window.addEventListener('load', function() {
  // Hero bölümündeki elementlere animasyon ekle
  const heroElements = document.querySelectorAll('.hero h1, .hero p, .hero .btn');
  heroElements.forEach((el, index) => {
    setTimeout(() => {
      el.classList.add('fade-in');
    }, index * 200);
  });
}); 