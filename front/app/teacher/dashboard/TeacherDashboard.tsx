'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import Navbar from '../../components/Navbar';
import { Modal, Button } from 'react-bootstrap';

interface Class {
  id: string;
  name: string;
}

interface UploadedFile {
  id: string;
  name: string;
  uploaded_at: string;
  classes: Class[];
}

interface FileGroup {
  id: string;
  name: string;
  files: UploadedFile[];
}

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

  const handleDeleteGroup = async (groupId: string | undefined) => {
    if (!groupId) {
      console.error('Invalid groupId:', groupId);
      alert('Invalid group selected for deletion');
      return;
    }

    const accessToken = Cookies.get('access_token');

    if (!accessToken) {
      alert('Access token not found. Please log in.');
      return;
    }

    try {
      console.log('Deleting group with ID:', groupId);
      await axios.delete(
        `http://localhost:8000/api/teacher/delete-file-group/${groupId}/`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      // Refresh the list of uploaded files
      fetchUploadedFiles();

      alert('File group deleted successfully');
    } catch (error: any) {
      console.error('Failed to delete file group', error);

      // Provide more detailed error feedback if available
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

        <ul>
          {files.map((file, index) => (
            <li key={index}>
              {file.name}{' '}
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
        {uploadedFiles.map((group) => (
          <div
            key={group.id} // Ensure a unique key is present
            style={{
              border: '1px solid #ccc',
              padding: '10px',
              margin: '10px 0',
              position: 'relative', // Position for the delete button
              cursor: 'pointer',
            }}
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
                borderRadius: '50%',
                width: '25px',
                height: '25px',
                cursor: 'pointer',
              }}
              onClick={(e) => {
                e.stopPropagation(); // Prevent triggering the group click event
                handleDeleteGroup(group.id); // Call delete handler
              }}
            >
              X
            </button>
          </div>
        ))}
      </div>

      {/* Confirmation Modal */}
      <Modal show={showConfirmation} onHide={() => setShowConfirmation(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Upload</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>You have selected the following files:</p>
          <ul>
            {files.map((file, index) => (
              <li key={index}>{file.name}</li>
            ))}
          </ul>
          <p>Group Name: {customName}</p>
          <p>Classes: {selectedClasses.join(', ')}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowConfirmation(false)}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={uploadFiles}>
            Confirm and Upload
          </Button>
        </Modal.Footer>
      </Modal>

      {/* File Group Modal */}
      {currentGroup && (
        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>{currentGroup.name}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <ul>
              {currentGroup.files.map((file) => (
                <li key={file.id}>
                  {file.name}{' '}
                  <Button
                    variant="primary"
                    onClick={() => downloadFile(file.id, file.name)}
                  >
                    Download
                  </Button>
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
      )}
    </div>
  );
};

export default TeacherDashboard;
