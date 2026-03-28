import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/Header';
import api from '../lib/api';

export default function BookingsDashboard() {
  const { isLoading } = useAuth();
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [pastBookings, setPastBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    if (!isLoading) {
      fetchBookings();
    }
  }, [isLoading]);

  const fetchBookings = async () => {
    try {
      const [upcomingRes, pastRes] = await Promise.all([
        api.get('/bookings/upcoming/list'),
        api.get('/bookings/past/list')
      ]);
      setUpcomingBookings(upcomingRes.data);
      setPastBookings(pastRes.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId) => {
    if (confirm('Are you sure you want to cancel this booking?')) {
      try {
        await api.put(`/bookings/${bookingId}/cancel`);
        fetchBookings();
      } catch (error) {
        alert('Error canceling booking');
      }
    }
  };

  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading || loading) return <div className="loading">Loading...</div>;

  return (
    <div className="bookings-dashboard">
      <Header />
      
      <header className="header">
        <h1>Calendar Scheduling</h1>
        <nav>
          <a href="/">Dashboard</a>
          <a href="/bookings" className="active">Bookings</a>
        </nav>
      </header>

      <div className="container">
        <h2>My Bookings</h2>

        <div className="tabs">
          <button
            className={`tab ${activeTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => setActiveTab('upcoming')}
          >
            Upcoming ({upcomingBookings.length})
          </button>
          <button
            className={`tab ${activeTab === 'past' ? 'active' : ''}`}
            onClick={() => setActiveTab('past')}
          >
            Past ({pastBookings.length})
          </button>
        </div>

        <div className="bookings-list">
          {activeTab === 'upcoming' ? (
            upcomingBookings.length === 0 ? (
              <p className="no-data">No upcoming bookings</p>
            ) : (
              upcomingBookings.map(booking => (
                <div key={booking.id} className="booking-card">
                  <div className="booking-info">
                    <h3>{booking.event_type_title}</h3>
                    <p className="date-time">{formatDateTime(booking.booked_datetime)}</p>
                    <p className="attendee">{booking.booker_name} • {booking.booker_email}</p>
                  </div>
                  <button
                    onClick={() => handleCancel(booking.id)}
                    className="btn btn-danger"
                  >
                    Cancel
                  </button>
                </div>
              ))
            )
          ) : (
            pastBookings.length === 0 ? (
              <p className="no-data">No past bookings</p>
            ) : (
              pastBookings.map(booking => (
                <div key={booking.id} className="booking-card past">
                  <div className="booking-info">
                    <h3>{booking.event_type_title}</h3>
                    <p className="date-time">{formatDateTime(booking.booked_datetime)}</p>
                    <p className="attendee">{booking.booker_name} • {booking.booker_email}</p>
                  </div>
                  <span className="status">Completed</span>
                </div>
              ))
            )
          )}
        </div>
      </div>
    </div>
  );
}
