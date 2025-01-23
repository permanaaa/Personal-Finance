const express = require('express');
const router = express.Router();
const AllocationContoller = require('../controllers/allocationController');
const validateRequest = require('../middlewares/requestValidation');
const authMiddleware = require('../middlewares/authMiddleware');
const { getAllocationSchema, addAllocationSchema, allocationParamsSchema, updateAllocationSchema } = require('../validations/allocationValidation');
const rateLimit = require("../middlewares/rateLimit");
/**
 * @swagger
 * tags:
 * - name: Allocation
 * description: Everything about allocations
*/

/**
 * @swagger
 * /allocations:
 *   get:
 *     tags: [Allocation]
 *     summary: Get user allocations
 *     description: Retrieve a list of allocations for the authenticated user with optional pagination and search.
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
 *         description: The number of allocations per page (default is 10).
 *         schema:
 *           type: integer
 *           minimum: 1
 *       - in: query
 *         name: search
 *         required: false
 *         description: A search term to filter allocations by name.
 *         schema:
 *           type: string
 *       - in: header
 *         name: Authorization
 *         required: true
 *         description: Bearer token for authentication.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved allocations.
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
 *                       _id:
 *                         type: string
 *                         description: The allocation ID.
 *                       name:
 *                         type: string
 *                         description: The name of the allocation.
 *                       budget:
 *                         type: number
 *                         description: The budget of the allocation.
 *                       updateAt:
 *                         type: string
 *                         format: date-time
 *                         description: The last update time of the allocation.
 *                 totalPage:
 *                   type: integer
 *                   description: Total number of pages available.
 *                 totalAllocations:
 *                   type: integer
 *                   description: Total number of allocations available.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /allocations:
 *   post:
 *     tags: [Allocation]
 *     summary: Create a new allocation
 *     description: Create a new allocation for the authenticated user by providing a name and budget.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - budget
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the allocation (must be unique for the user).
 *               budget:
 *                 type: number
 *                 description: The budget for the allocation (must be greater than 0).
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         description: Bearer token for authentication.
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Successfully created the allocation.
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
 *         description: Allocation name already exists or invalid request body.
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
 * /allocations/{id}:
 *   put:
 *     tags: [Allocation]
 *     summary: Update an existing allocation
 *     description: Update the name and budget of an existing allocation for the authenticated user.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the allocation to update.
 *         schema:
 *           type: string
 *           format: uuid
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
 *             required:
 *               - name
 *               - budget
 *             properties:
 *               name:
 *                 type: string
 *                 description: The new name of the allocation (must be unique for the user).
 *               budget:
 *                 type: number
 *                 description: The new budget for the allocation (must be greater than 0).
 *     responses:
 *       200:
 *         description: Successfully updated the allocation.
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
 *         description: Allocation name already exists or invalid request body.
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
 *         description: Allocation not found.
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
 * /allocations/{id}:
 *   delete:
 *     tags: [Allocation]
 *     summary: Delete an allocation
 *     description: Delete an existing allocation for the authenticated user by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the allocation to delete.
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: header
 *         name: Authorization
 *         required: true
 *         description: Bearer token for authentication.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully deleted the allocation.
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
 *         description: Allocation not found.
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 message:
 *                   type: string
 */

router.get('/', authMiddleware, rateLimit(100, 60000), validateRequest(getAllocationSchema, 'query'), AllocationContoller.getAllocations);
router.get('/export', authMiddleware,rateLimit(100, 60000), validateRequest(getAllocationSchema, 'query'), AllocationContoller.getExportReport);
router.post('/', authMiddleware,rateLimit(100, 60000), validateRequest(addAllocationSchema), AllocationContoller.postAllocation);
router.get('/:id', authMiddleware,rateLimit(100, 60000), validateRequest(allocationParamsSchema, 'params'), AllocationContoller.getDetailAllocation);
router.put('/:id', authMiddleware,rateLimit(100, 60000), validateRequest(allocationParamsSchema, 'params'), validateRequest(updateAllocationSchema, 'body'), AllocationContoller.putAllocation);
router.delete('/:id', authMiddleware,rateLimit(100, 60000), validateRequest(allocationParamsSchema, 'params'), AllocationContoller.deleteAllocation);

module.exports = router;