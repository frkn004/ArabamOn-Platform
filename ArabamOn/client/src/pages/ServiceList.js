import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const ServiceList = () => {
  const location = useLocation();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  // Sabit kategori listesi
  const categories = [
    'Araç Yıkama',
    'Teknik Muayene',
    'Lastik Değişimi',
    'Otopark',
    'Bakım',
    'Onarım',
    'Diğer'
  ];

  // URL'den kategori parametresini al
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryParam = params.get('category');
    
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [location.search]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        // Eğer kategori seçilmişse, API'ye kategori parametresi ekle
        const url = selectedCategory 
          ? `/api/services?category=${encodeURIComponent(selectedCategory)}` 
          : '/api/services';
        
        const res = await fetch(url);
        
        if (!res.ok) {
          throw new Error('Hizmetler yüklenemedi');
        }
        
        const data = await res.json();
        setServices(data.data);
      } catch (err) {
        setError(err.message || 'Hizmetler yüklenemedi');
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [selectedCategory]); // selectedCategory değiştiğinde verileri yeniden çek

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          service.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
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
      <h1 className="mb-4">Hizmetler</h1>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Hizmet ara..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <button className="btn btn-outline-secondary" type="button">
              <i className="bi bi-search"></i>
            </button>
          </div>
        </div>
        <div className="col-md-6">
          <select 
            className="form-select" 
            value={selectedCategory}
            onChange={handleCategoryChange}
          >
            <option value="">Tüm Kategoriler</option>
            {categories.map((category, index) => (
              <option key={index} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>
      
      {filteredServices.length === 0 ? (
        <div className="alert alert-info">
          Aramanıza uygun hizmet bulunamadı.
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {filteredServices.map(service => (
            <div key={service._id} className="col">
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">{service.name}</h5>
                  <p className="card-text small text-muted mb-2">
                    <span className="badge bg-info me-2">{service.category}</span>
                  </p>
                  <p className="card-text" style={{ height: '3rem', overflow: 'hidden' }}>
                    {service.description.substring(0, 100)}...
                  </p>
                  <p className="card-text text-primary fw-bold mb-3">
                    {service.price} TL
                  </p>
                  <p className="card-text small text-muted">
                    <i className="bi bi-shop me-1"></i> {service.provider?.companyName || 'Firma Bilgisi Yok'}
                  </p>
                  <Link to={`/providers/${service.provider._id}`} className="btn btn-primary w-100">
                    Servis Sağlayıcıyı Gör
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ServiceList; 