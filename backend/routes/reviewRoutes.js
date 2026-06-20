const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const auth = require('../middleware/auth');

router.post('/', auth, reviewController.createReview);
router.get('/worker/:workerId', reviewController.getWorkerReviews);
router.get('/booking/:bookingId', auth, reviewController.getBookingReview);
router.delete('/:id', auth, reviewController.deleteReview);

module.exports = router;
