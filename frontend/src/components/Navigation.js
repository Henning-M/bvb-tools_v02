import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useFeatureToggle } from '../contexts/FeatureToggleContext';
import { logout } from '../redux/slices/userSlice';
import '../styles/Navigation.css';

function Navigation() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { isRegistrationOpen, isFixturesInDb, isTournamentLive } = useFeatureToggle();
    const { user, isLoggedIn } = useSelector((state) => state.user);

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
      };

    const handleLogout = async () => {
        try {
            const response = await fetch('http://localhost:5000/logout', {
                method: 'POST',
                credentials: 'include', // Ensure cookies are cleared
            });
            if (response.ok) {
                // Dispatch the logout action to clear the state
                dispatch(logout());
                navigate('/login');
            } else {
                console.error('Logout failed');
            }
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    const handleNavigation = (path) => {
        if (isRegistrationOpen && (path === '/kotc-schedule-creator')) {
            alert('Close registration via admin panel first');
            // navigate(path)      //Remove this line to reactivate blocking behaviour again
        } else if (isRegistrationOpen && (path === '/kotc-tournament-home')) {
            alert('Tournament schedule, scores and rankings will be available here once the registration is closed.');
            // navigate(path)      //Remove this line to reactivate blocking behaviour again
        } else {
            navigate(path);
        }
    };

    // Determine the classes for each navigation item based on the feature states
    const getNavItemClass = (navItem) => {
        switch (navItem) {
            case 'kotc-schedule-creator':
                return isRegistrationOpen ? 'inactive' : 'active';
            case 'kotc-tournament':
                if (isRegistrationOpen) {
                    return 'inactive';
                } else {
                    return isFixturesInDb ? 'active' : 'inactive';
                }
            default:
                return 'active';
        }
    };

    return (
        <div className="navigation-container">
          <div className="burger-menu" onClick={toggleMenu}>
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
          </div>
          <nav>
            <ul className={`nav-items ${isMenuOpen ? 'show' : ''}`}>
              <li onClick={() => handleNavigation('/')}>Home</li>
              <li className={getNavItemClass('/team-registration')} onClick={() => handleNavigation('/team-registration')}>
                Team Registration
              </li>
              {isLoggedIn && user.isadmin && (
                <li className={getNavItemClass('/kotc-schedule-creator')} onClick={() => handleNavigation('/kotc-schedule-creator')}>
                  KOTC Schedule Creator
                </li>
              )}
              {isTournamentLive && (
                <li className={getNavItemClass('/kotc-tournament')} onClick={() => handleNavigation('/kotc-tournament-home')}>
                  KOTC Tournament
                </li>
              )}
              <li onClick={() => handleNavigation('/about')}>About</li>
              {isLoggedIn && <li onClick={() => handleNavigation('/userdashboard')}>Dashboard</li>}
              {isLoggedIn && user.isadmin && <li onClick={() => handleNavigation('/admin-panel')}>Admin</li>}
              {isLoggedIn ? (
                <button className="navigation-logoutbutton" onClick={handleLogout}>Logout</button>
              ) : (
                <button className="navigation-loginbutton" onClick={() => handleNavigation('/login')}>
                  Admin Login
                </button>
              )}
            </ul>
          </nav>
        </div>
      );
    };

export default Navigation;