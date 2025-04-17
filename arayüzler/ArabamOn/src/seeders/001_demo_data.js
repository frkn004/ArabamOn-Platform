const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Demo kullanıcılar
    await queryInterface.bulkInsert('Users', [
      {
        name: 'Admin Kullanıcı',
        email: 'admin@arabamon.com',
        password: bcrypt.hashSync('123456', 10),
        phone: '5551234567',
        role: 'admin',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'İşletme Sahibi',
        email: 'business@arabamon.com',
        password: bcrypt.hashSync('123456', 10),
        phone: '5551234568',
        role: 'business',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Normal Kullanıcı',
        email: 'user@arabamon.com',
        password: bcrypt.hashSync('123456', 10),
        phone: '5551234569',
        role: 'user',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    // Demo işletmeler
    const businesses = await queryInterface.bulkInsert('Businesses', [
      {
        name: 'Kristal Oto Yıkama',
        type: 'aracyikama',
        email: 'info@kristalyikama.com',
        phone: '02161234567',
        street: 'Atatürk Cad. No:123',
        city: 'İstanbul',
        district: 'Kadıköy',
        latitude: 40.9923307,
        longitude: 29.1244229,
        description: 'Premium araç yıkama ve detaylı iç temizlik hizmetleri sunuyoruz.',
        isActive: true,
        averageRating: 4.8,
        reviewCount: 45,
        ownerId: 2, // İşletme sahibi kullanıcı ID'si
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Pro Ekspertiz Merkezi',
        type: 'ekspertiz',
        email: 'info@proekspertiz.com',
        phone: '02161234568',
        street: 'Bağdat Cad. No:45',
        city: 'İstanbul',
        district: 'Maltepe',
        latitude: 40.9623307,
        longitude: 29.1044229,
        description: 'Profesyonel ekibimizle araç ekspertiz ve değerleme hizmetleri veriyoruz.',
        isActive: true,
        averageRating: 4.6,
        reviewCount: 38,
        ownerId: 2, // İşletme sahibi kullanıcı ID'si
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Güvenli Otopark',
        type: 'otopark',
        email: 'info@guvenliotopark.com',
        phone: '02161234569',
        street: 'Yeşilçam Sok. No:7',
        city: 'İstanbul',
        district: 'Beşiktaş',
        latitude: 41.0423307,
        longitude: 29.0044229,
        description: '7/24 güvenlikli, kameralı, modern otopark çözümleri.',
        isActive: true,
        averageRating: 4.7,
        reviewCount: 29,
        ownerId: 2, // İşletme sahibi kullanıcı ID'si
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Hızlı Lastik Değişim',
        type: 'lastikdegisim',
        email: 'info@hizlilastik.com',
        phone: '02121234570',
        street: 'Cumhuriyet Cad. No:28',
        city: 'İstanbul',
        district: 'Şişli',
        latitude: 41.0523307,
        longitude: 29.0144229,
        description: 'Tüm marka ve ebatlarda lastik değişimi, balans ve rot ayarı hizmetleri.',
        isActive: true,
        averageRating: 4.5,
        reviewCount: 32,
        ownerId: 2, // İşletme sahibi kullanıcı ID'si
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], { returning: true });

    // Demo hizmetler
    const services = await queryInterface.bulkInsert('Services', [
      // Araç Yıkama Hizmetleri
      {
        name: 'Standart Yıkama',
        description: 'Dış yıkama, iç süpürme ve kurutma.',
        price: 120,
        duration: 30, // dakika
        businessType: 'aracyikama',
        isActive: true,
        businessId: 1, // Hızlı Araç Yıkama
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Premium Yıkama',
        description: 'Detaylı dış yıkama, iç temizlik, cilalama ve koruma.',
        price: 250,
        duration: 60, // dakika
        businessType: 'aracyikama',
        isActive: true,
        businessId: 1, // Hızlı Araç Yıkama
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // Ekspertiz Hizmetleri
      {
        name: 'Temel Ekspertiz',
        description: 'Aracın temel kontrollerini içeren ekspertiz raporu.',
        price: 400,
        duration: 45, // dakika
        businessType: 'ekspertiz',
        isActive: true,
        businessId: 2, // Pro Ekspertiz Merkezi
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Detaylı Ekspertiz',
        description: 'Aracın tüm bileşenlerinin kapsamlı kontrolü ve raporlanması.',
        price: 750,
        duration: 90, // dakika
        businessType: 'ekspertiz',
        isActive: true,
        businessId: 2, // Pro Ekspertiz Merkezi
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // Otopark Hizmetleri
      {
        name: 'Günlük Park',
        description: 'Aracınız için 24 saatlik güvenli park hizmeti.',
        price: 150,
        duration: 1440, // dakika (24 saat)
        businessType: 'otopark',
        isActive: true,
        businessId: 3, // Güvenli Otopark
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Haftalık Park',
        description: '7 günlük otopark hizmeti, indirimli fiyat avantajıyla.',
        price: 900,
        duration: 10080, // dakika (7 gün)
        businessType: 'otopark',
        isActive: true,
        businessId: 3, // Güvenli Otopark
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // Lastik Değişim Hizmetleri
      {
        name: 'Lastik Değişimi (4 Adet)',
        description: 'Dört lastiğin sökülmesi ve takılması, balans ayarı dahil.',
        price: 400,
        duration: 60, // dakika
        businessType: 'lastikdegisim',
        isActive: true,
        businessId: 4, // Hızlı Lastik Değişim
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Lastik Rotasyonu',
        description: 'Lastiklerin aşınmasını eşitlemek için yer değiştirme işlemi.',
        price: 150,
        duration: 30, // dakika
        businessType: 'lastikdegisim',
        isActive: true,
        businessId: 4, // Hızlı Lastik Değişim
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], { returning: true });

    // Demo randevular
    await queryInterface.bulkInsert('Appointments', [
      {
        date: '2023-12-15',
        time: '10:00',
        status: 'onaylandı',
        notes: 'Lütfen aracın içinde değerli eşya bırakmayın',
        userId: 3, // Normal kullanıcı
        businessId: 1, // Kristal Oto Yıkama
        serviceId: 2, // İç-Dış Detaylı Yıkama
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        date: '2023-12-20',
        time: '14:30',
        status: 'beklemede',
        notes: '',
        userId: 3, // Normal kullanıcı
        businessId: 2, // Pro Ekspertiz Merkezi
        serviceId: 4, // Temel Ekspertiz
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    // Demo değerlendirmeler
    await queryInterface.bulkInsert('Reviews', [
      {
        rating: 5,
        comment: 'Çok memnun kaldım, aracım tertemiz oldu. Fiyat/performans açısından harika.',
        isApproved: true,
        userId: 3, // Normal kullanıcı
        businessId: 1, // Kristal Oto Yıkama
        appointmentId: null,
        createdAt: new Date('2023-10-15'),
        updatedAt: new Date('2023-10-15')
      },
      {
        rating: 4,
        comment: 'Ekspertiz raporları çok detaylı hazırlanıyor, teşekkürler.',
        isApproved: true,
        userId: 3, // Normal kullanıcı
        businessId: 2, // Pro Ekspertiz Merkezi
        appointmentId: null,
        createdAt: new Date('2023-09-22'),
        updatedAt: new Date('2023-09-22')
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    // Verileri sil (tersine işlem)
    await queryInterface.bulkDelete('Reviews', null, {});
    await queryInterface.bulkDelete('Appointments', null, {});
    await queryInterface.bulkDelete('Services', null, {});
    await queryInterface.bulkDelete('Businesses', null, {});
    await queryInterface.bulkDelete('Users', null, {});
  }
}; 

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Demo kullanıcılar
    await queryInterface.bulkInsert('Users', [
      {
        name: 'Admin Kullanıcı',
        email: 'admin@arabamon.com',
        password: bcrypt.hashSync('123456', 10),
        phone: '5551234567',
        role: 'admin',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'İşletme Sahibi',
        email: 'business@arabamon.com',
        password: bcrypt.hashSync('123456', 10),
        phone: '5551234568',
        role: 'business',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Normal Kullanıcı',
        email: 'user@arabamon.com',
        password: bcrypt.hashSync('123456', 10),
        phone: '5551234569',
        role: 'user',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    // Demo işletmeler
    const businesses = await queryInterface.bulkInsert('Businesses', [
      {
        name: 'Kristal Oto Yıkama',
        type: 'aracyikama',
        email: 'info@kristalyikama.com',
        phone: '02161234567',
        street: 'Atatürk Cad. No:123',
        city: 'İstanbul',
        district: 'Kadıköy',
        latitude: 40.9923307,
        longitude: 29.1244229,
        description: 'Premium araç yıkama ve detaylı iç temizlik hizmetleri sunuyoruz.',
        isActive: true,
        averageRating: 4.8,
        reviewCount: 45,
        ownerId: 2, // İşletme sahibi kullanıcı ID'si
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Pro Ekspertiz Merkezi',
        type: 'ekspertiz',
        email: 'info@proekspertiz.com',
        phone: '02161234568',
        street: 'Bağdat Cad. No:45',
        city: 'İstanbul',
        district: 'Maltepe',
        latitude: 40.9623307,
        longitude: 29.1044229,
        description: 'Profesyonel ekibimizle araç ekspertiz ve değerleme hizmetleri veriyoruz.',
        isActive: true,
        averageRating: 4.6,
        reviewCount: 38,
        ownerId: 2, // İşletme sahibi kullanıcı ID'si
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Güvenli Otopark',
        type: 'otopark',
        email: 'info@guvenliotopark.com',
        phone: '02161234569',
        street: 'Yeşilçam Sok. No:7',
        city: 'İstanbul',
        district: 'Beşiktaş',
        latitude: 41.0423307,
        longitude: 29.0044229,
        description: '7/24 güvenlikli, kameralı, modern otopark çözümleri.',
        isActive: true,
        averageRating: 4.7,
        reviewCount: 29,
        ownerId: 2, // İşletme sahibi kullanıcı ID'si
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Hızlı Lastik Değişim',
        type: 'lastikdegisim',
        email: 'info@hizlilastik.com',
        phone: '02121234570',
        street: 'Cumhuriyet Cad. No:28',
        city: 'İstanbul',
        district: 'Şişli',
        latitude: 41.0523307,
        longitude: 29.0144229,
        description: 'Tüm marka ve ebatlarda lastik değişimi, balans ve rot ayarı hizmetleri.',
        isActive: true,
        averageRating: 4.5,
        reviewCount: 32,
        ownerId: 2, // İşletme sahibi kullanıcı ID'si
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], { returning: true });

    // Demo hizmetler
    const services = await queryInterface.bulkInsert('Services', [
      // Araç Yıkama Hizmetleri
      {
        name: 'Standart Yıkama',
        description: 'Dış yıkama, iç süpürme ve kurutma.',
        price: 120,
        duration: 30, // dakika
        businessType: 'aracyikama',
        isActive: true,
        businessId: 1, // Hızlı Araç Yıkama
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Premium Yıkama',
        description: 'Detaylı dış yıkama, iç temizlik, cilalama ve koruma.',
        price: 250,
        duration: 60, // dakika
        businessType: 'aracyikama',
        isActive: true,
        businessId: 1, // Hızlı Araç Yıkama
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // Ekspertiz Hizmetleri
      {
        name: 'Temel Ekspertiz',
        description: 'Aracın temel kontrollerini içeren ekspertiz raporu.',
        price: 400,
        duration: 45, // dakika
        businessType: 'ekspertiz',
        isActive: true,
        businessId: 2, // Pro Ekspertiz Merkezi
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Detaylı Ekspertiz',
        description: 'Aracın tüm bileşenlerinin kapsamlı kontrolü ve raporlanması.',
        price: 750,
        duration: 90, // dakika
        businessType: 'ekspertiz',
        isActive: true,
        businessId: 2, // Pro Ekspertiz Merkezi
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // Otopark Hizmetleri
      {
        name: 'Günlük Park',
        description: 'Aracınız için 24 saatlik güvenli park hizmeti.',
        price: 150,
        duration: 1440, // dakika (24 saat)
        businessType: 'otopark',
        isActive: true,
        businessId: 3, // Güvenli Otopark
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Haftalık Park',
        description: '7 günlük otopark hizmeti, indirimli fiyat avantajıyla.',
        price: 900,
        duration: 10080, // dakika (7 gün)
        businessType: 'otopark',
        isActive: true,
        businessId: 3, // Güvenli Otopark
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // Lastik Değişim Hizmetleri
      {
        name: 'Lastik Değişimi (4 Adet)',
        description: 'Dört lastiğin sökülmesi ve takılması, balans ayarı dahil.',
        price: 400,
        duration: 60, // dakika
        businessType: 'lastikdegisim',
        isActive: true,
        businessId: 4, // Hızlı Lastik Değişim
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Lastik Rotasyonu',
        description: 'Lastiklerin aşınmasını eşitlemek için yer değiştirme işlemi.',
        price: 150,
        duration: 30, // dakika
        businessType: 'lastikdegisim',
        isActive: true,
        businessId: 4, // Hızlı Lastik Değişim
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], { returning: true });

    // Demo randevular
    await queryInterface.bulkInsert('Appointments', [
      {
        date: '2023-12-15',
        time: '10:00',
        status: 'onaylandı',
        notes: 'Lütfen aracın içinde değerli eşya bırakmayın',
        userId: 3, // Normal kullanıcı
        businessId: 1, // Kristal Oto Yıkama
        serviceId: 2, // İç-Dış Detaylı Yıkama
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        date: '2023-12-20',
        time: '14:30',
        status: 'beklemede',
        notes: '',
        userId: 3, // Normal kullanıcı
        businessId: 2, // Pro Ekspertiz Merkezi
        serviceId: 4, // Temel Ekspertiz
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    // Demo değerlendirmeler
    await queryInterface.bulkInsert('Reviews', [
      {
        rating: 5,
        comment: 'Çok memnun kaldım, aracım tertemiz oldu. Fiyat/performans açısından harika.',
        isApproved: true,
        userId: 3, // Normal kullanıcı
        businessId: 1, // Kristal Oto Yıkama
        appointmentId: null,
        createdAt: new Date('2023-10-15'),
        updatedAt: new Date('2023-10-15')
      },
      {
        rating: 4,
        comment: 'Ekspertiz raporları çok detaylı hazırlanıyor, teşekkürler.',
        isApproved: true,
        userId: 3, // Normal kullanıcı
        businessId: 2, // Pro Ekspertiz Merkezi
        appointmentId: null,
        createdAt: new Date('2023-09-22'),
        updatedAt: new Date('2023-09-22')
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    // Verileri sil (tersine işlem)
    await queryInterface.bulkDelete('Reviews', null, {});
    await queryInterface.bulkDelete('Appointments', null, {});
    await queryInterface.bulkDelete('Services', null, {});
    await queryInterface.bulkDelete('Businesses', null, {});
    await queryInterface.bulkDelete('Users', null, {});
  }
}; 