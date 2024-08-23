import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { User } from '../../context/AuthContext';

interface UserModalProps {
  show: boolean;
  handleClose: () => void;
  user: User | null;
  getClassNamesByIds: (ids: number[]) => string[];
  getClassNameById: (id: number | undefined) => string | undefined;
}

const UserModal: React.FC<UserModalProps> = ({
  show,
  handleClose,
  user,
  getClassNamesByIds,
  getClassNameById,
}) => {
  if (!show || !user) return null;
  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>User Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          <strong>ID:</strong> {user.id}
        </p>
        <p>
          <strong>Name:</strong> {`${user.first_name} ${user.last_name}`}
        </p>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <p>
          <strong>Date of Birth:</strong> {user.date_of_birth}
        </p>
        <p>
          <strong>ID Card/Passport:</strong> {user.id_card_or_passport}
        </p>
        <p>
          <strong>Phone:</strong> {user.phone}
        </p>
        <p>
          <strong>Role:</strong> {user.role}
        </p>
        {user.role === 'teacher' && (
          <p>
            <strong>Classes:</strong>{' '}
            {/* Handle the case where user.classes_name is undefined */}
            {user.classes_name
              ? getClassNamesByIds(user.classes_name).join(', ')
              : 'N/A'}
          </p>
        )}
        {user.role === 'student' && (
          <p>
            <strong>Class:</strong> {getClassNameById(user.class_name)}
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
