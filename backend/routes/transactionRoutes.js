const express = require('express');
const router = express.Router();
const TransactionController = require('../controllers/transactionController');
const validateRequest = require('../middlewares/requestValidation');
const authMiddleware = require('../middlewares/authMiddleware');
const { getAllTransactionsSchema, addTransactionSchema, transactionParamsSchema, updateTransactionSchema } = require('../validations/transactionValidation');
const rateLimit = require("../middlewares/rateLimit");


/**
 * @swagger
 * tags:
 *   - name: Reminder
 *     description: Everything about reminders
 */

/**
 * @swagger
 * /transaction:
 *   get:
 *     tags: [Transactions]
 *     summary: Get all transactions
 *     description: Retrieve a list of transactions with optional filtering and pagination for the authenticated user.
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
 *         description: The number of transactions per page (default is 10).
 *         schema:
 *           type: integer
 *           minimum: 1
 *       - in: query
 *         name: search
 *         required: false
 *         description: A search term to filter transactions by description.
 *         schema:
 *           type: string
 *       - in: query
 *         name: allocationId
 *         required: false
 *         description: Alphanumeric allocation ID with length 24.
 *         schema:
 *           type: string
 *           pattern: '^[a-zA-Z0-9]{24}$'
 *       - in: query
 *         name: month
 *         required: false
 *         description: Month number for filtering transactions (1-12).
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *       - in: query
 *         name: type
 *         required: false
 *         description: Type of transaction, either income or expense.
 *         schema:
 *           type: string
 *           enum: ['income', 'expense']
 *       - in: header
 *         name: Authorization
 *         required: true
 *         description: Bearer token for authentication.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved transactions.
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
 *                         description: The transaction ID.
 *                       allocationId:
 *                         type: string
 *                         description: The allocation ID associated with the transaction.
 *                       type:
 *                         type: string
 *                         description: The type of transaction (income or expense).
 *                       amount:
 *                         type: number
 *                         description: The amount of the transaction.
 *                       description:
 *                         type: string
 *                         description: A brief description of the transaction.
 *                       date:
 *                         type: string
 *                         format: date-time
 *                         description: The date of the transaction.
 *                 totalPage:
 *                   type: integer
 *                   description: Total number of pages available.
 *                 totalTransactions:
 *                   type: integer
 *                   description: Total number of transactions available.
 *       500:
 *         description: Internal server error.
 */

router.get('/', authMiddleware,rateLimit(100, 60000), validateRequest(getAllTransactionsSchema, 'query'), TransactionController.getTransactions);
router.get('/export', authMiddleware,rateLimit(100, 60000), validateRequest(getAllTransactionsSchema, 'query'), TransactionController.getExportReport);

/**
 * @swagger
 * /transaction:
 *   post:
 *     tags: [Transactions]
 *     summary: Add a new transaction
 *     description: Create a new transaction for the authenticated user. Validates input and checks for existing transactions and budget constraints.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               allocationId:
 *                 type: string
 *                 description: The allocation ID associated with the transaction.
 *                 example: '5f9d3b3b3b3b3b3b3b3b3b3b'
 *               type:
 *                 type: string
 *                 description: The type of transaction, either 'income' or 'expense'.
 *                 example: 'expense'
 *               amount:
 *                 type: number
 *                 description: The amount of the transaction.
 *                 example: 150.00
 *               description:
 *                 type: string
 *                 description: A brief description of the transaction.
 *                 example: 'Office supplies purchase'
 *               date:
 *                 type: string
 *                 format: date-time
 *                 description: The date of the transaction.
 *                 example: '2023-10-01T00:00:00Z'
 *     responses:
 *       201:
 *         description: Transaction added successfully.
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
 *                   example: 'Transaction added successfully.'
 *       400:
 *         description: Bad request, transaction already exists or insufficient budget.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Transaction already exists. or Insufficient budget for this transaction.
 *                 budget:
 *                   type: number
 *                   description: Remaining budget after the transaction.
 *                   example: 350.00
 *       404:
 *         description: Allocation not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 'Allocation not found.'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 'Internal server error.'
 *     security:
 *       - BearerAuth: []
 */

router.post('/', authMiddleware,rateLimit(100, 60000), validateRequest(addTransactionSchema, 'body'), TransactionController.postAddTransaction)

