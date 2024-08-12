'use client';
import { useContext, useState, useEffect } from 'react';
import AuthContext from '../context/AuthContext';
import axios from 'axios';
import Cookies from 'js-cookie';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [newUser, setNewUser] = useState({
    email: '',
    role: '',
    password: '',
    first_name: '',
    last_name: '',
    date_of_birth: '',
    id_card_or_passport: '',
    phone: '',
    picture: null,
  });

  const fetchDashboardData = async () => {
    try {
      const accessToken = Cookies.get('access_token');
      const response = await axios.get(
        'http://localhost:8000/api/admin/dashboard/',
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      setTeachers(response.data.teachers);
      setStudents(response.data.students);
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    }
  };

  const deleteUser = async (userId) => {
    try {
      const accessToken = Cookies.get('access_token');
      await axios.delete(
        `http://localhost:8000/api/admin/delete-user/${userId}/`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      fetchDashboardData(); // Refresh the data after deletion
    } catch (error) {
      console.error('Failed to delete user', error);
    }
  };

  const refreshToken = async () => {
    try {
      const response = await axios.post(
        'http://localhost:8000/api/token/refresh/',
        {
          refresh: Cookies.get('refresh_token'),
        }
      );
      Cookies.set('access_token', response.data.access);
    } catch (error) {
      console.error('Failed to refresh token', error);
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchDashboardData();
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'picture') {
      setNewUser({ ...newUser, picture: files[0] });
    } else {
      setNewUser({ ...newUser, [name]: value });
    }
  };

  const createUser = async (e) => {
    e.preventDefault();
    try {
      let accessToken = Cookies.get('access_token');

      // Attempt to refresh the token if needed
      if (!accessToken) {
        await refreshToken();
        accessToken = Cookies.get('access_token');
      }

      const formData = new FormData();
      Object.keys(newUser).forEach((key) => {
        if (newUser[key]) {
          formData.append(key, newUser[key]);
        }
      });

      await axios.post(
        'http://localhost:8000/api/admin/create-user/',
        formData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      fetchDashboardData();
      setNewUser({
        email: '',
        role: '',
        password: '',
        first_name: '',
        last_name: '',
        date_of_birth: '',
        id_card_or_passport: '',
        phone: '',
        picture: null,
      });
    } catch (error) {
      if (error.response) {
        console.error('Failed to create user', error.response.data);
        alert(
          JSON.stringify(error.response.data.errors || error.response.data)
        );
      } else {
        console.error('Failed to create user', error);
      }
    }
  };

  if (!user || user.role !== 'admin') {
    return <p>Access Denied</p>;
  }

  return (
    <div>
      Welcome to the Admin Dashboard, {user && user.first_name}{' '}
      {user && user.last_name}
      <h1>Admin Dashboard</h1>
      <h2>Teachers</h2>
      <ul>
        {teachers.map((teacher) => (
          <li key={teacher.id}>
            {teacher.first_name} {teacher.last_name} - {teacher.email}
            <button onClick={() => deleteUser(teacher.id)}>Delete</button>
          </li>
        ))}
      </ul>
      <h2>Students</h2>
      <ul>
        {students.map((student) => (
          <li key={student.id}>
            {student.first_name} {student.last_name} - {student.email}
            <button onClick={() => deleteUser(student.id)}>Delete</button>
          </li>
        ))}
      </ul>
      <h2>Add New User</h2>
      <form onSubmit={createUser}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={newUser.email}
          onChange={handleChange}
        />
        <input
          type="text"
          name="role"
          placeholder="Role (admin/teacher/student)"
          value={newUser.role}
          onChange={handleChange}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={newUser.password}
          onChange={handleChange}
        />
        <input
          type="text"
          name="first_name"
          placeholder="First Name"
          value={newUser.first_name}
          onChange={handleChange}
        />
        <input
          type="text"
          name="last_name"
          placeholder="Last Name"
          value={newUser.last_name}
          onChange={handleChange}
        />
        <input
          type="date"
          name="date_of_birth"
          value={newUser.date_of_birth}
          onChange={handleChange}
        />
        <input
          type="text"
          name="id_card_or_passport"
          placeholder="ID Card or Passport"
          value={newUser.id_card_or_passport}
          onChange={handleChange}
        />
        <input
          type="text"
          name="phone"
          placeholder="Phone"
          value={newUser.phone}
          onChange={handleChange}
        />
        <input type="file" name="picture" onChange={handleChange} />
        <button type="submit">Add User</button>
      </form>
    </div>
  );
};

export default AdminDashboard;
