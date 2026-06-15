const express = require('express');
const swaggerUi = require('swagger-ui-express');

const swaggerSpec = require('./config/swagger');
const { NotFoundError } = require('./errors/customErrors');
const authRoutes = require('./routes/authRoutes');
const noteRoutes = require('./routes/noteRoutes');
const errorMiddleware = require('./middlewares/errorMiddleware');

const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Note API is running',
  });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);

app.use((req, res, next) => {
  next(new NotFoundError(`Route ${req.originalUrl} not found`));
});

app.use(errorMiddleware);

module.exports = app;
