import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/Header';
import api from '../lib/api';

export default function Dashboard() {
  const { isLoading } = useAuth();
  const [eventTypes, setEventTypes] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration_minutes: 30,
    slug: '',
    color: '#3b82f6'
  });

  useEffect(() => {
    if (!isLoading) {
      fetchDashboardData();
    }
  }, [isLoading]);

  const fetchDashboardData = async () => {
    try {
      const [eventTypesRes, bookingsRes] = await Promise.all([
        api.get('/event-types'),
        api.get('/bookings/upcoming/list')
      ]);
      setEventTypes(eventTypesRes.data);
      setBookings(bookingsRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'duration_minutes' ? parseInt(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/event-types/${editingId}`, formData);
      } else {
        await api.post('/event-types', formData);
      }
      setFormData({ title: '', description: '', duration_minutes: 30, slug: '', color: '#3b82f6' });
      setEditingId(null);
      setShowForm(false);
      fetchDashboardData();
    } catch (error) {
      alert('Error saving event type: ' + error.message);
    }
  };

  const handleEdit = (eventType) => {
    setFormData(eventType);
    setEditingId(eventType.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this event type?')) {
      try {
        await api.delete(`/event-types/${id}`);
        fetchDashboardData();
      } catch (error) {
        alert('Error deleting event type');
      }
    }
  };

  const thisWeekBookings = bookings.filter(b => {
    const bookingDate = new Date(b.booked_datetime);
    const today = new Date();
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    return bookingDate >= today && bookingDate <= weekFromNow;
  });

  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const days = [];
  const daysInMonth = getDaysInMonth(selectedDate);
  const firstDay = getFirstDayOfMonth(selectedDate);

  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  if (isLoading || loading) return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;

  return (
    <div className="modern-dashboard">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-top">
          <div className="logo">
            <div className="logo-icon">📅</div>
            <span>Cal</span>
          </div>
        </div>

        <ul className="sidebar-menu">
          <li>
            <a className="sidebar-menu-item active" href="/">
              <span className="menu-icon">📊</span>
              Dashboard
            </a>
          </li>
          <li>
            <a className="sidebar-menu-item" href="/bookings">
              <span className="menu-icon">📅</span>
              Bookings
            </a>
          </li>
          <li>
            <a className="sidebar-menu-item" href="/">
              <span className="menu-icon">⚙️</span>
              Events
            </a>
          </li>
          <li>
            <a className="sidebar-menu-item" href="/">
              <span className="menu-icon">🕐</span>
              Availability
            </a>
          </li>
          <li>
            <a className="sidebar-menu-item" href="/">
              <span className="menu-icon">⚙️</span>
              Settings
            </a>
          </li>
        </ul>

        <div className="sidebar-bottom">
          <a className="sidebar-bottom-item" href="/">
            <span className="menu-icon">❓</span>
            Help
          </a>
          <a className="sidebar-bottom-item" href="/">
            <span className="menu-icon">🚪</span>
            Logout
          </a>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="main-content">
        <Header />
        
        <div className="header-section">
          <h2 className="header-text">Manage your calendar 📅</h2>
          <p className="header-subtext">Manage your availability and bookings</p>
        </div>

        <div className="content">
          {/* STATS */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Event Types</div>
              <div className="stat-value">{eventTypes.length}</div>
              <a className="stat-action" href="/">
                View all →
              </a>
            </div>

            <div className="stat-card">
              <div className="stat-label">Bookings This Week</div>
              <div className="stat-value">{thisWeekBookings.length}</div>
              <a className="stat-action" href="/">
                View schedule →
              </a>
            </div>

            <div className="stat-card">
              <div className="stat-label">Availability</div>
              <div className="stat-value">Mon-Fri</div>
              <a className="stat-action" href="/">
                Update →
              </a>
            </div>
          </div>

          {/* RECENT BOOKINGS TABLE */}
          <div className="table-section">
            <div className="table-header">
              <span className="table-title">Recent Bookings</span>
              <div className="table-actions">
                <button className="btn btn-secondary btn-sm">
                  ↗ Export
                </button>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Attendee</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '32px' }}>
                      No bookings yet
                    </td>
                  </tr>
                ) : (
                  bookings.slice(0, 5).map(booking => (
                    <tr key={booking.id}>
                      <td style={{ fontWeight: '600' }}>{booking.event_type_title}</td>
                      <td>{new Date(booking.booked_datetime).toLocaleDateString()}</td>
                      <td>{new Date(booking.booked_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                      <td>{booking.booker_name}</td>
                      <td>
                        <span className={`status-badge status-${booking.status}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td>
                        <a className="action-link" href="/">
                          Reschedule
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* EVENT TYPES SECTION */}
          <div className="table-section">
            <div className="table-header">
              <span className="table-title">Event Types</span>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  setShowForm(!showForm);
                  setEditingId(null);
                  setFormData({ title: '', description: '', duration_minutes: 30, slug: '', color: '#3b82f6' });
                }}
              >
                + New Event
              </button>
            </div>

            {showForm && (
              <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
                <form onSubmit={handleSubmit}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>Title *</label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="e.g., One-on-One Meeting"
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontFamily: 'inherit'
                        }}
                        required
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>Slug *</label>
                      <input
                        type="text"
                        name="slug"
                        value={formData.slug}
                        onChange={handleInputChange}
                        placeholder="e.g., one-on-one"
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontFamily: 'inherit'
                        }}
                        required
                      />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <button type="submit" className="btn btn-primary">Save</button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowForm(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Slug</th>
                  <th>Duration</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {eventTypes.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '32px' }}>
                      No event types yet
                    </td>
                  </tr>
                ) : (
                  eventTypes.map(eventType => (
                    <tr key={eventType.id}>
                      <td style={{ fontWeight: '600' }}>{eventType.title}</td>
                      <td>/{eventType.slug}</td>
                      <td>{eventType.duration_minutes}m</td>
                      <td>
                        <a
                          className="action-link"
                          href={`/${eventType.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ marginRight: '16px' }}
                        >
                          Share
                        </a>
                        <button
                          className="action-link"
                          onClick={() => handleEdit(eventType)}
                          style={{ background: 'none', border: 'none', padding: 0, marginRight: '16px' }}
                        >
                          Edit
                        </button>
                        <button
                          className="action-link"
                          style={{ color: '#ef4444', background: 'none', border: 'none', padding: 0 }}
                          onClick={() => handleDelete(eventType.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      {showPanel && (
        <div className="right-panel">
          <div className="panel-header">
            <span className="panel-title">New Booking</span>
            <button className="panel-close" onClick={() => setShowPanel(false)}>✕</button>
          </div>

          <div className="panel-content">
            <div className="meeting-card">
              <div className="meeting-title">30 Min Meeting</div>
              <div className="meeting-subtitle">Professional consultation</div>
              <div className="meeting-host">
                <div className="host-avatar">👤</div>
                <div className="host-info">
                  <div className="host-name">You</div>
                  <div className="host-role">Host</div>
                </div>
              </div>
            </div>

            <div className="calendar-section">
              <div className="calendar">
                <div className="calendar-header">
                  <button className="calendar-nav-btn">←</button>
                  <span className="calendar-month">
                    {selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </span>
                  <button className="calendar-nav-btn">→</button>
                </div>
                <div className="weekdays">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="weekday">{day}</div>
                  ))}
                </div>
                <div className="days">
                  {days.map((day, i) => (
                    <button
                      key={i}
                      className={`day-btn ${day === selectedDate.getDate() ? 'selected' : ''}`}
                      disabled={!day}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="time-slots">
              <div className="time-slots-label">Available Times</div>
              <div className="time-slots-grid">
                {['10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM'].map(time => (
                  <button
                    key={time}
                    className={`time-slot-btn ${selectedTime === time ? 'selected' : ''}`}
                    onClick={() => setSelectedTime(time)}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="panel-actions">
            <button className="btn btn-secondary" onClick={() => setShowPanel(false)}>Back</button>
            <button className="btn btn-primary" disabled={!selectedTime}>Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
