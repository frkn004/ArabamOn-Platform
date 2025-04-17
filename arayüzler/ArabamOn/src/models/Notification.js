module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define('Notification', {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [['appointment', 'review', 'system', 'reminder']]
      }
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    relatedId: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  });

  return Notification;
}