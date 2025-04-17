/**
 * ArabamOn Admin Panel Fonksiyonları
 */

// API istekleri için temel fonksiyon
async function apiRequest(endpoint, method = 'GET', data = null) {
  // window.API_URL auth.js'de tanımlanıyor
  const url = `${window.API_URL || '/api'}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json'
  };
  
  // Eğer token varsa ekle
  const token = window.Auth?.TokenManager?.getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const options = {
    method,
    headers
  };
  
  if (data) {
    options.body = JSON.stringify(data);
  }
  
  try {
    const response = await fetch(url, options);
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Bir hata oluştu');
    }
    
    return result;
  } catch (error) {
    console.error('API İsteği Hatası:', error);
    throw error;
  }
}

// İstatistikler
function loadStatistics() {
  try {
    // Demo için sabit değerler
    const userCountElement = document.getElementById('user-count');
    const businessCountElement = document.getElementById('business-count');
    const reviewCountElement = document.getElementById('review-count');
    const appointmentCountElement = document.getElementById('appointment-count');
    
    if (userCountElement) userCountElement.textContent = '120';
    if (businessCountElement) businessCountElement.textContent = '24';
    if (reviewCountElement) reviewCountElement.textContent = '83';
    if (appointmentCountElement) appointmentCountElement.textContent = '156';
  } catch (error) {
    console.error('İstatistikler yüklenirken hata:', error);
    showNotification('İstatistikler yüklenirken hata oluştu', 'error');
  }
}

// Demo veriler - Gerçek uygulamada API'den gelecek
const demoBusinesses = [
        {
            id: 1,
    name: 'ABC Expertiz', 
    type: 'ekspertiz', 
    city: 'İstanbul', 
    district: 'Kadıköy', 
    address: 'Acıbadem Mah. 123 Sok. No:4',
    phone: '0216 123 45 67',
    email: 'info@abcexpertiz.com', 
    iban: 'TR12 3456 7890 1234 5678 90',
    status: 'active', 
    rating: 4.5,
    lat: 40.9923307,
    lng: 29.0243722,
    description: 'İstanbul\'un güvenilir expertiz merkezi',
    workingHours: {
      monday: { isOpen: true, open: '09:00', close: '18:00' },
      tuesday: { isOpen: true, open: '09:00', close: '18:00' },
      wednesday: { isOpen: true, open: '09:00', close: '18:00' },
      thursday: { isOpen: true, open: '09:00', close: '18:00' },
      friday: { isOpen: true, open: '09:00', close: '18:00' },
      saturday: { isOpen: true, open: '10:00', close: '16:00' },
      sunday: { isOpen: false, open: '10:00', close: '16:00' }
    }
        },
        {
            id: 2,
    name: 'XYZ Lastikçi', 
    type: 'lastikdegisim', 
    city: 'Ankara', 
    district: 'Çankaya', 
    address: 'Çankaya Cad. 45 Sok. No:12',
    phone: '0312 987 65 43',
    email: 'info@xyzlastik.com',
    iban: 'TR98 7654 3210 9876 5432 10',
    status: 'active', 
    rating: 4.2,
    lat: 39.9208372,
    lng: 32.8416474,
    description: 'Ankara\'nın en iyi lastik servisi',
    workingHours: {
      monday: { isOpen: true, open: '08:30', close: '18:30' },
      tuesday: { isOpen: true, open: '08:30', close: '18:30' },
      wednesday: { isOpen: true, open: '08:30', close: '18:30' },
      thursday: { isOpen: true, open: '08:30', close: '18:30' },
      friday: { isOpen: true, open: '08:30', close: '18:30' },
      saturday: { isOpen: true, open: '09:00', close: '17:00' },
      sunday: { isOpen: false, open: '10:00', close: '16:00' }
    }
        },
        {
            id: 3,
    name: 'Delta Otopark', 
            type: 'otopark',
    city: 'İzmir', 
    district: 'Karşıyaka', 
    address: 'Atatürk Bulvarı No:78',
    phone: '0232 345 67 89',
    email: 'info@deltaotopark.com',
    iban: 'TR45 6789 0123 4567 8901 23',
    status: 'pending', 
    rating: 3.8,
    lat: 38.4583698,
    lng: 27.2046173,
    description: 'İzmir\'in en güvenli otoparkı 7/24 açık',
    workingHours: {
      monday: { isOpen: true, open: '00:00', close: '23:59' },
      tuesday: { isOpen: true, open: '00:00', close: '23:59' },
      wednesday: { isOpen: true, open: '00:00', close: '23:59' },
      thursday: { isOpen: true, open: '00:00', close: '23:59' },
      friday: { isOpen: true, open: '00:00', close: '23:59' },
      saturday: { isOpen: true, open: '00:00', close: '23:59' },
      sunday: { isOpen: true, open: '00:00', close: '23:59' }
    }
        },
        {
            id: 4,
    name: 'Mega Araç Yıkama', 
    type: 'aracyikama', 
    city: 'İstanbul', 
    district: 'Beşiktaş', 
    address: 'Barbaros Bulvarı No:15',
    phone: '0212 789 01 23',
    email: 'info@megayikama.com',
    iban: 'TR10 9876 5432 1098 7654 32',
    status: 'active', 
    rating: 4.7,
    lat: 41.0430692,
    lng: 29.0080533,
    description: 'İçten dışa detaylı araç yıkama ve bakım hizmetleri',
    workingHours: {
      monday: { isOpen: true, open: '08:00', close: '20:00' },
      tuesday: { isOpen: true, open: '08:00', close: '20:00' },
      wednesday: { isOpen: true, open: '08:00', close: '20:00' },
      thursday: { isOpen: true, open: '08:00', close: '20:00' },
      friday: { isOpen: true, open: '08:00', close: '20:00' },
      saturday: { isOpen: true, open: '08:00', close: '20:00' },
      sunday: { isOpen: true, open: '09:00', close: '18:00' }
    }
  }
];

// İşletmeleri listele
function loadBusinesses() {
  try {
    const tableBody = document.querySelector('#businesses-table tbody');
    if (!tableBody) {
      console.error('İşletme tablosu bulunamadı');
        return;
    }

    tableBody.innerHTML = '';
    
    // Türkçe durum metinleri
    const statusTexts = {
      'active': 'Aktif',
      'pending': 'Beklemede', 
      'inactive': 'Pasif'
    };
    
    // Tür çevirileri
    const typeTranslations = {
      'ekspertiz': 'Expertiz',
      'lastikdegisim': 'Lastik Servisi',
            'otopark': 'Otopark',
      'aracyikama': 'Araç Yıkama'
        };
    
    demoBusinesses.forEach(business => {
      const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${business.id}</td>
            <td>${business.name}</td>
        <td>${typeTranslations[business.type] || business.type}</td>
        <td>${business.city}</td>
        <td>${business.district}</td>
        <td><span class="status ${business.status}">${statusTexts[business.status] || business.status}</span></td>
        <td>${business.rating}</td>
        <td>
          <button class="action-btn edit-business" data-id="${business.id}" title="Düzenle">
                    <i class="fas fa-edit"></i>
                </button>
          <button class="action-btn view-business" data-id="${business.id}" title="Görüntüle">
            <i class="fas fa-eye"></i>
          </button>
          <button class="action-btn delete-business" data-id="${business.id}" title="Sil">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Event listener'ları ekle
    addBusinessEventListeners();
    
  } catch (error) {
    console.error('İşletmeler yüklenirken hata:', error);
    showNotification('İşletmeler yüklenirken hata oluştu', 'error');
  }
}

// İşletme ile ilgili event listener'ları ekle
function addBusinessEventListeners() {
  // Düzenleme butonları
    const editButtons = document.querySelectorAll('.edit-business');
  if (editButtons.length > 0) {
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const businessId = this.getAttribute('data-id');
        const business = demoBusinesses.find(b => b.id == businessId);
        if (business) {
          openBusinessModal(business);
        }
        });
    });
  }
  
  // Görüntüleme butonları
  const viewButtons = document.querySelectorAll('.view-business');
  if (viewButtons.length > 0) {
    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            const businessId = this.getAttribute('data-id');
        viewBusiness(businessId);
        });
    });
}

  // Silme butonları
  const deleteButtons = document.querySelectorAll('.delete-business');
  if (deleteButtons.length > 0) {
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
        const businessId = this.getAttribute('data-id');
        deleteBusiness(businessId);
        });
    });
  }
}

// Fotoğraf önizleme fonksiyonu
function setupImagePreview() {
  const imageInput = document.getElementById('business-images');
  const previewContainer = document.getElementById('image-preview-container');
  
  if (!imageInput || !previewContainer) {
    return;
  }
  
  // Seçilen dosyalar değiştiğinde önizleme güncelleme
  imageInput.addEventListener('change', function() {
    // Önizleme alanını temizle
    previewContainer.innerHTML = '';
    
    // Maksimum 5 fotoğraf kontrolü
    if (this.files.length > 5) {
      showNotification('En fazla 5 fotoğraf yükleyebilirsiniz', 'error');
      this.value = '';
      return;
    }
    
    // Her dosya için önizleme oluştur
    for (let i = 0; i < this.files.length; i++) {
      const file = this.files[i];
      
      // Sadece resimleri kabul et
      if (!file.type.startsWith('image/')) {
        continue;
      }
      
      // 5MB sınırı
      if (file.size > 5 * 1024 * 1024) {
        showNotification('Dosya boyutu 5MB\'dan küçük olmalıdır', 'error');
        continue;
      }
      
      const reader = new FileReader();
      
      reader.onload = function(e) {
        const preview = document.createElement('div');
        preview.className = 'image-preview';
        preview.style.width = '100px';
        preview.style.height = '100px';
        preview.style.position = 'relative';
        preview.style.overflow = 'hidden';
        preview.style.borderRadius = '4px';
        
        const img = document.createElement('img');
        img.src = e.target.result;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        
        const removeBtn = document.createElement('button');
        removeBtn.innerHTML = '&times;';
        removeBtn.style.position = 'absolute';
        removeBtn.style.top = '5px';
        removeBtn.style.right = '5px';
        removeBtn.style.background = 'rgba(0, 0, 0, 0.5)';
        removeBtn.style.color = 'white';
        removeBtn.style.border = 'none';
        removeBtn.style.borderRadius = '50%';
        removeBtn.style.width = '20px';
        removeBtn.style.height = '20px';
        removeBtn.style.display = 'flex';
        removeBtn.style.alignItems = 'center';
        removeBtn.style.justifyContent = 'center';
        removeBtn.style.cursor = 'pointer';
        
        removeBtn.addEventListener('click', function(e) {
        e.preventDefault();
          preview.remove();
          
          // Input'ı sıfırla (çok sayıda dosya seçimini engellemek için)
          imageInput.value = '';
        });
        
        preview.appendChild(img);
        preview.appendChild(removeBtn);
        previewContainer.appendChild(preview);
      };
      
      reader.readAsDataURL(file);
    }
  });
}

// İşletme ekleme/düzenleme modalını aç
function openBusinessModal(business = null) {
  // Modal elementlerini seç
  const modal = document.getElementById('business-modal');
  if (!modal) {
    console.error('Business modal elementi bulunamadı');
        return;
    }

  const modalHeader = modal.querySelector('.modal-header span');
  if (modalHeader) {
    modalHeader.textContent = business ? 'İşletme Düzenle' : 'Yeni İşletme Ekle';
  }
  
  const form = document.getElementById('business-form');
  if (!form) {
    console.error('Business form elementi bulunamadı');
    return;
  }
  
  // Form sıfırlama
  form.reset();
  
  // Fotoğraf önizleme alanını temizle
  const previewContainer = document.getElementById('image-preview-container');
  if (previewContainer) {
    previewContainer.innerHTML = '';
  }
  
  // ID alanını ayarla
  const idField = document.getElementById('business-id');
  if (idField) {
    idField.value = business ? business.id : '';
  }
  
  // Eğer düzenleme ise mevcut işletme verilerini getir
  if (business) {
    // Basic fields
    setFieldValue('business-name', business.name);
    setFieldValue('business-type', business.type);
    setFieldValue('business-owner', business.ownerId);
    setFieldValue('business-tax-no', business.taxNo);
    setFieldValue('business-tax-office', business.taxOffice);
    setFieldValue('business-address', business.address);
    setFieldValue('business-city', business.city);
    setFieldValue('business-district', business.district);
    setFieldValue('business-phone', business.phone);
    setFieldValue('business-mobile', business.mobile);
    setFieldValue('business-email', business.email);
    setFieldValue('business-website', business.website);
    setFieldValue('business-iban', business.iban);
    setFieldValue('business-status', business.status);
    setFieldValue('business-description', business.description);
    setFieldValue('business-features', business.features);
    setFieldValue('business-lat', business.lat);
    setFieldValue('business-lng', business.lng);
    
    // Hizmetleri doldur
    if (business.services && business.services.length > 0) {
      const servicesTextarea = document.getElementById('business-services');
      if (servicesTextarea) {
        const servicesText = business.services.map(service => 
          `${service.name} - ${service.price} - ${service.duration}`
        ).join('\n');
        servicesTextarea.value = servicesText;
      }
    }
    
    // Harita marker pozisyonunu güncelle (eğer harita tanımlıysa)
    updateMapIfAvailable(business.lat, business.lng);
    
    // Çalışma saatlerini ayarla
    setupWorkingHours(business.workingHours);
  } else {
    // Harita varsayılan konuma dön (eğer harita tanımlıysa)
    updateMapIfAvailable(41.0082, 28.9784);
    
    // Çalışma saatlerini varsayılan değerlere ayarla
    setupDefaultWorkingHours();
  }
  
  // Modalı göster
  modal.style.display = 'flex';
}

function setFieldValue(id, value) {
  const field = document.getElementById(id);
  if (field && value !== undefined) {
    field.value = value;
  }
}

function updateMapIfAvailable(lat, lng) {
  // Harita tanımlıysa güncelle
  if (typeof window.map !== 'undefined' && typeof window.marker !== 'undefined') {
    const position = {lat: parseFloat(lat), lng: parseFloat(lng)};
    window.marker.setPosition(position);
    window.map.setCenter(position);
    window.map.setZoom(15);
        } else {
    console.log('Harita henüz yüklenmedi');
  }
}

// Çalışma saatlerini form üzerinde ayarla
function setupWorkingHours(workingHours) {
  if (!workingHours) return;
  
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  
  days.forEach(day => {
    const dayData = workingHours[day];
    if (dayData) {
      const isOpenCheckbox = document.getElementById(`${day}-status`);
      const openInput = document.getElementById(`${day}-open`);
      const closeInput = document.getElementById(`${day}-close`);
      
      if (isOpenCheckbox) {
        isOpenCheckbox.checked = dayData.isOpen;
      }
      
      if (openInput && dayData.open) {
        openInput.value = dayData.open;
        openInput.disabled = !dayData.isOpen;
      }
      
      if (closeInput && dayData.close) {
        closeInput.value = dayData.close;
        closeInput.disabled = !dayData.isOpen;
      }
    }
  });
}

// Varsayılan çalışma saatlerini ayarla
function setupDefaultWorkingHours() {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  
  days.forEach(day => {
    const isOpenCheckbox = document.getElementById(`${day}-status`);
    const openInput = document.getElementById(`${day}-open`);
    const closeInput = document.getElementById(`${day}-close`);
    
    if (isOpenCheckbox) {
      // Hafta içi varsayılan açık, pazar kapalı
      const isDefaultOpen = day !== 'sunday';
      isOpenCheckbox.checked = isDefaultOpen;
      
      if (openInput) {
        openInput.value = '09:00';
        openInput.disabled = !isDefaultOpen;
      }
      
      if (closeInput) {
        closeInput.value = day === 'saturday' ? '14:00' : '18:00';
        closeInput.disabled = !isDefaultOpen;
      }
    }
  });
}

// İşletme modalını kapat
function closeBusinessModal() {
  const modal = document.getElementById('business-modal');
  if (modal) {
    modal.style.display = 'none';
  }
}

// İşletme kaydet (ekleme/güncelleme)
function saveBusiness(event) {
  event.preventDefault();
  
  try {
    // Form verilerini al
    const businessId = document.getElementById('business-id')?.value || '';
    
    // Çalışma saatlerini al
    const workingHours = getWorkingHoursFromForm();
    
    // Fotoğraf verileri (gerçekte API'ye dosya olarak gönderilir, burada demo)
    const imageInput = document.getElementById('business-images');
    let imageCount = 0;
    if (imageInput && imageInput.files) {
      imageCount = imageInput.files.length;
    }
    
    // Hizmetleri parse et
    const servicesText = document.getElementById('business-services')?.value || '';
    let services = [];
    
    if (servicesText.trim()) {
      services = servicesText.split('\n').map(line => {
        const parts = line.split('-').map(p => p.trim());
        if (parts.length >= 3) {
          return {
            name: parts[0],
            price: parseFloat(parts[1]) || 0,
            duration: parseInt(parts[2]) || 0
          };
        }
        return null;
      }).filter(service => service !== null);
    }
    
    // Özellikleri parse et
    const featuresText = document.getElementById('business-features')?.value || '';
    let features = [];
    
    if (featuresText.trim()) {
      features = featuresText.split(',').map(f => f.trim()).filter(f => f);
    }
    
    // Form verilerini topla
    const formData = {
      name: document.getElementById('business-name')?.value || '',
      type: document.getElementById('business-type')?.value || '',
      ownerId: document.getElementById('business-owner')?.value || null,
      taxNo: document.getElementById('business-tax-no')?.value || '',
      taxOffice: document.getElementById('business-tax-office')?.value || '',
      address: document.getElementById('business-address')?.value || '',
      city: document.getElementById('business-city')?.value || '',
      district: document.getElementById('business-district')?.value || '',
      phone: document.getElementById('business-phone')?.value || '',
      mobile: document.getElementById('business-mobile')?.value || '',
      email: document.getElementById('business-email')?.value || '',
      website: document.getElementById('business-website')?.value || '',
      iban: document.getElementById('business-iban')?.value || '',
      status: document.getElementById('business-status')?.value || 'pending',
      description: document.getElementById('business-description')?.value || '',
      lat: document.getElementById('business-lat')?.value || null,
      lng: document.getElementById('business-lng')?.value || null,
      images: imageCount > 0 ? Array(imageCount).fill().map((_, i) => `/images/demo/business-${i+1}.jpg`) : [],
      services: services,
      features: features,
      workingHours
    };
    
    // Form doğrulama
    if (!formData.name || !formData.type || !formData.address || !formData.city || !formData.district) {
      showNotification('Lütfen zorunlu alanları doldurun', 'error');
      return;
    }
    
    if (businessId) {
      // Düzenleme işlemi
      const index = demoBusinesses.findIndex(b => b.id == businessId);
      if (index !== -1) {
        // Demo veriyi güncelle
        demoBusinesses[index] = { ...demoBusinesses[index], ...formData, id: parseInt(businessId) };
        showNotification(`"${formData.name}" işletmesi başarıyla güncellendi`, 'success');
      }
    } else {
      // Yeni ekleme
      const newId = demoBusinesses.length > 0 ? Math.max(...demoBusinesses.map(b => b.id)) + 1 : 1;
      demoBusinesses.push({ 
        ...formData, 
        id: newId, 
        rating: 0,
        reviewCount: 0,
        status: formData.status || 'pending'
      });
      showNotification(`"${formData.name}" işletmesi başarıyla eklendi`, 'success');
    }
    
    // Modalı kapat ve işletmeleri yeniden yükle
    closeBusinessModal();
    loadBusinesses();
    
  } catch (error) {
    console.error('İşletme kaydedilirken hata:', error);
    showNotification('İşletme kaydedilirken hata oluştu: ' + error.message, 'error');
  }
}

// Form üzerindeki çalışma saatlerini al
function getWorkingHoursFromForm() {
  const workingHours = {};
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  
  days.forEach(day => {
    const isOpenCheckbox = document.getElementById(`${day}-status`);
    const openInput = document.getElementById(`${day}-open`);
    const closeInput = document.getElementById(`${day}-close`);
    
    if (isOpenCheckbox) {
      const isOpen = isOpenCheckbox.checked;
      
      workingHours[day] = {
        isOpen,
        open: isOpen && openInput ? openInput.value : null,
        close: isOpen && closeInput ? closeInput.value : null
      };
    }
  });
  
  return workingHours;
}

// İşletme görüntüle
function viewBusiness(businessId) {
  const business = demoBusinesses.find(b => b.id == businessId);
  if (business) {
    const typeTranslations = {
      'ekspertiz': 'Expertiz',
      'lastikdegisim': 'Lastik Servisi',
      'otopark': 'Otopark',
      'aracyikama': 'Araç Yıkama'
    };
    
    showNotification(`${business.name} (${typeTranslations[business.type] || business.type}) detayları görüntüleniyor`, 'info');
  } else {
    showNotification(`ID: ${businessId} işletme bulunamadı`, 'error');
  }
}

// İşletme sil
function deleteBusiness(businessId) {
  const business = demoBusinesses.find(b => b.id == businessId);
  
  if (!business) {
    showNotification('İşletme bulunamadı', 'error');
    return;
  }
  
  if (confirm(`"${business.name}" işletmesini silmek istediğinize emin misiniz?`)) {
    // Demo verilerde silme
    const index = demoBusinesses.findIndex(b => b.id == businessId);
    if (index !== -1) {
      demoBusinesses.splice(index, 1);
    }
    
    showNotification(`"${business.name}" işletmesi başarıyla silindi`, 'success');
    loadBusinesses();
  }
}

// Bildirim göster
function showNotification(message, type = 'info') {
  let notificationArea = document.getElementById('notification-area');
  if (!notificationArea) {
    notificationArea = document.createElement('div');
    notificationArea.id = 'notification-area';
    notificationArea.style.position = 'fixed';
    notificationArea.style.top = '20px';
    notificationArea.style.right = '20px';
    notificationArea.style.zIndex = '9999';
    notificationArea.style.width = '300px';
    document.body.appendChild(notificationArea);
  }
  
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  
  notificationArea.appendChild(notification);
  
  // 5 saniye sonra bildirim kaybolsun
  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove();
    }
  }, 5000);
}

// Harita başlatma fonksiyonu (Google Maps API tarafından çağrılacak)
window.initMap = function() {
  try {
    // İstanbul'un koordinatları
    const istanbul = { lat: 41.0082, lng: 28.9784 };
    
    // Map elementi
    const mapElement = document.getElementById("map");
    if (!mapElement) {
      console.log('Harita elementi bulunamadı');
      return;
    }
    
    // Harita oluştur
    window.map = new google.maps.Map(mapElement, {
      center: istanbul,
      zoom: 12,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });
    
    // Başlangıç işaretleyicisi
    window.marker = new google.maps.Marker({
      position: istanbul,
      map: window.map,
      draggable: true,
      title: "İşletme Konumu"
    });
    
    // İşaretleyici sürüklendiğinde koordinatları güncelle
    window.marker.addListener("dragend", function() {
      const position = window.marker.getPosition();
      const latInput = document.getElementById("business-lat");
      const lngInput = document.getElementById("business-lng");
      
      if (latInput) latInput.value = position.lat();
      if (lngInput) lngInput.value = position.lng();
    });
    
    // Haritaya tıklandığında işaretleyiciyi hareket ettir
    window.map.addListener("click", function(e) {
      window.marker.setPosition(e.latLng);
      
      const latInput = document.getElementById("business-lat");
      const lngInput = document.getElementById("business-lng");
      
      if (latInput) latInput.value = e.latLng.lat();
      if (lngInput) lngInput.value = e.latLng.lng();
    });
    
    // Arama kutusu için otomatik tamamlama
    const input = document.getElementById("map-search");
    if (input) {
      const autocomplete = new google.maps.places.Autocomplete(input);
      autocomplete.bindTo("bounds", window.map);
      
      // Yer seçildiğinde işaretleyiciyi güncelle
      autocomplete.addListener("place_changed", function() {
        const place = autocomplete.getPlace();
        
        if (!place.geometry) {
          window.alert("Seçilen konum bulunamadı!");
          return;
        }
        
        // Haritayı konuma göre güncelle
        if (place.geometry.viewport) {
          window.map.fitBounds(place.geometry.viewport);
        } else {
          window.map.setCenter(place.geometry.location);
          window.map.setZoom(17);
        }
        
        // İşaretleyiciyi güncelle
        window.marker.setPosition(place.geometry.location);
        
        // Koordinat alanlarını güncelle
        const latInput = document.getElementById("business-lat");
        const lngInput = document.getElementById("business-lng");
        
        if (latInput) latInput.value = place.geometry.location.lat();
        if (lngInput) lngInput.value = place.geometry.location.lng();
      });
    }
    
    console.log('Harita başarıyla yüklendi');
  } catch (error) {
    console.error('Harita yüklenirken hata:', error);
  }
};

// Harita yüklenmezse fallback
window.gm_authFailure = function() {
  // Harita hata bilgisi
  const mapContainer = document.getElementById('map-container');
  if (mapContainer) {
    mapContainer.innerHTML = `
      <div style="height:100%; display:flex; align-items:center; justify-content:center; text-align:center; padding:20px; background:#f8f9fa;">
        <div>
          <p style="color:#721c24; margin-bottom:10px;">Harita yüklenemedi. Lütfen konum bilgilerini manuel olarak girin.</p>
          <p style="color:#666; font-size:0.9em;">Enlem ve boylam değerlerini doğrudan alanlara yazabilirsiniz.</p>
        </div>
      </div>
    `;
  }
};

// Demo kupon verileri
const demoCoupons = [
        {
            id: 1,
    code: "ARABAMON20",
    type: "percent",
    value: 20,
    category: "aracyikama",
    description: "Araç yıkama hizmetlerinde %20 indirim",
    validUntil: "2023-12-31",
    usageLimit: 100,
    usageCount: 12,
            isActive: true
        },
        {
            id: 2,
    code: "LASTIK50",
    type: "fixed",
    value: 50,
    category: "lastikdegisim",
    description: "Lastik değişiminde 50 TL indirim",
    validUntil: "2023-07-15", 
    usageLimit: 50,
    usageCount: 8,
            isActive: true
        },
        {
            id: 3,
    code: "EKSPERTIZ25",
    type: "percent",
    value: 25,
    category: "ekspertiz",
    description: "Ekspertiz hizmetlerinde %25 indirim",
    validUntil: "2023-09-30",
    usageLimit: 30,
    usageCount: 5,
            isActive: true
        }
    ];
    
// Kuponları yükle
function loadCoupons() {
  try {
    const tableBody = document.querySelector('#coupons-table tbody');
    if (!tableBody) {
      console.error('Kupon tablosu bulunamadı');
      return;
    }
    
    tableBody.innerHTML = '';
    
    demoCoupons.forEach(coupon => {
      const validUntil = new Date(coupon.validUntil).toLocaleDateString('tr-TR');
        const row = document.createElement('tr');
        
        row.innerHTML = `
        <td>${coupon.id}</td>
        <td><span class="coupon-code">${coupon.code}</span></td>
        <td>${coupon.type === 'percent' ? `%${coupon.value}` : `${coupon.value} TL`}</td>
        <td>${getCategoryName(coupon.category)}</td>
        <td>${coupon.description}</td>
        <td>${validUntil}</td>
        <td><span class="status ${coupon.isActive ? 'active' : 'inactive'}">${coupon.isActive ? 'Aktif' : 'Pasif'}</span></td>
        <td>${coupon.usageCount} / ${coupon.usageLimit}</td>
        <td>
          <button class="action-btn edit-coupon" data-id="${coupon.id}" title="Düzenle">
                    <i class="fas fa-edit"></i>
                </button>
          <button class="action-btn delete-coupon" data-id="${coupon.id}" title="Sil">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Event listener'ları ekle
    addCouponEventListeners();
    
  } catch (error) {
    console.error('Kuponlar yüklenirken hata:', error);
    showNotification('Kuponlar yüklenirken hata oluştu', 'error');
  }
}

