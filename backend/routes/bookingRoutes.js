const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const auth = require('../middleware/auth');

router.post('/', auth, bookingController.createBooking);
router.get('/', auth, bookingController.getBookings);
router.get('/:id', auth, bookingController.getBookingById);
router.put('/:id/status', auth, bookingController.updateBookingStatus);
router.post('/payment/create-order', auth, bookingController.createPaymentOrder);
router.post('/payment/verify', auth, bookingController.verifyPayment);

module.exports = router;
