'use client';
import { useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import AuthContext, { AuthContextType } from '../context/AuthContext';
import axios from 'axios';
import Cookies from 'js-cookie';

interface ProtectedRouteProps {
  role: string;
  children: ReactNode;
  unauthorizedPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  role,
  children,
  unauthorizedPath = '/',
}) => {
  const { user, setUser } = useContext(AuthContext) as AuthContextType;
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = Cookies.get('access_token');
        if (!token) {
          setIsAuthorized(false);
          return;
        }

        const response = await axios.get('http://localhost:8000/api/user/', {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(response.data);

        if (response.data.role === role) {
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
        }
      } catch (error) {
        console.error(error);
        setIsAuthorized(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [setUser, router, role]);

  useEffect(() => {
    if (!isLoading) {
      if (!user || !isAuthorized) {
        router.push(unauthorizedPath);
      }
    }
  }, [isLoading, user, isAuthorized, router, unauthorizedPath]);

  if (isLoading) return <div>Loading...</div>;

  return isAuthorized ? <>{children}</> : null;
};

export default ProtectedRoute;