// Kupon kategori ismini al
function getCategoryName(category) {
  const categories = {
    'ekspertiz': 'Expertiz',
    'lastikdegisim': 'Lastik Servisi',
    'otopark': 'Otopark',
    'aracyikama': 'Araç Yıkama',
    'tamirservis': 'Tamir & Servis',
    'kaporta': 'Kaporta & Boya',
    'rentacar': 'Araç Kiralama'
  };
  
  return categories[category] || category;
}

// Kupon event listener'ları
function addCouponEventListeners() {
  // Düzenleme butonları
  const editButtons = document.querySelectorAll('.edit-coupon');
  if (editButtons.length > 0) {
    editButtons.forEach(button => {
      button.addEventListener('click', function() {
        const couponId = this.getAttribute('data-id');
        const coupon = demoCoupons.find(c => c.id == couponId);
        if (coupon) {
          openCouponModal(coupon);
        }
        });
    });
  }
    
  // Silme butonları
  const deleteButtons = document.querySelectorAll('.delete-coupon');
  if (deleteButtons.length > 0) {
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
        const couponId = this.getAttribute('data-id');
        deleteCoupon(couponId);
      });
    });
  }
}

// Rastgele kupon kodu oluştur
function generateCouponCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  const prefix = document.getElementById('coupon-code-prefix')?.value || 'ARABAMON';
  
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return prefix + result;
}

