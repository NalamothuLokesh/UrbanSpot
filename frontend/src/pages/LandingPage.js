import React from 'react';
import { Link } from 'react-router-dom';

const features = [
  {
    title: 'Find a spot fast',
    description: 'Search by city, price, and parking type to discover available spaces near your home or office.',
  },
  {
    title: 'Book in minutes',
    description: 'Reserve a spot for the hour, day, or month with a simple booking flow designed for busy city users.',
  },
  {
    title: 'Help owners earn more',
    description: 'Apartment owners can monetize unused spaces and keep their parking inventory updated in real time.',
  },
];

const stats = [
  { value: '12k+', label: 'spots listed' },
  { value: '4.9/5', label: 'average rating' },
  { value: '30%', label: 'more parking revenue' },
];

const LandingPage = () => {
  return (
    <div style={{ minHeight: 'calc(100vh - 72px)', background: 'linear-gradient(180deg, #07111f 0%, #0e1f37 55%, #f8fbff 55%)', color: '#f8fbff' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 24px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 32, alignItems: 'center' }}>
          <div>
            <p style={{ color: '#8bd3ff', fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 12 }}>
              UrbanSpot parking rental
            </p>
            <h1 style={{ fontSize: 'clamp(2.4rem, 3.8vw, 3.4rem)', lineHeight: 1.05, marginBottom: 18 }}>
              Rent unused parking spaces with confidence.
            </h1>
            <p style={{ fontSize: 18, lineHeight: 1.7, color: '#dbeafe', marginBottom: 28 }}>
              UrbanSpot helps apartment owners turn idle parking into reliable income and helps renters discover convenient spaces nearby.
            </p>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <Link to="/register" style={{ background: '#22c55e', color: '#05121f', padding: '14px 20px', borderRadius: 999, textDecoration: 'none', fontWeight: 800 }}>
                Start as a renter
              </Link>
              <Link to="/login" style={{ border: '1px solid rgba(255,255,255,0.2)', color: '#f8fbff', padding: '14px 20px', borderRadius: 999, textDecoration: 'none', fontWeight: 800 }}>
                Sign in to your account
              </Link>
            </div>
          </div>

          <div style={{ background: 'rgba(7, 17, 31, 0.75)', borderRadius: 24, padding: 24, border: '1px solid rgba(139, 211, 255, 0.22)', boxShadow: '0 25px 80px rgba(7, 17, 31, 0.3)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
              {stats.map((item) => (
                <div key={item.label} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 18, padding: 14, textAlign: 'center' }}>
                  <div style={{ fontSize: 24, fontWeight: 800 }}>{item.value}</div>
                  <div style={{ fontSize: 12, color: '#cbd5e1' }}>{item.label}</div>
                </div>
              ))}
            </div>
            <div style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.2), rgba(56,189,248,0.15))', borderRadius: 20, padding: 20 }}>
              <p style={{ fontSize: 14, textTransform: 'uppercase', color: '#93c5fd', letterSpacing: 1.2, marginBottom: 10 }}>Live demo</p>
              <h2 style={{ marginBottom: 12 }}>A clear experience for owners and renters</h2>
              <ul style={{ paddingLeft: 18, color: '#e2e8f0', lineHeight: 1.8 }}>
                <li>Browse secure parking spots in seconds</li>
                <li>Manage bookings, cancellations, and profiles</li>
                <li>Keep your parking availability updated easily</li>
              </ul>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 52, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18 }}>
          {features.map((feature) => (
            <div key={feature.title} className="hover-lift" style={{ background: '#ffffff', color: '#0f172a', borderRadius: 22, padding: 24, boxShadow: '0 18px 40px rgba(15, 23, 42, 0.08)' }}>
              <h3 style={{ marginBottom: 10 }}>{feature.title}</h3>
              <p style={{ lineHeight: 1.7, color: '#334155' }}>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
