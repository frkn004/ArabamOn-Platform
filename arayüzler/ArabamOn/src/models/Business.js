module.exports = (sequelize, DataTypes) => {
  const Business = sequelize.define('Business', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'İşletme adı zorunludur' }
      }
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'İşletme türü zorunludur' },
        isIn: {
          args: [['aracyikama', 'ekspertiz', 'otopark', 'lastikdegisim']],
          msg: 'İşletme türü şunlardan biri olmalıdır: Araç Yıkama, Ekspertiz, Otopark, Lastik Değişim'
        }
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: { msg: 'Geçerli bir e-posta adresi giriniz' }
      }
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Telefon numarası zorunludur' }
      }
    },
    street: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Adres bilgisi zorunludur' }
      }
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Şehir bilgisi zorunludur' }
      }
    },
    district: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'İlçe bilgisi zorunludur' }
      }
    },
    latitude: {
      type: DataTypes.FLOAT,
      defaultValue: 0
    },
    longitude: {
      type: DataTypes.FLOAT,
      defaultValue: 0
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    averageRating: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 5
      }
    },
    reviewCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    ownerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    }
  });

  return Business;
}