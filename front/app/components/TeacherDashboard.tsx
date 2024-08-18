'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

// Define TypeScript interfaces for Class and UploadedFile
interface Class {
  id: string;
  name: string;
}

interface UploadedFile {
  id: string;
  name: string;
  fileType: string;
  uploaded_at: string; // String representation of the date
  classes: Class[]; // Array of classes to which the file is uploaded
}

const TeacherDashboard: React.FC = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<string>('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  useEffect(() => {
    fetchTeacherClasses();
    fetchUploadedFiles();
  }, []);

  const fetchTeacherClasses = async () => {
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
    } catch (error) {
      console.error('Failed to fetch classes', error);
    }
  };

const fetchUploadedFiles = async () => {
  const accessToken = Cookies.get('access_token');
  try {
    const fileResponse = await axios.get<UploadedFile[]>(
      'http://localhost:8000/api/teacher/uploaded-files/',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    console.log(fileResponse.data); // Log the response to check the data
    setUploadedFiles(fileResponse.data);
  } catch (error) {
    console.error('Failed to fetch uploaded files', error);
  }
};

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleFileTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFileType(e.target.value);
  };

  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );
    setSelectedClasses(selectedOptions);
  };

  const uploadFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || selectedClasses.length === 0) return;

    const accessToken = Cookies.get('access_token');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('file_type', fileType);

    selectedClasses.forEach((classId) => {
      formData.append('class_ids', classId);
    });

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

  return (
    <div>
      <h1>Teacher Dashboard</h1>
      <form onSubmit={uploadFile}>
        <input type="file" onChange={handleFileChange} required />
        <select value={fileType} onChange={handleFileTypeChange} required>
          <option value="">Select File Type</option>
          <option value="pdf">PDF</option>
          <option value="ppt">PowerPoint</option>
          <option value="doc">Word Document</option>
        </select>

        <select
          multiple
          value={selectedClasses}
          onChange={handleClassChange}
          required
        >
          <option value="">Select Classes</option>
          {classes.map((cls) => (
            <option key={cls.id} value={cls.id}>
              {cls.name}
            </option>
          ))}
        </select>

        <button type="submit">Upload File</button>
      </form>

      <h2>Uploaded Files</h2>
      <ul>
        {uploadedFiles.map((file) => (
          <li key={file.id}>
            {file.name} ({file.fileType}) - Uploaded on{' '}
            {new Date(file.uploaded_at).toLocaleDateString()} to classes:{' '}
            {file.classes.length > 0
              ? file.classes.map((cls) => cls.name).join(', ')
              : 'No classes'}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TeacherDashboard;
