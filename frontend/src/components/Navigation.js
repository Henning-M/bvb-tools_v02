import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Navigation.css';

function Navigation() {
    const navigate = useNavigate();

    return (
        <div className="navigation">
            <nav>
                <ul>
                    <li onClick={() => navigate('/')}>Home</li>
                    <li onClick={() => navigate('/team-registration')}>Team Registration</li>
                    <li onClick={() => navigate('/kotc-schedule-creator')}>KOTC Schedule Creator</li>
                    <li onClick={() => navigate('/kotc-tournament-home')}>KOTC Tournament</li>
                    <li onClick={() => navigate('/about')}>About</li>
                </ul>
            </nav>
        </div>
    );
}

export default Navigation;
