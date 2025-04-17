const jwt = require('jsonwebtoken');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');
const { verifyToken } = require('../utils/jwtUtils');

/**
 * Kullanıcı kimlik doğrulama middleware'i
 * @param {Request} req - Express request nesnesi
 * @param {Response} res - Express response nesnesi
 * @param {Function} next - Express next fonksiyonu
 */
exports.protect = async (req, res, next) => {
  let token;

  // Token'ı headerdan alma
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  // Token'ı cookie'den alma (alternatif)
  // else if (req.cookies.token) {
  //   token = req.cookies.token;
  // }

  // Token varlığını kontrol etme
  if (!token) {
    return next(new ErrorResponse('Bu kaynağa erişmek için giriş yapmanız gerekiyor', 401));
  }

  try {
    // Token doğrulama
    const decoded = verifyToken(token);

    // Kullanıcıyı bulma
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return next(new ErrorResponse('Bu token ile kullanıcı bulunamadı', 401));
    }

    // Kullanıcı pasif edilmiş mi?
    if (!user.isActive) {
      return next(new ErrorResponse('Hesabınız pasif durumda', 401));
    }

    // Kullanıcıyı request nesnesine ekleme
    req.user = user;
    next();
  } catch (err) {
    return next(new ErrorResponse('Bu kaynağa erişmek için giriş yapmanız gerekiyor', 401));
  }
};

/**
 * Belirli rollere erişim izni verme
 * @param  {...String} roles - İzin verilen roller
 * @returns {Function} - Express middleware
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ErrorResponse('Yetkilendirme hatası', 500));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse('Bu kaynağa erişmek için yetkiniz bulunmuyor', 403)
      );
    }
    
    next();
  };
}; 