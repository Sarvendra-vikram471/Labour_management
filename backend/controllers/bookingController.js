const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

const isMockPaymentMode = () => {
  const key = process.env.RAZORPAY_KEY_ID || '';
  const secret = process.env.RAZORPAY_KEY_SECRET || '';
  return !key || key.includes('xxx') || !secret || secret.includes('xxx');
};

exports.createBooking = async (req, res) => {
  try {
    const { workerId, bookingDate, numberOfDays, workDescription, location } = req.body;
    const Worker = require('../models/Worker');
    const worker = await Worker.findById(workerId);

    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }

    if (!worker.availability) {
      return res.status(400).json({ message: 'Worker is not available for booking' });
    }

    const totalAmount = worker.dailyRate * numberOfDays;

    const booking = new Booking({
      customer: req.user.userId,
      worker: workerId,
      contractor: worker.contractor,
      bookingDate,
      numberOfDays,
      workDescription,
      location,
      totalAmount
    });

    await booking.save();
    res.status(201).json({ message: 'Booking created successfully', booking });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getBookings = async (req, res) => {
  try {
    let query = {};

    if (req.user.userType === 'contractor') {
      query.contractor = req.user.userId;
    } else {
      query.customer = req.user.userId;
    }

    const bookings = await Booking.find(query)
      .populate('customer', 'name phone email')
      .populate('worker', 'name field')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('customer', 'name phone email address')
      .populate('worker', 'name phone field rating')
      .populate('contractor', 'name phone');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);
    const Worker = require('../models/Worker');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.status = status;
    await booking.save();

    // Automatically sync worker availability with booking state
    if (status === 'accepted' || status === 'in-progress') {
      await Worker.findByIdAndUpdate(booking.worker, { availability: false });
    } else if (status === 'completed' || status === 'cancelled') {
      await Worker.findByIdAndUpdate(booking.worker, { availability: true });
    }

    res.json({ message: 'Booking status updated', booking });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createPaymentOrder = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (isMockPaymentMode()) {
      const mockOrderId = `mock_order_${Date.now()}`;
      const payment = new Payment({
        booking: bookingId,
        amount: booking.totalAmount,
        razorpayOrderId: mockOrderId
      });
      await payment.save();

      booking.razorpayOrderId = mockOrderId;
      await booking.save();

      return res.json({
        orderId: mockOrderId,
        amount: booking.totalAmount * 100,
        currency: 'INR',
        mockMode: true
      });
    }

    const options = {
      amount: booking.totalAmount * 100,
      currency: 'INR',
      receipt: `receipt_${bookingId}`,
      payment_capture: 1
    };

    const order = await razorpay.orders.create(options);

    const payment = new Payment({
      booking: bookingId,
      amount: booking.totalAmount,
      razorpayOrderId: order.id
    });

    await payment.save();

    booking.razorpayOrderId = order.id;
    await booking.save();

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      mockMode: false
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId, mockPayment } = req.body;

    if (mockPayment) {
      const booking = await Booking.findById(bookingId);
      if (!booking) return res.status(404).json({ message: 'Booking not found' });

      booking.paymentStatus = 'paid';
      booking.razorpayPaymentId = `mock_pay_${Date.now()}`;
      await booking.save();

      const payment = await Payment.findOne({ razorpayOrderId: booking.razorpayOrderId });
      if (payment) {
        payment.status = 'completed';
        await payment.save();
      }

      return res.json({ message: 'Payment confirmed successfully', booking });
    }

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = require('crypto')
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      const booking = await Booking.findById(bookingId);
      booking.paymentStatus = 'paid';
      booking.razorpayPaymentId = razorpay_payment_id;
      await booking.save();

      const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });
      payment.razorpayPaymentId = razorpay_payment_id;
      payment.razorpaySignature = razorpay_signature;
      payment.status = 'completed';
      await payment.save();

      res.json({ message: 'Payment verified successfully', booking });
    } else {
      res.status(400).json({ message: 'Payment verification failed' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
