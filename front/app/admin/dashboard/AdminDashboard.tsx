'use client';

import React from 'react';


import Navbar from '../../components/Navbar';
import EventCalendar from './EventCalendar';



const AdminDashboard: React.FC = () => {



  return (
    <div>
            <Navbar />
            <EventCalendar/>
    </div>
  );
};

export default AdminDashboard;
