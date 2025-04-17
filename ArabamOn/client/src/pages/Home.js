import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('');

  // Servis kategorileri
  const categories = [
    { 
      id: 1, 
      name: 'Araç Yıkama', 
      icon: 'fas fa-car-wash', 
      color: 'primary', 
      description: 'Aracınızı profesyonel ekiplerimizle temizletin, ilk günkü gibi parlasın.' 
    },
    { 
      id: 2, 
      name: 'Teknik Muayene', 
      icon: 'fas fa-car-battery', 
      color: 'success', 
      description: 'Aracınızın tüm teknik kontrolleri uzman ekiplerimizce yapılır.' 
    },
    { 
      id: 3, 
      name: 'Lastik Değişimi', 
      icon: 'fas fa-cog', 
      color: 'warning', 
      description: 'Mevsime uygun lastik değişimi ve balans ayarı hizmetlerimizden yararlanın.' 
    },
    { 
      id: 4, 
      name: 'Otopark', 
      icon: 'fas fa-parking', 
      color: 'danger', 
      description: 'Güvenli ve ekonomik otopark çözümleri ile aracınız güvende olsun.' 
    }
  ];

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };
  
  const handleSearchSubmit = () => {
    if (selectedCategory) {
      navigate(`/services?category=${encodeURIComponent(selectedCategory)}`);
    } else {
      navigate('/services');
    }
  };

  return (
    <>
      {/* Hero Section */}
      <section className="hero-section py-5">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <h1 className="display-5 fw-bold mb-4">Aracınız İçin En İyi Hizmet</h1>
              <p className="lead mb-4">
                ArabaMon ile araç bakımınız için güvenilir servis sağlayıcılarla buluşmanın en kolay yolu. Tek tıkla randevu alın, zamanınızı verimli kullanın.
              </p>
              <div className="d-grid gap-2 d-md-flex justify-content-md-start">
                <Link to="/services" className="btn btn-primary px-4 me-md-2">
                  Hizmetleri Keşfet
                </Link>
                <Link to="/providers" className="btn btn-outline-secondary px-4">
                  Servis Sağlayıcılar
                </Link>
              </div>
            </div>
            <div className="col-lg-6 d-none d-lg-block">
              <img
                src="https://img.freepik.com/free-photo/car-wash-detailing-station_1303-22981.jpg"
                alt="Car Service"
                className="img-fluid rounded shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Kategori Arama Section */}
      <section className="py-5 bg-light">
        <div className="container">
          <h2 className="text-center mb-4">İhtiyacınız Olan Hizmeti Bulun</h2>
          <div className="row justify-content-center">
            <div className="col-md-8">
              <div className="card shadow-sm">
                <div className="card-body p-4">
                  <div className="mb-3">
                    <label htmlFor="categorySearch" className="form-label">Hizmet Kategorisi Seçin</label>
                    <select 
                      id="categorySearch" 
                      className="form-select form-select-lg"
                      value={selectedCategory}
                      onChange={handleCategoryChange}
                    >
                      <option value="">Tüm Kategoriler</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="d-grid">
                    <button 
                      className="btn btn-primary btn-lg"
                      onClick={handleSearchSubmit}
                    >
                      Hizmetleri Görüntüle
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hizmetler Section */}
      <section className="py-5">
        <div className="container">
          <h2 className="text-center mb-5">Popüler Hizmetlerimiz</h2>
          <div className="row g-4">
            {categories.map(category => (
              <div key={category.id} className="col-md-6 col-lg-3">
                <div className="card h-100 shadow-sm">
                  <div className="card-body text-center">
                    <div className={`d-inline-block bg-${category.color} bg-opacity-10 p-3 rounded-circle mb-3`}>
                      <i className={`${category.icon} fa-3x text-${category.color}`}></i>
                    </div>
                    <h5 className="card-title">{category.name}</h5>
                    <p className="card-text">
                      {category.description}
                    </p>
                    <Link 
                      to={`/services?category=${encodeURIComponent(category.name)}`} 
                      className={`btn btn-sm btn-outline-${category.color} mt-2`}
                    >
                      Detaylar
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Nasıl Çalışır Section */}
      <section className="py-5 bg-light">
        <div className="container">
          <h2 className="text-center mb-5">Nasıl Çalışır?</h2>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="card border-0 bg-transparent">
                <div className="card-body text-center">
                  <div className="bg-white p-4 rounded-circle shadow d-inline-flex justify-content-center align-items-center mb-3" style={{ width: '100px', height: '100px' }}>
                    <span className="display-5 fw-bold text-primary">1</span>
                  </div>
                  <h4>Servis Seçin</h4>
                  <p className="text-muted">
                    İhtiyacınız olan hizmeti seçin ve size en yakın servis sağlayıcıları bulun.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card border-0 bg-transparent">
                <div className="card-body text-center">
                  <div className="bg-white p-4 rounded-circle shadow d-inline-flex justify-content-center align-items-center mb-3" style={{ width: '100px', height: '100px' }}>
                    <span className="display-5 fw-bold text-primary">2</span>
                  </div>
                  <h4>Randevu Alın</h4>
                  <p className="text-muted">
                    Size uygun tarih ve saatte online olarak randevunuzu oluşturun.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card border-0 bg-transparent">
                <div className="card-body text-center">
                  <div className="bg-white p-4 rounded-circle shadow d-inline-flex justify-content-center align-items-center mb-3" style={{ width: '100px', height: '100px' }}>
                    <span className="display-5 fw-bold text-primary">3</span>
                  </div>
                  <h4>Hizmeti Alın</h4>
                  <p className="text-muted">
                    Randevu saatinizde servis noktasına gidin ve kaliteli hizmeti deneyimleyin.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-5 bg-primary text-white">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-8 mx-auto text-center">
              <h2>Hemen Başlayın</h2>
              <p className="lead mb-4">
                ArabaMon ile araç bakımınızı kolaylaştırın. Binlerce servis sağlayıcı arasından seçim yapın, randevunuzu oluşturun.
              </p>
              <div className="d-grid gap-2 d-sm-flex justify-content-sm-center">
                <Link to="/register" className="btn btn-light px-4 py-2">
                  Üye Olun
                </Link>
                <Link to="/providers" className="btn btn-outline-light px-4 py-2">
                  Hizmet Veren Firmaları Görün
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home; 