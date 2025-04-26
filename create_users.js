db = db.getSiblingDB('arabamon');

// Admin kullanıcısı
db.users.updateOne(
  { email: 'admin@test.com' },
  {
    $set: {
      name: 'Admin Kullanıcı',
      email: 'admin@test.com',
      phone: '5551234567',
      password: '$2a$10$6Ybv8pWYT1wITHxCVMKsS.IzNhfbjK7RTVo0jFn7USwX9YKdQrtim', // 'password' olarak hashlenmiş
      role: 'admin',
      createdAt: new Date()
    }
  },
  { upsert: true }
);

// Normal kullanıcı
db.users.updateOne(
  { email: 'user1@test.com' },
  {
    $set: {
      name: 'Test Kullanıcı',
      email: 'user1@test.com',
      phone: '5559876543',
      password: '$2a$10$6Ybv8pWYT1wITHxCVMKsS.IzNhfbjK7RTVo0jFn7USwX9YKdQrtim', // 'password' olarak hashlenmiş
      role: 'user',
      createdAt: new Date()
    }
  },
  { upsert: true }
);

// Servis sağlayıcı
db.users.updateOne(
  { email: 'provider1@test.com' },
  {
    $set: {
      name: 'Test Servis Sağlayıcı',
      email: 'provider1@test.com',
      phone: '5551112233',
      password: '$2a$10$6Ybv8pWYT1wITHxCVMKsS.IzNhfbjK7RTVo0jFn7USwX9YKdQrtim', // 'password' olarak hashlenmiş
      role: 'provider',
      createdAt: new Date()
    }
  },
  { upsert: true }
);

print('Demo kullanıcıları başarıyla eklendi/güncellendi.'); 