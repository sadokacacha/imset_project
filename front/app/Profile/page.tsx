'use client';

import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import AuthContext, { AuthContextType } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import styles from './Profile.module.css';

type UserProfile = {
  first_name: string;
  last_name: string;
  email: string;
  date_of_birth?: string;
  id_card_or_passport?: string;
  phone?: string;
  role: string;
  picture?: string;
};

const Profile: React.FC = () => {
  const { logout } = useContext(AuthContext) as AuthContextType;
  const [profile, setProfile] = useState<UserProfile | null>(null);

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

    fetchProfile();
  }, []);

  if (!profile) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <Navbar /> {/* Left side Navbar */}
      <div className={styles.content}>
        {/* Right side Profile Content */}
        <div className={styles.profileCard}>
          <h1>Profile</h1>
          {profile.picture && (
            <img
              src={`http://localhost:8000${profile.picture}`} // Media URL prefix removed
              alt={`${profile.first_name} ${profile.last_name}`}
              className={styles.profilePicture}
            />
          )}
          <div>
            <p>
              <strong>First Name:</strong> {profile.first_name}
            </p>
            <p>
              <strong>Last Name:</strong> {profile.last_name}
            </p>
            <p>
              <strong>Email:</strong> {profile.email}
            </p>
            {profile.date_of_birth && (
              <p>
                <strong>Date of Birth:</strong> {profile.date_of_birth}
              </p>
            )}
            {profile.id_card_or_passport && (
              <p>
                <strong>ID/Passport:</strong> {profile.id_card_or_passport}
              </p>
            )}
            {profile.phone && (
              <p>
                <strong>Phone:</strong> {profile.phone}
              </p>
            )}
            <p>
              <strong>Role:</strong> {profile.role}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
