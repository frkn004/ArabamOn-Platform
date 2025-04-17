const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Users tablosu
    await queryInterface.createTable('Users', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true
      },
      role: {
        type: DataTypes.STRING,
        defaultValue: 'user'
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
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

    // Businesses tablosu
    await queryInterface.createTable('Businesses', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false
      },
      street: {
        type: DataTypes.STRING,
        allowNull: false
      },
      city: {
        type: DataTypes.STRING,
        allowNull: false
      },
      district: {
        type: DataTypes.STRING,
        allowNull: false
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
        defaultValue: false
      },
      averageRating: {
        type: DataTypes.FLOAT,
        defaultValue: 0
      },
      reviewCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      ownerId: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      }
    });

    // Services tablosu
    await queryInterface.createTable('Services', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      price: {
        type: DataTypes.FLOAT,
        allowNull: false
      },
      duration: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      businessType: {
        type: DataTypes.STRING,
        allowNull: false
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      businessId: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Businesses',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      }
    });

    // Appointments tablosu
    await queryInterface.createTable('Appointments', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
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
        defaultValue: 'beklemede'
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      cancelReason: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      userId: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      businessId: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Businesses',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      serviceId: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Services',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      }
    });

    // Reviews tablosu
    await queryInterface.createTable('Reviews', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      rating: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      comment: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      isApproved: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      userId: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      businessId: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Businesses',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      appointmentId: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Appointments',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      }
    });

    // Bildirimler tablosu
    await queryInterface.createTable('Notifications', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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
        allowNull: false
      },
      isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      relatedId: {
        type: DataTypes.INTEGER,
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
  },

  down: async (queryInterface, Sequelize) => {
    // Tabloları sil (tersine işlem)
    await queryInterface.dropTable('Notifications');
    await queryInterface.dropTable('Reviews');
    await queryInterface.dropTable('Appointments');
    await queryInterface.dropTable('Services');
    await queryInterface.dropTable('Businesses');
    await queryInterface.dropTable('Users');
  }
}; 

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Users tablosu
    await queryInterface.createTable('Users', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true
      },
      role: {
        type: DataTypes.STRING,
        defaultValue: 'user'
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
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

    // Businesses tablosu
    await queryInterface.createTable('Businesses', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false
      },
      street: {
        type: DataTypes.STRING,
        allowNull: false
      },
      city: {
        type: DataTypes.STRING,
        allowNull: false
      },
      district: {
        type: DataTypes.STRING,
        allowNull: false
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
        defaultValue: false
      },
      averageRating: {
        type: DataTypes.FLOAT,
        defaultValue: 0
      },
      reviewCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      ownerId: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      }
    });

    // Services tablosu
    await queryInterface.createTable('Services', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      price: {
        type: DataTypes.FLOAT,
        allowNull: false
      },
      duration: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      businessType: {
        type: DataTypes.STRING,
        allowNull: false
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      businessId: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Businesses',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      }
    });

    // Appointments tablosu
    await queryInterface.createTable('Appointments', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
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
        defaultValue: 'beklemede'
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      cancelReason: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      userId: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      businessId: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Businesses',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      serviceId: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Services',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      }
    });

    // Reviews tablosu
    await queryInterface.createTable('Reviews', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      rating: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      comment: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      isApproved: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      userId: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      businessId: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Businesses',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      appointmentId: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Appointments',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      }
    });

    // Bildirimler tablosu
    await queryInterface.createTable('Notifications', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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
        allowNull: false
      },
      isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      relatedId: {
        type: DataTypes.INTEGER,
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
  },

  down: async (queryInterface, Sequelize) => {
    // Tabloları sil (tersine işlem)
    await queryInterface.dropTable('Notifications');
    await queryInterface.dropTable('Reviews');
    await queryInterface.dropTable('Appointments');
    await queryInterface.dropTable('Services');
    await queryInterface.dropTable('Businesses');
    await queryInterface.dropTable('Users');
  }
}; 