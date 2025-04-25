import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const Dashboard = () => {
  const { user, api } = useAuth();
  const [activeTab, setActiveTab] = useState('appointments');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Araç ekleme için state
  const [vehicles, setVehicles] = useState([]);
  const [showAddVehicleForm, setShowAddVehicleForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [vehicleFormData, setVehicleFormData] = useState({
    brand: '',
    model: '',
    year: '',
    plate: '',
    color: ''
  });
  
  // Profil için state
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    identityNumber: '',
    address: ''
  });
  const [editingProfile, setEditingProfile] = useState(false);
  
  // Yorum için state
  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: ''
  });
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  
  // Marka ve model seçenekleri
  const [carBrands, setCarBrands] = useState([
    'Audi', 'BMW', 'Citroen', 'Dacia', 'Fiat', 'Ford', 'Honda', 'Hyundai', 
    'Kia', 'Mercedes', 'Nissan', 'Opel', 'Peugeot', 'Renault', 'Seat', 
    'Skoda', 'Toyota', 'Volkswagen', 'Volvo'
  ]);

  const [carModels, setCarModels] = useState({
    'Audi': ['A1', 'A3', 'A4', 'A5', 'A6', 'Q2', 'Q3', 'Q5', 'Q7'],
    'BMW': ['1 Serisi', '2 Serisi', '3 Serisi', '5 Serisi', 'X1', 'X3', 'X5'],
    'Citroen': ['C1', 'C3', 'C4', 'C5', 'Berlingo'],
    'Dacia': ['Duster', 'Logan', 'Sandero', 'Lodgy'],
    'Fiat': ['500', 'Egea', 'Panda', 'Doblo', 'Fiorino', 'Tipo'],
    'Ford': ['Fiesta', 'Focus', 'Mondeo', 'Kuga', 'Ranger', 'Transit'],
    'Honda': ['Civic', 'Jazz', 'CR-V', 'HR-V', 'Accord'],
    'Hyundai': ['i10', 'i20', 'i30', 'Tucson', 'Kona', 'Accent'],
    'Kia': ['Picanto', 'Rio', 'Ceed', 'Sportage', 'Stonic'],
    'Mercedes': ['A Serisi', 'B Serisi', 'C Serisi', 'E Serisi', 'GLA', 'GLC', 'GLE'],
    'Nissan': ['Micra', 'Juke', 'Qashqai', 'X-Trail', 'Navara'],
    'Opel': ['Corsa', 'Astra', 'Insignia', 'Mokka', 'Crossland'],
    'Peugeot': ['208', '308', '508', '2008', '3008', '5008'],
    'Renault': ['Clio', 'Megane', 'Captur', 'Kadjar', 'Symbol', 'Taliant'],
    'Seat': ['Ibiza', 'Leon', 'Arona', 'Ateca', 'Tarraco'],
    'Skoda': ['Fabia', 'Octavia', 'Superb', 'Kamiq', 'Karoq', 'Kodiaq'],
    'Toyota': ['Yaris', 'Corolla', 'C-HR', 'RAV4', 'Camry'],
    'Volkswagen': ['Polo', 'Golf', 'Passat', 'T-Roc', 'Tiguan', 'Caddy'],
    'Volvo': ['XC40', 'XC60', 'XC90', 'S60', 'S90', 'V40']
  });
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        if (activeTab === 'appointments') {
          const res = await api.get('/appointments/user');
          setAppointments(res.data.data);
        } else if (activeTab === 'vehicles') {
          const res = await api.get('/users/vehicles');
          if (res.data.success) {
            // Backend'den gelen vehicle verilerini frontend formatına dönüştür
            const formattedVehicles = res.data.data.map(vehicle => ({
              ...vehicle,
              brand: vehicle.make, // UI için make -> brand dönüşümü
              color: vehicle.color || 'Belirtilmemiş'
            }));
            setVehicles(formattedVehicles || []);
          }
        } else if (activeTab === 'profile') {
          const res = await api.get('/users/me');
          if (res.data.success) {
            const userData = res.data.data;
            setProfileData({
              name: userData.name || '',
              email: userData.email || '',
              phone: userData.phone || '',
              identityNumber: userData.identityNumber || '',
              address: userData.address || ''
            });
          }
        }
        
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Veri yüklenemedi');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [activeTab, api]);
  
  // Araç form işleyicileri
  const handleVehicleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Eğer marka değiştiyse, modeli sıfırla
    if (name === 'brand') {
      setVehicleFormData({
        ...vehicleFormData,
        [name]: value,
        model: ''
      });
    } else {
      setVehicleFormData({
        ...vehicleFormData,
        [name]: value
      });
    }
  };
  
  const handleVehicleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setError('');
      setSuccess('');
      
      // Backend'e gönderilecek verileri hazırla
      const vehicleData = {
        make: vehicleFormData.brand, // backend make bekliyor, frontend brand kullanıyor
        model: vehicleFormData.model,
        year: vehicleFormData.year,
        plate: vehicleFormData.plate,
        color: vehicleFormData.color // Renk bilgisini de ekle
      };
      
      if (editingVehicle) {
        // Araç güncelleme
        const res = await api.put(`/users/vehicles/${editingVehicle._id}`, vehicleData);
        
        if (res.data.success) {
          // Backend'den gelen verileri frontend formatına çevir
          const updatedVehicles = res.data.data.map(vehicle => ({
            ...vehicle,
            brand: vehicle.make, // UI için make -> brand dönüşümü
            color: vehicle.color || 'Belirtilmemiş'
          }));
          
          setVehicles(updatedVehicles);
          setSuccess('Araç başarıyla güncellendi');
        }
      } else {
        // Yeni araç ekleme
        const res = await api.post('/users/vehicles', vehicleData);
        
        if (res.data.success) {
          // Gelen tüm araçlar üzerinde format düzenlemesi
          const formattedVehicles = res.data.data.map(vehicle => ({
            ...vehicle,
            brand: vehicle.make, // UI için make -> brand dönüşümü
            color: vehicle.color || 'Belirtilmemiş'
          }));
          
          setVehicles(formattedVehicles);
          setSuccess('Araç başarıyla eklendi');
        }
      }
      
      // Formu sıfırla
      setVehicleFormData({
        brand: '',
        model: '',
        year: '',
        plate: '',
        color: ''
      });
      setShowAddVehicleForm(false);
      setEditingVehicle(null);
    } catch (err) {
      setError(err.response?.data?.message || 'İşlem başarısız');
    }
  };
  
  const handleEditVehicle = (vehicle) => {
    setVehicleFormData({
      brand: vehicle.brand || vehicle.make, // make veya brand'den birini kullan
      model: vehicle.model,
      year: vehicle.year,
      plate: vehicle.plate,
      color: vehicle.color || ''
    });
    setEditingVehicle(vehicle);
    setShowAddVehicleForm(true);
  };
  
  const handleDeleteVehicle = async (id) => {
    if (!window.confirm('Bu aracı silmek istediğinizden emin misiniz?')) {
      return;
    }
    
    try {
      const res = await api.delete(`/users/vehicles/${id}`);
      
      if (res.data.success) {
        setVehicles(vehicles.filter(v => v._id !== id));
        setSuccess('Araç başarıyla silindi');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Araç silinemedi');
    }
  };
  
  // Profil işlevleri
  const handleProfileInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value
    });
  };
  
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setError('');
      setSuccess('');
      
      const res = await api.put('/users/profile', profileData);
      
      if (res.data.success) {
        setSuccess('Profil bilgileriniz başarıyla güncellendi');
        setEditingProfile(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Profil güncellenemedi');
    }
  };
  
  // Randevu iptal işlevi
  const handleCancelAppointment = async (id) => {
    if (!window.confirm('Bu randevuyu iptal etmek istediğinizden emin misiniz?')) {
      return;
    }
    
    try {
      setError('');
      setSuccess('');
      
      const res = await api.put(`/appointments/${id}/status`, {
        status: 'iptal edildi'
      });
      
      if (res.data.success) {
        // Randevu listesini güncelle
        setAppointments(appointments.map(appointment => 
          appointment._id === id 
            ? { ...appointment, status: 'iptal edildi' } 
            : appointment
        ));
        setSuccess('Randevu başarıyla iptal edildi');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Randevu iptal edilemedi');
    }
  };
  
  // Yorum işlevleri
  const handleReviewInputChange = (e) => {
    const { name, value } = e.target;
    setReviewData({
      ...reviewData,
      [name]: name === 'rating' ? parseInt(value) : value
    });
  };
  
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedAppointment) return;
    
    try {
      setError('');
      setSuccess('');
      
      const res = await api.post(`/appointments/${selectedAppointment._id}/review`, reviewData);
      
      if (res.data.success) {
        setSuccess('Değerlendirmeniz başarıyla kaydedildi');
        
        // Formu kapat ve verileri sıfırla
        setShowReviewForm(false);
        setSelectedAppointment(null);
        setReviewData({
          rating: 5,
          comment: ''
        });
        
        // Randevu listesini güncelle
        const updatedAppointments = appointments.map(appointment => 
          appointment._id === selectedAppointment._id 
            ? { ...appointment, review: reviewData }
            : appointment
        );
        setAppointments(updatedAppointments);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Değerlendirme gönderilemedi');
    }
  };
  
  const handleOpenReviewForm = (appointment) => {
    setSelectedAppointment(appointment);
    
    // Eğer zaten bir değerlendirme yapılmışsa, o değerleri göster
    if (appointment.review) {
      setReviewData({
        rating: appointment.review.rating,
        comment: appointment.review.comment
      });
    } else {
      setReviewData({
        rating: 5,
        comment: ''
      });
    }
    
    setShowReviewForm(true);
  };
  
  return (
    <div className="container py-5">
      <h2 className="mb-4">Hoş Geldiniz, {user?.name}</h2>
      
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      
      <div className="row">
        <div className="col-md-3">
          <div className="card mb-4">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">Menü</h5>
            </div>
            <div className="list-group list-group-flush">
              <button
                className={`list-group-item list-group-item-action ${activeTab === 'appointments' ? 'active' : ''}`}
                onClick={() => setActiveTab('appointments')}
              >
                <i className="bi bi-calendar-check me-2"></i> Randevularım
              </button>
              <button
                className={`list-group-item list-group-item-action ${activeTab === 'vehicles' ? 'active' : ''}`}
                onClick={() => setActiveTab('vehicles')}
              >
                <i className="bi bi-car-front me-2"></i> Araçlarım
              </button>
              <button
                className={`list-group-item list-group-item-action ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                <i className="bi bi-person-circle me-2"></i> Profilim
              </button>
            </div>
          </div>
        </div>
        
        <div className="col-md-9">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Yükleniyor...</span>
              </div>
            </div>
          ) : (
            <>
              {/* Randevularım Sekmesi */}
              {activeTab === 'appointments' && (
                <div className="card shadow-sm">
                  <div className="card-header">
                    <h5 className="mb-0">Randevularım</h5>
                  </div>
                  <div className="card-body">
                    {appointments.length === 0 ? (
                      <div className="text-center py-4">
                        <p>Henüz bir randevunuz bulunmuyor.</p>
                        <a href="/services" className="btn btn-primary">Hizmet Ara</a>
                      </div>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-hover">
                          <thead>
                            <tr>
                              <th>Hizmet</th>
                              <th>Servis Sağlayıcı</th>
                              <th>Tarih/Saat</th>
                              <th>Durum</th>
                              <th>İşlemler</th>
                            </tr>
                          </thead>
                          <tbody>
                            {appointments.map(appointment => (
                              <tr key={appointment._id}>
                                <td>{appointment.service?.name}</td>
                                <td>{appointment.provider?.companyName}</td>
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
                                    {appointment.status === 'onaylandı' ? 'Onaylandı' : 
                                     appointment.status === 'beklemede' ? 'Beklemede' : 
                                     appointment.status === 'iptal edildi' ? 'İptal Edildi' : 
                                     appointment.status === 'tamamlandı' ? 'Tamamlandı' : appointment.status}
                                  </span>
                                </td>
                                <td>
                                  <button 
                                    className="btn btn-sm btn-outline-danger"
                                    disabled={appointment.status === 'iptal edildi' || appointment.status === 'tamamlandı'}
                                    onClick={() => handleCancelAppointment(appointment._id)}
                                  >
                                    İptal Et
                                  </button>
                                  
                                  {appointment.status === 'tamamlandı' && (
                                    <button 
                                      className="btn btn-sm btn-outline-primary ms-2"
                                      onClick={() => handleOpenReviewForm(appointment)}
                                      disabled={appointment.review}
                                    >
                                      {appointment.review ? 'Değerlendirildi' : 'Değerlendir'}
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
              
              {/* Araçlarım Sekmesi */}
              {activeTab === 'vehicles' && (
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2>Araçlarım</h2>
                    <button 
                      className="btn btn-primary" 
                      onClick={() => {
                        setVehicleFormData({
                          brand: '',
                          model: '',
                          year: '',
                          plate: '',
                          color: ''
                        });
                        setEditingVehicle(null);
                        setShowAddVehicleForm(true);
                      }}
                    >
                      <i className="bi bi-plus-circle me-2"></i>Yeni Araç Ekle
                    </button>
                  </div>
                  
                  {error && <div className="alert alert-danger">{error}</div>}
                  {success && <div className="alert alert-success">{success}</div>}
                  
                  {showAddVehicleForm && (
                    <div className="card mb-4 shadow-sm">
                      <div className="card-header bg-light">
                        <h5 className="mb-0">{editingVehicle ? 'Araç Düzenle' : 'Yeni Araç Ekle'}</h5>
                      </div>
                      <div className="card-body">
                        <form onSubmit={handleVehicleSubmit}>
                          <div className="row mb-3">
                            <div className="col-md-6">
                              <label htmlFor="brand" className="form-label">Marka</label>
                              <select
                                className="form-select"
                                id="brand"
                                name="brand"
                                value={vehicleFormData.brand}
                                onChange={handleVehicleInputChange}
                                required
                              >
                                <option value="">Marka seçin</option>
                                {carBrands.map(brand => (
                                  <option key={brand} value={brand}>{brand}</option>
                                ))}
                              </select>
                            </div>
                            <div className="col-md-6">
                              <label htmlFor="model" className="form-label">Model</label>
                              <select
                                className="form-select"
                                id="model"
                                name="model"
                                value={vehicleFormData.model}
                                onChange={handleVehicleInputChange}
                                required
                                disabled={!vehicleFormData.brand}
                              >
                                <option value="">Model seçin</option>
                                {vehicleFormData.brand && carModels[vehicleFormData.brand]?.map(model => (
                                  <option key={model} value={model}>{model}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                          
                          <div className="row mb-3">
                            <div className="col-md-4">
                              <label htmlFor="year" className="form-label">Yıl</label>
                              <select
                                className="form-select"
                                id="year"
                                name="year"
                                value={vehicleFormData.year}
                                onChange={handleVehicleInputChange}
                                required
                              >
                                <option value="">Yıl seçin</option>
                                {Array.from({ length: 35 }, (_, i) => new Date().getFullYear() - i).map(year => (
                                  <option key={year} value={year}>{year}</option>
                                ))}
                              </select>
                            </div>
                            <div className="col-md-4">
                              <label htmlFor="plate" className="form-label">Plaka</label>
                              <input
                                type="text"
                                className="form-control"
                                id="plate"
                                name="plate"
                                value={vehicleFormData.plate}
                                onChange={handleVehicleInputChange}
                                required
                                placeholder="34ABC123"
                              />
                            </div>
                            <div className="col-md-4">
                              <label htmlFor="color" className="form-label">Renk</label>
                              <select
                                className="form-select"
                                id="color"
                                name="color"
                                value={vehicleFormData.color}
                                onChange={handleVehicleInputChange}
                                required
                              >
                                <option value="">Renk seçin</option>
                                <option value="Beyaz">Beyaz</option>
                                <option value="Siyah">Siyah</option>
                                <option value="Gri">Gri</option>
                                <option value="Kırmızı">Kırmızı</option>
                                <option value="Mavi">Mavi</option>
                                <option value="Yeşil">Yeşil</option>
                                <option value="Sarı">Sarı</option>
                                <option value="Turuncu">Turuncu</option>
                                <option value="Kahverengi">Kahverengi</option>
                                <option value="Bej">Bej</option>
                                <option value="Bordo">Bordo</option>
                                <option value="Gümüş">Gümüş</option>
                                <option value="Lacivert">Lacivert</option>
                              </select>
                            </div>
                          </div>
                          
                          <div className="d-flex justify-content-end gap-2">
                            <button
                              type="button"
                              className="btn btn-secondary"
                              onClick={() => setShowAddVehicleForm(false)}
                            >
                              İptal
                            </button>
                            <button
                              type="submit"
                              className="btn btn-primary"
                            >
                              {editingVehicle ? 'Güncelle' : 'Kaydet'}
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}
                  
                  {loading ? (
                    <div className="text-center py-4">
                      <div className="spinner-border" role="status">
                        <span className="visually-hidden">Yükleniyor...</span>
                      </div>
                    </div>
                  ) : vehicles.length === 0 ? (
                    <div className="alert alert-info">
                      <i className="bi bi-info-circle me-2"></i>
                      Henüz kayıtlı aracınız bulunmuyor. Servis randevusu almak için araç eklemelisiniz.
                    </div>
                  ) : (
                    <div className="row">
                      {vehicles.map(vehicle => (
                        <div key={vehicle._id} className="col-md-6 col-lg-4 mb-4">
                          <div className="card h-100 shadow-sm">
                            <div className="card-header bg-light d-flex justify-content-between align-items-center">
                              <h5 className="mb-0 text-primary">{vehicle.plate}</h5>
                              <div className="dropdown">
                                <button className="btn btn-sm btn-outline-secondary" type="button" data-bs-toggle="dropdown">
                                  <i className="bi bi-three-dots-vertical"></i>
                                </button>
                                <ul className="dropdown-menu dropdown-menu-end">
                                  <li>
                                    <button 
                                      className="dropdown-item" 
                                      onClick={() => handleEditVehicle(vehicle)}
                                    >
                                      <i className="bi bi-pencil me-2"></i>Düzenle
                                    </button>
                                  </li>
                                  <li>
                                    <button 
                                      className="dropdown-item text-danger" 
                                      onClick={() => handleDeleteVehicle(vehicle._id)}
                                    >
                                      <i className="bi bi-trash me-2"></i>Sil
                                    </button>
                                  </li>
                                </ul>
                              </div>
                            </div>
                            <div className="card-body">
                              <div className="d-flex align-items-center mb-3">
                                <div className="bg-light rounded-circle p-3 me-3">
                                  <i className="bi bi-car-front fs-3 text-primary"></i>
                                </div>
                                <div>
                                  <h6 className="fw-bold mb-0">{vehicle.brand} {vehicle.model}</h6>
                                  <p className="text-muted small mb-0">{vehicle.year} - {vehicle.color}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              {/* Profilim Sekmesi */}
              {activeTab === 'profile' && (
                <div className="card shadow-sm">
                  <div className="card-header">
                    <h5 className="mb-0">Profil Bilgilerim</h5>
                  </div>
                  <div className="card-body">
                    {editingProfile ? (
                      <form onSubmit={handleProfileSubmit}>
                        <div className="mb-3">
                          <label htmlFor="name" className="form-label">Ad Soyad</label>
                          <input
                            type="text"
                            className="form-control"
                            id="name"
                            name="name"
                            value={profileData.name}
                            onChange={handleProfileInputChange}
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
                            value={profileData.email}
                            onChange={handleProfileInputChange}
                            required
                          />
                        </div>
                        <div className="mb-3">
                          <label htmlFor="phone" className="form-label">Telefon</label>
                          <input
                            type="tel"
                            className="form-control"
                            id="phone"
                            name="phone"
                            value={profileData.phone}
                            onChange={handleProfileInputChange}
                          />
                        </div>
                        <div className="mb-3">
                          <label htmlFor="identityNumber" className="form-label">TC Kimlik No</label>
                          <input
                            type="text"
                            className="form-control"
                            id="identityNumber"
                            name="identityNumber"
                            value={profileData.identityNumber}
                            onChange={handleProfileInputChange}
                          />
                        </div>
                        <div className="mb-3">
                          <label htmlFor="address" className="form-label">Adres</label>
                          <textarea
                            className="form-control"
                            id="address"
                            name="address"
                            rows="3"
                            value={profileData.address}
                            onChange={handleProfileInputChange}
                          ></textarea>
                        </div>
                        <div className="d-flex justify-content-end">
                          <button 
                            type="button" 
                            className="btn btn-secondary me-2"
                            onClick={() => setEditingProfile(false)}
                          >
                            İptal
                          </button>
                          <button type="submit" className="btn btn-primary">
                            Kaydet
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div>
                        <div className="row mb-3">
                          <div className="col-md-4 fw-bold">Ad Soyad:</div>
                          <div className="col-md-8">{profileData.name}</div>
                        </div>
                        <div className="row mb-3">
                          <div className="col-md-4 fw-bold">E-posta:</div>
                          <div className="col-md-8">{profileData.email}</div>
                        </div>
                        <div className="row mb-3">
                          <div className="col-md-4 fw-bold">Telefon:</div>
                          <div className="col-md-8">{profileData.phone || 'Belirtilmemiş'}</div>
                        </div>
                        <div className="row mb-3">
                          <div className="col-md-4 fw-bold">TC Kimlik No:</div>
                          <div className="col-md-8">{profileData.identityNumber || 'Belirtilmemiş'}</div>
                        </div>
                        <div className="row mb-3">
                          <div className="col-md-4 fw-bold">Adres:</div>
                          <div className="col-md-8">{profileData.address || 'Belirtilmemiş'}</div>
                        </div>
                        <div className="d-flex justify-content-end">
                          <button 
                            type="button" 
                            className="btn btn-primary"
                            onClick={() => setEditingProfile(true)}
                          >
                            Düzenle
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Değerlendirme Formu Modal */}
      {showReviewForm && selectedAppointment && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Hizmet Değerlendirme</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowReviewForm(false)}
                ></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleReviewSubmit}>
                  <div className="mb-3">
                    <p className="mb-1">
                      <strong>Hizmet:</strong> {selectedAppointment.service?.name}
                    </p>
                    <p className="mb-1">
                      <strong>Servis Sağlayıcı:</strong> {selectedAppointment.provider?.companyName}
                    </p>
                    <p className="mb-1">
                      <strong>Tarih:</strong> {new Date(selectedAppointment.date).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Puanınız</label>
                    <select 
                      className="form-select" 
                      name="rating" 
                      value={reviewData.rating}
                      onChange={handleReviewInputChange}
                      required
                    >
                      <option value="5">5 - Mükemmel</option>
                      <option value="4">4 - Çok İyi</option>
                      <option value="3">3 - İyi</option>
                      <option value="2">2 - Kötü</option>
                      <option value="1">1 - Çok Kötü</option>
                    </select>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Yorumunuz</label>
                    <textarea 
                      className="form-control" 
                      name="comment"
                      value={reviewData.comment}
                      onChange={handleReviewInputChange}
                      rows="3"
                      placeholder="Hizmet hakkında düşüncelerinizi paylaşın..."
                      required
                    ></textarea>
                  </div>
                  
                  <div className="d-flex justify-content-end">
                    <button 
                      type="button" 
                      className="btn btn-secondary me-2"
                      onClick={() => setShowReviewForm(false)}
                    >
                      İptal
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                    >
                      Değerlendirmeyi Gönder
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 