'use client';
import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import axios from 'axios';
import Cookies from 'js-cookie';
import { User } from '../../../context/AuthContext';

interface EditUserModalProps {
  show: boolean;
  handleClose: () => void;
  user: User | null;
  classes: { id: number; name: string }[];
  fetchDashboardData: () => void;
}

const EditUserModal: React.FC<EditUserModalProps> = ({
  show,
  handleClose,
  user,
  classes,
  fetchDashboardData,
}) => {
  const [editedUser, setEditedUser] = useState<User | null>(user);
  const [picture, setPicture] = useState<File | null>(null);

  useEffect(() => {
    setEditedUser(user);
    setPicture(null);
  }, [user]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, files } = e.target as HTMLInputElement &
      HTMLSelectElement;
    if (name === 'picture' && files) {
      setPicture(files[0]);
    } else if (name === 'classes_name' && editedUser) {
      const selectedOptions = Array.from(
        (e.target as HTMLSelectElement).selectedOptions,
        (option) => parseInt(option.value)
      );
      setEditedUser({ ...editedUser, classes_name: selectedOptions });
    } else if (name === 'student_class_name' && editedUser) {
      setEditedUser({ ...editedUser, class_name: parseInt(value) });
    } else if (editedUser) {
      setEditedUser({ ...editedUser, [name]: value });
    }
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!editedUser) return;

    try {
      const accessToken = Cookies.get('access_token');
      const formData = new FormData();

      Object.keys(editedUser).forEach((key) => {
        const value = editedUser[key as keyof User];
        if (Array.isArray(value)) {
          value.forEach((v) => formData.append(key, v.toString()));
        } else if (value) {
          formData.append(key, value as string | Blob);
        }
      });

      if (picture) {
        formData.append('picture', picture);
      }

      await axios.put(
        `http://localhost:8000/api/admin/edit-user/${editedUser.id}/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      fetchDashboardData();
      handleClose();
    } catch (error) {
      console.error('Failed to update user', error);
      alert('Failed to update user');
    }
  };

  if (!editedUser) {
    return null;
  }

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Edit User</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form onSubmit={handleSave}>
          <input
            type="text"
            name="first_name"
            value={editedUser.first_name}
            onChange={handleChange}
            placeholder='First name'
            required
          />
          <input
            type="text"
            name="last_name"
            value={editedUser.last_name}
            onChange={handleChange}
            placeholder='Last name'

            required
          />
          <input
            type="email"
            name="email"
            value={editedUser.email}
            onChange={handleChange}
            placeholder='email'
            required
          />
          <input
            type="text"
            name="id_card_or_passport"
            value={editedUser.id_card_or_passport}
            onChange={handleChange}
            placeholder='id_card_or_passport'
            required
          />
          <input
            type="tel"
            name="phone"
            value={editedUser.phone}
            onChange={handleChange}
            placeholder='phone'
            required
          />
          <input
            type="date"
            name="date_of_birth"
            value={editedUser.date_of_birth}
            onChange={handleChange}
            required
          />
          <input
            type="file"
            name="picture"
            accept="image/*"
            onChange={handleChange}
          />

          <select
            name="role"
            value={editedUser.role}
            onChange={handleChange}
            required
          >
            <option value="admin">Admin</option>
            <option value="teacher">Teacher</option>
            <option value="student">Student</option>
          </select>

          {editedUser.role === 'teacher' && (
            <select
              multiple
              name="classes_name"
              value={editedUser.classes_name?.map(String) || []}
              onChange={handleChange}
            >
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          )}

          {editedUser.role === 'student' && (
            <select
              name="student_class_name"
              value={editedUser.class_name?.toString() || ''}
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

          <Button type="submit">Save Changes</Button>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
        </form>
      </Modal.Body>
    </Modal>
  );
};

export default EditUserModal;
