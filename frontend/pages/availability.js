import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/Header';
import AvailabilityManager from '../components/AvailabilityManager';
import api from '../lib/api';
import styles from '../styles/availability-page.module.css';

export default function AvailabilityPage() {
  const router = useRouter();
  const { isLoading } = useAuth();
  const [eventTypes, setEventTypes] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      fetchEventTypes();
    }
  }, [isLoading]);

  const fetchEventTypes = async () => {
    try {
      const response = await api.get('/event-types');
      setEventTypes(response.data);
      if (response.data.length > 0) {
        setSelectedEventId(response.data[0].id);
      }
    } catch (error) {
      console.error('Error fetching event types:', error);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || loading) return <div className={styles.loading}>Loading...</div>;

  return (
    <div className="modern-dashboard">
      <aside className="sidebar">
        <div className="sidebar-top">
          <div className="logo">
            <div className="logo-icon">📅</div>
            <span>Cal</span>
          </div>
        </div>

        <ul className="sidebar-menu">
          <li>
            <a className="sidebar-menu-item" href="/">
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
            <a className="sidebar-menu-item active" href="/availability">
              <span className="menu-icon">🕐</span>
              Availability
            </a>
          </li>
          <li>
            <a className="sidebar-menu-item" href="/settings">
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
        </div>
      </aside>

      <div className="main-content">
        <Header />

        <div className={styles.container}>
          <div className={styles.content}>
            <h1 className={styles.pageTitle}>Manage Your Availability</h1>
            <p className={styles.pageSubtitle}>
              Set your working hours to let people book meetings with you
            </p>

            {eventTypes.length === 0 ? (
              <div className={styles.empty}>
                <p>No event types yet. Create one first!</p>
                <button
                  className={styles.createBtn}
                  onClick={() => router.push('/')}
                >
                  Go to Dashboard →
                </button>
              </div>
            ) : (
              <>
                <div className={styles.selector}>
                  <label>Select Event Type:</label>
                  <select
                    value={selectedEventId || ''}
                    onChange={(e) => setSelectedEventId(e.target.value)}
                  >
                    {eventTypes.map(et => (
                      <option key={et.id} value={et.id}>
                        {et.title}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedEventId && (
                  <AvailabilityManager eventTypeId={selectedEventId} />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
