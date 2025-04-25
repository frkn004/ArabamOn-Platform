const User = require('../models/User');

// @desc    Tüm kullanıcıları getir
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find();

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
};

// @desc    Tek kullanıcı getir
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
};

// @desc    Kullanıcı güncelle
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
};

// @desc    Kullanıcı sil
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Kullanıcı silindi'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
};

// @desc    Profil güncelle
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, phone, identityNumber, address } = req.body;
    
    const user = await User.findById(req.user.id);
    
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (identityNumber) user.identityNumber = identityNumber;
    if (address) user.address = address;
    
    await user.save();
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
};

// @desc    Giriş yapmış kullanıcının profil bilgilerini getir
// @route   GET /api/users/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
};

// @desc    Araç ekle
// @route   POST /api/users/vehicles
// @access  Private
exports.addVehicle = async (req, res) => {
  try {
    const { make, model, year, plate, color } = req.body;
    
    const user = await User.findById(req.user.id);
    
    user.vehicles.push({
      make,
      model,
      year,
      plate,
      color
    });
    
    await user.save();
    
    res.status(201).json({
      success: true,
      data: user.vehicles
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
};

// @desc    Araç sil
// @route   DELETE /api/users/vehicles/:id
// @access  Private
exports.removeVehicle = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Aracı bul ve sil
    user.vehicles = user.vehicles.filter(
      vehicle => vehicle._id.toString() !== req.params.id
    );
    
    await user.save();
    
    res.status(200).json({
      success: true,
      data: user.vehicles
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
};

// @desc    Kullanıcının araçlarını getir
// @route   GET /api/users/vehicles
// @access  Private
exports.getVehicles = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
    }
    
    res.status(200).json({
      success: true,
      count: user.vehicles.length,
      data: user.vehicles
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
};

// @desc    Araç güncelle
// @route   PUT /api/users/vehicles/:id
// @access  Private
exports.updateVehicle = async (req, res) => {
  try {
    const { make, model, year, plate, color } = req.body;
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
    }
    
    // Güncellenecek aracı bul
    const vehicleIndex = user.vehicles.findIndex(
      vehicle => vehicle._id.toString() === req.params.id
    );
    
    if (vehicleIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Araç bulunamadı'
      });
    }
    
    // Araç özelliklerini güncelle
    if (make) user.vehicles[vehicleIndex].make = make;
    if (model) user.vehicles[vehicleIndex].model = model;
    if (year) user.vehicles[vehicleIndex].year = year;
    if (plate) user.vehicles[vehicleIndex].plate = plate;
    if (color) user.vehicles[vehicleIndex].color = color;
    
    await user.save();
    
    res.status(200).json({
      success: true,
      data: user.vehicles
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
}; 