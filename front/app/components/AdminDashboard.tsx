'use client';
import React from 'react';
import {
  useContext,
  useState,
  useEffect,
  ChangeEvent,
  FormEvent,
  ReactNode,
} from 'react';
import AuthContext, { AuthContextType, User } from '../context/AuthContext';
import axios from 'axios';
import Cookies from 'js-cookie';
import UserModal from '../components/admin_modal/UserModal';
import EditUserModal from '../components/admin_modal/EditUserModal';

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
  const [admins, setAdmins] = useState<User[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [classes, setClasses] = useState<ClassName[]>([]);
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
  const [activeTab, setActiveTab] = useState<
    'admins' | 'teachers' | 'students'
  >('admins');
  const [filters, setFilters] = useState({
    id: '',
    name: '',
    email: '',
    date_of_birth: '',
    classes_name: '',
  });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal state for creating user
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Modal state for editing user

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Modal state for viewing user details
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

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

      setAdmins(dashboardResponse.data.admins || []);
      setTeachers(dashboardResponse.data.teachers || []);
      setStudents(dashboardResponse.data.students || []);
      setClasses(classesResponse.data || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    }
  };

  // Function to open the edit modal
  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  // Function to map class IDs to class names
  const getClassNamesByIds = (ids: number[] = []): string[] => {
    return ids
      .map((id) => classes.find((cls) => cls.id === id)?.name)
      .filter(Boolean) as string[];
  };

  // For students, find the class name by ID
  const getClassNameById = (id: number | undefined): string | undefined => {
    if (id === undefined) return undefined;
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

  const handleFilterChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const applyFilters = (users: User[]): User[] => {
    return users.filter((user) => {
      return (
        (!filters.id || user.id.toString().includes(filters.id)) &&
        (!filters.name ||
          user.first_name.toLowerCase().includes(filters.name.toLowerCase()) ||
          user.last_name.toLowerCase().includes(filters.name.toLowerCase())) &&
        (!filters.email ||
          user.email.toLowerCase().includes(filters.email.toLowerCase())) &&
        (!filters.date_of_birth ||
          (user.date_of_birth &&
            user.date_of_birth.includes(filters.date_of_birth))) &&
        (!filters.classes_name ||
          (user.classes_name &&
            getClassNamesByIds(user.classes_name)
              .join(', ')
              .toLowerCase()
              .includes(filters.classes_name.toLowerCase())))
      );
    });
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
      setIsModalOpen(false);
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

  // Pagination logic
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const filteredAdmins = applyFilters(admins);
  const filteredTeachers = applyFilters(teachers);
  const filteredStudents = applyFilters(students);

  const paginatedAdmins = filteredAdmins.slice(startIndex, endIndex);
  const paginatedTeachers = filteredTeachers.slice(startIndex, endIndex);
  const paginatedStudents = filteredStudents.slice(startIndex, endIndex);

  const nextPage = () => {
    if (activeTab === 'admins' && endIndex < filteredAdmins.length) {
      setCurrentPage((prevPage) => prevPage + 1);
    } else if (activeTab === 'teachers' && endIndex < filteredTeachers.length) {
      setCurrentPage((prevPage) => prevPage + 1);
    } else if (activeTab === 'students' && endIndex < filteredStudents.length) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  const openUserModal = (user: User) => {
    setSelectedUser(user);
    setIsUserModalOpen(true); // Corrected this line
  };
const renderTableRows = (users: User[]): ReactNode => {
  return users.map((user) => {
    const formattedDate = user.date_of_birth
      ? new Date(user.date_of_birth).toLocaleDateString()
      : '-';

    const classInfo =
      user.role === 'teacher'
        ? getClassNamesByIds(user.classes_name).join(', ')
        : user.role === 'student'
        ? getClassNameById(user.class_name) || '-'
        : '-';

    return (
      <tr key={user.id}>
        <td>{user.id}</td>
        <td>
          {user.first_name} {user.last_name}
        </td>
        <td>{user.email}</td>
        <td>{formattedDate}</td>
        <td>{classInfo}</td>
        <td>
          <button onClick={() => deleteUser(user.id)}>Delete</button>
        </td>
        <td>
          <button onClick={() => openUserModal(user)}>View</button>
        </td>
        <td>
          <button onClick={() => openEditModal(user)}>Edit</button>
        </td>
      </tr>
    );
  });
};
  return (
    <div>
      <h1>Admin Dashboard</h1>
      <button onClick={() => setIsModalOpen(true)}>Create User</button>
      <div>
        <button onClick={() => setActiveTab('admins')}>Admins</button>
        <button onClick={() => setActiveTab('teachers')}>Teachers</button>
        <button onClick={() => setActiveTab('students')}>Students</button>
      </div>
      <div>
        <input
          type="text"
          name="id"
          placeholder="Filter by ID"
          value={filters.id}
          onChange={handleFilterChange}
        />
        <input
          type="text"
          name="name"
          placeholder="Filter by Name"
          value={filters.name}
          onChange={handleFilterChange}
        />
        <input
          type="text"
          name="email"
          placeholder="Filter by Email"
          value={filters.email}
          onChange={handleFilterChange}
        />
        <input
          type="text"
          name="date_of_birth"
          placeholder="Filter by Date of Birth"
          value={filters.date_of_birth}
          onChange={handleFilterChange}
        />
        <input
          type="text"
          name="classes_name"
          placeholder="Filter by Class"
          value={filters.classes_name}
          onChange={handleFilterChange}
        />
      </div>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Date of Birth</th>
            <th>Class</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {activeTab === 'admins' && renderTableRows(paginatedAdmins)}
          {activeTab === 'teachers' && renderTableRows(paginatedTeachers)}
          {activeTab === 'students' && renderTableRows(paginatedStudents)}
        </tbody>
      </table>
      <button onClick={prevPage} disabled={currentPage === 1}>
        Previous
      </button>
      <button
        onClick={nextPage}
        disabled={
          (activeTab === 'admins' && endIndex >= filteredAdmins.length) ||
          (activeTab === 'teachers' && endIndex >= filteredTeachers.length) ||
          (activeTab === 'students' && endIndex >= filteredStudents.length)
        }
      >
        Next
      </button>
      {isModalOpen && (
        <div>
          <h2>Create User</h2>
          <form onSubmit={createUser}>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={newUser.email}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={newUser.password}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="first_name"
              placeholder="First Name"
              value={newUser.first_name}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="last_name"
              placeholder="Last Name"
              value={newUser.last_name}
              onChange={handleChange}
              required
            />
            <input
              type="date"
              name="date_of_birth"
              value={newUser.date_of_birth}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="id_card_or_passport"
              placeholder="ID Card/Passport"
              value={newUser.id_card_or_passport}
              onChange={handleChange}
              required
            />
            <input
              type="tel"
              name="phone"
              placeholder="Phone"
              value={newUser.phone}
              onChange={handleChange}
              required
            />
            <input
              type="file"
              name="picture"
              onChange={handleChange}
              accept="image/*"
              required
            />
            <select
              name="role"
              value={newUser.role}
              onChange={handleChange}
              required
            >
              <option value="">Select Role</option>
              <option value="admin">Admin</option>
              <option value="teacher">Teacher</option>
              <option value="student">Student</option>
            </select>

            {newUser.role === 'teacher' && (
              <select
                multiple
                name="classes_name"
                value={newUser.classes_name.map(String)}
                onChange={handleChange}
              >
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            )}

            {newUser.role === 'student' && (
              <select
                name="class_name"
                value={newUser.class_name}
                onChange={handleChange}
                required
              >
                <option value="">Select Class</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            )}

            <button type="submit">Create</button>
            <button onClick={() => setIsModalOpen(false)}>Cancel</button>
          </form>
        </div>
      )}
      <EditUserModal
        show={isEditModalOpen}
        handleClose={() => setIsEditModalOpen(false)}
        user={selectedUser}
        classes={classes}
        fetchDashboardData={fetchDashboardData}
      />
      ;
      <UserModal
        show={isUserModalOpen}
        handleClose={() => setIsUserModalOpen(false)}
        user={selectedUser}
        getClassNamesByIds={getClassNamesByIds}
        getClassNameById={getClassNameById} // Pass this function
      />
    </div>
  );
};

export default AdminDashboard;
