import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { workerAPI } from '../services/api';
import Layout from '../components/Layout';

const ManageWorkersPage = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [togglingId, setTogglingId] = useState(null);

  const fetchWorkers = async () => {
    try {
      const res = await workerAPI.getContractorWorkers();
      setWorkers(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load workers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWorkers(); }, []);

  const toggleAvailability = async (worker) => {
    setTogglingId(worker._id);
    try {
      await workerAPI.updateWorker(worker._id, { availability: !worker.availability });
      setWorkers((prev) =>
        prev.map((w) => w._id === worker._id ? { ...w, availability: !w.availability } : w)
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update availability');
    } finally {
      setTogglingId(null);
    }
  };

  // Compute per-field availability summary
  const fieldSummary = workers.reduce((acc, w) => {
    if (!acc[w.field]) acc[w.field] = { total: 0, available: 0 };
    acc[w.field].total += 1;
    if (w.availability) acc[w.field].available += 1;
    return acc;
  }, {});

  const totalAvailable = workers.filter((w) => w.availability).length;

  return (
    <Layout>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">My Workers</h1>
          <p className="mt-1 text-sm text-slate-500">Workers you have listed.</p>
        </div>
        <Link to="/add-worker" className="btn-primary">+ Add Worker</Link>
      </div>

      {loading ? (
        <p className="mt-6 text-sm text-slate-500">Loading...</p>
      ) : error ? (
        <div className="mt-6 card p-4 text-sm text-red-700">{error}</div>
      ) : workers.length === 0 ? (
        <div className="mt-6 card p-8 text-center text-sm text-slate-500">
          You haven&apos;t listed any workers yet.
        </div>
      ) : (
        <>
          {/* Availability summary */}
          <div className="mt-5 card p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <p className="text-xs text-slate-500">Overall</p>
                <p className="text-lg font-semibold text-slate-900">
                  {totalAvailable} / {workers.length}{' '}
                  <span className="text-sm font-normal text-slate-500">available</span>
                </p>
              </div>
              <div className="h-8 w-px bg-slate-200" />
              <div className="flex flex-wrap gap-3">
                {Object.entries(fieldSummary).map(([field, { total, available }]) => (
                  <div key={field} className="text-sm">
                    <span className="capitalize font-medium text-slate-700">{field}</span>
                    <span className="ml-1 text-slate-500">
                      {available}/{total}
                    </span>
                    {available === 0 && (
                      <span className="ml-1 text-xs text-red-500">(all busy)</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {workers.map((w) => (
              <div key={w._id} className="card p-5">
                <div className="flex items-start gap-3">
                  <div className="h-12 w-12 shrink-0 rounded-full bg-brand-100 flex items-center justify-center font-semibold text-brand-700">
                    {w.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold text-slate-900">{w.name}</h3>
                    <p className="text-sm capitalize text-slate-500">{w.field}</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-slate-500">₹{w.dailyRate}/day</span>
                  <span className={`badge ${w.availability ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                    {w.availability ? 'Available' : 'Unavailable'}
                  </span>
                </div>

                <button
                  onClick={() => toggleAvailability(w)}
                  disabled={togglingId === w._id}
                  className="btn-outline mt-3 w-full text-xs"
                >
                  {togglingId === w._id
                    ? 'Updating...'
                    : w.availability
                    ? 'Mark as Unavailable'
                    : 'Mark as Available'}
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </Layout>
  );
};

export default ManageWorkersPage;
