module.exports = (sequelize, DataTypes) => {
  const Service = sequelize.define('Service', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Hizmet adı gereklidir' }
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: { args: [0], msg: 'Fiyat 0\'dan büyük olmalıdır' }
      }
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: { args: [5], msg: 'Süre en az 5 dakika olmalıdır' }
      },
      comment: 'Dakika cinsinden süre'
    },
    businessType: {
      type: DataTypes.STRING,
      allowNull: false
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    businessId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Businesses',
        key: 'id'
      }
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true
    }
  });

  return Service;
}