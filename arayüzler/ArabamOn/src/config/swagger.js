const swaggerJsDoc = require('swagger-jsdoc');

// Swagger ayarları
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Arabamon API',
      description: 'Araç Bakım Hizmetleri Platformu API',
      version: '1.0.0',
      contact: {
        name: 'API Destek',
        email: 'info@arabamon.com',
      },
      license: {
        name: 'Apache 2.0',
        url: 'https://www.apache.org/licenses/LICENSE-2.0.html',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Geliştirme sunucusu',
      },
      {
        url: 'https://api.arabamon.com',
        description: 'Canlı sunucu',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.js', './src/models/*.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = swaggerDocs; 

// Swagger ayarları
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Arabamon API',
      description: 'Araç Bakım Hizmetleri Platformu API',
      version: '1.0.0',
      contact: {
        name: 'API Destek',
        email: 'info@arabamon.com',
      },
      license: {
        name: 'Apache 2.0',
        url: 'https://www.apache.org/licenses/LICENSE-2.0.html',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Geliştirme sunucusu',
      },
      {
        url: 'https://api.arabamon.com',
        description: 'Canlı sunucu',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.js', './src/models/*.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = swaggerDocs; 