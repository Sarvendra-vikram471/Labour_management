import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const PrivateRoute = ({ children, requiredRole }) => {
  const { user, token } = useContext(AuthContext);

  if (!token) {
    return <Navigate to="/login" />;
  }

  // Token exists but profile not loaded yet — wait instead of rendering with null user
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-slate-500">Loading...</p>
      </div>
    );
  }

  if (requiredRole && user.userType !== requiredRole) {
    return <Navigate to="/" />;
  }

  return children;
};

export default PrivateRoute;
