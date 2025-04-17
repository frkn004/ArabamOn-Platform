const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const { generateToken } = require('../utils/jwtUtils');

/**
 * @desc    Kullanıcı kaydı
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role } = req.body;

    // Admin rolü verilmesini engelle
    if (role === 'admin') {
      return next(new ErrorResponse('Admin rolü atanamaz', 400));
    }

    // E-posta adresi kontrol et
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return next(new ErrorResponse('Bu e-posta adresi zaten kullanılıyor', 400));
    }

    // Kullanıcı oluştur
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: role || 'user', // role belirtilmezse varsayılan kullanıcı
    });

    // Token gönder
    sendTokenResponse(user, 201, res);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Kullanıcı girişi
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Email ve şifre kontrolü
    if (!email || !password) {
      return next(new ErrorResponse('Lütfen e-posta ve şifre giriniz', 400));
    }

    // Kullanıcıyı bul (şifreyi dahil et)
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return next(new ErrorResponse('Geçersiz kimlik bilgileri', 401));
    }

    // Şifre doğrulama
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return next(new ErrorResponse('Geçersiz kimlik bilgileri', 401));
    }

    // Kullanıcı aktif mi?
    if (!user.isActive) {
      return next(new ErrorResponse('Hesabınız pasif durumda', 401));
    }

    // Token gönder
    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Mevcut kullanıcı bilgilerini getir
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Çıkış yap
 * @route   GET /api/auth/logout
 * @access  Private
 */
exports.logout = (req, res, next) => {
  res.status(200).json({
    success: true,
    data: {},
    message: 'Çıkış başarılı',
  });
};

/**
 * Token oluştur ve response ile gönder
 * @param {Object} user - Kullanıcı nesnesi
 * @param {Number} statusCode - HTTP durum kodu
 * @param {Response} res - Express response nesnesi
 */
const sendTokenResponse = (user, statusCode, res) => {
  // Token oluştur
  const token = generateToken({ id: user.id, role: user.role });

  // Cookie seçenekleri
  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  // HTTPS ise güvenli cookie
  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  // Kullanıcı bilgilerinden şifreyi çıkart
  const userData = user.toJSON();
  delete userData.password;

  res.status(statusCode).json({
    success: true,
    token,
    data: userData,
  });
}; 
const ErrorResponse = require('../utils/errorResponse');
const { generateToken } = require('../utils/jwtUtils');

/**
 * @desc    Kullanıcı kaydı
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role } = req.body;

    // Admin rolü verilmesini engelle
    if (role === 'admin') {
      return next(new ErrorResponse('Admin rolü atanamaz', 400));
    }

    // E-posta adresi kontrol et
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return next(new ErrorResponse('Bu e-posta adresi zaten kullanılıyor', 400));
    }

    // Kullanıcı oluştur
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: role || 'user', // role belirtilmezse varsayılan kullanıcı
    });

    // Token gönder
    sendTokenResponse(user, 201, res);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Kullanıcı girişi
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Email ve şifre kontrolü
    if (!email || !password) {
      return next(new ErrorResponse('Lütfen e-posta ve şifre giriniz', 400));
    }

    // Kullanıcıyı bul (şifreyi dahil et)
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return next(new ErrorResponse('Geçersiz kimlik bilgileri', 401));
    }

    // Şifre doğrulama
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return next(new ErrorResponse('Geçersiz kimlik bilgileri', 401));
    }

    // Kullanıcı aktif mi?
    if (!user.isActive) {
      return next(new ErrorResponse('Hesabınız pasif durumda', 401));
    }

    // Token gönder
    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Mevcut kullanıcı bilgilerini getir
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Çıkış yap
 * @route   GET /api/auth/logout
 * @access  Private
 */
exports.logout = (req, res, next) => {
  res.status(200).json({
    success: true,
    data: {},
    message: 'Çıkış başarılı',
  });
};

/**
 * Token oluştur ve response ile gönder
 * @param {Object} user - Kullanıcı nesnesi
 * @param {Number} statusCode - HTTP durum kodu
 * @param {Response} res - Express response nesnesi
 */
const sendTokenResponse = (user, statusCode, res) => {
  // Token oluştur
  const token = generateToken({ id: user.id, role: user.role });

  // Cookie seçenekleri
  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  // HTTPS ise güvenli cookie
  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  // Kullanıcı bilgilerinden şifreyi çıkart
  const userData = user.toJSON();
  delete userData.password;

  res.status(statusCode).json({
    success: true,
    token,
    data: userData,
  });
}; 