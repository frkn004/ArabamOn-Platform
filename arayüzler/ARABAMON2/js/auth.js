/**
 * Oturum kontrolü ve doğrulama fonksiyonları
 */

document.addEventListener('DOMContentLoaded', function() {
  // Sayfa yüklendiğinde oturum durumunu kontrol et
  checkAuthStatus();
});

/**
 * Oturum durumunu kontrol eden fonksiyon
 */
function checkAuthStatus() {
  const token = localStorage.getItem('token');
  const currentUser = localStorage.getItem('currentUser');
  
  // Token ve kullanıcı bilgisi varsa oturum açık demektir
  if (token && currentUser) {
    // Kullanıcı bilgisini parse et
    const user = JSON.parse(currentUser);
    
    // Navbar'da giriş/kayıt butonları yerine kullanıcı menüsü göster
    updateNavbarForLoggedInUser(user);
    
    // Sayfa bazlı yetkilendirme kontrolü
    checkPageAccess(user);
  } else {
    // Oturum açık değilse, oturum gerektiren sayfalara erişimi kontrol et
    checkRestrictedPages();
  }
}

/**
 * Navbar'ı giriş yapmış kullanıcıya göre günceller
 * @param {Object} user - Kullanıcı bilgileri
 */
function updateNavbarForLoggedInUser(user) {
  const navbarLinks = document.querySelector('.navbar-links');
  
  // Eğer navbar yoksa işlem yapma
  if (!navbarLinks) return;
  
  // Giriş/Kayıt linkleri yerine kullanıcı menüsü ekle
  const loginLinks = Array.from(navbarLinks.querySelectorAll('a')).filter(link => 
    link.getAttribute('href') === 'login.html' || 
    link.getAttribute('href') === 'register.html'
  );
  
  if (loginLinks.length) {
    // Varolan linkleri kaldır
    loginLinks.forEach(link => {
      const listItem = link.parentElement;
      if (listItem) listItem.remove();
    });
    
    // Kullanıcı menüsü için yeni <li> elementi oluştur
    const userMenuItem = document.createElement('li');
    userMenuItem.className = 'user-menu';
    
    // Kullanıcı adı ya da emaili göster, admin ise belirt
    const displayName = user.firstName ? `${user.firstName} ${user.lastName}` : user.email;
    const roleLabel = user.role === 'admin' ? '<span class="badge admin-badge">Admin</span>' : '';
    
    // Kullanıcı paneli ya da admin paneli linkini ekle
    const panelLink = user.role === 'admin' ? 'admin-panel.html' : 'user-panel.html';
    
    userMenuItem.innerHTML = `
      <a href="#" class="user-menu-toggle">
        <i class="fas fa-user-circle"></i> 
        ${displayName} ${roleLabel}
      </a>
      <ul class="user-dropdown">
        <li><a href="${panelLink}"><i class="fas fa-tachometer-alt"></i> Panel</a></li>
        <li><a href="profile.html"><i class="fas fa-user-cog"></i> Profil</a></li>
        <li><a href="#" id="logout-btn"><i class="fas fa-sign-out-alt"></i> Çıkış Yap</a></li>
      </ul>
    `;
    
    // Kullanıcı menüsünü navbar'a ekle
    navbarLinks.appendChild(userMenuItem);
    
    // Kullanıcı dropdown menüsünü aç/kapat
    const userMenuToggle = userMenuItem.querySelector('.user-menu-toggle');
    userMenuToggle.addEventListener('click', function(e) {
      e.preventDefault();
      userMenuItem.classList.toggle('active');
    });
    
    // Çıkış butonuna event listener ekle
    const logoutBtn = document.getElementById('logout-btn');
    logoutBtn.addEventListener('click', async function(e) {
      e.preventDefault();
      await logout();
    });
    
    // Döküman tıklamasında dropdown'ı kapat
    document.addEventListener('click', function(e) {
      if (!userMenuItem.contains(e.target)) {
        userMenuItem.classList.remove('active');
      }
    });
  }
  
  // Admin kullanıcısı için ekstra linkler
  if (user.role === 'admin') {
    // Admin paneli linki ekle (eğer zaten yoksa)
    const adminPanelLink = Array.from(navbarLinks.querySelectorAll('a')).find(link => 
      link.getAttribute('href') === 'admin-panel.html'
    );
    
    if (!adminPanelLink) {
      const adminMenuItem = document.createElement('li');
      adminMenuItem.innerHTML = '<a href="admin-panel.html"><i class="fas fa-cogs"></i> Admin Panel</a>';
      navbarLinks.appendChild(adminMenuItem);
    }
  }
}

