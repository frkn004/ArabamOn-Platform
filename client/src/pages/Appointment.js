import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Appointment = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, api } = useAuth();
  
  const [service, setService] = useState(null);
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [vehicles, setVehicles] = useState([]);
  
  // Kupon kodu için state
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponData, setCouponData] = useState(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState('');
  
  // Form için state
  const [formData, setFormData] = useState({
    service: id,
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    notes: '',
    vehicleInfo: ''
  });
  
  // Time slots
  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
  ];
  
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
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Servis bilgilerini getir
        const serviceRes = await fetch(`/api/services/${id}`);
        
        if (!serviceRes.ok) {
          throw new Error('Servis bilgileri yüklenemedi');
        }
        
        const serviceData = await serviceRes.json();
        setService(serviceData);
        
        // Servis sağlayıcı bilgilerini getir
        const providerRes = await fetch(`/api/providers/${serviceData.provider}`);
        
        if (!providerRes.ok) {
          throw new Error('Servis sağlayıcı bilgileri yüklenemedi');
        }
        
        const providerData = await providerRes.json();
        setProvider(providerData);
      } catch (err) {
        setError(err.message || 'Veri yüklenemedi');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  // Kullanıcı araçlarını getir
  useEffect(() => {
    const fetchVehicles = async () => {
      if (user) {
        try {
          const res = await api.get('/users/vehicles');
          if (res.data.success) {
            setVehicles(res.data.data);
          }
        } catch (err) {
          console.error('Araçlar yüklenemedi:', err);
        }
      }
    };
    
    fetchVehicles();
  }, [user, api]);
  
  // Kupon uygulama fonksiyonu
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Lütfen bir kupon kodu girin');
      return;
    }
    
    try {
      setApplyingCoupon(true);
      setCouponError('');
      
      const res = await api.post('/coupons/validate', {
        code: couponCode,
        serviceId: service._id,
        amount: service.price
      });
      
      if (res.data.success) {
        setCouponData(res.data.data);
        setCouponApplied(true);
        setSuccess('Kupon başarıyla uygulandı!');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setCouponError(err.response?.data?.message || 'Kupon kodu geçersiz');
      setCouponApplied(false);
      setCouponData(null);
    } finally {
      setApplyingCoupon(false);
    }
  };

  // Kuponu kaldırma fonksiyonu
  const handleRemoveCoupon = () => {
    setCouponCode('');
    setCouponApplied(false);
    setCouponData(null);
    setCouponError('');
  };

  // Fiyat hesaplama
  const calculatePrice = () => {
    if (!service) return 0;
    
    let price = service.price;
    
    if (couponApplied && couponData) {
      if (couponData.discountType === 'percentage') {
        price = price - (price * couponData.discount / 100);
      } else if (couponData.discountType === 'amount') {
        price = price - couponData.discount;
      } else if (couponData.discountType === 'gift_service') {
        price = 0; // Hediye hizmet
      }
    }
    
    return Math.max(0, price);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Form verilerine kupon kodunu ekle
      const appointmentData = {
        ...formData
      };
      
      if (couponApplied && couponData) {
        appointmentData.couponCode = couponCode;
      }
      
      const res = await api.post('/appointments', appointmentData);
      
      if (res.data.success) {
        setSuccess('Randevunuz başarıyla oluşturuldu!');
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Randevu oluşturulamadı');
    }
  };
  
  // Tarih seçimi için minimum değeri bugün olarak ayarla
  const today = new Date().toISOString().split('T')[0];
  
  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Yükleniyor...</span>
        </div>
      </div>
    );
  }
  
  if (success) {
    return (
      <div className="container py-5">
        <div className="card shadow-sm">
          <div className="card-body text-center py-5">
            <i className="bi bi-check-circle-fill text-success display-1 mb-3"></i>
            <h2>Randevunuz Başarıyla Oluşturuldu!</h2>
            <p className="lead">Randevu talebiniz servis sağlayıcıya iletilmiştir.</p>
            <p>Randevu detaylarınızı dashboard'dan takip edebilirsiniz.</p>
            <div className="mt-4">
              <Link to="/dashboard" className="btn btn-primary me-2">Dashboard'a Git</Link>
              <Link to="/" className="btn btn-outline-secondary">Ana Sayfaya Dön</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container py-5">
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/">Ana Sayfa</Link></li>
          <li className="breadcrumb-item"><Link to="/providers">Servis Sağlayıcıları</Link></li>
          {provider && (
            <li className="breadcrumb-item">
              <Link to={`/providers/${provider._id}`}>{provider.name}</Link>
            </li>
          )}
          <li className="breadcrumb-item active" aria-current="page">Randevu</li>
        </ol>
      </nav>
      
      <h1 className="mb-4">Randevu Oluştur</h1>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <div className="row">
        <div className="col-md-4 mb-4">
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <h5 className="card-title border-bottom pb-2">Hizmet Bilgileri</h5>
              
              {service && (
                <>
                  <h6>{service.name}</h6>
                  <p className="card-text">{service.description}</p>
                  <p className="card-text text-primary fw-bold mb-0">{service.price} TL</p>
                </>
              )}
            </div>
          </div>
          
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title border-bottom pb-2">Servis Sağlayıcı</h5>
              
              {provider && (
                <>
                  <h6>{provider.name}</h6>
                  <p className="card-text small mb-1">
                    <i className="bi bi-geo-alt-fill me-1"></i> {formatAddress(provider.address)}
                  </p>
                  <p className="card-text small mb-0">
                    <i className="bi bi-telephone-fill me-1"></i> {provider.phone}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="col-md-8">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title border-bottom pb-2 mb-4">Randevu Detayları</h5>
              
              <form onSubmit={handleSubmit}>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="date" className="form-label">Tarih</label>
                    <input
                      type="date"
                      className="form-control"
                      id="date"
                      name="date"
                      min={today}
                      value={formData.date}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="time" className="form-label">Saat</label>
                    <select
                      className="form-select"
                      id="time"
                      name="time"
                      value={formData.time}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Saat Seçin</option>
                      {timeSlots.map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <h6 className="mt-4 mb-3">Araç Bilgileri</h6>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="vehicleModel" className="form-label">Araç Modeli</label>
                    <input
                      type="text"
                      className="form-control"
                      id="vehicleModel"
                      name="vehicleModel"
                      value={formData.vehicleModel}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="vehicleYear" className="form-label">Model Yılı</label>
                    <input
                      type="number"
                      className="form-control"
                      id="vehicleYear"
                      name="vehicleYear"
                      value={formData.vehicleYear}
                      onChange={handleChange}
                      min="1950"
                      max={new Date().getFullYear()}
                      required
                    />
                  </div>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="vehiclePlate" className="form-label">Plaka</label>
                  <input
                    type="text"
                    className="form-control"
                    id="vehiclePlate"
                    name="vehiclePlate"
                    value={formData.vehiclePlate}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="notes" className="form-label">Notlar (İsteğe Bağlı)</label>
                  <textarea
                    className="form-control"
                    id="notes"
                    name="notes"
                    rows="3"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Servis sağlayıcıya iletmek istediğiniz ek bilgiler..."
                  ></textarea>
                </div>
                
                {/* Kupon Kodu Alanı */}
                <div className="mb-4">
                  <h5>Kupon Kodu</h5>
                  <div className="card bg-light">
                    <div className="card-body">
                      {couponApplied ? (
                        <div>
                          <div className="alert alert-success mb-3">
                            <div className="d-flex justify-content-between align-items-center">
                              <div>
                                <h5 className="mb-1">{couponData.code}</h5>
                                <p className="mb-0">
                                  {couponData.discountType === 'percentage' 
                                    ? `%${couponData.discount} indirim` 
                                    : couponData.discountType === 'amount' 
                                      ? `${couponData.discount} TL indirim` 
                                      : 'Hediye hizmet'}
                                </p>
                              </div>
                              <button 
                                type="button" 
                                className="btn btn-sm btn-outline-danger"
                                onClick={handleRemoveCoupon}
                              >
                                Kaldır
                              </button>
                            </div>
                          </div>
                          <div className="d-flex justify-content-between">
                            <span>Toplam:</span>
                            <span className="fw-bold">{calculatePrice()} TL</span>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="input-group">
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Kupon kodunuzu girin"
                              value={couponCode}
                              onChange={(e) => setCouponCode(e.target.value)}
                            />
                            <button 
                              className="btn btn-outline-primary" 
                              type="button"
                              onClick={handleApplyCoupon}
                              disabled={applyingCoupon}
                            >
                              {applyingCoupon ? (
                                <>
                                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                  Kontrol Ediliyor...
                                </>
                              ) : 'Uygula'}
                            </button>
                          </div>
                          {couponError && <div className="text-danger mt-2">{couponError}</div>}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="d-grid gap-2 mt-4">
                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    disabled={applyingCoupon}
                  >
                    {applyingCoupon ? (
                      <span>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        İşleniyor...
                      </span>
                    ) : 'Randevu Oluştur'}
                  </button>
                  <Link to={`/providers/${provider?._id}`} className="btn btn-outline-secondary">
                    İptal
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      
      {/* Hizmet detayları kartı */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Hizmet Detayları</h5>
              
              <div className="d-flex justify-content-between mb-3">
                <span>Hizmet:</span>
                <span className="fw-bold">{service?.name}</span>
              </div>
              
              <div className="d-flex justify-content-between mb-3">
                <span>Servis Sağlayıcı:</span>
                <span className="fw-bold">{provider?.companyName}</span>
              </div>
              
              <div className="d-flex justify-content-between mb-3">
                <span>Süre:</span>
                <span className="fw-bold">{service?.duration} dakika</span>
              </div>
              
              <hr />
              
              <div className="d-flex justify-content-between align-items-center">
                <span>Toplam Fiyat:</span>
                <div>
                  {couponApplied && couponData && (
                    <del className="text-muted me-2">{service?.price} TL</del>
                  )}
                  <span className="fw-bold fs-5 text-primary">{calculatePrice()} TL</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Appointment; 