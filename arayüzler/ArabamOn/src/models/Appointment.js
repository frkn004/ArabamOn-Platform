module.exports = (sequelize, DataTypes) => {
  const Appointment = sequelize.define('Appointment', {
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    time: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'beklemede',
      validate: {
        isIn: [['beklemede', 'onaylandı', 'tamamlandı', 'iptal']]
      }
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    cancelReason: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    businessId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Businesses',
        key: 'id'
      }
    },
    serviceId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Services',
        key: 'id'
      }
    }
  });

  return Appointment;
}