# ArabaMon Araç Servis Randevu Sistemi

ArabaMon, araç sahiplerinin servis sağlayıcıları ile buluşmasını sağlayan, randevu oluşturmayı ve yönetmeyi kolaylaştıran bir web platformudur.

## Özellikler

- **Kullanıcı Hesapları:** Araç sahipleri ve servis sağlayıcıları için farklı hesap türleri
- **Servis Randevuları:** Kolay randevu oluşturma ve takip etme
- **Servis Geçmişi:** Araçlarınızın bakım ve servis geçmişini görüntüleme
- **Değerlendirmeler:** Servis sağlayıcılarını puanlama ve değerlendirme
- **Bildirimler:** Randevu hatırlatmaları ve durum güncellemeleri

## Kurulum

### Gereksinimler

- Node.js 18+ ve npm
- MongoDB 4.4+
- NGINX (Canlı ortam için)

### Geliştirme Ortamı

1. Repository'yi klonlayın:
```bash
git clone https://github.com/frkn004/ArabamOn-Platform.git
cd ArabamOn-Platform
```

2. Client bağımlılıklarını yükleyin:
```bash
cd client
npm install
```

3. Server bağımlılıklarını yükleyin:
```bash
cd ../server
npm install
```

4. Geliştirme modunda çalıştırın:
```bash
# Server 
npm run dev

# Client (yeni bir terminal penceresinde)
cd ../client
npm start
```

### Canlı Ortam Kurulumu

1. Client uygulamasını derleyin:
```bash
cd client
npm run build
```

2. NGINX yapılandırmasını kurun:
```bash
chmod +x nginx_conf.sh
./nginx_conf.sh
```

3. Server uygulamasını process manager ile başlatın:
```bash
cd server
npm install -g pm2
pm2 start src/server.js --name "arabamon-api"
```

## Kullanım

Sistem üç ana kullanıcı rolüne sahiptir:

1. **Araç Sahipleri (Kullanıcılar):**
   - Araçlarını sisteme kaydedebilir
   - Servis randevusu oluşturabilir
   - Servis geçmişini görüntüleyebilir
   - Servis sağlayıcılarını değerlendirebilir

2. **Servis Sağlayıcıları (Firmalar):**
   - Sundukları hizmetleri yönetebilir
   - Randevuları kabul/reddedebilir
   - Çalışma saatlerini belirleyebilir
   - Müşteri değerlendirmelerini görebilir

3. **Admin:**
   - Tüm kullanıcıları ve servis sağlayıcılarını yönetebilir
   - Sistem genelindeki verileri görüntüleyebilir
   - Gerekli durumlarda müdahale edebilir

## Demo Hesapları

Sistemi test etmek için aşağıdaki demo hesaplarını kullanabilirsiniz:

- **Admin:**
  - Email: admin@test.com
  - Şifre: password

- **Kullanıcı (Araç Sahibi):**
  - Email: user1@test.com
  - Şifre: password

- **Servis Sağlayıcı (Firma):**
  - Email: provider1@test.com
  - Şifre: password

## Lisans

Bu proje özel lisans altında dağıtılmaktadır ve tüm hakları saklıdır. © 2023 DüfTech. 