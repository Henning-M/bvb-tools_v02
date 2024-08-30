import React, { useState } from 'react';
import Navigation from './Navigation';
import KotcScTeams from './KotcScTeams';
import KotcScConfiguration from './KotcScConfiguration';
import KotcScSchedule from './KotcScSchedule';
import '../styles/KotcScheduleCreator.css';

function KotcScheduleCreator () {

    const [selectedIndex, setSelectedIndex] = useState(0);

    const handleClick = (index) => {
        setSelectedIndex(index);
    };

    const renderContent = () => {
        switch (selectedIndex) {
            case 0:
                return <KotcScTeams />;
            case 1:
                return <KotcScConfiguration />;
            case 2:
                return <KotcScSchedule />;
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
                        Teams
                    </li>
                    <li
                        className={selectedIndex === 1 ? 'selected' : ''}
                        onClick={() => handleClick(1)}>
                            Configuration
                    </li>
                    <li
                        className={selectedIndex === 2 ? 'selected' : ''}
                        onClick={() => handleClick(2)}>
                            Schedule
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