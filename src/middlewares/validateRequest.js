const mongoose = require('mongoose');
const { z } = require('zod');

const { BadRequestError, UnauthorizedError } = require('../errors/customErrors');
const { GENERIC_REFRESH_ERROR } = require('../services/authService');

const formatZodError = (error) => {
  return error.issues.map((issue) => issue.message).join(', ');
};

const validateBody = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    return next(new BadRequestError(formatZodError(result.error)));
  }

  req.body = result.data;
  return next();
};

const validateParams = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.params);

  if (!result.success) {
    return next(new BadRequestError(formatZodError(result.error)));
  }

  req.params = { ...req.params, ...result.data };
  return next();
};

const refreshTokenBodySchema = z
  .object({
    refreshToken: z.string().optional(),
  })
  .strict();

const validateRefreshTokenBody = (req, res, next) => {
  const result = refreshTokenBodySchema.safeParse(req.body ?? {});

  if (!result.success) {
    return next(new UnauthorizedError(GENERIC_REFRESH_ERROR));
  }

  req.body = result.data;
  return next();
};

const noteSchema = z
  .object({
    title: z
      .string({
        required_error: 'Note title is required',
        invalid_type_error: 'Note title must be a string',
      })
      .trim()
      .min(1, 'Note title is required')
      .max(200, 'Note title must be at most 200 characters long'),
    content: z
      .string({
        invalid_type_error: 'Note content must be a string',
      })
      .trim()
      .max(10000, 'Note content must be at most 10000 characters long')
      .optional(),
  })
  .strict();

const noteUpdateSchema = z
  .object({
    title: z
      .string({
        invalid_type_error: 'Note title must be a string',
      })
      .trim()
      .min(1, 'Note title is required')
      .max(200, 'Note title must be at most 200 characters long')
      .optional(),
    content: z
      .string({
        invalid_type_error: 'Note content must be a string',
      })
      .trim()
      .max(10000, 'Note content must be at most 10000 characters long')
      .optional(),
  })
  .strict()
  .refine((data) => data.title !== undefined || data.content !== undefined, {
    message: 'Note title or content is required',
  });

const todoSchema = z
  .object({
    description: z
      .string({
        required_error: 'Todo description is required',
        invalid_type_error: 'Todo description must be a string',
      })
      .trim()
      .min(1, 'Todo description is required')
      .max(500, 'Todo description must be at most 500 characters long'),
  })
  .strict();

const todoUpdateSchema = z
  .object({
    description: z
      .string({
        invalid_type_error: 'Todo description must be a string',
      })
      .trim()
      .min(1, 'Todo description is required')
      .max(500, 'Todo description must be at most 500 characters long')
      .optional(),
    isCompleted: z
      .boolean({
        invalid_type_error: 'Todo completion status must be a boolean',
      })
      .optional(),
  })
  .strict()
  .refine((data) => data.description !== undefined || data.isCompleted !== undefined, {
    message: 'Todo description or completion status is required',
  });

const userUpdateSchema = z
  .object({
    name: z
      .string({
        invalid_type_error: 'Name must be a string',
      })
      .trim()
      .min(2, 'Name must be at least 2 characters long')
      .optional(),
    email: z
      .string({
        invalid_type_error: 'Email must be a string',
      })
      .trim()
      .email('Email must be a valid email address')
      .optional(),
  })
  .strict()
  .refine((data) => data.name !== undefined || data.email !== undefined, {
    message: 'Name or email is required',
  });

const noteIdSchema = z.object({
  id: z.string().refine((value) => mongoose.Types.ObjectId.isValid(value), {
    message: 'Invalid note ID',
  }),
});

const todoIdSchema = z.object({
  id: z.string().refine((value) => mongoose.Types.ObjectId.isValid(value), {
    message: 'Invalid todo ID',
  }),
});

module.exports = {
  validateNote: validateBody(noteSchema),
  validateNoteUpdate: validateBody(noteUpdateSchema),
  validateNoteId: validateParams(noteIdSchema),
  validateRefreshTokenBody,
  validateTodo: validateBody(todoSchema),
  validateTodoUpdate: validateBody(todoUpdateSchema),
  validateTodoId: validateParams(todoIdSchema),
  validateUserUpdate: validateBody(userUpdateSchema),
};
