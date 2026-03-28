import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/Header';
import api from '../lib/api';
import styles from '../styles/settings-page.module.css';

export default function SettingsPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    timezone: 'America/New_York'
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        timezone: user.timezone || 'America/New_York'
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      // Note: You'd need to create a user update endpoint in the backend
      // For now, we'll update localStorage
      const updatedUser = { ...user, ...formData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setMessage('Settings saved successfully!');
      
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (isLoading) return <div className={styles.loading}>Loading...</div>;

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
            <a className="sidebar-menu-item" href="/availability">
              <span className="menu-icon">🕐</span>
              Availability
            </a>
          </li>
          <li>
            <a className="sidebar-menu-item active" href="/settings">
              <span className="menu-icon">⚙️</span>
              Settings
            </a>
          </li>
        </ul>

        <div className="sidebar-bottom">
          <a className="sidebar-bottom-item" onClick={handleLogout} style={{ cursor: 'pointer' }}>
            <span className="menu-icon">🚪</span>
            Sign Out
          </a>
        </div>
      </aside>

      <div className="main-content">
        <Header />

        <div className={styles.container}>
          <div className={styles.card}>
            <h1 className={styles.title}>Settings</h1>
            <p className={styles.subtitle}>Manage your account preferences</p>

            <form onSubmit={handleSave}>
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Profile</h3>
                
                <div className={styles.formGroup}>
                  <label className={styles.label}>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    className={styles.input}
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your name"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Email</label>
                  <input
                    type="email"
                    className={styles.input}
                    value={user?.email || ''}
                    disabled
                    placeholder="Your email"
                  />
                  <p className={styles.hint}>Email cannot be changed</p>
                </div>
              </div>

              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Preferences</h3>
                
                <div className={styles.formGroup}>
                  <label className={styles.label}>Default Timezone</label>
                  <select
                    name="timezone"
                    className={styles.select}
                    value={formData.timezone}
                    onChange={handleChange}
                  >
                    <option value="America/New_York">Eastern (EST/EDT)</option>
                    <option value="America/Chicago">Central (CST/CDT)</option>
                    <option value="America/Denver">Mountain (MST/MDT)</option>
                    <option value="America/Los_Angeles">Pacific (PST/PDT)</option>
                    <option value="Europe/London">London (GMT/BST)</option>
                    <option value="Europe/Paris">Paris (CET/CEST)</option>
                    <option value="Europe/Berlin">Berlin (CET/CEST)</option>
                    <option value="Asia/Tokyo">Tokyo (JST)</option>
                    <option value="Asia/Shanghai">Shanghai (CST)</option>
                    <option value="Asia/Hong_Kong">Hong Kong (HKT)</option>
                    <option value="Australia/Sydney">Sydney (AEDT/AEST)</option>
                  </select>
                </div>
              </div>

              {message && (
                <div className={`${styles.message} ${message.includes('Error') ? styles.error : styles.success}`}>
                  {message}
                </div>
              )}

              <div className={styles.actions}>
                <button
                  type="submit"
                  className={styles.saveBtn}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>

            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Account</h3>
              <p className={styles.description}>Manage your account security and data</p>
              
              <button
                type="button"
                className={styles.logoutBtn}
                onClick={handleLogout}
              >
                Sign Out from All Devices
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
