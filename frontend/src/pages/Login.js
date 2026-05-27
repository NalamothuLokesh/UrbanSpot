import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await authAPI.login(formData);
      // update auth context (also persists to localStorage via context)
      login({ token: response.data.token, user: response.data.user });
      navigate('/parking-spots');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '440px', margin: '50px auto', padding: '28px', borderRadius: 24, border: '1px solid #dbeafe', boxShadow: '0 20px 50px rgba(15, 23, 42, 0.08)' }}>
      <h2 style={{ marginBottom: 8 }}>Welcome back</h2>
      <p style={{ color: '#475569', marginBottom: 24 }}>Sign in to browse and book parking spots in your city.</p>
      {error && <p style={{ color: '#dc2626', marginBottom: 16 }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '14px' }}>
          <label style={{ display: 'block', marginBottom: 8 }}>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid #cbd5e1' }}
          />
        </div>
        <div style={{ marginBottom: '18px' }}>
          <label style={{ display: 'block', marginBottom: 8 }}>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid #cbd5e1' }}
          />
        </div>
        <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px 16px', borderRadius: 12, cursor: 'pointer', background: '#0f172a', color: '#fff', fontWeight: 700 }}>
          {loading ? 'Signing in...' : 'Login'}
        </button>
      </form>
      <p style={{ marginTop: 16 }}>
        Don't have an account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
};

export default Login;
