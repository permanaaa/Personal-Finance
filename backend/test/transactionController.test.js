const request = require('supertest');
const express = require('express');
const TransactionController = require('../controllers/transactionController');
const authMiddleware = require('../middlewares/authMiddleware');
const Allocation = require('../models/allocationModel');
const Transaction = require('../models/transactionModel');

const app = express();
app.use(express.json());
app.post('/transaction', authMiddleware, TransactionController.postAddTransaction);

jest.mock('../models/allocationModel');
jest.mock('../models/transactionModel');

describe('TransactionController', () => {
    describe('POST /transaction', () => {
        it('should add a new transaction successfully', async () => {
            const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3OGYxZWRhYTY1ZjRhMzY4NjRmYTI5YiIsIm5hbWUiOiJBZGkgUGVybWFuYSIsImVtYWlsIjoiYWRpcGVybWFuYTkyMThAZ21haWwuY29tIiwiaWF0IjoxNzM3NjM2MzcwLCJleHAiOjE3Mzc2MzcyNzB9.aQDpxwe8Fm9v0KzVOrFtqslKHjrEtWDIqrEF8xfJ5Uw';

            const reqBody = {
                allocationId: '6790e5793460ed0909ff9d9d',
                type: 'expense',
                amount: 100,
                description: 'Test transaction',
                date: new Date(),
            };

            Allocation.findById.mockResolvedValue({}); // Simulasi alokasi valid
            Transaction.findOne.mockResolvedValue(null); // Simulasi tidak ada transaksi yang sama
            Transaction.prototype.save.mockResolvedValue(); // Simulasi penyimpanan berhasil

            const response = await request(app)
                .post('/transaction')
                .set('Authorization', `Bearer ${token}`)
                .send(reqBody);

            expect(response.status).toBe(201);
            expect(response.body).toEqual({ status: true, message: 'Transaction added successfully.' });
        });

        it('should return 400 if allocation ID is invalid', async () => {
            const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3OGYxZWRhYTY1ZjRhMzY4NjRmYTI5YiIsIm5hbWUiOiJBZGkgUGVybWFuYSIsImVtYWlsIjoiYWRpcGVybWFuYTkyMThAZ21haWwuY29tIiwiaWF0IjoxNzM3NjM2MzcwLCJleHAiOjE3Mzc2MzcyNzB9.aQDpxwe8Fm9v0KzVOrFtqslKHjrEtWDIqrEF8xfJ5Uw';

            const reqBody = {
                allocationId: 'invalidAllocationId',
                type: 'expense',
                amount: 100,
                description: 'Test transaction',
                date: new Date(),
            };

            Allocation.findById.mockResolvedValue(null); // Simulasi alokasi tidak ditemukan

            const response = await request(app)
                .post('/transaction')
                .set('Authorization', `Bearer ${token}`)
                .send(reqBody);

            expect(response.status).toBe(400);
            expect(response.body).toEqual({ status: false, message: 'Allocation not found or not matched with this transaction.' });
        });
    });
});
