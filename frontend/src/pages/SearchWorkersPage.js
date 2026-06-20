import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { workerAPI } from '../services/api';
import Layout from '../components/Layout';

const FIELDS = [
  'plumbing', 'electrical', 'carpentry', 'masonry',
  'painting', 'cleaning', 'gardening', 'other',
];

const Stars = ({ rating }) => (
  <span className="text-amber-500">
    {'★'.repeat(Math.round(rating))}
    <span className="text-slate-300">{'★'.repeat(5 - Math.round(rating))}</span>
  </span>
);

const WorkerCard = ({ worker }) => (
  <div className={`card flex flex-col p-5 ${!worker.availability ? 'opacity-75' : ''}`}>
    <div className="flex items-start gap-4">
      <div className="h-14 w-14 shrink-0 rounded-full bg-brand-100 flex items-center justify-center text-lg font-semibold text-brand-700">
        {worker.name?.charAt(0).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="truncate text-base font-semibold text-slate-900">{worker.name}</h3>
          <span className={`badge text-xs ${worker.availability ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
            {worker.availability ? 'Available' : 'Not Available'}
          </span>
        </div>
        <p className="text-sm capitalize text-slate-500">{worker.field}</p>
        <div className="mt-1 flex items-center gap-2 text-sm">
          <Stars rating={worker.rating || 0} />
          <span className="text-slate-500">
            {(worker.rating || 0).toFixed(1)} ({worker.totalRatings || 0})
          </span>
        </div>
      </div>
    </div>

    <div className="mt-4 flex items-end justify-between">
      <div>
        <p className="text-xs text-slate-500">Daily rate</p>
        <p className="text-lg font-semibold text-slate-900">₹{worker.dailyRate}</p>
      </div>
      <Link
        to={`/workers/${worker._id}`}
        className={`btn-primary ${!worker.availability ? 'opacity-60 pointer-events-none' : ''}`}
      >
        {worker.availability ? 'View' : 'Unavailable'}
      </Link>
    </div>
  </div>
);

const SearchWorkersPage = () => {
  const [workers, setWorkers] = useState([]);
  const [filters, setFilters] = useState({ keyword: '', field: '', maxPrice: '' });
  const [loading, setLoading] = useState(false);

  const fetchWorkers = async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v !== '')
      );
      const response = await workerAPI.searchWorkers(params);
      setWorkers(response.data);
    } catch (error) {
      console.error('Failed to fetch workers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWorkers(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFilterChange = (e) =>
    setFilters({ ...filters, [e.target.name]: e.target.value });

  const handleSearch = (e) => {
    e.preventDefault();
    fetchWorkers();
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Find Workers</h1>
        <p className="mt-1 text-sm text-slate-500">
          Search by name, skill, field, or price.
        </p>
      </div>

      <form
        onSubmit={handleSearch}
        className="card mb-6 grid grid-cols-1 gap-3 p-4 sm:grid-cols-4"
      >
        <input
          type="text"
          name="keyword"
          placeholder="Name or skill"
          className="input sm:col-span-2"
          value={filters.keyword}
          onChange={handleFilterChange}
        />
        <select
          name="field"
          className="input"
          value={filters.field}
          onChange={handleFilterChange}
        >
          <option value="">All fields</option>
          {FIELDS.map((f) => (
            <option key={f} value={f} className="capitalize">{f}</option>
          ))}
        </select>
        <input
          type="number"
          name="maxPrice"
          placeholder="Max ₹/day"
          className="input"
          value={filters.maxPrice}
          onChange={handleFilterChange}
        />
        <button type="submit" className="btn-primary sm:col-span-4 sm:justify-self-end">
          Search
        </button>
      </form>

      {loading ? (
        <p className="text-sm text-slate-500">Loading...</p>
      ) : workers.length === 0 ? (
        <div className="card p-8 text-center text-sm text-slate-500">
          No workers match your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {workers.map((w) => <WorkerCard key={w._id} worker={w} />)}
        </div>
      )}
    </Layout>
  );
};

export default SearchWorkersPage;
