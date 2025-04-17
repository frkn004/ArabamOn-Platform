module.exports = (sequelize, DataTypes) => {
  const Review = sequelize.define('Review', {
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5
      }
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    isApproved: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
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
    appointmentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Appointments',
        key: 'id'
      }
    }
  });

  return Review;
}