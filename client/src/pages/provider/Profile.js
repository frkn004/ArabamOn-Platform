import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

// Google Maps API'yi import ediyoruz
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const ProviderProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Maps özellikleri
  const mapRef = useRef(null);
  const mapContainerStyle = {
    width: '100%',
    height: '400px',
    borderRadius: '0.375rem'
  };

  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    companyName: '',
    address: {
      street: '',
      city: '',
      postalCode: ''
    },
    contactPhone: '',
    description: '',
    specialties: [],
    workingHours: {
      monday: { open: "09:00", close: "18:00" },
      tuesday: { open: "09:00", close: "18:00" },
      wednesday: { open: "09:00", close: "18:00" },
      thursday: { open: "09:00", close: "18:00" },
      friday: { open: "09:00", close: "18:00" },
      saturday: { open: "09:00", close: "13:00" },
      sunday: { open: "", close: "" }
    },
    location: {
      coordinates: [28.979530, 41.015137] // [longitude, latitude] - İstanbul varsayılan
    },
    bankDetails: {
      accountName: '',
      bankName: '',
      iban: ''
    },
    image: null,
    imagePreview: null
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    const fetchProvider = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/providers/me', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (res.data.success) {
          const providerData = res.data.data;
          setProvider(providerData);
          setFormData({
            companyName: providerData.companyName || '',
            address: {
              street: providerData.address?.street || '',
              city: providerData.address?.city || '',
              postalCode: providerData.address?.postalCode || ''
            },
            contactPhone: providerData.contactPhone || user?.phone || '',
            description: providerData.description || '',
            specialties: providerData.specialties || [],
            workingHours: providerData.workingHours || {
              monday: { open: "09:00", close: "18:00" },
              tuesday: { open: "09:00", close: "18:00" },
              wednesday: { open: "09:00", close: "18:00" },
              thursday: { open: "09:00", close: "18:00" },
              friday: { open: "09:00", close: "18:00" },
              saturday: { open: "09:00", close: "13:00" },
              sunday: { open: "", close: "" }
            },
            location: providerData.location || {
              coordinates: [28.979530, 41.015137]
            },
            bankDetails: providerData.bankDetails || {
              accountName: '',
              bankName: '',
              iban: ''
            },
            image: null,
            imagePreview: providerData.image || null
          });
        }
      } catch (err) {
        setError('Servis sağlayıcı bilgileri yüklenemedi');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProvider();
  }, [user]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else if (name === 'specialties') {
      const specialties = value.split(',').map(item => item.trim());
      setFormData({
        ...formData,
        specialties
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleWorkingHoursChange = (day, type, value) => {
    setFormData({
      ...formData,
      workingHours: {
        ...formData.workingHours,
        [day]: {
          ...formData.workingHours[day],
          [type]: value
        }
      }
    });
  };

  const handleLocationChange = (index, value) => {
    const newCoordinates = [...formData.location.coordinates];
    newCoordinates[index] = parseFloat(value);
    
    setFormData({
      ...formData,
      location: {
        ...formData.location,
        coordinates: newCoordinates
      }
    });
  };

  const handleBankDetailsChange = (field, value) => {
    setFormData({
      ...formData,
      bankDetails: {
        ...formData.bankDetails,
        [field]: value
      }
    });
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Resim dosyası 5MB\'dan küçük olmalıdır');
        return;
      }
      
      setFormData({
        ...formData,
        image: file,
        imagePreview: URL.createObjectURL(file)
      });
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      setError('');
      setSuccess('');
      
      const formDataToSend = new FormData();
      formDataToSend.append('companyName', formData.companyName);
      formDataToSend.append('address[street]', formData.address.street);
      formDataToSend.append('address[city]', formData.address.city);
      formDataToSend.append('address[postalCode]', formData.address.postalCode);
      formDataToSend.append('contactPhone', formData.contactPhone);
      formDataToSend.append('description', formData.description);
      
      // Çalışma saatleri
      for (const day in formData.workingHours) {
        formDataToSend.append(`workingHours[${day}][open]`, formData.workingHours[day].open);
        formDataToSend.append(`workingHours[${day}][close]`, formData.workingHours[day].close);
      }
      
      // Lokasyon bilgisi
      formDataToSend.append('location[coordinates][0]', formData.location.coordinates[0]);
      formDataToSend.append('location[coordinates][1]', formData.location.coordinates[1]);
      
      // Banka bilgileri
      formDataToSend.append('bankDetails[accountName]', formData.bankDetails.accountName);
      formDataToSend.append('bankDetails[bankName]', formData.bankDetails.bankName);
      formDataToSend.append('bankDetails[iban]', formData.bankDetails.iban);
      
      formData.specialties.forEach((specialty, index) => {
        formDataToSend.append(`specialties[${index}]`, specialty);
      });
      
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }
      
      const res = await axios.put(`/api/providers/${provider._id}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (res.data.success) {
        setSuccess('Profil başarıyla güncellendi');
        // Veriyi güncelle
        setProvider(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Profil güncellenemedi');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Harita üzerinde tıklanan noktayı yakalayan fonksiyon
  const handleMapClick = (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    
    setFormData({
      ...formData,
      location: {
        ...formData.location,
        coordinates: [lng, lat] // MongoDB'de [longitude, latitude] formatında saklanıyor
      }
    });
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
    <div className="container py-5">
      <div className="row">
        <div className="col-md-4">
          <div className="card mb-4">
            <div className="card-body text-center">
              <img
                src={formData.imagePreview || 'https://via.placeholder.com/200?text=Logo'}
                alt="Firma Logosu"
                className="rounded-circle img-fluid mb-3"
                style={{ width: '150px', height: '150px', objectFit: 'cover' }}
              />
              <h5 className="mb-1">{formData.companyName || 'Firma Adı'}</h5>
              <p className="text-muted">{formData.contactPhone || 'Telefon bilgisi yok'}</p>
              
              <div className="d-flex justify-content-center gap-2 mb-2">
                {formData.specialties.map((specialty, index) => (
                  <span key={index} className="badge bg-primary">{specialty}</span>
                ))}
              </div>
              
              <p className="text-muted small mb-0">
                {provider?.approved === true ? (
                  <span className="text-success">Onaylı Servis Sağlayıcı</span>
                ) : provider?.approved === false ? (
                  <span className="text-danger">Reddedildi</span>
                ) : (
                  <span className="text-warning">Onay Bekliyor</span>
                )}
              </p>
            </div>
          </div>
          
          <div className="list-group mb-4">
            <button 
              className={`list-group-item list-group-item-action ${activeTab === 'general' ? 'active' : ''}`}
              onClick={() => setActiveTab('general')}
            >
              <i className="bi bi-info-circle me-2"></i>Genel Bilgiler
            </button>
            <button 
              className={`list-group-item list-group-item-action ${activeTab === 'working-hours' ? 'active' : ''}`}
              onClick={() => setActiveTab('working-hours')}
            >
              <i className="bi bi-clock me-2"></i>Çalışma Saatleri
            </button>
            <button 
              className={`list-group-item list-group-item-action ${activeTab === 'location' ? 'active' : ''}`}
              onClick={() => setActiveTab('location')}
            >
              <i className="bi bi-geo-alt me-2"></i>Konum Bilgileri
            </button>
            <button 
              className={`list-group-item list-group-item-action ${activeTab === 'bank' ? 'active' : ''}`}
              onClick={() => setActiveTab('bank')}
            >
              <i className="bi bi-bank me-2"></i>Banka Bilgileri
            </button>
          </div>
        </div>
        
        <div className="col-md-8">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">Profil Bilgilerini Düzenle</h4>
            </div>
            <div className="card-body">
              {error && <div className="alert alert-danger">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}
              
              <form onSubmit={handleSubmit}>
                {activeTab === 'general' && (
                  <>
                    <div className="mb-3">
                      <label htmlFor="companyName" className="form-label">Firma Adı</label>
                      <input
                        type="text"
                        className="form-control"
                        id="companyName"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="contactPhone" className="form-label">İletişim Telefonu</label>
                      <input
                        type="tel"
                        className="form-control"
                        id="contactPhone"
                        name="contactPhone"
                        value={formData.contactPhone}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="specialties" className="form-label">Uzmanlık Alanları</label>
                      <input
                        type="text"
                        className="form-control"
                        id="specialties"
                        name="specialties"
                        value={formData.specialties.join(', ')}
                        onChange={handleChange}
                        placeholder="Uzmanlıkları virgülle ayırarak yazın"
                      />
                      <small className="text-muted">Örn: Motor Bakımı, Lastik Değişimi, Yağ Değişimi</small>
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="description" className="form-label">Firma Açıklaması</label>
                      <textarea
                        className="form-control"
                        id="description"
                        name="description"
                        rows="4"
                        value={formData.description}
                        onChange={handleChange}
                        required
                      ></textarea>
                    </div>
                    
                    <div className="mb-3">
                      <label className="form-label">Adres Bilgileri</label>
                      <div className="card">
                        <div className="card-body">
                          <div className="mb-3">
                            <label htmlFor="street" className="form-label">Sokak/Cadde ve Bina No</label>
                            <input
                              type="text"
                              className="form-control"
                              id="street"
                              name="address.street"
                              value={formData.address.street}
                              onChange={handleChange}
                              required
                            />
                          </div>
                          
                          <div className="row">
                            <div className="col-md-8 mb-3">
                              <label htmlFor="city" className="form-label">İlçe/Şehir</label>
                              <input
                                type="text"
                                className="form-control"
                                id="city"
                                name="address.city"
                                value={formData.address.city}
                                onChange={handleChange}
                                required
                              />
                            </div>
                            
                            <div className="col-md-4 mb-3">
                              <label htmlFor="postalCode" className="form-label">Posta Kodu</label>
                              <input
                                type="text"
                                className="form-control"
                                id="postalCode"
                                name="address.postalCode"
                                value={formData.address.postalCode}
                                onChange={handleChange}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="image" className="form-label">Firma Logosu</label>
                      <input
                        type="file"
                        className="form-control"
                        id="image"
                        name="image"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                      <small className="text-muted">
                        Maksimum 5MB, kare görsel tavsiye edilir
                      </small>
                      
                      {formData.imagePreview && (
                        <div className="mt-2">
                          <img
                            src={formData.imagePreview}
                            alt="Önizleme"
                            className="img-thumbnail mt-2"
                            style={{ maxHeight: '100px' }}
                          />
                        </div>
                      )}
                    </div>
                  </>
                )}
                
                {activeTab === 'working-hours' && (
                  <div className="mb-3">
                    <h5 className="mb-3">Çalışma Saatleri</h5>
                    <div className="card">
                      <div className="card-body">
                        <p className="small text-muted mb-3">
                          Servisinizin çalışma saatlerini belirleyin. Kapalı olduğunuz günleri boş bırakın.
                        </p>
                        
                        <div className="table-responsive">
                          <table className="table">
                            <thead>
                              <tr>
                                <th width="25%">Gün</th>
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
                                      value={formData.workingHours[day].open}
                                      onChange={(e) => handleWorkingHoursChange(day, 'open', e.target.value)}
                                    />
                                  </td>
                                  <td>
                                    <input
                                      type="time"
                                      className="form-control"
                                      value={formData.workingHours[day].close}
                                      onChange={(e) => handleWorkingHoursChange(day, 'close', e.target.value)}
                                    />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        
                        <div className="alert alert-info small mt-3">
                          <i className="bi bi-info-circle me-2"></i>
                          Müşterilere randevu oluşturabilecekleri zamanları göstermek için çalışma saatlerinizi doğru şekilde ayarlayın.
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {activeTab === 'location' && (
                  <div className="mb-3">
                    <h5 className="mb-3">Konum Bilgileri</h5>
                    <div className="card">
                      <div className="card-body">
                        <p className="small text-muted mb-3">
                          Servisinizin harita üzerindeki konumunu belirleyin. Bu bilgiler Google Maps üzerinde gösterim için kullanılacaktır.
                        </p>
                        
                        <div className="row mb-3">
                          <div className="col-md-6">
                            <label htmlFor="longitude" className="form-label">Boylam (Longitude)</label>
                            <input
                              type="number"
                              className="form-control"
                              id="longitude"
                              step="0.000001"
                              value={formData.location.coordinates[0]}
                              onChange={(e) => handleLocationChange(0, e.target.value)}
                            />
                          </div>
                          <div className="col-md-6">
                            <label htmlFor="latitude" className="form-label">Enlem (Latitude)</label>
                            <input
                              type="number"
                              className="form-control"
                              id="latitude"
                              step="0.000001"
                              value={formData.location.coordinates[1]}
                              onChange={(e) => handleLocationChange(1, e.target.value)}
                            />
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <label className="form-label">Harita Üzerinde Seçin</label>
                          <LoadScript googleMapsApiKey="AIzaSyBQBH7K2GfBSHxKzdGEbR5lIXtYlcXBHzE">
                            <GoogleMap
                              mapContainerStyle={mapContainerStyle}
                              center={{
                                lat: formData.location.coordinates[1],
                                lng: formData.location.coordinates[0]
                              }}
                              zoom={15}
                              onClick={handleMapClick}
                              ref={mapRef}
                            >
                              <Marker
                                position={{
                                  lat: formData.location.coordinates[1],
                                  lng: formData.location.coordinates[0]
                                }}
                                draggable={true}
                                onDragEnd={(event) => {
                                  const lat = event.latLng.lat();
                                  const lng = event.latLng.lng();
                                  
                                  setFormData({
                                    ...formData,
                                    location: {
                                      ...formData.location,
                                      coordinates: [lng, lat]
                                    }
                                  });
                                }}
                              />
                            </GoogleMap>
                          </LoadScript>
                        </div>
                        
                        <div className="alert alert-info small">
                          <i className="bi bi-lightbulb me-2"></i>
                          Harita üzerinde tıklayarak veya işaretçiyi sürükleyerek konum seçebilirsiniz.
                        </div>
                        
                        <a 
                          href={`https://www.google.com/maps?q=${formData.location.coordinates[1]},${formData.location.coordinates[0]}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="btn btn-outline-primary btn-sm"
                        >
                          <i className="bi bi-map me-2"></i>
                          Bu Koordinatları Google Maps'te Görüntüle
                        </a>
                      </div>
                    </div>
                  </div>
                )}
                
                {activeTab === 'bank' && (
                  <div className="mb-3">
                    <h5 className="mb-3">Banka Bilgileri</h5>
                    <div className="card">
                      <div className="card-body">
                        <p className="small text-muted mb-3">
                          Ödeme işlemleri için banka hesap bilgilerinizi giriniz.
                        </p>
                        
                        <div className="mb-3">
                          <label htmlFor="accountName" className="form-label">Hesap Sahibi</label>
                          <input
                            type="text"
                            className="form-control"
                            id="accountName"
                            value={formData.bankDetails.accountName}
                            onChange={(e) => handleBankDetailsChange('accountName', e.target.value)}
                          />
                        </div>
                        
                        <div className="mb-3">
                          <label htmlFor="bankName" className="form-label">Banka Adı</label>
                          <input
                            type="text"
                            className="form-control"
                            id="bankName"
                            value={formData.bankDetails.bankName}
                            onChange={(e) => handleBankDetailsChange('bankName', e.target.value)}
                          />
                        </div>
                        
                        <div className="mb-3">
                          <label htmlFor="iban" className="form-label">IBAN</label>
                          <input
                            type="text"
                            className="form-control"
                            id="iban"
                            value={formData.bankDetails.iban}
                            onChange={(e) => handleBankDetailsChange('iban', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => navigate('/provider/dashboard')}
                    disabled={submitting}
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Güncelleniyor...
                      </>
                    ) : 'Kaydet'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderProfile; 