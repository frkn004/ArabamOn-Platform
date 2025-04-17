const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
require('dotenv').config();

// SQLite dosyası varsa silelim (RESET_DB true ise)
if (process.env.RESET_DB === 'true') {
  const dbFile = path.join(process.cwd(), 'arabamon.sqlite');
  if (fs.existsSync(dbFile)) {
    console.log('Eski SQLite veritabanı siliniyor...');
    fs.unlinkSync(dbFile);
    console.log('Eski SQLite veritabanı silindi');
  }
}

// PostgreSQL veya SQLite kullanım konfigürasyonu
let sequelize;

// PostgreSQL kullanımı
if (process.env.USE_POSTGRES === 'true') {
  sequelize = new Sequelize(
    process.env.PG_DATABASE,
    process.env.PG_USER,
    process.env.PG_PASSWORD,
    {
      host: process.env.PG_HOST,
      port: process.env.PG_PORT,
      dialect: 'postgres',
      logging: process.env.DEBUG === 'true' ? console.log : false,
      ssl: process.env.PG_SSL === 'true',
      dialectOptions: process.env.PG_SSL === 'true' ? {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      } : {}
    }
  );
  console.log('PostgreSQL veritabanı yapılandırması kullanılıyor');
} 
// SQLite kullanımı (varsayılan)
else {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'arabamon.sqlite',
    logging: process.env.DEBUG === 'true' ? console.log : false,
    define: {
      freezeTableName: false
    },
    dialectOptions: {
      // SQLite için özel seçenekler
      mode: sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE | sqlite3.OPEN_FULLMUTEX,
    }
  });
  console.log('SQLite veritabanı yapılandırması kullanılıyor');
}

// Migrations ve seeders klasör yolları
const migrationsPath = path.join(__dirname, '../migrations');
const seedersPath = path.join(__dirname, '../seeders');

// Veritabanı bağlantısı
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('SQLite veritabanına bağlantı başarılı');

    // Tabloları oluştur veya güncelle (model tanımlarına göre)
    if (process.env.USE_MIGRATIONS === 'true') {
      console.log('Veritabanı tablolarını oluşturuyoruz...');
      try {
        // Tablolar oluşturuluyor
        await sequelize.sync({ force: true });
        console.log('Veritabanı tabloları başarıyla oluşturuldu');
          
        // Seeders'ları çalıştır
        if (fs.existsSync(seedersPath)) {
          await runSeeders();
        }
        
      } catch (syncError) {
        console.error('Veritabanı senkronizasyon hatası:', syncError);
        throw syncError;
      }
    }
    
    return sequelize;
  } catch (error) {
    console.error('Veritabanı bağlantı hatası:', error);
    throw error;
  }
};

// Seed dosyalarını çalıştır
const runSeeders = async () => {
  try {
    if (!fs.existsSync(seedersPath)) {
      console.log('Seeders klasörü bulunamadı, işlem atlanıyor.');
      return;
    }
    
    const seederFiles = fs.readdirSync(seedersPath)
      .filter(file => file.endsWith('.js'))
      .sort(); // Dosya adına göre sırala
    
    console.log('Seeder dosyaları çalıştırılıyor...');
    
    for (const file of seederFiles) {
      const seederPath = path.join(seedersPath, file);
      const seeder = require(seederPath);
      console.log(`Seeder çalıştırılıyor: ${file}`);
      
      // Seeder dosyasında up metodu var mı kontrol et
      if (typeof seeder.up === 'function') {
        await seeder.up(sequelize.getQueryInterface(), Sequelize);
        console.log(`Seeder tamamlandı: ${file}`);
      } else {
        console.warn(`Uyarı: ${file} dosyasında up metodu bulunamadı.`);
      }
    }
    
    console.log('Tüm seeder dosyaları başarıyla tamamlandı');
  } catch (error) {
    console.error('Seeder çalıştırılırken hata:', error);
    throw error;
  }
};

// Veritabanı bağlantısını kapama
const closeConnection = async () => {
  try {
    await sequelize.close();
    console.log('SQLite veritabanı bağlantısı kapatıldı');
  } catch (error) {
    console.error('Veritabanı bağlantısı kapatılırken hata:', error);
  }
};

module.exports = { sequelize, connectDB, closeConnection }; 