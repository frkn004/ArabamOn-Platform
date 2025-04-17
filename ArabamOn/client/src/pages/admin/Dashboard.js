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

        // İstatistikleri getir
        const statsRes = await api.get('/admin/stats');
        setStats(statsRes.data.data);

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
        setError(err.response?.data?.message || 'Veri yüklenirken bir hata oluştu');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [activeTab, api]);

  const fetchProviders = async () => {
    try {
      let url = '/admin/providers';
      
      if (filterStatus !== 'all') {
        url += `?approved=${filterStatus}`;
      }
      
      const res = await api.get(url);
      setProviders(res.data.data);
    } catch (err) {
      console.error('Servis sağlayıcılar yüklenirken hata:', err);
      setError(err.response?.data?.message || 'Servis sağlayıcılar yüklenemedi');
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
      const res = await api.get('/admin/appointments');
      setAppointments(res.data.data);
    } catch (err) {
      console.error('Randevular yüklenirken hata:', err);
    }
  };

  const fetchServices = async () => {
    try {
      const res = await api.get('/admin/services');
      setServices(res.data.data);
    } catch (err) {
      console.error('Hizmetler yüklenirken hata:', err);
    }
  };
  
  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data.data);
    } catch (err) {
      console.error('Kullanıcılar yüklenirken hata:', err);
    }
  };
  
  const fetchReviews = async () => {
    try {
      const res = await api.get('/admin/reviews');
      setReviews(res.data.data);
    } catch (err) {
      console.error('Yorumlar yüklenirken hata:', err);
    }
  };

  const fetchCoupons = async () => {
    try {
      const res = await api.get('/admin/coupons');
      setCoupons(res.data.data);
    } catch (err) {
      console.error('Kupon kodları yüklenirken hata:', err);
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
      await api.delete(`/admin/services/${id}`);
      
      // Listeden kaldır
      setServices(services.filter(s => s._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Hizmet silinemedi');
    }
  };

  // Kullanıcılar için ekstra işlemler
  const handleAddUserTag = async (userId, tag) => {
    try {
      await api.put(`/admin/users/${userId}/tag`, { tag });
      
      // Kullanıcıyı güncelle
      setUsers(users.map(u => 
        u._id === userId ? { ...u, tag } : u
      ));
    } catch (err) {
      setError(err.response?.data?.message || 'Kullanıcı etiketi eklenemedi');
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
                                  appointment.status === 'onaylandı' ? 'success' :
                                  appointment.status === 'beklemede' ? 'warning' :
                                  appointment.status === 'iptal edildi' ? 'danger' :
                                  appointment.status === 'tamamlandı' ? 'info' : 'secondary'
                                }`}>
                                  {appointment.status === 'onaylandı' ? 'Onaylandı' :
                                   appointment.status === 'beklemede' ? 'Beklemede' :
                                   appointment.status === 'iptal edildi' ? 'İptal Edildi' :
                                   appointment.status === 'tamamlandı' ? 'Tamamlandı' : appointment.status}
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
                            <th>Servis Sağlayıcı</th>
                            <th>Kategori</th>
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
                              <td>{service.provider?.companyName}</td>
                              <td>
                                <span className="badge bg-info">{service.category}</span>
                              </td>
                              <td>{service.price} TL</td>
                              <td>{service.duration}</td>
                              <td>
                                <span className={`badge ${service.isActive ? 'bg-success' : 'bg-danger'}`}>
                                  {service.isActive ? 'Aktif' : 'Pasif'}
                                </span>
                              </td>
                              <td>
                                <div className="btn-group" role="group">
                                  <button 
                                    className="btn btn-sm btn-primary"
                                    onClick={() => handleEditService(service)}
                                    title="Hizmeti düzenle"
                                  >
                                    <i className="bi bi-pencil"></i>
                                  </button>
                                  <button 
                                    className="btn btn-sm btn-danger"
                                    onClick={() => handleDeleteService(service._id)}
                                    title="Hizmeti sil"
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
          
          {/* Kullanıcılar */}
          {activeTab === 'users' && (
            <>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h3>Kullanıcılar</h3>
                <div className="d-flex gap-2">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Kullanıcı ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <select
                    className="form-select"
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                  >
                    <option value="">Tüm Roller</option>
                    <option value="user">Kullanıcılar</option>
                    <option value="provider">Servis Sağlayıcılar</option>
                    <option value="admin">Adminler</option>
                  </select>
                </div>
              </div>
              
              <div className="d-flex justify-content-between align-items-center mb-3">
                <button 
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => setShowTagManager(!showTagManager)}
                >
                  {showTagManager ? 'Etiket Yöneticisini Kapat' : 'Etiket Yöneticisi'}
                </button>
              </div>
              
              <div className="card shadow-sm">
                <div className="card-body">
                  {users.length === 0 ? (
                    <div className="alert alert-info">
                      Henüz bir kullanıcı bulunmuyor.
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th>Adı</th>
                            <th>E-posta</th>
                            <th>Telefon</th>
                            <th>Rol</th>
                            <th>Etiket</th>
                            <th>Kayıt Tarihi</th>
                            <th>İşlemler</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredUsers.map(user => (
                            <tr key={user._id}>
                              <td>{user.name}</td>
                              <td>{user.email}</td>
                              <td>{user.phone}</td>
                              <td>
                                <span className={`badge ${
                                  user.role === 'admin' ? 'bg-danger' : 
                                  user.role === 'provider' ? 'bg-success' : 'bg-primary'
                                }`}>
                                  {user.role === 'admin' ? 'Admin' : 
                                   user.role === 'provider' ? 'Servis Sağlayıcı' : 'Kullanıcı'}
                                </span>
                              </td>
                              <td>
                                <div className="dropdown">
                                  <button className="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                                    {user.tag || 'Etiket Ekle'}
                                  </button>
                                  <ul className="dropdown-menu">
                                    {tags.map((tag, index) => (
                                      <li key={index}>
                                        <button 
                                          className="dropdown-item" 
                                          onClick={() => handleAddUserTag(user._id, tag)}
                                        >
                                          {tag}
                                        </button>
                                      </li>
                                    ))}
                                    <li><hr className="dropdown-divider" /></li>
                                    <li>
                                      <button 
                                        className="dropdown-item" 
                                        onClick={() => handleAddUserTag(user._id, '')}
                                      >
                                        Etiket Kaldır
                                      </button>
                                    </li>
                                  </ul>
                                </div>
                              </td>
                              <td>{new Date(user.createdAt).toLocaleDateString('tr-TR')}</td>
                              <td>
                                <div className="btn-group" role="group">
                                  <button 
                                    className="btn btn-sm btn-danger"
                                    onClick={() => handleDeleteUser(user._id)}
                                    title="Kullanıcıyı sil"
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

              {showTagManager && activeTab === 'users' && (
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
                        >
                          Ekle
                        </button>
                      </div>
                    </div>
                    
                    <div className="d-flex flex-wrap gap-2">
                      {tags.map((tag, index) => (
                        <div key={index} className="badge bg-light text-dark p-2 d-flex align-items-center">
                          {tag}
                          <button 
                            className="btn-close ms-2" 
                            style={{ fontSize: '0.5rem' }}
                            onClick={() => handleDeleteTag(tag)}
                            aria-label="Etiketi kaldır"
                          ></button>
                        </div>
                      ))}
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
    </div>
  );
};

export default Dashboard; 