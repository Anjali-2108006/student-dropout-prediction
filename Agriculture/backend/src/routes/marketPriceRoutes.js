const express = require('express');
const router = express.Router();
const {
  getMarketPrices,
  getMarketPriceById,
  createMarketPrice,
  updateMarketPrice,
  deleteMarketPrice,
} = require('../controllers/marketPriceController');

router.route('/')
  .get(getMarketPrices)
  .post(createMarketPrice);

router.route('/:id')
  .get(getMarketPriceById)
  .put(updateMarketPrice)
  .delete(deleteMarketPrice);

module.exports = router;
