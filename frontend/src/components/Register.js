import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Navigation from './Navigation';
import { useDispatch, useSelector } from 'react-redux';
import { setUser, setError } from '../redux/slices/userSlice';
import '../styles/Register.css';

function Register () {

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const error = useSelector((state) => state.user.error);     // Access error from Redux store

const handleRegister = async (event) => {
  event.preventDefault(); // Prevent default form submission

  if (password !== confirmPassword) {
      dispatch(setError('Passwords do not match'));
      return;
  }

  try {
      const response = await axios.post('https://d3ix2aoqy9cq9s.cloudfront.net/register', {
          username,
          password,
      });

      if(response.data.user) {
        dispatch(setUser(response.data.user));    // Dispatch user data to store
        navigate('/');                            // Navigate somewhere
      } else {
        dispatch(setError(response.data.message || 'Registration failed'));
      }
  } catch (error) {
      dispatch(setError('Registration failed. Please try again.'));
  }
};


  return (
    <div>
        <Navigation />
        <div className="register-container">
        <h2>Register</h2>
        <form onSubmit={handleRegister}>
            <input
            type="text"
            name="username"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            />
            <input
            type="password"
            name="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            />
            <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button type="submit">Register</button>
        </form>
        {error && <p className="error">{error}</p>}  {/* Display error if exists */}
        <p>
            Already have an account? <Link to="/login">Login here</Link>
        </p>
        </div>
    </div>
  );
};

export default Register;