/**
 * Kullanıcının sayfa erişimini kontrol eder
 * @param {Object} user - Kullanıcı bilgileri
 */
function checkPageAccess(user) {
  const currentPath = window.location.pathname;
  const isAdminPage = currentPath.includes('admin-panel');
  
  // Admin sayfasına erişim kontrolü
  if (isAdminPage && user.role !== 'admin') {
    // Admin olmayan kullanıcı admin sayfasına erişmeye çalışıyor, ana sayfaya yönlendir
    window.location.href = 'index.html';
  }
}

/**
 * Oturum gerektiren sayfalara erişimi kontrol eder
 */
function checkRestrictedPages() {
  const currentPath = window.location.pathname;
  
  // Oturum gerektiren sayfalar listesi
  const restrictedPages = ['user-panel.html', 'admin-panel.html', 'profile.html'];
  
  // Şu anki sayfa kısıtlı bir sayfa mı?
  const isRestricted = restrictedPages.some(page => currentPath.includes(page));
  
  if (isRestricted) {
    // Kısıtlı sayfaya erişmeye çalışıyor, login sayfasına yönlendir
    window.location.href = 'login.html';
  }
}

/**
 * Kullanıcı çıkışı yapan fonksiyon
 */
async function logout() {
  try {
    // API üzerinden çıkış yap
    await window.arabamonAPI.logout();
    
    // Yerel depolamadan kullanıcı bilgilerini ve token'ı temizle
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    
    // Ana sayfaya yönlendir
    window.location.href = 'index.html';
  } catch (error) {
    console.error('Çıkış yapılırken hata oluştu:', error);
    alert('Çıkış yapılırken bir hata oluştu: ' + (error.message || 'Bilinmeyen hata'));
  }
}

