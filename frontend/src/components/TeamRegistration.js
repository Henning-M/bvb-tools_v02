import React, { useState } from 'react';
import Navigation from './Navigation';
import RegisterTeam from './RegisterTeam';
import RegisteredTeams from './RegisteredTeams';
import '../styles/TeamRegistration.css';


function TeamRegistration() {

    //FUNCTIONALITY FOR THE IN-COMPONENT-NAV
    const [selectedIndex, setSelectedIndex] = useState(0);

    const handleClick = (index) => {
        setSelectedIndex(index);
    };

    const renderContent = () => {
        switch (selectedIndex) {
            case 0:
                return <RegisterTeam />;
            case 1:
                return <RegisteredTeams />;
            default:
                return null;
        }
    };

    return (
        <div>
        <Navigation />
        
            <div className="teamregistration-container">
                <div className="teamregistration-header">
                    {/* <h1>Team Registration</h1> */}
                </div>
                <div className="teamregistration-nav">
                    <ul>
                        <li
                            className={selectedIndex === 0 ? 'selected' : ''}
                            onClick={() => handleClick(0)}>
                            Register a team
                        </li>
                        <li
                            className={selectedIndex === 1 ? 'selected' : ''}
                            onClick={() => handleClick(1)}>
                                Teams registered
                        </li>
                    </ul>
                </div>
                <div className="teamregistration-body">
                {renderContent()}
                </div>
            </div>
        </div>
    );
}

export default TeamRegistration;
