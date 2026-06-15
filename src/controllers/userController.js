const userService = require('../services/userService');
const catchAsync = require('../utils/catchAsync');

const getMe = catchAsync(async (req, res) => {
  const user = await userService.getMe(req.user._id);

  res.status(200).json({
    status: 'success',
    data: { user },
  });
});

const updateMe = catchAsync(async (req, res) => {
  const user = await userService.updateMe({
    userId: req.user._id,
    name: req.body.name,
    email: req.body.email,
  });

  res.status(200).json({
    status: 'success',
    data: { user },
  });
});

const deleteMe = catchAsync(async (req, res) => {
  const result = await userService.deleteMe(req.user._id);

  res.status(200).json({
    status: 'success',
    data: result,
  });
});

module.exports = {
  getMe,
  updateMe,
  deleteMe,
};
