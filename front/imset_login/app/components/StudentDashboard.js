'use client';
import { useContext, useEffect, useState } from 'react';
import AuthContext from '../context/AuthContext';
import axios from 'axios';
import Cookies from 'js-cookie';

const StudentDashboard = () => {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState(null);

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

  return <div>Welcome to the Student Dashboard, {user && user.username}</div>;
};

export default StudentDashboard;
