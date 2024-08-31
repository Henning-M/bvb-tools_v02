import React from "react";
import Navigation from './Navigation';
import '../styles/KotcTournamentHome.css';

function KotcTournamentHome () {

    return (
        <div>
        <Navigation />
        <div className="kotctournamenthome-container">
            Two tabs. Schedule & results as a table, input field to enter points per team, submit button per round;
            below timestamp print when results were saved successfully;
            <br/><br/>
            Ranking as list. Rank | Team name | Points Round #1 | column for each round | total points (sum);
            define tiebreakers (this way no logic to display two teams in same rank needed)
        </div>
        </div>
    )
}

export default KotcTournamentHome;