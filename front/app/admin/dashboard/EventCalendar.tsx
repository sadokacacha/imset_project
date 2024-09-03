'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import styles from './EventCalendar.module.css';
import axios from 'axios';
import Cookies from 'js-cookie';

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

interface Profile {
  first_name: string;
  last_name: string;
  role: string;
  picture: string;
}

interface DashboardData {
  admin_count: number;
  teacher_count: number;
  student_count: number;
}

const EventCalendar = () => {
  const [value, onChange] = useState<Value>(new Date());
  const [profile, setProfile] = useState<Profile | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );

  useEffect(() => {
    const fetchProfile = async () => {
      const token = Cookies.get('access_token');
      if (!token) {
        console.error('No access token found');
        return;
      }

      try {
        const response = await axios.get('http://localhost:8000/api/profile/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(response.data);
      } catch (error) {
        console.error('Failed to fetch profile', error);
      }
    };

    const fetchDashboardData = async () => {
      const token = Cookies.get('access_token');
      if (!token) {
        console.error('No access token found');
        return;
      }

      try {
        const response = await axios.get(
          'http://localhost:8000/api/admin/dashboard/',
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setDashboardData(response.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      }
    };

    fetchProfile();
    fetchDashboardData();
  }, []);

  return (
    <div className={styles.containerWithSidebar}>
      {/* Sidebar */}
      <div className={styles.sidebar}>
        {/* Add your sidebar content here */}
      </div>

      {/* Main content area */}
      <div className={styles.mainContent}>
        {/* Navbar */}
        <div className={styles.navbar2}>
          {/* SEARCH BAR */}
          {/* ICONS AND USER */}
          <div className={styles.iconsUser}>
            <div className={styles.icon}>
              <Image
                src="/images/message.png"
                alt="Messages"
                width={20}
                height={20}
              />
            </div>
            <div className={styles.icon}>
              <Image
                src="/images/announcement.png"
                alt="Announcements"
                width={20}
                height={20}
              />
              <div className={styles.notificationBadge}>1</div>
            </div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>
                {profile
                  ? `${profile.first_name} ${profile.last_name}`
                  : 'Loading...'}
              </span>
              <span className={styles.userRole}>
                {profile ? profile.role : 'Loading...'}
              </span>
            </div>
            {profile?.picture ? (
              <img
                src={`http://localhost:8000${profile.picture}`}
                alt={`${profile.first_name} ${profile.last_name}`}
                width={36}
                height={36}
                className={styles.avatar}
              />
            ) : (
              <Image
                src="/images/avatar.png"
                alt="Default Avatar"
                width={36}
                height={36}
                className={styles.avatar}
              />
            )}
          </div>
        </div>

        {/* Main content area with Calendar and UserCard */}
        <div className={styles.content}>
          <div className={styles.calendarContainer}>
            <Calendar
              onChange={onChange}
              value={value}
              className={styles.calendar}
            />
          </div>
        </div>
        <div className={styles.header}>
          <UserCard type="student" count={dashboardData?.student_count || 0} />
          <UserCard type="teacher" count={dashboardData?.teacher_count || 0} />
        </div>
      </div>
    </div>
  );
};

interface UserCardProps {
  type: string;
  count: number;
}

const UserCard = ({ type, count }: UserCardProps) => {
  return (
    <div className={styles.userCard}>
      <div className={styles.userCardHeader}>
        <span className={styles.smallTag}>2024/25</span>
      </div>
      <h1 className={styles.userCardTitle}>{count}</h1>
      <h2 className={styles.userCardSubtitle}>{type}s</h2>
    </div>
  );
};

export default EventCalendar;
