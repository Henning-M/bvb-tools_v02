import React from 'react';
import { useSelector } from 'react-redux';
import Navigation from './Navigation';
import '../styles/Home.css';

function UserDashboard() {

  const userState = useSelector((state) => state.user); // Access the user slice
  const user = userState.user; // Extract the user object

  return (
    <div>
    <Navigation />
      <div className="userdashboard-container">
          <h1>User Dashboard</h1>
          <div>
            {userState.isLoggedIn ? (
                <div>
                    <h2>Welcome, {user?.username}!</h2>
                    <p>Your admin status: {user?.isadmin ? 'Admin' : 'User'}</p>
                </div>
            ) : (
                <p>Please log in to see your dashboard.</p>
            )}
        </div>
      </div>

    </div>
);
}
  

export default UserDashboard;