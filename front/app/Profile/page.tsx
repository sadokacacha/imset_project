'use client';
import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import AuthContext, { AuthContextType } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import "./Profile.css"

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
  const [profile, setProfile] = useState<UserProfile | null>(null); // Set default empty state

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

    fetchProfile(); // Call the fetchProfile function
  }, []);
  if (!profile) {
    return <div>Loading...</div>;
  }
  return (
    <div className='allpage'>
      <Navbar/>
      <div className="profilepicture">
      <h1>Profile</h1>
        {profile.picture && (
          <img
            src={profile.picture}
            alt={`${profile.first_name} ${profile.last_name}`}
          />
        )}
      </div>
      <div className="profile-details">
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
  );
};

export default Profile;
