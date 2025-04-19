import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const Profile = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    taxId: '',
    address: {
      street: '',
      city: '',
      postalCode: ''
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        taxId: user.taxId || '',
        address: {
          street: user.address?.street || '',
          city: user.address?.city || '',
          postalCode: user.address?.postalCode || ''
        }
      });
    }
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
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // TC Kimlik 11 haneli olmalı
    if (formData.taxId && formData.taxId.length !== 11) {
      setError('TC Kimlik numarası 11 haneli olmalıdır');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const res = await axios.put('/api/users/profile', formData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (res.data.success) {
        setUser(res.data.data);
        setSuccess('Profil başarıyla güncellendi');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Profil güncellenemedi');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h3 className="mb-0">Profil Bilgileri</h3>
            </div>
            <div className="card-body">
              {error && <div className="alert alert-danger">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}
              
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">Ad Soyad</label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">E-posta</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled
                  />
                  <small className="text-muted">E-posta adresi değiştirilemez</small>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="phone" className="form-label">Telefon</label>
                  <input
                    type="tel"
                    className="form-control"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="taxId" className="form-label">TC Kimlik No</label>
                  <input
                    type="text"
                    className="form-control"
                    id="taxId"
                    name="taxId"
                    value={formData.taxId}
                    onChange={handleChange}
                    maxLength="11"
                    required
                  />
                  <small className="text-muted">Randevu almak için TC kimlik numaranız gereklidir</small>
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
                      
                      <div className="row mb-3">
                        <div className="col-md-8">
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
                        
                        <div className="col-md-4">
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
                    onClick={() => navigate('/user/dashboard')}
                    disabled={loading}
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
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

export default Profile; 