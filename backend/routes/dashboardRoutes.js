const DashboardController = require('../controllers/dashboardController');
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const rateLimit = require("../middlewares/rateLimit");

router.get('/', authMiddleware,rateLimit(100, 60000), DashboardController.getDashboard);

module.exports = router;