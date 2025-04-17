const { sequelize } = require('../config/database');
const Sequelize = require('sequelize');

// Model tanımları
const User = require('./User')(sequelize, Sequelize);
const Business = require('./Business')(sequelize, Sequelize);
const Service = require('./Service')(sequelize, Sequelize);
const Appointment = require('./Appointment')(sequelize, Sequelize);
const Review = require('./Review')(sequelize, Sequelize);
const WorkingHours = require('./WorkingHours')(sequelize, Sequelize);
const Notification = require('./Notification')(sequelize, Sequelize);

// İlişkiler
// Kullanıcı - İşletme ilişkisi
User.hasMany(Business, { foreignKey: 'ownerId', as: 'businesses' });
Business.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });

// İşletme - Hizmet ilişkisi
Business.hasMany(Service, { foreignKey: 'businessId', as: 'services' });
Service.belongsTo(Business, { foreignKey: 'businessId', as: 'business' });

// İşletme - Çalışma Saatleri ilişkisi
Business.hasMany(WorkingHours, { foreignKey: 'businessId', as: 'workingHours' });
WorkingHours.belongsTo(Business, { foreignKey: 'businessId', as: 'business' });

// Kullanıcı - Randevu ilişkisi
User.hasMany(Appointment, { foreignKey: 'userId', as: 'appointments' });
Appointment.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// İşletme - Randevu ilişkisi
Business.hasMany(Appointment, { foreignKey: 'businessId', as: 'appointments' });
Appointment.belongsTo(Business, { foreignKey: 'businessId', as: 'business' });

// Hizmet - Randevu ilişkisi
Service.hasMany(Appointment, { foreignKey: 'serviceId', as: 'appointments' });
Appointment.belongsTo(Service, { foreignKey: 'serviceId', as: 'service' });

// Kullanıcı - Değerlendirme ilişkisi
User.hasMany(Review, { foreignKey: 'userId', as: 'reviews' });
Review.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// İşletme - Değerlendirme ilişkisi
Business.hasMany(Review, { foreignKey: 'businessId', as: 'reviews' });
Review.belongsTo(Business, { foreignKey: 'businessId', as: 'business' });

// Randevu - Değerlendirme ilişkisi
Appointment.hasOne(Review, { foreignKey: 'appointmentId', as: 'review' });
Review.belongsTo(Appointment, { foreignKey: 'appointmentId', as: 'appointment' });

// Kullanıcı - Bildirim ilişkisi
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Modelleri dışa aktar
const db = {
  User,
  Business,
  Service,
  Appointment,
  Review,
  WorkingHours,
  Notification,
  sequelize,
  Sequelize
};

module.exports = db;
