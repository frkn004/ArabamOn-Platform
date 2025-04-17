# Arabamon - Araç Bakım Hizmetleri Platformu

Arabamon, araç sahiplerinin çevrelerindeki araç bakım ve servis işletmelerini bulup, randevu alabilecekleri bir web platformudur. Araç yıkama, lastik değişimi, ekspertiz ve otopark gibi hizmetler sunan işletmeleri bir araya getirerek, kullanıcılara kolayca hizmet almalarını sağlar.

## Özellikler

- İşletme arama ve filtreleme
- Online randevu oluşturma ve yönetme
- İşletme sahipleri için dashboard
- Kullanıcı değerlendirmeleri
- Konum bazlı arama
- Responsive tasarım

## Kurulum

1. Projeyi bilgisayarınıza klonlayın:
```
git clone https://github.com/kullaniciadi/arabamon.git
cd arabamon
```

2. Bağımlılıkları yükleyin:
```
npm install
```

3. Geliştirme sunucusunu başlatın:
```
npm run dev
```

4. Tarayıcınızda `http://localhost:3000` adresini açın.

## Proje Yapısı

```
/src
  /css          - Stil dosyaları
  /js           - JavaScript dosyaları
  /images       - Resim dosyaları
  index.html    - Ana sayfa
  login.html    - Giriş sayfası
  register.html - Kayıt sayfası
  ...
```

## Teknolojiler

Bu proje aşağıdaki teknolojileri kullanmaktadır:

- HTML5
- CSS3
- JavaScript (ES6+)
- RESTful API
- Responsive Design

## API Kullanımı

Arabamon, backend API'sine aşağıdaki endpoint'ler üzerinden erişmektedir:

- `POST /auth/login` - Kullanıcı girişi
- `POST /auth/register` - Kullanıcı kaydı
- `GET /businesses` - İşletmeleri listele
- `GET /businesses/:id` - İşletme detayı
- `POST /appointments` - Randevu oluştur
- `GET /appointments` - Randevuları listele
- `DELETE /appointments/:id` - Randevu iptal et

## Katkıda Bulunma

1. Bu repo'yu fork edin
2. Yeni bir branch oluşturun (`git checkout -b feature/yeni-ozellik`)
3. Değişikliklerinizi commit edin (`git commit -am 'Yeni özellik: açıklama'`)
4. Branch'inizi push edin (`git push origin feature/yeni-ozellik`)
5. Pull Request oluşturun

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır - detaylar için LICENSE dosyasına bakınız.

## İletişim

- E-posta: info@arabamon.com
- Website: https://arabamon.com 