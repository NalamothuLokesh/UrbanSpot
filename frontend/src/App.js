import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import ParkingSpots from './pages/ParkingSpots';
import MyBookings from './pages/MyBookings';
import Profile from './pages/Profile';
import AdminPanel from './pages/AdminPanel';
import CreateAdmin from './pages/CreateAdmin';
import AdminCreateSpot from './pages/AdminCreateSpot';
import { AuthProvider, useAuth } from './context/AuthContext';

const AppRoutes = () => {
  const { token } = useAuth();

  return (
    <Router>
      <Navigation />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/parking-spots" element={token ? <ParkingSpots /> : <Navigate to="/login" />} />
        <Route path="/bookings" element={token ? <MyBookings /> : <Navigate to="/login" />} />
        <Route path="/profile" element={token ? <Profile /> : <Navigate to="/login" />} />
        <Route path="/admin" element={token ? <AdminPanel /> : <Navigate to="/login" />} />
        <Route path="/admin/create" element={token ? <CreateAdmin /> : <Navigate to="/login" />} />
        <Route path="/admin/spots" element={token ? <AdminCreateSpot /> : <Navigate to="/login" />} />
        <Route path="/" element={token ? <Navigate to="/parking-spots" /> : <LandingPage />} />
      </Routes>
    </Router>
  );
};

const App = () => (
  <AuthProvider>
    <AppRoutes />
  </AuthProvider>
);

export default App;
