import { useState, useEffect } from 'react';
import api from '../lib/api';
import styles from '../styles/availability-manager.module.css';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAY_VALUES = [1, 2, 3, 4, 5, 6, 0]; // Sunday=0 in JS, but 0 in our DB

export default function AvailabilityManager({ eventTypeId }) {
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingDay, setEditingDay] = useState(null);
  const [formData, setFormData] = useState({
    start_time: '09:00',
    end_time: '17:00',
    timezone: 'America/New_York'
  });

  useEffect(() => {
    if (eventTypeId) {
      fetchAvailability();
    }
  }, [eventTypeId]);

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/availability/${eventTypeId}`);
      setAvailability(response.data);
    } catch (error) {
      console.error('Error fetching availability:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDayClick = (dayValue, dayName) => {
    const existing = availability.find(a => a.day_of_week === dayValue);
    if (existing) {
      setEditingDay(dayValue);
      setFormData({
        start_time: existing.start_time,
        end_time: existing.end_time,
        timezone: existing.timezone
      });
    } else {
      setEditingDay(dayValue);
      setFormData({
        start_time: '09:00',
        end_time: '17:00',
        timezone: 'America/New_York'
      });
    }
  };

  const handleSave = async () => {
    try {
      const existing = availability.find(a => a.day_of_week === editingDay);
      
      if (existing) {
        await api.put(
          `/api/availability/${existing.id}`,
          {
            start_time: `${formData.start_time}:00`,
            end_time: `${formData.end_time}:00`,
            timezone: formData.timezone
          }
        );
      } else {
        await api.post(
          `/api/availability/${eventTypeId}`,
          {
            day_of_week: editingDay,
            start_time: `${formData.start_time}:00`,
            end_time: `${formData.end_time}:00`,
            timezone: formData.timezone
          }
        );
      }
      
      setEditingDay(null);
      fetchAvailability();
    } catch (error) {
      console.error('Error saving availability:', error);
      alert('Error saving availability: ' + error.response?.data?.error);
    }
  };

  const handleDelete = async (availabilityId) => {
    if (confirm('Delete this availability slot?')) {
      try {
        await api.delete(`/api/availability/${availabilityId}`);
        fetchAvailability();
      } catch (error) {
        alert('Error deleting availability');
      }
    }
  };

  if (loading) return <div className={styles.loading}>Loading availability...</div>;

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Set Your Availability</h3>
      
      <div className={styles.weekGrid}>
        {DAYS.map((dayName, index) => {
          const dayValue = DAY_VALUES[index];
          const dayAvail = availability.find(a => a.day_of_week === dayValue || a.day_of_week === index);
          const isSelected = editingDay === dayValue || editingDay === index;
          
          return (
            <div
              key={dayName}
              className={`${styles.dayCard} ${dayAvail ? styles.active : ''} ${isSelected ? styles.selected : ''}`}
              onClick={() => handleDayClick(dayValue, dayName)}
            >
              <div className={styles.dayName}>{dayName}</div>
              {dayAvail && (
                <div className={styles.dayTime}>
                  {dayAvail.start_time} - {dayAvail.end_time}
                </div>
              )}
              {!dayAvail && <div className={styles.dayTimeEmpty}>Not set</div>}
            </div>
          );
        })}
      </div>

      {editingDay !== null && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h4>Edit {DAYS[editingDay]}</h4>
            
            <div className={styles.formGroup}>
              <label>Start Time</label>
              <input
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
              />
            </div>

            <div className={styles.formGroup}>
              <label>End Time</label>
              <input
                type="time"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Timezone</label>
              <select
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
              >
                <option value="America/New_York">Eastern</option>
                <option value="America/Chicago">Central</option>
                <option value="America/Denver">Mountain</option>
                <option value="America/Los_Angeles">Pacific</option>
                <option value="Europe/London">London</option>
                <option value="Europe/Paris">Paris</option>
                <option value="Asia/Tokyo">Tokyo</option>
                <option value="Australia/Sydney">Sydney</option>
              </select>
            </div>

            <div className={styles.actions}>
              <button className={styles.btnSave} onClick={handleSave}>
                Save
              </button>
              {availability.find(a => a.day_of_week === editingDay) && (
                <button
                  className={styles.btnDelete}
                  onClick={() => {
                    const existing = availability.find(a => a.day_of_week === editingDay);
                    if (existing) handleDelete(existing.id);
                    setEditingDay(null);
                  }}
                >
                  Delete
                </button>
              )}
              <button className={styles.btnCancel} onClick={() => setEditingDay(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
