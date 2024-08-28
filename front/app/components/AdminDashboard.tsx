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
import Navbar from './Navbar';

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
const [filters, setFilters] = useState<{
  id: string;
  name: string;
  email: string;
  date_of_birth: string;
  classes_name: string;
  class_name: string;
}>({
  id: '',
  name: '',
  email: '',
  date_of_birth: '',
  classes_name: '',
  class_name: '',
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

const getClassNamesByIds = (ids: number[] = []): string[] => {
  return ids
    .map((id) => classes.find((cls) => cls.id === id)?.name || '')
    .filter(Boolean) as string[];
};

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
            .includes(filters.classes_name.toLowerCase()))) &&
      (!filters.class_name ||
        (user.class_name &&
          getClassNameById(user.class_name)
            ?.toLowerCase()
            .includes(filters.class_name.toLowerCase())))
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
  return users.map((user) => (
    <tr key={user.id} className="hover:bg-gray-100">
      <td className="border px-4 py-2">{user.id}</td>
      <td className="border px-4 py-2">
        {user.first_name} {user.last_name}
      </td>
      <td className="border px-4 py-2">{user.email}</td>
      <td className="border px-4 py-2">{user.date_of_birth}</td>
      <td className="border px-4 py-2">
        {user.role === 'teacher'
          ? getClassNamesByIds(user.classes_name).join(', ')
          : user.role === 'student'
          ? getClassNameById(user.class_name)
          : ''}
      </td>
      <td className="border px-4 py-2">
        <button
          onClick={() => openEditModal(user)}
          className="bg-blue-500 hover:bg-blue-700 text-black font-bold py-2 px-4 rounded"
        >
          Edit
        </button>
        <button
          onClick={() => deleteUser(user.id)}
          className="bg-red-500 hover:bg-red-700 text-black font-bold py-2 px-4 rounded ml-2"
        >
          Delete
        </button>
        <button
          onClick={() => openUserModal(user)}
          className="bg-green-500 hover:bg-green-700 text-black font-bold py-2 px-4 rounded ml-2"
        >
          View
        </button>
      </td>
    </tr>
  ));
};

  return (
    <div className="flex h-screen">
      <Navbar />

      <div className="flex-1 p-6 overflow-auto">
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-500 text-white font-bold py-2 px-4 rounded mb-4"
        >
          Create User
        </button>

        <div className="mb-4">
          <button
            onClick={() => setActiveTab('admins')}
            className={`mr-4 ${activeTab === 'admins' ? 'font-bold' : ''}`}
          >
            Admins
          </button>
          <button
            onClick={() => setActiveTab('teachers')}
            className={`mr-4 ${activeTab === 'teachers' ? 'font-bold' : ''}`}
          >
            Teachers
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`${activeTab === 'students' ? 'font-bold' : ''}`}
          >
            Students
          </button>
        </div>

        <div className="mb-4 flex gap-4">
          <input
            type="text"
            name="id"
            placeholder="Filter by ID"
            value={filters.id}
            onChange={handleFilterChange}
            className="border rounded p-2"
          />
          <input
            type="text"
            name="name"
            placeholder="Filter by Name"
            value={filters.name}
            onChange={handleFilterChange}
            className="border rounded p-2"
          />
          <input
            type="text"
            name="email"
            placeholder="Filter by Email"
            value={filters.email}
            onChange={handleFilterChange}
            className="border rounded p-2"
          />
          <input
            type="text"
            name="date_of_birth"
            placeholder="Filter by Date of Birth"
            value={filters.date_of_birth}
            onChange={handleFilterChange}
            className="border rounded p-2"
          />
          <input
            type="text"
            name="classes_name"
            placeholder="Filter by Class"
            value={filters.classes_name}
            onChange={handleFilterChange}
            className="border rounded p-2"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border">
            <thead>
              <tr>
                <th className="border px-4 py-2">ID</th>
                <th className="border px-4 py-2">Name</th>
                <th className="border px-4 py-2">Email</th>
                <th className="border px-4 py-2">Date of Birth</th>
                <th className="border px-4 py-2">Class</th>
                <th className="border px-4 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {activeTab === 'admins' && renderTableRows(paginatedAdmins)}
              {activeTab === 'teachers' && renderTableRows(paginatedTeachers)}
              {activeTab === 'students' && renderTableRows(paginatedStudents)}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex justify-between">
          <button
            onClick={prevPage}
            disabled={currentPage === 1}
            className="bg-gray-500 text-black font-bold py-2 px-4 rounded"
          >
            Previous
          </button>
          <button
            onClick={nextPage}
            disabled={
              (activeTab === 'admins' && endIndex >= filteredAdmins.length) ||
              (activeTab === 'teachers' &&
                endIndex >= filteredTeachers.length) ||
              (activeTab === 'students' && endIndex >= filteredStudents.length)
            }
            className="bg-gray-500 text-black font-bold py-2 px-4 rounded"
          >
            Next
          </button>
        </div>
      </div>

      {/* Modal components */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <h2 className="text-xl font-bold mb-4">Create User</h2>
            <form onSubmit={createUser}>
              {/* Form fields */}
              {/* ... */}
              <button
                type="submit"
                className="bg-green-500 text-black font-bold py-2 px-4 rounded"
              >
                Create
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="ml-4 bg-red-500 text-black font-bold py-2 px-4 rounded"
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}

      <EditUserModal
        show={isEditModalOpen}
        handleClose={() => setIsEditModalOpen(false)}
        user={selectedUser}
        classes={classes}
        fetchDashboardData={fetchDashboardData}
      />

      <UserModal
        show={isUserModalOpen}
        handleClose={() => setIsUserModalOpen(false)}
        user={selectedUser}
        getClassNamesByIds={getClassNamesByIds}
        getClassNameById={getClassNameById}
      />
    </div>
  );
};

export default AdminDashboard;