// Kupon ekleme/düzenleme modalını aç
function openCouponModal(coupon = null) {
  // Modal elementlerini seç
  const modal = document.getElementById('coupon-modal');
  if (!modal) {
    console.error('Kupon modal elementi bulunamadı');
    return;
  }
  
  const modalHeader = modal.querySelector('.modal-header span');
  if (modalHeader) {
    modalHeader.textContent = coupon ? 'Kupon Düzenle' : 'Yeni Kupon Oluştur';
  }
  
  const form = document.getElementById('coupon-form');
  if (!form) {
    console.error('Kupon form elementi bulunamadı');
    return;
  }
  
  // Form sıfırlama
  form.reset();
  
  // ID alanını ayarla
  const idField = document.getElementById('coupon-id');
  if (idField) {
    idField.value = coupon ? coupon.id : '';
  }
  
  // Eğer düzenleme ise mevcut kupon verilerini getir
  if (coupon) {
    // Form alanlarını doldur
    setFieldValue('coupon-code', coupon.code);
    setFieldValue('coupon-type', coupon.type);
    setFieldValue('coupon-value', coupon.value);
    setFieldValue('coupon-category', coupon.category);
    setFieldValue('coupon-description', coupon.description);
    setFieldValue('coupon-valid-until', coupon.validUntil);
    setFieldValue('coupon-usage-limit', coupon.usageLimit);
    setFieldValue('coupon-is-active', coupon.isActive);
  } else {
    // Yeni kupon için varsayılan değerler
    const randomCode = generateCouponCode();
    setFieldValue('coupon-code', randomCode);
    
    // Bir ay sonrası için varsayılan geçerlilik tarihi
    const defaultDate = new Date();
    defaultDate.setMonth(defaultDate.getMonth() + 1);
    const dateStr = defaultDate.toISOString().split('T')[0];
    setFieldValue('coupon-valid-until', dateStr);
    
    // Varsayılan kullanım limiti
    setFieldValue('coupon-usage-limit', 100);
    
    // Varsayılan aktif
    setFieldValue('coupon-is-active', true);
  }
  
  // Modalı göster
  modal.style.display = 'flex';
}

