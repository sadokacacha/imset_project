'use client';
import { useContext, useEffect, useState } from 'react';
import AuthContext, { AuthContextType } from '../../context/AuthContext';
import axios from 'axios';
import Cookies from 'js-cookie';
import Navbar from '../../components/Navbar'; 

interface Class {
  id: string;
  name: string;
}

interface UploadedFile {
  id: string;
  name: string;
  fileType: string;
  uploaded_at: string;
  classes: Class[];
  teacher: {
    first_name: string;
    last_name: string;
  };
}

const StudentDashboard: React.FC = () => {
  const { user } = useContext(AuthContext) as AuthContextType;
  const [files, setFiles] = useState<UploadedFile[]>([]);

  useEffect(() => {
    const fetchClassFiles = async () => {
      const token = Cookies.get('access_token');
      try {
        const response = await axios.get(
          'http://localhost:8000/api/student/class-files/',
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setFiles(response.data);
      } catch (error) {
        console.error('Failed to fetch files', error);
      }
    };

    if (user && user.role === 'student') {
      fetchClassFiles();
    }
  }, [user]);

  if (!user || user.role !== 'student') {
    return <p>Access Denied</p>;
  }

const downloadFile = async (fileId: string, fileName: string) => {
  const token = Cookies.get('access_token');
  try {
    const response = await axios.get(
      `http://localhost:8000/api/student/download-file/${fileId}/`, // Updated URL
      {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      }
    );
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
  } catch (error) {
    console.error('Failed to download file', error);
  }
};

return (
  <div>
    <Navbar /> 
    <h1>
      {user?.first_name + ' ' + user?.last_name}
    </h1>
    <h2>Your Class Files</h2>
    {files.length > 0 ? (
      <ul>
        {files.map((file) => (
          <li key={file.id}>
            <span
              style={{
                cursor: 'pointer',
                color: 'blue',
                textDecoration: 'underline',
              }}
              onClick={() =>
                downloadFile(file.id, file.name || 'downloaded-file')
              }
            >
              {file.name} ({file.fileType})
            </span>{' '}
            - Uploaded on {new Date(file.uploaded_at).toLocaleDateString()} by{' '}
            {file.teacher.first_name} {file.teacher.last_name} to classes:{' '}
            {file.classes.length > 0
              ? file.classes.map((cls) => cls.name).join(', ')
              : 'No classes'}
          </li>
        ))}
      </ul>
    ) : (
      <p>You have no files yet.</p>
    )}
  </div>
);

};

export default StudentDashboard;
