import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { bookingAPI } from '../services/api';
import { formatINR } from '../utils/formatters';

const statusColors = {
  pending: '#f59e0b',
  confirmed: '#22c55e',
  active: '#0ea5e9',
  completed: '#2563eb',
  cancelled: '#f43f5e',
};

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploadingId, setUploadingId] = useState(null);
  const [uploadMessage, setUploadMessage] = useState('');
  const [photoPreviews, setPhotoPreviews] = useState({});

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const currentUserId = currentUser.id || '';

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError('');
      setUploadMessage('');

      const [userBookingsResponse, ownerBookingsResponse] = await Promise.allSettled([
        bookingAPI.getBookings(),
        bookingAPI.getOwnerBookings(),
      ]);

      const userBookings = userBookingsResponse.status === 'fulfilled' ? userBookingsResponse.value.data.data || [] : [];
      const ownerBookings = ownerBookingsResponse.status === 'fulfilled' ? ownerBookingsResponse.value.data.data || [] : [];

      const mergedBookings = [...userBookings, ...ownerBookings].reduce((accumulator, booking) => {
        if (!accumulator.some((item) => item._id === booking._id)) {
          accumulator.push(booking);
        }
        return accumulator;
      }, []);

      setBookings(mergedBookings);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load your bookings right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (bookingId) => {
    try {
      await bookingAPI.cancelBooking(bookingId, { cancellationReason: 'User cancelled' });
      fetchBookings();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to cancel this booking.');
    }
  };

  const handlePhotoSelection = (bookingId, event) => {
    const selectedFiles = Array.from(event.target.files || []);

    if (selectedFiles.length === 0) {
      return;
    }

    Promise.all(
      selectedFiles.map(
        (file) =>
          new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          })
      )
    ).then((photos) => {
      setPhotoPreviews((current) => ({ ...current, [bookingId]: photos }));
    });
  };

  const handleUploadPhotos = async (bookingId) => {
    const photos = photoPreviews[bookingId] || [];

    if (!photos.length) {
      setUploadMessage('Select at least one photo to upload.');
      return;
    }

    try {
      setUploadingId(bookingId);
      await bookingAPI.uploadBookingPhotos(bookingId, { photos });
      setUploadMessage('Photos uploaded successfully and are now visible to the renter.');
      setPhotoPreviews((current) => ({ ...current, [bookingId]: [] }));
      fetchBookings();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to upload photos right now.');
    } finally {
      setUploadingId(null);
    }
  };

  return (
    <div style={{ maxWidth: 1100, margin: '24px auto', padding: '24px' }}>
      <div style={{ marginBottom: 20 }}>
        <p style={{ textTransform: 'uppercase', letterSpacing: 1.2, color: '#0f172a', fontWeight: 800, marginBottom: 8 }}>Booking dashboard</p>
        <h2 style={{ margin: '0 0 8px' }}>Manage your confirmed parking plans</h2>
        <p style={{ color: '#475569', marginBottom: 0 }}>Stay on top of upcoming bookings, cancellation status, payments, and owner-uploaded photos.</p>
      </div>

      {error && (
        <div style={{ background: '#fee2e2', color: '#991b1b', borderRadius: 16, padding: 14, marginBottom: 16 }}>
          <p style={{ margin: 0 }}>{error}</p>
        </div>
      )}

      {uploadMessage && (
        <div style={{ background: '#dcfce7', color: '#166534', borderRadius: 16, padding: 14, marginBottom: 16 }}>
          <p style={{ margin: 0 }}>{uploadMessage}</p>
        </div>
      )}

      {loading ? (
        <div style={{ background: '#fff', borderRadius: 24, padding: 24, border: '1px solid #dbeafe' }}>
          <p style={{ margin: 0 }}>Loading bookings...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: 24, padding: 28, border: '1px solid #dbeafe', boxShadow: '0 18px 40px rgba(15, 23, 42, 0.08)' }}>
          <h3 style={{ marginTop: 0 }}>No bookings yet</h3>
          <p style={{ color: '#475569', marginBottom: 18 }}>Browse available spots and reserve your next parking space in just a few clicks.</p>
          <Link to="/parking-spots" style={{ textDecoration: 'none', padding: '12px 16px', borderRadius: 12, background: '#0f172a', color: '#fff', fontWeight: 800 }}>
            Explore parking spots
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          {bookings.map((booking) => {
            const isOwnerBooking = booking.spotId?.ownerId?.toString?.() === currentUserId || booking.spotId?.ownerId === currentUserId;
            return (
              <div key={booking._id} className="hover-lift" style={{ background: '#fff', borderRadius: 24, padding: 20, border: '1px solid #dbeafe', boxShadow: '0 18px 40px rgba(15, 23, 42, 0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                  <div>
                    <p style={{ margin: 0, color: '#475569' }}>{booking.spotId?.location?.city || 'Location unavailable'}</p>
                    <h3 style={{ margin: '8px 0' }}>{booking.spotId?.location?.address || 'Parking spot'}</h3>
                    <p style={{ margin: 0, color: '#334155' }}>
                      {new Date(booking.startTime).toLocaleString()} • {booking.duration} hour{booking.duration > 1 ? 's' : ''}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <span style={{ background: `${statusColors[booking.status] || '#0f172a'}20`, color: '#0f172a', padding: '8px 12px', borderRadius: 999, fontWeight: 800, textTransform: 'capitalize' }}>
                      {booking.status}
                    </span>
                    {booking.status !== 'cancelled' && (
                      <button onClick={() => handleCancel(booking._id)} style={{ padding: '10px 14px', borderRadius: 12, border: 'none', background: '#f43f5e', color: '#fff', fontWeight: 800, cursor: 'pointer' }}>
                        Cancel
                      </button>
                    )}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginTop: 16 }}>
                  <div style={{ background: '#f8fafc', borderRadius: 16, padding: 14 }}>
                    <p style={{ marginBottom: 6, color: '#475569' }}>Vehicle</p>
                    <strong>{booking.vehicleInfo?.licensePlate || 'Not provided'}</strong>
                  </div>
                  <div style={{ background: '#f8fafc', borderRadius: 16, padding: 14 }}>
                    <p style={{ marginBottom: 6, color: '#475569' }}>Payment</p>
                    <strong>{booking.paymentStatus || 'paid'} • {booking.paymentMethod || 'UPI'}</strong>
                  </div>
                  <div style={{ background: '#f8fafc', borderRadius: 16, padding: 14 }}>
                    <p style={{ marginBottom: 6, color: '#475569' }}>Total paid</p>
                    <strong>{formatINR(booking.totalPrice)}</strong>
                  </div>
                  <div style={{ background: '#f8fafc', borderRadius: 16, padding: 14 }}>
                    <p style={{ marginBottom: 6, color: '#475569' }}>Type</p>
                    <strong>{booking.spotId?.spotType || 'N/A'}</strong>
                  </div>
                </div>

                {isOwnerBooking && (
                  <div style={{ marginTop: 16, background: '#eff6ff', borderRadius: 18, padding: 16 }}>
                    <p style={{ margin: '0 0 8px', fontWeight: 800 }}>Upload photos for this booking</p>
                    <p style={{ margin: '0 0 12px', color: '#334155' }}>Capture a fresh image from your phone and share it with the renter so they can confirm the space.</p>
                    <input type="file" accept="image/*" capture="environment" multiple onChange={(event) => handlePhotoSelection(booking._id, event)} style={{ marginBottom: 12 }} />
                    {(photoPreviews[booking._id] || []).length > 0 && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12, marginBottom: 12 }}>
                        {photoPreviews[booking._id].map((photo, index) => (
                          <img key={`${booking._id}-${index}`} src={photo} alt={`Parking view ${index + 1}`} style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 12 }} />
                        ))}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => handleUploadPhotos(booking._id)}
                      disabled={uploadingId === booking._id}
                      style={{ padding: '10px 14px', borderRadius: 12, border: 'none', background: '#0f172a', color: '#fff', fontWeight: 800, cursor: 'pointer' }}
                    >
                      {uploadingId === booking._id ? 'Uploading...' : 'Upload photos'}
                    </button>
                  </div>
                )}

                {(booking.ownerPhotos || []).length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <p style={{ marginBottom: 8, fontWeight: 800 }}>Owner photos</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
                      {booking.ownerPhotos.map((photo, index) => (
                        <img key={`${booking._id}-${index}`} src={photo} alt={`Parking view ${index + 1}`} style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 16 }} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyBookings;
