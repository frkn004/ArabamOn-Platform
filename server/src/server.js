const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const serviceProviderRoutes = require('./routes/serviceProviders');
const serviceRoutes = require('./routes/services');
const appointmentRoutes = require('./routes/appointments');
const adminRoutes = require('./routes/admin');
const notificationRoutes = require('./routes/notifications');
const vehicleRoutes = require('./routes/vehicles');
const reviewRoutes = require('./routes/reviews');
const couponsRoutes = require('./routes/coupons');

// Çevre değişkenlerini yükle
dotenv.config();

// Express uygulamasını oluştur
const app = express();

// CORS ayarları - daha detaylı yapılandırma
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://192.168.89.63:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Tüm isteklerin önizleme (preflight) işlemleri için
app.options('*', cors());

// OPTIONS isteklerini ele almak için özel middleware
app.use((req, res, next) => {
  const allowedOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://192.168.89.63:3000'];
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Statik dosyalar için public klasörünü kullan
app.use(express.static('public'));

// MongoDB bağlantısı
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/arabamon')
  .then(() => console.log('MongoDB bağlantısı başarılı'))
  .catch(err => console.error('MongoDB bağlantı hatası:', err));

// Rotaları tanımla
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/providers', serviceProviderRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/coupons', couponsRoutes);

// Ana sayfa rotası
app.get('/', (req, res) => {
  res.send('ArabaMon API çalışıyor');
});

// Portu ayarla
const PORT = process.env.PORT || 3001;

// Sunucuyu başlat
app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} numaralı portta çalışıyor`);
}); 