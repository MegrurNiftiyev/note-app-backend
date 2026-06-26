const express = require('express');

const authMiddleware = require('../middlewares/authMiddleware');
const userController = require('../controllers/userController');
const { validateUserUpdate } = require('../middlewares/validateRequest');

const router = express.Router();

router.use(authMiddleware);

/**
 * @openapi
 * /api/users/me:
 *   get:
 *     summary: Get the authenticated user's profile.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         description: Missing, invalid, or expired token.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   patch:
 *     summary: Update the authenticated user's name or email.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserUpdateRequest'
 *     responses:
 *       200:
 *         description: Profile updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: Name or email is required, or validation failed.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Missing, invalid, or expired token.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found.
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
 *   delete:
 *     summary: Delete the authenticated user's account and all related items.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User and related items deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     deletedUserId:
 *                       type: string
 *                       example: 665f2a797a6ef0cb8d3a7d1a
 *                     deletedNotesCount:
 *                       type: integer
 *                       example: 4
 *                     deletedTodosCount:
 *                       type: integer
 *                       example: 6
 *       401:
 *         description: Missing, invalid, or expired token.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router
  .route('/me')
  .get(userController.getMe)
  .patch(validateUserUpdate, userController.updateMe)
  .delete(userController.deleteMe);

module.exports = router;
