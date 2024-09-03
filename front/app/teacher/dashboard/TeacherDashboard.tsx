'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import Navbar from '../../components/Navbar';
import { Modal, Button } from 'react-bootstrap';
import {
  FaFilePdf,
  FaFileWord,
  FaFileArchive,
  FaFileAlt,
  FaTrash,
} from 'react-icons/fa';

interface Class {
  id: string;
  name: string;
}

interface UploadedFile {
  id: string;
  file: string;
  uploaded_at: string;
  classes: Class[];
}

interface FileGroup {
  id: string;
  name: string;
  files: UploadedFile[];
}

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

const TeacherDashboard: React.FC = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<FileGroup[]>([]);
  const [customName, setCustomName] = useState<string>('');
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [currentGroup, setCurrentGroup] = useState<FileGroup | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);

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
      const fileResponse = await axios.get<FileGroup[]>(
        'http://localhost:8000/api/teacher/uploaded-file-groups/',
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles([...files, ...Array.from(e.target.files)]);
    }
  };

  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );
    setSelectedClasses(selectedOptions);
  };

  const handleCustomNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomName(e.target.value);
  };

  const handleRemoveFile = (index: number) => {
    const updatedFiles = [...files];
    updatedFiles.splice(index, 1);
    setFiles(updatedFiles);
  };

  const uploadFiles = async () => {
    if (files.length === 0 || selectedClasses.length === 0 || !customName)
      return;

    const accessToken = Cookies.get('access_token');
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    formData.append('name', customName);

    selectedClasses.forEach((classId) => {
      formData.append('class_ids', classId);
    });

    try {
      await axios.post(
        'http://localhost:8000/api/teacher/upload-file-group/',
        formData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      alert('Files uploaded successfully');
      setFiles([]); // Clear the files after upload
      setCustomName(''); // Clear the custom name
      fetchUploadedFiles();
    } catch (error) {
      console.error('Failed to upload files', error);
      alert('Failed to upload files');
    } finally {
      setShowConfirmation(false); // Hide confirmation modal after upload
    }
  };

  const handleDeleteGroup = async (groupName: string | undefined) => {
    if (!groupName) {
      console.error('Invalid groupName:', groupName);
      alert('Invalid group selected for deletion');
      return;
    }

    const accessToken = Cookies.get('access_token');
    if (!accessToken) {
      alert('Access token not found. Please log in.');
      return;
    }

    try {
      await axios.delete(
        `http://localhost:8000/api/teacher/delete-file-group/${groupName}/`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      fetchUploadedFiles(); // Refresh files

      alert('File group deleted successfully');
    } catch (error: any) {
      console.error('Failed to delete file group', error);

      const errorMessage =
        error.response?.data?.error || 'Failed to delete file group';
      alert(errorMessage);
    }
  };

  const openFileGroup = (group: FileGroup) => {
    setCurrentGroup(group);
    setShowModal(true);
  };

  const downloadFile = async (
    fileId: string,
    fileName: string
  ): Promise<void> => {
    const accessToken = Cookies.get('access_token');
    if (!accessToken) {
      console.error('No access token found.');
      alert('Failed to download file');
      return;
    }

    try {
      const response = await axios.get<Blob>(
        `http://localhost:8000/api/teacher/download-file/${fileId}/`,
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
      <Navbar />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setShowConfirmation(true);
        }}
      >
        {/* File Input and Class Selection Fields */}
        <input type="file" multiple onChange={handleFileChange} />

        <input
          type="text"
          placeholder="Custom Group Name"
          value={customName}
          onChange={handleCustomNameChange}
          required
        />

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

        {/* File List with Remove Button */}
        <ul>
          {files.map((file, index) => (
            <li key={index}>
              {getIconForFileType(file.name)} {file.name}{' '}
              <button type="button" onClick={() => handleRemoveFile(index)}>
                Remove
              </button>
            </li>
          ))}
        </ul>

        <button type="submit">Confirm Upload</button>
      </form>

      <h2>Your Files</h2>
      <div>
        {uploadedFiles.map((group, index) => (
          <div
            key={index} // Ensure unique key
            style={{
              border: '1px solid #ccc',
              padding: '10px',
              margin: '10px 0',
              position: 'relative',
              cursor: 'pointer',
            }}
            onClick={() => openFileGroup(group)} // Set the group as currentGroup
          >
            <h3>{group.name}</h3>
            <p>{group.files.length} files</p>
            <button
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                backgroundColor: 'red',
                color: 'white',
                border: 'none',
                padding: '5px 10px',
                cursor: 'pointer',
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteGroup(group.name);
              }}
            >
              <FaTrash />
            </button>
          </div>
        ))}
      </div>

      {/* Modal for File Group */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{currentGroup?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ul>
            {currentGroup?.files.map((file) => (
              <li key={file.id}>
                {getIconForFileType(file.file)} {file.file}
                <button
                  onClick={() => downloadFile(file.id, file.file)}
                  style={{ marginLeft: '10px' }}
                >
                  Download
                </button>
              </li>
            ))}
          </ul>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Confirmation Modal */}
      <Modal show={showConfirmation} onHide={() => setShowConfirmation(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Upload</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to upload these files to the selected classes?
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowConfirmation(false)}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={uploadFiles}>
            Upload
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};


export default TeacherDashboard;
