import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const ServiceBooking = ({ service, provider }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [bookingData, setBookingData] = useState({
    date: '',
    time: '',
    notes: '',
    vehicle: '',
    couponCode: ''
  });
  
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [couponError, setCouponError] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discountedPrice, setDiscountedPrice] = useState(null);
  
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const res = await axios.get('/api/vehicles', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (res.data.success) {
          setVehicles(res.data.data);
        }
      } catch (err) {
        console.error('Araçlar yüklenirken hata:', err);
      }
    };
    
    if (user) {
      fetchVehicles();
    }
  }, [user]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setBookingData({ ...bookingData, [name]: value });
  };
  
  const validateUserInfo = () => {
    if (!user.taxId || user.taxId.length !== 11) {
      setError('Randevu almak için profilinizde geçerli bir TC kimlik numarası olmalıdır.');
      return false;
    }
    
    if (!user.address || !user.address.street || !user.address.city) {
      setError('Randevu almak için profilinizde adres bilgileri eksiksiz olmalıdır.');
      return false;
    }
    
    if (!user.phone) {
      setError('Randevu almak için profilinizde telefon numarası olmalıdır.');
      return false;
    }
    
    return true;
  };
  
  const validateBookingData = () => {
    if (!bookingData.date) {
      setError('Lütfen randevu tarihi seçin');
      return false;
    }
    
    if (!bookingData.time) {
      setError('Lütfen randevu saati seçin');
      return false;
    }
    
    if (!bookingData.vehicle) {
      setError('Lütfen araç seçin');
      return false;
    }
    
    // Seçilen tarih ve saat geçerli mi kontrol et
    const selectedDateTime = new Date(`${bookingData.date}T${bookingData.time}`);
    const now = new Date();
    
    if (selectedDateTime <= now) {
      setError('Geçmiş bir tarih veya saat seçilemez');
      return false;
    }
    
    return true;
  };
  
  const validateCoupon = async () => {
    if (!bookingData.couponCode.trim()) return true;
    
    try {
      setCouponError('');
      
      const res = await axios.post('/api/coupons/validate', {
        code: bookingData.couponCode,
        serviceId: service._id,
        amount: service.price
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (res.data.success) {
        const { coupon, discountAmount } = res.data.data;
        setAppliedCoupon(coupon);
        
        // İndirimli fiyatı hesapla
        let newPrice = service.price - discountAmount;
        if (newPrice < 0) newPrice = 0;
        
        setDiscountedPrice(newPrice);
        return true;
      }
    } catch (err) {
      setCouponError(err.response?.data?.message || 'Kupon kodu geçersiz');
      setAppliedCoupon(null);
      setDiscountedPrice(null);
      return false;
    }
  };
  
  const handleCouponApply = async (e) => {
    e.preventDefault();
    
    if (!bookingData.couponCode.trim()) {
      setCouponError('Lütfen bir kupon kodu girin');
      return;
    }
    
    await validateCoupon();
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Kullanıcı bilgileri doğrulama
    if (!validateUserInfo()) {
      navigate('/user/profile');
      return;
    }
    
    // Randevu bilgileri doğrulama
    if (!validateBookingData()) {
      return;
    }
    
    // Kupon kodu doğrulama (varsa)
    if (bookingData.couponCode.trim() && !await validateCoupon()) {
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const requestData = {
        service: service._id,
        provider: provider._id,
        date: bookingData.date,
        time: bookingData.time,
        notes: bookingData.notes,
        vehicle: bookingData.vehicle,
        couponCode: appliedCoupon ? bookingData.couponCode : null
      };
      
      const res = await axios.post('/api/appointments', requestData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (res.data.success) {
        setSuccess('Randevunuz başarıyla oluşturuldu');
        
        // Kupon kullanıldıysa redeem et
        if (appliedCoupon) {
          await axios.post('/api/coupons/redeem', {
            code: bookingData.couponCode
          }, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
        }
        
        // Form temizle
        setBookingData({
          date: '',
          time: '',
          notes: '',
          vehicle: '',
          couponCode: ''
        });
        
        setAppliedCoupon(null);
        setDiscountedPrice(null);
        
        // Kullanıcı paneline yönlendir
        setTimeout(() => {
          navigate('/user/dashboard');
        }, 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Randevu oluşturulamadı');
    } finally {
      setLoading(false);
    }
  };
  
  // Mevcut tarihin minimum değerini al
  const today = new Date().toISOString().split('T')[0];
  
  // Çalışma saatleri (08:00 - 18:00, 30dk aralıklarla)
  const timeSlots = [];
  for (let hour = 8; hour < 18; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const formattedHour = hour.toString().padStart(2, '0');
      const formattedMinute = minute.toString().padStart(2, '0');
      timeSlots.push(`${formattedHour}:${formattedMinute}`);
    }
  }
  
  return (
    <div className="card shadow-sm">
      <div className="card-header bg-primary text-white">
        <h5 className="mb-0">Randevu Oluştur</h5>
      </div>
      <div className="card-body">
        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6>Hizmet Bilgileri</h6>
              <span className="badge bg-primary">{service.duration} dakika</span>
            </div>
            <div className="card bg-light">
              <div className="card-body">
                <h5>{service.name}</h5>
                <p className="mb-1">{service.description}</p>
                
                <div className="mt-2 d-flex justify-content-between align-items-center">
                  {appliedCoupon ? (
                    <div>
                      <span className="text-decoration-line-through text-muted me-2">{service.price} TL</span>
                      <span className="fw-bold text-success">{discountedPrice} TL</span>
                      <span className="ms-2 badge bg-success">
                        {appliedCoupon.discountType === 'percentage' ? 
                          `%${appliedCoupon.discount} indirim` : 
                          `${appliedCoupon.discount} TL indirim`}
                      </span>
                    </div>
                  ) : (
                    <span className="fw-bold">{service.price} TL</span>
                  )}
                  <span className="badge bg-secondary">{service.category}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mb-3">
            <label htmlFor="vehicle" className="form-label">Araç Seçin</label>
            <select
              className="form-select"
              id="vehicle"
              name="vehicle"
              value={bookingData.vehicle}
              onChange={handleChange}
              required
            >
              <option value="">Araç Seçin</option>
              {vehicles.map(vehicle => (
                <option key={vehicle._id} value={vehicle._id}>
                  {vehicle.brand} {vehicle.model} - {vehicle.licensePlate}
                </option>
              ))}
            </select>
            <div className="form-text">
              <a href="/user/vehicles" className="link-primary">Yeni araç ekle</a>
            </div>
          </div>
          
          <div className="row mb-3">
            <div className="col-md-6">
              <label htmlFor="date" className="form-label">Tarih</label>
              <input
                type="date"
                className="form-control"
                id="date"
                name="date"
                min={today}
                value={bookingData.date}
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
                value={bookingData.time}
                onChange={handleChange}
                required
              >
                <option value="">Saat Seçin</option>
                {timeSlots.map(time => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="mb-3">
            <label htmlFor="notes" className="form-label">Notlar (İsteğe Bağlı)</label>
            <textarea
              className="form-control"
              id="notes"
              name="notes"
              rows="2"
              value={bookingData.notes}
              onChange={handleChange}
            ></textarea>
          </div>
          
          <div className="mb-3">
            <label htmlFor="couponCode" className="form-label">Kupon Kodu (İsteğe Bağlı)</label>
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                id="couponCode"
                name="couponCode"
                value={bookingData.couponCode}
                onChange={handleChange}
                placeholder="Kupon kodunuzu girin"
              />
              <button
                className="btn btn-outline-secondary"
                type="button"
                onClick={handleCouponApply}
              >
                Uygula
              </button>
            </div>
            {couponError && <div className="text-danger small mt-1">{couponError}</div>}
            {appliedCoupon && (
              <div className="text-success small mt-1">
                Kupon kodu uygulandı! {appliedCoupon.discountType === 'percentage' ? 
                  `%${appliedCoupon.discount} indirim` : 
                  `${appliedCoupon.discount} TL indirim`} kazandınız.
              </div>
            )}
          </div>
          
          <div className="mb-3">
            <div className="alert alert-info">
              <i className="bi bi-info-circle me-2"></i>
              Randevu alabilmek için profil bilgilerinizin (TC kimlik, adres ve telefon) eksiksiz olması gerekmektedir.
            </div>
          </div>
          
          <div className="d-grid">
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  İşleniyor...
                </>
              ) : 'Randevu Oluştur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServiceBooking; 