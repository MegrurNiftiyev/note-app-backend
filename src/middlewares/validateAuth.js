const { z } = require('zod');

const { BadRequestError } = require('../errors/customErrors');

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  email: z.string().email('Email must be a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
});

const loginSchema = z.object({
  email: z.string().email('Email must be a valid email address'),
  password: z.string({
    required_error: 'Password is required',
    invalid_type_error: 'Password must be a string',
  }),
});

const formatZodError = (error) => {
  return error.issues.map((issue) => issue.message).join(', ');
};

const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    return next(new BadRequestError(formatZodError(result.error)));
  }

  req.body = result.data;
  return next();
};

module.exports = {
  validateLogin: validate(loginSchema),
  validateRegister: validate(registerSchema),
};
