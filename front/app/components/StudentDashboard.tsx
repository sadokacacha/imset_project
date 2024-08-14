'use client';
import { useContext, useEffect, useState } from 'react';
import AuthContext, { AuthContextType } from '../context/AuthContext';
import axios from 'axios';
import Cookies from 'js-cookie';

interface DashboardData {
  // Define the structure of your dashboard data if needed
}

const StudentDashboard: React.FC = () => {
  const { user } = useContext(AuthContext) as AuthContextType;
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = Cookies.get('access_token');
      const response = await axios.get(
        'http://localhost:8000/api/student/dashboard/',
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setData(response.data);
    };

    if (user && user.role === 'student') {
      fetchData();
    }
  }, [user]);

  if (!user || user.role !== 'student') {
    return <p>Access Denied</p>;
  }

  return (
    <div>
      Welcome to the Student Dashboard,{' '}
      {user?.first_name + ' ' + user?.last_name}
    </div>
  );
};

export default StudentDashboard;
