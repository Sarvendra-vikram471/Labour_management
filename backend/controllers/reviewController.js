const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Worker = require('../models/Worker');

exports.createReview = async (req, res) => {
  try {
    const { bookingId, rating, comment } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.customer.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Only the customer can review this booking' });
    }

    if (booking.status !== 'completed') {
      return res.status(400).json({ message: 'You can only review a completed booking' });
    }

    const existing = await Review.findOne({ booking: bookingId });
    if (existing) {
      return res.status(400).json({ message: 'You have already reviewed this booking' });
    }

    const review = new Review({
      booking: bookingId,
      reviewer: req.user.userId,
      worker: booking.worker,
      rating,
      comment
    });

    await review.save();

    const allReviews = await Review.find({ worker: booking.worker });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await Worker.findByIdAndUpdate(booking.worker, {
      rating: avgRating,
      totalRatings: allReviews.length
    });

    res.status(201).json({ message: 'Review submitted successfully', review });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getWorkerReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ worker: req.params.workerId })
      .populate('reviewer', 'name profileImage')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getBookingReview = async (req, res) => {
  try {
    const review = await Review.findOne({ booking: req.params.bookingId })
      .populate('reviewer', 'name');
    res.json(review || null);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.reviewer.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    await Review.findByIdAndDelete(req.params.id);

    const allReviews = await Review.find({ worker: review.worker });
    const avgRating = allReviews.length > 0
      ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
      : 0;

    await Worker.findByIdAndUpdate(review.worker, {
      rating: avgRating,
      totalRatings: allReviews.length
    });

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