// CSS stillerini head'e ekle
const style = document.createElement('style');
style.textContent = `
  .user-menu {
    position: relative;
  }
  
  .user-menu-toggle {
    display: flex;
    align-items: center;
  }
  
  .user-menu-toggle i {
    margin-right: 5px;
    font-size: 1.2rem;
  }
  
  .user-dropdown {
    position: absolute;
    top: 100%;
    right: 0;
    background: white;
    min-width: 200px;
    border-radius: 4px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    padding: 0.5rem 0;
    display: none;
    z-index: 1000;
  }
  
  .user-menu.active .user-dropdown {
    display: block;
    animation: fadeInDown 0.3s ease;
  }
  
  .user-dropdown li {
    margin: 0;
  }
  
  .user-dropdown a {
    padding: 0.6rem 1rem;
    display: flex;
    align-items: center;
  }
  
  .user-dropdown a i {
    margin-right: 8px;
    width: 20px;
    text-align: center;
  }
  
  .badge {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
    font-weight: 600;
    border-radius: 20px;
    margin-left: 5px;
  }
  
  .admin-badge {
    background-color: var(--danger-color);
    color: white;
  }
  
  @keyframes fadeInDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
document.head.appendChild(style);

/**
 * Kullanıcı kimlik doğrulama işlevleri
 */

// Mock kullanıcı verileri
const users = [
  {
    id: '1',
    email: 'kullanici@gmail.com',
    password: 'parola123',
    firstName: 'Ahmet',
    lastName: 'Yılmaz',
    phone: '0555 123 4567',
    address: 'Ataşehir, İstanbul',
    type: 'user' // Kullanıcı tipi: user
  },
  {
    id: '2',
    email: 'isletme@gmail.com',
    password: 'parola123',
    businessName: 'Lüks Oto Yıkama',
    phone: '0216 123 45 67',
    address: 'Kadıköy, İstanbul',
    type: 'business' // Kullanıcı tipi: business
  }
];

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', function() {
  const currentUser = getLoggedInUser();
  setupLoginListeners();
  setupMockData(); // Mock veriyi hazırla

  // Kullanıcı oturum açmışsa
  if (currentUser) {
    updateUI(currentUser);
  } else {
    // Mevcut sayfa giriş gerektiriyorsa yönlendir
    const requiresAuth = document.body.classList.contains('requires-auth');
    if (requiresAuth) {
      // Şu an user-panel.html veya business-panel.html sayfalarından birindeyse
      const currentPage = window.location.pathname;
      if (currentPage.includes('user-panel.html') || currentPage.includes('business-panel.html')) {
        window.location.href = 'index.html'; // Ana sayfaya yönlendir
      }
    }
  }
});

/**
 * Giriş formları için dinleyicileri ekler
 */
function setupLoginListeners() {
  // Giriş formu
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const email = document.getElementById('loginEmail').value;
      const password = document.getElementById('loginPassword').value;
      
      login(email, password);
    });
  }

  // Çıkış butonları
  const logoutButtons = document.querySelectorAll('.logout-button, .btn-logout');
  logoutButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      logout();
    });
  });
}

/**
 * Kullanıcı girişi
 * @param {string} email - Kullanıcı e-postası
 * @param {string} password - Kullanıcı şifresi
 */
function login(email, password) {
  console.log("Login deneniyor:", email, password);
  console.log("Mevcut kullanıcılar:", users);
  
  // Kullanıcı eşleşmesini kontrol et
  const user = users.find(u => u.email === email && u.password === password);
  
  if (user) {
    console.log("Kullanıcı bulundu:", user);
    // Kullanıcı bilgilerini sakla (şifre hariç)
    const userData = { ...user };
    delete userData.password;
    
    localStorage.setItem('currentUser', JSON.stringify(userData));
    localStorage.setItem('token', 'mock-token-' + Math.random()); // Mock token ekle
    
    // Kullanıcı tipine göre yönlendir
    if (user.type === 'user') {
      console.log("Kullanıcı paneline yönlendiriliyor");
      window.location.href = 'user-panel.html';
    } else if (user.type === 'business') {
      console.log("İşletme paneline yönlendiriliyor");
      window.location.href = 'business-panel.html';
    }
  } else {
    console.error("Giriş başarısız: Kullanıcı bulunamadı");
    alert('Geçersiz e-posta veya şifre!');
  }
}

/**
 * Kullanıcı çıkışı
 */
function logout() {
  localStorage.removeItem('currentUser');
  window.location.href = 'index.html';
}

/**
 * Oturum açmış kullanıcıyı döndürür
 * @returns {Object|null} - Kullanıcı bilgileri veya null
 */
function getLoggedInUser() {
  const userData = localStorage.getItem('currentUser');
  return userData ? JSON.parse(userData) : null;
}

/**
 * Kullanıcı bilgilerine göre arayüzü günceller
 * @param {Object} user - Kullanıcı bilgileri
 */
function updateUI(user) {
  // Kullanıcı adı gösterimi
  const userNameElements = document.querySelectorAll('.user-name, .dropdown-toggle span');
  userNameElements.forEach(element => {
    if (user.type === 'user') {
      element.textContent = `${user.firstName} ${user.lastName}`;
    } else if (user.type === 'business') {
      element.textContent = user.businessName;
    }
  });
  
  // Kullanıcı tipine göre menü öğeleri
  const userTypeMenuItems = document.querySelectorAll('[data-user-type]');
  userTypeMenuItems.forEach(item => {
    const allowedTypes = item.getAttribute('data-user-type').split(',');
    if (allowedTypes.includes(user.type)) {
      item.style.display = 'block';
    } else {
      item.style.display = 'none';
    }
  });
}

/**
 * Mock veriyi hazırla - test için
 */
function setupMockData() {
  // Randevular
  localStorage.setItem('mockAppointments', JSON.stringify([
    {
      id: '1',
      userId: '1',
      businessId: '2',
      businessName: 'Lüks Oto Yıkama',
      businessLogo: 'images/business1.jpg',
      businessAddress: 'Kadıköy, İstanbul',
      date: '25.06.2023',
      time: '14:30',
      service: 'Detaylı İç Temizlik',
      duration: '45 dk',
      price: '350 ₺',
      status: 'confirmed',
      createdAt: '20.06.2023'
    },
    {
      id: '2',
      userId: '1',
      businessId: '3',
      businessName: 'Fast Oto Servis',
      businessLogo: 'images/business2.jpg',
      businessAddress: 'Ümraniye, İstanbul',
      date: '28.06.2023',
      time: '10:00',
      service: 'Yağ Değişimi',
      duration: '30 dk',
      price: '450 ₺',
      status: 'pending',
      createdAt: '22.06.2023'
    },
    {
      id: '3',
      userId: '1',
      businessId: '2',
      businessName: 'Lüks Oto Yıkama',
      businessLogo: 'images/business1.jpg',
      businessAddress: 'Kadıköy, İstanbul',
      date: '15.05.2023',
      time: '11:30',
      service: 'Dış Yıkama',
      duration: '30 dk',
      price: '150 ₺',
      status: 'completed',
      createdAt: '10.05.2023'
    },
    {
      id: '4',
      userId: '1',
      businessId: '3',
      businessName: 'Fast Oto Servis',
      businessLogo: 'images/business2.jpg',
      businessAddress: 'Ümraniye, İstanbul',
      date: '10.05.2023',
      time: '14:00',
      service: 'Motor Bakımı',
      duration: '60 dk',
      price: '750 ₺',
      status: 'completed',
      createdAt: '05.05.2023'
    }
  ]));

  // Kuponlar - Kullanıcı için
  localStorage.setItem('mockUserCoupons', JSON.stringify([
    {
      id: '1',
      userId: '1',
      businessId: '2',
      businessName: 'Lüks Oto Yıkama',
      code: 'SUMMER2023',
      description: 'Yaz Kampanyası',
      discount: '%20 İndirim',
      validUntil: '31.08.2023',
      status: 'active'
    },
    {
      id: '2',
      userId: '1',
      businessId: '3',
      businessName: 'Fast Oto Servis',
      code: 'WELCOME50',
      description: 'Hoş Geldin İndirimi',
      discount: '50 ₺ İndirim',
      validUntil: '15.07.2023',
      status: 'active'
    },
    {
      id: '3',
      userId: '1',
      businessId: '4',
      businessName: 'Detaylı Oto Bakım',
      code: 'FREEWASH',
      description: 'Ücretsiz Yıkama',
      discount: 'Ücretsiz Hizmet',
      validUntil: '10.07.2023',
      status: 'active'
    }
  ]));

  // Kuponlar - İşletme için
  localStorage.setItem('mockBusinessCoupons', JSON.stringify([
    {
      id: '1',
      businessId: '2',
      code: 'SUMMER2023',
      description: 'Yaz Kampanyası',
      type: 'percent',
      value: '20',
      validFrom: '01.06.2023',
      validUntil: '31.08.2023',
      status: 'active',
      usageCount: '12',
      usageLimit: '100'
    },
    {
      id: '2',
      businessId: '2',
      code: 'WELCOME50',
      description: 'Hoş Geldin İndirimi',
      type: 'fixed',
      value: '50',
      validFrom: '15.05.2023',
      validUntil: '15.07.2023',
      status: 'active',
      usageCount: '5',
      usageLimit: '50'
    },
    {
      id: '3',
      businessId: '2',
      code: 'FREEWASH',
      description: 'Ücretsiz Yıkama',
      type: 'free',
      value: '100',
      validFrom: '01.05.2023',
      validUntil: '31.05.2023',
      status: 'expired',
      usageCount: '8',
      usageLimit: '10'
    }
  ]));

  // Araçlar
  localStorage.setItem('mockVehicles', JSON.stringify([
    {
      id: '1',
      userId: '1',
      brand: 'Mercedes',
      model: 'C-Class',
      year: '2020',
      plate: '34 ABC 123',
      type: 'Sedan',
      color: 'Siyah'
    },
    {
      id: '2',
      userId: '1',
      brand: 'BMW',
      model: 'X5',
      year: '2019',
      plate: '34 XYZ 789',
      type: 'SUV',
      color: 'Beyaz'
    },
    {
      id: '3',
      userId: '1',
      brand: 'Audi',
      model: 'A3',
      year: '2021',
      plate: '34 DEF 456',
      type: 'Hatchback',
      color: 'Mavi'
    }
  ]));

  // Değerlendirmeler
  localStorage.setItem('mockReviews', JSON.stringify([
    {
      id: '1',
      userId: '1',
      businessId: '2',
      businessName: 'Lüks Oto Yıkama',
      businessLogo: 'images/business1.jpg',
      service: 'Detaylı İç Temizlik',
      date: '18.05.2023',
      rating: 5,
      comment: 'Çok memnun kaldım, araç içi tertemiz oldu. Emeklerinize sağlık.',
      response: ''
    },
    {
      id: '2',
      userId: '1',
      businessId: '3',
      businessName: 'Fast Oto Servis',
      businessLogo: 'images/business2.jpg',
      service: 'Yağ Değişimi',
      date: '10.05.2023',
      rating: 4,
      comment: 'Hızlı ve kaliteli hizmet. Sadece biraz daha özenli olabilirlerdi.',
      response: 'Değerlendirmeniz için teşekkür ederiz. Tekrar bekleriz.'
    }
  ]));

  // Hizmetler
  localStorage.setItem('mockServices', JSON.stringify([
    {
      id: '1',
      businessId: '2',
      name: 'Dış Yıkama',
      price: '150 ₺',
      description: 'Aracın dış yüzeyinin özel şampuanlar ile yıkanması, jant temizliği ve kurulama.',
      duration: '30 dakika',
      status: 'Aktif'
    },
    {
      id: '2',
      businessId: '2',
      name: 'İç Temizlik',
      price: '200 ₺',
      description: 'Araç içinin detaylı temizliği, koltuk yıkama, torpido ve konsol temizliği.',
      duration: '45 dakika',
      status: 'Aktif'
    },
    {
      id: '3',
      businessId: '2',
      name: 'Detaylı Bakım',
      price: '350 ₺',
      description: 'Araç içi ve dışının detaylı temizliği, pasta cila ve motor temizliği dahil.',
      duration: '90 dakika',
      status: 'Aktif'
    }
  ]));

  // İstatistikler
  localStorage.setItem('mockStatistics', JSON.stringify({
    appointments: {
      total: 135,
      completed: 105,
      cancelled: 12,
      conversionRate: 78
    },
    revenue: {
      total: 24560,
      currentMonth: 6820,
      previousMonth: 5450,
      growthRate: 25.1
    },
    customer: {
      averageRating: 4.8,
      totalReviews: 87,
      currentMonthReviews: 24,
      fiveStarRate: 82
    }
  }));
} 