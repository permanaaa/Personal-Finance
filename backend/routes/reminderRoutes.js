const express = require('express');
const router = express.Router();
const ReminderController = require('../controllers/reminderController');
const validateRequest = require('../middlewares/requestValidation');
const authMiddleware = require('../middlewares/authMiddleware');
const { getAllRemindersSchema, addReminderSchema, reminderParamsSchema, updateReminderSchema } = require('../validations/reminderValidation');
const rateLimit = require("../middlewares/rateLimit");

/**
 * @swagger
 * tags:
 *   - name: Reminder
 *     description: Everything about reminders
 */

/**
 * @swagger
 * /reminder:
 *   get:
 *     tags: [Reminder]
 *     summary: Get all reminders
 *     description: Retrieve a list of reminders for the authenticated user with optional filtering and pagination.
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
 *         description: The number of reminders per page (default is 10).
 *         schema:
 *           type: integer
 *           minimum: 1
 *       - in: query
 *         name: search
 *         required: false
 *         description: A search term to filter reminders by title.
 *         schema:
 *           type: string
 *       - in: query
 *         name: allocationId
 *         required: false
 *         description: The allocation ID associated with the reminder.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved reminders.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: The reminder ID.
 *                       title:
 *                         type: string
 *                         description: The title of the reminder.
 *                       amount:
 *                         type: number
 *                         description: The amount associated with the reminder.
 *                       dueDate:
 *                         type: string
 *                         format: date-time
 *                         description: The due date of the reminder.
 *                 totalPage:
 *                   type: integer
 *                   description: Total number of pages available.
 *                   example: 1
 *                 totalReminders:
 *                   type: integer
 *                   description: Total number of reminders available.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /reminder:
 *   post:
 *     tags: [Reminder]
 *     summary: Add a new reminder
 *     description: Create a new reminder for the authenticated user. Validates input and checks for existing reminders.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               allocationId:
 *                 type: string
 *                 description: The allocation ID associated with the reminder.
 *               title:
 *                 type: string
 *                 description: The title of the reminder.
 *               amount:
 *                 type: number
 *                 description: The amount associated with the reminder.
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *                 description: The due date of the reminder.
 *     responses:
 *       201:
 *         description: Reminder added successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 'Reminder added successfully.'
 *       400:
 *         description: Bad request, reminder already exists.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /reminder/{id}:
 *   put:
 *     tags: [Reminder]
 *     summary: Update an existing reminder
 *     description: Update the details of a specific reminder for the authenticated user.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the reminder to update.
 *         schema:
 *           type: string
 *           pattern: '^[a-fA-F0-9]{24}$'  # MongoDB ObjectId pattern
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               allocationId:
 *                 type: string
 *                 description: The allocation ID associated with the reminder.
 *               title:
 *                 type: string
 *                 description: The title of the reminder.
 *               amount:
 *                 type: number
 *                 description: The amount associated with the reminder.
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *                 description: The due date of the reminder.
 *     responses:
 *       200:
 *         description: Reminder updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 'Reminder updated successfully.'
 *       404:
 *         description: Reminder not found.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /reminder/{id}:
 *   delete:
 *     tags: [Reminder]
 *     summary: Delete a reminder
 *     description: Remove a specific reminder for the authenticated user.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the reminder to delete.
 *         schema:
 *           type: string
 *           pattern: '^[a-fA-F0-9]{24}$'  # MongoDB ObjectId pattern
 *     responses:
 *       200:
 *         description: Reminder deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 'Reminder deleted successfully.'
 *       404:
 *         description: Reminder not found.
 *       500:
 *         description: Internal server error.
 */

// Define routes
router.get('/', authMiddleware,rateLimit(100, 60000), validateRequest(getAllRemindersSchema, 'query'), ReminderController.getAllReminder);
router.post('/', authMiddleware,rateLimit(100, 60000), validateRequest(addReminderSchema, 'body'), ReminderController.postReminder);
router.post('/test', authMiddleware,rateLimit(100, 60000), ReminderController.postReminderTest);
router.get('/:id', authMiddleware,rateLimit(100, 60000), validateRequest(reminderParamsSchema, 'params'), ReminderController.getDetailReminder);
router.put('/:id', authMiddleware,rateLimit(100, 60000), validateRequest(reminderParamsSchema, 'params'), validateRequest(updateReminderSchema, 'body'), ReminderController.putReminder);
router.delete('/:id', authMiddleware,rateLimit(100, 60000), validateRequest(reminderParamsSchema, 'params'), ReminderController.deleteReminder);

module.exports = router;
