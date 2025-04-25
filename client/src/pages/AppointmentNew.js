import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AppointmentNew = () => {
  const { user, api } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { providerId, serviceId } = location.state || {};
  
  const [loading, setLoading] = useState(true);
  const [service, setService] = useState(null);
  const [provider, setProvider] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    notes: '',
    vehicleId: '',
    couponCode: ''
  });
  
  const [availableTimes, setAvailableTimes] = useState([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponData, setCouponData] = useState(null);
  const [discountedPrice, setDiscountedPrice] = useState(0);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (!providerId || !serviceId) {
          throw new Error('Servis veya sağlayıcı bilgisi eksik');
        }
        
        // Servis bilgilerini getir
        const serviceRes = await api.get(`/services/${serviceId}`);
        setService(serviceRes.data.data);
        setDiscountedPrice(serviceRes.data.data.price);
        
        // Sağlayıcı bilgilerini getir
        const providerRes = await api.get(`/providers/${providerId}`);
        setProvider(providerRes.data.data);
        
        // Kullanıcı araçlarını getir
        const vehiclesRes = await api.get('/vehicles');
        setVehicles(vehiclesRes.data.data);
        
        // Uygun zamanları getir (tarih seçildiğinde yapılacak)
      } catch (err) {
        setError(err.response?.data?.message || 'Bilgiler yüklenemedi');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [api, providerId, serviceId]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Tarih değişirse müsait saatleri getir
    if (name === 'date') {
      fetchAvailableTimes(value);
    }
    
    // Kupon kodu alanını temizlerse kupon verisini sıfırla
    if (name === 'couponCode' && !value) {
      setCouponApplied(false);
      setCouponData(null);
      setDiscountedPrice(service?.price || 0);
    }
  };
  
  const fetchAvailableTimes = async (date) => {
    try {
      const res = await api.get(`/appointments/available-times/${providerId}/${date}`);
      const availableTimes = res.data.data;
      setAvailableTimes(availableTimes);
      
      // Saatleri zaman dilimlerine ayırıyoruz
      // 09:00-12:00 arası sabah, 12:00-17:00 arası öğleden sonra, 17:00 sonrası akşam
      const morningSlots = availableTimes.filter(time => {
        const hour = parseInt(time.split(':')[0]);
        return hour >= 9 && hour < 12;
      });
      
      const afternoonSlots = availableTimes.filter(time => {
        const hour = parseInt(time.split(':')[0]);
        return hour >= 12 && hour < 17;
      });
      
      const eveningSlots = availableTimes.filter(time => {
        const hour = parseInt(time.split(':')[0]);
        return hour >= 17;
      });
      
      setAvailableTimeSlots([
        { name: 'Sabah', times: morningSlots },
        { name: 'Öğleden Sonra', times: afternoonSlots },
        { name: 'Akşam', times: eveningSlots }
      ]);
      
    } catch (err) {
      console.error('Uygun zamanlar yüklenemedi:', err);
    }
  };
  
  const handleTimeSelect = (time) => {
    setFormData({ ...formData, time });
  };
  
  const handleCouponApply = async () => {
    if (!formData.couponCode) {
      setError('Lütfen bir kupon kodu girin');
      return;
    }
    
    try {
      setError('');
      const res = await api.post('/coupons/validate', { 
        code: formData.couponCode,
        serviceId: serviceId,
        amount: service.price
      });
      
      if (res.data.success) {
        setCouponData(res.data.data);
        setCouponApplied(true);
        
        // İndirimli fiyatı hesapla
        const discount = res.data.data.discount;
        if (res.data.data.discountType === 'percentage') {
          const discountAmount = (service.price * discount) / 100;
          setDiscountedPrice(service.price - discountAmount);
        } else {
          setDiscountedPrice(service.price - discount);
        }
        
        setSuccess('Kupon başarıyla uygulandı');
      }
    } catch (err) {
      setCouponApplied(false);
      setCouponData(null);
      setDiscountedPrice(service?.price || 0);
      setError(err.response?.data?.message || 'Kupon uygulanamadı');
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      const appointmentData = {
        ...formData,
        provider: providerId,
        service: serviceId,
        couponCode: couponApplied ? formData.couponCode : null
      };
      
      const res = await api.post('/appointments', appointmentData);
      
      setSuccess('Randevunuz başarıyla oluşturuldu!');
      setTimeout(() => {
        navigate('/profile');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Randevu oluşturulurken bir hata oluştu');
      console.error(err);
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
  
  if (error && !service) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">{error}</div>
        <Link to="/providers" className="btn btn-primary">Servis Sağlayıcılarına Dön</Link>
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
              <Link to={`/providers/${providerId}`}>{provider.companyName}</Link>
            </li>
          )}
          <li className="breadcrumb-item active" aria-current="page">Randevu Al</li>
        </ol>
      </nav>
      
      <div className="row">
        <div className="col-md-8">
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-primary text-white">
              <h3 className="card-title h5 mb-0">Randevu Oluştur</h3>
            </div>
            <div className="card-body">
              {error && <div className="alert alert-danger">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}
              
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="date" className="form-label">Tarih</label>
                  <input
                    type="date"
                    className="form-control"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="time" className="form-label">Saat</label>
                  
                  {formData.date && availableTimeSlots.every(slot => slot.times.length === 0) ? (
                    <div className="alert alert-info">
                      <i className="bi bi-info-circle me-2"></i>
                      Seçilen tarihte uygun saat bulunmamaktadır. Lütfen başka bir tarih seçin.
                    </div>
                  ) : formData.date ? (
                    <div className="time-slots">
                      {availableTimeSlots.map((slot, index) => (
                        slot.times.length > 0 && (
                          <div key={index} className="time-slot-group mb-3">
                            <h6>{slot.name}</h6>
                            <div className="d-flex flex-wrap gap-2">
                              {slot.times.map((time, timeIndex) => (
                                <button
                                  key={timeIndex}
                                  type="button"
                                  className={`btn ${formData.time === time ? 'btn-primary' : 'btn-outline-secondary'}`}
                                  onClick={() => handleTimeSelect(time)}
                                >
                                  {time}
                                </button>
                              ))}
                            </div>
                          </div>
                        )
                      ))}
                    </div>
                  ) : (
                    <div className="alert alert-info">
                      <i className="bi bi-info-circle me-2"></i>
                      Lütfen önce bir tarih seçin
                    </div>
                  )}
                  
                  {/* Gizli input - form gönderilirken kullanılacak */}
                  <input 
                    type="hidden" 
                    name="time" 
                    value={formData.time} 
                    required 
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="vehicleId" className="form-label">Araç</label>
                  <select
                    className="form-select"
                    id="vehicleId"
                    name="vehicleId"
                    value={formData.vehicleId}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Araç seçin</option>
                    {vehicles.map(vehicle => (
                      <option key={vehicle._id} value={vehicle._id}>
                        {vehicle.brand} {vehicle.model} ({vehicle.plate})
                      </option>
                    ))}
                  </select>
                  {vehicles.length === 0 && (
                    <div className="form-text text-danger">
                      Randevu oluşturmak için önce <Link to="/profile">araç eklemelisiniz</Link>.
                    </div>
                  )}
                </div>
                
                <div className="mb-3">
                  <label htmlFor="couponCode" className="form-label">İndirim Kuponu (İsteğe Bağlı)</label>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      id="couponCode"
                      name="couponCode"
                      value={formData.couponCode}
                      onChange={handleInputChange}
                      disabled={couponApplied}
                      placeholder="Kupon kodunuz varsa girin"
                    />
                    <button 
                      type="button" 
                      className={`btn ${couponApplied ? 'btn-success' : 'btn-outline-primary'}`}
                      onClick={couponApplied ? () => {
                        setCouponApplied(false);
                        setCouponData(null);
                        setDiscountedPrice(service?.price || 0);
                      } : handleCouponApply}
                      disabled={!formData.couponCode && !couponApplied}
                    >
                      {couponApplied ? 'Kuponu Kaldır' : 'Uygula'}
                    </button>
                  </div>
                  {couponApplied && couponData && (
                    <div className="form-text text-success">
                      Kupon uygulandı: {couponData.discountType === 'percentage' ? `%${couponData.discount} indirim` : `${couponData.discount} TL indirim`}
                    </div>
                  )}
                </div>
                
                <div className="mb-4">
                  <label htmlFor="notes" className="form-label">Notlar (İsteğe Bağlı)</label>
                  <textarea
                    className="form-control"
                    id="notes"
                    name="notes"
                    rows="3"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Servis sağlayıcıya iletmek istediğiniz notlar..."
                  ></textarea>
                </div>
                
                <div className="d-grid gap-2">
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={!formData.date || !formData.time || !formData.vehicleId || vehicles.length === 0}
                  >
                    Randevu Oluştur
                  </button>
                  <Link to={`/providers/${providerId}`} className="btn btn-outline-secondary">
                    İptal
                  </Link>
                </div>
              </form>
            </div>
          </div>
          
          {/* Yorumlar Bölümü */}
          <div className="card shadow-sm">
            <div className="card-header bg-light">
              <h5 className="mb-0">Müşteri Yorumları</h5>
            </div>
            <div className="card-body">
              {provider?.reviews && provider.reviews.length > 0 ? (
                <div className="reviews">
                  {provider.reviews.slice(0, 3).map((review, index) => (
                    <div key={index} className="review mb-3 pb-3 border-bottom">
                      <div className="d-flex justify-content-between mb-2">
                        <div>
                          <h6 className="mb-0 fw-bold">{review.user?.name || 'Anonim'}</h6>
                          <div className="text-warning mb-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <i 
                                key={i} 
                                className={`bi ${i < review.rating ? 'bi-star-fill' : 'bi-star'}`}
                              ></i>
                            ))}
                            <span className="text-muted ms-2 small">
                              {new Date(review.createdAt).toLocaleDateString('tr-TR')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="mb-0">{review.text}</p>
                    </div>
                  ))}
                  {provider.reviews.length > 3 && (
                    <div className="text-center">
                      <Link to={`/providers/${providerId}`} className="btn btn-link">
                        Tüm Yorumları Gör ({provider.reviews.length})
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted">Henüz yorum yapılmamış.</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="col-md-4">
          {service && provider && (
            <>
              <div className="card shadow-sm mb-4">
                <div className="card-header bg-light">
                  <h4 className="card-title h5 mb-0">Randevu Detayları</h4>
                </div>
                <div className="card-body">
                  <h5 className="mb-3">{service.name}</h5>
                  <p><strong>Firma:</strong> {provider.companyName}</p>
                  <p><strong>Kategori:</strong> {service.category}</p>
                  
                  {couponApplied ? (
                    <div className="price-container mb-3">
                      <p className="mb-0"><strong>Fiyat:</strong> <span className="text-decoration-line-through text-muted">{service.price} TL</span></p>
                      <p className="mb-0"><strong>İndirimli Fiyat:</strong> <span className="text-success fw-bold">{discountedPrice} TL</span></p>
                      <p className="small text-success">Kupon ile {service.price - discountedPrice} TL tasarruf ediyorsunuz!</p>
                    </div>
                  ) : (
                    <p><strong>Fiyat:</strong> {service.price} TL</p>
                  )}
                  
                  <p><strong>Süre:</strong> {service.duration} dakika</p>
                  <p><strong>Açıklama:</strong> {service.description}</p>
                </div>
              </div>
              
              <div className="card shadow-sm">
                <div className="card-header bg-light">
                  <h4 className="card-title h5 mb-0">Firma Bilgileri</h4>
                </div>
                <div className="card-body">
                  <p><strong>Adres:</strong> {provider.address?.street}, {provider.address?.city}</p>
                  <p><strong>Telefon:</strong> {provider.contactPhone}</p>
                  
                  {provider.workingHours && (
                    <div className="working-hours mb-3">
                      <h6>Çalışma Saatleri</h6>
                      <ul className="list-unstyled">
                        {provider.workingHours.monday?.open && (
                          <li>Pazartesi: {provider.workingHours.monday.open} - {provider.workingHours.monday.close}</li>
                        )}
                        {provider.workingHours.tuesday?.open && (
                          <li>Salı: {provider.workingHours.tuesday.open} - {provider.workingHours.tuesday.close}</li>
                        )}
                        {provider.workingHours.wednesday?.open && (
                          <li>Çarşamba: {provider.workingHours.wednesday.open} - {provider.workingHours.wednesday.close}</li>
                        )}
                        {provider.workingHours.thursday?.open && (
                          <li>Perşembe: {provider.workingHours.thursday.open} - {provider.workingHours.thursday.close}</li>
                        )}
                        {provider.workingHours.friday?.open && (
                          <li>Cuma: {provider.workingHours.friday.open} - {provider.workingHours.friday.close}</li>
                        )}
                        {provider.workingHours.saturday?.open && (
                          <li>Cumartesi: {provider.workingHours.saturday.open} - {provider.workingHours.saturday.close}</li>
                        )}
                        {provider.workingHours.sunday?.open && (
                          <li>Pazar: {provider.workingHours.sunday.open} - {provider.workingHours.sunday.close}</li>
                        )}
                      </ul>
                    </div>
                  )}
                  
                  <div className="d-grid">
                    <a 
                      href={`https://www.google.com/maps?q=${provider.location?.coordinates[1]},${provider.location?.coordinates[0]}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn btn-outline-secondary btn-sm"
                    >
                      <i className="bi bi-geo-alt me-2"></i>Haritada Görüntüle
                    </a>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentNew; 