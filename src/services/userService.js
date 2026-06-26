const Note = require('../models/Note');
const RefreshToken = require('../models/RefreshToken');
const Todo = require('../models/Todo');
const User = require('../models/User');
const {
  BadRequestError,
  ConflictError,
  NotFoundError,
} = require('../errors/customErrors');

const normalizeEmail = (email) => {
  if (typeof email !== 'string') {
    return email;
  }

  return email.trim().toLowerCase();
};

const getMe = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new NotFoundError('User not found');
  }

  return user;
};

const updateMe = async ({ userId, name, email }) => {
  if (name === undefined && email === undefined) {
    throw new BadRequestError('Name or email is required');
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new NotFoundError('User not found');
  }

  if (name !== undefined) {
    user.name = name;
  }

  if (email !== undefined) {
    const normalizedEmail = normalizeEmail(email);
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser && !existingUser._id.equals(user._id)) {
      throw new ConflictError('Email is already registered');
    }

    user.email = normalizedEmail;
  }

  await user.save();
  return user;
};

const deleteMe = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new NotFoundError('User not found');
  }

  const notesResult = await Note.deleteMany({ user: user._id });
  const todosResult = await Todo.deleteMany({ user: user._id });
  await RefreshToken.deleteMany({ user: user._id });
  await user.deleteOne();

  return {
    deletedUserId: user._id,
    deletedNotesCount: notesResult.deletedCount,
    deletedTodosCount: todosResult.deletedCount,
  };
};

module.exports = {
  getMe,
  updateMe,
  deleteMe,
};