/**
 * @swagger
 * /transaction/{id}:
 *   get:
 *     tags: [Transactions]
 *     summary: Get transaction details
 *     description: Retrieve the details of a specific transaction for the authenticated user.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the transaction to retrieve.
 *         schema:
 *           type: string
 *           pattern: '^[a-fA-F0-9]{24}$'  # MongoDB ObjectId pattern
 *       - in: header
 *         name: Authorization
 *         required: true
 *         description: Bearer token for authentication.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved transaction details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       description: The transaction ID.
 *                       example: '5f9d3b3b3b3b3b3b3b3b3b3b'
 *                     allocationId:
 *                       type: string
 *                       description: The allocation ID associated with the transaction.
 *                       example: '5f9d3b3b3b3b3b3b3b3b3b3b'
 *                     type:
 *                       type: string
 *                       description: The type of transaction (income or expense).
 *                       example: 'expense'
 *                     amount:
 *                       type: number
 *                       description: The amount of the transaction.
 *                       example: 150.00
 *                     description:
 *                       type: string
 *                       description: A brief description of the transaction.
 *                       example: 'Office supplies purchase'
 *                     date:
 *                       type: string
 *                       format: date-time
 *                       description: The date of the transaction.
 *                       example: '2023-10-01T00:00:00Z'
 *       404:
 *         description: Transaction not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 'Transaction not found.'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 'Internal server error.'
 *     security:
 *       - BearerAuth: []
 */

router.get('/:id', authMiddleware,rateLimit(100, 60000), validateRequest(transactionParamsSchema, 'params'), TransactionController.getDetailTransaction);

/**
 * @swagger
 * /transaction/{id}:
 *   put:
 *     tags: [Transactions]
 *     summary: Update an existing transaction
 *     description: Update the details of a specific transaction for the authenticated user. Validates input and checks for budget constraints.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the transaction to update.
 *         schema:
 *           type: string
 *           pattern: '^[a-fA-F0-9]{24}$'  # MongoDB ObjectId pattern
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
 *               allocationId:
 *                 type: string
 *                 description: The allocation ID associated with the transaction.
 *                 example: '5f9d3b3b3b3b3b3b3b3b3b3b'
 *               type:
 *                 type: string
 *                 description: The type of transaction, either income or expense.
 *                 example: 'expense'
 *               amount:
 *                 type: number
 *                 description: The amount of the transaction.
 *                 example: 150.00
 *               description:
 *                 type: string
 *                 description: A brief description of the transaction.
 *                 example: 'Updated office supplies purchase'
 *               date:
 *                 type: string
 *                 format: date-time
 *                 description: The date of the transaction.
 *                 example: '2023-10-01T00:00:00Z'
 *     responses:
 *       200:
 *         description: Transaction updated successfully.
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
 *                   example: 'Transaction updated successfully.'
 *       400:
 *         description: Bad request, insufficient budget or no changes to update.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 'Insufficient budget for this transaction. or No changes to update.'
 *                 budget:
 *                   type: number
 *                   description: Remaining budget after the transaction.
 *                   example: 350.00
 *       404:
 *         description: Transaction or allocation not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 'Transaction not found. or Allocation not found.'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 'Internal server error.'
 *     security:
 *       - BearerAuth: []
 */

router.put('/:id', authMiddleware,rateLimit(100, 60000), validateRequest(transactionParamsSchema, 'params'), validateRequest(updateTransactionSchema, 'body'), TransactionController.putTransaction);

/**
 * @swagger
 * /transaction/{id}:
 *   delete:
 *     tags: [Transactions]
 *     summary: Delete a transaction
 *     description: Remove a specific transaction for the authenticated user.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the transaction to delete.
 *         schema:
 *           type: string
 *           pattern: '^[a-fA-F0-9]{24}$'  # MongoDB ObjectId pattern
 *       - in: header
 *         name: Authorization
 *         required: true
 *         description: Bearer token for authentication.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Transaction deleted successfully.
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
 *                   example: 'Transaction deleted successfully.'
 *       404:
 *         description: Transaction not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 'Transaction not found.'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 'Internal server error.'
 *     security:
 *       - BearerAuth: []
 */

router.delete('/:id', authMiddleware,rateLimit(100, 60000), validateRequest(transactionParamsSchema, 'params'), TransactionController.deleteTransaction);

module.exports = router;