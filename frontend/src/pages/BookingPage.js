import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { workerAPI, bookingAPI } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import Layout from '../components/Layout';

const RAZORPAY_KEY_ID = process.env.REACT_APP_RAZORPAY_KEY_ID || '';

const BookingPage = () => {
  const { workerId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [worker, setWorker] = useState(null);
  const [loadingWorker, setLoadingWorker] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    bookingDate: today,
    numberOfDays: 1,
    workDescription: '',
    location: '',
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await workerAPI.getWorkerById(workerId);
        setWorker(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load worker');
      } finally {
        setLoadingWorker(false);
      }
    })();
  }, [workerId]);

  const totalAmount = worker ? worker.dailyRate * Number(form.numberOfDays || 0) : 0;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: name === 'numberOfDays' ? Math.max(1, Number(value)) : value });
  };

  const openRazorpay = (booking, order) =>
    new Promise((resolve, reject) => {
      if (!window.Razorpay) {
        reject(new Error('Razorpay SDK not loaded'));
        return;
      }
      const rzp = new window.Razorpay({
        key: RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: 'Labour Management',
        description: `Booking for ${worker.name}`,
        prefill: { name: user?.name, email: user?.email },
        theme: { color: '#3b5bdb' },
        handler: async (response) => {
          try {
            await bookingAPI.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingId: booking._id,
            });
            resolve();
          } catch (err) {
            reject(err);
          }
        },
        modal: { ondismiss: () => reject(new Error('Payment cancelled')) },
      });
      rzp.open();
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const bookingRes = await bookingAPI.createBooking({ workerId, ...form });
      const booking = bookingRes.data.booking;

      const orderRes = await bookingAPI.createPaymentOrder({ bookingId: booking._id });
      const orderData = orderRes.data;

      if (orderData.mockMode) {
        // Razorpay not configured — use test payment flow
        await bookingAPI.verifyPayment({ bookingId: booking._id, mockPayment: true });
        navigate('/bookings');
        return;
      }

      if (!RAZORPAY_KEY_ID) {
        setError('Payment gateway is not configured (REACT_APP_RAZORPAY_KEY_ID missing).');
        return;
      }

      await openRazorpay(booking, orderData);
      navigate('/bookings');
    } catch (err) {
      if (err.message === 'Payment cancelled') {
        setError('Payment was cancelled. Your booking is saved but unpaid.');
      } else {
        setError(err.response?.data?.message || err.message || 'Booking failed');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingWorker) return <Layout><p className="text-sm text-slate-500">Loading...</p></Layout>;
  if (!worker) return <Layout><div className="card p-6 text-sm text-red-700">{error || 'Worker not found'}</div></Layout>;

  if (!worker.availability) {
    return (
      <Layout>
        <div className="card p-8 text-center">
          <p className="text-lg font-semibold text-slate-900">{worker.name} is currently unavailable</p>
          <p className="mt-2 text-sm text-slate-500">This worker is already assigned to another job. Please check back later.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <h1 className="text-2xl font-semibold text-slate-900">Book {worker.name}</h1>
      <p className="mt-1 text-sm text-slate-500 capitalize">{worker.field} · ₹{worker.dailyRate}/day</p>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <form onSubmit={handleSubmit} className="card space-y-4 p-6 lg:col-span-2">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Start date</label>
              <input
                type="date"
                name="bookingDate"
                min={today}
                className="input"
                value={form.bookingDate}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="label">Number of days</label>
              <input
                type="number"
                name="numberOfDays"
                min="1"
                className="input"
                value={form.numberOfDays}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div>
            <label className="label">Work description</label>
            <textarea
              name="workDescription"
              rows="3"
              className="input"
              placeholder="What do you need done?"
              value={form.workDescription}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="label">Location</label>
            <input
              name="location"
              className="input"
              placeholder="Address where the work happens"
              value={form.location}
              onChange={handleChange}
              required
            />
          </div>

          {error && (
            <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <button type="submit" className="btn-primary w-full" disabled={submitting}>
            {submitting ? 'Processing...' : `Pay ₹${totalAmount} & Confirm`}
          </button>
        </form>

        <aside className="card h-fit p-6">
          <h3 className="text-sm font-semibold text-slate-900">Summary</h3>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">Daily rate</dt>
              <dd className="font-medium">₹{worker.dailyRate}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Days</dt>
              <dd className="font-medium">{form.numberOfDays}</dd>
            </div>
            <div className="border-t border-slate-200 pt-2 flex justify-between text-base">
              <dt className="font-semibold text-slate-900">Total</dt>
              <dd className="font-semibold text-slate-900">₹{totalAmount}</dd>
            </div>
          </dl>
          <p className="mt-4 text-xs text-slate-500">
            Payment is processed securely via Razorpay. In test mode, use card 4111 1111 1111 1111.
          </p>
        </aside>
      </div>
    </Layout>
  );
};

export default BookingPage;
