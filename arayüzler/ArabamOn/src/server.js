const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const { connectDB, closeConnection } = require('./config/database');
require('dotenv').config();

// Express uygulaması
const app = express();

// Middleware'ler
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Güvenlik ayarları - Content-Security-Policy
// Geliştirme ortamı için CSP kurallarını devre dışı bırakalım
if (process.env.NODE_ENV === 'production') {
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdnjs.cloudflare.com"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'", "http://localhost:*", "https://localhost:*"],
        },
      },
    })
  );
} else {
  // Geliştirme ortamında basit güvenlik ayarları
  app.use(helmet.xssFilter());
  app.use(helmet.noSniff());
  app.use(helmet.hidePoweredBy());
  app.use(helmet.frameguard({ action: 'deny' }));
}

// API rotaları
app.use('/api/auth', require('./routes/auth'));
app.use('/api/businesses', require('./routes/businesses'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/services', require('./routes/serviceRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// Statik dosyaları sunma
app.use(express.static(path.join(__dirname, '../public')));

// HTML dosyaları için özel işleme
app.get('*.html', (req, res) => {
  const htmlPath = path.join(__dirname, '../public', req.path);
  res.sendFile(htmlPath);
});

// Diğer tüm GET isteklerini index.html'e yönlendir (SPA için)
app.get('*', (req, res) => {
  // /api/ ile başlayan istekleri atla
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ success: false, message: 'API endpoint bulunamadı' });
  }
  
  // Diğer tüm istekleri index.html'e yönlendir
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Port ve ortam ayarları
const PORT = process.env.PORT || 3004;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Veritabanı bağlantısı ve sunucu başlatma
const server = app.listen(PORT, async () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor (${NODE_ENV} modu)`);
  
  // Veritabanı bağlantısı
  await connectDB();
});

// Graceful shutdown işlemi
const gracefulShutdown = async (signal) => {
  console.log(`${signal} sinyali alındı, sunucu kapatılıyor...`);
  
  try {
    // HTTP sunucusunu kapat
    await new Promise((resolve) => {
      server.close(() => {
        console.log('HTTP sunucusu kapatıldı');
        resolve();
      });
    });
    
    // Veritabanı bağlantısını kapat
    await closeConnection();
    
    console.log('Uygulama güvenli bir şekilde kapatıldı');
    process.exit(0);
  } catch (error) {
    console.error('Uygulama kapatılırken hata:', error);
    process.exit(1);
  }
};

// Sinyalleri dinle
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM')); 