import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { bookingAPI, userAPI } from '../services/api';
import { formatINR } from '../utils/formatters';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '' });
  const [saveMessage, setSaveMessage] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [profileRes, bookingsRes] = await Promise.all([
        userAPI.getProfile(),
        bookingAPI.getBookings(),
      ]);
      const profile = profileRes.data.data;
      setUser(profile);
      setFormData({ name: profile.name, phone: profile.phone || '' });
      setBookings(bookingsRes.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'We could not load your profile right now.');
      setUser(null);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setSaveMessage('');
      const response = await userAPI.updateProfile({ ...formData, email: user.email });
      setUser(response.data.data);
      setIsEditing(false);
      setSaveMessage('Profile updated successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save your changes.');
    }
  };

  const activeBookings = bookings.filter((item) => item.status !== 'cancelled').length;
  const totalSpent = bookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);

  if (loading) {
    return (
      <div style={{ maxWidth: 900, margin: '24px auto', padding: '24px', background: '#fff', borderRadius: 24, border: '1px solid #dbeafe' }}>
        <p style={{ margin: 0 }}>Loading your profile...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1100, margin: '24px auto', padding: '24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: 20, alignItems: 'start' }}>
        <div style={{ background: '#fff', borderRadius: 24, padding: 24, border: '1px solid #dbeafe', boxShadow: '0 18px 40px rgba(15, 23, 42, 0.08)' }}>
          <p style={{ textTransform: 'uppercase', letterSpacing: 1.2, color: '#0f172a', fontWeight: 800, marginBottom: 8 }}>Profile overview</p>
          <h2 style={{ margin: '0 0 8px' }}>Welcome back, {user?.name || 'there'}.</h2>
          <p style={{ color: '#475569', marginBottom: 18 }}>
            Manage your account details, monitor your parking activity, and continue booking with confidence.
          </p>

          {error && (
            <div style={{ background: '#fee2e2', color: '#991b1b', borderRadius: 16, padding: 14, marginBottom: 18 }}>
              <p style={{ margin: 0 }}>{error}</p>
              <button onClick={fetchData} style={{ marginTop: 12, padding: '10px 14px', borderRadius: 12, border: 'none', background: '#0f172a', color: '#fff', fontWeight: 800, cursor: 'pointer' }}>
                Retry
              </button>
            </div>
          )}

          {saveMessage && !error && (
            <div style={{ background: '#dcfce7', color: '#166534', borderRadius: 16, padding: 14, marginBottom: 18 }}>
              <p style={{ margin: 0 }}>{saveMessage}</p>
            </div>
          )}

          {isEditing ? (
            <div style={{ display: 'grid', gap: 14 }}>
              <label>
                <span style={{ display: 'block', marginBottom: 8, fontWeight: 700 }}>Name</span>
                <input type="text" name="name" value={formData.name} onChange={handleChange} style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid #cbd5e1' }} />
              </label>
              <label>
                <span style={{ display: 'block', marginBottom: 8, fontWeight: 700 }}>Phone</span>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid #cbd5e1' }} />
              </label>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button onClick={handleSave} style={{ padding: '12px 16px', borderRadius: 12, border: 'none', background: '#22c55e', color: '#03131f', fontWeight: 800, cursor: 'pointer' }}>
                  Save changes
                </button>
                <button onClick={() => setIsEditing(false)} style={{ padding: '12px 16px', borderRadius: 12, border: '1px solid #cbd5e1', background: '#fff', color: '#0f172a', fontWeight: 800, cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                <div style={{ background: '#eff6ff', borderRadius: 16, padding: 14 }}>
                  <p style={{ color: '#475569', marginBottom: 4 }}>Email</p>
                  <strong>{user?.email || 'Not available'}</strong>
                </div>
                <div style={{ background: '#f0fdf4', borderRadius: 16, padding: 14 }}>
                  <p style={{ color: '#475569', marginBottom: 4 }}>Phone</p>
                  <strong>{user?.phone || 'Not added'}</strong>
                </div>
                <div style={{ background: '#fef3c7', borderRadius: 16, padding: 14 }}>
                  <p style={{ color: '#475569', marginBottom: 4 }}>Role</p>
                  <strong>{user?.role || 'renter'}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
                <button onClick={() => setIsEditing(true)} style={{ padding: '12px 16px', borderRadius: 12, border: 'none', background: '#0f172a', color: '#fff', fontWeight: 800, cursor: 'pointer' }}>
                  Edit profile
                </button>
                <Link to="/parking-spots" style={{ textDecoration: 'none', padding: '12px 16px', borderRadius: 12, background: '#e2e8f0', color: '#0f172a', fontWeight: 800 }}>
                  Find parking
                </Link>
                <Link to="/bookings" style={{ textDecoration: 'none', padding: '12px 16px', borderRadius: 12, background: '#dbeafe', color: '#0f172a', fontWeight: 800 }}>
                  View bookings
                </Link>
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gap: 20 }}>
          <div style={{ background: 'linear-gradient(135deg, #0f172a, #1d4ed8)', color: '#fff', borderRadius: 24, padding: 24, boxShadow: '0 18px 40px rgba(15, 23, 42, 0.2)' }}>
            <p style={{ textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 8 }}>Account snapshot</p>
            <h3 style={{ margin: '0 0 14px' }}>Everything you need in one place</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 14 }}>
                <p style={{ marginBottom: 8, color: '#cbd5e1' }}>Active bookings</p>
                <strong style={{ fontSize: 24 }}>{activeBookings}</strong>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 14 }}>
                <p style={{ marginBottom: 8, color: '#cbd5e1' }}>Total spent</p>
                <strong style={{ fontSize: 24 }}>{formatINR(totalSpent)}</strong>
              </div>
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: 24, padding: 24, border: '1px solid #dbeafe' }}>
            <p style={{ textTransform: 'uppercase', letterSpacing: 1.2, color: '#0f172a', fontWeight: 800, marginBottom: 12 }}>Quick tips</p>
            <ul style={{ margin: 0, paddingLeft: 18, color: '#334155', lineHeight: 1.8 }}>
              <li>Keep your phone number updated for faster booking confirmation.</li>
              <li>Browse spots during peak hours to lock in the best locations.</li>
              <li>Cancel bookings early if your schedule changes to avoid conflicts.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
