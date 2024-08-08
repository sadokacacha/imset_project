'use client';
import { useContext, useEffect, useState } from 'react';
import AuthContext from '../context/AuthContext';
import axios from 'axios';
import Cookies from 'js-cookie';

const TeacherDashboard = () => {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = Cookies.get('access_token');
      const response = await axios.get(
        'http://localhost:8000/api/teacher/dashboard/',
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setData(response.data);
    };

    if (user && user.role === 'teacher') {
      fetchData();
    }
  }, [user]);

  if (!user || user.role !== 'teacher') {
    return <p>Access Denied</p>;
  }

  return <div>Welcome to the Teacher Dashboard, {user && user.username}</div>;
};

export default TeacherDashboard;
