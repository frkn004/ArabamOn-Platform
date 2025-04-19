import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProviderRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    businessName: '',
    businessAddress: '',
    phone: '',
    specialties: '',
    description: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { registerProvider } = useAuth();
  const navigate = useNavigate();

  const { 
    name, email, password, confirmPassword, 
    businessName, businessAddress, phone, 
    specialties, description 
  } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      return setError('Şifreler eşleşmiyor');
    }

    try {
      setLoading(true);
      await registerProvider(
        name, email, password, 
        businessName, businessAddress, phone,
        specialties.split(',').map(item => item.trim()),
        description
      );
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Kayıt sırasında bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow">
            <div className="card-body p-4">
              <h2 className="text-center mb-4">Servis Sağlayıcı Kaydı</h2>
              
              {error && <div className="alert alert-danger">{error}</div>}
              
              <form onSubmit={handleSubmit}>
                <h5 className="border-bottom pb-2 mb-3">Kişisel Bilgiler</h5>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="name" className="form-label">İsim</label>
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      name="name"
                      value={name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="email" className="form-label">E-posta</label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      name="email"
                      value={email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="password" className="form-label">Şifre</label>
                    <input
                      type="password"
                      className="form-control"
                      id="password"
                      name="password"
                      value={password}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="confirmPassword" className="form-label">Şifreyi Onayla</label>
                    <input
                      type="password"
                      className="form-control"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={confirmPassword}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                
                <h5 className="border-bottom pb-2 mb-3 mt-4">İşletme Bilgileri</h5>
                <div className="mb-3">
                  <label htmlFor="businessName" className="form-label">İşletme Adı</label>
                  <input
                    type="text"
                    className="form-control"
                    id="businessName"
                    name="businessName"
                    value={businessName}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="businessAddress" className="form-label">İşletme Adresi</label>
                  <textarea
                    className="form-control"
                    id="businessAddress"
                    name="businessAddress"
                    value={businessAddress}
                    onChange={handleChange}
                    rows="3"
                    required
                  ></textarea>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="phone" className="form-label">Telefon</label>
                  <input
                    type="tel"
                    className="form-control"
                    id="phone"
                    name="phone"
                    value={phone}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="specialties" className="form-label">Uzmanlıklar (virgülle ayırın)</label>
                  <input
                    type="text"
                    className="form-control"
                    id="specialties"
                    name="specialties"
                    value={specialties}
                    onChange={handleChange}
                    placeholder="Örn: Motor Tamiri, Bakım, Kaporta, Boya"
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="description" className="form-label">İşletme Açıklaması</label>
                  <textarea
                    className="form-control"
                    id="description"
                    name="description"
                    value={description}
                    onChange={handleChange}
                    rows="4"
                    required
                  ></textarea>
                </div>
                
                <button 
                  type="submit" 
                  className="btn btn-primary w-100 mb-3"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  ) : null}
                  Kayıt Ol
                </button>
              </form>
              
              <div className="text-center mt-3">
                <p>Zaten hesabınız var mı? <Link to="/login">Giriş Yap</Link></p>
              </div>
              
              <div className="text-center mt-3">
                <p>Kullanıcı olarak kaydolmak mı istiyorsunuz? <Link to="/register">Kullanıcı Kaydı</Link></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderRegister; 