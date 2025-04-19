const jwt = require('jsonwebtoken');
const User = require('../models/User');

// JWT token ile koruma
exports.protect = async (req, res, next) => {
  let token;

  // Token'ı header'dan al
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Token'ın varlığını kontrol et
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Bu kaynağa erişmek için giriş yapmanız gerekiyor'
    });
  }

  try {
    // Token'ı doğrula
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Kullanıcıyı bul ve request'e ekle
    req.user = await User.findById(decoded.id);
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Geçersiz token'
    });
  }
};

// Rol bazlı yetkilendirme
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `${req.user.role} rolü bu kaynağa erişemez`
      });
    }
    next();
  };
}; 