import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
// import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux'
import { setUser, setError } from '../redux/slices/userSlice';
import Navigation from './Navigation';
import '../styles/Login.css';

function Login() {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const error = useSelector((state) => state.user.error);     // Access error from Redux store

    const handleLogin = async (e) => {
        e.preventDefault();
        
        try {
          const response = await fetch('https://d3ix2aoqy9cq9s.cloudfront.net/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include', // Ensure cookies are sent
            body: JSON.stringify({ username, password }),
          });

          // Check if the response is OK (status in the range 200-299)
          if (!response.ok) {
            const result = await response.json();
            throw new Error(result.error || 'Login failed');
          }

          // Now safely parse the JSON response
          const result = await response.json();
          const { user } = result;
          
          // Dispatch the user data to Redux
          dispatch(setUser({
            id: user.id,
            username: user.username,
            isadmin: user.isadmin
          }));
          
          // Redirect to the user dashboard after successful login
          navigate('/userdashboard');
          
        } catch (error) {
          console.error('Login failed:', error);
          dispatch(setError('Invalid username or password'));
        }
      };
          


    return (
        <div>
        <Navigation />
            <div className="login-container">
                <h2>Login</h2>
                <form onSubmit={handleLogin}>
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
                    <button type="submit">Login</button>
                </form>
                {error && <p className="error">{error}</p>}  {/* Display error if exists */}
                <p>
                    Don't have an account? <Link to="/register">Register here</Link>
                </p>
            </div>
        </div>
    );
    }
      
    
    export default Login;