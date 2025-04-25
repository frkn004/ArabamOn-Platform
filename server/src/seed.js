const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const ServiceProvider = require('./models/ServiceProvider');
const Service = require('./models/Service');
const Appointment = require('./models/Appointment');
const Notification = require('./models/Notification');
const bcrypt = require('bcryptjs');
const Vehicle = require('./models/Vehicle');
const Review = require('./models/Review');
const Coupon = require('./models/Coupon');

// Çevre değişkenlerini yükle
dotenv.config();

// MongoDB bağlantısı
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/arabamon')
  .then(() => console.log('MongoDB bağlantısı başarılı'))
  .catch(err => console.error('MongoDB bağlantı hatası:', err));

// Test verileri
const seedDatabase = async () => {
  try {
    // Veritabanını temizle
    await User.deleteMany();
    await ServiceProvider.deleteMany();
    await Service.deleteMany();
    await Appointment.deleteMany();
    await Notification.deleteMany();
    await Vehicle.deleteMany();
    await Review.deleteMany();
    await Coupon.deleteMany();
    
    console.log('Veritabanı temizlendi');
    
    // Kullanıcılar oluştur
    const adminUser = await User.create({
      name: 'Admin Kullanıcı',
      email: 'admin@arabamon.com',
      password: 'admin123',
      phone: '5551234567',
      role: 'admin'
    });
    
    const providerUser1 = await User.create({
      name: 'Servis Sağlayıcı',
      email: 'provider@arabamon.com',
      password: 'provider123',
      phone: '5551234568',
      role: 'provider'
    });
    
    const normalUser1 = await User.create({
      name: 'Test Kullanıcı',
      email: 'user@arabamon.com',
      password: 'user123',
      phone: '5551234573',
      role: 'user'
    });
    
    const providerUser2 = await User.create({
      name: 'Servis Sağlayıcı 2',
      email: 'provider2@example.com',
      password: '123456',
      phone: '5551234569',
      role: 'provider'
    });
    
    const providerUser3 = await User.create({
      name: 'Anadolu Otomotiv',
      email: 'provider3@example.com',
      password: '123456',
      phone: '5551234570',
      role: 'provider'
    });
    
    const providerUser4 = await User.create({
      name: 'Hızlı Servis',
      email: 'provider4@example.com',
      password: '123456',
      phone: '5551234571',
      role: 'provider'
    });
    
    const providerUser5 = await User.create({
      name: 'Teknik Oto',
      email: 'provider5@example.com',
      password: '123456',
      phone: '5551234572',
      role: 'provider'
    });
    
    const normalUser2 = await User.create({
      name: 'Test Kullanıcı 2',
      email: 'user2@example.com',
      password: '123456',
      phone: '5551234574',
      role: 'user'
    });
    
    const normalUser3 = await User.create({
      name: 'Ahmet Yılmaz',
      email: 'ahmet@example.com',
      password: '123456',
      phone: '5551234575',
      role: 'user'
    });
    
    const normalUser4 = await User.create({
      name: 'Ayşe Kaya',
      email: 'ayse@example.com',
      password: '123456',
      phone: '5551234576',
      role: 'user'
    });
    
    const normalUser5 = await User.create({
      name: 'Mehmet Demir',
      email: 'mehmet@example.com',
      password: '123456',
      phone: '5551234577',
      role: 'user'
    });
    
    console.log('Kullanıcılar oluşturuldu');
    
    // Servis sağlayıcılar oluştur
    const provider1 = await ServiceProvider.create({
      user: providerUser1._id,
      companyName: 'ABC Otomotiv',
      contactPhone: '02161234567',
      address: {
        street: 'Bağdat Caddesi No: 123',
        city: 'İstanbul',
        state: 'Kadıköy',
        zipCode: '34000',
        country: 'Türkiye'
      },
      location: {
        type: 'Point',
        coordinates: [29.0622, 40.9920]  // [longitude, latitude]
      },
      description: 'Araç bakım ve onarım hizmetleri',
      specialties: ['Araç Yıkama', 'Lastik Değişimi', 'Bakım'],
      workingHours: {
        monday: { open: '09:00', close: '18:00' },
        tuesday: { open: '09:00', close: '18:00' },
        wednesday: { open: '09:00', close: '18:00' },
        thursday: { open: '09:00', close: '18:00' },
        friday: { open: '09:00', close: '18:00' },
        saturday: { open: '10:00', close: '16:00' },
        sunday: { open: null, close: null }
      },
      approved: true,
      averageRating: 4.5,
      taxId: '1234567890'
    });
    
    const provider2 = await ServiceProvider.create({
      user: providerUser2._id,
      companyName: 'XYZ Oto Servis',
      contactPhone: '02121234567',
      address: {
        street: 'Barbaros Bulvarı No: 45',
        city: 'İstanbul',
        state: 'Beşiktaş',
        zipCode: '34050',
        country: 'Türkiye'
      },
      location: {
        type: 'Point',
        coordinates: [29.0050, 41.0420]
      },
      description: 'Profesyonel araç bakım ve teknik muayene hizmetleri',
      specialties: ['Teknik Muayene', 'Bakım', 'Onarım'],
      workingHours: {
        monday: { open: '08:30', close: '19:00' },
        tuesday: { open: '08:30', close: '19:00' },
        wednesday: { open: '08:30', close: '19:00' },
        thursday: { open: '08:30', close: '19:00' },
        friday: { open: '08:30', close: '19:00' },
        saturday: { open: '09:00', close: '17:00' },
        sunday: { open: null, close: null }
      },
      approved: true,
      averageRating: 4.2,
      taxId: '0987654321'
    });
    
    const provider3 = await ServiceProvider.create({
      user: providerUser3._id,
      companyName: 'Anadolu Otomotiv',
      contactPhone: '02123456789',
      address: {
        street: 'Atatürk Caddesi No: 78',
        city: 'İstanbul',
        state: 'Ümraniye',
        zipCode: '34760',
        country: 'Türkiye'
      },
      location: {
        type: 'Point',
        coordinates: [29.1136, 41.0209]
      },
      description: 'Resmi yetkili servis, tüm marka araçlar için bakım ve onarım',
      specialties: ['Resmi Servis', 'Periyodik Bakım', 'Onarım', 'Elektrik'],
      workingHours: {
        monday: { open: '08:00', close: '18:00' },
        tuesday: { open: '08:00', close: '18:00' },
        wednesday: { open: '08:00', close: '18:00' },
        thursday: { open: '08:00', close: '18:00' },
        friday: { open: '08:00', close: '18:00' },
        saturday: { open: '09:00', close: '15:00' },
        sunday: { open: null, close: null }
      },
      approved: true,
      averageRating: 4.8,
      taxId: '7894561230'
    });
    
    const provider4 = await ServiceProvider.create({
      user: providerUser4._id,
      companyName: 'Hızlı Servis',
      contactPhone: '02163456789',
      address: {
        street: 'İstiklal Caddesi No: 12',
        city: 'İstanbul',
        state: 'Beyoğlu',
        zipCode: '34430',
        country: 'Türkiye'
      },
      location: {
        type: 'Point',
        coordinates: [28.9784, 41.0351]
      },
      description: 'Hızlı araç bakım ve acil yol yardım hizmetleri',
      specialties: ['Acil Servis', 'Lastik', 'Akü', 'Yağ Değişimi'],
      workingHours: {
        monday: { open: '07:00', close: '22:00' },
        tuesday: { open: '07:00', close: '22:00' },
        wednesday: { open: '07:00', close: '22:00' },
        thursday: { open: '07:00', close: '22:00' },
        friday: { open: '07:00', close: '22:00' },
        saturday: { open: '08:00', close: '20:00' },
        sunday: { open: '10:00', close: '18:00' }
      },
      approved: true,
      averageRating: 4.0,
      taxId: '5678912340'
    });
    
    const provider5 = await ServiceProvider.create({
      user: providerUser5._id,
      companyName: 'Teknik Oto',
      contactPhone: '02169876543',
      address: {
        street: 'Bostancı Yolu No: 56',
        city: 'İstanbul',
        state: 'Maltepe',
        zipCode: '34840',
        country: 'Türkiye'
      },
      location: {
        type: 'Point',
        coordinates: [29.1256, 40.9399]
      },
      description: 'Teknik arıza teşhis ve elektronik sistem onarımları',
      specialties: ['Elektronik', 'Motor Testi', 'Klima', 'Beyin'],
      workingHours: {
        monday: { open: '09:00', close: '19:00' },
        tuesday: { open: '09:00', close: '19:00' },
        wednesday: { open: '09:00', close: '19:00' },
        thursday: { open: '09:00', close: '19:00' },
        friday: { open: '09:00', close: '19:00' },
        saturday: { open: '10:00', close: '17:00' },
        sunday: { open: null, close: null }
      },
      approved: true,
      averageRating: 4.6,
      taxId: '2468135790'
    });
    
    console.log('Servis sağlayıcılar oluşturuldu');
    
    // Hizmetler oluştur
    const service1 = await Service.create({
      name: 'İç-Dış Detaylı Yıkama',
      description: 'Aracınızın iç ve dış bölümlerinin detaylı temizliği ve bakımı.',
      price: 250,
      duration: 60, // dakika
      category: 'Araç Yıkama',
      provider: provider1._id
    });
    
    const service2 = await Service.create({
      name: 'Lastik Değişimi',
      description: 'Aracınızın lastiklerinin değişimi ve balans ayarı.',
      price: 200,
      duration: 30,
      category: 'Lastik Değişimi',
      provider: provider1._id
    });
    
    const service3 = await Service.create({
      name: 'Periyodik Bakım',
      description: 'Aracınızın periyodik bakımı, yağ, filtre ve diğer sıvıların kontrolü.',
      price: 800,
      duration: 120,
      category: 'Bakım',
      provider: provider1._id
    });
    
    const service4 = await Service.create({
      name: 'Teknik Muayene Hazırlık',
      description: 'Aracınızın teknik muayene öncesi kontrol ve hazırlık işlemleri.',
      price: 350,
      duration: 60,
      category: 'Teknik Muayene',
      provider: provider2._id
    });
    
    const service5 = await Service.create({
      name: 'Motor Arıza Tespiti',
      description: 'Aracınızın motor sorunlarının profesyonel ekipmanlarla tespiti.',
      price: 300,
      duration: 45,
      category: 'Onarım',
      provider: provider2._id
    });
    
    // Yeni eklenen servis sağlayıcılar için hizmetler
    const service6 = await Service.create({
      name: '10.000 KM Bakımı',
      description: 'Aracınızın 10.000 km bakımı, tüm sıvılar ve filtreler dahil',
      price: 950,
      duration: 150,
      category: 'Bakım',
      provider: provider3._id
    });
    
    const service7 = await Service.create({
      name: '20.000 KM Bakımı',
      description: 'Aracınızın 20.000 km bakımı, tüm sıvılar ve filtreler dahil',
      price: 1200,
      duration: 180,
      category: 'Bakım',
      provider: provider3._id
    });
    
    const service8 = await Service.create({
      name: 'Akü Değişimi',
      description: 'Araç aküsü değişimi ve elektronik sistem kontrolü',
      price: 1500,
      duration: 30,
      category: 'Onarım',
      provider: provider3._id
    });
    
    const service9 = await Service.create({
      name: 'Acil Yol Yardım',
      description: 'İstanbul içi acil yol yardım hizmeti',
      price: 500,
      duration: 60,
      category: 'Diğer',
      provider: provider4._id
    });
    
    const service10 = await Service.create({
      name: 'Express Yağ Değişimi',
      description: 'Hızlı yağ ve filtre değişimi, 30 dakika içinde teslim',
      price: 450,
      duration: 30,
      category: 'Bakım',
      provider: provider4._id
    });
    
    const service11 = await Service.create({
      name: 'Express Lastik Değişimi',
      description: '4 lastik değişimi ve balans ayarı',
      price: 300,
      duration: 45,
      category: 'Lastik Değişimi',
      provider: provider4._id
    });
    
    const service12 = await Service.create({
      name: 'Motor Beyni Arıza Tespiti',
      description: 'Araç beynindeki arızaların profesyonel cihazlarla tespiti',
      price: 400,
      duration: 60,
      category: 'Onarım',
      provider: provider5._id
    });
    
    const service13 = await Service.create({
      name: 'Klima Bakımı ve Gaz Dolumu',
      description: 'Klima sisteminin bakımı, temizliği ve gaz dolumu',
      price: 650,
      duration: 90,
      category: 'Bakım',
      provider: provider5._id
    });
    
    const service14 = await Service.create({
      name: 'Detaylı Motor Testi',
      description: 'Motor performansının detaylı testi ve raporu',
      price: 550,
      duration: 120,
      category: 'Teknik Muayene',
      provider: provider5._id
    });
    
    console.log('Hizmetler oluşturuldu');
    
    // Araçlar ekle
    const vehicle1 = await Vehicle.create({
      user: normalUser1._id,
      brand: 'Volkswagen',
      model: 'Golf',
      year: 2020,
      plate: '34ABC123',
      color: 'Beyaz'
    });

    const vehicle2 = await Vehicle.create({
      user: normalUser2._id,
      brand: 'Toyota',
      model: 'Corolla',
      year: 2019,
      plate: '34DEF456',
      color: 'Siyah'
    });

    const vehicle3 = await Vehicle.create({
      user: normalUser3._id,
      brand: 'Honda',
      model: 'Civic',
      year: 2021,
      plate: '34GHI789',
      color: 'Mavi'
    });

    const vehicle4 = await Vehicle.create({
      user: normalUser4._id,
      brand: 'Renault',
      model: 'Clio',
      year: 2018,
      plate: '34JKL012',
      color: 'Gri'
    });

    console.log('Araçlar oluşturuldu');

    // Onaylanmamış servis sağlayıcı ekle
    const pendingProviderUser = await User.create({
      name: 'Onay Bekleyen Firma',
      email: 'pending@example.com',
      password: '123456',
      phone: '5559876543',
      role: 'provider'
    });

    const pendingProvider = await ServiceProvider.create({
      user: pendingProviderUser._id,
      companyName: 'Onay Bekleyen Oto Servis',
      contactPhone: '02161234555',
      address: {
        street: 'Onay Caddesi No: 5',
        city: 'İstanbul',
        state: 'Üsküdar',
        zipCode: '34000',
        country: 'Türkiye'
      },
      location: {
        type: 'Point',
        coordinates: [29.0522, 40.9820]
      },
      description: 'Onay bekleyen yeni bir servis sağlayıcı',
      specialties: ['Araç Yıkama', 'Teknik Muayene'],
      workingHours: {
        monday: { open: '09:00', close: '18:00' },
        tuesday: { open: '09:00', close: '18:00' },
        wednesday: { open: '09:00', close: '18:00' },
        thursday: { open: '09:00', close: '18:00' },
        friday: { open: '09:00', close: '18:00' },
        saturday: { open: '10:00', close: '16:00' },
        sunday: { open: null, close: null }
      },
      approved: null, // Onay bekliyor
      taxId: '1231231231',
      averageRating: 1 // En düşük puan
    });

    // Onay bekleyen servis sağlayıcı için hizmet ekle
    const pendingProviderService = await Service.create({
      name: 'Detaylı İç Temizlik',
      description: 'Araç içi detaylı temizlik ve dezenfeksiyon hizmeti',
      price: 350,
      duration: 120,
      category: 'Araç Yıkama',
      provider: pendingProvider._id,
      isActive: true
    });

    // Reddedilmiş servis sağlayıcı
    const rejectedProviderUser = await User.create({
      name: 'Reddedilmiş Firma',
      email: 'rejected@example.com',
      password: '123456',
      phone: '5559876542',
      role: 'provider'
    });

    const rejectedProvider = await ServiceProvider.create({
      user: rejectedProviderUser._id,
      companyName: 'Reddedilmiş Oto Servis',
      contactPhone: '02161234777',
      address: {
        street: 'Red Caddesi No: 7',
        city: 'İstanbul',
        state: 'Kadıköy',
        zipCode: '34000',
        country: 'Türkiye'
      },
      location: {
        type: 'Point',
        coordinates: [29.0422, 40.9920]
      },
      description: 'Reddedilmiş bir servis sağlayıcı',
      specialties: ['Araç Yıkama', 'Bakım'],
      workingHours: {
        monday: { open: '09:00', close: '18:00' },
        tuesday: { open: '09:00', close: '18:00' },
        wednesday: { open: '09:00', close: '18:00' },
        thursday: { open: '09:00', close: '18:00' },
        friday: { open: '09:00', close: '18:00' },
        saturday: { open: '10:00', close: '16:00' },
        sunday: { open: null, close: null }
      },
      approved: false, // Reddedilmiş
      taxId: '9879879879',
      averageRating: 1 // En düşük puan
    });

    // Yeni kayıt olmuş kullanıcılar
    const newUser = await User.create({
      name: 'Mehmet Yıldız',
      email: 'mehmet.yildiz@example.com',
      password: await bcrypt.hash('password', 10),
      phone: '5551112233',
      role: 'user'
    });

    // Yeni kullanıcı için araç ekle
    const newUserVehicle = await Vehicle.create({
      brand: 'Renault',
      model: 'Megane',
      year: 2021,
      plate: '34YLZ789',
      color: 'Beyaz',
      user: newUser._id
    });

    // Onay bekleyen, onaylanmış ve tamamlanmış yeni randevular
    const appointment1 = await Appointment.create({
      user: normalUser1._id,
      provider: provider1._id,
      service: service1._id,
      vehicle: vehicle1._id,
      date: new Date().toISOString().split('T')[0], // Bugün
      time: '14:00',
      status: 'beklemede',
      notes: 'Onay bekleyen test randevusu',
      totalPrice: 250 // service1.price ile aynı
    });

    const appointment2 = await Appointment.create({
      user: normalUser2._id,
      provider: provider2._id,
      service: service3._id,
      vehicle: vehicle2._id,
      date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Yarın
      time: '10:00',
      status: 'onaylandı',
      notes: 'Onaylanmış test randevusu',
      totalPrice: 800 // service3.price ile aynı
    });

    const appointment3 = await Appointment.create({
      user: normalUser3._id,
      provider: provider3._id,
      service: service5._id,
      vehicle: vehicle3._id,
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 gün önce
      time: '15:30',
      status: 'tamamlandı',
      notes: 'Tamamlanmış test randevusu',
      totalPrice: 300 // service5.price ile aynı
    });

    // Onay bekleyen servis sağlayıcı için randevu
    const appointment4 = await Appointment.create({
      user: newUser._id,
      provider: pendingProvider._id,
      service: pendingProviderService._id,
      vehicle: newUserVehicle._id,
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 gün sonra
      time: '11:00',
      status: 'beklemede',
      notes: 'Onay bekleyen firma için randevu',
      totalPrice: 350 // pendingProviderService.price ile aynı
    });

    // Diğer randevular
    const appointment5 = await Appointment.create({
      user: normalUser4._id,
      provider: provider4._id,
      service: service9._id,
      vehicle: vehicle4._id,
      date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Yarın
      time: '16:00',
      status: 'onaylandı',
      notes: 'Acil yol yardım randevusu',
      totalPrice: 500 // service9.price ile aynı
    });

    const appointment6 = await Appointment.create({
      user: normalUser5._id,
      provider: provider5._id,
      service: service12._id,
      vehicle: vehicle4._id,
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 gün önce
      time: '13:00',
      status: 'tamamlandı',
      notes: 'Motor beyni arıza teşhisi randevusu',
      totalPrice: 400 // service12.price ile aynı
    });

    // Bildirimler oluştur
    const notification1 = await Notification.create({
      recipient: normalUser1._id,
      sender: provider1._id,
      type: 'appointment_created',
      title: 'Yeni Randevu Oluşturuldu',
      message: `"${service1.name}" hizmeti için randevunuz oluşturuldu. Servis sağlayıcı onayı bekleniyor.`,
      relatedModel: 'Appointment',
      relatedId: appointment1._id,
      isRead: false,
      createdAt: new Date()
    });
    
    const notification2 = await Notification.create({
      recipient: normalUser1._id,
      sender: provider2._id,
      type: 'appointment_confirmed',
      title: 'Randevunuz Onaylandı',
      message: `"${service4.name}" hizmeti için randevunuz onaylandı.`,
      relatedModel: 'Appointment',
      relatedId: appointment2._id,
      isRead: true,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 gün önce
    });
    
    const notification3 = await Notification.create({
      recipient: provider1._id,
      sender: normalUser1._id,
      type: 'appointment_created',
      title: 'Yeni Randevu Talebi',
      message: `"${service1.name}" hizmeti için yeni bir randevu talebi oluşturuldu.`,
      relatedModel: 'Appointment',
      relatedId: appointment1._id,
      isRead: false,
      createdAt: new Date()
    });
    
    // Yeni bildirimler
    const notification4 = await Notification.create({
      recipient: normalUser3._id,
      sender: provider3._id,
      type: 'appointment_created',
      title: 'Yeni Randevu Oluşturuldu',
      message: `"${service6.name}" hizmeti için randevunuz oluşturuldu. Servis sağlayıcı onayı bekleniyor.`,
      relatedModel: 'Appointment',
      relatedId: appointment4._id,
      isRead: false,
      createdAt: new Date()
    });
    
    const notification5 = await Notification.create({
      recipient: normalUser4._id,
      sender: provider4._id,
      type: 'appointment_confirmed',
      title: 'Randevunuz Onaylandı',
      message: `"${service9.name}" hizmeti için randevunuz onaylandı.`,
      relatedModel: 'Appointment',
      relatedId: appointment5._id,
      isRead: false,
      createdAt: new Date()
    });
    
    const notification6 = await Notification.create({
      recipient: normalUser5._id,
      sender: provider5._id,
      type: 'appointment_confirmed',
      title: 'Randevu Tamamlandı',
      message: `"${service12.name}" hizmeti için randevunuz tamamlandı. Deneyiminizi değerlendirmek için bir yorum bırakabilirsiniz.`,
      relatedModel: 'Appointment',
      relatedId: appointment6._id,
      isRead: true,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 gün önce
    });
    
    console.log('Bildirimler oluşturuldu');
    
    // Yeni servis sağlayıcılar - farklı statüler
    // 1. Onay bekleyen servis sağlayıcı
    const pendingProviderUser2 = await User.create({
      name: 'Hızlı Oto Yöneticisi',
      email: 'hizlioto@example.com',
      password: '123456',
      phone: '5559876540',
      role: 'provider'
    });

    const pendingProvider2 = await ServiceProvider.create({
      user: pendingProviderUser2._id,
      companyName: 'Hızlı Oto Servis',
      contactPhone: '02161234888',
      address: {
        street: 'Ataşehir Bulvarı No: 25',
        city: 'İstanbul',
        state: 'Ataşehir',
        zipCode: '34750',
        country: 'Türkiye'
      },
      location: {
        type: 'Point',
        coordinates: [29.1122, 40.9920]
      },
      description: 'Hızlı ve uygun fiyatlı oto servis hizmetleri',
      specialties: ['Lastik Değişimi', 'Araç Yıkama', 'Bakım'],
      workingHours: {
        monday: { open: '08:00', close: '20:00' },
        tuesday: { open: '08:00', close: '20:00' },
        wednesday: { open: '08:00', close: '20:00' },
        thursday: { open: '08:00', close: '20:00' },
        friday: { open: '08:00', close: '20:00' },
        saturday: { open: '09:00', close: '18:00' },
        sunday: { open: '10:00', close: '16:00' }
      },
      approved: null, // Onay bekliyor
      taxId: '5675675675',
      averageRating: 1 // En düşük puan
    });
    
    // 2. Reddedilmiş servis sağlayıcı (sahte şirket)
    const rejectedProviderUser2 = await User.create({
      name: 'Sahte Firma Yöneticisi',
      email: 'sahtefirma@example.com',
      password: '123456',
      phone: '5559876541',
      role: 'provider'
    });

    const rejectedProvider2 = await ServiceProvider.create({
      user: rejectedProviderUser2._id,
      companyName: 'Sahte Oto Servis',
      contactPhone: '02161234999',
      address: {
        street: 'Bilinmeyen Sokak No: 13',
        city: 'İstanbul',
        state: 'Şişli',
        zipCode: '34360',
        country: 'Türkiye'
      },
      location: {
        type: 'Point',
        coordinates: [29.0322, 41.0120]
      },
      description: 'Sahte belgeler ve yanlış bilgilerle reddedilmiş servis',
      specialties: ['Onarım', 'Bakım', 'Diğer'],
      workingHours: {
        monday: { open: '09:00', close: '18:00' },
        tuesday: { open: '09:00', close: '18:00' },
        wednesday: { open: '09:00', close: '18:00' },
        thursday: { open: '09:00', close: '18:00' },
        friday: { open: '09:00', close: '18:00' },
        saturday: { open: '10:00', close: '16:00' },
        sunday: { open: null, close: null }
      },
      approved: false, // Reddedilmiş
      taxId: '1112223334',
      rejectionReason: 'Belgeler geçersiz ve adres doğrulaması başarısız oldu.',
      averageRating: 1 // En düşük puan
    });
    
    // 3. Yüksek puanlı premium servis sağlayıcı
    const topRatedProviderUser = await User.create({
      name: 'Premium Oto Yöneticisi',
      email: 'premium@example.com',
      password: '123456',
      phone: '5559876539',
      role: 'provider'
    });

    const topRatedProvider = await ServiceProvider.create({
      user: topRatedProviderUser._id,
      companyName: 'Premium Oto Bakım',
      contactPhone: '02123456789',
      address: {
        street: 'Levent Caddesi No: 58',
        city: 'İstanbul',
        state: 'Beşiktaş',
        zipCode: '34330',
        country: 'Türkiye'
      },
      location: {
        type: 'Point',
        coordinates: [29.0122, 41.0820]
      },
      description: 'Lüks araçlar için özel bakım ve onarım hizmetleri',
      specialties: ['Bakım', 'Onarım', 'Detaylı Temizlik', 'Performans İyileştirme'],
      workingHours: {
        monday: { open: '09:00', close: '19:00' },
        tuesday: { open: '09:00', close: '19:00' },
        wednesday: { open: '09:00', close: '19:00' },
        thursday: { open: '09:00', close: '19:00' },
        friday: { open: '09:00', close: '19:00' },
        saturday: { open: '10:00', close: '18:00' },
        sunday: { open: '11:00', close: '16:00' }
      },
      approved: true,
      averageRating: 4.9, // Çok yüksek puan
      reviewCount: 124, // Çok sayıda değerlendirme
      taxId: '9998887776'
    });
    
    // Premium servis sağlayıcı için hizmet
    const premiumService = await Service.create({
      name: 'Lüks Araç Detaylı Bakım',
      description: 'Premium araçlar için özel bakım programı, motor, şanzıman ve süspansiyon dahil',
      price: 2500,
      duration: 240, // 4 saat
      category: 'Bakım',
      provider: topRatedProvider._id,
      isActive: true
    });
    
    // Admin için bildirim oluştur
    await Notification.create({
      recipient: adminUser._id,
      sender: pendingProvider2._id,
      type: 'system',
      title: 'Yeni Servis Sağlayıcı Onay Bekliyor',
      message: `${pendingProvider2.companyName} adlı firma onay bekliyor. İncelemek için tıklayın.`,
      relatedModel: 'ServiceProvider',
      relatedId: pendingProvider2._id
    });
    
    // Reddedilen firma için bildirim
    await Notification.create({
      recipient: rejectedProviderUser2._id,
      sender: adminUser._id,
      type: 'provider_rejected',
      title: 'Firma Başvurunuz Reddedildi',
      message: `Üzgünüz, firma başvurunuz reddedildi. Sebep: ${rejectedProvider2.rejectionReason}`,
      relatedModel: 'ServiceProvider',
      relatedId: rejectedProvider2._id
    });
    
    // Yeni servis sağlayıcılara ait randevular ve bildirimler
    const pendingAppointment = await Appointment.create({
      user: newUser._id,
      vehicle: newUserVehicle._id,
      service: pendingProviderService._id,
      provider: pendingProvider._id,
      date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3), // 3 gün sonra
      status: 'beklemede',
      notes: 'Araç içinde detaylı temizlik ve dezenfeksiyon istiyorum.',
      totalPrice: 350 // pendingProviderService.price ile aynı
    });
    
    // Yeni randevu için bildirim oluştur
    await Notification.create({
      recipient: pendingProvider._id,
      sender: newUser._id,
      type: 'appointment_created',
      title: 'Yeni Randevu Talebi',
      message: `${newUser.name} adlı kullanıcı, ${newUserVehicle.brand} ${newUserVehicle.model} aracı için randevu talep etti.`,
      relatedModel: 'Appointment',
      relatedId: pendingAppointment._id
    });
    
    // Kullanıcıya bildirim gönder
    await Notification.create({
      recipient: newUser._id, 
      sender: pendingProvider._id,
      type: 'appointment_created',
      title: 'Randevu Talebiniz Alındı',
      message: `${pendingProvider.companyName} için randevu talebiniz alındı. Onay bekliyor.`,
      relatedModel: 'Appointment',
      relatedId: pendingAppointment._id
    });
    
    console.log('Yeni servis sağlayıcılar ve ilişkili veriler oluşturuldu');

    // Yeni hizmetler ekleme
    const detailedWashingService = await Service.create({
      provider: provider1._id,
      name: 'İç ve Dış Detaylı Araç Yıkama',
      description: 'Aracınızın iç ve dış temizliği özenle yapılır. Tüm iç detaylar, koltuklar, torpido, kapı içleri temizlenir. Dış yıkama, cilalama ve parlatma işlemleri uygulanır.',
      category: 'Araç Yıkama',
      price: 350,
      duration: 120,
      isActive: true
    });

    const premiumWashingService = await Service.create({
      provider: provider1._id,
      name: 'Premium Detailing',
      description: 'En üst seviye bakım ve detaylı temizlik. Profesyonel ekibimiz aracınızı showroom kalitesinde temizler. Özel kimyasallar ve ekipmanlarla aracınız ilk günkü parlaklığına kavuşur.',
      category: 'Araç Yıkama',
      price: 750,
      duration: 240,
      isActive: true
    });

    const quickTechnicalCheck = await Service.create({
      provider: provider2._id,
      name: 'Hızlı Teknik Kontrol',
      description: 'Aracınızın temel sistemlerinin hızlı kontrolü ve muayene öncesi hazırlık.',
      category: 'Teknik Muayene',
      price: 250,
      duration: 60,
      isActive: true
    });

    const comprehensiveMaintenance = await Service.create({
      provider: provider2._id,
      name: 'Kapsamlı Bakım Paketi',
      description: 'Yağ, filtre, fren kontrolü, akü testi ve tüm sıvıların kontrol edildiği kapsamlı bakım hizmeti.',
      category: 'Bakım',
      price: 1200,
      duration: 180,
      isActive: true
    });

    console.log('Yeni hizmetler oluşturuldu');

    // Örnek kupon oluşturma
    // 1. Genel kupon - Tüm yıkama hizmetlerinde %20 indirim
    const generalCoupon = await Coupon.create({
      code: 'YIKAMA20',
      discount: 20,
      discountType: 'percentage',
      validFrom: new Date(),
      validUntil: new Date(new Date().setMonth(new Date().getMonth() + 3)), // 3 ay geçerli
      appliesTo: {
        categories: ['Araç Yıkama']
      },
      createdBy: adminUser._id
    });

    // 2. Tek kullanımlık kupon - Bakım hizmetlerinde 500 TL indirim
    const singleUseCoupon = await Coupon.create({
      code: 'BAKIM500',
      discount: 100,
      discountType: 'amount',
      validFrom: new Date(),
      validUntil: new Date(new Date().setMonth(new Date().getMonth() + 1)), // 1 ay geçerli
      isSingleUse: true,
      minimumAmount: 1000, // En az 1000 TL'lik alışverişte geçerli
      appliesTo: {
        categories: ['Bakım', 'Onarım']
      },
      createdBy: adminUser._id
    });

    console.log('Kuponlar oluşturuldu');

    console.log('Tohum işlemi tamamlandı');
    process.exit();
  } catch (error) {
    console.error('Seed hatası:', error);
    process.exit(1);
  }
};

seedDatabase(); 