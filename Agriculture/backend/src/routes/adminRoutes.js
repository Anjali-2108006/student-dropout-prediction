const express = require('express');
const router = express.Router();
const {
  getAdminStats,
  getMarketAnalytics,
  getTransactionAnalytics,
  getLogisticsAnalytics,
  getGrievanceAnalytics,
  getAdminActivity,
} = require('../controllers/adminController');

router.get('/stats', getAdminStats);
router.get('/analytics/markets', getMarketAnalytics);
router.get('/analytics/transactions', getTransactionAnalytics);
router.get('/analytics/logistics', getLogisticsAnalytics);
router.get('/analytics/grievances', getGrievanceAnalytics);
router.get('/activity', getAdminActivity);

module.exports = router;
