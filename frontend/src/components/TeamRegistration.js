import React, { useState, useEffect } from 'react';
import Navigation from './Navigation';
import '../styles/TeamRegistration.css';

function TeamRegistration() {
    const [player1Name, setPlayer1Name] = useState('');
    const [player2Name, setPlayer2Name] = useState('');
    const [teams, setTeams] = useState([]);

    // Handle changes to player 1 input
    const handlePlayer1Change = (e) => {
        setPlayer1Name(e.target.value);
    };

    // Handle changes to player 2 input
    const handlePlayer2Change = (e) => {
        setPlayer2Name(e.target.value);
    };

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

    // Compute the team name based on player inputs
    const teamName = `${player1Name} / ${player2Name}`;

    // Handle the register button click
    const handleRegister = async () => {
        if (!player1Name || !player2Name || player1Name === player2Name) {
            alert('Please only register with TWO DIFFERENT players');
            return;
        }

        const registerPlayer = async (playerName) => {
            const response = await fetch('http://localhost:5000/players', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: playerName }),
            });

            if (!response.ok) {
                alert(`Error registering player: ${playerName}`);
                return null;
            }

            const data = await response.json();
            return data.id;
        };

        const player1Id = await registerPlayer(player1Name);
        const player2Id = await registerPlayer(player2Name);

        if (!player1Id || !player2Id) {
            alert('Failed to register one or both players. Please try again.');
            return;
        }

        const registerTeam = async () => {
            const response = await fetch('http://localhost:5000/teams', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: teamName,
                    player1: player1Id,
                    player2: player2Id,
                }),
            });

            if (!response.ok) {
                alert('Error registering team.');
                return;
            }

            alert('Team registered successfully!');
            setPlayer1Name('');
            setPlayer2Name('');
            fetchTeams();  // Fetch the updated list of teams
        };

        await registerTeam();
        await fetchTeams();
    };

    return (
        <div>
        <Navigation />
        
            <div className="teamregistration-container">
                <div className="teamregistration-page-header">
                    <h1>Team Registration</h1>
                </div>
                <div className="teamregistration-cLeft-header">
                    <h2>Register a team</h2>
                </div>
                <div className="teamregistration-cRight-header">
                    <h2>Registered teams</h2>
                </div>
                <div className="teamregistration-cLeft-body">
                    <label>
                        Player 1:
                        <input
                            type="text"
                            value={player1Name}
                            maxLength={100}
                            onChange={handlePlayer1Change}
                        />
                    </label>
                    <label>
                        Player 2:
                        <input
                            type="text"
                            value={player2Name}
                            maxLength={100}
                            onChange={handlePlayer2Change}
                        />
                    </label>
                    <div>
                        <p>{teamName}</p>
                    </div>
                    <button onClick={handleRegister}>Register</button>
                </div>
                <div className="teamregistration-cRight-body">
                    <ol>
                        {teams.map((team, index) => (
                            <li key={team.id}>
                                {team.name}
                            </li>
                        ))}
                    </ol>
                </div>
            </div>
        </div>
    );
}

export default TeamRegistration;
