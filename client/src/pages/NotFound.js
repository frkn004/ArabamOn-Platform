import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="container py-5 text-center">
      <div className="py-5">
        <h1 className="display-1">404</h1>
        <h2 className="mb-4">Sayfa Bulunamadı</h2>
        <p className="lead mb-4">Aradığınız sayfa mevcut değil veya taşınmış olabilir.</p>
        <Link to="/" className="btn btn-primary">Ana Sayfaya Dön</Link>
      </div>
    </div>
  );
};

export default NotFound; 