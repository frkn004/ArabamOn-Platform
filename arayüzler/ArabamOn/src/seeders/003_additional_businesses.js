const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Yeni işletme sahipleri
    await queryInterface.bulkInsert('Users', [
      {
        name: 'Ahmet Yılmaz',
        email: 'ahmet@arabamon.com',
        password: bcrypt.hashSync('123456', 10),
        phone: '5551234570',
        role: 'business',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Mehmet Kaya',
        email: 'mehmet@arabamon.com',
        password: bcrypt.hashSync('123456', 10),
        phone: '5551234571',
        role: 'business',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Ayşe Demir',
        email: 'ayse@arabamon.com',
        password: bcrypt.hashSync('123456', 10),
        phone: '5551234572',
        role: 'business',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    // Kullanıcı ID'lerini alın (4, 5, 6 olacak çünkü önceki seeder'da 3 kullanıcı vardı)
    const users = await queryInterface.sequelize.query(
      'SELECT id FROM Users WHERE email IN (\'ahmet@arabamon.com\', \'mehmet@arabamon.com\', \'ayse@arabamon.com\')',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    // Yeni işletmeler - Her sektör için ikişer firma
    const businesses = await queryInterface.bulkInsert('Businesses', [
      // Araç Yıkama İşletmeleri (1 tane zaten vardı)
      {
        name: 'Parlak Oto Yıkama',
        type: 'aracyikama',
        email: 'info@parlakoto.com',
        phone: '02161234577',
        street: 'İnönü Cad. No:45',
        city: 'İstanbul',
        district: 'Ataşehir',
        latitude: 40.9823307,
        longitude: 29.1044229,
        description: 'Yüksek kalitede araç yıkama ve bakım hizmetleri sunan profesyonel tesisimiz.',
        isActive: true,
        averageRating: 4.5,
        reviewCount: 32,
        ownerId: users[0].id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // Ekspertiz İşletmeleri (1 tane zaten vardı)
      {
        name: 'Detaylı Ekspertiz',
        type: 'ekspertiz',
        email: 'info@detayliekspertiz.com',
        phone: '02161234578',
        street: 'Bağdat Cad. No:120',
        city: 'İstanbul',
        district: 'Kartal',
        latitude: 40.9423307,
        longitude: 29.1844229,
        description: 'En yeni teknolojik ekipmanlarla detaylı ve güvenilir ekspertiz hizmetleri.',
        isActive: true,
        averageRating: 4.7,
        reviewCount: 28,
        ownerId: users[0].id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // Otopark İşletmeleri (1 tane zaten vardı)
      {
        name: 'Merkez Kapalı Otopark',
        type: 'otopark',
        email: 'info@merkezotopark.com',
        phone: '02161234579',
        street: 'Merkez Mah. No:15',
        city: 'İstanbul',
        district: 'Şişli',
        latitude: 41.0323307,
        longitude: 29.0244229,
        description: 'Şehir merkezinde 24 saat güvenlikli ve kameralı kapalı otopark.',
        isActive: true,
        averageRating: 4.6,
        reviewCount: 35,
        ownerId: users[1].id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // Lastik Değişim İşletmeleri (1 tane zaten vardı)
      {
        name: 'Profesyonel Lastik Servisi',
        type: 'lastikdegisim',
        email: 'info@prolastik.com',
        phone: '02121234580',
        street: 'Sanayi Cad. No:48',
        city: 'İstanbul',
        district: 'Beylikdüzü',
        latitude: 41.0123307,
        longitude: 28.9744229,
        description: 'Tüm lastik markaları için satış, montaj ve bakım hizmetleri.',
        isActive: true,
        averageRating: 4.9,
        reviewCount: 42,
        ownerId: users[1].id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // Ek araç yıkama işletmesi
      {
        name: 'VIP Detaylı Oto Bakım',
        type: 'aracyikama',
        email: 'info@vipotobakım.com',
        phone: '02161234581',
        street: 'Atatürk Bulvarı No:150',
        city: 'Ankara',
        district: 'Çankaya',
        latitude: 39.9123307,
        longitude: 32.8644229,
        description: 'Lüks araçlar için özel bakım ve detaylı temizlik hizmetleri.',
        isActive: true,
        averageRating: 4.9,
        reviewCount: 38,
        ownerId: users[2].id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // Ek ekspertiz işletmesi
      {
        name: 'Teknik Ekspertiz Merkezi',
        type: 'ekspertiz',
        email: 'info@teknikekspertiz.com',
        phone: '02161234582',
        street: 'Organize Sanayi Bölgesi No:25',
        city: 'Bursa',
        district: 'Nilüfer',
        latitude: 40.2123307,
        longitude: 29.0744229,
        description: 'Araç alım satımında güvenilir ekspertiz hizmetleri.',
        isActive: true,
        averageRating: 4.4,
        reviewCount: 22,
        ownerId: users[2].id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // Ek otopark işletmesi
      {
        name: 'Elit Rezidans Otoparkı',
        type: 'otopark',
        email: 'info@elitotopark.com',
        phone: '02161234583',
        street: 'Bahçelievler Mah. No:75',
        city: 'İzmir',
        district: 'Konak',
        latitude: 38.4123307,
        longitude: 27.1444229,
        description: 'Yüksek güvenlikli, modern rezidans ve plaza otoparkı.',
        isActive: true,
        averageRating: 4.8,
        reviewCount: 25,
        ownerId: users[2].id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // Ek lastik değişim işletmesi
      {
        name: 'Usta Lastik ve Balans',
        type: 'lastikdegisim',
        email: 'info@ustalastik.com',
        phone: '02121234584',
        street: 'İstiklal Cad. No:108',
        city: 'Antalya',
        district: 'Kepez',
        latitude: 36.9123307,
        longitude: 30.7144229,
        description: '30 yıllık tecrübe ile lastik değişimi, rot ve balans ayarı.',
        isActive: true,
        averageRating: 4.6,
        reviewCount: 31,
        ownerId: users[2].id,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], { returning: true });

    // Yeni işletmelerin ID'lerini alın
    const newBusinessIds = await queryInterface.sequelize.query(
      'SELECT id, type FROM Businesses WHERE name IN (\'Parlak Oto Yıkama\', \'Detaylı Ekspertiz\', \'Merkez Kapalı Otopark\', \'Profesyonel Lastik Servisi\', \'VIP Detaylı Oto Bakım\', \'Teknik Ekspertiz Merkezi\', \'Elit Rezidans Otoparkı\', \'Usta Lastik ve Balans\')',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    // Her işletme için hizmetler ekliyoruz
    const services = [];
    for (const business of newBusinessIds) {
      if (business.type === 'aracyikama') {
        services.push(
          {
            name: 'Dış Yıkama',
            description: 'Aracın dış yüzeyi için temel yıkama hizmeti.',
            price: 100,
            duration: 20, // dakika
            businessType: 'aracyikama',
            isActive: true,
            businessId: business.id,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            name: 'Detaylı İç Temizlik',
            description: 'Kapsamlı iç temizlik, koltuk yıkama ve dezenfeksiyon.',
            price: 200,
            duration: 45, // dakika
            businessType: 'aracyikama',
            isActive: true,
            businessId: business.id,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            name: 'Seramik Kaplama',
            description: 'Uzun süreli koruma sağlayan seramik kaplama uygulaması.',
            price: 1500,
            duration: 180, // dakika
            businessType: 'aracyikama',
            isActive: true,
            businessId: business.id,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        );
      } else if (business.type === 'ekspertiz') {
        services.push(
          {
            name: 'Hızlı Ekspertiz',
            description: 'Aracın temel durumunu belirleyen hızlı kontrol.',
            price: 300,
            duration: 30, // dakika
            businessType: 'ekspertiz',
            isActive: true,
            businessId: business.id,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            name: 'Tam Ekspertiz',
            description: 'Aracın tüm detaylarıyla incelendiği kapsamlı ekspertiz.',
            price: 600,
            duration: 60, // dakika
            businessType: 'ekspertiz',
            isActive: true,
            businessId: business.id,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            name: 'Özel Ekspertiz Raporu',
            description: 'Fotoğraflı ve detaylı raporlama ile özel ekspertiz hizmeti.',
            price: 800,
            duration: 90, // dakika
            businessType: 'ekspertiz',
            isActive: true,
            businessId: business.id,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        );
      } else if (business.type === 'otopark') {
        services.push(
          {
            name: 'Saatlik Park',
            description: 'Kısa süreli otopark hizmeti.',
            price: 20,
            duration: 60, // dakika
            businessType: 'otopark',
            isActive: true,
            businessId: business.id,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            name: 'Aylık Abonelik',
            description: '30 gün boyunca sınırsız park hakkı.',
            price: 1200,
            duration: 43200, // dakika (30 gün)
            businessType: 'otopark',
            isActive: true,
            businessId: business.id,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            name: 'VIP Park',
            description: 'Özel ayrılmış alanlarda güvenlikli park hizmeti.',
            price: 50,
            duration: 60, // dakika
            businessType: 'otopark',
            isActive: true,
            businessId: business.id,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        );
      } else if (business.type === 'lastikdegisim') {
        services.push(
          {
            name: 'Tek Lastik Değişimi',
            description: 'Tek lastik için sökme, takma ve balans ayarı.',
            price: 120,
            duration: 20, // dakika
            businessType: 'lastikdegisim',
            isActive: true,
            businessId: business.id,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            name: 'Rot Ayarı',
            description: 'Araç tekerlek düzeni ve yön ayarlaması.',
            price: 250,
            duration: 40, // dakika
            businessType: 'lastikdegisim',
            isActive: true,
            businessId: business.id,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            name: 'Lastik Kontrolü',
            description: 'Lastik basıncı ve durumu için detaylı kontrol.',
            price: 50,
            duration: 15, // dakika
            businessType: 'lastikdegisim',
            isActive: true,
            businessId: business.id,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        );
      }
    }

    // Hizmetleri ekleyin
    await queryInterface.bulkInsert('Services', services);

    // İşletmelere yorumlar ekleyelim
    const reviews = [];
    for (const business of newBusinessIds) {
      for (let i = 0; i < 5; i++) {
        reviews.push({
          rating: Math.floor(Math.random() * 2) + 4, // 4 veya 5 yıldız
          comment: [
            'Çok memnun kaldım, kesinlikle tavsiye ederim.',
            'Harika bir hizmet, çalışanlar çok ilgiliydi.',
            'Fiyat/performans açısından oldukça başarılı.',
            'Beklentilerimin üzerinde bir deneyimdi.',
            'Profesyonel hizmet anlayışı için teşekkürler.'
          ][i],
          isApproved: true,
          userId: 3, // Normal kullanıcı
          businessId: business.id,
          appointmentId: null,
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000), // Son 30 gün içinde
          updatedAt: new Date()
        });
      }
    }

    // Yorumları ekleyin
    await queryInterface.bulkInsert('Reviews', reviews);

    // Çalışma saatlerini ekleyelim
    const workingHours = [];
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    for (const business of newBusinessIds) {
      for (const day of days) {
        // Pazar günü bazı işletmeler kapalı olsun
        const isSunday = day === 'sunday';
        const isClosed = isSunday && Math.random() > 0.5;
        
        workingHours.push({
          businessId: business.id,
          day,
          isClosed: isClosed,
          openTime: isClosed ? null : (business.type === 'otopark' ? '00:00' : '09:00'),
          closeTime: isClosed ? null : (business.type === 'otopark' ? '23:59' : '18:00'),
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    }

    // Çalışma saatlerini ekleyin
    await queryInterface.bulkInsert('WorkingHours', workingHours);

    console.log('Ek işletmeler ve ilgili veriler başarıyla eklendi');
  },

  down: async (queryInterface, Sequelize) => {
    // Eklenen verileri temizle
    await queryInterface.bulkDelete('WorkingHours', null, {});
    await queryInterface.bulkDelete('Reviews', null, {});
    await queryInterface.bulkDelete('Services', null, {});
    await queryInterface.bulkDelete('Businesses', null, {});
    await queryInterface.bulkDelete('Users', { email: ['ahmet@arabamon.com', 'mehmet@arabamon.com', 'ayse@arabamon.com'] });
  }
}; 