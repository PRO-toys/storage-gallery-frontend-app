// src/hooks/useAuth.ts
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const useAuth = (setIsAuth: (isAuthenticated: boolean) => void) => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const expiresAt = localStorage.getItem('expires_at');

    if (!token || (expiresAt && new Date(expiresAt) < new Date())) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('expires_at');
      navigate('/role/admin/Login');
      setIsAuth(false);
      return;
    }

    const timeUntilExpiration = new Date(expiresAt!).getTime() - new Date().getTime();
    const timeout = setTimeout(() => {
      localStorage.removeItem('access_token');
      localStorage.removeItem('expires_at');
      navigate('/role/admin/Login');
      setIsAuth(false);
    }, timeUntilExpiration);

    return () => clearTimeout(timeout);
  }, [navigate, setIsAuth]);
};

export default useAuth;
