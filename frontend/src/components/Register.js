import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navigation from './Navigation';
// import { useDispatch } from 'react-redux';
// import { loginSuccess } from '../redux/actions'; // Import Redux action
import '../styles/Register.css';

function Register () {

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();
//   const dispatch = useDispatch(); // Get the dispatch function from Redux

  const handleRegister = async (event) => {
    
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
        <p>
            Already have an account? <Link to="/login">Login here</Link>
        </p>
        </div>
    </div>
  );
};

export default Register;