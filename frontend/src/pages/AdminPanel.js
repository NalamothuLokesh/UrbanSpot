import React, { useState } from 'react';
import { userAPI, parkingSpotAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const AdminPanel = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [spotForm, setSpotForm] = useState({ location: { address: '', city: '' }, spotType: '', pricePerHour: '', pricePerDay: '', pricePerMonth: '', description: '' });
  const [spotMessage, setSpotMessage] = useState('');
  const [spotLoading, setSpotLoading] = useState(false);

  if (!user || user.role !== 'admin') {
    return <div style={{ padding: 24 }}>Access denied</div>;
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      // Keep AdminPanel focused on admin tasks; admin creation moved to a dedicated page
      setMessage('Use the dedicated Create Admin page to add new admins.');
    } catch (err) {
      setMessage('Unexpected error');
    } finally {
      setLoading(false);
    }
  };

  const handleSpotChange = (e) => {
    const { name, value } = e.target;
    if (name === 'address' || name === 'city') {
      setSpotForm((s) => ({ ...s, location: { ...s.location, [name]: value } }));
    } else {
      setSpotForm((s) => ({ ...s, [name]: value }));
    }
  };

  const handleSpotSubmit = async (e) => {
    e.preventDefault();
    setSpotLoading(true);
    setSpotMessage('');
    try {
      const payload = {
        location: { address: spotForm.location.address, city: spotForm.location.city },
        spotType: spotForm.spotType,
        pricePerHour: Number(spotForm.pricePerHour),
        pricePerDay: Number(spotForm.pricePerDay),
        pricePerMonth: Number(spotForm.pricePerMonth),
        description: spotForm.description,
      };
      const res = await parkingSpotAPI.createSpot(payload);
      setSpotMessage(res.data?.message || 'Parking spot created');
      setSpotForm({ location: { address: '', city: '' }, spotType: '', pricePerHour: '', pricePerDay: '', pricePerMonth: '', description: '' });
    } catch (err) {
      setSpotMessage(err.response?.data?.message || 'Failed to create spot');
    } finally {
      setSpotLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: '32px auto', padding: 20 }}>
      <h2>Admin Panel</h2>
      <p>Welcome, <strong>{user.name}</strong>. Use the dedicated admin pages to manage accounts and monitor activity.</p>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
        <button type="submit">Where to create admins?</button>
      </form>
      {message && <p style={{ marginTop: 12 }}>{message}</p>}
    </div>
  );
};

export default AdminPanel;
