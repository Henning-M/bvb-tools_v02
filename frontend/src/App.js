import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { setUser } from './redux/slices/userSlice';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { FeatureToggleProvider } from './contexts/FeatureToggleContext';
import Home from './components/Home';
import TeamRegistration from './components/TeamRegistration';
import KOTCScheduleCreator from './components/KotcScheduleCreator';
import KotcTournamentHome from './components/KotcTournamentHome';
import About from './components/About';
import AdminPanel from './components/AdminPanel';
import Login from './components/Login';
import Register from './components/Register';
import UserDashboard from './components/UserDashboard';



function App() {

  const dispatch = useDispatch();

  useEffect(() => {
    axios.get('https://d3ix2aoqy9cq9s.cloudfront.net/session', { withCredentials: true })
      .then((response) => {
        const { user } = response.data;
        if (user) {
          dispatch(setUser(user));
        }
      })
      .catch((error) => {
        console.error('Error fetching session:', error);
      });
}, [dispatch]);


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
              <Route path="/login" element={<Login />} />
              <Route path='/register' element={<Register />} />
              <Route path='/userdashboard' element={<UserDashboard />} />
          </Routes>
      </Router>
    </FeatureToggleProvider>
  );
}

export default App;