// Kupon sil
function deleteCoupon(couponId) {
  const coupon = demoCoupons.find(c => c.id == couponId);
  
  if (!coupon) {
    showNotification('Kupon bulunamadı', 'error');
    return;
  }
  
  if (confirm(`"${coupon.code}" kodlu kuponu silmek istediğinize emin misiniz?`)) {
    // Demo verilerde silme
    const index = demoCoupons.findIndex(c => c.id == couponId);
    if (index !== -1) {
      demoCoupons.splice(index, 1);
    }
    
    showNotification(`"${coupon.code}" kupon başarıyla silindi`, 'success');
    loadCoupons();
  }
}

// Kupon kaydet (ekleme/güncelleme)
function saveCoupon(event) {
  event.preventDefault();
  
  try {
    // Form verilerini al
    const couponId = document.getElementById('coupon-id')?.value || '';
    
    // Form verilerini topla
    const formData = {
      code: document.getElementById('coupon-code')?.value || '',
      type: document.getElementById('coupon-type')?.value || 'percent',
      value: parseFloat(document.getElementById('coupon-value')?.value) || 0,
      category: document.getElementById('coupon-category')?.value || '',
      description: document.getElementById('coupon-description')?.value || '',
      validUntil: document.getElementById('coupon-valid-until')?.value || '',
      usageLimit: parseInt(document.getElementById('coupon-usage-limit')?.value) || 0,
      isActive: document.getElementById('coupon-is-active')?.checked || false
    };
    
    // Form doğrulama
    if (!formData.code || !formData.type || !formData.value || !formData.category || !formData.validUntil) {
      showNotification('Lütfen zorunlu alanları doldurun', 'error');
      return;
    }
    
    if (couponId) {
      // Düzenleme işlemi
      const index = demoCoupons.findIndex(c => c.id == couponId);
      if (index !== -1) {
        // Mevcut kullanım sayısını koru
        const usageCount = demoCoupons[index].usageCount;
        // Demo veriyi güncelle
        demoCoupons[index] = { ...formData, id: parseInt(couponId), usageCount };
        showNotification(`"${formData.code}" kuponu başarıyla güncellendi`, 'success');
      }
    } else {
      // Yeni ekleme
      const newId = demoCoupons.length > 0 ? Math.max(...demoCoupons.map(c => c.id)) + 1 : 1;
      demoCoupons.push({
        ...formData,
        id: newId, 
        usageCount: 0
      });
      showNotification(`"${formData.code}" kuponu başarıyla oluşturuldu`, 'success');
    }
    
    // Modalı kapat ve kuponları yeniden yükle
    closeCouponModal();
    loadCoupons();
    
  } catch (error) {
    console.error('Kupon kaydedilirken hata:', error);
    showNotification('Kupon kaydedilirken hata oluştu: ' + error.message, 'error');
  }
}

