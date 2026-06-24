const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const RefreshToken = require('../models/RefreshToken');
const User = require('../models/User');
const {
  BadRequestError,
  ConflictError,
  UnauthorizedError,
} = require('../errors/customErrors');

const REFRESH_COOKIE_NAME = 'refreshToken';
const MAX_FAILED_LOGIN_ATTEMPTS = 5;
const LOCK_TIME_MS = 15 * 60 * 1000;
const GENERIC_REFRESH_ERROR = 'Invalid or expired refresh token';

const sanitizeUser = (user) => {
  const userObject = user.toObject();
  delete userObject.password;
  delete userObject.failedLoginAttempts;
  delete userObject.lockUntil;
  return userObject;
};

const signAccessToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    algorithm: 'HS256',
  });
};

const normalizeEmail = (email) => {
  if (typeof email !== 'string') {
    return email;
  }

  return email.trim().toLowerCase();
};

const parseDurationToMs = (duration) => {
  const match = /^(\d+)([smhd])$/.exec(duration || '');

  if (!match) {
    throw new Error('JWT_REFRESH_EXPIRES_IN must use s, m, h, or d suffix');
  }

  const value = Number(match[1]);
  const unit = match[2];
  const multipliers = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return value * multipliers[unit];
};

const getRefreshTokenMaxAge = () => {
  return parseDurationToMs(process.env.JWT_REFRESH_EXPIRES_IN || '30d');
};

const getRefreshCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.COOKIE_SECURE !== 'false',
  sameSite: 'strict',
  maxAge: getRefreshTokenMaxAge(),
});

const getClearRefreshCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.COOKIE_SECURE !== 'false',
  sameSite: 'strict',
});

const generateRefreshToken = () => {
  return crypto.randomBytes(40).toString('hex');
};

const hashRefreshToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

const createRefreshToken = async ({ userId, ip, userAgent }) => {
  const refreshToken = generateRefreshToken();
  const tokenHash = hashRefreshToken(refreshToken);
  const expiresAt = new Date(Date.now() + getRefreshTokenMaxAge());

  await RefreshToken.create({
    user: userId,
    tokenHash,
    expiresAt,
    createdByIp: ip,
    userAgent,
  });

  return { refreshToken, tokenHash };
};

const logRefreshFailure = (reason, meta = {}) => {
  if (process.env.NODE_ENV !== 'production') {
    console.warn('Refresh token rejected:', reason, meta);
  }
};

const revokeAllRefreshTokens = async (userId) => {
  return RefreshToken.updateMany(
    { user: userId, revoked: false },
    { $set: { revoked: true } }
  );
};

const register = async ({ name, email, password }, metadata = {}) => {
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
  const { refreshToken } = await createRefreshToken({
    userId: user._id,
    ...metadata,
  });

  return {
    accessToken: signAccessToken(user._id),
    refreshToken,
    user: sanitizeUser(user),
  };
};

const registerFailedLogin = async (user) => {
  user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;

  if (user.failedLoginAttempts >= MAX_FAILED_LOGIN_ATTEMPTS) {
    user.lockUntil = new Date(Date.now() + LOCK_TIME_MS);
  }

  await user.save({ validateBeforeSave: false });
};

const resetFailedLogin = async (user) => {
  user.failedLoginAttempts = 0;
  user.lockUntil = undefined;
  await user.save({ validateBeforeSave: false });
};

const login = async ({ email, password }, metadata = {}) => {
  if (typeof email !== 'string' || typeof password !== 'string') {
    throw new BadRequestError('Email and password must be strings');
  }

  const user = await User.findOne({ email: normalizeEmail(email) }).select(
    '+password +failedLoginAttempts +lockUntil'
  );

  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }

  if (user.lockUntil && user.lockUntil > Date.now()) {
    throw new UnauthorizedError('Account is temporarily locked. Try again later');
  }

  const passwordMatches = await bcrypt.compare(password, user.password);

  if (!passwordMatches) {
    await registerFailedLogin(user);
    throw new UnauthorizedError('Invalid email or password');
  }

  await resetFailedLogin(user);

  const { refreshToken } = await createRefreshToken({
    userId: user._id,
    ...metadata,
  });

  return {
    accessToken: signAccessToken(user._id),
    refreshToken,
    user: sanitizeUser(user),
  };
};

const refresh = async (rawRefreshToken, metadata = {}) => {
  if (!rawRefreshToken || typeof rawRefreshToken !== 'string') {
    logRefreshFailure('missing_or_malformed_cookie');
    throw new UnauthorizedError(GENERIC_REFRESH_ERROR);
  }

  const tokenHash = hashRefreshToken(rawRefreshToken);
  const storedToken = await RefreshToken.findOne({ tokenHash });

  if (!storedToken) {
    logRefreshFailure('not_found');
    throw new UnauthorizedError(GENERIC_REFRESH_ERROR);
  }

  if (storedToken.revoked) {
    await revokeAllRefreshTokens(storedToken.user);
    logRefreshFailure('reused_revoked_token', { userId: storedToken.user });
    throw new UnauthorizedError(GENERIC_REFRESH_ERROR);
  }

  if (storedToken.expiresAt <= new Date()) {
    storedToken.revoked = true;
    await storedToken.save({ validateBeforeSave: false });
    logRefreshFailure('expired', { userId: storedToken.user });
    throw new UnauthorizedError(GENERIC_REFRESH_ERROR);
  }

  const user = await User.findById(storedToken.user);

  if (!user) {
    storedToken.revoked = true;
    await storedToken.save({ validateBeforeSave: false });
    logRefreshFailure('user_not_found', { userId: storedToken.user });
    throw new UnauthorizedError(GENERIC_REFRESH_ERROR);
  }

  const newToken = await createRefreshToken({
    userId: user._id,
    ...metadata,
  });

  storedToken.revoked = true;
  storedToken.replacedByTokenHash = newToken.tokenHash;
  await storedToken.save({ validateBeforeSave: false });

  return {
    accessToken: signAccessToken(user._id),
    refreshToken: newToken.refreshToken,
    user: sanitizeUser(user),
  };
};

const logout = async (rawRefreshToken) => {
  if (!rawRefreshToken || typeof rawRefreshToken !== 'string') {
    logRefreshFailure('missing_or_malformed_cookie_on_logout');
    throw new UnauthorizedError(GENERIC_REFRESH_ERROR);
  }

  const tokenHash = hashRefreshToken(rawRefreshToken);
  const storedToken = await RefreshToken.findOne({ tokenHash });

  if (!storedToken || storedToken.revoked || storedToken.expiresAt <= new Date()) {
    logRefreshFailure('invalid_logout_token');
    throw new UnauthorizedError(GENERIC_REFRESH_ERROR);
  }

  storedToken.revoked = true;
  await storedToken.save({ validateBeforeSave: false });
};

module.exports = {
  GENERIC_REFRESH_ERROR,
  REFRESH_COOKIE_NAME,
  getClearRefreshCookieOptions,
  getRefreshCookieOptions,
  login,
  logout,
  refresh,
  register,
};
