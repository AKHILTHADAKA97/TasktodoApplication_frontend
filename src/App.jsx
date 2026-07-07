import React, { useEffect } from 'react';
import AppRoutes from './routes';
import { useAuthStore } from './store/authStore';
import authService from './services/authService';

function App() {
  const { setAuth, logout, setLoading, loading, token } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await authService.getMe();
        setAuth(res.user, token);
      } catch (error) {
        console.error('Session auto-login check failed:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [token, setAuth, logout, setLoading]);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50 dark:bg-[black]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600"></div>
      </div>
    );
  }

  return <AppRoutes />;
}

export default App;
