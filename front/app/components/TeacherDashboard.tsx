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

interface Class {
  id: string;
  name: string;
}

interface Group {
  id: string;
  name: string;
}

const TeacherDashboard: React.FC = () => {
  const { user } = useContext(AuthContext) as AuthContextType;
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<string>('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedGroup, setSelectedGroup] = useState<string>('');

  useEffect(() => {
    if (user && user.role === 'teacher') {
      fetchUploadedFiles();
      fetchTeacherClassesAndGroups();
    }
  }, [user]);

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  // Handle file type selection
  const handleFileTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFileType(e.target.value);
  };

  // Handle class selection
  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedClass(e.target.value);
  };

  // Handle group selection
  const handleGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedGroup(e.target.value);
  };

  // Fetch the uploaded files for the teacher
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
      console.error('Failed to fetch files', error);
    }
  };

  // Fetch the classes and groups associated with the teacher
  const fetchTeacherClassesAndGroups = async () => {
    const accessToken = Cookies.get('access_token');
    try {
      const classResponse = await axios.get<Class[]>(
        'http://localhost:8000/api/teacher/classes/',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setClasses(classResponse.data);

      const groupResponse = await axios.get<Group[]>(
        'http://localhost:8000/api/teacher/groups/',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setGroups(groupResponse.data);
    } catch (error) {
      console.error('Failed to fetch classes and groups', error);
    }
  };

  // Handle file upload
  const uploadFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !selectedClass) return;

    const accessToken = Cookies.get('access_token');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('file_type', fileType);
    formData.append('class_id', selectedClass);
    formData.append('group_id', selectedGroup);

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
      console.error('Failed to upload file', error);
      alert('Failed to upload file');
    }
  };

  // Handle file download
  const downloadFile = (fileId: string, fileName: string) => {
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
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
      })
      .catch((error) => {
        console.error('Failed to download file', error);
      });
  };

  return (
    <div>
      <h1>
        Welcome to the Teacher Dashboard, {user?.first_name} {user?.last_name}
      </h1>
      <form onSubmit={uploadFile}>
        <input type="file" onChange={handleFileChange} required />
        <select value={fileType} onChange={handleFileTypeChange} required>
          <option value="">Select File Type</option>
          <option value="pdf">PDF</option>
          <option value="ppt">PowerPoint</option>
          <option value="doc">Word Document</option>
        </select>
        <select value={selectedClass} onChange={handleClassChange} required>
          <option value="">Select Class</option>
          {classes.map((cls) => (
            <option key={cls.id} value={cls.id}>
              {cls.name}
            </option>
          ))}
        </select>
        <select value={selectedGroup} onChange={handleGroupChange}>
          <option value="">Select Group (optional)</option>
          {groups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </select>
        <button type="submit">Upload File</button>
      </form>

      <h2>Your Uploaded Files:</h2>
      <ul>
        {uploadedFiles.map((file) => (
          <li key={file.id}>
            {file.file}
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
