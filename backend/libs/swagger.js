const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'API Documentation',
            version: '1.0.0',
            description: 'API for personal finance application',
        },
        servers: [
            {
                url: 'http://localhost:3000', // Ganti dengan URL server Anda
            },
        ],
    },
    apis: ['./routes/*.js'], // Path ke file yang berisi anotasi Swagger
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = { swaggerUi, swaggerDocs };
