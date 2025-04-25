import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const Dashboard = () => {
  const { user, api } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    users: 0,
    providers: 0,
    services: 0,
    appointments: 0
  });
  const [providers, setProviders] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [users, setUsers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Yeni firma ekleme formu için state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProvider, setNewProvider] = useState({
    companyName: '',
    address: '',
    contactPhone: '',
    description: '',
    specialties: '',
    approved: true
  });

  // Yeni kupon ekleme formu için state
  const [showAddCouponForm, setShowAddCouponForm] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discount: 0,
    discountType: 'percentage',
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
    maxUses: null,
    isSingleUse: false,
    minimumAmount: 0,
    appliesTo: {
      categories: [],
      services: [],
      providers: []
    },
    giftService: '',
    isActive: true
  });

  // Hizmet düzenleme state'i
  const [showEditServiceForm, setShowEditServiceForm] = useState(false);
  const [editingService, setEditingService] = useState(null);

  // Kullanıcılar için ekstra state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [userTags, setUserTags] = useState({});
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importPreview, setImportPreview] = useState([]);
  const [importError, setImportError] = useState('');

  // Etiket yönetimi için state
  const [tags, setTags] = useState(['VIP', 'Kurumsal', 'Test', 'Yeni Üye', 'Aktif']);
  const [newTag, setNewTag] = useState('');
  const [showTagManager, setShowTagManager] = useState(false);

  // Kullanıcı filtreleme
  const filteredUsers = users.filter(user => {
    // Rol filtresi
    if (filterRole && user.role !== filterRole) {
      return false;
    }
    
    // Arama filtresi (isim, e-posta veya telefonda arama)
    if (searchTerm) {
      const searchTermLower = searchTerm.toLowerCase();
      return (
        user.name.toLowerCase().includes(searchTermLower) ||
        user.email.toLowerCase().includes(searchTermLower) ||
        (user.phone && user.phone.includes(searchTerm))
      );
    }
    
    return true;
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError('');

        if (!user || !user.token) {
          console.error('Kullanıcı oturum bilgisi bulunamadı');
          setError('Oturum süresi dolmuş olabilir. Lütfen tekrar giriş yapın.');
          setLoading(false);
          return;
        }

        // İstatistikleri getir
        try {
          console.log('Admin istatistikleri çekiliyor...');
          const statsRes = await api.get('/admin/stats');
          console.log('İstatistikler başarıyla alındı:', statsRes.data);
          setStats(statsRes.data.data);
        } catch (err) {
          console.error('İstatistikler yüklenirken hata:', err);
          console.error('Hata detayı:', err.response?.data || err.message);
        }

        // Aktif tab'a göre veri çek
        if (activeTab === 'overview' || activeTab === 'providers') {
          await fetchProviders();
        }

        if (activeTab === 'overview' || activeTab === 'appointments') {
          await fetchAppointments();
        }
        
        if (activeTab === 'overview' || activeTab === 'services') {
          await fetchServices();
        }
        
        if (activeTab === 'overview' || activeTab === 'users') {
          await fetchUsers();
        }
        
        if (activeTab === 'overview') {
          await fetchReviews();
        }

        if (activeTab === 'overview' || activeTab === 'coupons') {
          await fetchCoupons();
        }

        setLoading(false);
      } catch (err) {
        console.error('Veri yüklenirken hata:', err);
        console.error('Hata detayı:', err.response?.data || err.message);
        setError(err.response?.data?.message || 'Veri yüklenirken bir hata oluştu');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [activeTab, api, user]);

  const fetchProviders = async () => {
    try {
      let url = '/admin/providers';
      
      if (filterStatus !== 'all') {
        url += `?approved=${filterStatus}`;
      }
      
      console.log('Servis sağlayıcılar isteniyor:', url);
      const res = await api.get(url);
      console.log('Servis sağlayıcı cevabı:', res.data);

      // Veri yapısını kontrol et ve doğru değerlerle doldur
      if (res.data && res.data.data) {
        // Boş gelirse varsayılan değerler kullan
        const providerData = res.data.data.map(provider => ({
          ...provider,
          companyName: provider.companyName || provider.name || 'İsimsiz Firma',
          specialties: provider.specialties || [],
          address: provider.address || { street: '', city: '', state: '', zipCode: '', country: 'Türkiye' },
          contactPhone: provider.contactPhone || provider.phone || '-',
          approved: provider.approved === null ? 'pending' : provider.approved
        }));
        setProviders(providerData);
      } else {
        console.error('Servis sağlayıcı verisi bulunamadı:', res.data);
        setProviders([]);
      }
    } catch (err) {
      console.error('Servis sağlayıcılar yüklenirken hata:', err);
      console.error('Hata detayı:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Servis sağlayıcılar yüklenemedi');
      setProviders([]); // Hata durumunda boş array ayarla
    }
  };

  // Adres nesnesini formatlı string olarak göster
  const formatAddress = (address) => {
    if (!address) return 'Adres bilgisi yok';
    if (typeof address === 'string') return address;
    
    const { street, city, state, zipCode, country } = address;
    let formattedAddress = '';
    
    if (street) formattedAddress += street;
    if (city) formattedAddress += formattedAddress ? `, ${city}` : city;
    if (state) formattedAddress += formattedAddress ? `, ${state}` : state;
    if (zipCode) formattedAddress += formattedAddress ? ` ${zipCode}` : zipCode;
    if (country && country !== 'Türkiye') formattedAddress += formattedAddress ? `, ${country}` : country;
    
    return formattedAddress || 'Adres bilgisi yok';
  };

  const fetchAppointments = async () => {
    try {
      console.log('Randevular isteniyor...');
      const res = await api.get('/admin/appointments');
      console.log('Randevu cevabı:', res.data);
      
      if (res.data && res.data.data) {
        // Veri yapısını güçlendir
        const appointmentData = res.data.data.map(appointment => ({
          ...appointment,
          user: appointment.user || { name: 'Misafir', email: '-' },
          provider: appointment.provider || { companyName: 'Belirtilmemiş', address: '-', phone: '-' },
          service: appointment.service || { name: 'Belirtilmemiş', price: 0, duration: 0 },
          date: appointment.date || new Date().toISOString(),
          time: appointment.time || '00:00',
          status: appointment.status || 'beklemede'
        }));
        setAppointments(appointmentData);
      } else {
        console.error('Randevu verisi bulunamadı:', res.data);
        setAppointments([]);
      }
    } catch (err) {
      console.error('Randevular yüklenirken hata:', err);
      console.error('Hata detayı:', err.response?.data || err.message);
      setAppointments([]); // Hata durumunda boş array ayarla
    }
  };

  const fetchServices = async () => {
    try {
      console.log('Hizmetler isteniyor...');
      const res = await api.get('/admin/services');
      console.log('Hizmet cevabı:', res.data);
      
      if (res.data && res.data.data) {
        // Veri yapısını güçlendir
        const serviceData = res.data.data.map(service => ({
          ...service,
          name: service.name || 'İsimsiz Hizmet',
          category: service.category || 'Diğer',
          provider: service.provider || { companyName: 'Belirtilmemiş' },
          price: service.price || 0,
          duration: service.duration || 0,
          description: service.description || '',
          isActive: service.isActive !== undefined ? service.isActive : true
        }));
        setServices(serviceData);
      } else {
        console.error('Hizmet verisi bulunamadı:', res.data);
        setServices([]);
      }
    } catch (err) {
      console.error('Hizmetler yüklenirken hata:', err);
      console.error('Hata detayı:', err.response?.data || err.message);
      setServices([]); // Hata durumunda boş array ayarla
    }
  };
  
  const fetchUsers = async () => {
    try {
      console.log('Kullanıcılar isteniyor...');
      const res = await api.get('/admin/users');
      console.log('Kullanıcı cevabı:', res.data);
      
      if (res.data && res.data.data) {
        // Veri yapısını güçlendir
        const userData = res.data.data.map(user => ({
          ...user,
          name: user.name || 'İsimsiz Kullanıcı',
          email: user.email || '-',
          phone: user.phone || '-',
          role: user.role || 'user',
          isActive: user.isActive !== undefined ? user.isActive : true,
          tags: user.tags || []
        }));
        setUsers(userData);
      } else {
        console.error('Kullanıcı verisi bulunamadı:', res.data);
        setUsers([]);
      }
    } catch (err) {
      console.error('Kullanıcılar yüklenirken hata:', err);
      console.error('Hata detayı:', err.response?.data || err.message);
      setUsers([]); // Hata durumunda boş array ayarla
    }
  };
  
  const fetchReviews = async () => {
    try {
      console.log('Yorumlar isteniyor...');
      const res = await api.get('/admin/reviews');
      console.log('Yorum cevabı:', res.data);
      
      if (res.data && res.data.data) {
        // Veri yapısını güçlendir
        const reviewData = res.data.data.map(review => ({
          ...review,
          user: review.user || { name: 'Misafir' },
          provider: review.provider || { companyName: 'Belirtilmemiş' },
          rating: review.rating || 0,
          comment: review.comment || '',
          createdAt: review.createdAt || new Date().toISOString()
        }));
        setReviews(reviewData);
      } else {
        console.error('Yorum verisi bulunamadı:', res.data);
        setReviews([]);
      }
    } catch (err) {
      console.error('Yorumlar yüklenirken hata:', err);
      console.error('Hata detayı:', err.response?.data || err.message);
      setReviews([]); // Hata durumunda boş array ayarla
    }
  };

  const fetchCoupons = async () => {
    try {
      console.log('Kuponlar isteniyor...');
      const res = await api.get('/admin/coupons');
      console.log('Kupon cevabı:', res.data);
      
      if (res.data && res.data.data) {
        // Veri yapısını güçlendir
        const couponData = res.data.data.map(coupon => ({
          ...coupon,
          code: coupon.code || 'MISSING_CODE',
          discount: coupon.discount || 0,
          discountType: coupon.discountType || 'percentage',
          validFrom: coupon.validFrom || new Date().toISOString(),
          validUntil: coupon.validUntil || new Date(Date.now() + 30*24*60*60*1000).toISOString(),
          minimumAmount: coupon.minimumAmount || 0,
          usedCount: coupon.usedCount || 0,
          maxUses: coupon.maxUses || null,
          isActive: coupon.isActive !== undefined ? coupon.isActive : true
        }));
        setCoupons(couponData);
      } else {
        console.error('Kupon verisi bulunamadı:', res.data);
        setCoupons([]);
      }
    } catch (err) {
      console.error('Kupon kodları yüklenirken hata:', err);
      console.error('Hata detayı:', err.response?.data || err.message);
      setCoupons([]); // Hata durumunda boş array ayarla
    }
  };

  const handleProviderApproval = async (id, status) => {
    try {
      await api.put(`/admin/providers/${id}/approval`, { approved: status });
      
      // Listeyi güncelle
      setProviders(providers.map(p => 
        p._id === id ? { ...p, approved: status } : p
      ));
    } catch (err) {
      setError(err.response?.data?.message || 'Durum güncellenemedi');
    }
  };

  const handleDeleteProvider = async (id) => {
    if (!window.confirm('Bu servis sağlayıcıyı silmek istediğinizden emin misiniz?')) {
      return;
    }
    
    try {
      await api.delete(`/admin/providers/${id}`);
      
      // Listeden kaldır
      setProviders(providers.filter(p => p._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Servis sağlayıcı silinemedi');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProvider({ ...newProvider, [name]: value });
  };

  const handleAddProvider = async (e) => {
    e.preventDefault();
    
    try {
      // Specialties alanını dizi olarak dönüştür
      const formData = {
        ...newProvider,
        specialties: newProvider.specialties.split(',').map(s => s.trim())
      };
      
      const res = await api.post('/admin/providers', formData);
      
      // Yeni eklenen provider'ı listeye ekle
      setProviders([...providers, res.data.data]);
      
      // Formu sıfırla ve kapat
      setNewProvider({
        companyName: '',
        address: '',
        contactPhone: '',
        description: '',
        specialties: '',
        approved: true
      });
      setShowAddForm(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Servis sağlayıcı eklenemedi');
    }
  };

  const handleStatusFilterChange = async (e) => {
    const status = e.target.value;
    setFilterStatus(status);
    
    try {
      let url = '/admin/providers';
      
      if (status !== 'all') {
        url += `?approved=${status}`;
      }
      
      const res = await api.get(url);
      setProviders(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Servis sağlayıcılar filtrelenirken hata oluştu');
    }
  };

  const handleAppointmentStatusChange = async (id, status) => {
    try {
      await api.put(`/admin/appointments/${id}/status`, { status });
      
      // Listeyi güncelle
      setAppointments(appointments.map(a => 
        a._id === id ? { ...a, status } : a
      ));
    } catch (err) {
      setError(err.response?.data?.message || 'Durum güncellenemedi');
    }
  };

  // Rastgele kupon kodu oluşturma
  const generateRandomCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    const length = 8;
    
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    setNewCoupon({
      ...newCoupon,
      code: result
    });
  };

  const handleCouponInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'appliesTo.categories') {
      // Çoklu seçim için
      const options = e.target.options;
      const selectedValues = [];
      
      for (let i = 0; i < options.length; i++) {
        if (options[i].selected) {
          selectedValues.push(options[i].value);
        }
      }
      
      setNewCoupon({
        ...newCoupon,
        appliesTo: {
          ...newCoupon.appliesTo,
          categories: selectedValues
        }
      });
    } else if (name === 'giftService') {
      setNewCoupon({
        ...newCoupon,
        giftService: value
      });
    } else if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setNewCoupon({
        ...newCoupon,
        [parent]: {
          ...newCoupon[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      });
    } else {
      setNewCoupon({
        ...newCoupon,
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };

  const handleAddCoupon = async (e) => {
    e.preventDefault();
    
    try {
      const couponData = {
        ...newCoupon
      };
      
      // Hediye hizmet için gerekli kontrol
      if (couponData.discountType === 'gift_service' && !couponData.giftService) {
        setError('Hediye hizmet için bir hizmet seçmelisiniz');
        return;
      }
      
      const res = await api.post('/admin/coupons', couponData);
      
      // Listeye ekle
      setCoupons([...coupons, res.data.data]);
      
      // Formu sıfırla ve kapat
      setNewCoupon({
        code: '',
        discount: 0,
        discountType: 'percentage',
        validFrom: new Date().toISOString().split('T')[0],
        validUntil: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
        maxUses: null,
        isSingleUse: false,
        minimumAmount: 0,
        appliesTo: {
          categories: [],
          services: [],
          providers: []
        },
        giftService: '',
        isActive: true
      });
      setShowAddCouponForm(false);
      
      setSuccess('Kupon başarıyla eklendi');
    } catch (err) {
      setError(err.response?.data?.message || 'Kupon eklenemedi');
    }
  };

  const handleDeleteCoupon = async (id) => {
    if (!window.confirm('Bu kuponu silmek istediğinizden emin misiniz?')) {
      return;
    }
    
    try {
      await api.delete(`/admin/coupons/${id}`);
      
      // Listeden kaldır
      setCoupons(coupons.filter(c => c._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Kupon silinemedi');
    }
  };

  // Hizmet düzenleme fonksiyonları
  const handleEditService = (service) => {
    setEditingService(service);
    setShowEditServiceForm(true);
  };

  const handleServiceInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditingService({
      ...editingService,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleUpdateService = async (e) => {
    e.preventDefault();
    
    try {
      const res = await api.put(`/admin/services/${editingService._id}`, editingService);
      
      // Listeyi güncelle
      setServices(services.map(s => 
        s._id === editingService._id ? res.data.data : s
      ));
      
      // Formu kapat
      setShowEditServiceForm(false);
      setEditingService(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Hizmet güncellenemedi');
    }
  };

  const handleDeleteService = async (id) => {
    if (!window.confirm('Bu hizmeti silmek istediğinizden emin misiniz?')) {
      return;
    }
    
    try {
      const res = await api.delete(`/services/${id}`);
      
      if (res.data.success) {
        setServices(services.filter(service => service._id !== id));
      }
    } catch (err) {
      console.error('Hizmet silinirken hata:', err);
      setError(err.response?.data?.message || 'Hizmet silinemedi');
    }
  };

  // Hizmet aktif/pasif durumunu değiştirme
  const toggleServiceActive = async (id, currentStatus) => {
    try {
      const res = await api.put(`/services/${id}`, {
        isActive: !currentStatus
      });
      
      if (res.data.success) {
        // Hizmetler listesini güncelle
        setServices(services.map(service => 
          service._id === id 
            ? { ...service, isActive: !currentStatus } 
            : service
        ));
      }
    } catch (err) {
      console.error('Hizmet durumu değiştirilirken hata:', err);
      setError(err.response?.data?.message || 'Hizmet durumu güncellenemedi');
    }
  };

  // Kullanıcılar için ekstra işlemler
  const handleAddUserTag = async (userId, tag) => {
    try {
      // Kullanıcıya etiket eklemek için API çağrısı
      const res = await api.post(`/admin/users/${userId}/tags`, { tag });
      
      if (res.data.success) {
        // Kullanıcı etiketlerini güncelle
        setUserTags({
          ...userTags,
          [userId]: [...(userTags[userId] || []), tag]
        });
        
        // Kullanıcılar listesini güncelle
        setUsers(users.map(u => 
          u._id === userId 
            ? { ...u, tags: [...(u.tags || []), tag] } 
            : u
        ));
        
        setSuccess(`${tag} etiketi kullanıcıya eklendi`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Etiket eklenemedi');
    }
  };

  const handleRemoveUserTag = async (userId, tag) => {
    try {
      // Kullanıcıdan etiket kaldırmak için API çağrısı
      const res = await api.delete(`/admin/users/${userId}/tags/${tag}`);
      
      if (res.data.success) {
        // Kullanıcı etiketlerini güncelle
        setUserTags({
          ...userTags,
          [userId]: (userTags[userId] || []).filter(t => t !== tag)
        });
        
        // Kullanıcılar listesini güncelle
        setUsers(users.map(u => 
          u._id === userId 
            ? { ...u, tags: (u.tags || []).filter(t => t !== tag) } 
            : u
        ));
        
        setSuccess(`${tag} etiketi kullanıcıdan kaldırıldı`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Etiket kaldırılamadı');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) {
      return;
    }
    
    try {
      await api.delete(`/admin/users/${userId}`);
      
      // Kullanıcıyı listeden kaldır
      setUsers(users.filter(u => u._id !== userId));
    } catch (err) {
      setError(err.response?.data?.message || 'Kullanıcı silinemedi');
    }
  };

  // Yeni etiket ekleme fonksiyonu
  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  // Etiket silme fonksiyonu
  const handleDeleteTag = (tagToDelete) => {
    setTags(tags.filter(tag => tag !== tagToDelete));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    setImportFile(file);
    
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          setImportError('');
          // CSV dosyasını parse et
          const csvData = evt.target.result;
          const lines = csvData.split('\n');
          const headers = lines[0].split(',').map(h => h.trim());
          
          // Gerekli sütunları kontrol et
          const requiredColumns = ['name', 'email', 'phone', 'role'];
          const missingColumns = requiredColumns.filter(col => !headers.includes(col));
          
          if (missingColumns.length > 0) {
            setImportError(`Eksik sütunlar: ${missingColumns.join(', ')}`);
            setImportPreview([]);
            return;
          }
          
          // Önizleme verisini oluştur - ilk 5 satır
          const previewData = [];
          for (let i = 1; i < Math.min(lines.length, 6); i++) {
            if (lines[i].trim() === '') continue;
            
            const values = lines[i].split(',').map(val => val.trim());
            const row = {};
            
            headers.forEach((header, index) => {
              row[header] = values[index] || '';
            });
            
            previewData.push(row);
          }
          
          setImportPreview(previewData);
        } catch (err) {
          setImportError('Dosya format hatası: ' + err.message);
          setImportPreview([]);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleImportUsers = async () => {
    if (!importFile) {
      setImportError('Lütfen bir dosya seçin');
      return;
    }
    
    try {
      const formData = new FormData();
      formData.append('usersFile', importFile);
      
      const res = await api.post('/admin/users/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (res.data.success) {
        setSuccess(`${res.data.data.imported} kullanıcı başarıyla içe aktarıldı`);
        setImportModalOpen(false);
        setImportFile(null);
        setImportPreview([]);
        
        // Kullanıcı listesini yenile
        fetchUsers();
      }
    } catch (err) {
      setImportError(err.response?.data?.message || 'Kullanıcılar içe aktarılamadı');
    }
  };

  const closeModal = () => {
    setShowProviderDetail(false);
    setSelectedProvider(null);
    setTimeSlots({});
    setEditingTimeSlots(false);
    setActiveModalTab('info');
  };

  // Aktif sekmeye göre içerik render et
  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="overview-tab">
            <div className="row">
              <div className="col-md-3 mb-4">
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title">Kullanıcılar</h5>
                    <h2 className="card-text">{stats.users}</h2>
                  </div>
                </div>
              </div>
              <div className="col-md-3 mb-4">
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title">Servis Sağlayıcılar</h5>
                    <h2 className="card-text">{stats.providers}</h2>
                  </div>
                </div>
              </div>
              <div className="col-md-3 mb-4">
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title">Servisler</h5>
                    <h2 className="card-text">{stats.services}</h2>
                  </div>
                </div>
              </div>
              <div className="col-md-3 mb-4">
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title">Randevular</h5>
                    <h2 className="card-text">{stats.appointments}</h2>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'providers':
        return (
          <div className="providers-tab">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h3>Servis Sağlayıcılar</h3>
              <div>
                <select
                  className="form-select me-2 d-inline-block w-auto"
                  value={filterStatus}
                  onChange={handleStatusFilterChange}
                >
                  <option value="all">Tümü</option>
                  <option value="true">Onaylanmış</option>
                  <option value="false">Reddedilmiş</option>
                  <option value="pending">Onay Bekleyen</option>
                </select>
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowAddForm(true)}
                >
                  Yeni Ekle
                </button>
              </div>
            </div>
            
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Firma Adı</th>
                    <th>Adres</th>
                    <th>Telefon</th>
                    <th>Durum</th>
                    <th>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {providers.map(provider => (
                    <tr key={provider._id}>
                      <td>{provider.companyName}</td>
                      <td>{provider.address.street || provider.address}, {provider.address.city || provider.city}</td>
                      <td>{provider.contactPhone || provider.phone}</td>
                      <td>
                        {provider.approved === true ? (
                          <span className="badge bg-success">Onaylandı</span>
                        ) : provider.approved === false ? (
                          <span className="badge bg-danger">Reddedildi</span>
                        ) : (
                          <span className="badge bg-warning">Onay Bekliyor</span>
                        )}
                      </td>
                      <td>
                        <button 
                          className="btn btn-sm btn-info me-1"
                          onClick={() => handleProviderClick(provider)}
                        >
                          Detay
                        </button>
                        {provider.approved === null && (
                          <>
                            <button 
                              className="btn btn-sm btn-success me-1"
                              onClick={() => handleProviderApproval(provider._id, true)}
                            >
                              Onayla
                            </button>
                            <button 
                              className="btn btn-sm btn-danger me-1"
                              onClick={() => handleProviderApproval(provider._id, false)}
                            >
                              Reddet
                            </button>
                          </>
                        )}
                        <button 
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDeleteProvider(provider._id)}
                        >
                          Sil
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      // Diğer sekmelerin içeriği burada eklenecek
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Yükleniyor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-lg-2">
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">Admin Paneli</h5>
            </div>
            <div className="card-body p-0">
              <div className="list-group list-group-flush">
                <button 
                  className={`list-group-item list-group-item-action ${activeTab === 'overview' ? 'active' : ''}`}
                  onClick={() => setActiveTab('overview')}
                >
                  <i className="bi bi-speedometer2 me-2"></i> Genel Bakış
                </button>
                <button 
                  className={`list-group-item list-group-item-action ${activeTab === 'providers' ? 'active' : ''}`}
                  onClick={() => setActiveTab('providers')}
                >
                  <i className="bi bi-building me-2"></i> Servis Sağlayıcılar
                </button>
                <button 
                  className={`list-group-item list-group-item-action ${activeTab === 'appointments' ? 'active' : ''}`}
                  onClick={() => setActiveTab('appointments')}
                >
                  <i className="bi bi-calendar-check me-2"></i> Randevular
                </button>
                <button 
                  className={`list-group-item list-group-item-action ${activeTab === 'services' ? 'active' : ''}`}
                  onClick={() => setActiveTab('services')}
                >
                  <i className="bi bi-gear me-2"></i> Hizmetler
                </button>
                <button 
                  className={`list-group-item list-group-item-action ${activeTab === 'users' ? 'active' : ''}`}
                  onClick={() => setActiveTab('users')}
                >
                  <i className="bi bi-people me-2"></i> Kullanıcılar
                </button>
                <button 
                  className={`list-group-item list-group-item-action ${activeTab === 'coupons' ? 'active' : ''}`}
                  onClick={() => setActiveTab('coupons')}
                >
                  <i className="bi bi-ticket-perforated me-2"></i> Kupon Kodları
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-lg-10">
          {error && <div className="alert alert-danger">{error}</div>}
          
          {/* Genel Bakış */}
          {activeTab === 'overview' && (
            <>
              <h2 className="mb-4">Hoş Geldiniz, {user?.name}</h2>
              
              <div className="row mb-4">
                <div className="col-md-3">
                  <div className="card bg-primary text-white">
                    <div className="card-body">
                      <h5 className="card-title">Kullanıcılar</h5>
                      <h2 className="card-text">{stats.users}</h2>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card bg-success text-white">
                    <div className="card-body">
                      <h5 className="card-title">Servis Sağlayıcılar</h5>
                      <h2 className="card-text">{stats.providers}</h2>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card bg-info text-white">
                    <div className="card-body">
                      <h5 className="card-title">Hizmetler</h5>
                      <h2 className="card-text">{stats.services}</h2>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card bg-warning text-white">
                    <div className="card-body">
                      <h5 className="card-title">Randevular</h5>
                      <h2 className="card-text">{stats.appointments}</h2>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="row">
                <div className="col-md-6 mb-4">
                  <div className="card shadow-sm">
                    <div className="card-header d-flex justify-content-between align-items-center">
                      <h5 className="mb-0">Son Servis Sağlayıcılar</h5>
                      <button 
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => setActiveTab('providers')}
                      >
                        Tümünü Gör
                      </button>
                    </div>
                    <div className="card-body p-0">
                      <div className="list-group list-group-flush">
                        {providers.slice(0, 5).map(provider => (
                          <div key={provider._id} className="list-group-item">
                            <div className="d-flex justify-content-between align-items-center">
                              <div>
                                <h6 className="mb-1">{provider.companyName}</h6>
                                <small className="text-muted">{formatAddress(provider.address)}</small>
                              </div>
                              <span className={`badge bg-${
                                provider.approved === true ? 'success' :
                                provider.approved === false ? 'danger' : 'warning'
                              }`}>
                                {provider.approved === true ? 'Onaylandı' :
                                 provider.approved === false ? 'Reddedildi' : 'Beklemede'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="col-md-6 mb-4">
                  <div className="card shadow-sm">
                    <div className="card-header d-flex justify-content-between align-items-center">
                      <h5 className="mb-0">Son Randevular</h5>
                      <button 
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => setActiveTab('appointments')}
                      >
                        Tümünü Gör
                      </button>
                    </div>
                    <div className="card-body p-0">
                      <div className="list-group list-group-flush">
                        {appointments.slice(0, 5).map(appointment => (
                          <div key={appointment._id} className="list-group-item">
                            <div className="d-flex justify-content-between align-items-center">
                              <div>
                                <h6 className="mb-1">
                                  {appointment.service.name} - {appointment.user.name}
                                </h6>
                                <small className="text-muted">
                                  {new Date(appointment.date).toLocaleDateString('tr-TR')} {appointment.time}
                                </small>
                              </div>
                              <span className={`badge bg-${
                                appointment.status === 'confirmed' ? 'success' :
                                appointment.status === 'pending' ? 'warning' :
                                appointment.status === 'completed' ? 'info' :
                                appointment.status === 'cancelled' ? 'danger' : 'secondary'
                              }`}>
                                {appointment.status === 'confirmed' ? 'Onaylandı' :
                                 appointment.status === 'pending' ? 'Beklemede' :
                                 appointment.status === 'completed' ? 'Tamamlandı' :
                                 appointment.status === 'cancelled' ? 'İptal Edildi' : appointment.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="col-md-12 mb-4">
                <div className="card shadow-sm">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Son Yorumlar</h5>
                  </div>
                  <div className="card-body p-0">
                    <div className="list-group list-group-flush">
                      {reviews.length === 0 ? (
                        <div className="list-group-item text-center py-3">
                          Henüz yorum bulunmuyor.
                        </div>
                      ) : (
                        reviews.slice(0, 5).map(review => (
                          <div key={review._id} className="list-group-item">
                            <div className="d-flex justify-content-between align-items-center">
                              <div>
                                <h6 className="mb-1">{review.user?.name} - {review.provider?.companyName}</h6>
                                <div className="text-warning mb-1">
                                  {[...Array(5)].map((_, i) => (
                                    <i key={i} className={`bi bi-star${i < review.rating ? '-fill' : ''}`}></i>
                                  ))}
                                </div>
                                <small className="text-muted">{review.comment}</small>
                              </div>
                              <small className="text-muted">
                                {new Date(review.createdAt).toLocaleDateString('tr-TR')}
                              </small>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
          
          {/* Servis Sağlayıcılar */}
          {activeTab === 'providers' && (
            <>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h3>Servis Sağlayıcılar</h3>
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowAddForm(!showAddForm)}
                >
                  {showAddForm ? 'İptal' : 'Yeni Ekle'}
                </button>
              </div>
              
              {showAddForm && (
                <div className="card shadow-sm mb-4">
                  <div className="card-header">
                    <h5 className="mb-0">Yeni Servis Sağlayıcı Ekle</h5>
                  </div>
                  <div className="card-body">
                    <form onSubmit={handleAddProvider}>
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <label htmlFor="companyName" className="form-label">Firma Adı</label>
                          <input
                            type="text"
                            className="form-control"
                            id="companyName"
                            name="companyName"
                            value={newProvider.companyName}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className="col-md-6">
                          <label htmlFor="contactPhone" className="form-label">Telefon</label>
                          <input
                            type="text"
                            className="form-control"
                            id="contactPhone"
                            name="contactPhone"
                            value={newProvider.contactPhone}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <label htmlFor="address" className="form-label">Adres</label>
                        <textarea
                          className="form-control"
                          id="address"
                          name="address"
                          rows="2"
                          value={newProvider.address}
                          onChange={handleInputChange}
                          required
                        ></textarea>
                      </div>
                      
                      <div className="mb-3">
                        <label htmlFor="specialties" className="form-label">Uzmanlıklar (virgülle ayırın)</label>
                        <input
                          type="text"
                          className="form-control"
                          id="specialties"
                          name="specialties"
                          value={newProvider.specialties}
                          onChange={handleInputChange}
                          placeholder="Örn: Araç Yıkama, Lastik Değişimi, Otopark"
                          required
                        />
                      </div>
                      
                      <div className="mb-3">
                        <label htmlFor="description" className="form-label">Açıklama</label>
                        <textarea
                          className="form-control"
                          id="description"
                          name="description"
                          rows="3"
                          value={newProvider.description}
                          onChange={handleInputChange}
                          required
                        ></textarea>
                      </div>
                      
                      <div className="mb-3">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="approved"
                            name="approved"
                            checked={newProvider.approved}
                            onChange={(e) => setNewProvider({...newProvider, approved: e.target.checked})}
                          />
                          <label className="form-check-label" htmlFor="approved">
                            Onaylı olarak ekle
                          </label>
                        </div>
                      </div>
                      
                      <div className="d-flex justify-content-end">
                        <button type="button" className="btn btn-outline-secondary me-2" onClick={() => setShowAddForm(false)}>
                          İptal
                        </button>
                        <button type="submit" className="btn btn-primary">
                          Ekle
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
              
              <div className="card shadow-sm">
                <div className="card-header">
                  <div className="row align-items-center">
                    <div className="col-md-8">
                      <h5 className="mb-0">Servis Sağlayıcı Listesi</h5>
                    </div>
                    <div className="col-md-4">
                      <select 
                        className="form-select" 
                        value={filterStatus}
                        onChange={handleStatusFilterChange}
                      >
                        <option value="all">Tüm Servis Sağlayıcılar</option>
                        <option value="true">Onaylı</option>
                        <option value="false">Reddedilmiş</option>
                        <option value="pending">Onay Bekleyen</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  {providers.length === 0 ? (
                    <div className="alert alert-info">
                      Herhangi bir servis sağlayıcı bulunamadı.
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th>Firma Adı</th>
                            <th>Adres</th>
                            <th>Telefon</th>
                            <th>Uzmanlıklar</th>
                            <th>Durum</th>
                            <th>İşlemler</th>
                          </tr>
                        </thead>
                        <tbody>
                          {providers.map(provider => (
                            <tr key={provider._id}>
                              <td>{provider.companyName}</td>
                              <td>{formatAddress(provider.address)}</td>
                              <td>{provider.contactPhone || provider.phone}</td>
                              <td>
                                {provider.specialties && provider.specialties.map((spec, idx) => (
                                  <span key={idx} className="badge bg-secondary me-1">{spec}</span>
                                ))}
                              </td>
                              <td>
                                <span className={`badge bg-${
                                  provider.approved === true ? 'success' :
                                  provider.approved === false ? 'danger' : 'warning'
                                }`}>
                                  {provider.approved === true ? 'Onaylı' :
                                   provider.approved === false ? 'Reddedildi' : 'Beklemede'}
                                </span>
                              </td>
                              <td>
                                <div className="btn-group" role="group">
                                  {provider.approved !== true && (
                                    <button 
                                      className="btn btn-sm btn-success"
                                      onClick={() => handleProviderApproval(provider._id, true)}
                                      title="Servis sağlayıcıyı onayla"
                                    >
                                      <i className="bi bi-check-lg"></i> Onayla
                                    </button>
                                  )}
                                  {provider.approved !== false && (
                                    <button 
                                      className="btn btn-sm btn-danger"
                                      onClick={() => handleProviderApproval(provider._id, false)}
                                      title="Servis sağlayıcıyı reddet"
                                    >
                                      <i className="bi bi-x-lg"></i> Reddet
                                    </button>
                                  )}
                                  <button 
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => handleDeleteProvider(provider._id)}
                                    title="Servis sağlayıcıyı sil"
                                  >
                                    <i className="bi bi-trash"></i>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
          
          {/* Randevular */}
          {activeTab === 'appointments' && (
            <>
              <h3 className="mb-4">Randevular</h3>
              <div className="card shadow-sm">
                <div className="card-body">
                  {appointments.length === 0 ? (
                    <div className="alert alert-info">
                      Henüz bir randevu bulunmuyor.
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th>Hizmet</th>
                            <th>Müşteri</th>
                            <th>Servis Sağlayıcı</th>
                            <th>Tarih/Saat</th>
                            <th>Durum</th>
                          </tr>
                        </thead>
                        <tbody>
                          {appointments.map(appointment => (
                            <tr key={appointment._id}>
                              <td>{appointment.service?.name}</td>
                              <td>{appointment.user?.name}</td>
                              <td>{appointment.provider?.companyName}</td>
                              <td>
                                {new Date(appointment.date).toLocaleDateString('tr-TR')} {appointment.time}
                              </td>
                              <td>
                                <span className={`badge bg-${
                                  appointment.status === 'confirmed' ? 'success' :
                                  appointment.status === 'pending' ? 'warning' :
                                  appointment.status === 'completed' ? 'info' :
                                  appointment.status === 'cancelled' ? 'danger' : 'secondary'
                                }`}>
                                  {appointment.status === 'confirmed' ? 'Onaylandı' :
                                   appointment.status === 'pending' ? 'Beklemede' :
                                   appointment.status === 'completed' ? 'Tamamlandı' :
                                   appointment.status === 'cancelled' ? 'İptal Edildi' : appointment.status}
                                </span>
                              </td>
                              <td>
                                <div className="dropdown">
                                  <button className="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                                    Durum Değiştir
                                  </button>
                                  <ul className="dropdown-menu">
                                    <li><button className="dropdown-item" onClick={() => handleAppointmentStatusChange(appointment._id, 'beklemede')}>Beklemede</button></li>
                                    <li><button className="dropdown-item" onClick={() => handleAppointmentStatusChange(appointment._id, 'onaylandı')}>Onaylandı</button></li>
                                    <li><button className="dropdown-item" onClick={() => handleAppointmentStatusChange(appointment._id, 'tamamlandı')}>Tamamlandı</button></li>
                                    <li><button className="dropdown-item" onClick={() => handleAppointmentStatusChange(appointment._id, 'iptal edildi')}>İptal Edildi</button></li>
                                  </ul>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
          
          {/* Hizmetler */}
          {activeTab === 'services' && (
            <>
              <h3 className="mb-4">Hizmetler</h3>
              
              {showEditServiceForm && editingService && (
                <div className="card shadow-sm mb-4">
                  <div className="card-header">
                    <h5 className="mb-0">Hizmet Düzenle</h5>
                  </div>
                  <div className="card-body">
                    <form onSubmit={handleUpdateService}>
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <label htmlFor="name" className="form-label">Hizmet Adı</label>
                          <input
                            type="text"
                            className="form-control"
                            id="name"
                            name="name"
                            value={editingService.name}
                            onChange={handleServiceInputChange}
                            required
                          />
                        </div>
                        <div className="col-md-6">
                          <label htmlFor="category" className="form-label">Kategori</label>
                          <select
                            className="form-control"
                            id="category"
                            name="category"
                            value={editingService.category}
                            onChange={handleServiceInputChange}
                            required
                          >
                            <option value="">Kategori Seçin</option>
                            <option value="Araç Yıkama">Araç Yıkama</option>
                            <option value="Teknik Muayene">Teknik Muayene</option>
                            <option value="Lastik Değişimi">Lastik Değişimi</option>
                            <option value="Otopark">Otopark</option>
                            <option value="Bakım">Bakım</option>
                            <option value="Onarım">Onarım</option>
                            <option value="Diğer">Diğer</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <label htmlFor="price" className="form-label">Fiyat (TL)</label>
                          <input
                            type="number"
                            className="form-control"
                            id="price"
                            name="price"
                            value={editingService.price}
                            onChange={handleServiceInputChange}
                            required
                            min="0"
                          />
                        </div>
                        <div className="col-md-6">
                          <label htmlFor="duration" className="form-label">Süre (dakika)</label>
                          <input
                            type="number"
                            className="form-control"
                            id="duration"
                            name="duration"
                            value={editingService.duration}
                            onChange={handleServiceInputChange}
                            required
                            min="1"
                          />
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <label htmlFor="description" className="form-label">Açıklama</label>
                        <textarea
                          className="form-control"
                          id="description"
                          name="description"
                          rows="3"
                          value={editingService.description}
                          onChange={handleServiceInputChange}
                          required
                        ></textarea>
                      </div>
                      
                      <div className="mb-3">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="isActive"
                            name="isActive"
                            checked={editingService.isActive}
                            onChange={handleServiceInputChange}
                          />
                          <label className="form-check-label" htmlFor="isActive">
                            Aktif
                          </label>
                        </div>
                      </div>
                      
                      <div className="d-flex justify-content-end">
                        <button type="button" className="btn btn-outline-secondary me-2" onClick={() => {
                          setShowEditServiceForm(false);
                          setEditingService(null);
                        }}>
                          İptal
                        </button>
                        <button type="submit" className="btn btn-primary">
                          Güncelle
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
              
              <div className="card shadow-sm">
                <div className="card-body">
                  {services.length === 0 ? (
                    <div className="alert alert-info">
                      Henüz bir hizmet bulunmuyor.
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th>Hizmet Adı</th>
                            <th>Kategori</th>
                            <th>Servis Sağlayıcı</th>
                            <th>Fiyat</th>
                            <th>Süre (dk)</th>
                            <th>Durum</th>
                            <th>İşlemler</th>
                          </tr>
                        </thead>
                        <tbody>
                          {services.map(service => (
                            <tr key={service._id}>
                              <td>{service.name}</td>
                              <td>{service.category}</td>
                              <td>{service.provider?.companyName}</td>
                              <td>{service.price} TL</td>
                              <td>{service.duration} dk</td>
                              <td>
                                <span className={`badge ${service.isActive ? 'bg-success' : 'bg-danger'}`}>
                                  {service.isActive ? 'Aktif' : 'Pasif'}
                                </span>
                              </td>
                              <td>
                                <div className="btn-group" role="group">
                                  <button
                                    className={`btn btn-sm btn-${service.isActive ? 'warning' : 'success'}`}
                                    onClick={() => toggleServiceActive(service._id, service.isActive)}
                                  >
                                    {service.isActive ? 'Pasife Al' : 'Aktifleştir'}
                                  </button>
                                  <button
                                    className="btn btn-sm btn-primary"
                                    onClick={() => handleEditService(service)}
                                  >
                                    <i className="bi bi-pencil"></i> Düzenle
                                  </button>
                                  <button
                                    className="btn btn-sm btn-danger"
                                    onClick={() => handleDeleteService(service._id)}
                                  >
                                    <i className="bi bi-trash"></i> Sil
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
          
          {/* Kullanıcılar */}
          {activeTab === 'users' && (
            <>
              <div className="card shadow-sm">
                <div className="card-header bg-white d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Kullanıcı Yönetimi</h5>
                  <div className="btn-group">
                    <button
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => setImportModalOpen(true)}
                    >
                      <i className="bi bi-file-earmark-arrow-up me-1"></i>
                      CSV/Excel İçe Aktar
                    </button>
                    <button
                      className="btn btn-outline-success btn-sm"
                      onClick={() => setShowTagManager(true)}
                    >
                      <i className="bi bi-tags me-1"></i>
                      Etiketleri Yönet
                    </button>
                  </div>
                </div>
                <div className="card-body">
                  <div className="row mb-3">
                    <div className="col-md-8">
                      <div className="input-group">
                        <span className="input-group-text">
                          <i className="bi bi-search"></i>
                        </span>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="İsim, e-posta veya telefon ile ara..."
                          value={searchTerm}
                          onChange={e => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <select
                        className="form-select"
                        value={filterRole}
                        onChange={e => setFilterRole(e.target.value)}
                      >
                        <option value="">Tüm Roller</option>
                        <option value="user">Kullanıcılar</option>
                        <option value="provider">Servis Sağlayıcılar</option>
                        <option value="admin">Yöneticiler</option>
                      </select>
                    </div>
                  </div>
                  
                  {filteredUsers.length === 0 ? (
                    <div className="alert alert-info">
                      <i className="bi bi-info-circle me-2"></i>
                      Arama kriterlerine uygun kullanıcı bulunamadı.
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead className="table-light">
                          <tr>
                            <th>Kullanıcı</th>
                            <th>E-posta</th>
                            <th>Telefon</th>
                            <th>Rol</th>
                            <th>Etiketler</th>
                            <th>Durum</th>
                            <th>İşlemler</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredUsers.map(user => (
                            <tr key={user._id}>
                              <td>{user.name}</td>
                              <td>{user.email}</td>
                              <td>{user.phone || '-'}</td>
                              <td>
                                <span className={`badge ${
                                  user.role === 'admin' ? 'bg-danger' :
                                  user.role === 'provider' ? 'bg-primary' :
                                  'bg-success'
                                }`}>
                                  {user.role === 'admin' ? 'Yönetici' :
                                   user.role === 'provider' ? 'Servis Sağlayıcı' :
                                   'Kullanıcı'}
                                </span>
                              </td>
                              <td>
                                <div className="d-flex gap-1 flex-wrap">
                                  {(user.tags || []).map(tag => (
                                    <span key={tag} className="badge bg-info">
                                      {tag} 
                                      <button 
                                        className="btn-close btn-close-white ms-1 p-0" 
                                        style={{ fontSize: '0.5rem' }}
                                        onClick={() => handleRemoveUserTag(user._id, tag)}
                                      ></button>
                                    </span>
                                  ))}
                                  <div className="dropdown">
                                    <button 
                                      className="btn btn-sm btn-outline-secondary py-0 px-1" 
                                      type="button" 
                                      data-bs-toggle="dropdown"
                                    >
                                      <i className="bi bi-plus-circle"></i>
                                    </button>
                                    <ul className="dropdown-menu">
                                      {tags.map(tag => (
                                        <li key={tag}>
                                          <button 
                                            className="dropdown-item" 
                                            onClick={() => handleAddUserTag(user._id, tag)}
                                            disabled={(user.tags || []).includes(tag)}
                                          >
                                            {tag}
                                          </button>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <span className={`badge ${user.isActive ? 'bg-success' : 'bg-secondary'}`}>
                                  {user.isActive ? 'Aktif' : 'Pasif'}
                                </span>
                              </td>
                              <td>
                                <div className="btn-group">
                                  <button 
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() => {
                                      // Kullanıcı detayları görüntüleme veya düzenleme modal'ı açılabilir
                                    }}
                                  >
                                    <i className="bi bi-pencil"></i>
                                  </button>
                                  <button 
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => handleDeleteUser(user._id)}
                                  >
                                    <i className="bi bi-trash"></i>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              {showTagManager && (
                <div className="card shadow-sm mb-4">
                  <div className="card-header">
                    <h5 className="mb-0">Etiket Yöneticisi</h5>
                  </div>
                  <div className="card-body">
                    <div className="mb-3">
                      <div className="input-group">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Yeni etiket ekle..."
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                        />
                        <button 
                          className="btn btn-outline-primary" 
                          type="button"
                          onClick={handleAddTag}
                          disabled={!newTag.trim()}
                        >
                          Ekle
                        </button>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <label className="form-label">Mevcut Etiketler</label>
                      <div className="d-flex flex-wrap gap-2">
                        {tags.map(tag => (
                          <div key={tag} className="badge bg-info p-2 d-flex align-items-center">
                            {tag}
                            <button 
                              className="btn-close ms-2" 
                              style={{ fontSize: '0.7rem' }}
                              onClick={() => handleDeleteTag(tag)}
                            ></button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Kupon Kodları */}
          {activeTab === 'coupons' && (
            <>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h3>Kupon Kodları</h3>
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowAddCouponForm(!showAddCouponForm)}
                >
                  {showAddCouponForm ? 'İptal' : 'Yeni Kupon Ekle'}
                </button>
              </div>
              
              {showAddCouponForm && (
                <div className="card shadow-sm mb-4">
                  <div className="card-header">
                    <h5 className="mb-0">Yeni Kupon Ekle</h5>
                  </div>
                  <div className="card-body">
                    <form onSubmit={handleAddCoupon}>
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <label htmlFor="code" className="form-label">Kupon Kodu</label>
                          <div className="input-group">
                            <input
                              type="text"
                              className="form-control"
                              id="code"
                              name="code"
                              value={newCoupon.code}
                              onChange={handleCouponInputChange}
                              required
                            />
                            <button 
                              type="button" 
                              className="btn btn-outline-secondary"
                              onClick={generateRandomCode}
                            >
                              <i className="bi bi-shuffle"></i> Rastgele
                            </button>
                          </div>
                          <small className="text-muted">Kullanıcının uygulayacağı kod (örn: YIKAMAFIRSATI)</small>
                        </div>
                        <div className="col-md-6">
                          <label htmlFor="discountType" className="form-label">İndirim Türü</label>
                          <select
                            className="form-control"
                            id="discountType"
                            name="discountType"
                            value={newCoupon.discountType}
                            onChange={handleCouponInputChange}
                            required
                          >
                            <option value="percentage">Yüzde İndirim (%)</option>
                            <option value="amount">Sabit Tutar İndirimi (TL)</option>
                            <option value="gift_service">Hediye Hizmet</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <label htmlFor="discount" className="form-label">İndirim Değeri</label>
                          <div className="input-group">
                            <input
                              type="number"
                              className="form-control"
                              id="discount"
                              name="discount"
                              value={newCoupon.discount}
                              onChange={handleCouponInputChange}
                              required
                              min="0"
                            />
                            <span className="input-group-text">
                              {newCoupon.discountType === 'percentage' ? '%' : 'TL'}
                            </span>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <label htmlFor="minimumAmount" className="form-label">Minimum Harcama</label>
                          <div className="input-group">
                            <input
                              type="number"
                              className="form-control"
                              id="minimumAmount"
                              name="minimumAmount"
                              value={newCoupon.minimumAmount}
                              onChange={handleCouponInputChange}
                              min="0"
                            />
                            <span className="input-group-text">TL</span>
                          </div>
                          <small className="text-muted">0 = minimum limit yok</small>
                        </div>
                      </div>
                      
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <label htmlFor="validFrom" className="form-label">Başlangıç Tarihi</label>
                          <input
                            type="date"
                            className="form-control"
                            id="validFrom"
                            name="validFrom"
                            value={newCoupon.validFrom}
                            onChange={handleCouponInputChange}
                            required
                          />
                        </div>
                        <div className="col-md-6">
                          <label htmlFor="validUntil" className="form-label">Bitiş Tarihi</label>
                          <input
                            type="date"
                            className="form-control"
                            id="validUntil"
                            name="validUntil"
                            value={newCoupon.validUntil}
                            onChange={handleCouponInputChange}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <label htmlFor="maxUses" className="form-label">Maksimum Kullanım</label>
                          <input
                            type="number"
                            className="form-control"
                            id="maxUses"
                            name="maxUses"
                            value={newCoupon.maxUses || ''}
                            onChange={handleCouponInputChange}
                            min="1"
                            placeholder="Limitsiz"
                          />
                          <small className="text-muted">Boş bırakırsanız limitsiz olacaktır</small>
                        </div>
                        <div className="col-md-6">
                          <label htmlFor="appliesTo.categories" className="form-label">Kategoriler</label>
                          <select
                            className="form-select"
                            id="appliesTo.categories"
                            name="appliesTo.categories"
                            value={newCoupon.appliesTo.categories}
                            onChange={handleCouponInputChange}
                            multiple
                          >
                            <option value="Araç Yıkama">Araç Yıkama</option>
                            <option value="Teknik Muayene">Teknik Muayene</option>
                            <option value="Lastik Değişimi">Lastik Değişimi</option>
                            <option value="Otopark">Otopark</option>
                            <option value="Bakım">Bakım</option>
                            <option value="Onarım">Onarım</option>
                            <option value="Diğer">Diğer</option>
                          </select>
                          <small className="text-muted">Ctrl tuşuna basarak çoklu seçim yapabilirsiniz</small>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="isSingleUse"
                            name="isSingleUse"
                            checked={newCoupon.isSingleUse}
                            onChange={handleCouponInputChange}
                          />
                          <label className="form-check-label" htmlFor="isSingleUse">
                            Tek kullanımlık kupon
                          </label>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="isActive"
                            name="isActive"
                            checked={newCoupon.isActive}
                            onChange={handleCouponInputChange}
                          />
                          <label className="form-check-label" htmlFor="isActive">
                            Aktif
                          </label>
                        </div>
                      </div>
                      
                      {newCoupon.discountType === 'gift_service' && (
                        <div className="mb-3">
                          <label htmlFor="giftService" className="form-label">Hediye Edilecek Hizmet</label>
                          <select
                            className="form-select"
                            id="giftService"
                            name="giftService"
                            value={newCoupon.giftService || ''}
                            onChange={handleCouponInputChange}
                            required={newCoupon.discountType === 'gift_service'}
                          >
                            <option value="">Hizmet Seçin</option>
                            {services.map(service => (
                              <option key={service._id} value={service._id}>
                                {service.name} - {service.provider?.companyName} ({service.price} TL)
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                      
                      <div className="d-flex justify-content-end">
                        <button type="button" className="btn btn-outline-secondary me-2" onClick={() => setShowAddCouponForm(false)}>
                          İptal
                        </button>
                        <button type="submit" className="btn btn-primary">
                          Ekle
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
              
              <div className="card shadow-sm">
                <div className="card-body">
                  {coupons.length === 0 ? (
                    <div className="alert alert-info">
                      Henüz bir kupon kodu bulunmuyor.
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th>Kupon Kodu</th>
                            <th>İndirim</th>
                            <th>Geçerlilik</th>
                            <th>Min. Tutar</th>
                            <th>Kullanım</th>
                            <th>Durum</th>
                            <th>İşlemler</th>
                          </tr>
                        </thead>
                        <tbody>
                          {coupons.map(coupon => (
                            <tr key={coupon._id}>
                              <td>{coupon.code}</td>
                              <td>
                                {coupon.discountType === 'percentage' 
                                  ? `%${coupon.discount}` 
                                  : `${coupon.discount} TL`}
                              </td>
                              <td>
                                {new Date(coupon.validFrom).toLocaleDateString('tr-TR')} - 
                                {new Date(coupon.validUntil).toLocaleDateString('tr-TR')}
                              </td>
                              <td>{coupon.minimumAmount > 0 ? `${coupon.minimumAmount} TL` : '-'}</td>
                              <td>
                                {coupon.usedCount} / {coupon.maxUses || '∞'}
                              </td>
                              <td>
                                <span className={`badge ${coupon.isActive ? 'bg-success' : 'bg-danger'}`}>
                                  {coupon.isActive ? 'Aktif' : 'Pasif'}
                                </span>
                              </td>
                              <td>
                                <div className="btn-group" role="group">
                                  <button 
                                    className="btn btn-sm btn-danger"
                                    onClick={() => handleDeleteCoupon(coupon._id)}
                                    title="Kuponu sil"
                                  >
                                    <i className="bi bi-trash"></i>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Etiket Yönetim Modalı */}
      {showTagManager && (
        <div className="modal show fade d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Etiketleri Yönet</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowTagManager(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label htmlFor="newTag" className="form-label">Yeni Etiket Ekle</label>
                  <div className="input-group">
                    <input 
                      type="text" 
                      className="form-control" 
                      id="newTag" 
                      value={newTag}
                      onChange={e => setNewTag(e.target.value)}
                    />
                    <button 
                      className="btn btn-primary" 
                      type="button"
                      onClick={handleAddTag}
                      disabled={!newTag.trim()}
                    >
                      Ekle
                    </button>
                  </div>
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Mevcut Etiketler</label>
                  <div className="d-flex flex-wrap gap-2">
                    {tags.map(tag => (
                      <div key={tag} className="badge bg-info p-2 d-flex align-items-center">
                        {tag}
                        <button 
                          className="btn-close ms-2" 
                          style={{ fontSize: '0.7rem' }}
                          onClick={() => handleDeleteTag(tag)}
                        ></button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowTagManager(false)}
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </div>
      )}

      {/* Kullanıcı İçe Aktarma Modalı */}
      {importModalOpen && (
        <div className="modal show fade d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Kullanıcı İçe Aktar</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => {
                    setImportModalOpen(false);
                    setImportFile(null);
                    setImportPreview([]);
                    setImportError('');
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label htmlFor="importFile" className="form-label">CSV veya Excel Dosyası</label>
                  <input 
                    type="file" 
                    className="form-control" 
                    id="importFile" 
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileUpload}
                  />
                  <small className="text-muted">
                    Dosya formatı: name, email, phone, role (zorunlu sütunlar)
                  </small>
                </div>
                
                {importError && (
                  <div className="alert alert-danger">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {importError}
                  </div>
                )}
                
                {importPreview.length > 0 && (
                  <div className="mt-4">
                    <h6>Önizleme</h6>
                    <div className="table-responsive">
                      <table className="table table-sm table-bordered">
                        <thead className="table-light">
                          <tr>
                            {Object.keys(importPreview[0]).map(header => (
                              <th key={header}>{header}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {importPreview.map((row, index) => (
                            <tr key={index}>
                              {Object.values(row).map((value, i) => (
                                <td key={i}>{value}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="alert alert-info small">
                      <i className="bi bi-info-circle me-2"></i>
                      Toplam satır sayısı: {importFile ? importFile.size : 0} bayt
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => {
                    setImportModalOpen(false);
                    setImportFile(null);
                    setImportPreview([]);
                    setImportError('');
                  }}
                >
                  İptal
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={handleImportUsers}
                  disabled={!importFile || importError}
                >
                  İçe Aktar
                </button>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 