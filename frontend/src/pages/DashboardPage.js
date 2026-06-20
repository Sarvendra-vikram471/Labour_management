import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Layout from '../components/Layout';

const ActionCard = ({ to, title, description }) => (
  <Link
    to={to}
    className="card group p-5 transition hover:border-brand-500 hover:shadow-md"
  >
    <h3 className="text-base font-semibold text-slate-900 group-hover:text-brand-600">
      {title}
    </h3>
    <p className="mt-1 text-sm text-slate-500">{description}</p>
  </Link>
);

const DashboardPage = () => {
  const { user } = useContext(AuthContext);
  const isContractor = user?.userType === 'contractor';

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">
          Welcome, {user?.name?.split(' ')[0]}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Signed in as <span className="font-medium capitalize">{user?.userType}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {!isContractor && (
          <>
            <ActionCard
              to="/search"
              title="Find Workers"
              description="Search by skill, field, and price. Book directly."
            />
            <ActionCard
              to="/bookings"
              title="My Bookings"
              description="See booking status, payment, and history."
            />
          </>
        )}

        {isContractor && (
          <>
            <ActionCard
              to="/manage-workers"
              title="My Workers"
              description="View, edit, and manage your worker profiles."
            />
            <ActionCard
              to="/add-worker"
              title="Add Worker"
              description="Create a new worker profile customers can book."
            />
            <ActionCard
              to="/bookings"
              title="Incoming Bookings"
              description="See bookings made for your workers."
            />
          </>
        )}
      </div>
    </Layout>
  );
};

export default DashboardPage;
