import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { workerAPI, reviewAPI } from '../services/api';
import Layout from '../components/Layout';

const Stars = ({ rating }) => (
  <span className="text-amber-500">
    {'★'.repeat(Math.round(rating))}
    <span className="text-slate-300">{'★'.repeat(5 - Math.round(rating))}</span>
  </span>
);

const WorkerDetailPage = () => {
  const { id } = useParams();
  const [worker, setWorker] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [wr, rv] = await Promise.all([
          workerAPI.getWorkerById(id),
          reviewAPI.getWorkerReviews(id),
        ]);
        setWorker(wr.data);
        setReviews(rv.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load worker');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <Layout><p className="text-sm text-slate-500">Loading...</p></Layout>;
  if (error) return <Layout><div className="card p-6 text-sm text-red-700">{error}</div></Layout>;
  if (!worker) return null;

  return (
    <Layout>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-start gap-5">
            <div className="h-20 w-20 shrink-0 rounded-full bg-brand-100 flex items-center justify-center text-2xl font-semibold text-brand-700">
              {worker.name?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-semibold text-slate-900">{worker.name}</h1>
              <p className="capitalize text-slate-500">{worker.field}</p>
              <div className="mt-1 flex items-center gap-2 text-sm">
                <Stars rating={worker.rating || 0} />
                <span className="text-slate-500">
                  {(worker.rating || 0).toFixed(1)} · {worker.totalRatings || 0} reviews
                </span>
                {worker.isVerified && (
                  <span className="badge bg-emerald-50 text-emerald-700">Verified</span>
                )}
              </div>
            </div>
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-slate-500">Experience</dt>
              <dd className="mt-0.5 font-medium text-slate-900">{worker.experience || 0} yrs</dd>
            </div>
            <div>
              <dt className="text-slate-500">Hourly</dt>
              <dd className="mt-0.5 font-medium text-slate-900">₹{worker.hourlyRate}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Daily</dt>
              <dd className="mt-0.5 font-medium text-slate-900">₹{worker.dailyRate}</dd>
            </div>
          </dl>

          {worker.skills?.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-slate-900">Skills</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {worker.skills.map((s) => (
                  <span key={s} className="badge bg-slate-100 text-slate-700">{s}</span>
                ))}
              </div>
            </div>
          )}

          {worker.bio && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-slate-900">About</h3>
              <p className="mt-1 text-sm text-slate-600 whitespace-pre-line">{worker.bio}</p>
            </div>
          )}

          <div className="mt-6 border-t border-slate-200 pt-4">
            <h3 className="text-sm font-semibold text-slate-900">Contractor</h3>
            <p className="mt-1 text-sm text-slate-600">
              {worker.contractor?.name} · {worker.contractor?.phone}
            </p>
          </div>
        </div>

        <aside className="card flex flex-col p-6">
          <p className="text-sm text-slate-500">Daily rate</p>
          <p className="text-3xl font-semibold text-slate-900">₹{worker.dailyRate}</p>
          <p className="mt-1 text-xs text-slate-500">Final amount = daily rate × days booked</p>

          <Link
            to={`/book/${worker._id}`}
            className={`btn-primary mt-6 w-full ${worker.availability ? '' : 'pointer-events-none opacity-50'}`}
          >
            {worker.availability ? 'Book Now' : 'Currently unavailable'}
          </Link>
        </aside>
      </div>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-slate-900">Reviews</h2>
        {reviews.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No reviews yet.</p>
        ) : (
          <div className="mt-3 space-y-3">
            {reviews.map((r) => (
              <div key={r._id} className="card p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-900">{r.reviewer?.name || 'Anonymous'}</p>
                  <Stars rating={r.rating} />
                </div>
                <p className="mt-1 text-sm text-slate-600">{r.comment}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
};

export default WorkerDetailPage;
