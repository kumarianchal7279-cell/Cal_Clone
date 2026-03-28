import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import styles from '../styles/header.module.css';

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (!user) {
    return null;
  }

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <h2 className={styles.greeting}>
          Welcome, <strong>{user.name}</strong> 👋
        </h2>

        <button onClick={handleLogout} className={styles.logoutButton}>
          Sign Out
        </button>
      </div>
    </header>
  );
}
