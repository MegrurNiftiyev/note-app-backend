const swaggerJsdoc = require('swagger-jsdoc');

const getBaseUrl = require('../utils/getBaseUrl');

const baseUrl = getBaseUrl();

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Note App Backend API',
    version: '1.0.0',
    description: 'REST API for user authentication and personal note management.',
  },
  servers: [
    {
      url: '/',
      description: 'Current server',
    },
    {
      url: baseUrl,
      description: 'Configured server',
    },
    {
      url: `http://localhost:${process.env.PORT || 5000}`,
      description: 'Local development server',
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
    schemas: {
      RegisterRequest: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: {
            type: 'string',
            example: 'Ada Lovelace',
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'ada@example.com',
          },
          password: {
            type: 'string',
            format: 'password',
            example: 'secure-password',
          },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            example: 'ada@example.com',
          },
          password: {
            type: 'string',
            format: 'password',
            example: 'secure-password',
          },
        },
      },
      NoteRequest: {
        type: 'object',
        required: ['text'],
        properties: {
          text: {
            type: 'string',
            example: 'My first note',
          },
        },
      },
      User: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            example: '665f2a797a6ef0cb8d3a7d1a',
          },
          name: {
            type: 'string',
            example: 'Ada Lovelace',
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'ada@example.com',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      Note: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            example: '665f2af07a6ef0cb8d3a7d1d',
          },
          text: {
            type: 'string',
            example: 'My first note',
          },
          user: {
            type: 'string',
            example: '665f2a797a6ef0cb8d3a7d1a',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            example: 'fail',
          },
          message: {
            type: 'string',
            example: 'Readable error message',
          },
        },
      },
      ServerErrorResponse: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            example: 'error',
          },
          message: {
            type: 'string',
            example: 'Something went wrong',
          },
        },
      },
    },
  },
};

const options = {
  definition: swaggerDefinition,
  apis: ['./src/routes/*.js'],
};

module.exports = swaggerJsdoc(options);
