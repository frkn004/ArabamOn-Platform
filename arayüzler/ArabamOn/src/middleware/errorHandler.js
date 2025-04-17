const ErrorResponse = require('../utils/errorResponse');

/**
 * Küresel hata işleme middleware
 * @param {Error} err - Hata nesnesi
 * @param {Request} req - Express request nesnesi
 * @param {Response} res - Express response nesnesi
 * @param {Function} next - Express next fonksiyonu
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.error(err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = `Geçersiz ${err.path}: ${err.value}`;
    error = new ErrorResponse(message, 400);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Bu bilgilerle daha önce kayıt oluşturulmuş';
    error = new ErrorResponse(message, 400);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = new ErrorResponse(message, 400);
  }

  // JWT error
  if (err.name === 'JsonWebTokenError') {
    const message = 'Geçersiz token. Lütfen tekrar giriş yapın';
    error = new ErrorResponse(message, 401);
  }

  // JWT expired error
  if (err.name === 'TokenExpiredError') {
    const message = 'Oturum süresi doldu. Lütfen tekrar giriş yapın';
    error = new ErrorResponse(message, 401);
  }

  // Default error
  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Sunucu hatası',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

module.exports = errorHandler; 

/**
 * Küresel hata işleme middleware
 * @param {Error} err - Hata nesnesi
 * @param {Request} req - Express request nesnesi
 * @param {Response} res - Express response nesnesi
 * @param {Function} next - Express next fonksiyonu
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.error(err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = `Geçersiz ${err.path}: ${err.value}`;
    error = new ErrorResponse(message, 400);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Bu bilgilerle daha önce kayıt oluşturulmuş';
    error = new ErrorResponse(message, 400);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = new ErrorResponse(message, 400);
  }

  // JWT error
  if (err.name === 'JsonWebTokenError') {
    const message = 'Geçersiz token. Lütfen tekrar giriş yapın';
    error = new ErrorResponse(message, 401);
  }

  // JWT expired error
  if (err.name === 'TokenExpiredError') {
    const message = 'Oturum süresi doldu. Lütfen tekrar giriş yapın';
    error = new ErrorResponse(message, 401);
  }

  // Default error
  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Sunucu hatası',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

module.exports = errorHandler; 