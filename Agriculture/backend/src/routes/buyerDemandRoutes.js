const express = require('express');
const router = express.Router();
const {
  getBuyerDemands,
  getBuyerDemandById,
  createBuyerDemand,
  updateBuyerDemand,
  deleteBuyerDemand,
} = require('../controllers/buyerDemandController');

router.route('/')
  .get(getBuyerDemands)
  .post(createBuyerDemand);

router.route('/:id')
  .get(getBuyerDemandById)
  .put(updateBuyerDemand)
  .delete(deleteBuyerDemand);

module.exports = router;
