const AuthController = require('../controllers/authController');
const express = require('express');
const router = express.Router();
const validateRequest = require('../middlewares/requestValidation');
const { registerSchema, loginSchema } = require('../validations/authValidation');

/**
 * @swagger
 *  tags:
 *  - name: Auth
 *    description: Everything about authentication
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register user
 *     description: Register a new user by providing name, email and password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 description: The user's name
 *               email:
 *                 type: string
 *                 description: The user's email address
 *               password:
 *                 type: string
 *                 description: The user's password
 *     responses:
 *       201:
 *         description: Successfully created the user.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid request body or missing required fields.
 */
router.post('/register', validateRequest(registerSchema, 'body'), AuthController.postRegister);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login user
 *     description: Login an existing user by providing email and password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 description: The user's email address
 *               password:
 *                 type: string
 *                 description: The user's password
 *     responses:
 *       200:
 *         description: Successfully logged in.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 access_token:
 *                   type: string
 *       400:
 *         description: Invalid request body or missing required fields.
 */
router.post('/login', validateRequest(loginSchema, 'body'), AuthController.postLogin);

/**
 * @swagger
 * /auth/refresh-token:
 *   get:
 *     tags: [Auth]
 *     summary: Refresh the access token using a valid refresh token.
 *     description: This endpoint allows you to refresh the access token by providing the refresh token. It returns a new access token if the refresh token is valid.
 *     parameters:
 *       - in: cookie
 *         name: refreshToken
 *         required: true
 *         description: The refresh token used to generate a new access token.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully refreshed the access token. A new access token is returned.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 access_token:
 *                   type: string
 *                   description: The new access token to use for subsequent requests.
 *       400:
 *         description: Invalid or missing refresh token.
 *       401:
 *         description: The refresh token is expired or invalid.
 */
router.get('/refresh-token', AuthController.getRefreshToken);


module.exports = router;