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
  tags: [
    {
      name: 'Auth',
      description: 'Authentication endpoints',
    },
    {
      name: 'Users',
      description: 'Authenticated user account endpoints',
    },
    {
      name: 'Notes',
      description: 'Authenticated note management endpoints',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Paste your access token here. Obtained from /register, /login, or /refresh.',
      },
    },
    schemas: {
      RegisterRequest: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: {
            type: 'string',
            minLength: 2,
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
            minLength: 8,
            pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$',
            example: 'SecurePass1',
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
      UserUpdateRequest: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            minLength: 2,
            example: 'Ada Lovelace',
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'ada@example.com',
          },
        },
      },
      NoteRequest: {
        type: 'object',
        required: ['text'],
        properties: {
          text: {
            type: 'string',
            minLength: 1,
            maxLength: 10000,
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
      WebAuthResponse: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'success' },
          data: {
            type: 'object',
            properties: {
              accessToken: {
                type: 'string',
                example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
              },
              user: { $ref: '#/components/schemas/User' },
            },
          },
        },
      },
      MobileAuthResponse: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'success' },
          data: {
            type: 'object',
            properties: {
              accessToken: {
                type: 'string',
                example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
              },
              refreshToken: {
                type: 'string',
                description:
                  'Mobile clients only. Web clients do not receive this field in the response body; the refresh token is sent as an HttpOnly cookie.',
                example: 'a3f1c2e4b5d6...',
              },
              user: { $ref: '#/components/schemas/User' },
            },
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

const swaggerSpec = swaggerJsdoc(options);

Object.values(swaggerSpec.paths || {}).forEach((pathItem) => {
  Object.values(pathItem).forEach((operation) => {
    if (!operation.responses) {
      operation.responses = {};
    }

    if (!operation.responses['500']) {
      operation.responses['500'] = {
        description: 'Internal server error.',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ServerErrorResponse',
            },
          },
        },
      };
    }
  });
});

module.exports = swaggerSpec;
