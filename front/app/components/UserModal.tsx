import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { User } from '../context/AuthContext';

interface UserModalProps {
  show: boolean;
  handleClose: () => void;
  user: User | null;
  getClassNamesByIds: (ids: number[]) => string[];
  getClassNameById: (id: number) => string | undefined;
}

const UserModal: React.FC<UserModalProps> = ({
  show,
  handleClose,
  user,
  getClassNamesByIds,
  getClassNameById,
}) => {
  if (!user) return null;

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>User Information</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          <strong>ID:</strong> {user.id}
        </p>
        <p>
          <strong>Name:</strong> {user.first_name} {user.last_name}
        </p>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <p>
          <strong>Date of Birth:</strong> {user.date_of_birth}
        </p>
        <p>
          <strong>Phone:</strong> {user.phone}
        </p>
        <p>
          <strong>ID Card or Passport:</strong> {user.id_card_or_passport}
        </p>
        <p>
          <strong>Picture:</strong>
          {typeof user.picture === 'string' ? (
            <img
              src={user.picture}
              alt="User"
              style={{ width: '100px', height: '100px' }}
            />
          ) : user.picture ? (
            <img
              src={URL.createObjectURL(user.picture)}
              alt="User"
              style={{ width: '100px', height: '100px' }}
            />
          ) : (
            'No picture available'
          )}
        </p>
        {user.role === 'teacher' && (
          <p>
            <strong>Classes:</strong>{' '}
            {getClassNamesByIds(user.classes_name || []).join(', ')}
          </p>
        )}
        {user.role === 'student' && (
          <p>
            <strong>Class:</strong>{' '}
            {typeof user.class_name === 'number'
              ? getClassNameById(user.class_name) || 'No class assigned'
              : 'No class assigned'}
          </p>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default UserModal;
