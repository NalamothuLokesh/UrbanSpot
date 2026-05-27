import React, { useState } from 'react';
import { parkingSpotAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const AdminCreateSpot = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({ address: '', city: '', zipCode: '', spotType: '', pricePerHour: '', pricePerDay: '', pricePerMonth: '', description: '', adminOnly: true });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  if (!user || user.role !== 'admin') return <div style={{ padding: 24 }}>Access denied</div>;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') setForm((f) => ({ ...f, [name]: checked }));
    else setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const payload = {
        location: { address: form.address, city: form.city, zipCode: form.zipCode },
        spotType: form.spotType,
        pricePerHour: Number(form.pricePerHour),
        pricePerDay: Number(form.pricePerDay),
        pricePerMonth: Number(form.pricePerMonth),
        description: form.description,
        adminOnly: form.adminOnly,
      };
      const res = await parkingSpotAPI.createSpot(payload);
      setMessage(res.data?.message || 'Parking spot created');
      setForm({ address: '', city: '', zipCode: '', spotType: '', pricePerHour: '', pricePerDay: '', pricePerMonth: '', description: '', adminOnly: true });
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to create spot');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: '32px auto', padding: 20 }}>
      <h2>Admin: Create Parking Spot</h2>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
        <input name="address" placeholder="Address" value={form.address} onChange={handleChange} required />
        <input name="city" placeholder="City" value={form.city} onChange={handleChange} required />
        <input name="zipCode" placeholder="Zip code" value={form.zipCode} onChange={handleChange} required />
        <input name="spotType" placeholder="Spot type" value={form.spotType} onChange={handleChange} required />
        <input name="pricePerHour" placeholder="Price per hour" value={form.pricePerHour} onChange={handleChange} required />
        <input name="pricePerDay" placeholder="Price per day" value={form.pricePerDay} onChange={handleChange} required />
        <input name="pricePerMonth" placeholder="Price per month" value={form.pricePerMonth} onChange={handleChange} required />
        <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} />
        <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input type="checkbox" name="adminOnly" checked={form.adminOnly} onChange={handleChange} />
          <span>Admin-only (hidden from owners and renters)</span>
        </label>
        <button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Spot'}</button>
      </form>
      {message && <p style={{ marginTop: 12 }}>{message}</p>}
    </div>
  );
};

export default AdminCreateSpot;
