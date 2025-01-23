const Transaction = require('../models/transactionModel');
const logger = require('../libs/winston');
const { client} = require('../libs/redis');
const { formatDate } = require('../utils/timeServer')

const DashboardController = {
    getDashboard: async (req, res) => {
        const userId = req.user.id;
        const cacheKey = `dashboard:${userId}`;

        try {
            const cacheData = await client.get(cacheKey);
            if(cacheData) {
                return res.status(200).json({
                    status: true,
                    data: JSON.parse(cacheData)
                });
            } else {
                const totalIncome = await Transaction.find({userId, type: 'income'})
                    .then(transactions => transactions.reduce((sum, transaction) => sum + transaction.amount, 0));

                const totalExpenses = await Transaction.find({userId, type: 'expense'})
                    .then(transactions => transactions.reduce((sum, transaction) => sum + transaction.amount, 0));

                const lastMonth = new Date();
                lastMonth.setMonth(lastMonth.getMonth() - 1);
                const lastMonthStart = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
                const lastMonthEnd = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0, 23, 59, 59);

                const lastMonthIncome = await Transaction.find({
                    userId,
                    type: 'income',
                    date: {$gte: lastMonthStart, $lte: lastMonthEnd}
                }).then(transactions => transactions.reduce((sum, transaction) => sum + transaction.amount, 0));

                const lastMonthExpenses = await Transaction.find({
                    userId,
                    type: 'expense',
                    date: {$gte: lastMonthStart, $lte: lastMonthEnd}
                }).then(transactions => transactions.reduce((sum, transaction) => sum + transaction.amount, 0));

                let incomeChange, expensesChange;
                if (lastMonthIncome === 0 && totalIncome > 0) {
                    incomeChange = 100;
                } else if (lastMonthIncome === 0) {
                    incomeChange = 0;
                } else {
                    incomeChange = ((totalIncome - lastMonthIncome) / lastMonthIncome) * 100;
                }

                if (lastMonthExpenses === 0 && totalExpenses > 0) {
                    expensesChange = 100;
                } else if (lastMonthExpenses === 0) {
                    expensesChange = 0;
                } else {
                    expensesChange = ((totalExpenses - lastMonthExpenses) / lastMonthExpenses) * 100;
                }

                const cardData = [
                    {
                        title: "Total Income",
                        value: totalIncome,
                        icon: "<DollarSign width={16} />",
                        percentage: incomeChange.toFixed(2) + '%',
                        type: "plus",
                    },
                    {
                        title: "Total Expenses",
                        value: totalExpenses,
                        icon: "<DollarSign width={16} />",
                        percentage: expensesChange.toFixed(2) + '%',
                        type: "minus",
                    },
                    {
                        title: "Last Month Income",
                        value: lastMonthIncome,
                        icon: "<DollarSign width={16} />",
                        percentage: null,
                        type: null,
                    },
                    {
                        title: "Last Month Expenses",
                        value: lastMonthExpenses,
                        icon: "<DollarSign width={16} />",
                        percentage: null,
                        type: null,
                    },
                ];

                const monthlyOverview = [];
                const currentDate = new Date();
                for (let i = 5; i >= 0; i--) {
                    const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
                    const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
                    const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59);

                    const income = await Transaction.find({
                        userId,
                        type: 'income',
                        date: {$gte: monthStart, $lte: monthEnd}
                    }).then(transactions => transactions.reduce((sum, transaction) => sum + transaction.amount, 0));

                    const expenses = await Transaction.find({
                        userId,
                        type: 'expense',
                        date: {$gte: monthStart, $lte: monthEnd}
                    }).then(transactions => transactions.reduce((sum, transaction) => sum + transaction.amount, 0));

                    monthlyOverview.push({
                        month: monthDate.toLocaleString('default', {month: 'long'}),
                        income,
                        expenses
                    });
                }

                const recentTransactions = await Transaction.find({userId})
                    .sort({date: -1})
                    .limit(6)
                    .populate('allocationId', 'name')
                    .exec();

                const formattedRecentTransactions = recentTransactions.map(transaction => ({
                    date: formatDate(transaction.date.toLocaleDateString()),
                    allocationName: transaction.allocationId ? transaction.allocationId.name : 'N/A',
                    amount: transaction.amount,
                    description: transaction.description
                }));

                const responseData = {
                    cardData: cardData,
                    monthlyOverview,
                    recentTransactions: formattedRecentTransactions
                };

                await client.set(cacheKey, JSON.stringify(responseData), { EX: 60 * 3});

                return res.status(200).json({
                    status: true,
                    data: responseData
                });
            }
        } catch (error) {
            logger.error(error.toString());
            return res.status(500).json({ status: false, message: 'Internal server error.' });
        }
    }
};

module.exports = DashboardController;
