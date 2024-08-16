'use client';

import { useContext, useState, useEffect, ChangeEvent, FormEvent } from 'react';
import AuthContext, { AuthContextType } from './context/AuthContext';
import { useRouter } from 'next/navigation';

interface Credentials {
  email: string;
  password: string;
}

const HomePage: React.FC = () => {
  const [credentials, setCredentials] = useState<Credentials>({
    email: '',
    password: '',
  });
  const authContext = useContext<AuthContextType | undefined>(AuthContext);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

 useEffect(() => {
   if (authContext?.user) {
     const userRole = authContext.user.role;
     if (userRole === 'admin') {
       router.push('/admin/dashboard');
     } else if (userRole === 'teacher') {
       router.push('/teacher/dashboard');
     } else if (userRole === 'student') {
       router.push('/student/dashboard');
     }
   }
 }, [authContext?.user, router]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (authContext) {
      try {
        await authContext.login(credentials);
      } catch (error: any) {
        setError(error.response?.data?.detail || 'Login failed');
      }
    } else {
      setError('Auth context is not available');
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div>
      <h2>Login</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={credentials.email}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={credentials.password}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default HomePage;
