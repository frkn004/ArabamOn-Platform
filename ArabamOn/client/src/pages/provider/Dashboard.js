import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

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
        }
        
        // Randevuları getir
        const appointmentsRes = await axios.get('/api/appointments', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (appointmentsRes.data.success) {
          setAppointments(appointmentsRes.data.data);
        }
        
        // Servisleri getir
        const servicesRes = await axios.get('/api/services?provider=me', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (servicesRes.data.success) {
          setServices(servicesRes.data.data);
        }
        
      } catch (err) {
        console.error('Veri yüklenirken hata:', err);
        setError(err.response?.data?.message || 'Veri yüklenemedi');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
      <h1 className="mb-4">Servis Sağlayıcı Paneli</h1>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <div className="row">
        <div className="col-md-3">
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">Atölye Bilgileri</h5>
              <p className="card-text">
                <strong>Firma Adı:</strong> {provider?.companyName || 'Belirtilmemiş'}<br />
                <strong>Adres:</strong> {provider?.address?.street ? `${provider.address.street}, ${provider.address.city}` : 'Belirtilmemiş'}<br />
                <strong>Telefon:</strong> {provider?.contactPhone || user?.phone || 'Belirtilmemiş'}<br />
              </p>
              <a href="/provider/profile" className="btn btn-sm btn-outline-primary">Profili Düzenle</a>
            </div>
          </div>
          
          <div className="card mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Hizmetlerim</h5>
              <button className="btn btn-primary btn-sm" onClick={() => setShowAddService(!showAddService)}>
                {showAddService ? 'İptal' : 'Yeni Ekle'}
              </button>
            </div>
            <div className="card-body">
              {showAddService && (
                <form onSubmit={handleServiceSubmit} className="mb-4">
                  <div className="mb-3">
                    <label htmlFor="category" className="form-label">Kategori</label>
                    <select
                      className="form-select"
                      id="category"
                      name="category"
                      value={selectedCategory}
                      onChange={handleCategoryChange}
                    >
                      <option value="">Kategori Seçin</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  
                  {selectedCategory && categoryServices.length > 0 && (
                    <div className="mb-3">
                      <label className="form-label">Hazır Hizmetler</label>
                      <div className="list-group">
                        {categoryServices.map(template => (
                          <button
                            key={template._id}
                            type="button"
                            className="list-group-item list-group-item-action"
                            onClick={() => selectTemplateService(template)}
                          >
                            <div className="d-flex justify-content-between">
                              <div>{template.name}</div>
                              <div>{template.price} TL</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">Hizmet Adı</label>
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      name="name"
                      value={newService.name}
                      onChange={handleServiceChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="description" className="form-label">Açıklama</label>
                    <textarea
                      className="form-control"
                      id="description"
                      name="description"
                      value={newService.description}
                      onChange={handleServiceChange}
                      required
                    ></textarea>
                  </div>
                  <div className="row mb-3">
                    <div className="col">
                      <label htmlFor="price" className="form-label">Fiyat (TL)</label>
                      <input
                        type="number"
                        className="form-control"
                        id="price"
                        name="price"
                        value={newService.price}
                        onChange={handleServiceChange}
                        required
                      />
                    </div>
                    <div className="col">
                      <label htmlFor="duration" className="form-label">Süre (dakika)</label>
                      <input
                        type="number"
                        className="form-control"
                        id="duration"
                        name="duration"
                        value={newService.duration}
                        onChange={handleServiceChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="serviceCategory" className="form-label">Kategori</label>
                    <select
                      className="form-select"
                      id="serviceCategory"
                      name="category"
                      value={newService.category}
                      onChange={handleServiceChange}
                      required
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  <button type="submit" className="btn btn-primary w-100">Ekle</button>
                </form>
              )}
            
              <ul className="list-group list-group-flush">
                {services.length === 0 ? (
                  <li className="list-group-item text-center py-3">Henüz bir hizmet eklenmemiş.</li>
                ) : (
                  services.map(service => (
                    <li key={service._id} className="list-group-item d-flex justify-content-between align-items-center">
                      <div>
                        <strong>{service.name}</strong>
                        <br />
                        <small>{service.price} TL</small>
                      </div>
                      <div>
                        <button className="btn btn-sm btn-outline-primary me-1">Düzenle</button>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        </div>
        
        <div className="col-md-9">
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">Randevularım</h5>
            </div>
            <div className="card-body">
              {appointments.length === 0 ? (
                <p className="text-center">Henüz bir randevunuz bulunmamaktadır.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Müşteri</th>
                        <th>Hizmet</th>
                        <th>Tarih</th>
                        <th>Saat</th>
                        <th>Durum</th>
                        <th>İşlemler</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.map(appointment => (
                        <tr key={appointment._id}>
                          <td>{appointment.user?.name || 'Belirtilmemiş'}</td>
                          <td>{appointment.service?.name || 'Belirtilmemiş'}</td>
                          <td>{new Date(appointment.date).toLocaleDateString('tr-TR')}</td>
                          <td>{appointment.time}</td>
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
                            <div className="btn-group" role="group">
                              {appointment.status === 'beklemede' && (
                                <>
                                  <button
                                    className="btn btn-sm btn-success"
                                    onClick={() => handleStatusChange(appointment._id, 'onaylandı')}
                                  >
                                    Onayla
                                  </button>
                                  <button
                                    className="btn btn-sm btn-danger"
                                    onClick={() => handleStatusChange(appointment._id, 'iptal edildi')}
                                  >
                                    İptal
                                  </button>
                                </>
                              )}
                              
                              {appointment.status === 'onaylandı' && (
                                <button
                                  className="btn btn-sm btn-info"
                                  onClick={() => handleStatusChange(appointment._id, 'tamamlandı')}
                                >
                                  Tamamla
                                </button>
                              )}
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
          
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Yorumlar</h5>
            </div>
            <div className="card-body">
              <p className="text-center">Henüz bir yorum bulunmamaktadır.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 