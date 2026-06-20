import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import SearchWorkersPage from './pages/SearchWorkersPage';
import WorkerDetailPage from './pages/WorkerDetailPage';
import BookingPage from './pages/BookingPage';
import MyBookingsPage from './pages/MyBookingsPage';
import ManageWorkersPage from './pages/ManageWorkersPage';
import AddWorkerPage from './pages/AddWorkerPage';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
          <Route path="/search" element={<PrivateRoute><SearchWorkersPage /></PrivateRoute>} />
          <Route path="/workers/:id" element={<PrivateRoute><WorkerDetailPage /></PrivateRoute>} />
          <Route path="/book/:workerId" element={<PrivateRoute><BookingPage /></PrivateRoute>} />
          <Route path="/bookings" element={<PrivateRoute><MyBookingsPage /></PrivateRoute>} />
          <Route path="/manage-workers" element={<PrivateRoute><ManageWorkersPage /></PrivateRoute>} />
          <Route path="/add-worker" element={<PrivateRoute><AddWorkerPage /></PrivateRoute>} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
