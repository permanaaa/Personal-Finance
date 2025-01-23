const pdf = require('html-pdf');
const fs = require('fs');
const path = require('path');
const Allocation = require('../models/allocationModel');
const Transaction = require('../models/transactionModel');
const logger = require('../libs/winston');
const { client, deleteKeysByPattern } = require('../libs/redis');
const { timeServer } = require('../utils/timeServer');

const AllocationController = {
    getAllocations: async (req, res) => {
        const { page, perPage, search, month } = req.query;
        const userId = req.user.id;
        const cacheKey = `allocations:${userId}:${month}:${page}:${perPage}:${search}`;

        try {
            let cacheData = await client.get(cacheKey);

            if(cacheData) {
                cacheData = JSON.parse(cacheData);
                return res.status(200).send({ status: true, data: cacheData.data, page: cacheData.page, totalPage: cacheData.totalPage, totalAllocations: cacheData.totalAllocations });
            } else {
                const query = { userId };

                if (search) {
                    query.name = { $regex: search, $options: 'i' };
                }

                const totalAllocations = await Allocation.find(query).countDocuments();
                const totalPage = Math.ceil(totalAllocations / perPage);

                const allocations = await Allocation.find(query)
                    .skip((page - 1) * perPage)
                    .limit(perPage)
                    .sort({ name: 1 });

                const currentYear = new Date().getFullYear();
                const mapAllocations = await Promise.all(allocations.map(async allocation => {
                    const startDate = new Date(currentYear, month - 1, 1);
                    const endDate = new Date(currentYear, month, 0, 23, 59, 59, 999);

                    const transactions = await Transaction.find({
                        allocationId: allocation._id,
                        date: { $gte: startDate, $lte: endDate }
                    });

                    const budgetUsage = transactions.reduce((sum, transaction) => {
                        return sum + transaction.amount;
                    }, 0);

                    let budgetLeft;
                    let percentage;

                    if (allocation.type === 'income') {
                        budgetLeft = budgetUsage > allocation.budget ? 0 : allocation.budget - budgetUsage;
                        percentage = Math.ceil((budgetUsage / allocation.budget) * 100);
                    } else if (allocation.type === 'expense') {
                        budgetLeft = allocation.budget - Math.min(budgetUsage, allocation.budget);
                        percentage = allocation.budget > 0 ? Math.ceil((Math.min(budgetUsage, allocation.budget) / allocation.budget) * 100) : 0;
                    }

                    return {
                        id: allocation._id,
                        name: allocation.name,
                        budget: allocation.budget,
                        budgetUsage,
                        budgetLeft,
                        percentage,
                        type: allocation.type,
                        createdAt: allocation.createdAt
                    };
                }));

                await client.set(cacheKey, JSON.stringify({ data: mapAllocations, page, totalPage, totalAllocations }), { EX: 60 * 5 });

                return res.status(200).send({ status: true, data: mapAllocations, page, totalPage, totalAllocations });
            }

        } catch (e) {
            logger.error(e.toString());
            return res.status(500).send({ status: false, message: 'Internal server error.' });
        }
    },

    getDetailAllocation: async (req, res) => {
        const { id } = req.params;
        const userId = req.user.id;
        const cacheKey = `allocations-detail:${userId}:${id}`;

        try {
            let cacheData = await client.get(cacheKey);
            if(cacheData) {
                return res.status(200).send({ status: true, data: JSON.parse(cacheData) });
            } else {
                let allocation = await Allocation.findOne({ userId, _id: id });
                if(!allocation) {
                    return res.status(404).send({ status: false, message: 'Allocation not found.' });
                } else {

                    allocation = {
                        id: allocation._id,
                        name: allocation.name,
                        budget: allocation.budget,
                        budgetUsage: 0,
                        budgetLeft: 0,
                        percentage: 0,
                        type: allocation.type,
                        createdAt: allocation.createdAt
                    };

                    await client.set(cacheKey, JSON.stringify(allocation), { EX: 60 * 5 });
                    return res.status(200).send({ status: true, data: allocation });
                }
            }
        } catch (e) {
            logger.error(e.toString());
            return res.status(500).send({ status: false, message: 'Internal server error.' });
        }
    },

    postAllocation: async (req, res) => {
        const { name, budget, type } = req.body;
        const userId = req.user.id;
        const cacheKey = `allocations:${userId}`;

        try {
            if(await Allocation.findOne({ userId, name })) {
                return res.status(400).send({ status: false, message: 'Allocation name already exists.' });
            }

            const allocation = new Allocation({ userId, name, budget, type, createdAt:timeServer() });
            await allocation.save();
            await deleteKeysByPattern(cacheKey);

            return res.status(201).send({ status: true, message: 'Allocation created successfully.' });

        } catch (e) {
            logger.error(e.toString());
            return res.status(500).send({ status: false, message: 'Internal server error.' });
        }
    },

    putAllocation: async (req, res) => {
        const { name, budget,type } = req.body;
        const { id } = req.params;
        const userId = req.user.id;
        const cacheKey = `allocations:${userId}`;

        try {

            const allocation = await Allocation.findOne({ _id: id, userId });
            if (!allocation) {
                return res.status(404).send({ status: false, message: 'Allocation not found.' });
            }

            if (allocation.name !== name) {
                const existingAllocation = await Allocation.findOne({ userId, name });
                if (existingAllocation) {
                    return res.status(400).send({ status: false, message: 'Allocation with this name already exists.' });
                }
            }

            allocation.name = name;
            allocation.budget = budget;
            allocation.type = type;
            allocation.updatedAt = timeServer();
            await allocation.save();
            await deleteKeysByPattern(cacheKey);

            return res.status(200).send({ status: true, message: 'Allocation update suscessfully.' });

        } catch (e) {
            logger.error(e.toString());
            return res.status(500).send({ status: false, message: 'Internal server error.' });
        }
    },

    deleteAllocation: async (req, res) => {
        const { id } = req.params;
        const userId = req.user.id;
        const cacheKey = `allocations:${userId}`;

        try {
            const allocation = await Allocation.findOne({ _id: id, userId });

            if(!allocation) {
                return res.status(404).send({status: false, message:'Allocation not found.'});
            }

            await allocation.deleteOne();
            await deleteKeysByPattern(cacheKey);

            return res.status(200).send({status: true, message:'Allocation deleted successfully.'});

        } catch (e) {
            logger.error(e.toString());
            return res.status(500).send({ status: false, message: 'Internal server error.' });
        }
    },

    getExportReport: async (req, res) => {
        const { search, month } = req.query;
        const userId = req.user.id;
        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];

        try {

            const query = { userId };

            if (search) {
                query.name = { $regex: search, $options: 'i' };
            }

            const allocations = await Allocation.find(query).sort({ name: 1 });

            const currentYear = new Date().getFullYear();
            const mapAllocations = await Promise.all(allocations.map(async allocation => {
                const startDate = new Date(currentYear, month - 1, 1);
                const endDate = new Date(currentYear, month, 0, 23, 59, 59, 999);

                const transactions = await Transaction.find({
                    allocationId: allocation._id,
                    date: { $gte: startDate, $lte: endDate }
                });

                const budgetUsage = transactions.reduce((sum, transaction) => {
                    return sum + transaction.amount;
                }, 0);

                let budgetLeft = allocation.budget - budgetUsage;
                if (allocation.type === 'income' && budgetUsage > allocation.budget) {
                    budgetLeft = 0;
                }
                let percentage = allocation.budget > 0 ? Math.ceil((budgetUsage / allocation.budget) * 100) : 0;

                return {
                    id: allocation._id,
                    name: allocation.name,
                    budget: allocation.budget,
                    budgetUsage,
                    budgetLeft,
                    percentage,
                    type: allocation.type,
                    createdAt: allocation.createdAt
                };
            }));

            let totalIncome = 0;
            let totalExpense = 0;

            mapAllocations.forEach(allocation => {
                if (allocation.type === 'income') {
                    totalIncome += allocation.budgetUsage;
                } else if (allocation.type === 'expense') {
                    totalExpense += allocation.budgetUsage;
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
                    <h1>Allocation Summary</h1>    
                    <h2>Month: ${monthNames[month - 1]} ${currentYear}</h2>    
                    <h2>Total Income: Rp. ${totalIncome.toLocaleString()}</h2>    
                    <h2>Total Expense: Rp. ${totalExpense.toLocaleString()}</h2>    
                    <h2>Balance: Rp. ${(totalIncome - totalExpense).toLocaleString()}</h2>    
                    <table>    
                        <tr>    
                            <th>No</th>    
                            <th>Allocation Name</th>    
                            <th>Budget</th>    
                            <th>Budget Usage</th>    
                            <th>Budget Left</th>    
                            <th>Percentage</th>    
                            <th>Income</th>    
                            <th>Expense</th>    
                        </tr>    
                        ${mapAllocations.map((allocation, index) => `    
                            <tr>    
                                <td class="text-center">${index + 1}</td>    
                                <td class="text-left">${allocation.name}</td>    
                                <td class="text-right">${allocation.budget.toLocaleString()}</td>    
                                <td class="text-right">${allocation.budgetUsage.toLocaleString()}</td>    
                                <td class="text-right">${allocation.budgetLeft.toLocaleString()}</td>    
                                <td class="text-right">${allocation.percentage}%</td>    
                                <td class="text-right">${allocation.type === 'income' ? allocation.budgetUsage.toLocaleString() : '0'}</td>    
                                <td class="text-right">${allocation.type === 'expense' ? allocation.budgetUsage.toLocaleString() : '0'}</td>    
                            </tr>    
                        `).join('')}    
                        <tr>    
                            <td colspan="6" class="text-right">Total</td>    
                            <td class="text-right">${totalIncome.toLocaleString()}</td>  
                            <td class="text-right">${totalExpense.toLocaleString()}</td>     
                        </tr>    
                    </table>    
                </body>    
                </html>    
            `;

            const options = { format: 'A4' };
            pdf.create(htmlContent, options).toFile(path.join(__dirname, '../public', 'export', 'allocation_report.pdf'), (err, result) => {
                if (err) return res.status(500).send({ status: false, message: 'Error generating PDF.' });

                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', 'attachment; filename="allocation_report.pdf"');
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

module.exports = AllocationController