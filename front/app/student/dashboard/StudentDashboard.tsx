'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import Navbar from '../../components/Navbar'
import { Modal, Button } from 'react-bootstrap';
import {
  FaFilePdf,
  FaFileWord,
  FaFileArchive,
  FaFileAlt,
} from 'react-icons/fa';

// Define the types for the file and group objects
interface UploadedFile {
  id: number;
  file: string;
  // Add other file-related properties as needed
}

interface FileGroup {
  id: number;
  name: string;
  files: UploadedFile[];
}

// Helper function to determine the correct icon for a file type
const getIconForFileType = (filePath: string) => {
  const extension = filePath.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'pdf':
      return <FaFilePdf style={{ color: 'red' }} />;
    case 'doc':
    case 'docx':
      return <FaFileWord style={{ color: 'blue' }} />;
    case 'rar':
    case 'zip':
      return <FaFileArchive style={{ color: 'orange' }} />;
    default:
      return <FaFileAlt />;
  }
};

const StudentDashboard: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<FileGroup[]>([]);
  const [currentGroup, setCurrentGroup] = useState<FileGroup | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);

  useEffect(() => {
    fetchUploadedFiles();
  }, []);

  const fetchUploadedFiles = async () => {
    const accessToken = Cookies.get('access_token');
    try {
      const fileResponse = await axios.get<FileGroup[]>(
        'http://localhost:8000/api/student/uploaded-file-groups/',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setUploadedFiles(fileResponse.data);
    } catch (error) {
      console.error('Failed to fetch uploaded files', error);
    }
  };

  const openFileGroup = (group: FileGroup) => {
    setCurrentGroup(group);
    setShowModal(true);
  };

  const downloadFile = async (fileId: number, fileName: string) => {
    const accessToken = Cookies.get('access_token');
    if (!accessToken) {
      console.error('No access token found.');
      alert('Failed to download file');
      return;
    }

    try {
      const response = await axios.get<Blob>(
        `http://localhost:8000/api/student/download-file/${fileId}/`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          responseType: 'blob',
        }
      );

      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download file', error);
      alert('Failed to download file');
    }
  };
  return (
    <div>
      <Navbar/>
      <h2>Your Class Files</h2>
      <div>
        {uploadedFiles.map((group, index) => (
          <div
            key={index}
            style={{
              border: '1px solid #ccc',
              padding: '10px',
              margin: '10px 0',
              cursor: 'pointer',
            }}
            onClick={() => openFileGroup(group)}
          >
            <h3>{group.name}</h3>
            <p>{group.files.length} files</p>
          </div>
        ))}
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Files in {currentGroup?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentGroup?.files.map((file, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
              {getIconForFileType(file.file)}
              <span style={{ marginLeft: '10px' }}>
                {file.file.split('/').pop()}
              </span>
              <button
                style={{ marginLeft: 'auto' }}
                onClick={() =>
                  downloadFile(file.id, file.file.split('/').pop()!)
                }
              >
                Download
              </button>
            </div>
          ))}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};


export default StudentDashboard;
