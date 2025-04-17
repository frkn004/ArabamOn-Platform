const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // WorkingHours tablosu oluştur
    await queryInterface.createTable('WorkingHours', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      businessId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Businesses',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      day: {
        type: DataTypes.STRING,
        allowNull: false
      },
      isOpen: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      openTime: {
        type: DataTypes.STRING,
        allowNull: true
      },
      closeTime: {
        type: DataTypes.STRING,
        allowNull: true
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      }
    });

    // Benzersiz kısıt ekle (bir işletmenin her gün için sadece bir çalışma saati kaydı olabilir)
    await queryInterface.addConstraint('WorkingHours', {
      fields: ['businessId', 'day'],
      type: 'unique',
      name: 'unique_business_day'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Tabloyu sil
    await queryInterface.dropTable('WorkingHours');
  }
}; 

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // WorkingHours tablosu oluştur
    await queryInterface.createTable('WorkingHours', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      businessId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Businesses',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      day: {
        type: DataTypes.STRING,
        allowNull: false
      },
      isOpen: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      openTime: {
        type: DataTypes.STRING,
        allowNull: true
      },
      closeTime: {
        type: DataTypes.STRING,
        allowNull: true
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      }
    });

    // Benzersiz kısıt ekle (bir işletmenin her gün için sadece bir çalışma saati kaydı olabilir)
    await queryInterface.addConstraint('WorkingHours', {
      fields: ['businessId', 'day'],
      type: 'unique',
      name: 'unique_business_day'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Tabloyu sil
    await queryInterface.dropTable('WorkingHours');
  }
}; 