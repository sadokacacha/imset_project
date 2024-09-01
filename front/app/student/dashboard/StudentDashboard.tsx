'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import Navbar from '../../components/Navbar';




const StudentDashboard: React.FC = () => {
  

  return (
    <div>
      <Navbar />
      <h2>Your Class Files</h2>
     
    </div>
  );
};

export default StudentDashboard;
