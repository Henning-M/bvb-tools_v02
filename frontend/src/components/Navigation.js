import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFeatureToggle } from '../contexts/FeatureToggleContext';
import '../styles/Navigation.css';

function Navigation() {
    const navigate = useNavigate();
    const { isRegistrationOpen, setIsRegistrationOpen, isFixturesInDb } = useFeatureToggle();

    useEffect(() => {
        const fetchRegistrationStatus = async () => {
            try {
                const response = await fetch('http://localhost:5000/feature_states/registration-open');
                const data = await response.json();
                setIsRegistrationOpen(data.is_enabled);
            } catch (error) {
                console.error('Error fetching registration status:', error);
            }
        };

        fetchRegistrationStatus();
    }, [setIsRegistrationOpen]);

    const handleNavigation = (path) => {
        if (isRegistrationOpen && (path === '/kotc-schedule-creator' || path === '/kotc-tournament-home')) {
            alert("Only available once registration has been closed.");
        } else if (!isRegistrationOpen && !isFixturesInDb && (path === '/kotc-tournament-home')) {
            alert("Please create and submit schedule first.");
        } else {
            navigate(path);
        }
    };

    // Determine the classes for each navigation item based on the feature states
    const getNavItemClass = (navItem) => {
        switch (navItem) {
            case 'team-registration':
                return isRegistrationOpen ? 'active' : 'visually-inactive';
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
            <nav>
            <ul>
                <li onClick={() => handleNavigation('/')}>Home</li>
                <li className={getNavItemClass('team-registration')} onClick={() => handleNavigation('/team-registration')}>
                    Team Registration
                </li>
                <li className={getNavItemClass('kotc-schedule-creator')} onClick={() => handleNavigation('/kotc-schedule-creator')}>
                    KOTC Schedule Creator
                </li>
                <li className={getNavItemClass('kotc-tournament')} onClick={() => handleNavigation('/kotc-tournament-home')}>
                    KOTC Tournament
                </li>
                <li onClick={() => handleNavigation('/about')}>About</li>
            </ul>
            </nav>
        </div>
    );
}

export default Navigation;