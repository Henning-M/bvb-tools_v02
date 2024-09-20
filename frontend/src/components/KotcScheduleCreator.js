import React, { useState } from 'react';
import Navigation from './Navigation';
import RegisteredTeams from './RegisteredTeams';
import KotcScConfiguration from './KotcScConfiguration';
import '../styles/KotcScheduleCreator.css';

function KotcScheduleCreator () {

    const [selectedIndex, setSelectedIndex] = useState(0);

    const handleClick = (index) => {
        setSelectedIndex(index);
    };

    const renderContent = () => {
        switch (selectedIndex) {
            case 0:
                return <KotcScConfiguration />;
            case 1:
                return <RegisteredTeams />;
            default:
                return null;
        }
    };

    return (
        <div>
        <Navigation />
        <div className="kotcschedulecreator-container">
            <div className="kotcschedulecreator-page-header"><h1>KOTC Schedule Creator</h1></div>
            <div className="kotcschedulecreator-page-body-nav">
                <ul>
                    <li
                        className={selectedIndex === 0 ? 'selected' : ''}
                        onClick={() => handleClick(0)}>
                        Configuration
                    </li>
                    <li
                        className={selectedIndex === 1 ? 'selected' : ''}
                        onClick={() => handleClick(1)}>
                            Teams
                    </li>
                </ul>
            </div>
            <div className="kotcschedulecreator-page-body">
                {renderContent()}
            </div>
        </div>
        </div>
    )
}

export default KotcScheduleCreator;