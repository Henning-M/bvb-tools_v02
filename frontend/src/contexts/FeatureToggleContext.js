// root/frontend/src/contexts/FeatureToggleContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';

const FeatureToggleContext = createContext();

export const FeatureToggleProvider = ({ children }) => {
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(true);
  const [isFixturesInDb, setIsFixturesInDb] = useState(false);

  useEffect(() => {
    const checkFeatureState = async () => {
      //Check for registration-open
      try {
        const response = await fetch('httP://localhost:5000/feature_states/registration-open');
        const data = await response.json();
        setIsRegistrationOpen(data.is_enabled);
      } catch (error) {
        console.error('Error fetching status of isRegistrationOpen:', error);
      };

      //Check for fixturesInDb
      try {
        const response = await fetch('http://localhost:5000/feature_states/fixturesInDb');
        const data = await response.json();
        setIsFixturesInDb(data.is_enabled);
      } catch (error) {
        console.error('Error fetching fixturesInDb status:', error);
      };
    };

    checkFeatureState();
  }, []);

  return (
    <FeatureToggleContext.Provider value={{ isRegistrationOpen, setIsRegistrationOpen, isFixturesInDb, setIsFixturesInDb }}>
      {children}
    </FeatureToggleContext.Provider>
  );
};

export const useFeatureToggle = () => useContext(FeatureToggleContext);