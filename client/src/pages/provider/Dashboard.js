import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link } from 'react-router-dom';

// Çakışan import'ları kaldıralım
// import Loading from '../../components/Loading';
// import api from '../../utils/api';
// import { AuthContext } from '../../contexts/AuthContext';
// import api from '../../utils/api';
// import Loading from '../../components/Loading';

// Basit yükleme bileşeni
const Loading = () => (
  <div className="text-center py-4">
    <div className="spinner-border text-primary" role="status">
      <span className="visually-hidden">Yükleniyor...</span>
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [provider, setProvider] = useState(null);
  const [showAddService, setShowAddService] = useState(false);
  const [categories, setCategories] = useState([
    'Araç Yıkama', 
    'Teknik Muayene', 
    'Lastik Değişimi', 
    'Otopark', 
    'Bakım', 
    'Onarım', 
    'Diğer'
  ]);
  const [newService, setNewService] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    category: 'Bakım'
  });
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categoryServices, setCategoryServices] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard olarak değiştirdim
  const [workingHours, setWorkingHours] = useState({
    monday: { open: "", close: "" },
    tuesday: { open: "", close: "" },
    wednesday: { open: "", close: "" },
    thursday: { open: "", close: "" },
    friday: { open: "", close: "" },
    saturday: { open: "", close: "" },
    sunday: { open: "", close: "" }
  });
  const [timeSlots, setTimeSlots] = useState([]);
  const [googleMapsLink, setGoogleMapsLink] = useState('');
  const [success, setSuccess] = useState('');
  const [reviews, setReviews] = useState([]);
  const [replyText, setReplyText] = useState({});
  const [stats, setStats] = useState({
    totalAppointments: 0,
    pendingAppointments: 0,
    completedAppointments: 0,
    activeServices: 0,
    totalReviews: 0,
    averageRating: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Provider bilgilerini getir
        const providerRes = await axios.get('/api/providers/me', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (providerRes.data.success) {
          setProvider(providerRes.data.data);
          // Çalışma saatlerini ayarla
          if (providerRes.data.data.workingHours) {
            setWorkingHours(providerRes.data.data.workingHours);
          }
          // Zaman dilimlerini ayarla
          if (providerRes.data.data.timeSlots) {
            setTimeSlots(providerRes.data.data.timeSlots);
          } else {
            // Varsayılan zaman dilimleri oluştur
            const defaultDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
            const defaultSlots = defaultDays.map(day => {
              return {
                day,
                slots: generateDefaultTimeSlots()
              }
            });
            setTimeSlots(defaultSlots);
          }
          // Google Maps linkini ayarla
          if (providerRes.data.data.googleMapsLink) {
            setGoogleMapsLink(providerRes.data.data.googleMapsLink);
          }
        }
        
        // Randevuları getir
        const appointmentsRes = await axios.get('/api/appointments', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (appointmentsRes.data.success) {
          const allAppointments = appointmentsRes.data.data;
          setAppointments(allAppointments);
          
          // İstatistikleri hesapla
          const totalAppointments = allAppointments.length;
          const pendingAppointments = allAppointments.filter(a => a.status === 'beklemede').length;
          const completedAppointments = allAppointments.filter(a => a.status === 'tamamlandı').length;
          
          // Servisleri getir
          const servicesRes = await axios.get('/api/services?provider=me', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          
          if (servicesRes.data.success) {
            const allServices = servicesRes.data.data;
            setServices(allServices);
            
            // Aktif servisleri hesapla
            const activeServices = allServices.filter(s => s.active).length;
            
            // Yorumları getir
            const reviewsRes = await axios.get('/api/reviews/provider', {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              }
            });
            
            if (reviewsRes.data.success) {
              const allReviews = reviewsRes.data.data;
              setReviews(allReviews);
              
              // Ortalama puanı hesapla
              const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0);
              const averageRating = allReviews.length > 0 ? (totalRating / allReviews.length).toFixed(1) : 0;
              
              // İstatistikleri güncelle
              setStats({
                totalAppointments,
                pendingAppointments,
                completedAppointments,
                activeServices,
                totalReviews: allReviews.length,
                averageRating
              });
            }
          }
        }
        
      } catch (err) {
        console.error('Veri yüklenirken hata:', err);
        setError(err.response?.data?.message || 'Veri yüklenemedi');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

  useEffect(() => {
    // Seçilen kategoriye göre hazır hizmetleri getir
    const fetchCategoryServices = async () => {
      if (!selectedCategory) return;
      
      try {
        const res = await axios.get(`/api/services/templates?category=${selectedCategory}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (res.data.success) {
          setCategoryServices(res.data.data);
        }
      } catch (err) {
        console.error('Kategori hizmetleri yüklenemedi:', err);
      }
    };
    
    fetchCategoryServices();
  }, [selectedCategory]);

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const handleServiceChange = (e) => {
    const { name, value } = e.target;
    setNewService({ ...newService, [name]: value });
  };

  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/services', newService, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (res.data.success) {
        setServices([...services, res.data.data]);
        setNewService({
          name: '',
          description: '',
          price: '',
          duration: '',
          category: 'Bakım'
        });
        setShowAddService(false);
      }
    } catch (err) {
      setError('Hizmet eklenirken bir hata oluştu');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const res = await fetch(`/api/appointments/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status })
      });
      
      if (!res.ok) {
        throw new Error('Durum güncellenemedi');
      }
      
      // Başarılı güncelleme sonrası, randevuları yenile
      setAppointments(appointments.map(a => 
        a._id === id ? { ...a, status } : a
      ));
      
    } catch (err) {
      setError(err.message || 'Durum güncellenemedi');
    }
  };

  const selectTemplateService = (template) => {
    setNewService({
      ...newService,
      name: template.name,
      description: template.description,
      price: template.price,
      duration: template.duration,
      category: template.category
    });
  };

  const handleWorkingHoursChange = (day, type, value) => {
    setWorkingHours({
      ...workingHours,
      [day]: {
        ...workingHours[day],
        [type]: value
      }
    });
  };

  const saveWorkingHours = async () => {
    try {
      setLoading(true);
      setError('');
      
      const res = await axios.put(`/api/providers/${provider._id}`, {
        workingHours: workingHours
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (res.data.success) {
        setProvider(res.data.data);
        setSuccess('Çalışma saatleri başarıyla güncellendi');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Çalışma saatleri güncellenemedi');
    } finally {
      setLoading(false);
    }
  };

  // Varsayılan zaman dilimlerini oluşturan fonksiyon
  const generateDefaultTimeSlots = () => {
    const slots = [];
    // 08:00 - 18:00 arası yarım saatlik dilimler oluştur
    for (let hour = 8; hour < 18; hour++) {
      // Tam saat
      slots.push({
        time: `${hour.toString().padStart(2, '0')}:00`,
        available: true
      });
      // Yarım saat
      slots.push({
        time: `${hour.toString().padStart(2, '0')}:30`,
        available: true
      });
    }
    return slots;
  };
  
  // Zaman dilimlerini kaydet
  const saveTimeSlots = async () => {
    try {
      setLoading(true);
      setError('');
      
      const res = await axios.put(`/api/providers/${provider._id}/timeslots`, {
        timeSlots: timeSlots
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (res.data.success) {
        setProvider(res.data.data);
        setSuccess('Zaman dilimleri başarıyla güncellendi');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Zaman dilimleri güncellenemedi');
    } finally {
      setLoading(false);
    }
  };
  
  // Google Maps linkini kaydet
  const saveGoogleMapsLink = async () => {
    try {
      setLoading(true);
      setError('');
      
      const res = await axios.put(`/api/providers/${provider._id}/maps-link`, {
        googleMapsLink: googleMapsLink
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (res.data.success) {
        setProvider(res.data.data);
        setSuccess('Google Maps linki başarıyla güncellendi');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Google Maps linki güncellenemedi');
    } finally {
      setLoading(false);
    }
  };

  const days = {
    monday: 'Pazartesi',
    tuesday: 'Salı',
    wednesday: 'Çarşamba',
    thursday: 'Perşembe',
    friday: 'Cuma',
    saturday: 'Cumartesi',
    sunday: 'Pazar'
  };

  // Dashboard Ana Sayfası
  const renderDashboardTab = () => {
    return (
      <div className="dashboard-overview">
        <div className="row mb-4">
          <div className="col-md-6">
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <h5 className="card-title">Firma Bilgileri</h5>
                <div className="d-flex align-items-center mb-3">
                  <div className="me-3">
                    <img 
                      src={provider?.image || 'https://via.placeholder.com/80'} 
                      alt={provider?.companyName} 
                      className="rounded-circle" 
                      style={{width: '80px', height: '80px', objectFit: 'cover'}}
                    />
                  </div>
                  <div>
                    <h4 className="mb-1">{provider?.companyName}</h4>
                    <p className="text-muted mb-0">
                      {provider?.approved ? 
                        <span className="text-success"><i className="bi bi-check-circle-fill me-1"></i>Onaylı Servis Sağlayıcı</span> :
                        <span className="text-warning"><i className="bi bi-exclamation-circle-fill me-1"></i>Onay Bekleniyor</span>
                      }
                    </p>
                  </div>
                </div>
                <p><i className="bi bi-geo-alt me-2"></i>{provider?.address?.street}, {provider?.address?.city}</p>
                <p><i className="bi bi-telephone me-2"></i>{provider?.contactPhone}</p>
                <div className="mt-3">
                  <Link to="/provider/profile" className="btn btn-outline-primary btn-sm">
                    <i className="bi bi-pencil-square me-1"></i>Profili Düzenle
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <h5 className="card-title">Çalışma Durumu</h5>
                <div className="mb-3">
                  <div className="form-check form-switch">
                    <input 
                      className="form-check-input" 
                      type="checkbox" 
                      id="isOpenNow"
                      checked={provider?.isOpen ?? true}
                      onChange={() => toggleProviderStatus()}
                    />
                    <label className="form-check-label" htmlFor="isOpenNow">
                      {provider?.isOpen ?? true ? 'Şuan Açık' : 'Şuan Kapalı'}
                    </label>
                  </div>
                </div>
                <div className="mb-2">
                  <h6>Bugünkü Çalışma Saati</h6>
                  <p className="mb-0">
                    {getTodayWorkingHours()}
                  </p>
                </div>
                <div className="mt-3">
                  <button 
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => setActiveTab('working-hours')}
                  >
                    <i className="bi bi-clock me-1"></i>Çalışma Saatlerini Düzenle
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="row mb-4">
          <div className="col-md-3">
            <div className="card shadow-sm bg-primary text-white h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <div>
                    <h6 className="card-title">Toplam Randevu</h6>
                    <h3>{stats.totalAppointments}</h3>
                  </div>
                  <div>
                    <i className="bi bi-calendar-check fs-1"></i>
                  </div>
                </div>
              </div>
              <div className="card-footer bg-transparent border-0">
                <button 
                  className="btn btn-sm text-white"
                  onClick={() => setActiveTab('appointments')}
                >
                  Detayları Gör <i className="bi bi-arrow-right"></i>
                </button>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card shadow-sm bg-warning text-white h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <div>
                    <h6 className="card-title">Bekleyen Randevu</h6>
                    <h3>{stats.pendingAppointments}</h3>
                  </div>
                  <div>
                    <i className="bi bi-hourglass-split fs-1"></i>
                  </div>
                </div>
              </div>
              <div className="card-footer bg-transparent border-0">
                <button 
                  className="btn btn-sm text-white"
                  onClick={() => setActiveTab('appointments')}
                >
                  Detayları Gör <i className="bi bi-arrow-right"></i>
                </button>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card shadow-sm bg-success text-white h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <div>
                    <h6 className="card-title">Aktif Hizmetler</h6>
                    <h3>{stats.activeServices}</h3>
                  </div>
                  <div>
                    <i className="bi bi-tools fs-1"></i>
                  </div>
                </div>
              </div>
              <div className="card-footer bg-transparent border-0">
                <button 
                  className="btn btn-sm text-white"
                  onClick={() => setActiveTab('services')}
                >
                  Detayları Gör <i className="bi bi-arrow-right"></i>
                </button>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card shadow-sm bg-info text-white h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <div>
                    <h6 className="card-title">Değerlendirmeler</h6>
                    <h3>{stats.averageRating} <small>({stats.totalReviews})</small></h3>
                  </div>
                  <div>
                    <i className="bi bi-star-fill fs-1"></i>
                  </div>
                </div>
              </div>
              <div className="card-footer bg-transparent border-0">
                <button 
                  className="btn btn-sm text-white"
                  onClick={() => setActiveTab('reviews')}
                >
                  Detayları Gör <i className="bi bi-arrow-right"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="row">
          <div className="col-md-6">
            <div className="card shadow-sm h-100">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Son Randevular</h5>
                <button 
                  className="btn btn-sm btn-link"
                  onClick={() => setActiveTab('appointments')}
                >
                  Tümünü Gör
                </button>
              </div>
              <div className="card-body">
                {appointments.length === 0 ? (
                  <p className="text-muted">Henüz randevu bulunmuyor.</p>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Müşteri</th>
                          <th>Hizmet</th>
                          <th>Tarih/Saat</th>
                          <th>Durum</th>
                        </tr>
                      </thead>
                      <tbody>
                        {appointments.slice(0, 5).map(appointment => (
                          <tr key={appointment._id}>
                            <td>{appointment.user?.name}</td>
                            <td>{appointment.service?.name}</td>
                            <td>
                              {new Date(appointment.date).toLocaleDateString('tr-TR')} {appointment.time}
                            </td>
                            <td>
                              <span className={`badge ${
                                appointment.status === 'onaylandı' ? 'bg-success' : 
                                appointment.status === 'beklemede' ? 'bg-warning' : 
                                appointment.status === 'iptal edildi' ? 'bg-danger' : 
                                appointment.status === 'tamamlandı' ? 'bg-info' : 'bg-secondary'
                              }`}>
                                {appointment.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card shadow-sm h-100">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Son Değerlendirmeler</h5>
                <button 
                  className="btn btn-sm btn-link"
                  onClick={() => setActiveTab('reviews')}
                >
                  Tümünü Gör
                </button>
              </div>
              <div className="card-body">
                {reviews.length === 0 ? (
                  <p className="text-muted">Henüz değerlendirme bulunmuyor.</p>
                ) : (
                  <div>
                    {reviews.slice(0, 3).map(review => (
                      <div key={review._id} className="card mb-2">
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <div>
                              <h6 className="mb-0">{review.user?.name}</h6>
                              <small className="text-muted">
                                {new Date(review.createdAt).toLocaleDateString('tr-TR')}
                              </small>
                            </div>
                            <div className="text-warning">
                              {[...Array(5)].map((_, i) => (
                                <i key={i} className={`bi bi-star${i < review.rating ? '-fill' : ''}`}></i>
                              ))}
                            </div>
                          </div>
                          <p className="mb-0">{review.comment}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Günün çalışma saatlerini döndüren fonksiyon
  const getTodayWorkingHours = () => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = days[new Date().getDay()];
    
    if (!workingHours || !workingHours[today] || !workingHours[today].open || !workingHours[today].close) {
      return 'Bugün kapalı';
    }
    
    return `${workingHours[today].open} - ${workingHours[today].close}`;
  };

  // Servis sağlayıcının açık/kapalı durumunu değiştiren fonksiyon
  const toggleProviderStatus = async () => {
    try {
      const newStatus = !(provider?.isOpen ?? true);
      
      const res = await axios.put(`/api/providers/${provider._id}/status`, {
        isOpen: newStatus
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (res.data.success) {
        setProvider({...provider, isOpen: newStatus});
        toast.success(`Servis ${newStatus ? 'açık' : 'kapalı'} olarak ayarlandı`);
      }
    } catch (err) {
      toast.error('Durum güncellenirken bir hata oluştu');
    }
  };

  if (loading) {
    return (
      <div className="container py-5">
        <Loading />
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <ToastContainer />
      
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      
      <div className="row">
        <div className="col-md-3">
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">Servis Paneli</h4>
            </div>
            <div className="list-group list-group-flush">
              <button
                className={`list-group-item list-group-item-action ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => setActiveTab('dashboard')}
              >
                <i className="bi bi-speedometer2 me-2"></i> Genel Bakış
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
                <i className="bi bi-tools me-2"></i> Hizmetler
              </button>
              <button
                className={`list-group-item list-group-item-action ${activeTab === 'reviews' ? 'active' : ''}`}
                onClick={() => setActiveTab('reviews')}
              >
                <i className="bi bi-star me-2"></i> Değerlendirmeler
              </button>
              <button
                className={`list-group-item list-group-item-action ${activeTab === 'working-hours' ? 'active' : ''}`}
                onClick={() => setActiveTab('working-hours')}
              >
                <i className="bi bi-clock me-2"></i> Çalışma Saatleri
              </button>
              <button
                className={`list-group-item list-group-item-action ${activeTab === 'time-slots' ? 'active' : ''}`}
                onClick={() => setActiveTab('time-slots')}
              >
                <i className="bi bi-calendar-day me-2"></i> Zaman Dilimleri
              </button>
              <button
                className={`list-group-item list-group-item-action ${activeTab === 'location' ? 'active' : ''}`}
                onClick={() => setActiveTab('location')}
              >
                <i className="bi bi-geo-alt me-2"></i> Konum Bilgileri
              </button>
              <Link to="/provider/profile" className="list-group-item list-group-item-action">
                <i className="bi bi-person-circle me-2"></i> Profil Bilgileri
              </Link>
            </div>
          </div>
        </div>
        
        <div className="col-md-9">
          {loading ? (
            <Loading />
          ) : (
            <>
              {activeTab === 'dashboard' && renderDashboardTab()}
              
              {activeTab === 'appointments' && (
                <div className="card shadow-sm">
                  <div className="card-header">
                    <h5 className="mb-0">Randevular</h5>
                  </div>
                  <div className="card-body">
                    {appointments.length === 0 ? (
                      <p>Henüz randevu bulunmuyor.</p>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-hover">
                          <thead>
                            <tr>
                              <th>Müşteri</th>
                              <th>Hizmet</th>
                              <th>Tarih & Saat</th>
                              <th>Durum</th>
                              <th>İşlemler</th>
                            </tr>
                          </thead>
                          <tbody>
                            {appointments.map(appointment => (
                              <tr key={appointment._id}>
                                <td>{appointment.user?.name || 'Bilinmeyen'}</td>
                                <td>{appointment.service?.name || 'Bilinmeyen Hizmet'}</td>
                                <td>{new Date(appointment.appointmentDate).toLocaleDateString('tr-TR')} {appointment.appointmentTime}</td>
                                <td>
                                  <span className={`badge bg-${
                                    appointment.status === 'beklemede' ? 'warning' :
                                    appointment.status === 'onaylandı' ? 'success' :
                                    appointment.status === 'tamamlandı' ? 'info' :
                                    appointment.status === 'iptal edildi' ? 'danger' : 'secondary'
                                  }`}>
                                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                                  </span>
                                </td>
                                <td>
                                  {appointment.status === 'beklemede' && (
                                    <>
                                      <button 
                                        className="btn btn-sm btn-success me-1"
                                        onClick={() => handleStatusChange(appointment._id, 'onaylandı')}
                                      >
                                        <i className="bi bi-check-circle"></i>
                                      </button>
                                      <button 
                                        className="btn btn-sm btn-danger"
                                        onClick={() => handleStatusChange(appointment._id, 'iptal edildi')}
                                      >
                                        <i className="bi bi-x-circle"></i>
                                      </button>
                                    </>
                                  )}
                                  {appointment.status === 'onaylandı' && (
                                    <button 
                                      className="btn btn-sm btn-info"
                                      onClick={() => handleStatusChange(appointment._id, 'tamamlandı')}
                                    >
                                      <i className="bi bi-check-all"></i>
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {activeTab === 'services' && (
                <div className="card shadow-sm">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Hizmetler</h5>
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => setShowAddService(true)}
                    >
                      <i className="bi bi-plus-circle me-1"></i>Yeni Hizmet Ekle
                    </button>
                  </div>
                  <div className="card-body">
                    {showAddService && (
                      <div className="mb-4 p-3 border rounded">
                        <h6 className="mb-3">Yeni Hizmet Ekle</h6>
                        <form onSubmit={handleServiceSubmit}>
                          <div className="row mb-3">
                            <div className="col-md-4">
                              <label htmlFor="category" className="form-label">Kategori</label>
                              <select 
                                className="form-select" 
                                id="category" 
                                value={newService.category}
                                onChange={handleCategoryChange}
                                required
                              >
                                <option value="">Kategori Seçin</option>
                                {categories.map(category => (
                                  <option key={category} value={category}>{category}</option>
                                ))}
                              </select>
                            </div>
                            <div className="col-md-8">
                              <label htmlFor="name" className="form-label">Hizmet Adı</label>
                              <input 
                                type="text" 
                                className="form-control" 
                                id="name"
                                value={newService.name}
                                onChange={(e) => handleServiceChange(e, 'name')}
                                required
                              />
                            </div>
                          </div>
                          
                          <div className="row mb-3">
                            <div className="col-md-8">
                              <label htmlFor="description" className="form-label">Açıklama</label>
                              <textarea 
                                className="form-control" 
                                id="description"
                                value={newService.description}
                                onChange={(e) => handleServiceChange(e, 'description')}
                                required
                              ></textarea>
                            </div>
                            <div className="col-md-2">
                              <label htmlFor="price" className="form-label">Fiyat (₺)</label>
                              <input 
                                type="number" 
                                className="form-control" 
                                id="price"
                                value={newService.price}
                                onChange={(e) => handleServiceChange(e, 'price')}
                                required
                              />
                            </div>
                            <div className="col-md-2">
                              <label htmlFor="duration" className="form-label">Süre (dk)</label>
                              <input 
                                type="number" 
                                className="form-control" 
                                id="duration"
                                value={newService.duration}
                                onChange={(e) => handleServiceChange(e, 'duration')}
                                required
                              />
                            </div>
                          </div>
                          
                          {selectedCategory && categoryServices.length > 0 && (
                            <div className="mb-3">
                              <label className="form-label">Hazır Şablonlar</label>
                              <div className="row">
                                {categoryServices.map(template => (
                                  <div key={template._id} className="col-md-3 mb-2">
                                    <div 
                                      className="card h-100 cursor-pointer" 
                                      onClick={() => selectTemplateService(template)}
                                      style={{cursor: 'pointer'}}
                                    >
                                      <div className="card-body">
                                        <h6>{template.name}</h6>
                                        <p className="small mb-1">{template.description}</p>
                                        <div className="d-flex justify-content-between">
                                          <span className="badge bg-primary">{template.price} ₺</span>
                                          <span className="badge bg-secondary">{template.duration} dk</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          <div className="d-flex justify-content-end">
                            <button 
                              type="button" 
                              className="btn btn-secondary me-2"
                              onClick={() => setShowAddService(false)}
                            >
                              İptal
                            </button>
                            <button type="submit" className="btn btn-primary">
                              Hizmet Ekle
                            </button>
                          </div>
                        </form>
                      </div>
                    )}
                    
                    {services.length === 0 ? (
                      <p>Henüz hizmet bulunmuyor.</p>
                    ) : (
                      <div className="row">
                        {services.map(service => (
                          <div key={service._id} className="col-md-4 mb-3">
                            <div className="card h-100">
                              <div className="card-header d-flex justify-content-between">
                                <h6 className="mb-0">{service.name}</h6>
                                <span className="badge bg-primary">{service.price} ₺</span>
                              </div>
                              <div className="card-body">
                                <p className="card-text">{service.description}</p>
                                <div className="d-flex justify-content-between">
                                  <span><i className="bi bi-clock me-1"></i>{service.duration} dk</span>
                                  <span><i className="bi bi-tag me-1"></i>{service.category}</span>
                                </div>
                              </div>
                              <div className="card-footer">
                                <div className="form-check form-switch">
                                  <input 
                                    className="form-check-input" 
                                    type="checkbox" 
                                    id={`service-active-${service._id}`}
                                    checked={service.active}
                                  />
                                  <label className="form-check-label" htmlFor={`service-active-${service._id}`}>
                                    {service.active ? 'Aktif' : 'Pasif'}
                                  </label>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {activeTab === 'working-hours' && (
                <div className="card shadow-sm">
                  <div className="card-header">
                    <h5 className="mb-0">Çalışma Saatleri</h5>
                  </div>
                  <div className="card-body">
                    <div className="table-responsive">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Gün</th>
                            <th>Açılış</th>
                            <th>Kapanış</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.keys(days).map(day => (
                            <tr key={day}>
                              <td>{days[day]}</td>
                              <td>
                                <input 
                                  type="time" 
                                  className="form-control" 
                                  value={workingHours[day]?.open || ""}
                                  onChange={(e) => handleWorkingHoursChange(day, 'open', e.target.value)}
                                />
                              </td>
                              <td>
                                <input 
                                  type="time" 
                                  className="form-control" 
                                  value={workingHours[day]?.close || ""}
                                  onChange={(e) => handleWorkingHoursChange(day, 'close', e.target.value)}
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="d-flex justify-content-end mt-3">
                      <button 
                        className="btn btn-primary" 
                        onClick={saveWorkingHours}
                        disabled={loading}
                      >
                        {loading ? 'Kaydediliyor...' : 'Kaydet'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'time-slots' && (
                <div className="card shadow-sm">
                  <div className="card-header">
                    <h5 className="mb-0">Zaman Dilimleri</h5>
                  </div>
                  <div className="card-body">
                    <p className="mb-3">Hangi zaman dilimlerinde randevu alınabileceğini ayarlayın:</p>
                    
                    <ul className="nav nav-tabs mb-3">
                      {Object.keys(days).map((day, index) => (
                        <li className="nav-item" key={day}>
                          <button 
                            className={`nav-link ${index === 0 ? 'active' : ''}`} 
                            data-bs-toggle="tab" 
                            data-bs-target={`#${day}-tab`}
                            type="button"
                            role="tab"
                            aria-controls={`${day}-tab`}
                            aria-selected={index === 0 ? "true" : "false"}
                          >
                            {days[day]}
                          </button>
                        </li>
                      ))}
                    </ul>
                    
                    <div className="tab-content">
                      {Object.keys(days).map((day, dayIndex) => {
                        // timeSlots dizisinde bu gün için veri var mı kontrol et
                        const dayData = timeSlots.find(slot => slot.day === day);
                        const slots = dayData?.slots || generateDefaultTimeSlots();
                        
                        return (
                          <div 
                            key={day}
                            className={`tab-pane fade ${dayIndex === 0 ? 'show active' : ''}`} 
                            id={`${day}-tab`}
                            role="tabpanel"
                            aria-labelledby={`${day}-tab`}
                          >
                            <div className="row">
                              {slots.map((slot, slotIndex) => (
                                <div key={slotIndex} className="col-md-2 mb-2">
                                  <div 
                                    className={`card ${slot.available ? 'border-success' : 'border-danger'}`}
                                    style={{cursor: 'pointer'}}
                                    onClick={() => {
                                      // Zaman dilimini güncelle
                                      const updatedTimeSlots = [...timeSlots];
                                      const daySlotIndex = updatedTimeSlots.findIndex(s => s.day === day);
                                      
                                      // Eğer bu gün için henüz bir kayıt yoksa, oluştur
                                      if (daySlotIndex === -1) {
                                        updatedTimeSlots.push({
                                          day: day,
                                          slots: generateDefaultTimeSlots()
                                        });
                                        const newDayIndex = updatedTimeSlots.length - 1;
                                        updatedTimeSlots[newDayIndex].slots[slotIndex].available = !slot.available;
                                      } else {
                                        // Var olan günün slot durumunu değiştir
                                        updatedTimeSlots[daySlotIndex].slots[slotIndex].available = !slot.available;
                                      }
                                      
                                      setTimeSlots(updatedTimeSlots);
                                      setSuccess(`${days[day]}, ${slot.time} saati ${!slot.available ? 'müsait' : 'kapalı'} olarak ayarlandı`);
                                    }}
                                  >
                                    <div className="card-body py-2 px-3 text-center">
                                      <span>{slot.time}</span>
                                      <br/>
                                      <small className={slot.available ? 'text-success' : 'text-danger'}>
                                        {slot.available ? 'Müsait' : 'Kapalı'}
                                      </small>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className="d-flex justify-content-end mt-3">
                      <button 
                        className="btn btn-primary" 
                        onClick={saveTimeSlots}
                        disabled={loading}
                      >
                        {loading ? 'Kaydediliyor...' : 'Kaydet'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'reviews' && (
                <div className="card shadow-sm">
                  <div className="card-header">
                    <h5 className="mb-0">Değerlendirmeler</h5>
                  </div>
                  <div className="card-body">
                    {reviews.length === 0 ? (
                      <p>Henüz değerlendirme bulunmuyor.</p>
                    ) : (
                      <div>
                        {reviews.map(review => (
                          <div key={review._id} className="card mb-3">
                            <div className="card-body">
                              <div className="d-flex justify-content-between mb-2">
                                <div>
                                  <h6 className="mb-0">{review.user?.name || 'Bilinmeyen Kullanıcı'}</h6>
                                  <small className="text-muted">
                                    {new Date(review.createdAt).toLocaleDateString('tr-TR')}
                                  </small>
                                </div>
                                <div>
                                  {[...Array(5)].map((_, i) => (
                                    <i key={i} className={`bi bi-star${i < review.rating ? '-fill' : ''} text-warning`}></i>
                                  ))}
                                </div>
                              </div>
                              <p>{review.comment}</p>
                              
                              {review.reply ? (
                                <div className="bg-light p-3 rounded">
                                  <h6 className="mb-1">Yanıtınız:</h6>
                                  <p className="mb-0">{review.reply}</p>
                                </div>
                              ) : (
                                <div>
                                  <textarea 
                                    className="form-control mb-2" 
                                    placeholder="Bu değerlendirmeye yanıt yazın..." 
                                    value={replyText[review._id] || ''}
                                    onChange={(e) => setReplyText({...replyText, [review._id]: e.target.value})}
                                  ></textarea>
                                  <button 
                                    className="btn btn-sm btn-primary"
                                    onClick={() => respondToReview(review._id, replyText[review._id])}
                                    disabled={!replyText[review._id]}
                                  >
                                    Yanıtla
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {activeTab === 'location' && (
                <div className="card shadow-sm">
                  <div className="card-header">
                    <h5 className="mb-0">Konum Bilgileri</h5>
                  </div>
                  <div className="card-body">
                    <div className="mb-3">
                      <label htmlFor="googleMapsLink" className="form-label">Google Maps Bağlantı Linki</label>
                      <div className="input-group">
                        <input 
                          type="text" 
                          className="form-control" 
                          id="googleMapsLink"
                          placeholder="Google Maps bağlantı kodunu yapıştırın"
                          value={googleMapsLink}
                          onChange={(e) => setGoogleMapsLink(e.target.value)}
                        />
                        <button 
                          className="btn btn-primary" 
                          onClick={saveGoogleMapsLink}
                          disabled={loading}
                        >
                          Kaydet
                        </button>
                      </div>
                      <small className="text-muted">
                        Google Maps'ten &lt;iframe&gt; kodunu kopyalayıp yapıştırabilirsiniz.
                      </small>
                    </div>
                    
                    {provider?.googleMapsLink ? (
                      <div className="mt-4">
                        <h6 className="mb-3">Mevcut Konum:</h6>
                        <div className="ratio ratio-16x9">
                          <iframe 
                            src={provider.googleMapsLink} 
                            width="600" 
                            height="450" 
                            style={{border:0}} 
                            allowFullScreen="" 
                            loading="lazy" 
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Location"
                          ></iframe>
                        </div>
                      </div>
                    ) : (
                      <div className="alert alert-info">
                        <i className="bi bi-info-circle me-2"></i>
                        Henüz konum bilgisi eklenmemiş. İşletmenizin konumunu eklemek için Google Maps bağlantısı ekleyin.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 