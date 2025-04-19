import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const ProviderList = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [specialties, setSpecialties] = useState([]);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const res = await fetch('/api/providers');
        
        if (!res.ok) {
          throw new Error('Servis sağlayıcılar yüklenemedi');
        }
        
        const data = await res.json();
        setProviders(data.data);
        
        // Tüm uzmanlıkları topla
        const allSpecialties = data.data.reduce((acc, provider) => {
          if (provider.specialties) {
            provider.specialties.forEach(specialty => {
              if (!acc.includes(specialty)) {
                acc.push(specialty);
              }
            });
          }
          return acc;
        }, []);
        
        setSpecialties(allSpecialties.sort());
      } catch (err) {
        setError(err.message || 'Servis sağlayıcılar yüklenemedi');
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
  }, []);

  const filteredProviders = providers.filter(provider => {
    // Provider olmayan veya geçersiz sağlayıcıları filtrele
    if (!provider || !provider.companyName || !provider.description) {
      return false;
    }
    
    const matchesSearch = provider.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          provider.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSpecialty = selectedSpecialty === '' || 
                             (provider.specialties && provider.specialties.includes(selectedSpecialty));
    
    return matchesSearch && matchesSpecialty;
  });

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSpecialtyChange = (e) => {
    setSelectedSpecialty(e.target.value);
  };

  // Adres nesnesini formatlı string olarak göster
  const formatAddress = (address) => {
    if (!address) return 'Adres bilgisi yok';
    if (typeof address === 'string') return address;
    
    const { street, city, state, zipCode, country } = address;
    let formattedAddress = '';
    
    if (street) formattedAddress += street;
    if (city) formattedAddress += formattedAddress ? `, ${city}` : city;
    if (state) formattedAddress += formattedAddress ? `, ${state}` : state;
    if (zipCode) formattedAddress += formattedAddress ? ` ${zipCode}` : zipCode;
    if (country && country !== 'Türkiye') formattedAddress += formattedAddress ? `, ${country}` : country;
    
    return formattedAddress || 'Adres bilgisi yok';
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
      <h1 className="mb-4">Servis Sağlayıcıları</h1>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Servis sağlayıcı ara..."
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
            value={selectedSpecialty}
            onChange={handleSpecialtyChange}
          >
            <option value="">Tüm Uzmanlıklar</option>
            {specialties.map((specialty, index) => (
              <option key={index} value={specialty}>{specialty}</option>
            ))}
          </select>
        </div>
      </div>
      
      {filteredProviders.length === 0 ? (
        <div className="alert alert-info">
          Aramanıza uygun servis sağlayıcı bulunamadı.
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {filteredProviders.map(provider => (
            <div key={provider._id} className="col">
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">{provider.companyName}</h5>
                  <p className="card-text small text-muted mb-2">
                    <i className="bi bi-geo-alt-fill me-1"></i> {formatAddress(provider.address)}
                  </p>
                  <p className="card-text small text-muted mb-3">
                    <i className="bi bi-telephone-fill me-1"></i> {provider.contactPhone || provider.phone}
                  </p>
                  <p className="card-text" style={{ height: '3rem', overflow: 'hidden' }}>
                    {provider.description.substring(0, 100)}...
                  </p>
                  <div className="provider-specialties mb-2">
                    {provider.specialties && provider.specialties.map((specialty, index) => (
                      <span key={index} className="badge bg-secondary me-1 mb-1">
                        {specialty}
                      </span>
                    ))}
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="text-warning">
                      <i className="bi bi-star-fill"></i>
                      <i className="bi bi-star-fill"></i>
                      <i className="bi bi-star-fill"></i>
                      <i className="bi bi-star-fill"></i>
                      <i className="bi bi-star-half"></i>
                      <span className="ms-1 text-dark">({provider.reviewCount || 0})</span>
                    </div>
                    <Link to={`/providers/${provider._id}`} className="btn btn-primary">
                      Detay
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProviderList; 