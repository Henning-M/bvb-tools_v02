import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import About from './components/About';
import TeamRegistration from './components/TeamRegistration';
import KOTCScheduleCreator from './components/KotcScheduleCreator';

function App() {
  return (
      <Router>
          <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/team-registration" element={<TeamRegistration />} />
              <Route path="/kotc-schedule-creator" element={<KOTCScheduleCreator />} />
          </Routes>
      </Router>
  );
}

export default App;