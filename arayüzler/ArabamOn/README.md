# Arabamon - Araç Bakım Hizmetleri Platformu API

Arabamon, araç sahiplerinin expertiz, lastik değişimi ve otopark hizmetleri için randevu alabilecekleri, kullanıcı hesapları oluşturabilecekleri ve işletmeleri değerlendirebilecekleri bir platformdur.

## Teknik Altyapı

- **Backend:** Node.js + Express.js RESTful API
- **Veritabanı:** MongoDB (Mongoose ORM)
- **Kimlik Doğrulama:** JWT tabanlı yetkilendirme
- **Güvenlik:** bcrypt şifreleme, input validasyon, rate limiting
- **Dokümantasyon:** Swagger/OpenAPI

## Kurulum

```bash
# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm run dev

# Üretim sunucusunu başlat
npm start
```

## Çevre Değişkenleri

Projeyi çalıştırmak için bir `.env` dosyası oluşturun ve aşağıdaki değişkenleri tanımlayın:

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/arabamon
JWT_SECRET=gizli_anahtar
JWT_EXPIRES_IN=1d
JWT_COOKIE_EXPIRE=1
NODE_ENV=development
```

## API Dokümantasyonu

API dokümantasyonu Swagger ile hazırlanmıştır. Dokümantasyona aşağıdaki URL'den erişilebilir:

```
http://localhost:3000/api-docs
```

## API Endpoint'leri

### Auth Endpoints
- `POST /api/auth/register` - Kullanıcı kaydı
- `POST /api/auth/login` - Kullanıcı girişi
- `GET /api/auth/me` - Profil bilgisi
- `GET /api/auth/logout` - Çıkış yapma

### Business Endpoints
- `GET /api/businesses` - İşletmeleri listeleme
- `GET /api/businesses/:id` - İşletme detayı
- `POST /api/businesses` - İşletme ekleme (yetki gerekli)
- `PUT /api/businesses/:id` - İşletme güncelleme (yetki gerekli)
- `DELETE /api/businesses/:id` - İşletme silme (yetki gerekli)
- `GET /api/businesses/radius/:lat/:lng/:distance` - Yakındaki işletmeler
- `PUT /api/businesses/:id/activate` - İşletmeyi aktifleştirme (admin yetkisi gerekli)

### Service Endpoints
- `GET /api/services` - Hizmetleri listeleme
- `GET /api/services/:id` - Hizmet detayı
- `GET /api/businesses/:businessId/services` - İşletmeye ait hizmetleri listeleme
- `POST /api/businesses/:businessId/services` - Hizmet ekleme (yetki gerekli)
- `PUT /api/services/:id` - Hizmet güncelleme (yetki gerekli)
- `DELETE /api/services/:id` - Hizmet silme (yetki gerekli)

### Appointment Endpoints
- `GET /api/appointments` - Randevuları listeleme (yetki gerekli)
- `GET /api/appointments/:id` - Randevu detayı (yetki gerekli)
- `GET /api/businesses/:businessId/appointments` - İşletmeye ait randevuları listeleme (yetki gerekli)
- `POST /api/businesses/:businessId/appointments` - Randevu oluşturma
- `PUT /api/appointments/:id` - Randevu güncelleme (yetki gerekli)
- `DELETE /api/appointments/:id` - Randevu iptal etme (yetki gerekli)

### Review Endpoints
- `GET /api/reviews` - Değerlendirmeleri listeleme
- `GET /api/reviews/:id` - Değerlendirme detayı
- `GET /api/businesses/:businessId/reviews` - İşletmeye ait değerlendirmeleri listeleme
- `POST /api/businesses/:businessId/reviews` - Değerlendirme ekleme (yetki gerekli)
- `PUT /api/reviews/:id` - Değerlendirme güncelleme (yetki gerekli)
- `DELETE /api/reviews/:id` - Değerlendirme silme (yetki gerekli)
- `PUT /api/reviews/:id/approve` - Değerlendirme onaylama (admin yetkisi gerekli)

## Lisans

MIT 

Arabamon, araç sahiplerinin expertiz, lastik değişimi ve otopark hizmetleri için randevu alabilecekleri, kullanıcı hesapları oluşturabilecekleri ve işletmeleri değerlendirebilecekleri bir platformdur.

## Teknik Altyapı

- **Backend:** Node.js + Express.js RESTful API
- **Veritabanı:** MongoDB (Mongoose ORM)
- **Kimlik Doğrulama:** JWT tabanlı yetkilendirme
- **Güvenlik:** bcrypt şifreleme, input validasyon, rate limiting
- **Dokümantasyon:** Swagger/OpenAPI

## Kurulum

```bash
# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm run dev

