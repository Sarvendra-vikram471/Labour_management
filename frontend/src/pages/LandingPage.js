import React, { useContext } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Icon = ({ path, className = 'h-6 w-6' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.8}
    stroke="currentColor"
    className={className}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d={path} />
  </svg>
);

const ICONS = {
  search:
    'M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z',
  shield:
    'M12 3 4 6v6c0 5 3.5 8.5 8 9 4.5-.5 8-4 8-9V6l-8-3Zm-1.5 9.5 2 2 4-4',
  payments:
    'M2.25 8.25h19.5M3.75 6h16.5a1.5 1.5 0 0 1 1.5 1.5v9a1.5 1.5 0 0 1-1.5 1.5H3.75a1.5 1.5 0 0 1-1.5-1.5v-9A1.5 1.5 0 0 1 3.75 6Zm3 9h3',
  star:
    'M11.48 3.5 13.7 8l4.96.72-3.59 3.5.85 4.95L11.48 14.8 7.04 17.17l.85-4.95L4.3 8.72 9.26 8l2.22-4.5Z',
  users:
    'M15 19.13v-1.13a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1.13M22 19.13v-1.13a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75M12.5 7.5a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
  briefcase:
    'M3 7.5h18v11.25A1.75 1.75 0 0 1 19.25 20.5H4.75A1.75 1.75 0 0 1 3 18.75V7.5Zm5.25 0V5.25A1.75 1.75 0 0 1 10 3.5h4a1.75 1.75 0 0 1 1.75 1.75V7.5',
  bolt:
    'm13 3-7.5 11h6L10 22l8-12h-6.5L13 3Z',
  check:
    'm5 12 5 5 9-11',
};

const Feature = ({ iconKey, title, body }) => (
  <div className="card p-6">
    <div className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-brand-50 text-brand-600">
      <Icon path={ICONS[iconKey]} />
    </div>
    <h3 className="mt-4 text-base font-semibold text-slate-900">{title}</h3>
    <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{body}</p>
  </div>
);

const Step = ({ n, title, body }) => (
  <div className="relative pl-12">
    <div className="absolute left-0 top-0 flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 text-sm font-semibold text-white">
      {n}
    </div>
    <h4 className="text-base font-semibold text-slate-900">{title}</h4>
    <p className="mt-1 text-sm text-slate-600">{body}</p>
  </div>
);

const Bullet = ({ text }) => (
  <li className="flex items-start gap-2.5">
    <span className="mt-0.5 inline-flex h-5 w-5 flex-none items-center justify-center rounded-full bg-brand-50 text-brand-600">
      <Icon path={ICONS.check} className="h-3.5 w-3.5" />
    </span>
    <span className="text-sm text-slate-700">{text}</span>
  </li>
);

