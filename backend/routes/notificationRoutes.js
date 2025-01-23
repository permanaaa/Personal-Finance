const express = require('express');
const router = express.Router();
const validateRequest = require('../middlewares/requestValidation');
const authMiddleware = require('../middlewares/authMiddleware');
const NotificationController = require('../controllers/notificationController');
const { notificationParamsSchema, getAllNotificationsSchema, updateOrDeleteNotificationSchema } = require('../validations/notificationValidation');

/**
 * @swagger
 * tags:
 * - name: Notification
 *   description: Everything about user notifications
 */

/**
 * @swagger
 * /notifications:
 *   get:
 *     tags: [Notification]
 *     summary: Get All Notifications
 *     description: Retrieve all notifications for the authenticated user with optional pagination.
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         description: The page number to retrieve (default is 1).
 *         schema:
 *           type: integer
 *           minimum: 1
 *       - in: query
 *         name: perPage
 *         required: false
 *         description: The number of notifications per page (default is 10).
 *         schema:
 *           type: integer
 *           minimum: 1
 *       - in: header
 *         name: Authorization
 *         required: true
 *         description: Bearer token for authentication.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved notifications.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: The notification ID.
 *                       message:
 *                         type: string
 *                         description: The content of the notification.
 *                       status:
 *                         type: string
 *                         description: The status of the notification (e.g., read, unread).
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         description: The creation time of the notification.
 *                 totalPage:
 *                   type: integer
 *                   description: Total number of pages available.
 *                 totalTransactions:
 *                   type: integer
 *                   description: Total number of notifications available.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /notifications:
 *   post:
 *     tags: [Notification]
 *     summary: Update or Delete All Notifications
 *     description: Update the status of all notifications to 'read' or delete all notifications based on the action provided.
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         description: Bearer token for authentication.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [read, delete]
 *                 description: The action to perform on notifications.
 *     responses:
 *       200:
 *         description: Action performed successfully.
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
 *         description: Invalid action provided.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /notifications/{id}:
 *   put:
 *     tags: [Notification]
 *     summary: Update Notification
 *     description: Update the status of a notification based on its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the notification to update.
 *         schema:
 *           type: string
 *           pattern: '^[a-fA-F0-9]{24}$'
 *       - in: header
 *         name: Authorization
 *         required: true
 *         description: Bearer token for authentication.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: Notification not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /notifications/{id}:
 *   delete:
 *     tags: [Notification]
 *     summary: Delete Notification
 *     description: Delete a notification based on its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the notification to delete.
 *         schema:
 *           type: string
 *           pattern: '^[a-fA-F0-9]{24}$'
 *       - in: header
 *         name: Authorization
 *         required: true
 *         description: Bearer token for authentication.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: Notification not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal server error.
 */

router.get('/', authMiddleware, validateRequest(getAllNotificationsSchema, 'query'), NotificationController.getAllNotification);
router.post('/', authMiddleware, validateRequest(updateOrDeleteNotificationSchema, 'body'), NotificationController.postUpdateOrDeleteAllNotification);
router.put('/:id', authMiddleware, validateRequest(notificationParamsSchema, 'params'), NotificationController.putNotification);
router.delete('/:id', authMiddleware, validateRequest(notificationParamsSchema, 'params'), NotificationController.deleteNotification);

module.exports = router;