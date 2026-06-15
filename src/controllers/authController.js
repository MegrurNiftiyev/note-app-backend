const authService = require('../services/authService');
const catchAsync = require('../utils/catchAsync');

const register = catchAsync(async (req, res) => {
  const user = await authService.register(req.body);

  res.status(201).json({
    status: 'success',
    data: { user },
  });
});

const login = catchAsync(async (req, res) => {
  const { token, user } = await authService.login(req.body);

  res.status(200).json({
    status: 'success',
    data: { token, user },
  });
});

module.exports = {
  register,
  login,
};
