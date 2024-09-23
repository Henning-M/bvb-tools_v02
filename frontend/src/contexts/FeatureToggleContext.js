// root/frontend/src/contexts/FeatureToggleContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';

const FeatureToggleContext = createContext();

export const FeatureToggleProvider = ({ children }) => {
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(true);
  const [isFixturesInDb, setIsFixturesInDb] = useState(false);
  const [isTournamentLive, setIsTournamentLive] = useState(true);

  useEffect(() => {
    const checkFeatureState = async () => {
      //Check for isRegistrationOpen
      try {
        const response = await fetch('httP://localhost:5000/feature_states/registration-open');
        const data = await response.json();
        setIsRegistrationOpen(data.is_enabled);
      } catch (error) {
        console.error('Error fetching status of isRegistrationOpen:', error);
      };

      //Check for isFixturesInDb
      try {
        const response = await fetch('http://localhost:5000/feature_states/fixturesInDb');
        const data = await response.json();
        setIsFixturesInDb(data.is_enabled);
      } catch (error) {
        console.error('Error fetching fixturesInDb status:', error);
      };

      //Check for tournamentLive
      try {
        const response = await fetch('http://localhost:5000/feature_states/tournament-live');
        const data = await response.json();
        setIsTournamentLive(data.is_enabled);
      } catch (error) {
        console.error('Error fetching status of isTournamentLive:', error);
      };

    };

    checkFeatureState();
  }, []);

  return (
    <FeatureToggleContext.Provider value={{ isRegistrationOpen, setIsRegistrationOpen, isFixturesInDb, setIsFixturesInDb, isTournamentLive, setIsTournamentLive }}>
      {children}
    </FeatureToggleContext.Provider>
  );
};

export const useFeatureToggle = () => useContext(FeatureToggleContext);