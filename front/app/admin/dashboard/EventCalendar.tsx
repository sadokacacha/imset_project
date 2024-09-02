"use client";

import Image from "next/image";
import { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import styles from './EventCalendar.module.css';

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

const EventCalendar = () => {
  const [value, onChange] = useState<Value>(new Date());

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
              <Image src="/images/message.png" alt="Messages" width={20} height={20} />
            </div>
            <div className={styles.icon}>
              <Image src="/images/announcement.png" alt="Announcements" width={20} height={20} />
              <div className={styles.notificationBadge}>1</div>
            </div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>Aziz Ladhari</span>
              <span className={styles.userRole}>Admin</span>
            </div>
            <Image src="/images/avatar.png" alt="Avatar" width={36} height={36} className={styles.avatar} />
          </div>
        </div>

        {/* Main content area with Calendar and UserCard */}
        <div className={styles.content}>
          <div className={styles.calendarContainer}>
            <Calendar onChange={onChange} value={value} className={styles.calendar} />
          </div>
        </div>
        <div className={styles.header}>
            <UserCard type="student" />
            <UserCard type="teacher" />
            </div>
      </div>
    </div>

  );
};

// Define UserCard inside the same file
const UserCard = ({ type }: { type: string }) => {
  return (
    <div className={styles.userCard}>
      <div className={styles.userCardHeader}>
        <span className={styles.smallTag}>
          2024/25
        </span>
      </div>
      <h1 className={styles.userCardTitle}>1</h1>
      <h2 className={styles.userCardSubtitle}>{type}s</h2>
    </div>
  );
};

export default EventCalendar;
