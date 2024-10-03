import React, { useState, useEffect } from "react";
import { useFeatureToggle } from '../contexts/FeatureToggleContext';
import { useSelector } from "react-redux";
import '../styles/RegisteredTeams.css'

function RegisteredTeams () {
    const [teams, setTeams] = useState([]);
    const { isRegistrationOpen } = useFeatureToggle(); // Get feature toggle state
    const { user } = useSelector((state) => state.user);

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

    // Allow removing teams (buttons only displayed when registration is open)
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
        <div className="registeredteams-list">
            <table>
                <tbody>
                    {teams.map((team, index) => (
                        <tr key={team.id}>
                            <td className="registeredteams-team-number">{index + 1}</td>
                            <td className="registeredteams-team-name">{team.name}</td>
                            {isRegistrationOpen && user && user.isadmin && (
                                <td className="registeredteams-remove-button">
                                    <button onClick={() => handleRemoveTeam(team.id)}>Remove team</button>
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default RegisteredTeams;