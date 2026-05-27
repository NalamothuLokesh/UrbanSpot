import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const roleMeta = {
  renter: {
    title: 'For parking seekers',
    subtitle: 'Search premium zones, compare prices, and secure reliable parking for daily commutes or short stays.',
    badge: 'Renter account',
    accent: '#dcfce7',
    actions: ['Find nearby parking', 'Compare rates', 'Manage active reservations'],
    cta: 'Create renter account',
  },
  owner: {
    title: 'For parking owners',
    subtitle: 'List and manage parking spots, upload images, and set availability and pricing.',
    badge: 'Owner account',
    accent: '#f0fdf4',
    actions: ['List parking spots', 'Upload spot images', 'Manage availability and pricing'],
    cta: 'Create owner account',
  },
};

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'renter',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const activeRole = useMemo(() => roleMeta[formData.role] || roleMeta.renter, [formData.role]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await authAPI.register(formData);
      // update auth context
      login({ token: response.data.token, user: response.data.user });
      navigate('/parking-spots');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 920, margin: '32px auto', padding: '28px' }}>
      <div style={{ marginBottom: 20 }}>
        <p style={{ color: '#0f172a', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.1, marginBottom: 8 }}>Create your UrbanSpot account</p>
        <h2 style={{ margin: '0 0 8px' }}>Choose the account that matches your parking journey</h2>
        <p style={{ color: '#475569', marginBottom: 0 }}>
          Every role gets a tailored experience so your account feels built for the way you use the platform.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 20, alignItems: 'start' }}>
        <div style={{ background: '#fff', borderRadius: 24, padding: 24, border: '1px solid #dbeafe', boxShadow: '0 22px 40px rgba(15, 23, 42, 0.08)' }}>
          <div style={{ marginBottom: 18 }}>
            <p style={{ margin: 0, fontWeight: 800, color: '#0f172a' }}>{activeRole.title}</p>
            <p style={{ margin: '8px 0 0', color: '#475569' }}>{activeRole.subtitle}</p>
          </div>

          <div style={{ display: 'grid', gap: 12, marginBottom: 18 }}>
            {Object.entries(roleMeta).map(([roleKey, details]) => {
              const isSelected = roleKey === formData.role;
              return (
                <button
                  key={roleKey}
                  type="button"
                  onClick={() => setFormData((current) => ({ ...current, role: roleKey }))}
                  style={{
                    textAlign: 'left',
                    borderRadius: 18,
                    border: isSelected ? '2px solid #0f172a' : '1px solid #cbd5e1',
                    padding: '14px 16px',
                    background: isSelected ? details.accent : '#fff',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
                    <strong style={{ textTransform: 'capitalize' }}>{roleKey}</strong>
                    <span style={{ background: '#0f172a', color: '#fff', borderRadius: 999, padding: '4px 10px', fontSize: 12, fontWeight: 800 }}>
                      {details.badge}
                    </span>
                  </div>
                  <p style={{ margin: '8px 0 0', color: '#334155' }}>{details.subtitle}</p>
                </button>
              );
            })}
          </div>

          {error && <p style={{ color: '#dc2626', marginBottom: 16 }}>{error}</p>}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gap: 14 }}>
              <label>
                <span style={{ display: 'block', marginBottom: 8, fontWeight: 700 }}>Full name</span>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid #cbd5e1' }} />
              </label>
              <label>
                <span style={{ display: 'block', marginBottom: 8, fontWeight: 700 }}>Email</span>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid #cbd5e1' }} />
              </label>
              <label>
                <span style={{ display: 'block', marginBottom: 8, fontWeight: 700 }}>Password</span>
                <input type="password" name="password" value={formData.password} onChange={handleChange} required style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid #cbd5e1' }} />
              </label>
              <label>
                <span style={{ display: 'block', marginBottom: 8, fontWeight: 700 }}>Phone</span>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid #cbd5e1' }} />
              </label>
              <div style={{ background: activeRole.accent, borderRadius: 16, padding: 14 }}>
                <p style={{ margin: '0 0 8px', fontWeight: 800 }}>What this role can do</p>
                <ul style={{ margin: 0, paddingLeft: 18, color: '#0f172a' }}>
                  {activeRole.actions.map((action) => (
                    <li key={action}>{action}</li>
                  ))}
                </ul>
              </div>
              <button type="submit" disabled={loading} style={{ marginTop: 8, padding: '13px 16px', borderRadius: 12, border: 'none', background: '#0f172a', color: '#fff', fontWeight: 800, cursor: 'pointer' }}>
                {loading ? 'Creating account...' : activeRole.cta}
              </button>
            </div>
          </form>

          <p style={{ marginTop: 16, color: '#475569' }}>
            Already have an account? <Link to="/login" style={{ color: '#0f172a', fontWeight: 800 }}>Sign in</Link>
          </p>
        </div>

        <div style={{ background: '#fff', borderRadius: 24, padding: 24, border: '1px solid #dbeafe', boxShadow: '0 22px 40px rgba(15, 23, 42, 0.08)' }}>
          <p style={{ textTransform: 'uppercase', letterSpacing: 1.2, color: '#0f172a', fontWeight: 800, marginBottom: 8 }}>Role guide</p>
          <h3 style={{ margin: '0 0 12px' }}>How to choose your account</h3>
          <ul style={{ margin: 0, paddingLeft: 18, color: '#334155', lineHeight: 1.9 }}>
            <li><strong>Renter:</strong> ideal if you want to search, compare, and manage parking reservations actively.</li>
            <li><strong>Owner:</strong> for people who manage and list parking spots, upload images, and set pricing.</li>
          </ul>
          <div style={{ marginTop: 20, background: '#f8fafc', borderRadius: 18, padding: 16 }}>
            <p style={{ margin: '0 0 8px', fontWeight: 800 }}>Need help deciding?</p>
            <p style={{ margin: 0, color: '#475569' }}>If you are booking parking for yourself or frequently searching, choose <strong>Renter</strong>. If you want to list parking, choose <strong>Owner</strong>.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
