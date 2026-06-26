const Todo = require('../models/Todo');
const {
  BadRequestError,
  NotFoundError,
} = require('../errors/customErrors');

const createTodo = async ({ description, userId }) => {
  return Todo.create({ description, user: userId });
};

const getTodosByUser = async (userId) => {
  return Todo.find({ user: userId }).sort({ createdAt: -1 });
};

const getTodoById = async ({ todoId, userId }) => {
  const todo = await Todo.findOne({ _id: todoId, user: userId });

  if (!todo) {
    throw new NotFoundError('Todo not found');
  }

  return todo;
};

const updateTodoById = async ({ todoId, userId, description, isCompleted }) => {
  if (description === undefined && isCompleted === undefined) {
    throw new BadRequestError('Todo description or completion status is required');
  }

  const todo = await Todo.findOne({ _id: todoId, user: userId });

  if (!todo) {
    throw new NotFoundError('Todo not found');
  }

  if (description !== undefined) {
    todo.description = description;
  }

  if (isCompleted !== undefined) {
    todo.isCompleted = isCompleted;
  }

  await todo.save();

  return todo;
};

const deleteTodoById = async ({ todoId, userId }) => {
  const todo = await Todo.findOne({ _id: todoId, user: userId });

  if (!todo) {
    throw new NotFoundError('Todo not found');
  }

  await todo.deleteOne();
  return todo;
};

const deleteAllTodosByUser = async (userId) => {
  return Todo.deleteMany({ user: userId });
};

module.exports = {
  createTodo,
  getTodosByUser,
  getTodoById,
  updateTodoById,
  deleteTodoById,
  deleteAllTodosByUser,
};
