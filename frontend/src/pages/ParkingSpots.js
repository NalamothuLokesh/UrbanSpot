import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingAPI, parkingSpotAPI } from '../services/api';
import { formatINR } from '../utils/formatters';

const ParkingSpotsList = () => {
  const [spots, setSpots] = useState([]);
  const [filters, setFilters] = useState({ city: '', spotType: '', priceMax: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    startTime: '',
    duration: 1,
    vehicleType: 'Car',
    licensePlate: '',
    color: '',
    specialRequests: '',
    paymentMethod: 'Card',
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingMessage, setBookingMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchSpots();

    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get('payment');
    const sessionId = params.get('session_id');

    if (!paymentStatus || !sessionId) {
      return;
    }

    const handlePaymentRedirect = async () => {
      if (paymentStatus === 'success') {
        try {
          const response = await bookingAPI.confirmCheckoutSession(sessionId);
          setBookingMessage(`Payment successful! ${formatINR(response.data.data.totalPrice)} booking confirmed.`);
        } catch (error) {
          setBookingMessage(error.response?.data?.message || 'Payment was completed but the booking could not be confirmed automatically. Please check your bookings page.');
        }
      }

      if (paymentStatus === 'cancelled') {
        setBookingMessage('Payment was cancelled. No booking was created.');
      }

      window.history.replaceState({}, '', '/parking-spots');
      fetchSpots(filters);
    };

    handlePaymentRedirect();
  }, [filters]);

  const formatDateTimeLocal = (date) => {
    const pad = (value) => String(value).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const buildDefaultStartTime = () => {
    const now = new Date();
    now.setMinutes(Math.ceil(now.getMinutes() / 15) * 15, 0, 0);
    return formatDateTimeLocal(now);
  };

  const fetchSpots = async (searchFilters = {}) => {
    setLoading(true);
    setMessage('');
    try {
      const response = await parkingSpotAPI.getAllSpots(searchFilters);
      if (response.data.data.length === 0) {
        setMessage('No spots are available right now. Loading demo entries...');
        await parkingSpotAPI.seedDemoData();
        const seededResponse = await parkingSpotAPI.getAllSpots(searchFilters);
        setSpots(seededResponse.data.data);
        return;
      }
      setSpots(response.data.data);
    } catch (error) {
      console.error('Failed to fetch spots:', error);
      setMessage('We could not load spots. Please try again in a moment.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchSpots(filters);
  };

  const openBookingModal = (spot) => {
    if (!localStorage.getItem('token')) {
      navigate('/login');
      return;
    }

    setSelectedSpot(spot);
    setBookingMessage('');
    setBookingForm({
      startTime: buildDefaultStartTime(),
      duration: 1,
      vehicleType: 'Car',
      licensePlate: '',
      color: '',
      specialRequests: '',
      paymentMethod: 'Card',
    });
  };

  const closeBookingModal = () => {
    setSelectedSpot(null);
    setBookingMessage('');
  };

  const handleBookingChange = (e) => {
    const { name, value } = e.target;
    setBookingForm((current) => ({ ...current, [name]: value }));
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();

    if (!selectedSpot) {
      return;
    }

    setBookingLoading(true);
    setBookingMessage('');

    try {
      const start = new Date(bookingForm.startTime);
      const end = new Date(start);
      end.setHours(end.getHours() + Number(bookingForm.duration));

      const response = await bookingAPI.createCheckoutSession({
        spotId: selectedSpot._id,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        vehicleInfo: {
          licensePlate: bookingForm.licensePlate,
          vehicleType: bookingForm.vehicleType,
          color: bookingForm.color,
        },
        specialRequests: bookingForm.specialRequests,
        paymentMethod: bookingForm.paymentMethod,
      });

      if (response.data.url) {
        window.location.href = response.data.url;
        return;
      }

      // Stripe disabled fallback: backend returns booking data directly
      if (response.data.data) {
        setBookingMessage(`Booking confirmed: ${formatINR(response.data.data.totalPrice)}`);
        closeBookingModal();
        fetchSpots(filters);
        return;
      }

      setBookingMessage('Checkout session could not be created. Please try again.');
    } catch (error) {
      setBookingMessage(error.response?.data?.message || 'Unable to start payment. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  const totalPrice = selectedSpot ? Number(selectedSpot.pricePerHour) * Number(bookingForm.duration) : 0;

  return (
    <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 28, marginBottom: 8 }}>Available Parking Spots</h2>
        <p style={{ color: '#475569' }}>Explore nearby parking options and choose the right spot for your schedule.</p>
      </div>

      {message && <p style={{ color: '#0f172a', marginBottom: 16 }}>{message}</p>}
      {bookingMessage && <p style={{ color: '#0f172a', marginBottom: 16 }}>{bookingMessage}</p>}

      <form onSubmit={handleSearch} style={{ marginBottom: '24px', background: '#fff', padding: 16, borderRadius: 18, border: '1px solid #dbeafe' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <input
            type="text"
            name="city"
            placeholder="City"
            value={filters.city}
            onChange={handleFilterChange}
            style={{ padding: '12px 14px', borderRadius: 12, border: '1px solid #cbd5e1', minWidth: 180, flex: 1 }}
          />
          <select
            name="spotType"
            value={filters.spotType}
            onChange={handleFilterChange}
            style={{ padding: '12px 14px', borderRadius: 12, border: '1px solid #cbd5e1', minWidth: 170 }}
          >
            <option value="">All Types</option>
            <option value="covered">Covered</option>
            <option value="open">Open</option>
            <option value="garage">Garage</option>
          </select>
          <input
            type="number"
            name="priceMax"
            placeholder="Max Price"
            value={filters.priceMax}
            onChange={handleFilterChange}
            style={{ padding: '12px 14px', borderRadius: 12, border: '1px solid #cbd5e1', minWidth: 150 }}
          />
          <button type="submit" style={{ padding: '12px 18px', borderRadius: 12, cursor: 'pointer', background: '#0f172a', color: '#fff', fontWeight: 700 }}>
            Search
          </button>
        </div>
      </form>

      {loading ? (
        <p>Loading parking spots...</p>
      ) : (
        <div>
          {spots.length === 0 ? (
            <p>No parking spots found. Try adjusting your filters.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {spots.map((spot) => (
                <div
                  key={spot._id}
                  className="hover-lift"
                  style={{ border: '1px solid #dbeafe', background: '#fff', padding: '18px', borderRadius: 20, boxShadow: '0 18px 40px rgba(15, 23, 42, 0.08)' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 12 }}>
                    <span style={{ background: '#dbeafe', color: '#0f172a', padding: '4px 10px', borderRadius: 999, fontWeight: 700 }}>{spot.spotType}</span>
                    <span style={{ color: '#0f172a', fontWeight: 700 }}>{spot.rating || 0} ⭐</span>
                  </div>
                  <h3 style={{ fontSize: 20, marginBottom: 8 }}>{spot.location.address}</h3>
                  <p style={{ color: '#475569', marginBottom: 8 }}>{spot.location.city} • {spot.location.zipCode}</p>
                  <p style={{ marginBottom: 12, lineHeight: 1.6 }}>{spot.description || 'Reliable parking close to your destination.'}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div>
                      <p style={{ marginBottom: 2, color: '#64748b' }}>Hourly</p>
                      <strong>{formatINR(spot.pricePerHour)}</strong>
                    </div>
                    <div>
                      <p style={{ marginBottom: 2, color: '#64748b' }}>Daily</p>
                      <strong>{formatINR(spot.pricePerDay)}</strong>
                    </div>
                    <div>
                      <p style={{ marginBottom: 2, color: '#64748b' }}>Monthly</p>
                      <strong>{formatINR(spot.pricePerMonth)}</strong>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => openBookingModal(spot)}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: 12, background: '#22c55e', color: '#03131f', fontWeight: 800, border: 'none', cursor: 'pointer' }}
                  >
                    Book this spot
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedSpot && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, zIndex: 20 }}>
          <div style={{ background: '#fff', borderRadius: 24, width: '100%', maxWidth: 760, padding: 24, border: '1px solid #dbeafe', boxShadow: '0 24px 80px rgba(15, 23, 42, 0.22)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'start', marginBottom: 16 }}>
              <div>
                <p style={{ margin: 0, color: '#0f172a', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.1 }}>Checkout</p>
                <h3 style={{ margin: '8px 0 4px' }}>{selectedSpot.location.address}</h3>
                <p style={{ margin: 0, color: '#475569' }}>{selectedSpot.location.city} • {selectedSpot.spotType}</p>
              </div>
              <button type="button" onClick={closeBookingModal} style={{ border: 'none', background: '#e2e8f0', borderRadius: 999, width: 36, height: 36, cursor: 'pointer', fontSize: 18 }}>
                ×
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
              <div style={{ background: '#f8fafc', borderRadius: 18, padding: 16 }}>
                <p style={{ margin: 0, color: '#475569' }}>Hourly rate</p>
                <strong style={{ fontSize: 24 }}>{formatINR(selectedSpot.pricePerHour)}</strong>
              </div>
              <div style={{ background: '#f8fafc', borderRadius: 18, padding: 16 }}>
                <p style={{ margin: 0, color: '#475569' }}>Estimated total</p>
                <strong style={{ fontSize: 24 }}>{formatINR(totalPrice)}</strong>
              </div>
            </div>

            <form onSubmit={handleBookingSubmit} style={{ marginTop: 18, display: 'grid', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                <label>
                  <span style={{ display: 'block', marginBottom: 8, fontWeight: 700 }}>Start time</span>
                  <input type="datetime-local" name="startTime" value={bookingForm.startTime} onChange={handleBookingChange} required style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid #cbd5e1' }} />
                </label>
                <label>
                  <span style={{ display: 'block', marginBottom: 8, fontWeight: 700 }}>Duration (hours)</span>
                  <select name="duration" value={bookingForm.duration} onChange={handleBookingChange} style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid #cbd5e1' }}>
                    {[1, 2, 3, 4, 6, 8, 12].map((duration) => (
                      <option key={duration} value={duration}>{duration} hour{duration > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                <label>
                  <span style={{ display: 'block', marginBottom: 8, fontWeight: 700 }}>Vehicle type</span>
                  <input type="text" name="vehicleType" value={bookingForm.vehicleType} onChange={handleBookingChange} placeholder="Car, Bike, SUV" style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid #cbd5e1' }} />
                </label>
                <label>
                  <span style={{ display: 'block', marginBottom: 8, fontWeight: 700 }}>License plate</span>
                  <input type="text" name="licensePlate" value={bookingForm.licensePlate} onChange={handleBookingChange} required placeholder="e.g. KA-01-AB-1234" style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid #cbd5e1' }} />
                </label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                <label>
                  <span style={{ display: 'block', marginBottom: 8, fontWeight: 700 }}>Color</span>
                  <input type="text" name="color" value={bookingForm.color} onChange={handleBookingChange} placeholder="White" style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid #cbd5e1' }} />
                </label>
                <label>
                  <span style={{ display: 'block', marginBottom: 8, fontWeight: 700 }}>Payment method</span>
                  <select name="paymentMethod" value={bookingForm.paymentMethod} onChange={handleBookingChange} style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid #cbd5e1' }}>
                    <option value="UPI">UPI</option>
                    <option value="Card">Card</option>
                    <option value="Wallet">Wallet</option>
                    <option value="Cash">Cash</option>
                  </select>
                </label>
              </div>

              <label>
                <span style={{ display: 'block', marginBottom: 8, fontWeight: 700 }}>Special requests</span>
                <textarea name="specialRequests" value={bookingForm.specialRequests} onChange={handleBookingChange} rows={4} placeholder="Add any instructions for the owner or renter" style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid #cbd5e1', resize: 'vertical' }} />
              </label>

              <div style={{ background: '#f0fdf4', borderRadius: 16, padding: 14 }}>
                <p style={{ margin: '0 0 8px', fontWeight: 800 }}>Secure checkout</p>
                <p style={{ margin: 0, color: '#166534' }}>You’ll be redirected to Stripe to complete your secure payment, and your booking will be confirmed automatically after payment succeeds.</p>
              </div>

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button type="submit" disabled={bookingLoading} style={{ padding: '12px 18px', borderRadius: 12, border: 'none', background: '#0f172a', color: '#fff', fontWeight: 800, cursor: 'pointer' }}>
                  {bookingLoading ? 'Redirecting to Stripe…' : `Pay ${formatINR(totalPrice)}`}
                </button>
                <button type="button" onClick={closeBookingModal} style={{ padding: '12px 18px', borderRadius: 12, border: '1px solid #cbd5e1', background: '#fff', color: '#0f172a', fontWeight: 800, cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParkingSpotsList;
