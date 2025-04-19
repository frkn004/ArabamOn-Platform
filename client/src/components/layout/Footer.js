import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer py-5 bg-dark">
      <div className="container">
        <div className="row">
          <div className="col-md-4 mb-4 mb-md-0">
            <h5 className="text-white mb-3">ArabaMon</h5>
            <p className="text-muted">
              Araç bakımınız için güvenilir servis sağlayıcılarla buluşmanın en kolay yolu.
            </p>
            <div className="social-icons mt-3">
              <a href="#" className="text-decoration-none me-3">
                <i className="fab fa-facebook-f text-white"></i>
              </a>
              <a href="#" className="text-decoration-none me-3">
                <i className="fab fa-twitter text-white"></i>
              </a>
              <a href="#" className="text-decoration-none me-3">
                <i className="fab fa-instagram text-white"></i>
              </a>
              <a href="#" className="text-decoration-none">
                <i className="fab fa-linkedin-in text-white"></i>
              </a>
            </div>
          </div>
          <div className="col-md-2 mb-4 mb-md-0">
            <h6 className="text-white mb-3">Bağlantılar</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/" className="text-decoration-none text-muted">Ana Sayfa</Link>
              </li>
              <li className="mb-2">
                <Link to="/providers" className="text-decoration-none text-muted">Servis Sağlayıcılar</Link>
              </li>
              <li className="mb-2">
                <Link to="/services" className="text-decoration-none text-muted">Hizmetler</Link>
              </li>
              <li className="mb-2">
                <Link to="/register/provider" className="text-decoration-none text-muted">Firma Kaydı</Link>
              </li>
            </ul>
          </div>
          <div className="col-md-2 mb-4 mb-md-0">
            <h6 className="text-white mb-3">Hizmetler</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <a href="#" className="text-decoration-none text-muted">Araç Yıkama</a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-decoration-none text-muted">Teknik Muayene</a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-decoration-none text-muted">Lastik Değişimi</a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-decoration-none text-muted">Otopark</a>
              </li>
            </ul>
          </div>
          <div className="col-md-4">
            <h6 className="text-white mb-3">İletişim</h6>
            <ul className="list-unstyled">
              <li className="mb-2 text-muted">
                <i className="fas fa-map-marker-alt me-2"></i> İstanbul, Türkiye
              </li>
              <li className="mb-2 text-muted">
                <i className="fas fa-phone me-2"></i> +90 212 123 45 67
              </li>
              <li className="mb-2 text-muted">
                <i className="fas fa-envelope me-2"></i> info@arabamon.com
              </li>
            </ul>
          </div>
        </div>
        <hr className="my-4 bg-secondary" />
        <div className="text-center text-muted">
          <p className="mb-0">
            &copy; {new Date().getFullYear()} ArabaMon. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 