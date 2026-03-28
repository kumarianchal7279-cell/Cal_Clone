import React, { useState, useEffect } from 'react';
import styles from '../styles/settings-page.module.css';

interface UserSettings {
  email: string;
  firstName: string;
  lastName: string;
  timezone: string;
  emailNotifications: boolean;
}

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<UserSettings>({
    email: '',
    firstName: '',
    lastName: '',
    timezone: 'UTC',
    emailNotifications: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/user/settings', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to load settings');
        }

        const data = await response.json();
        setSettings(data);
      } catch (error) {
        console.error('Error loading settings:', error);
        setMessage({ type: 'error', text: 'Failed to load settings' });
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, type, value, checked } = e.target as any;
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : value,
    });
    setMessage(null);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      setMessage({ type: 'success', text: 'Settings saved successfully' });
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading settings...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Settings</h1>
        <p className={styles.subtitle}>Manage your account preferences</p>

        {message && (
          <div className={`${styles.message} ${styles[message.type]}`}>
            {message.text}
          </div>
        )}

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Profile Information</h2>
          <p className={styles.description}>Update your personal information</p>

          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={settings.email}
              disabled
              className={styles.input}
            />
            <p className={styles.hint}>Email cannot be changed</p>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="firstName" className={styles.label}>First Name</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={settings.firstName}
              onChange={handleChange}
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="lastName" className={styles.label}>Last Name</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={settings.lastName}
              onChange={handleChange}
              className={styles.input}
            />
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Preferences</h2>
          <p className={styles.description}>Customize your experience</p>

          <div className={styles.formGroup}>
            <label htmlFor="timezone" className={styles.label}>Timezone</label>
            <select
              id="timezone"
              name="timezone"
              value={settings.timezone}
              onChange={handleChange}
              className={styles.select}
            >
              <option value="UTC">UTC</option>
              <option value="EST">Eastern Time</option>
              <option value="CST">Central Time</option>
              <option value="MST">Mountain Time</option>
              <option value="PST">Pacific Time</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="emailNotifications" className={styles.label}>
              <input
                type="checkbox"
                id="emailNotifications"
                name="emailNotifications"
                checked={settings.emailNotifications}
                onChange={handleChange}
              />
              {' '}Enable email notifications
            </label>
            <p className={styles.hint}>Receive email updates for calendar events and reminders</p>
          </div>
        </div>

        <div className={styles.actions}>
          <button
            onClick={handleSave}
            disabled={saving}
            className={styles.saveBtn}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        <button onClick={handleLogout} className={styles.logoutBtn}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
