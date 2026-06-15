const { AppError, ConflictError } = require('../errors/customErrors');

const handleValidationError = (err) => {
  const message = Object.values(err.errors)
    .map((error) => error.message)
    .join(', ');

  return {
    statusCode: 400,
    body: {
      status: 'fail',
      message,
    },
  };
};

const handleDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyValue || {})[0] || 'field';
  const message = `${field.charAt(0).toUpperCase()}${field.slice(1)} already exists`;
  const conflictError = new ConflictError(message);

  return {
    statusCode: conflictError.statusCode,
    body: {
      status: 'fail',
      message: conflictError.message,
    },
  };
};

const handleCastError = () => ({
  statusCode: 400,
  body: {
    status: 'fail',
    message: 'Invalid resource identifier',
  },
});

const errorMiddleware = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof AppError || err.isOperational) {
    return res.status(err.statusCode).json({
      status: 'fail',
      message: err.message,
    });
  }

  if (err.name === 'ValidationError') {
    const { statusCode, body } = handleValidationError(err);
    return res.status(statusCode).json(body);
  }

  if (err.code === 11000) {
    const { statusCode, body } = handleDuplicateKeyError(err);
    return res.status(statusCode).json(body);
  }

  if (err.name === 'CastError') {
    const { statusCode, body } = handleCastError(err);
    return res.status(statusCode).json(body);
  }

  if (process.env.NODE_ENV !== 'production') {
    console.error(err);
  }

  return res.status(500).json({
    status: 'error',
    message: 'Something went wrong',
  });
};

module.exports = errorMiddleware;
