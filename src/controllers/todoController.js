const todoService = require('../services/todoService');
const catchAsync = require('../utils/catchAsync');

const createTodo = catchAsync(async (req, res) => {
  const todo = await todoService.createTodo({
    description: req.body.description,
    userId: req.user._id,
  });

  res.status(201).json({
    status: 'success',
    data: { todo },
  });
});

const getTodos = catchAsync(async (req, res) => {
  const todos = await todoService.getTodosByUser(req.user._id);

  res.status(200).json({
    status: 'success',
    results: todos.length,
    data: { todos },
  });
});

const getTodo = catchAsync(async (req, res) => {
  const todo = await todoService.getTodoById({
    todoId: req.params.id,
    userId: req.user._id,
  });

  res.status(200).json({
    status: 'success',
    data: { todo },
  });
});

const updateTodo = catchAsync(async (req, res) => {
  const todo = await todoService.updateTodoById({
    todoId: req.params.id,
    userId: req.user._id,
    description: req.body.description,
    isCompleted: req.body.isCompleted,
  });

  res.status(200).json({
    status: 'success',
    data: { todo },
  });
});

const deleteTodo = catchAsync(async (req, res) => {
  await todoService.deleteTodoById({
    todoId: req.params.id,
    userId: req.user._id,
  });

  res.status(204).send();
});

const deleteAllTodos = catchAsync(async (req, res) => {
  const result = await todoService.deleteAllTodosByUser(req.user._id);

  res.status(200).json({
    status: 'success',
    data: { deletedCount: result.deletedCount },
  });
});

module.exports = {
  createTodo,
  getTodos,
  getTodo,
  updateTodo,
  deleteTodo,
  deleteAllTodos,
};
