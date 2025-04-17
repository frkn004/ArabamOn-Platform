module.exports = {
  up: async (queryInterface, Sequelize) => {
    const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const businessIds = [1, 2, 3, 4]; // 4 işletme var artık
    
    const workingHoursData = [];
    
    // Her işletme için çalışma saatleri oluştur
    businessIds.forEach(businessId => {
      daysOfWeek.forEach(day => {
        const isWeekend = day === 'saturday' || day === 'sunday';
        const isSunday = day === 'sunday';
        
        // İşletme türüne göre farklı çalışma saatleri
        let openTime, closeTime, isClosed;
        
        if (businessId === 1) { // Araç Yıkama - haftasonları da açık
          isClosed = false;
          openTime = isWeekend ? '09:00' : '08:00';
          closeTime = isWeekend ? '18:00' : '20:00';
        } else if (businessId === 2) { // Ekspertiz - pazar kapalı
          isClosed = isSunday;
          openTime = '09:00';
          closeTime = '18:00';
        } else if (businessId === 3) { // Otopark - 7/24 açık
          isClosed = false;
          openTime = '00:00';
          closeTime = '23:59';
        } else if (businessId === 4) { // Lastik Değişim - pazar kapalı, cumartesi yarım gün
          isClosed = isSunday;
          openTime = '08:30';
          closeTime = day === 'saturday' ? '14:00' : '19:00';
        }
        
        workingHoursData.push({
          businessId,
          day,
          isClosed,
          openTime,
          closeTime,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      });
    });
    
    // Çalışma saatlerini ekle
    await queryInterface.bulkInsert('WorkingHours', workingHoursData);
  },

  down: async (queryInterface, Sequelize) => {
    // Çalışma saatlerini sil
    await queryInterface.bulkDelete('WorkingHours', null, {});
  }
}; 