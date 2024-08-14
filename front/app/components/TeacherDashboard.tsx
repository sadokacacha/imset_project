'use client';

import React, { useContext, useState, useEffect } from 'react';
import AuthContext from '../context/AuthContext';
import type { AuthContextType } from '../context/AuthContext'; 
import axios from 'axios';
import Cookies from 'js-cookie';

interface UploadedFile {
  id: string;
  file: string;
}

const TeacherDashboard: React.FC = () => {
  const { user } = useContext(AuthContext) as AuthContextType;
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<string>('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleFileTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFileType(e.target.value);
  };

  const uploadFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    const accessToken = Cookies.get('access_token');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('file_type', fileType);

    try {
      await axios.post(
        'http://localhost:8000/api/teacher/upload-file/',
        formData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      alert('File uploaded successfully');
      fetchUploadedFiles(); // Fetch updated list of files after upload
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Failed to upload file', error.response?.data);
        alert('Failed to upload file');
      } else {
        console.error('An unexpected error occurred', error);
        alert('An unexpected error occurred');
      }
    }
  };

  const fetchUploadedFiles = async () => {
    const accessToken = Cookies.get('access_token');
    try {
      const response = await axios.get<UploadedFile[]>(
        'http://localhost:8000/api/teacher/upload-file/',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setUploadedFiles(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Failed to fetch files', error.response?.data);
      } else {
        console.error('An unexpected error occurred', error);
      }
    }
  };

  const downloadFile = (fileId: string, file: string) => {
    const accessToken = Cookies.get('access_token');
    axios
      .get(`http://localhost:8000/api/teacher/download-file/${fileId}/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        responseType: 'blob',
      })
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', file);
        document.body.appendChild(link);
        link.click();
        link.remove();
      })
      .catch((error) => {
        if (axios.isAxiosError(error)) {
          console.error('Failed to download file', error.response?.data);
        } else {
          console.error('An unexpected error occurred', error);
        }
      });
  };

  useEffect(() => {
    if (user && user.role === 'teacher') {
      fetchUploadedFiles(); // Fetch files when the component mounts
    }
  }, [user]);

  if (!user || user.role !== 'teacher') {
    return <p>Access Denied</p>; // Restrict access to teachers only
  }

  return (
    <div>
      <h1>
        Welcome to the Teacher Dashboard,{' '}
        {user?.first_name + ' ' + user?.last_name}
      </h1>
      <form onSubmit={uploadFile}>
        <input type="file" onChange={handleFileChange} required />
        <select value={fileType} onChange={handleFileTypeChange} required>
          <option value="">Select File Type</option>
          <option value="pdf">PDF</option>
          <option value="ppt">PowerPoint</option>
          <option value="doc">Word Document</option>
        </select>
        <button type="submit">Upload File</button>
      </form>

      <h2>Your Uploaded Files:</h2>
      <ul>
        {uploadedFiles.map((file) => (
          <li key={file.id}>
            {file.file}{' '}
            <button onClick={() => downloadFile(file.id, file.file)}>
              Download
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TeacherDashboard;