// Kupon modalını kapat
function closeCouponModal() {
  const modal = document.getElementById('coupon-modal');
  if (modal) {
    modal.style.display = 'none';
  }
}

// Rastgele kupon kodu oluştur butonu
function setupGenerateCodeButton() {
  const generateBtn = document.getElementById('generate-code-btn');
  if (generateBtn) {
    generateBtn.addEventListener('click', function() {
      const codeInput = document.getElementById('coupon-code');
      if (codeInput) {
        codeInput.value = generateCouponCode();
      }
    });
  }
}

// Demo kullanıcı verileri
const demoUsers = [
        {
            id: 1,
            name: 'Admin Kullanıcı',
            email: 'admin@arabamon.com',
    phone: '0555 111 22 33',
            role: 'admin',
    status: 'active'
        },
        {
            id: 2,
            name: 'İşletme Sahibi',
            email: 'business@arabamon.com',
    phone: '0555 222 33 44',
            role: 'business',
    status: 'active'
        },
        {
            id: 3,
            name: 'Normal Kullanıcı',
            email: 'user@arabamon.com',
    phone: '0555 333 44 55',
            role: 'user',
    status: 'active'
  }
];

// Kullanıcıları listele
function loadUsers() {
  try {
    const tableBody = document.querySelector('#users-table tbody');
    if (!tableBody) {
      console.error('Kullanıcı tablosu bulunamadı');
      return;
    }
    
    tableBody.innerHTML = '';
    
    // Türkçe durum ve rol metinleri
    const statusTexts = {
      'active': 'Aktif',
      'inactive': 'Pasif',
      'pending': 'Beklemede'
    };
    
    const roleTexts = {
      'admin': 'Yönetici',
            'business': 'İşletme',
            'user': 'Kullanıcı'
        };
    
    demoUsers.forEach(user => {
      const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
        <td>${user.phone || ''}</td>
        <td>${roleTexts[user.role] || user.role}</td>
        <td><span class="status ${user.status}">${statusTexts[user.status] || user.status}</span></td>
        <td>
          <button class="action-btn edit-user" data-id="${user.id}" title="Düzenle">
                    <i class="fas fa-edit"></i>
                </button>
          <button class="action-btn delete-user" data-id="${user.id}" title="Sil">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Event listener'ları ekle
    addUserEventListeners();
    
  } catch (error) {
    console.error('Kullanıcılar yüklenirken hata:', error);
    showNotification('Kullanıcılar yüklenirken hata oluştu', 'error');
  }
}

// Kullanıcı ile ilgili event listener'ları ekle
function addUserEventListeners() {
  // Düzenleme butonları
    const editButtons = document.querySelectorAll('.edit-user');
  if (editButtons.length > 0) {
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const userId = this.getAttribute('data-id');
        const user = demoUsers.find(u => u.id == userId);
        if (user) {
          openUserModal(user);
        }
        });
    });
  }
    
  // Silme butonları
    const deleteButtons = document.querySelectorAll('.delete-user');
  if (deleteButtons.length > 0) {
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const userId = this.getAttribute('data-id');
        deleteUser(userId);
        });
    });
  }
}

