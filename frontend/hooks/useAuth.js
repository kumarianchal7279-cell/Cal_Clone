import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    try {
      const token = localStorage.getItem('authToken');
      const userData = localStorage.getItem('user');

      if (token && userData) {
        setUser(JSON.parse(userData));
        setIsAuthed(true);
      } else {
        // Redirect to login if not authenticated
        router.push('/login');
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setIsAuthed(false);
    setUser(null);
    router.push('/login');
  };

  return { user, isAuthed, isLoading, logout };
}
