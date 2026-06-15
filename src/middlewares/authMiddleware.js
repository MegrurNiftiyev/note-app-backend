const jwt = require('jsonwebtoken');

const User = require('../models/User');
const { UnauthorizedError } = require('../errors/customErrors');
const catchAsync = require('../utils/catchAsync');

const authMiddleware = catchAsync(async (req, res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw new UnauthorizedError('Authentication token is required');
  }

  const token = authorization.split(' ')[1];

  if (!token) {
    throw new UnauthorizedError('Authentication token is required');
  }

  let decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new UnauthorizedError('Invalid or expired token');
  }

  const user = await User.findById(decoded.userId);

  if (!user) {
    throw new UnauthorizedError('User no longer exists');
  }

  req.user = user;
  next();
});

module.exports = authMiddleware;
