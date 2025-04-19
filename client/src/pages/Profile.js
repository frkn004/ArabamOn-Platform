import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Profile = () => {
  const { user, api, logout } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Profil düzenleme state'i
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    identityNumber: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'Türkiye'
    }
  });
  
  // Yeni araç ekleme state'i
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    brand: '',
    model: '',
    year: '',
    plate: '',
    color: ''
  });

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        // Kullanıcı randevularını getir
        const appointmentsRes = await api.get('/appointments/me');
        setAppointments(appointmentsRes.data.data);
        
        // Kullanıcı araçlarını getir
        const vehiclesRes = await api.get('/vehicles');
        setVehicles(vehiclesRes.data.data);
        
        // Profil bilgilerini ayarla
        if (user) {
          setProfileData({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            identityNumber: user.identityNumber || '',
            address: user.address || {
              street: '',
              city: '',
              state: '',
              zipCode: '',
              country: 'Türkiye'
            }
          });
        }
      } catch (err) {
        setError('Veriler yüklenirken bir hata oluştu');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchUserData();
    }
  }, [api, user]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    
    // Adres alanları için
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setProfileData({
        ...profileData,
        [parent]: {
          ...profileData[parent],
          [child]: value
        }
      });
    } else {
      setProfileData({ ...profileData, [name]: value });
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put('/auth/me/update', profileData);
      // Profil güncellendi bilgisini göster
      alert('Profil bilgileriniz güncellendi');
      setIsEditing(false);
    } catch (err) {
      setError('Profil güncellenirken bir hata oluştu');
      console.error(err);
    }
  };
  
  const handleVehicleChange = (e) => {
    const { name, value } = e.target;
    setNewVehicle({ ...newVehicle, [name]: value });
  };
  
  const handleAddVehicle = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/vehicles', newVehicle);
      // Yeni aracı listeye ekle
      setVehicles([...vehicles, res.data.data]);
      // Formu sıfırla
      setNewVehicle({
        brand: '',
        model: '',
        year: '',
        plate: '',
        color: ''
      });
      setShowAddVehicle(false);
    } catch (err) {
      setError('Araç eklenirken bir hata oluştu');
      console.error(err);
    }
  };

  if (isLoading) {
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
        <div className="col-md-4 mb-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="card-title mb-0">Profil Bilgileri</h5>
                <button 
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? 'İptal' : 'Düzenle'}
                </button>
              </div>
              
              {isEditing ? (
                <form onSubmit={handleProfileSubmit}>
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">Ad Soyad</label>
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      name="name"
                      value={profileData.name}
                      onChange={handleProfileChange}
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
                      onChange={handleProfileChange}
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
                      onChange={handleProfileChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="identityNumber" className="form-label">TC Kimlik No</label>
                    <input
                      type="text"
                      className="form-control"
                      id="identityNumber"
                      name="identityNumber"
                      value={profileData.identityNumber || ''}
                      onChange={handleProfileChange}
                      maxLength={11}
                      placeholder="Örn: 12345678900"
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="street" className="form-label">Adres</label>
                    <input
                      type="text"
                      className="form-control mb-2"
                      id="street"
                      name="address.street"
                      value={profileData.address?.street || ''}
                      onChange={handleProfileChange}
                      placeholder="Sokak, Mahalle, Bina No"
                    />
                    <div className="row">
                      <div className="col">
                        <input
                          type="text"
                          className="form-control"
                          name="address.city"
                          value={profileData.address?.city || ''}
                          onChange={handleProfileChange}
                          placeholder="İl"
                        />
                      </div>
                      <div className="col">
                        <input
                          type="text"
                          className="form-control"
                          name="address.state"
                          value={profileData.address?.state || ''}
                          onChange={handleProfileChange}
                          placeholder="İlçe"
                        />
                      </div>
                    </div>
                    <input
                      type="text"
                      className="form-control mt-2"
                      name="address.zipCode"
                      value={profileData.address?.zipCode || ''}
                      onChange={handleProfileChange}
                      placeholder="Posta Kodu"
                    />
                  </div>
                  <button type="submit" className="btn btn-primary w-100">
                    Kaydet
                  </button>
                </form>
              ) : (
                <div>
                  <p><strong>Ad Soyad:</strong> {user?.name}</p>
                  <p><strong>E-posta:</strong> {user?.email}</p>
                  <p><strong>Telefon:</strong> {user?.phone || 'Belirtilmemiş'}</p>
                  <p><strong>TC Kimlik No:</strong> {user?.identityNumber || 'Belirtilmemiş'}</p>
                  <p><strong>Adres:</strong> {user?.address?.street ? 
                    `${user.address.street}, ${user.address.state} ${user.address.city}` : 
                    'Belirtilmemiş'}</p>
                  <p><strong>Üyelik Tipi:</strong> 
                    <span className={`badge ${
                      user?.role === 'admin' ? 'bg-danger' : 
                      user?.role === 'provider' ? 'bg-success' : 'bg-primary'
                    } ms-2`}>
                      {user?.role === 'admin' ? 'Admin' : 
                       user?.role === 'provider' ? 'Servis Sağlayıcı' : 'Kullanıcı'}
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <div className="card shadow-sm mt-4">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="card-title mb-0">Araçlarım</h5>
                <button 
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => setShowAddVehicle(!showAddVehicle)}
                >
                  {showAddVehicle ? 'İptal' : 'Araç Ekle'}
                </button>
              </div>
              
              {showAddVehicle && (
                <form onSubmit={handleAddVehicle} className="mb-4">
                  <div className="mb-2">
                    <label htmlFor="brand" className="form-label">Marka</label>
                    <input
                      type="text"
                      className="form-control"
                      id="brand"
                      name="brand"
                      value={newVehicle.brand}
                      onChange={handleVehicleChange}
                      required
                    />
                  </div>
                  <div className="mb-2">
                    <label htmlFor="model" className="form-label">Model</label>
                    <input
                      type="text"
                      className="form-control"
                      id="model"
                      name="model"
                      value={newVehicle.model}
                      onChange={handleVehicleChange}
                      required
                    />
                  </div>
                  <div className="mb-2">
                    <label htmlFor="year" className="form-label">Yıl</label>
                    <input
                      type="number"
                      className="form-control"
                      id="year"
                      name="year"
                      value={newVehicle.year}
                      onChange={handleVehicleChange}
                      required
                    />
                  </div>
                  <div className="mb-2">
                    <label htmlFor="plate" className="form-label">Plaka</label>
                    <input
                      type="text"
                      className="form-control"
                      id="plate"
                      name="plate"
                      value={newVehicle.plate}
                      onChange={handleVehicleChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="color" className="form-label">Renk</label>
                    <input
                      type="text"
                      className="form-control"
                      id="color"
                      name="color"
                      value={newVehicle.color}
                      onChange={handleVehicleChange}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary w-100">
                    Araç Ekle
                  </button>
                </form>
              )}
              
              {vehicles.length === 0 ? (
                <div className="text-center py-3">
                  <p className="text-muted mb-0">Henüz bir araç eklenmemiş.</p>
                </div>
              ) : (
                <div className="list-group">
                  {vehicles.map(vehicle => (
                    <div key={vehicle._id} className="list-group-item list-group-item-action">
                      <div className="d-flex w-100 justify-content-between">
                        <h6 className="mb-1">{vehicle.brand} {vehicle.model}</h6>
                        <small>{vehicle.year}</small>
                      </div>
                      <p className="mb-1">{vehicle.plate}</p>
                      <small className="text-muted">Renk: {vehicle.color}</small>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="col-md-8">
          <div className="card shadow-sm">
            <div className="card-header">
              <h5 className="mb-0">Randevularım</h5>
            </div>
            <div className="card-body">
              {appointments.length === 0 ? (
                <div className="text-center py-4">
                  <p className="mb-3">Henüz bir randevunuz bulunmuyor.</p>
                  <Link to="/providers" className="btn btn-primary">
                    Servis Sağlayıcıları Keşfet
                  </Link>
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
                          <td>
                            {appointment.service?.name || 'Hizmet bilgisi yok'}
                          </td>
                          <td>
                            <Link to={`/providers/${appointment.provider?._id}`}>
                              {appointment.provider?.companyName || 'Firma bilgisi yok'}
                            </Link>
                          </td>
                          <td>
                            {new Date(appointment.date).toLocaleDateString('tr-TR')} {appointment.time}
                          </td>
                          <td>
                            <span className={`badge ${
                              appointment.status === 'onaylandı' ? 'bg-success' :
                              appointment.status === 'beklemede' ? 'bg-warning' :
                              appointment.status === 'tamamlandı' ? 'bg-info' :
                              appointment.status === 'iptal edildi' ? 'bg-danger' : 'bg-secondary'
                            }`}>
                              {appointment.status === 'onaylandı' ? 'Onaylandı' :
                               appointment.status === 'beklemede' ? 'Beklemede' :
                               appointment.status === 'tamamlandı' ? 'Tamamlandı' :
                               appointment.status === 'iptal edildi' ? 'İptal Edildi' : 
                               appointment.status}
                            </span>
                          </td>
                          <td>
                            <div className="btn-group" role="group">
                              <Link 
                                to={`/appointments/${appointment._id}/detail`} 
                                className="btn btn-sm btn-outline-primary"
                              >
                                Detay
                              </Link>
                              {appointment.status === 'beklemede' && (
                                <button 
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => {/* İptal işlemi */}}
                                >
                                  İptal
                                </button>
                              )}
                              {appointment.status === 'tamamlandı' && !appointment.review && (
                                <Link 
                                  to={`/providers/${appointment.provider?._id}/review`}
                                  className="btn btn-sm btn-outline-success"
                                >
                                  Değerlendir
                                </Link>
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
        </div>
      </div>
    </div>
  );
};

export default Profile; 