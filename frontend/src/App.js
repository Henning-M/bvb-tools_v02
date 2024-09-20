import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { FeatureToggleProvider } from './contexts/FeatureToggleContext';
import Home from './components/Home';
import TeamRegistration from './components/TeamRegistration';
import KOTCScheduleCreator from './components/KotcScheduleCreator';
import KotcTournamentHome from './components/KotcTournamentHome';
import About from './components/About';
import AdminPanel from './components/AdminPanel';

function App() {
  return (
    <FeatureToggleProvider>
      <Router>
          <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/team-registration" element={<TeamRegistration />} />
              <Route path="/kotc-schedule-creator" element={<KOTCScheduleCreator />} />
              <Route path="/kotc-tournament-home" element={<KotcTournamentHome />} />
              <Route path="/admin-panel" element={<AdminPanel />} />
          </Routes>
      </Router>
    </FeatureToggleProvider>
  );
}

export default App;