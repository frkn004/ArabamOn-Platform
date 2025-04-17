module.exports = (sequelize, DataTypes) => {
  const WorkingHours = sequelize.define('WorkingHours', {
    day: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: {
          args: [['pazartesi', 'sali', 'carsamba', 'persembe', 'cuma', 'cumartesi', 'pazar']],
          msg: 'Geçerli bir gün giriniz'
        }
      }
    },
    openTime: {
      type: DataTypes.STRING,
      allowNull: true
    },
    closeTime: {
      type: DataTypes.STRING,
      allowNull: true
    },
    isClosed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    businessId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Businesses',
        key: 'id'
      }
    }
  });

  return WorkingHours;
}