// Kullanıcı ekleme/düzenleme modalını aç
function openUserModal(user = null) {
  // Modal elementlerini seç
  const modal = document.getElementById('user-modal');
  if (!modal) {
    console.error('Kullanıcı modal elementi bulunamadı');
    return;
  }
  
  const modalTitle = modal.querySelector('.modal-title');
  if (modalTitle) {
    modalTitle.textContent = user ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı Ekle';
  }
  
  const form = document.getElementById('user-form');
  if (!form) {
    console.error('Kullanıcı form elementi bulunamadı');
    return;
  }
  
  // Form sıfırlama
  form.reset();
  
  // ID alanını ayarla
  const idField = document.getElementById('user-id');
  if (idField) {
    idField.value = user ? user.id : '';
  }
  
  // Eğer düzenleme ise mevcut kullanıcı verilerini getir
  if (user) {
    setFieldValue('user-name', user.name);
    setFieldValue('user-email', user.email);
    setFieldValue('user-phone', user.phone);
    setFieldValue('user-role', user.role);
  }
  
  // Modalı göster
  modal.style.display = 'flex';
}

// Kullanıcı sil
function deleteUser(userId) {
  const user = demoUsers.find(u => u.id == userId);
  
  if (!user) {
    showNotification('Kullanıcı bulunamadı', 'error');
    return;
  }
  
  if (confirm(`"${user.name}" kullanıcısını silmek istediğinize emin misiniz?`)) {
    // Demo verilerde silme
    const index = demoUsers.findIndex(u => u.id == userId);
    if (index !== -1) {
      demoUsers.splice(index, 1);
    }
    
    showNotification(`"${user.name}" kullanıcısı başarıyla silindi`, 'success');
    loadUsers();
  }
}

// Kullanıcı kaydet (ekleme/güncelleme)
function saveUser(event) {
  event.preventDefault();
  
  try {
    // Form verilerini al
    const userId = document.getElementById('user-id')?.value || '';
    
    // Form verilerini topla
    const formData = {
      name: document.getElementById('user-name')?.value || '',
      email: document.getElementById('user-email')?.value || '',
      password: document.getElementById('user-password')?.value || '',
      phone: document.getElementById('user-phone')?.value || '',
      role: document.getElementById('user-role')?.value || 'user',
      status: 'active'
    };
    
    // Form doğrulama
    if (!formData.name || !formData.email || !formData.role) {
      showNotification('Lütfen zorunlu alanları doldurun', 'error');
      return;
    }
    
    // Email formatı doğrulama
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showNotification('Geçerli bir e-posta adresi giriniz', 'error');
      return;
    }
    
    if (userId) {
      // Düzenleme işlemi
      const index = demoUsers.findIndex(u => u.id == userId);
      if (index !== -1) {
        // Eğer şifre girilmemişse mevcut şifreyi koru
        if (!formData.password) {
          delete formData.password;
        }
        
        // Demo veriyi güncelle
        demoUsers[index] = { ...demoUsers[index], ...formData, id: parseInt(userId) };
        showNotification(`"${formData.name}" kullanıcısı başarıyla güncellendi`, 'success');
      }
    } else {
      // Yeni ekleme
      // Şifre zorunluluğu kontrolü
      if (!formData.password) {
        showNotification('Lütfen şifre giriniz', 'error');
        return;
    }

      const newId = demoUsers.length > 0 ? Math.max(...demoUsers.map(u => u.id)) + 1 : 1;
      demoUsers.push({ 
        ...formData, 
        id: newId, 
        status: 'active'
      });
      showNotification(`"${formData.name}" kullanıcısı başarıyla eklendi`, 'success');
    }
    
    // Modalı kapat ve kullanıcıları yeniden yükle
    closeUserModal();
    loadUsers();
    
  } catch (error) {
    console.error('Kullanıcı kaydedilirken hata:', error);
    showNotification('Kullanıcı kaydedilirken hata oluştu: ' + error.message, 'error');
  }
}