const LandingPage = () => {
  const { user } = useContext(AuthContext);

  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen bg-white">
      {/* Top nav */}
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link to="/" className="text-base font-semibold text-slate-900">
            Labour<span className="text-brand-500">Mgmt</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/login" className="btn-outline">Sign in</Link>
            <Link to="/register" className="btn-primary">Get started</Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-50 to-white" />
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
          <div>
            <span className="badge bg-brand-50 text-brand-700">
              For customers and contractors
            </span>
            <h1 className="mt-4 text-4xl font-semibold leading-tight text-slate-900 md:text-5xl">
              Hire skilled workers,{' '}
              <span className="text-brand-600">day by day.</span>
            </h1>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-slate-600">
              Search profiles, send a booking request, pay online. No phone-tag,
              no hunting around for someone who can come tomorrow.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/register" className="btn-primary px-5">
                Create free account
              </Link>
              <Link to="/login" className="btn-outline px-5">
                I already have an account
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-sm text-slate-600">
              <span className="inline-flex items-center gap-2">
                <Icon path={ICONS.check} className="h-4 w-4 text-brand-600" />
                Daily-rate pricing
              </span>
              <span className="inline-flex items-center gap-2">
                <Icon path={ICONS.check} className="h-4 w-4 text-brand-600" />
                Razorpay checkout
              </span>
            </div>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
              <img
                src="/photo-1.jpg"
                alt="Site supervisor coordinating with construction workers"
                className="h-[420px] w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:py-20">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold text-slate-900 md:text-4xl">
            What you can do here
          </h2>
          <p className="mt-3 text-base text-slate-600">
            Pick a worker, agree on dates, pay once. No middlemen and
            no commissions stacked on top of the daily rate.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <Feature
            iconKey="search"
            title="Search & filters"
            body="Filter by skill, daily rate, and city. Open a profile to see experience and past reviews."
          />
          <Feature
            iconKey="shield"
            title="Listed by contractors"
            body="Workers are added by contractors who manage their own teams — not random sign-ups."
          />
          <Feature
            iconKey="payments"
            title="Razorpay checkout"
            body="Card details go straight to Razorpay. We only see whether the booking is paid."
          />
          <Feature
            iconKey="star"
            title="Reviews after the job"
            body="Once a booking is marked complete, you can leave a rating and a short note."
          />
        </div>
      </section>

      {/* How it works */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold text-slate-900 md:text-4xl">
              How it works
            </h2>
            <p className="mt-3 text-base text-slate-600">
              From first search to wrapping up the job.
            </p>
          </div>

          <div className="mt-10 grid gap-8 md:grid-cols-3">
            <Step
              n="1"
              title="Find someone"
              body="Filter by skill and rate. Open a profile to read what previous customers said."
            />
            <Step
              n="2"
              title="Book the days"
              body="Pick the dates, write a short note about the work, and pay through Razorpay."
            />
            <Step
              n="3"
              title="Wrap up"
              body="Once the contractor marks the job complete, leave a review from your dashboard."
            />
          </div>
        </div>
      </section>

      {/* Two columns: customers / contractors */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:py-20">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="card p-7">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-brand-50 text-brand-600">
              <Icon path={ICONS.users} />
            </div>
            <h3 className="mt-4 text-xl font-semibold text-slate-900">
              For customers
            </h3>
            <p className="mt-1.5 text-sm text-slate-600">
              Get the right person on site when you actually need them.
            </p>
            <ul className="mt-5 space-y-3">
              <Bullet text="Search by skill, rate, and city" />
              <Bullet text="Book the days you need — pricing is shown upfront" />
              <Bullet text="Pay through Razorpay, not in cash on site" />
              <Bullet text="Leave a review once the job's done" />
            </ul>
            <Link to="/register" className="btn-primary mt-6 inline-flex">
              Hire a worker
            </Link>
          </div>

          <div className="card p-7">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-brand-50 text-brand-600">
              <Icon path={ICONS.briefcase} />
            </div>
            <h3 className="mt-4 text-xl font-semibold text-slate-900">
              For contractors
            </h3>
            <p className="mt-1.5 text-sm text-slate-600">
              Keep your workers visible and your bookings in one place.
            </p>
            <ul className="mt-5 space-y-3">
              <Bullet text="List your workers with skills and daily rates" />
              <Bullet text="Take booking requests from customers nearby" />
              <Bullet text="Mark a worker busy or available with one click" />
            </ul>
            <Link to="/register" className="btn-outline mt-6 inline-flex">
              List your workers
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-brand-600">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-4 py-12 md:flex-row md:items-center">
          <div>
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-white/15 text-white">
              <Icon path={ICONS.bolt} />
            </div>
            <h2 className="mt-3 text-2xl font-semibold text-white md:text-3xl">
              Make an account, take it for a spin.
            </h2>
            <p className="mt-1 max-w-xl text-sm text-brand-100">
              Sign-up takes a minute. Hiring or listing — same form, you
              pick the role at the top.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              to="/register"
              className="btn bg-white px-5 text-brand-700 hover:bg-brand-50"
            >
              Create account
            </Link>
            <Link
              to="/login"
              className="btn border border-white/40 px-5 text-white hover:bg-white/10"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-3 px-4 py-8 md:flex-row md:items-center">
          <div className="text-sm text-slate-500">
            <span className="font-semibold text-slate-700">
              Labour<span className="text-brand-500">Mgmt</span>
            </span>{' '}
            &copy; {new Date().getFullYear()} — All rights reserved.
          </div>
          <div className="flex gap-5 text-sm text-slate-500">
            <Link to="/login" className="hover:text-slate-800">Sign in</Link>
            <Link to="/register" className="hover:text-slate-800">Register</Link>
            <a href="mailto:support@labourmanagement.com" className="hover:text-slate-800">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
