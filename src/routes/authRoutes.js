const express = require('express');
const rateLimit = require('express-rate-limit');

const authController = require('../controllers/authController');
const {
  validateLogin,
  validateRegister,
} = require('../middlewares/validateAuth');
const { validateRefreshTokenBody } = require('../middlewares/validateRequest');

const router = express.Router();
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'fail',
    message: 'Too many attempts, try again later',
  },
});

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Register a new user.
 *     tags:
 *       - Auth
 *     parameters:
 *       - in: header
 *         name: X-Client-Type
 *         required: false
 *         schema:
 *           type: string
 *           enum: [web, mobile]
 *           default: web
 *         description: >
 *           Only "mobile" enables mobile token delivery (both tokens in response body, no cookies).
 *           Use "web" or omit this header for web clients (cookie-based refresh token).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: >
 *           Success. Web clients (no X-Client-Type header) receive refreshToken as
 *           an HttpOnly cookie; the response body contains only accessToken and user.
 *           Mobile clients (X-Client-Type: mobile) receive both accessToken and
 *           refreshToken in the response body; no cookie is set.
 *         headers:
 *           Set-Cookie:
 *             description: HttpOnly refresh-token cookie for web clients only.
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MobileAuthResponse'
 *       400:
 *         description: Validation error or invalid request body.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Email is already registered.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       429:
 *         description: Too many register attempts.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/register', authLimiter, validateRegister, authController.register);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Login with email and password.
 *     tags:
 *       - Auth
 *     parameters:
 *       - in: header
 *         name: X-Client-Type
 *         required: false
 *         schema:
 *           type: string
 *           enum: [web, mobile]
 *           default: web
 *         description: >
 *           Only "mobile" enables mobile token delivery (both tokens in response body, no cookies).
 *           Use "web" or omit this header for web clients (cookie-based refresh token).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: >
 *           Success. Web clients (no X-Client-Type header) receive refreshToken as
 *           an HttpOnly cookie; the response body contains only accessToken and user.
 *           Mobile clients (X-Client-Type: mobile) receive both accessToken and
 *           refreshToken in the response body; no cookie is set.
 *         headers:
 *           Set-Cookie:
 *             description: HttpOnly refresh-token cookie for web clients only.
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MobileAuthResponse'
 *       400:
 *         description: Email or password is missing.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Invalid email or password.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       429:
 *         description: Too many login attempts.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/login', authLimiter, validateLogin, authController.login);

/**
 * @openapi
 * /api/auth/refresh:
 *   post:
 *     summary: Rotate the refresh token and return a new access token.
 *     tags:
 *       - Auth
 *     parameters:
 *       - in: header
 *         name: X-Client-Type
 *         required: false
 *         schema:
 *           type: string
 *           enum: [web, mobile]
 *           default: web
 *         description: >
 *           Only "mobile" enables mobile token delivery (both tokens in response body, no cookies).
 *           Use "web" or omit this header for web clients (cookie-based refresh token).
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: >
 *                   Mobile clients only (X-Client-Type: mobile).
 *                   Web clients do not send this field - the HttpOnly cookie is used automatically.
 *                   Note: Swagger UI cannot test the web cookie flow; use a mobile header and this field instead.
 *                 example: 'a3f1c2e4b5d6...'
 *     responses:
 *       200:
 *         description: >
 *           Success. Web clients (no X-Client-Type header) receive refreshToken as
 *           an HttpOnly cookie; the response body contains only accessToken and user.
 *           Mobile clients (X-Client-Type: mobile) receive both accessToken and
 *           refreshToken in the response body; no cookie is set.
 *         headers:
 *           Set-Cookie:
 *             description: Rotated HttpOnly refresh-token cookie for web clients only.
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MobileAuthResponse'
 *       401:
 *         description: Invalid or expired refresh token.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       429:
 *         description: Too many refresh attempts.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/refresh', authLimiter, validateRefreshTokenBody, authController.refresh);

/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     summary: Revoke the current refresh token.
 *     tags:
 *       - Auth
 *     parameters:
 *       - in: header
 *         name: X-Client-Type
 *         required: false
 *         schema:
 *           type: string
 *           enum: [web, mobile]
 *           default: web
 *         description: >
 *           Only "mobile" enables mobile token delivery (both tokens in response body, no cookies).
 *           Use "web" or omit this header for web clients (cookie-based refresh token).
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: >
 *                   Mobile clients only (X-Client-Type: mobile).
 *                   Web clients do not send this field - the HttpOnly cookie is used automatically.
 *                   Note: Swagger UI cannot test the web cookie flow; use a mobile header and this field instead.
 *                 example: 'a3f1c2e4b5d6...'
 *     responses:
 *       204:
 *         description: Logged out successfully.
 *         headers:
 *           Set-Cookie:
 *             description: Cleared refresh-token cookie for web clients only.
 *             schema:
 *               type: string
 *       401:
 *         description: Invalid or expired refresh token.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       429:
 *         description: Too many logout attempts.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/logout', authLimiter, validateRefreshTokenBody, authController.logout);

module.exports = router;
