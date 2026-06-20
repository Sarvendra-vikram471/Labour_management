import React, { useContext } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const linkClass = ({ isActive }) =>
    `px-3 py-1.5 rounded-md text-sm font-medium transition ${
      isActive
        ? 'bg-slate-900 text-white'
        : 'text-slate-700 hover:bg-slate-100'
    }`;

  const isContractor = user?.userType === 'contractor';

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link to="/dashboard" className="text-base font-semibold text-slate-900">
          Labour<span className="text-brand-500">Mgmt</span>
        </Link>

        <div className="flex items-center gap-1">
          {user && (
            <>
              <NavLink to="/dashboard" className={linkClass}>Dashboard</NavLink>

              {!isContractor && (
                <NavLink to="/search" className={linkClass}>Find Workers</NavLink>
              )}

              <NavLink to="/bookings" className={linkClass}>
                {isContractor ? 'Incoming Bookings' : 'My Bookings'}
              </NavLink>

              {isContractor && (
                <NavLink to="/manage-workers" className={linkClass}>My Workers</NavLink>
              )}

              <span className="ml-2 hidden text-sm text-slate-500 sm:inline">
                Hi, {user.name?.split(' ')[0]}
              </span>
              <button onClick={handleLogout} className="btn-outline ml-2">
                Logout
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
