import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useContext(AuthContext);

  const onLogout = () => {
    logout();
    navigate('/');
  };

  const guestLinks = (
    <>
      <li className="nav-item">
        <Link className="nav-link" to="/login">Giriş Yap</Link>
      </li>
      <li className="nav-item">
        <Link className="nav-link" to="/register">Üye Ol</Link>
      </li>
      <li className="nav-item">
        <Link className="nav-link" to="/register/provider">Firma Kaydı</Link>
      </li>
    </>
  );

  const userLinks = (
    <>
      <li className="nav-item">
        <Link className="nav-link" to="/dashboard">Hesabım</Link>
      </li>
      <li className="nav-item dropdown">
        <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
          {user && user.name}
        </a>
        <ul className="dropdown-menu">
          <li>
            <Link className="dropdown-item" to="/dashboard">Panelim</Link>
          </li>
          <li>
            <hr className="dropdown-divider" />
          </li>
          <li>
            <button onClick={onLogout} className="dropdown-item">
              Çıkış Yap
            </button>
          </li>
        </ul>
      </li>
    </>
  );

  const providerLinks = (
    <>
      <li className="nav-item">
        <Link className="nav-link" to="/provider/dashboard">Firma Paneli</Link>
      </li>
      <li className="nav-item">
        <Link className="nav-link" to="/provider/profile">
          <i className="bi bi-person-circle me-1"></i> Profil Düzenle
        </Link>
      </li>
      <li className="nav-item dropdown">
        <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
          {user && user.name}
        </a>
        <ul className="dropdown-menu">
          <li>
            <Link className="dropdown-item" to="/provider/dashboard">Firma Paneli</Link>
          </li>
          <li>
            <hr className="dropdown-divider" />
          </li>
          <li>
            <button onClick={onLogout} className="dropdown-item">
              Çıkış Yap
            </button>
          </li>
        </ul>
      </li>
    </>
  );

  const adminLinks = (
    <>
      <li className="nav-item">
        <Link className="nav-link" to="/admin/dashboard">Admin Paneli</Link>
      </li>
      <li className="nav-item dropdown">
        <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
          {user && user.name}
        </a>
        <ul className="dropdown-menu">
          <li>
            <Link className="dropdown-item" to="/admin/dashboard">Admin Paneli</Link>
          </li>
          <li>
            <hr className="dropdown-divider" />
          </li>
          <li>
            <button onClick={onLogout} className="dropdown-item">
              Çıkış Yap
            </button>
          </li>
        </ul>
      </li>
    </>
  );

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container">
        <Link className="navbar-brand" to="/">
          <i className="fas fa-car-alt me-2"></i>
          ArabaMon
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarMain"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarMain">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/">
                Ana Sayfa
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/providers">
                Servis Sağlayıcılar
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/services">
                Hizmetler
              </Link>
            </li>
          </ul>
          <ul className="navbar-nav ms-auto">
            {isAuthenticated ? (
              user && user.role === 'admin'
                ? adminLinks
                : user && user.role === 'provider'
                ? providerLinks
                : userLinks
            ) : (
              guestLinks
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 