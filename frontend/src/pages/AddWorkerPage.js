import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { workerAPI } from '../services/api';
import Layout from '../components/Layout';

const FIELDS = [
  'plumbing', 'electrical', 'carpentry', 'masonry',
  'painting', 'cleaning', 'gardening', 'other',
];

const AddWorkerPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    field: 'plumbing',
    experience: 0,
    hourlyRate: '',
    dailyRate: '',
    skills: '',
    bio: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        experience: Number(form.experience),
        hourlyRate: Number(form.hourlyRate),
        dailyRate: Number(form.dailyRate),
        skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
      };
      await workerAPI.createWorker(payload);
      navigate('/manage-workers');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add worker');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <h1 className="text-2xl font-semibold text-slate-900">Add Worker</h1>
      <p className="mt-1 text-sm text-slate-500">
        New worker profiles are immediately searchable by customers.
      </p>

      <form onSubmit={handleSubmit} className="card mt-6 max-w-2xl space-y-4 p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Name</label>
            <input name="name" className="input" value={form.name} onChange={handleChange} required />
          </div>
          <div>
            <label className="label">Phone</label>
            <input name="phone" type="tel" className="input" value={form.phone} onChange={handleChange} required />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Email (optional)</label>
            <input name="email" type="email" className="input" value={form.email} onChange={handleChange} />
          </div>
          <div>
            <label className="label">Field</label>
            <select name="field" className="input capitalize" value={form.field} onChange={handleChange}>
              {FIELDS.map((f) => <option key={f} value={f} className="capitalize">{f}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="label">Experience (yrs)</label>
            <input name="experience" type="number" min="0" className="input" value={form.experience} onChange={handleChange} />
          </div>
          <div>
            <label className="label">Hourly rate (₹)</label>
            <input name="hourlyRate" type="number" min="0" className="input" value={form.hourlyRate} onChange={handleChange} required />
          </div>
          <div>
            <label className="label">Daily rate (₹)</label>
            <input name="dailyRate" type="number" min="0" className="input" value={form.dailyRate} onChange={handleChange} required />
          </div>
        </div>

        <div>
          <label className="label">Skills (comma separated)</label>
          <input
            name="skills"
            className="input"
            placeholder="e.g. pipe fitting, leak repair"
            value={form.skills}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="label">Bio</label>
          <textarea name="bio" rows="3" className="input" value={form.bio} onChange={handleChange} />
        </div>

        {error && (
          <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
        )}

        <div className="flex gap-2">
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Saving...' : 'Add Worker'}
          </button>
          <button type="button" className="btn-outline" onClick={() => navigate(-1)}>
            Cancel
          </button>
        </div>
      </form>
    </Layout>
  );
};

export default AddWorkerPage;
