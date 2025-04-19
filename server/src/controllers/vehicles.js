const Vehicle = require('../models/Vehicle');

// @desc    Kullanıcıya ait araçları getir
// @route   GET /api/vehicles
// @access  Private
exports.getVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ user: req.user.id });

    res.status(200).json({
      success: true,
      count: vehicles.length,
      data: vehicles
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
};

// @desc    Tek araç detayı getir
// @route   GET /api/vehicles/:id
// @access  Private
exports.getVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Araç bulunamadı'
      });
    }

    // Aracın sahibi mi kontrol et
    if (vehicle.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Bu işlemi yapmaya yetkiniz yok'
      });
    }

    res.status(200).json({
      success: true,
      data: vehicle
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
// @route   POST /api/vehicles
// @access  Private
exports.createVehicle = async (req, res) => {
  try {
    req.body.user = req.user.id;

    const vehicle = await Vehicle.create(req.body);

    res.status(201).json({
      success: true,
      data: vehicle
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Bu plaka zaten kayıtlı'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
};

// @desc    Araç güncelle
// @route   PUT /api/vehicles/:id
// @access  Private
exports.updateVehicle = async (req, res) => {
  try {
    let vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Araç bulunamadı'
      });
    }

    // Aracın sahibi mi kontrol et
    if (vehicle.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Bu işlemi yapmaya yetkiniz yok'
      });
    }

    vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: vehicle
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Bu plaka zaten kayıtlı'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
};

// @desc    Araç sil
// @route   DELETE /api/vehicles/:id
// @access  Private
exports.deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Araç bulunamadı'
      });
    }

    // Aracın sahibi mi kontrol et
    if (vehicle.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Bu işlemi yapmaya yetkiniz yok'
      });
    }

    await vehicle.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
}; 