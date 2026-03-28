import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import api from '../lib/api';

export default function PublicBooking() {
  const router = useRouter();
  const { slug } = router.query;
  const [eventType, setEventType] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [step, setStep] = useState(1); // 1: date, 2: time, 3: details, 4: confirmation
  const [loading, setLoading] = useState(true);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  useEffect(() => {
    if (slug) {
      fetchEventType();
    }
  }, [slug]);

  useEffect(() => {
    if (selectedDate && eventType) {
      fetchAvailableSlots();
    }
  }, [selectedDate, eventType]);

  const fetchEventType = async () => {
    try {
      const response = await api.get(`/public/event/${slug}`);
      setEventType(response.data);
    } catch (error) {
      console.error('Error fetching event type:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      const response = await api.get(`/public/slots/${eventType.id}/${formattedDate}`);
      setAvailableSlots(response.data.slots);
    } catch (error) {
      console.error('Error fetching available slots:', error);
    }
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedTime(null);
    setStep(2);
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    setStep(3);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    try {
      const booked_date = selectedDate.toISOString().split('T')[0];
      const response = await api.post('/public/booking', {
        event_type_id: eventType.id,
        booker_name: formData.name,
        booker_email: formData.email,
        booked_date,
        booked_time: selectedTime
      });
      setConfirmedBooking(response.data);
      setStep(4);
    } catch (error) {
      alert(error.response?.data?.error || 'Error creating booking');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!eventType) return <div className="error">Event type not found</div>;

  return (
    <div className="public-booking">
      <div className="booking-container">
        <div className="booking-header">
          <h1>{eventType.title}</h1>
          <p className="duration">{eventType.duration_minutes} minutes</p>
          <p className="description">{eventType.description}</p>
        </div>

        {step === 1 && (
          <div className="booking-step">
            <h2>Select a Date</h2>
            <div className="calendar-container">
              <SimpleCalendar onDateSelect={handleDateSelect} availabilityDays={getAvailableDays(eventType.availability)} />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="booking-step">
            <h2>Select a Time</h2>
            <p className="selected-date">{selectedDate.toDateString()}</p>
            {availableSlots.length === 0 ? (
              <p className="no-slots">No available slots for this date</p>
            ) : (
              <div className="time-slots">
                {availableSlots.map(slot => (
                  <button
                    key={slot}
                    onClick={() => handleTimeSelect(slot)}
                    className="time-slot"
                  >
                    {formatTime(slot)}
                  </button>
                ))}
              </div>
            )}
            <button onClick={() => setStep(1)} className="btn btn-secondary">Back</button>
          </div>
        )}

        {step === 3 && (
          <div className="booking-step">
            <h2>Your Details</h2>
            <form onSubmit={handleBooking}>
              <div className="form-group">
                <label htmlFor="name">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Your name"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your@email.com"
                  required
                />
              </div>
              <div className="booking-summary">
                <p><strong>Date:</strong> {selectedDate.toDateString()}</p>
                <p><strong>Time:</strong> {formatTime(selectedTime)}</p>
                <p><strong>Duration:</strong> {eventType.duration_minutes} minutes</p>
              </div>
              <button type="submit" className="btn btn-primary">Confirm Booking</button>
              <button type="button" onClick={() => setStep(2)} className="btn btn-secondary">Back</button>
            </form>
          </div>
        )}

        {step === 4 && (
          <div className="booking-step confirmation">
            <h2>Booking Confirmed!</h2>
            <div className="confirmation-details">
              <p className="confirmation-icon">✓</p>
              <p className="event-title">{eventType.title}</p>
              <p className="detail">{confirmedBooking.booker_name}</p>
              <p className="detail">{confirmedBooking.booker_email}</p>
              <p className="datetime">
                {new Date(`${confirmedBooking.booked_date} ${confirmedBooking.booked_time}`).toLocaleString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
              <p className="duration">{eventType.duration_minutes} minute meeting</p>
            </div>
            <a href="/" className="btn btn-primary">Back to Home</a>
          </div>
        )}
      </div>
    </div>
  );
}

function SimpleCalendar({ onDateSelect, availabilityDays }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isDateAvailable = (day) => {
    const testDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dayOfWeek = testDate.getDay();
    return availabilityDays.includes(dayOfWeek) && testDate >= new Date(new Date().setHours(0, 0, 0, 0));
  };

  const days = [];
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);

  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  return (
    <div className="calendar">
      <div className="calendar-header">
        <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}>←</button>
        <span>{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
        <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}>→</button>
      </div>
      <div className="weekdays">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day}>{day}</div>)}
      </div>
      <div className="days">
        {days.map((day, i) => (
          <div key={i}>
            {day && (
              <button
                onClick={() => onDateSelect(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
                disabled={!isDateAvailable(day)}
                className={isDateAvailable(day) ? 'available' : ''}
              >
                {day}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function getAvailableDays(availability) {
  return availability.map(a => a.day_of_week);
}

function formatTime(time) {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${period}`;
}
