import React from 'react';
import Navigation from './Navigation';
import { useFeatureToggle } from '../contexts/FeatureToggleContext';
import '../styles/Home.css';

function Home() {

  const { isRegistrationOpen, setIsRegistrationOpen } = useFeatureToggle();

  // Function to toggle registration status
  const toggleRegistrationStatus = async () => {
    try {
        const response = await fetch('http://localhost:5000/feature_states/registration-open/toggle', {
            method: 'POST',
        });
        const data = await response.json();
        setIsRegistrationOpen(data.is_enabled);
    } catch (error) {
        console.error('Error toggling registration status:', error);
    }
  };

  return (
    <div>
    <Navigation />
      <div className="home-container">
          <h1>Home Page</h1>
      </div>
      <div>
        {/* <button onClick={toggleRegistrationStatus}>
            {isRegistrationOpen ? 'Close registration' : 'Re-open registration'}
        </button> */}
      </div>
    </div>
);
}
  

export default Home;