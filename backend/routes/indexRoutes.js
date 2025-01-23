const AuthRoutes = require('./authRoutes');
const AllocationRoutes = require('./allocationRoutes')
const TransactionRoutes = require('./transactionRoutes');
const ReminderRoutes = require('./reminderRoutes');
const NotificationRoutes = require('./notificationRoutes');
const DashboardRoutes = require('./dashboardRoutes');

const IndexRoutes = {
    AuthRoutes,
    AllocationRoutes,
    DashboardRoutes,
    TransactionRoutes,
    ReminderRoutes,
    NotificationRoutes
}

module.exports = IndexRoutes;