const authService = require('../services/authService');
const { UnauthorizedError } = require('../errors/customErrors');
const catchAsync = require('../utils/catchAsync');
const { isMobileClient } = require('../utils/clientType');

const getRequestMetadata = (req) => ({
  ip: req.ip,
  userAgent: req.get('user-agent'),
});

const setRefreshCookie = (res, refreshToken) => {
  res.cookie(
    authService.REFRESH_COOKIE_NAME,
    refreshToken,
    authService.getRefreshCookieOptions()
  );
};

const clearRefreshCookie = (res) => {
  res.clearCookie(
    authService.REFRESH_COOKIE_NAME,
    authService.getClearRefreshCookieOptions()
  );
};

const getMobileRefreshToken = (req) => {
  const rawToken = req.body?.refreshToken;

  if (!rawToken || typeof rawToken !== 'string') {
    throw new UnauthorizedError(authService.GENERIC_REFRESH_ERROR);
  }

  return rawToken;
};

const getWebRefreshToken = (req) => {
  const rawToken = req.cookies?.[authService.REFRESH_COOKIE_NAME];

  if (!rawToken || typeof rawToken !== 'string') {
    throw new UnauthorizedError(authService.GENERIC_REFRESH_ERROR);
  }

  return rawToken;
};

const getRefreshTokenFromRequest = (req) => {
  if (isMobileClient(req)) {
    return getMobileRefreshToken(req);
  }

  return getWebRefreshToken(req);
};

const sendAuthResponse = (req, res, statusCode, { accessToken, refreshToken, user }) => {
  let responseData = { accessToken, user };

  if (isMobileClient(req)) {
    responseData = { accessToken, refreshToken, user };
  } else {
    setRefreshCookie(res, refreshToken);
  }

  res.status(statusCode).json({
    status: 'success',
    data: responseData,
  });
};

const register = catchAsync(async (req, res) => {
  const result = await authService.register(
    req.body,
    getRequestMetadata(req)
  );

  sendAuthResponse(req, res, 201, result);
});

const login = catchAsync(async (req, res) => {
  const result = await authService.login(
    req.body,
    getRequestMetadata(req)
  );

  sendAuthResponse(req, res, 200, result);
});

const refresh = catchAsync(async (req, res) => {
  const result = await authService.refresh(
    getRefreshTokenFromRequest(req),
    getRequestMetadata(req)
  );

  sendAuthResponse(req, res, 200, result);
});

const logout = catchAsync(async (req, res) => {
  await authService.logout(getRefreshTokenFromRequest(req));

  if (!isMobileClient(req)) {
    clearRefreshCookie(res);
  }

  res.status(204).send();
});

module.exports = {
  register,
  login,
  refresh,
  logout,
};
