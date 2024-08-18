'use client';
import { createContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { AxiosError } from 'axios';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

// Define the User and AuthContextType interfaces
export interface User {
  id: number;
  role: string;
  first_name: string;
  last_name: string;
  email: string;
  classes_name?: number[];
  class_name?: number;
}

export interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => void;
}

// Create the AuthContext
const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// AuthProvider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  // Define the login function
  const login = async (credentials: { email: string; password: string }) => {
    try {
      const response = await axios.post(
        'http://localhost:8000/api/token/',
        credentials
      );
      const { access } = response.data;
      Cookies.set('access_token', access);

      const userResponse = await axios.get<User>(
        'http://localhost:8000/api/user/',
        {
          headers: { Authorization: `Bearer ${access}` },
        }
      );
      setUser(userResponse.data);

      // Redirect based on role
      const userRole = userResponse.data.role;
      if (userRole === 'admin') {
        router.push('/admin/dashboard');
      } else if (userRole === 'teacher') {
        router.push('/teacher/dashboard');
      } else if (userRole === 'student') {
        router.push('/student/dashboard');
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error('Login failed', error.response?.data);
      } else {
        console.error('An unexpected error occurred', error);
      }
      throw error;
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      const token = Cookies.get('access_token');
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get<User>(
          'http://localhost:8000/api/user/',
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user:', error);
        Cookies.remove('access_token');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const logout = () => {
    Cookies.remove('access_token');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, setUser, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
