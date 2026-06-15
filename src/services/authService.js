const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const {
  BadRequestError,
  ConflictError,
  UnauthorizedError,
} = require('../errors/customErrors');

const sanitizeUser = (user) => {
  const userObject = user.toObject();
  delete userObject.password;
  return userObject;
};

const signToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is required');
  }

  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const normalizeEmail = (email) => {
  if (typeof email !== 'string') {
    return email;
  }

  return email.trim().toLowerCase();
};

const register = async ({ name, email, password }) => {
  if (
    typeof name !== 'string' ||
    typeof email !== 'string' ||
    typeof password !== 'string'
  ) {
    throw new BadRequestError('Name, email, and password must be strings');
  }

  const normalizedEmail = normalizeEmail(email);
  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    throw new ConflictError('Email is already registered');
  }

  const user = await User.create({ name, email: normalizedEmail, password });
  return sanitizeUser(user);
};

const login = async ({ email, password }) => {
  if (typeof email !== 'string' || typeof password !== 'string') {
    throw new BadRequestError('Email and password must be strings');
  }

  const user = await User.findOne({ email: normalizeEmail(email) }).select('+password');

  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const passwordMatches = await bcrypt.compare(password, user.password);

  if (!passwordMatches) {
    throw new UnauthorizedError('Invalid email or password');
  }

  return {
    token: signToken(user._id),
    user: sanitizeUser(user),
  };
};

module.exports = {
  register,
  login,
};