# Üretim sunucusunu başlat
npm start
```

## Çevre Değişkenleri

Projeyi çalıştırmak için bir `.env` dosyası oluşturun ve aşağıdaki değişkenleri tanımlayın:

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/arabamon
JWT_SECRET=gizli_anahtar
JWT_EXPIRES_IN=1d
JWT_COOKIE_EXPIRE=1
NODE_ENV=development
```

## API Dokümantasyonu

API dokümantasyonu Swagger ile hazırlanmıştır. Dokümantasyona aşağıdaki URL'den erişilebilir:

```
http://localhost:3000/api-docs
```

## API Endpoint'leri

### Auth Endpoints
- `POST /api/auth/register` - Kullanıcı kaydı
- `POST /api/auth/login` - Kullanıcı girişi
- `GET /api/auth/me` - Profil bilgisi
- `GET /api/auth/logout` - Çıkış yapma

### Business Endpoints
- `GET /api/businesses` - İşletmeleri listeleme
- `GET /api/businesses/:id` - İşletme detayı
- `POST /api/businesses` - İşletme ekleme (yetki gerekli)
- `PUT /api/businesses/:id` - İşletme güncelleme (yetki gerekli)
- `DELETE /api/businesses/:id` - İşletme silme (yetki gerekli)
- `GET /api/businesses/radius/:lat/:lng/:distance` - Yakındaki işletmeler
- `PUT /api/businesses/:id/activate` - İşletmeyi aktifleştirme (admin yetkisi gerekli)

### Service Endpoints
- `GET /api/services` - Hizmetleri listeleme
- `GET /api/services/:id` - Hizmet detayı
- `GET /api/businesses/:businessId/services` - İşletmeye ait hizmetleri listeleme
- `POST /api/businesses/:businessId/services` - Hizmet ekleme (yetki gerekli)
- `PUT /api/services/:id` - Hizmet güncelleme (yetki gerekli)
- `DELETE /api/services/:id` - Hizmet silme (yetki gerekli)

### Appointment Endpoints
- `GET /api/appointments` - Randevuları listeleme (yetki gerekli)
- `GET /api/appointments/:id` - Randevu detayı (yetki gerekli)
- `GET /api/businesses/:businessId/appointments` - İşletmeye ait randevuları listeleme (yetki gerekli)
- `POST /api/businesses/:businessId/appointments` - Randevu oluşturma
- `PUT /api/appointments/:id` - Randevu güncelleme (yetki gerekli)
- `DELETE /api/appointments/:id` - Randevu iptal etme (yetki gerekli)

### Review Endpoints
- `GET /api/reviews` - Değerlendirmeleri listeleme
- `GET /api/reviews/:id` - Değerlendirme detayı
- `GET /api/businesses/:businessId/reviews` - İşletmeye ait değerlendirmeleri listeleme
- `POST /api/businesses/:businessId/reviews` - Değerlendirme ekleme (yetki gerekli)
- `PUT /api/reviews/:id` - Değerlendirme güncelleme (yetki gerekli)
- `DELETE /api/reviews/:id` - Değerlendirme silme (yetki gerekli)
- `PUT /api/reviews/:id/approve` - Değerlendirme onaylama (admin yetkisi gerekli)

## Lisans

MIT 