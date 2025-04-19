import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const ProviderProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
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
    image: null,
    imagePreview: null
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
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
                    rows="3"
                    value={formData.description}
                    onChange={handleChange}
                  ></textarea>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="image" className="form-label">Firma Logosu</label>
                  <input
                    type="file"
                    className="form-control"
                    id="image"
                    name="image"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  <small className="text-muted">Maksimum dosya boyutu: 5MB</small>
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