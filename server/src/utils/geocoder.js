const NodeGeocoder = require('node-geocoder');

const options = {
  provider: process.env.GEOCODER_PROVIDER || 'openstreetmap',
  // Opsiyonel: kullanım limitli API anahtarı gerektiren servisler için
  // apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};

const geocoder = NodeGeocoder(options);

module.exports = geocoder; 