// Kullanıcı modalını kapat
function closeUserModal() {
  const modal = document.getElementById('user-modal');
  if (modal) {
    modal.style.display = 'none';
  }
}

// Randevuları yükleme fonksiyonu
async function loadAppointments() {
    try {
        // Gerçek API çağrısı yerine localStorage'dan okuyoruz (demo için)
        const appointments = JSON.parse(localStorage.getItem('appointments')) || [];
        
        const appointmentsTableBody = document.querySelector('#appointments-table tbody');
        if (!appointmentsTableBody) return;
        
        appointmentsTableBody.innerHTML = '';
        
        if (appointments.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = `<td colspan="8" class="text-center">Henüz randevu bulunmuyor.</td>`;
            appointmentsTableBody.appendChild(emptyRow);
            return;
        }
        
        // Randevuları tarihe göre sırala (en yakın tarih en üstte)
        appointments.sort((a, b) => {
            const dateA = new Date(`${a.date} ${a.time}`);
            const dateB = new Date(`${b.date} ${b.time}`);
            return dateA - dateB;
        });
        
        // Admin bildirimlerini kontrol et
        checkAdminNotifications(appointments);
        
        appointments.forEach(appointment => {
            const row = document.createElement('tr');
            
            // Durum rengini belirle
            const statusClass = {
                'pending': 'text-warning',
                'confirmed': 'text-success',
                'completed': 'text-primary',
                'cancelled': 'text-danger'
            }[appointment.status] || '';
            
            // Durum metnini belirle
            const statusText = {
                'pending': 'Beklemede',
                'confirmed': 'Onaylandı',
                'completed': 'Tamamlandı',
                'cancelled': 'İptal Edildi'
            }[appointment.status] || appointment.status;
            
            // Tarihi formatla
            const formattedDate = formatDate(appointment.date);
            
            row.innerHTML = `
                <td>${appointment.id}</td>
                <td>${appointment.businessName}</td>
                <td>${appointment.userName}</td>
                <td>${appointment.serviceName}</td>
                <td>${formattedDate} ${appointment.time}</td>
                <td><span class="${statusClass}">${statusText}</span></td>
                <td>${formatDate(appointment.createdAt.split('T')[0])}</td>
                <td>
                    <button class="btn btn-sm btn-primary view-appointment" data-id="${appointment.id}">Detaylar</button>
                    ${appointment.status === 'pending' ? `
                        <button class="btn btn-sm btn-success approve-appointment" data-id="${appointment.id}">Onayla</button>
                        <button class="btn btn-sm btn-danger reject-appointment" data-id="${appointment.id}">Reddet</button>
                    ` : ''}
                </td>
            `;
            
            appointmentsTableBody.appendChild(row);
        });
        
        // Randevu detay butonlarını etkinleştir
        document.querySelectorAll('.view-appointment').forEach(button => {
            button.addEventListener('click', () => {
                const appointmentId = parseInt(button.getAttribute('data-id'));
                viewAppointmentDetails(appointmentId);
        });
    });
    
        // Randevu onaylama butonlarını etkinleştir
        document.querySelectorAll('.approve-appointment').forEach(button => {
            button.addEventListener('click', () => {
                const appointmentId = parseInt(button.getAttribute('data-id'));
                approveAppointment(appointmentId);
            });
        });
        
        // Randevu reddetme butonlarını etkinleştir
        document.querySelectorAll('.reject-appointment').forEach(button => {
            button.addEventListener('click', () => {
                const appointmentId = parseInt(button.getAttribute('data-id'));
                rejectAppointment(appointmentId);
            });
        });
        
    } catch (error) {
        console.error('Randevular yüklenirken hata oluştu', error);
        showNotification('Randevular yüklenemedi', 'error');
    }
}

// Randevu detaylarını görüntüle
function viewAppointmentDetails(appointmentId) {
    const appointments = JSON.parse(localStorage.getItem('appointments')) || [];
    const appointment = appointments.find(a => a.id === appointmentId);
    
    if (!appointment) {
        showNotification('Randevu bulunamadı', 'error');
        return;
    }
    
    // TC Kimlik numarası maskele
    const maskedTcNo = appointment.tcNo ? 
        appointment.tcNo.substring(0, 3) + '*****' + appointment.tcNo.substring(8) : 
        '-';
    
    alert(`
        Randevu Detayları (#${appointment.id})
        
        İşletme: ${appointment.businessName}
        Hizmet: ${appointment.serviceName}
        
        Müşteri: ${appointment.userName}
        E-posta: ${appointment.userEmail}
        T.C. Kimlik: ${maskedTcNo}
        
        Araç: ${appointment.vehicleModel} (${appointment.vehiclePlate})
        
        Tarih/Saat: ${formatDate(appointment.date)} ${appointment.time}
        Durum: ${getStatusText(appointment.status)}
        
        Notlar: ${appointment.notes || '-'}
        
        Oluşturulma: ${formatDateTime(appointment.createdAt)}
        ${appointment.confirmedAt ? `Onaylanma: ${formatDateTime(appointment.confirmedAt)}` : ''}
        ${appointment.completedAt ? `Tamamlanma: ${formatDateTime(appointment.completedAt)}` : ''}
        ${appointment.cancelledAt ? `İptal: ${formatDateTime(appointment.cancelledAt)}` : ''}
        ${appointment.cancellationReason ? `İptal Sebebi: ${appointment.cancellationReason}` : ''}
    `);
}

// Randevu onayla
function approveAppointment(appointmentId) {
    let appointments = JSON.parse(localStorage.getItem('appointments')) || [];
    const appointmentIndex = appointments.findIndex(a => a.id === appointmentId);
    
    if (appointmentIndex === -1) {
        showNotification('Randevu bulunamadı', 'error');
        return;
    }
    
    // Durum güncelle
    appointments[appointmentIndex].status = 'confirmed';
    appointments[appointmentIndex].confirmedAt = new Date().toISOString();
    appointments[appointmentIndex].confirmedBy = 'admin';
    
    // localStorage'a kaydet
    localStorage.setItem('appointments', JSON.stringify(appointments));
    
    // İşletmeye bildirim gönder
    sendNotificationToBusiness(appointments[appointmentIndex]);
    
    showNotification('Randevu başarıyla onaylandı', 'success');
    
    // Randevuları yeniden yükle
    loadAppointments();
}

