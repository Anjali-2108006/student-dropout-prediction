const express = require('express');
const router = express.Router();
const {
  getLogistics,
  getLogisticsById,
  createLogistics,
  updateLogistics,
  deleteLogistics,
} = require('../controllers/logisticsController');

router.route('/')
  .get(getLogistics)
  .post(createLogistics);

router.route('/:id')
  .get(getLogisticsById)
  .put(updateLogistics)
  .delete(deleteLogistics);

module.exports = router;
