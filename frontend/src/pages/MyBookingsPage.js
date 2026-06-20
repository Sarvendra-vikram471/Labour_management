import React, { useContext, useEffect, useState } from 'react';
import { bookingAPI, reviewAPI } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import Layout from '../components/Layout';

const STATUS_STYLES = {
  pending: 'bg-amber-50 text-amber-700',
  accepted: 'bg-blue-50 text-blue-700',
  'in-progress': 'bg-indigo-50 text-indigo-700',
  completed: 'bg-emerald-50 text-emerald-700',
  cancelled: 'bg-red-50 text-red-700',
};

const PAYMENT_STYLES = {
  pending: 'bg-slate-100 text-slate-700',
  paid: 'bg-emerald-50 text-emerald-700',
  refunded: 'bg-red-50 text-red-700',
};

const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', {
  day: 'numeric', month: 'short', year: 'numeric',
});

const StarPicker = ({ value, onChange }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        onClick={() => onChange(star)}
        className={`text-2xl transition ${star <= value ? 'text-amber-400' : 'text-slate-300'}`}
      >
        ★
      </button>
    ))}
  </div>
);

const ReviewForm = ({ bookingId, onSuccess, onCancel }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await reviewAPI.createReview({ bookingId, rating, comment });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 border-t border-slate-200 pt-4 space-y-3">
      <p className="text-sm font-medium text-slate-900">Leave a review</p>
      <div>
        <label className="text-xs text-slate-500 mb-1 block">Rating</label>
        <StarPicker value={rating} onChange={setRating} />
      </div>
      <div>
        <label className="text-xs text-slate-500 mb-1 block">Comment</label>
        <textarea
          rows="2"
          className="input text-sm"
          placeholder="Share your experience with this worker..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          required
        />
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" className="btn-primary text-sm" disabled={submitting}>
          {submitting ? 'Submitting...' : 'Submit Review'}
        </button>
        <button type="button" className="btn-outline text-sm" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
};

const MyBookingsPage = () => {
  const { user } = useContext(AuthContext);
  const isContractor = user?.userType === 'contractor';

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewedIds, setReviewedIds] = useState(new Set());
  const [openReviewId, setOpenReviewId] = useState(null);

  const fetchBookings = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await bookingAPI.getBookings();
      const data = res.data;
      setBookings(data);

      // For customers, check which completed bookings already have a review
      if (!isContractor) {
        const completed = data.filter((b) => b.status === 'completed');
        const checks = await Promise.all(
          completed.map((b) =>
            reviewAPI.getBookingReview(b._id)
              .then((r) => (r.data ? b._id : null))
              .catch(() => null)
          )
        );
        setReviewedIds(new Set(checks.filter(Boolean)));
      }
    } catch (err) {
      if (!silent) setError(err.response?.data?.message || 'Failed to load bookings');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    const interval = setInterval(() => fetchBookings(true), 15000);
    return () => clearInterval(interval);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const updateStatus = async (id, status) => {
    try {
      await bookingAPI.updateBookingStatus(id, { status });
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    }
  };

  const handleReviewSuccess = (bookingId) => {
    setReviewedIds((prev) => new Set([...prev, bookingId]));
    setOpenReviewId(null);
  };

  // Contractor summary: count bookings by status
  const pendingCount = isContractor ? bookings.filter((b) => b.status === 'pending').length : 0;
  const activeCount = isContractor
    ? bookings.filter((b) => b.status === 'accepted' || b.status === 'in-progress').length
    : 0;

  return (
    <Layout>
      <h1 className="text-2xl font-semibold text-slate-900">
        {isContractor ? 'Incoming Bookings' : 'My Bookings'}
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        {isContractor
          ? 'Manage bookings made for your workers.'
          : 'Your booking history and status.'}
      </p>

      {isContractor && bookings.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-3">
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm">
            <span className="font-semibold text-amber-700">{pendingCount}</span>
            <span className="ml-1 text-amber-600">awaiting action</span>
          </div>
          <div className="rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm">
            <span className="font-semibold text-indigo-700">{activeCount}</span>
            <span className="ml-1 text-indigo-600">active jobs</span>
          </div>
        </div>
      )}

      {loading ? (
        <p className="mt-6 text-sm text-slate-500">Loading...</p>
      ) : error ? (
        <div className="mt-6 card p-4 text-sm text-red-700">{error}</div>
      ) : bookings.length === 0 ? (
        <div className="mt-6 card p-8 text-center text-sm text-slate-500">
          No bookings yet.
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {bookings.map((b) => (
            <div key={b._id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-base font-semibold text-slate-900">
                    {b.worker?.name}{' '}
                    <span className="text-sm font-normal capitalize text-slate-500">
                      · {b.worker?.field}
                    </span>
                  </h3>
                  {isContractor && (
                    <p className="text-xs text-slate-500">
                      Customer: {b.customer?.name} · {b.customer?.phone}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className={`badge ${STATUS_STYLES[b.status] || 'bg-slate-100 text-slate-700'}`}>
                    {b.status}
                  </span>
                  <span className={`badge ${PAYMENT_STYLES[b.paymentStatus] || 'bg-slate-100'}`}>
                    {b.paymentStatus}
                  </span>
                </div>
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                <div>
                  <dt className="text-slate-500">Start</dt>
                  <dd className="font-medium">{formatDate(b.bookingDate)}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Days</dt>
                  <dd className="font-medium">{b.numberOfDays}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Total</dt>
                  <dd className="font-medium">₹{b.totalAmount}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Location</dt>
                  <dd className="font-medium truncate">{b.location}</dd>
                </div>
              </dl>

              {b.workDescription && (
                <p className="mt-3 text-sm text-slate-600">{b.workDescription}</p>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                {!isContractor && b.status === 'pending' && (
                  <button onClick={() => updateStatus(b._id, 'cancelled')} className="btn-outline">
                    Cancel
                  </button>
                )}
                {isContractor && b.status === 'pending' && (
                  <>
                    <button onClick={() => updateStatus(b._id, 'accepted')} className="btn-primary">
                      Accept
                    </button>
                    <button onClick={() => updateStatus(b._id, 'cancelled')} className="btn-outline">
                      Decline
                    </button>
                  </>
                )}
                {isContractor && b.status === 'accepted' && (
                  <button onClick={() => updateStatus(b._id, 'in-progress')} className="btn-primary">
                    Mark In Progress
                  </button>
                )}
                {isContractor && b.status === 'in-progress' && (
                  <button onClick={() => updateStatus(b._id, 'completed')} className="btn-primary">
                    Mark Completed
                  </button>
                )}

                {/* Review button for customers on completed bookings */}
                {!isContractor && b.status === 'completed' && (
                  reviewedIds.has(b._id) ? (
                    <span className="badge bg-emerald-50 text-emerald-700">Reviewed ✓</span>
                  ) : openReviewId !== b._id ? (
                    <button
                      onClick={() => setOpenReviewId(b._id)}
                      className="btn-outline text-sm"
                    >
                      Leave Review
                    </button>
                  ) : null
                )}
              </div>

              {/* Inline review form */}
              {!isContractor && openReviewId === b._id && (
                <ReviewForm
                  bookingId={b._id}
                  onSuccess={() => handleReviewSuccess(b._id)}
                  onCancel={() => setOpenReviewId(null)}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
};

export default MyBookingsPage;
