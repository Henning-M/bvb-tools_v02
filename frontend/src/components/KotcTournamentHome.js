import React, { useState } from "react";
import Navigation from './Navigation';
import KotcHFixtures from './KotcHFixtures';
import KotcHRanking from './KotcHRanking';
import '../styles/KotcTournamentHome.css';

function KotcTournamentHome () {

    const [selectedIndex, setSelectedIndex] = useState(0);

    const handleClick = (index) => {
        setSelectedIndex(index);
    };

    const renderContent = () => {
        switch (selectedIndex) {
            case 0:
                return <KotcHFixtures />;
            case 1:
                return <KotcHRanking />;
            case 2:
                return 
            default:
                return null;
        }
    };

    return (
        <div>
        <Navigation />
        <div className="kotctournamenthome-container">
        {/* <div className="kotctournamenthome-page-header"><h1>KOTC Tournament Home</h1></div> */}
        <div className="kotctournamenthome-page-body-nav">
            <ul>
                <li
                    className={selectedIndex === 0 ? 'selected' : ''}
                    onClick={() => handleClick(0)}>
                    Fixtures & Score Entry
                </li>
                <li
                    className={selectedIndex === 1 ? 'selected' : ''}
                    onClick={() => handleClick(1)}>
                    Ranking
                </li>
                {/* <li
                    className={selectedIndex === 1 ? 'selected' : ''}
                    onClick={() => handleClick(1)}>
                    Full Schedule
                </li> */}
            </ul>
        </div>
        <div className="kotctournamenthome-page-body">
            {renderContent()}
        </div>
        </div>
        </div>
    )
}

export default KotcTournamentHome;