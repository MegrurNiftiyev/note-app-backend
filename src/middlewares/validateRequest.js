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
    text: z
      .string({
        required_error: 'Note text is required',
        invalid_type_error: 'Note text must be a string',
      })
      .trim()
      .min(1, 'Note text is required')
      .max(10000, 'Note text must be at most 10000 characters long'),
  })
  .strict();

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

module.exports = {
  validateNote: validateBody(noteSchema),
  validateNoteId: validateParams(noteIdSchema),
  validateRefreshTokenBody,
  validateUserUpdate: validateBody(userUpdateSchema),
};
