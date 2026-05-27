import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navigation = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={{ position: 'sticky', top: 0, zIndex: 20, background: 'rgba(8, 15, 30, 0.96)', color: '#fff', padding: '14px 24px', borderBottom: '1px solid rgba(148, 163, 184, 0.18)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
          <Link to="/" style={{ color: '#fff', textDecoration: 'none', fontWeight: 800, fontSize: 18 }}>
            🅿️ UrbanSpot
          </Link>
          {user && (
            <>
              <Link to="/parking-spots" style={{ color: '#dbeafe', textDecoration: 'none', fontWeight: 700 }}>
                Find Spots
              </Link>
              <Link to="/bookings" style={{ color: '#dbeafe', textDecoration: 'none', fontWeight: 700 }}>
                My Bookings
              </Link>
              <Link to="/profile" style={{ color: '#dbeafe', textDecoration: 'none', fontWeight: 700 }}>
                Profile
              </Link>
              {user.role === 'admin' && (
                <>
                  <Link to="/admin/create" style={{ color: '#fef3c7', textDecoration: 'none', fontWeight: 800 }}>
                    Create Admin
                  </Link>
                  <Link to="/admin/spots" style={{ color: '#fef3c7', textDecoration: 'none', fontWeight: 800 }}>
                    Create Spot
                  </Link>
                </>
              )}
            </>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          {user ? (
            <>
              <span style={{ color: '#e2e8f0' }}>Welcome, {user.name}</span>
              <button
                onClick={handleLogout}
                style={{ padding: '10px 16px', borderRadius: 999, border: 'none', background: '#f43f5e', color: '#fff', fontWeight: 800, cursor: 'pointer' }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ color: '#fff', textDecoration: 'none', fontWeight: 700 }}>
                Login
              </Link>
              <Link to="/register" style={{ color: '#22c55e', textDecoration: 'none', fontWeight: 800 }}>
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
