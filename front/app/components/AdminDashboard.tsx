'use client';

import { useContext, useState, useEffect, ChangeEvent, FormEvent } from 'react';
import AuthContext, { AuthContextType, User } from '../context/AuthContext';
import axios from 'axios';
import Cookies from 'js-cookie';

interface ClassName {
  id: number;
  name: string;
}

interface NewUser {
  email: string;
  role: string;
  password: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  id_card_or_passport: string;
  phone: string;
  picture: File | null;
  classes_name: number[]; // For teachers, array of class IDs
  class_name: number | ''; // For students, a single class ID
}

const AdminDashboard: React.FC = () => {
  const { user } = useContext(AuthContext) as AuthContextType;
  const [teachers, setTeachers] = useState<User[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [classes, setClasses] = useState<ClassName[]>([]); // Fetch classes
  const [newUser, setNewUser] = useState<NewUser>({
    email: '',
    role: '',
    password: '',
    first_name: '',
    last_name: '',
    date_of_birth: '',
    id_card_or_passport: '',
    phone: '',
    picture: null,
    classes_name: [],
    class_name: '',
  });

  const fetchDashboardData = async () => {
    try {
      const accessToken = Cookies.get('access_token');
      const [dashboardResponse, classesResponse] = await Promise.all([
        axios.get('http://localhost:8000/api/admin/dashboard/', {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
        axios.get('http://localhost:8000/api/classes/', {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      ]);

      setTeachers(dashboardResponse.data.teachers || []);
      setStudents(dashboardResponse.data.students || []);
      setClasses(classesResponse.data || []); // Store classes data
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    }
  };

  // Function to map class IDs to class names
  const getClassNamesByIds = (ids: number[]): string[] => {
    return ids
      .map((id) => classes.find((cls) => cls.id === id)?.name)
      .filter(Boolean) as string[];
  };

  // For students, find the class name by ID
  const getClassNameById = (id: number): string | undefined => {
    return classes.find((cls) => cls.id === id)?.name;
  };

  const deleteUser = async (userId: number) => {
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

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, files } = e.target as HTMLInputElement &
      HTMLSelectElement;
    if (name === 'picture' && files) {
      setNewUser({ ...newUser, picture: files[0] });
    } else if (name === 'classes_name') {
      const selectedOptions = Array.from(
        (e.target as HTMLSelectElement).selectedOptions,
        (option) => parseInt(option.value)
      );
      setNewUser({ ...newUser, classes_name: selectedOptions });
    } else {
      setNewUser({ ...newUser, [name]: value });
    }
  };

  const createUser = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const accessToken = Cookies.get('access_token');

      const formData = new FormData();
      Object.keys(newUser).forEach((key) => {
        const value = newUser[key as keyof NewUser];
        if (Array.isArray(value)) {
          value.forEach((v) => formData.append(key, v.toString()));
        } else if (value) {
          formData.append(key, value as string | Blob);
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
        classes_name: [],
        class_name: '',
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Failed to create user', error.response?.data);
        alert(
          JSON.stringify(error.response?.data.errors || error.response?.data)
        );
      } else {
        console.error('Failed to create user', error);
      }
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchDashboardData();
    }
  }, [user]);

  if (!user || user.role !== 'admin') {
    return <p>Access Denied</p>;
  }

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>
        Welcome, {user?.first_name} {user?.last_name}
      </p>

      <h2>Teachers</h2>
      <ul>
        {teachers.map((teacher) => (
          <li key={teacher.id}>
            {teacher.first_name} {teacher.last_name} - {teacher.email} -{' '}
            {getClassNamesByIds(teacher.classes_name || []).join(', ')}{' '}
            {/* Display class names */}
            <button onClick={() => deleteUser(teacher.id)}>Delete</button>
          </li>
        ))}
      </ul>

      <h2>Students</h2>
      <ul>
        {students.map((student) => (
          <li key={student.id}>
            {student.first_name} {student.last_name} - {student.email} -{' '}
            {getClassNameById(student.class_name || 0)}{' '}
            {/* Display class name */}
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
        <select name="role" value={newUser.role} onChange={handleChange}>
          <option value="">Select Role</option>
          <option value="admin">Admin</option>
          <option value="teacher">Teacher</option>
          <option value="student">Student</option>
        </select>
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

        {(newUser.role === 'teacher' || newUser.role === 'student') &&
          classes.length > 0 && (
            <>
              {newUser.role === 'teacher' && (
                <select
                  name="classes_name"
                  multiple
                  value={newUser.classes_name.map(String)}
                  onChange={handleChange}
                >
                  {classes.map((className) => (
                    <option key={className.id} value={className.id.toString()}>
                      {className.name}
                    </option>
                  ))}
                </select>
              )}

              {newUser.role === 'student' && (
                <select
                  name="class_name"
                  value={newUser.class_name.toString()}
                  onChange={handleChange}
                >
                  <option value="">Select Class</option>
                  {classes.map((className) => (
                    <option key={className.id} value={className.id.toString()}>
                      {className.name}
                    </option>
                  ))}
                </select>
              )}
            </>
          )}
        <button type="submit">Add User</button>
      </form>
    </div>
  );
};

export default AdminDashboard;
