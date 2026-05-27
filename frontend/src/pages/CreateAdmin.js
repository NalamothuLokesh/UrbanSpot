import React, { useState } from 'react';
import { userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const CreateAdmin = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  if (!user || user.role !== 'admin') return <div style={{ padding: 24 }}>Access denied</div>;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await userAPI.createAdmin(form);
      setMessage(res.data?.message || 'Admin created');
      setForm({ name: '', email: '', password: '', phone: '' });
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to create admin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: '32px auto', padding: 20 }}>
      <h2>Create Admin</h2>
      <p>Use this page to create new admin accounts.</p>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
        <input name="name" placeholder="Full name" value={form.name} onChange={handleChange} required />
        <input name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
        <input name="password" placeholder="Password" type="password" value={form.password} onChange={handleChange} required />
        <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} required />
        <button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Admin'}</button>
      </form>
      {message && <p style={{ marginTop: 12 }}>{message}</p>}
    </div>
  );
};

export default CreateAdmin;
