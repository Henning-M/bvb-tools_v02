import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useFeatureToggle } from "../contexts/FeatureToggleContext";
import Navigation from "./Navigation";
import '../styles/AdminPanel.css'

function AdminPanel () {

    // Use the context
    const { isRegistrationOpen, setIsRegistrationOpen } = useFeatureToggle();
    const { isFixturesInDb, setIsFixturesInDb } = useFeatureToggle();
    const { isTournamentLive, setIsTournamentLive } = useFeatureToggle();

    const navigate = useNavigate();
    const { user } = useSelector((state) => state.user);
    // const userState = useSelector((state) => state.user);       //Access the user state
    // const { isLoggedIn, user } = userState;                     //Destructure values

    // Redirect if the user is not an admin
    if (!user || !user.isadmin) {
        navigate('/')
        return null;
    };

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

  // Function to clear schedule
  const handleClearSchedule = async() => {
    try {
        const response = await fetch('http://localhost:5000/fixtures', {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error('Failed to clear schedule');
        } else {
            // alert('Schedule cleared')
            setIsFixturesInDb(false); // Reset this when the schedule is cleared
        };
    } catch (error) {
        console.error('Error clearing schedule:', error);
        alert('There was an error clearing the schedule. Please try again.');
    }
    };

    // Function to toggle tournament-live
  const toggleTournamentLive = async () => {
    try {
        const response = await fetch('http://localhost:5000/feature_states/tournament-live/toggle', {
            method: 'POST',
        });
        const data = await response.json();
        setIsTournamentLive(data.is_enabled);
    } catch (error) {
        console.error('Error toggling registration status:', error);
    }
  };


    return (
        <div>
            <Navigation />
            <div className="adminpanel-container">
                <table className="adminpanel-table">
                    <thead>
                        <tr>
                            <th>Feature</th>
                            <th>Description</th>
                            <th>Controls</th>
                            <th>Current Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="adminpanel-table-feature">Open / Close Team Registration</td>
                            <td className="adminpanel-table-description">
                                Toggle the status of the
                                <a href="/team-registration" onClick={(e) => {
                                    e.preventDefault(); // Prevent default anchor behavior
                                    navigate('/team-registration'); // Use navigate for SPA routing
                                }}> team registration </a> .
                                Only when 'Open', teams can register or be removed from the teams list (see e.g. 'Teams registered' in the Team Registration tab). The menu-item 'Team Registration' is automatically hidden when the registration is closed.
                            </td>
                            <td className="adminpanel-table-controls">
                            <button onClick={toggleRegistrationStatus}>
                                {isRegistrationOpen ? 'Close registration' : 'Re-open registration'}
                            </button>
                            </td>
                            <td className="adminpanel-table-status">
                                {isRegistrationOpen ? 'Registration is open' : 'Registration is closed'}
                            </td>
                        </tr>
                        <tr>
                            <td className="adminpanel-table-feature">Remove registered team(s)</td>
                            <td className="adminpanel-table-description">Only the admin role can remove teams that are registered. The registration must be open for this (to avoid conflicts when a tournament schedule is already active).</td>
                            <td colspan="2" className="adminpanel-table-controls">
                                {isRegistrationOpen && (<a 
                                    href="/team-registration" 
                                    onClick={(e) => {
                                        e.preventDefault(); // Prevent default anchor behavior
                                        navigate('/team-registration'); // Use navigate for SPA routing
                                    }}
                                >
                                    Click, select 'Teams registered'
                                </a>)}
                            </td>
                            <td className="adminpanel-table-status"></td>
                        </tr>
                        <tr>
                            <td className="adminpanel-table-feature">Clear Schedule</td>
                            <td className="adminpanel-table-description">Deletes any existing game schedule from the database. The schedule can not be recovered, so all fixtures and scores are indefinitely lost when clearing the schedule.</td>
                            <td className="adminpanel-table-controls">
                                <button onClick={handleClearSchedule}>Clear schedule</button>
                            </td>
                            <td className="adminpanel-table-status">
                                {isFixturesInDb ? 'Database currently holds a schedule' : 'No schedule in the database'}
                            </td>
                        </tr>
                        <tr>
                            <td className="adminpanel-table-feature">Activate Tournament</td>
                            <td className="adminpanel-table-description">Makes the Tournamen Home available to users so everybody can see the schedule, update scores, and check the current ranking.</td>
                            <td className="adminpanel-table-controls">
                                <button onClick={toggleTournamentLive}>
                                    {isTournamentLive ? 'Set offline' : 'Set "Live"'}
                                </button>
                            </td>
                            <td className="adminpanel-table-status">
                                {isTournamentLive ? 'Tournament is live' : 'Tournament is offline'}
                            </td>
                        </tr>
                        {/* <tr>
                            <td className="adminpanel-table-feature">Clear Schedule</td>
                            <td className="adminpanel-table-description"></td>
                            <td className="adminpanel-table-controls"></td>
                            <td className="adminpanel-table-status"></td>
                        </tr> */}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default AdminPanel;