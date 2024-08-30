import React, { useState, useEffect } from "react";
import '../styles/KotcScTeams.css'

function KotcScTeams () {

    const [teams, setTeams] = useState([]);

    // Function to fetch all registered teams
    const fetchTeams = async () => {
        try {
            const response = await fetch('http://localhost:5000/teams');
            const data = await response.json();
            setTeams(data);
        } catch (error) {
            console.error('Error fetching teams:', error);
        }
    };

    // Fetch teams when component mounts
    useEffect(() => {
        fetchTeams();
    }, []);

    return (
        <div className="kotcscteams-team-list">
            <ol>
                {teams.map((team, index) => (
                    <li key={team.id}>
                        {team.name}
                    </li>
                ))}
            </ol>
        </div>
    )
}

export default KotcScTeams;