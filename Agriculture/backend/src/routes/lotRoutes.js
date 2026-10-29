const express = require('express');
const router = express.Router();
const {
  getLots,
  getLotById,
  createLot,
  updateLot,
  deleteLot,
} = require('../controllers/lotController');

router.route('/')
  .get(getLots)
  .post(createLot);

router.route('/:id')
  .get(getLotById)
  .put(updateLot)
  .delete(deleteLot);

module.exports = router;
