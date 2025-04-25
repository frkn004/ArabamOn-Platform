import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, isAuthenticated, error, clearError } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Zaten giriş yapmışsa
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const { email, password } = formData;

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Hata mesajını temizle
    if (formErrors[e.target.name]) {
      setFormErrors({ ...formErrors, [e.target.name]: '' });
    }
  };

  const validateForm = () => {
    let errors = {};
    let isValid = true;

    if (!email) {
      errors.email = 'Email adresi gereklidir';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Email adresi geçerli değil';
      isValid = false;
    }

    if (!password) {
      errors.password = 'Şifre gereklidir';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const onSubmit = async e => {
    e.preventDefault();
    clearError();

    if (validateForm()) {
      setIsSubmitting(true);
      try {
        await login(email, password);
        // Başarılı giriş işlemi sonrası navigate fonksiyonu kullanılmaz
        // çünkü useEffect hook'u ile izlenen isAuthenticated değiştiğinde otomatik yönlendirme yapılır
      } catch (err) {
        console.error('Login error:', err);
        setIsSubmitting(false);
      }
    }
  };

  // Demo kullanıcılar için giriş fonksiyonları
  const loginAsAdmin = async () => {
    clearError();
    setIsSubmitting(true);
    try {
      await login('admin@arabamon.com', 'admin123');
    } catch (err) {
      console.error('Admin login error:', err);
      setIsSubmitting(false);
    }
  };

  const loginAsUser = async () => {
    clearError();
    setIsSubmitting(true);
    try {
      await login('user@arabamon.com', 'user123');
    } catch (err) {
      console.error('User login error:', err);
      setIsSubmitting(false);
    }
  };

  const loginAsProvider = async () => {
    clearError();
    setIsSubmitting(true);
    try {
      await login('provider@arabamon.com', 'provider123');
    } catch (err) {
      console.error('Provider login error:', err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow-sm">
            <div className="card-body p-4 p-md-5">
              <div className="text-center mb-4">
                <h2 className="fw-bold mb-2">Giriş Yap</h2>
                <p className="text-muted">Hesabınıza giriş yapın</p>
              </div>

              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              <form onSubmit={onSubmit}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email Adresi
                  </label>
                  <input
                    type="email"
                    className={`form-control ${formErrors.email ? 'is-invalid' : ''}`}
                    id="email"
                    name="email"
                    value={email}
                    onChange={onChange}
                    placeholder="Email adresinizi girin"
                  />
                  {formErrors.email && <div className="invalid-feedback">{formErrors.email}</div>}
                </div>

                <div className="mb-4">
                  <label htmlFor="password" className="form-label">
                    Şifre
                  </label>
                  <input
                    type="password"
                    className={`form-control ${formErrors.password ? 'is-invalid' : ''}`}
                    id="password"
                    name="password"
                    value={password}
                    onChange={onChange}
                    placeholder="Şifrenizi girin"
                  />
                  {formErrors.password && <div className="invalid-feedback">{formErrors.password}</div>}
                </div>

                <div className="d-grid">
                  <button
                    type="submit"
                    className="btn btn-primary py-2"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Giriş Yapılıyor...
                      </>
                    ) : (
                      'Giriş Yap'
                    )}
                  </button>
                </div>
              </form>

              {/* Demo giriş butonları */}
              <div className="mt-4">
                <p className="text-center mb-2">
                  <small className="text-muted">Hızlı Giriş (Demo Hesaplar)</small>
                </p>
                <div className="d-flex gap-2 justify-content-center">
                  <button
                    onClick={loginAsAdmin}
                    className="btn btn-sm btn-outline-danger"
                    disabled={isSubmitting}
                  >
                    Admin Girişi
                  </button>
                  <button
                    onClick={loginAsUser}
                    className="btn btn-sm btn-outline-success"
                    disabled={isSubmitting}
                  >
                    Kullanıcı Girişi
                  </button>
                  <button
                    onClick={loginAsProvider}
                    className="btn btn-sm btn-outline-primary"
                    disabled={isSubmitting}
                  >
                    Firma Girişi
                  </button>
                </div>
              </div>

              <div className="text-center mt-4">
                <p className="mb-0">
                  Hesabınız yok mu?{' '}
                  <Link to="/register" className="text-decoration-none">
                    Üye Olun
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 