const express = require('express');
const router = express.Router();
const {
  getGrievances,
  getGrievanceById,
  createGrievance,
  updateGrievance,
  deleteGrievance,
} = require('../controllers/grievanceController');

router.route('/')
  .get(getGrievances)
  .post(createGrievance);

router.route('/:id')
  .get(getGrievanceById)
  .put(updateGrievance)
  .delete(deleteGrievance);

module.exports = router;
