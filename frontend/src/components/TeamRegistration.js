import React, { useState, useEffect } from 'react';
import { useFeatureToggle } from '../contexts/FeatureToggleContext';
import { useNavigate } from 'react-router-dom';
import Navigation from './Navigation';
import '../styles/TeamRegistration.css';

function TeamRegistration() {
    const navigate = useNavigate();
    const [player1Name, setPlayer1Name] = useState('');
    const [player2Name, setPlayer2Name] = useState('');
    const [teams, setTeams] = useState([]);
    const { isRegistrationOpen, setIsRegistrationOpen } = useFeatureToggle();

    // Handle changes to player 1/2 input
    const handlePlayer1Change = (e) => {setPlayer1Name(e.target.value);};
    const handlePlayer2Change = (e) => {setPlayer2Name(e.target.value);};

    // Compute the team name based on player inputs
    const teamName = `${player1Name} / ${player2Name}`;

    // FETCH TEAMS & PLAYERS FROM DB ///////////////////////////////////////////////////////////////

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

    // Fetch teams and initial registration status when component mounts
    useEffect(() => {
        fetchTeams();
        // Assuming fetchRegistrationStatus is available from the context
        // If not, you might need to implement it in the RegistrationContext
        setIsRegistrationOpen(prevState => prevState); // This will trigger a re-fetch in the context
    }, [setIsRegistrationOpen]);

    // New function to fetch all players
    const fetchAllPlayers = async () => {
        try {
            const response = await fetch('http://localhost:5000/players');
            if (!response.ok) {
                throw new Error('Failed to fetch players');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching players:', error);
            return [];
        }
    };


    // MANAGE STATE OF REGISTRATION-OPEN IN DB ///////////////////////////////////////////////////////////////

    // Function to toggle registration status
    const toggleRegistrationStatus = async () => {
        try {
            const response = await fetch('http://localhost:5000/feature_states/registration-open/toggle', {
                method: 'POST',
            });
            const data = await response.json();
            setIsRegistrationOpen(data.is_enabled);
        } catch (error) {
            console.error('Error toggling registration status:', error);
        }
    };


    // REGISTER OR REMOVE A TEAM ///////////////////////////////////////////////////////////////

    // Handle the register button click
    const handleRegister = async () => {
        if (!player1Name || !player2Name) {
            alert('Please enter names for both players');
            return;
        }

        if (player1Name === player2Name) {
            alert('Please enter different names for each player');
            return;
        }

        // Fetch all existing players
        const existingPlayers = await fetchAllPlayers();
        const existingPlayerNames = existingPlayers.map(player => player.name.toLowerCase());

        // Check if either player name already exists
        if (existingPlayerNames.includes(player1Name.toLowerCase()) || 
            existingPlayerNames.includes(player2Name.toLowerCase())) {
            alert('One or both player names already exist. Please use new player names.');
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


    const handleRemoveTeam = async (teamId) => {
        try {
            const response = await fetch(`http://localhost:5000/teams/${teamId}`, {
                method: 'DELETE',
            });
    
            if (!response.ok) {
                throw new Error('Failed to delete the team');
            }
    
            const data = await response.json();
            alert(data.message);
    
            // Update the teams state to remove the deleted team
            setTeams((prevTeams) => prevTeams.filter((team) => team.id !== teamId));
        } catch (error) {
            console.error('Error deleting team:', error);
            alert('There was an error deleting the team. Please try again.');
        }
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
                    {isRegistrationOpen ? (
                        <>
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
                        </>
                    ) : (
                        <div>
                            <p>Registration is closed.</p>
                            <a 
                                href="/kotc-schedule-creator" 
                                onClick={(e) => {
                                    e.preventDefault(); // Prevent default anchor behavior
                                    navigate('/kotc-schedule-creator'); // Use navigate for SPA routing
                                }}
                            >
                                Go to KOTC Schedule Creator
                            </a>
                        </div>
                    )}
                </div>
                <div className="teamregistration-cRight-body">
                    <table className="teamregistration-team-table">
                        <tbody>
                            {teams.map((team, index) => (
                                <tr key={team.id}>
                                    <td>{index + 1}.</td>
                                    <td>{team.name}</td>
                                    {isRegistrationOpen && (
                                        <td onClick={() => handleRemoveTeam(team.id)}>[ X ]</td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="teamregistration-toggleRegistration">
                    <button onClick={toggleRegistrationStatus}>
                        {isRegistrationOpen ? 'Close registration' : 'Re-open registration'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default TeamRegistration;
