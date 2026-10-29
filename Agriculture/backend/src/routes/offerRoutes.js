const express = require('express');
const router = express.Router();
const {
  getOffers,
  getOfferById,
  createOffer,
  updateOffer,
  deleteOffer,
} = require('../controllers/offerController');

router.route('/')
  .get(getOffers)
  .post(createOffer);

router.route('/:id')
  .get(getOfferById)
  .put(updateOffer)
  .delete(deleteOffer);

module.exports = router;
