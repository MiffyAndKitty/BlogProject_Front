// SearchBar.jsx
import React, { useState } from 'react';
import './UserProfile.css';
import  signup_img  from '../img/signup_img.png'

interface UserProfileProp  {
    profileType: 'signup' | 'login';
    profileImage: string;
}
const UserProfile = ({ profileType ,profileImage}) => {

  

  return (
    <img src={signup_img} alt="Profile" className="heart"/>
  );
};

export default UserProfile;