// Randevu reddet
function rejectAppointment(appointmentId) {
    const reason = prompt('Randevu reddetme sebebi:');
    if (reason === null) return; // İptal edildi
    
    let appointments = JSON.parse(localStorage.getItem('appointments')) || [];
    const appointmentIndex = appointments.findIndex(a => a.id === appointmentId);
    
    if (appointmentIndex === -1) {
        showNotification('Randevu bulunamadı', 'error');
        return;
    }
    
    // Durum güncelle
    appointments[appointmentIndex].status = 'cancelled';
    appointments[appointmentIndex].cancelledAt = new Date().toISOString();
    appointments[appointmentIndex].cancellationReason = reason || 'Admin tarafından reddedildi';
    appointments[appointmentIndex].cancelledBy = 'admin';
    
    // localStorage'a kaydet
    localStorage.setItem('appointments', JSON.stringify(appointments));
    
    // İşletmeye ve kullanıcıya bildirim gönder
    sendCancellationNotification(appointments[appointmentIndex]);
    
    showNotification('Randevu başarıyla reddedildi', 'success');
    
    // Randevuları yeniden yükle
    loadAppointments();
}

// İşletmeye bildirim gönder (demo)
function sendNotificationToBusiness(appointment) {
    // İşletmeye giden bildirimler için localStorage'a kaydet
    let businessNotifications = JSON.parse(localStorage.getItem(`business_notifications_${appointment.businessId}`)) || [];
    
    const businessNotification = {
        id: Date.now(),
        type: 'admin_approved',
        title: 'Randevu Onaylandı',
        message: `Admin tarafından ${appointment.userName} adlı müşterinin ${appointment.date} tarihindeki randevusu onaylandı.`,
        appointment: appointment,
        isRead: false,
        createdAt: new Date().toISOString()
    };
    
    businessNotifications.push(businessNotification);
    localStorage.setItem(`business_notifications_${appointment.businessId}`, JSON.stringify(businessNotifications));
    
    console.log('İşletmeye bildirim gönderildi:', businessNotification);
}

// İptal bildirimi gönder (demo)
function sendCancellationNotification(appointment) {
    // İşletmeye bildirim
    let businessNotifications = JSON.parse(localStorage.getItem(`business_notifications_${appointment.businessId}`)) || [];
    
    const businessNotification = {
        id: Date.now(),
        type: 'admin_cancelled',
        title: 'Randevu İptal Edildi',
        message: `Admin tarafından ${appointment.userName} adlı müşterinin ${appointment.date} tarihindeki randevusu iptal edildi. Sebep: ${appointment.cancellationReason}`,
        appointment: appointment,
        isRead: false,
        createdAt: new Date().toISOString()
    };
    
    businessNotifications.push(businessNotification);
    localStorage.setItem(`business_notifications_${appointment.businessId}`, JSON.stringify(businessNotifications));
    
    console.log('İşletmeye iptal bildirimi gönderildi:', businessNotification);
}

// Admin bildirimlerini kontrol et
function checkAdminNotifications(appointments) {
    // localStorage'dan bildirimleri al
    const notifications = JSON.parse(localStorage.getItem('admin_notifications')) || [];
    
    // Okunmamış bildirim sayısı
    const unreadCount = notifications.filter(n => !n.isRead).length;
    
    // Bildirim sayısını dashboard'a ekle
    const notificationBadge = document.getElementById('admin-notification-badge');
    if (notificationBadge) {
        notificationBadge.textContent = unreadCount;
        notificationBadge.style.display = unreadCount > 0 ? 'block' : 'none';
    }
}

// Tarih formatla
function formatDate(dateStr) {
    if (!dateStr) return '-';
    
    const [year, month, day] = dateStr.split('-');
    return `${day}.${month}.${year}`;
}

// Tarih ve saat formatla
function formatDateTime(dateTimeStr) {
    if (!dateTimeStr) return '-';
    
    const date = new Date(dateTimeStr);
    return date.toLocaleString('tr-TR');
}

// Durum metni al
function getStatusText(status) {
    const statusTexts = {
        'pending': 'Beklemede',
        'confirmed': 'Onaylandı',
        'completed': 'Tamamlandı',
        'cancelled': 'İptal Edildi'
    };
    
    return statusTexts[status] || status;
}

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', function() {
  // Fotoğraf önizleme özelliğini etkinleştir
  setupImagePreview();
  
  // Kullanıcı adını göster
  const adminNameElement = document.getElementById('admin-name');
  if (adminNameElement) {
    adminNameElement.textContent = 'Admin';
  }
  
  // İstatistikleri yükle
  loadStatistics();
  
  // İşletmeleri yükle
  loadBusinesses();
  
  // Kullanıcıları yükle
  loadUsers();
  
  // Yeni işletme ekleme butonu
  const addBusinessBtn = document.getElementById('add-business-btn');
  if (addBusinessBtn) {
    addBusinessBtn.addEventListener('click', function() {
      openBusinessModal();
    });
  }
  
  // Modal kapatma butonları
  const closeModalButtons = document.querySelectorAll('.close-modal');
  if (closeModalButtons.length > 0) {
    closeModalButtons.forEach(button => {
        button.addEventListener('click', function() {
        const modalId = this.getAttribute('data-modal');
        if (modalId) {
          const modal = document.getElementById(modalId);
          if (modal) {
            modal.style.display = 'none';
          }
            }
        });
    });
}

  // İşletme formu gönderildiğinde
  const businessForm = document.getElementById('business-form');
  if (businessForm) {
    businessForm.addEventListener('submit', saveBusiness);
  }
  
  // Çalışma saatleri için checkbox'ların çalışması
  const workingHoursCheckboxes = document.querySelectorAll('input[type="checkbox"][id$="-status"]');
  if (workingHoursCheckboxes.length > 0) {
    workingHoursCheckboxes.forEach(checkbox => {
      checkbox.addEventListener('change', function() {
        const day = this.id.replace('-status', '');
        const openField = document.getElementById(`${day}-open`);
        const closeField = document.getElementById(`${day}-close`);
        
        if (openField && closeField) {
          openField.disabled = !this.checked;
          closeField.disabled = !this.checked;
            }
        });
    });
} 
  
  // Çıkış butonu
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
      if (window.Auth && typeof window.Auth.logout === 'function') {
        window.Auth.logout();
      }
      window.location.href = '/login.html';
    });
  }
  
  // Kuponları yükle
  loadCoupons();
  
  // Yeni kullanıcı ekleme butonu
  const addUserBtn = document.getElementById('add-user-btn');
  if (addUserBtn) {
    addUserBtn.addEventListener('click', function() {
      openUserModal();
    });
  }
  
  // Kullanıcı formu gönderildiğinde
  const userForm = document.getElementById('user-form');
  if (userForm) {
    userForm.addEventListener('submit', saveUser);
  }
  
  // Kullanıcı formu iptal butonu
  const cancelUserBtn = document.getElementById('cancel-user');
  if (cancelUserBtn) {
    cancelUserBtn.addEventListener('click', function() {
      closeUserModal();
    });
  }
  
  // Rastgele kod oluşturma butonu
  setupGenerateCodeButton();
  
  // Randevuları yükle
  loadAppointments();
}); 