'use client';
import React from 'react';
import Navbar from '../../components/Navbar';

const TeacherDashboard: React.FC = () => {
  return (
    <div>
      <Navbar />
      <div style={{ padding: '20px' }}>
        <h1>Welcome to Your Dashboard</h1>
        <p>Use the navigation bar to upload and manage your files.</p>
      </div>
    </div>
  );
};

export default TeacherDashboard;
