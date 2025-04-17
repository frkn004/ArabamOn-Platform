import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProviderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, api } = useAuth();
  const [provider, setProvider] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('about');
  const [reviews, setReviews] = useState([]);
  
  // Yorum için state
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: ''
  });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Servis sağlayıcı bilgilerini çek
        const providerRes = await fetch(`/api/providers/${id}`);
        if (!providerRes.ok) {
          throw new Error('Servis sağlayıcı bulunamadı');
        }
        const providerData = await providerRes.json();
        setProvider(providerData.data);
        
        // Hizmetleri çek
        const servicesRes = await fetch(`/api/services/provider/${id}`);
        if (!servicesRes.ok) {
          throw new Error('Hizmetler yüklenemedi');
        }
        const servicesData = await servicesRes.json();
        setServices(servicesData.data);
        
        // Yorumları çek
        const reviewsRes = await fetch(`/api/reviews/provider/${id}`);
        if (reviewsRes.ok) {
          const reviewsData = await reviewsRes.json();
          setReviews(reviewsData.data || []);
        }
        
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);
  
  // Yorum gönderme fonksiyonu
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setReviewError('Yorum yapmak için giriş yapmalısınız');
      return;
    }
    
    if (!newReview.comment.trim()) {
      setReviewError('Lütfen bir yorum yazın');
      return;
    }
    
    try {
      setSubmittingReview(true);
      setReviewError('');
      
      const res = await api.post('/reviews', {
        provider: id,
        rating: newReview.rating,
        comment: newReview.comment
      });
      
      if (res.data.success) {
        // Yeni yorumu listeye ekle (admin onayından sonra gösterilecek)
        setReviewSuccess('Yorumunuz başarıyla gönderildi! Onaylandıktan sonra görünür olacaktır.');
        
        // Yorumu sıfırla
        setNewReview({
          rating: 5,
          comment: ''
        });
      }
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Yorum gönderilemedi');
    } finally {
      setSubmittingReview(false);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewReview({
      ...newReview,
      [name]: value
    });
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

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">{error}</div>
        <Link to="/providers" className="btn btn-primary">Servis Sağlayıcılarına Dön</Link>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/">Ana Sayfa</Link></li>
          <li className="breadcrumb-item"><Link to="/providers">Servis Sağlayıcıları</Link></li>
          <li className="breadcrumb-item active" aria-current="page">{provider.companyName}</li>
        </ol>
      </nav>
      
      {/* Sekmeler */}
      <div className="row">
        <div className="col-12">
          <ul className="nav nav-tabs mb-4">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'about' ? 'active' : ''}`}
                onClick={() => setActiveTab('about')}
              >
                Hakkında
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'services' ? 'active' : ''}`}
                onClick={() => setActiveTab('services')}
              >
                Hizmetler
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'reviews' ? 'active' : ''}`}
                onClick={() => setActiveTab('reviews')}
              >
                Değerlendirmeler ({reviews.length})
              </button>
            </li>
          </ul>
        </div>
      </div>
      
      {/* Hakkında Sekmesi */}
      {activeTab === 'about' && (
        <div className="row">
          <div className="col-md-4 mb-4">
            <div className="card shadow-sm">
              <div className="card-body">
                <h1 className="card-title h3">{provider.companyName}</h1>
                <div className="text-warning mb-2">
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star-half"></i>
                  <span className="ms-1 text-dark">({reviews.length} yorum)</span>
                </div>
                <p className="card-text">
                  <i className="bi bi-geo-alt-fill me-2"></i>
                  {formatAddress(provider.address)}
                </p>
                <p className="card-text">
                  <i className="bi bi-telephone-fill me-2"></i>
                  {provider.contactPhone || provider.phone}
                </p>
                <hr />
                <h5 className="card-title">Uzmanlıklar</h5>
                <div className="provider-specialties mb-4">
                  {provider.specialties && provider.specialties.map((specialty, index) => (
                    <span key={index} className="badge bg-secondary me-1 mb-1">
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-md-8">
            <div className="card shadow-sm mb-4">
              <div className="card-body">
                <h3 className="card-title">Hakkında</h3>
                <p className="card-text">{provider.description}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Hizmetler Sekmesi */}
      {activeTab === 'services' && (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {services.length === 0 ? (
            <div className="col">
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">Henüz bir hizmet eklenmemiş.</h5>
                </div>
              </div>
            </div>
          ) : (
            services.map(service => (
              <div key={service._id} className="col">
                <div className="card h-100">
                  <div className="card-body">
                    <h5 className="card-title">{service.name}</h5>
                    <p className="card-text">{service.description}</p>
                    <p className="card-text text-primary fw-bold">{service.price} TL</p>
                    {user && (
                      <Link 
                        to={`/appointments/new`} 
                        className="btn btn-primary"
                        state={{ providerId: id, serviceId: service._id }}
                      >
                        Randevu Al
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
      
      {/* Değerlendirmeler Sekmesi */}
      {activeTab === 'reviews' && (
        <div className="row">
          <div className="col-md-8">
            <h4 className="mb-4">Müşteri Değerlendirmeleri</h4>
            
            {reviews.length === 0 ? (
              <div className="alert alert-info">
                Henüz değerlendirme bulunmuyor. İlk değerlendirmeyi siz yapın!
              </div>
            ) : (
              <div className="mb-4">
                {reviews.map((review) => (
                  <div key={review._id} className="card mb-3">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <div>
                          <strong>{review.user?.name || 'Anonim'}</strong>
                          <small className="text-muted ms-2">
                            {new Date(review.createdAt).toLocaleDateString('tr-TR')}
                          </small>
                        </div>
                        <div>
                          {[...Array(5)].map((_, i) => (
                            <i 
                              key={i}
                              className={`bi bi-star${i < review.rating ? '-fill' : ''} text-warning`}
                            ></i>
                          ))}
                        </div>
                      </div>
                      <p className="mb-0">{review.comment}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Yeni Değerlendirme Formu */}
            {user && (
              <div className="card">
                <div className="card-header bg-light">
                  <h5 className="mb-0">Değerlendirme Yapın</h5>
                </div>
                <div className="card-body">
                  {reviewSuccess && (
                    <div className="alert alert-success">{reviewSuccess}</div>
                  )}
                  
                  {reviewError && (
                    <div className="alert alert-danger">{reviewError}</div>
                  )}
                  
                  <form onSubmit={handleReviewSubmit}>
                    <div className="mb-3">
                      <label htmlFor="rating" className="form-label">Puanınız</label>
                      <div className="rating-select mb-2">
                        {[...Array(5)].map((_, i) => (
                          <button
                            key={i}
                            type="button"
                            className="btn btn-link p-0 me-1"
                            onClick={() => setNewReview({...newReview, rating: i + 1})}
                          >
                            <i 
                              className={`bi bi-star${i < newReview.rating ? '-fill' : ''} text-warning fs-4`}
                            ></i>
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="comment" className="form-label">Yorumunuz</label>
                      <textarea
                        className="form-control"
                        id="comment"
                        name="comment"
                        rows="4"
                        value={newReview.comment}
                        onChange={handleInputChange}
                        required
                      ></textarea>
                    </div>
                    
                    <div className="d-grid">
                      <button 
                        type="submit" 
                        className="btn btn-primary"
                        disabled={submittingReview}
                      >
                        {submittingReview ? (
                          <span>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Gönderiliyor...
                          </span>
                        ) : 'Değerlendirme Gönder'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
            
            {!user && (
              <div className="alert alert-info">
                Değerlendirme yapmak için <Link to="/login">giriş yapın</Link>.
              </div>
            )}
          </div>
          
          <div className="col-md-4">
            <div className="card shadow-sm mb-4">
              <div className="card-body">
                <h5 className="card-title mb-3">Değerlendirme Özeti</h5>
                
                <div className="d-flex justify-content-center my-4">
                  <div className="text-center">
                    <div className="display-4 fw-bold text-primary">
                      {provider?.averageRating?.toFixed(1) || '0.0'}
                    </div>
                    <div className="rating mb-2">
                      {[...Array(5)].map((_, i) => (
                        <i 
                          key={i}
                          className={`bi bi-star${i < Math.round(provider?.averageRating || 0) ? '-fill' : ''} text-warning`}
                        ></i>
                      ))}
                    </div>
                    <small className="text-muted">
                      {provider?.reviewCount || 0} değerlendirme
                    </small>
                  </div>
                </div>
                
                {provider?.reviewCount > 0 && (
                  <div className="rating-bars">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = reviews.filter(r => Math.floor(r.rating) === star).length;
                      const percentage = provider?.reviewCount ? (count / provider.reviewCount) * 100 : 0;
                      
                      return (
                        <div key={star} className="d-flex align-items-center mb-1">
                          <div className="me-2" style={{ width: '40px' }}>
                            {star} <i className="bi bi-star-fill text-warning small"></i>
                          </div>
                          <div className="progress flex-grow-1" style={{ height: '8px' }}>
                            <div 
                              className="progress-bar bg-warning" 
                              role="progressbar" 
                              style={{ width: `${percentage}%` }}
                              aria-valuenow={percentage}
                              aria-valuemin="0"
                              aria-valuemax="100"
                            ></div>
                          </div>
                          <div className="ms-2 small text-muted" style={{ width: '30px' }}>
                            {count}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderDetail; 