const pdf = require('html-pdf');
const fs = require('fs');
const path = require('path');
const Transaction = require('../models/transactionModel');
const Allocation = require('../models/allocationModel');
const logger = require('../libs/winston');
const { client, deleteKeysByPattern } = require('../libs/redis');
const { timeServer } = require('../utils/timeServer');

const TransactionController = {
    getTransactions : async (req, res) => {
        const { page, perPage, search, allocationId, month, type } = req.query;
        const userId = req.user.id;
        const cacheKey = `transactions:${userId}:${month}:${allocationId}:${type}:${search}:${page}:${perPage}`;

        try {
            let cacheData = await client.get(cacheKey);
            if (cacheData) {
                cacheData = JSON.parse(cacheData);
                return res.status(200).send({
                    status: true,
                    data: cacheData.data,
                    page: cacheData.page,
                    totalPage: cacheData.totalPage,
                    totalTransactions: cacheData.totalTransactions,
                });
            } else {
                const query = { userId };
                const conditions = {
                    description: search ? { $regex: search, $options: 'i' } : undefined,
                    allocationId: allocationId === 'All' || !allocationId ? undefined : allocationId,
                    $expr: month ? { $eq: [{ $month: "$date" }, month] } : undefined,
                    type: type === 'All' || !type ? undefined : type,
                };

                console.log("Conditions:", conditions);

                Object.keys(conditions).forEach((key) => {
                    if (conditions[key] !== undefined) {
                        query[key] = conditions[key];
                    }
                });

                const totalTransactions = await Transaction.find(query).countDocuments();
                const totalPage = Math.ceil(totalTransactions / perPage);
                const transactions = await Transaction.find(query)
                    .skip((page - 1) * perPage)
                    .limit(perPage)
                    .sort({ description: -1 });

                await client.set(
                    cacheKey,
                    JSON.stringify({ data: transactions, page, totalPage, totalTransactions }),
                    { EX: 60 * 5 }
                );

                return res.status(200).send({
                    status: true,
                    data: transactions,
                    page: page,
                    totalPage: totalPage,
                    totalTransactions: totalTransactions,
                });
            }
        } catch (e) {
            logger.error(e.toString());
            return res.status(500).send({ status: false, message: "Internal server error." });
        }

    },

    getDetailTransaction: async (req, res) => {
        const { id } = req.params;
        const userId = req.user.id;
        const cacheKey = `transactions-detail:${userId}:${id}`;

        try {
            let cacheData = await client.get(cacheKey);
            if(cacheData) {
                return res.status(200).send({ status: true, data: JSON.parse(cacheData)});
            } else {
                const transaction = await Transaction.findOne({ userId: userId, _id: id });
                if(!transaction) {
                    return res.status(404).send({status: false, message: 'Transaction not found.'});
                } else {
                    await client.set(cacheKey, JSON.stringify(transaction), { EX: 60 * 5 });
                    return res.status(200).send({status: true, data: transaction});
                }
            }

        } catch (e) {
            logger.error(e.toString());
            res.status(500).send({ status: false, message: 'Internal server error.' });
        }
    },

    postAddTransaction: async (req, res) => {
        const { allocationId, type, amount, description, date } = req.body;
        const userId = req.user.id;
        const cacheKey = `transactions:${userId}`;

        try {

            const existingTransaction = await Transaction.findOne({
                userId,
                allocationId,
                type,
                amount,
                description,
                date
            });

            if (existingTransaction) {
                return res.status(400).send({ status: false, message: 'Transaction already exists.' });
            }

            const transactionDate = new Date(date);
            const startOfMonth = new Date(Date.UTC(transactionDate.getUTCFullYear(), transactionDate.getUTCMonth(), 1));
            const endOfMonth = new Date(Date.UTC(transactionDate.getUTCFullYear(), transactionDate.getUTCMonth() + 1, 0, 23, 59, 59, 999));
            const transactions = await Transaction.find({
                userId: userId,
                allocationId: allocationId,
                date: {
                    $gte: startOfMonth,
                    $lte: endOfMonth
                }
            });

            const totalAmount = transactions.reduce((sum, transaction) => sum + (transaction.amount || 0), 0);
            const allocation = await Allocation.findById(allocationId);
            if (!allocation || allocation.type !== type) {
                return res.status(400).send({ status: false, message: 'Allocation not found or not matched with this transaction.' });
            }

            const budget = allocation.budget;
            if (totalAmount + amount > budget && type === 'expense') {
                return res.status(400).send({ status: false, message: 'Insufficient budget for this transaction. Budget.', budget: budget - totalAmount });
            }

            const newTransaction = new Transaction({
                userId,
                allocationId,
                type,
                amount,
                description,
                date,
                createdAt: timeServer()
            });

            await newTransaction.save();
            await deleteKeysByPattern(cacheKey);

            return res.status(201).send({ status: true, message: 'Transaction added successfully.' });

        } catch (e) {
            logger.error(e.toString());
            return res.status(500).send({ status: false, message: 'Internal server error.' });
        }
    },

    putTransaction: async (req, res) => {
        const { id } = req.params;
        const { allocationId, type, amount, description, date } = req.body;
        const userId = req.user.id;
        const cacheKey = `transactions:${userId}`;

        try {
            const existingTransaction = await Transaction.findById(id);

            if (!existingTransaction || existingTransaction.userId.toString() !== userId) {
                return res.status(404).send({ status: false, message: 'Transaction not found.' });
            }

            const fieldsToUpdate = {
                allocationId: allocationId,
                type: type,
                amount: amount,
                description: description,
                date: date ? new Date(date) : undefined
            };

            const updatedFields = {};
            for (const [key, value] of Object.entries(fieldsToUpdate)) {
                if (value !== undefined && existingTransaction[key] !== value) {
                    updatedFields[key] = value;
                }
            }

            if (Object.keys(updatedFields).length > 0) {
                updatedFields.updatedAt = timeServer();
            } else {
                return res.status(200).send({ status: true, message: 'No changes to update.' });
            }

            if (updatedFields.amount !== undefined || updatedFields.type !== undefined || updatedFields.allocationId !== undefined || updatedFields.date !== undefined) {
                const transactionDate = new Date(updatedFields.date || existingTransaction.date);
                const startOfMonth = new Date(Date.UTC(transactionDate.getUTCFullYear(), transactionDate.getUTCMonth(), 1));
                const endOfMonth = new Date(Date.UTC(transactionDate.getUTCFullYear(), transactionDate.getUTCMonth() + 1, 0, 23, 59, 59, 999));
                const transactions = await Transaction.find({
                    userId: userId,
                    allocationId: updatedFields.allocationId || existingTransaction.allocationId,
                    date: {
                        $gte: startOfMonth,
                        $lte: endOfMonth
                    },
                    _id: { $ne: id }
                });

                const totalAmount = transactions.reduce((sum, transaction) => sum + (transaction.amount || 0), 0);
                const allocation = await Allocation.findById(updatedFields.allocationId || existingTransaction.allocationId);
                if (!allocation || allocation.type !== type) {
                    return res.status(400).send({ status: false, message: 'Allocation not found or not matched with this transaction.' });
                }

                const budget = allocation.budget;
                if (totalAmount + updatedFields.amount > budget && type === 'expense') {
                    return res.status(400).send({ status: false, message: 'Insufficient budget for this transaction.', budget: budget - totalAmount });
                }
            }

            const updatedTransaction = await Transaction.findByIdAndUpdate(id, updatedFields, { new: true });
            await deleteKeysByPattern(cacheKey);
            await deleteKeysByPattern(`transactions-detail:${userId}`);

            return res.status(200).send({ status: true, message: 'Transaction updated successfully.'});
        } catch (e) {
            logger.error(e.toString());
            return res.status(500).send({ status: false, message: 'Internal server error.' });
        }
    },

    deleteTransaction: async (req, res) => {
        const { id } = req.params;
        const userId = req.user.id;
        const cacheKey = `transactions:${userId}`;

        try {
            if(await Transaction.findByIdAndDelete(id)) {
                await deleteKeysByPattern(cacheKey);
                return res.status(200).send({ status: true, message: 'Transaction deleted successfully.' });
            } else {
                return res.status(404).send({ status: false, message: 'Transaction not found.' });
            }

        } catch (e) {
            logger.error(e.toString());
            return res.status(500).send({ status: false, message: 'Internal server error.' });
        }
    },

    getExportReport: async (req, res) => {
        const { search, allocationId, month, type } = req.query;
        const userId = req.user.id;

        try {
            const query = { userId };
            const conditions = {
                description: search ? { $regex: search, $options: 'i' } : undefined,
                allocationId: allocationId === 'All' || !allocationId ? undefined : allocationId,
                $expr: month ? { $eq: [{ $month: "$date" }, parseInt(month)] } : undefined,
                type: type === 'All' || !type ? undefined : type,
            };

            Object.keys(conditions).forEach((key) => {
                if (conditions[key] !== undefined) {
                    query[key] = conditions[key];
                }
            });

            const transactions = await Transaction.find(query).sort({ description: -1 });

            const monthNames = [
                "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
            ];

            const currentYear = new Date().getFullYear();
            const monthName = monthNames[month - 1];

            const allocations = await Allocation.find({ userId });
            let allocationNames;
            if (allocationId === 'All' || !allocationId) {
                allocationNames = 'All';
            } else {
                allocationNames = allocations[0].name;
            }

            let totalIncome = 0;
            let totalExpense = 0;

            transactions.forEach(transaction => {
                if (transaction.type === 'income') {
                    totalIncome += transaction.amount;
                } else if (transaction.type === 'expense') {
                    totalExpense += transaction.amount;
                }
            });

            const htmlContent = `        
                <html>        
                <head>        
                    <style>        
                        body { font-family: Arial, sans-serif; margin: 1cm; }        
                        h1 { text-align: center; font-size: 14px; }        
                        h2 { text-align: left; font-size: 10px; }        
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 9px; }        
                        th, td { border: 1px solid #000; padding: 5px; text-align: center; }        
                        th { background-color: #f2f2f2; }        
                        .text-left { text-align: left; }        
                        .text-right { text-align: right; }    
                        .text-center { text-align: center; }    
                    </style>        
                </head>        
                <body>        
                    <h1>Transaction Summary</h1>        
                    <h2>Month: ${monthName} ${currentYear}</h2>        
                    <h2>Total Income: Rp. ${totalIncome.toLocaleString()}</h2>        
                    <h2>Total Expense: Rp. ${totalExpense.toLocaleString()}</h2>        
                    <h2>Balance: Rp. ${(totalIncome - totalExpense).toLocaleString()}</h2>        
                    <h2>Allocation: ${allocationNames}</h2>        
                    <table>        
                        <tr>        
                            <th>No</th>        
                            <th>Date</th>        
                            <th>Description</th>        
                            <th>Income</th>        
                            <th>Expense</th>        
                        </tr>        
                        ${transactions.map((transaction, index) => `        
                            <tr>        
                                <td class="text-center">${index + 1}</td>        
                                <td class="text-center">${transaction.date.toISOString().split('T')[0]}</td>        
                                <td class="text-left">${transaction.description}</td>        
                                <td class="text-right">${transaction.type === 'income' ? transaction.amount.toLocaleString() : '0'}</td>        
                                <td class="text-right">${transaction.type === 'expense' ? transaction.amount.toLocaleString() : '0'}</td>        
                            </tr>        
                        `).join('')}        
                        <tr>        
                            <td colspan="3" class="text-right"><strong>Total</strong></td>        
                            <td class="text-right"><strong>${totalIncome.toLocaleString()}</strong></td>        
                            <td class="text-right"><strong>${totalExpense.toLocaleString()}</strong></td>        
                        </tr>        
                    </table>        
                </body>        
                </html>        
            `;

            const options = { format: 'A4' };
            pdf.create(htmlContent, options).toFile(path.join(__dirname, '../public', 'export', 'transaction_report.pdf'), (err, result) => {
                if (err) return res.status(500).send({ status: false, message: 'Error generating PDF.' });

                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', 'attachment; filename="transaction_report.pdf"');
                res.sendFile(result.filename, () => {
                    fs.unlinkSync(result.filename);
                });
            });
        } catch (e) {
            logger.error(e.toString());
            return res.status(500).send({ status: false, message: 'Internal server error.' });
        }
    }

}

module.exports = TransactionController;