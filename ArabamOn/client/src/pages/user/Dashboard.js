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
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        if (activeTab === 'appointments') {
          const res = await api.get('/appointments/user');
          setAppointments(res.data.data);
        } else if (activeTab === 'vehicles') {
          const res = await api.get('/users/vehicles');
          setVehicles(res.data.data || []);
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
    setVehicleFormData({
      ...vehicleFormData,
      [name]: value
    });
  };
  
  const handleVehicleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setError('');
      setSuccess('');
      
      if (editingVehicle) {
        // Araç güncelleme
        const res = await api.put(`/users/vehicles/${editingVehicle._id}`, vehicleFormData);
        
        if (res.data.success) {
          setVehicles(vehicles.map(v => v._id === editingVehicle._id ? res.data.data : v));
          setSuccess('Araç başarıyla güncellendi');
        }
      } else {
        // Yeni araç ekleme
        const res = await api.post('/users/vehicles', vehicleFormData);
        
        if (res.data.success) {
          setVehicles([...vehicles, res.data.data]);
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
      brand: vehicle.brand,
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
                <div className="card shadow-sm">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Araçlarım</h5>
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => {
                        setVehicleFormData({
                          brand: '',
                          model: '',
                          year: '',
                          plate: '',
                          color: ''
                        });
                        setEditingVehicle(null);
                        setShowAddVehicleForm(!showAddVehicleForm);
                      }}
                    >
                      {showAddVehicleForm ? 'İptal' : 'Araç Ekle'}
                    </button>
                  </div>
                  <div className="card-body">
                    {showAddVehicleForm && (
                      <div className="mb-4">
                        <h6 className="mb-3">{editingVehicle ? 'Aracı Düzenle' : 'Yeni Araç Ekle'}</h6>
                        <form onSubmit={handleVehicleSubmit}>
                          <div className="row mb-3">
                            <div className="col-md-6">
                              <label htmlFor="brand" className="form-label">Marka</label>
                              <input
                                type="text"
                                className="form-control"
                                id="brand"
                                name="brand"
                                value={vehicleFormData.brand}
                                onChange={handleVehicleInputChange}
                                required
                              />
                            </div>
                            <div className="col-md-6">
                              <label htmlFor="model" className="form-label">Model</label>
                              <input
                                type="text"
                                className="form-control"
                                id="model"
                                name="model"
                                value={vehicleFormData.model}
                                onChange={handleVehicleInputChange}
                                required
                              />
                            </div>
                          </div>
                          
                          <div className="row mb-3">
                            <div className="col-md-4">
                              <label htmlFor="year" className="form-label">Yıl</label>
                              <input
                                type="number"
                                className="form-control"
                                id="year"
                                name="year"
                                value={vehicleFormData.year}
                                onChange={handleVehicleInputChange}
                                min="1990"
                                max={new Date().getFullYear()}
                                required
                              />
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
                              />
                            </div>
                            <div className="col-md-4">
                              <label htmlFor="color" className="form-label">Renk</label>
                              <input
                                type="text"
                                className="form-control"
                                id="color"
                                name="color"
                                value={vehicleFormData.color}
                                onChange={handleVehicleInputChange}
                              />
                            </div>
                          </div>
                          
                          <div className="d-flex justify-content-end">
                            <button 
                              type="button" 
                              className="btn btn-outline-secondary me-2"
                              onClick={() => {
                                setShowAddVehicleForm(false);
                                setEditingVehicle(null);
                              }}
                            >
                              İptal
                            </button>
                            <button type="submit" className="btn btn-primary">
                              {editingVehicle ? 'Güncelle' : 'Kaydet'}
                            </button>
                          </div>
                        </form>
                        <hr />
                      </div>
                    )}
                    
                    {vehicles.length === 0 ? (
                      <div className="text-center py-4">
                        <p>Henüz bir araç eklenmemiş.</p>
                        {!showAddVehicleForm && (
                          <button 
                            className="btn btn-primary"
                            onClick={() => setShowAddVehicleForm(true)}
                          >
                            Araç Ekle
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="row row-cols-1 row-cols-md-2 g-4">
                        {vehicles.map(vehicle => (
                          <div key={vehicle._id} className="col">
                            <div className="card h-100">
                              <div className="card-body">
                                <h5 className="card-title">
                                  {vehicle.brand} {vehicle.model}
                                </h5>
                                <ul className="list-unstyled">
                                  <li><strong>Plaka:</strong> {vehicle.plate}</li>
                                  <li><strong>Yıl:</strong> {vehicle.year}</li>
                                  {vehicle.color && (
                                    <li><strong>Renk:</strong> {vehicle.color}</li>
                                  )}
                                </ul>
                              </div>
                              <div className="card-footer bg-transparent">
                                <div className="d-flex justify-content-end gap-2">
                                  <button 
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() => handleEditVehicle(vehicle)}
                                  >
                                    <i className="bi bi-pencil"></i>
                                  </button>
                                  <button 
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => handleDeleteVehicle(vehicle._id)}
                                  >
                                    <i className="bi bi-trash"></i>
                                  </button>
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
              
              {/* Profilim Sekmesi */}
              {activeTab === 'profile' && (
                <div className="card shadow-sm">
                  <div className="card-header">
                    <h5 className="mb-0">Profil Bilgilerim</h5>
                  </div>
                  <div className="card-body">
                    {/* Profil düzenleme formu buraya eklenecek */}
                    <p>Profil bölümü yakında eklenecektir.</p>
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