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
  unauthorizedPath = '/login',
}) => {
  const { user, setUser } = useContext(AuthContext) as AuthContextType;
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = Cookies.get('access_token');
        if (!token) {
          router.push('/login');
          return;
        }

        const response = await axios.get('http://localhost:8000/api/user/', {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(response.data);
      } catch (error) {
        console.error(error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [setUser, router]);

  if (isLoading) return <div>Loading...</div>;

  if (!user || user.role !== role) {
    router.push(unauthorizedPath);
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
