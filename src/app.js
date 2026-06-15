const express = require('express');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');

const swaggerSpec = require('./config/swagger');
const { NotFoundError } = require('./errors/customErrors');
const authRoutes = require('./routes/authRoutes');
const noteRoutes = require('./routes/noteRoutes');
const userRoutes = require('./routes/userRoutes');
const errorMiddleware = require('./middlewares/errorMiddleware');

const app = express();
const swaggerOptions = {
  swaggerOptions: {
    defaultModelsExpandDepth: 0,
    defaultModelExpandDepth: 0,
    operationsSorter: (operationA, operationB) => {
      const methodOrder = {
        get: 0,
        post: 1,
        patch: 2,
        delete: 3,
      };

      const tagA = operationA.getIn(['operation', 'tags', 0]);
      const tagB = operationB.getIn(['operation', 'tags', 0]);

      if (tagA !== 'Notes' || tagB !== 'Notes') {
        return 0;
      }

      const methodA = operationA.get('method');
      const methodB = operationB.get('method');
      const orderA = methodOrder[methodA] ?? Number.MAX_SAFE_INTEGER;
      const orderB = methodOrder[methodB] ?? Number.MAX_SAFE_INTEGER;

      if (orderA !== orderB) {
        return orderA - orderB;
      }

      return operationA.get('path').localeCompare(operationB.get('path'));
    },
  },
};

app.use(helmet());
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Note API is running',
  });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerOptions));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notes', noteRoutes);

app.use((req, res, next) => {
  next(new NotFoundError(`Route ${req.originalUrl} not found`));
});

app.use(errorMiddleware);

module.exports = app;
