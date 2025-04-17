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
    vehicleId: ''
  });
  
  const [availableTimes, setAvailableTimes] = useState([]);
  
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
  };
  
  const fetchAvailableTimes = async (date) => {
    try {
      const res = await api.get(`/appointments/available-times/${providerId}/${date}`);
      setAvailableTimes(res.data.data);
    } catch (err) {
      console.error('Uygun zamanlar yüklenemedi:', err);
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
        service: serviceId
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
          <div className="card shadow-sm">
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
                  <select
                    className="form-select"
                    id="time"
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    required
                    disabled={!formData.date || availableTimes.length === 0}
                  >
                    <option value="">Saat seçin</option>
                    {availableTimes.map((time, index) => (
                      <option key={index} value={time}>{time}</option>
                    ))}
                  </select>
                  {formData.date && availableTimes.length === 0 && (
                    <div className="form-text text-danger">Seçilen tarihte uygun saat bulunmamaktadır.</div>
                  )}
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
                    <div className="form-text">
                      <Link to="/profile">Profil sayfanızdan araç ekleyebilirsiniz.</Link>
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
        </div>
        
        <div className="col-md-4">
          {service && provider && (
            <div className="card shadow-sm">
              <div className="card-header bg-light">
                <h4 className="card-title h5 mb-0">Randevu Detayları</h4>
              </div>
              <div className="card-body">
                <h5 className="mb-3">{service.name}</h5>
                <p><strong>Firma:</strong> {provider.companyName}</p>
                <p><strong>Kategori:</strong> {service.category}</p>
                <p><strong>Fiyat:</strong> {service.price} TL</p>
                <p><strong>Süre:</strong> {service.duration} dakika</p>
                <p><strong>Açıklama:</strong> {service.description}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentNew; 