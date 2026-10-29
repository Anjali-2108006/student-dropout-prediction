const express = require('express');
const router = express.Router();
const {
  getMarketIntelligence,
  getMarketForecast,
} = require('../controllers/marketIntelligenceController');

router.get('/', getMarketIntelligence);
router.get('/forecast', getMarketForecast);

module.exports = router;
