import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { setPoints } from '../redux/slices/kotcHFScoreEntrySlice';
import '../styles/KotcHFScoreEntry.css';

function KotcHFScoreEntry({ selectedIndex }) {
    const [fixtures, setFixtures] = useState([]);
    const [acceptingInput, setAcceptingInput] = useState(true);
    const pointsFromRedux = useSelector(state => state.kotcHFScoreEntry.points) || {}; // Get points from Redux with default value
    const [submittedPoints, setSubmittedPoints] = useState({}); // State to hold submitted points from the database
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.user);

    const handlePointsChange = (teamId, value) => {
        dispatch(setPoints({ teamId, round: selectedIndex + 1, value })); // Dispatch the action to update points in Redux
    };

    useEffect(() => {
        const fetchFixtures = async () => {
            try {
                const response = await fetch(`https://d3ix2aoqy9cq9s.cloudfront.net/fixtures/round/${selectedIndex + 1}`);
                const data = await response.json();
                setFixtures(data);
                fetchSubmittedPoints(data); // Fetch submitted points after fetching fixtures
                fetchAcceptingInput(); // Fetch acceptingInput state
            } catch (error) {
                console.error('Error fetching fixtures:', error);
            }
        };

        const fetchSubmittedPoints = async (fixturesData) => {
            try {
                const response = await fetch(`https://d3ix2aoqy9cq9s.cloudfront.net/fixtures/round/${selectedIndex + 1}/points`);
                const data = await response.json();
                const pointsMap = fixturesData.reduce((acc, fixture) => {
                    acc[fixture.team_id] = data.find(p => p.team === fixture.team_id)?.points || 0;
                    return acc;
                }, {});
                setSubmittedPoints(pointsMap);
            } catch (error) {
                console.error('Error fetching submitted points:', error);
            }
        };

        const fetchAcceptingInput = async () => {
            try {
                const response = await fetch(`https://d3ix2aoqy9cq9s.cloudfront.net/fixtures/round/${selectedIndex + 1}/acceptingInput`);
                const data = await response.json();
                setAcceptingInput(data.acceptingInput); // Update the acceptingInput state
            } catch (error) {
                console.error('Error fetching acceptingInput state:', error);
            }
        };

        fetchFixtures();
    }, [selectedIndex]);

    const submitPointsForTeamInRound = async (teamId) => {
        const pointsValue = pointsFromRedux[selectedIndex + 1]?.[teamId] || 0; // Get the points value from the Redux state
        const fixtureData = fixtures.find(fixture => fixture.team_id === teamId); // Find the fixture for the team in the current round

        if (!fixtureData) {
            alert('Fixture not found for the selected team.');
            return;
        };

        const calibrationFactor = parseFloat(fixtureData.calibrationfactor); // Get the calibration factor as a float
        const calibratedPointsValue = (pointsValue * calibrationFactor).toFixed(4); // Calculate calibrated points value


        try {
            const response = await fetch(`https://d3ix2aoqy9cq9s.cloudfront.net/fixtures/round/${selectedIndex + 1}/team/${teamId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ points: pointsValue, pointsCalibrated: calibratedPointsValue }), // Send both points and calibrated points
            });

            if (response.ok) {
                // alert('Points updated successfully');
                setSubmittedPoints(prevSubmittedPoints => ({
                    ...prevSubmittedPoints,
                    [teamId]: pointsValue, // Update submitted points in the state
                }));
                // Clear the input field for this team in Redux
                dispatch(setPoints({ teamId, round: selectedIndex + 1, value: '' })); // Reset the input value in Redux
            } else {
                throw new Error('Server responded with an error');
            }
        } catch (error) {
            console.error('Error updating points:', error);
            alert('An error occurred while updating points. Please try again.');
        }
    };

    const handleCloseRound = async () => {
        try {
            const response = await fetch(`https://d3ix2aoqy9cq9s.cloudfront.net/fixtures/round/${selectedIndex + 1}/acceptingInput`, {
                method: 'PUT',
            });

            if (response.ok) {
                setAcceptingInput(prevState => !prevState); // Toggle the acceptingInput state
            } else {
                throw new Error('Server responded with an error');
            }
        } catch (error) {
            console.error('Error toggling acceptingInput state:', error);
            alert('An error occurred while toggling the round state. Please try again.');
        }
    };

    return (
        <div className="kotchfscoreentry-container">
        <div className="kotchfscoreentry-roundbody">
            <table className="kotchfscoreentry-roundbody-table">
            <thead>
                <tr>
                    <th>Group</th>
                    <th>Teams</th>
                    <th>Submit points</th>
                    <th>Points submitted for this round</th>
                </tr>
            </thead>
            <tbody>
                {fixtures.map((fixture, index) => {
                    const isLastInGroup = index === fixtures.length - 1 || fixtures[index + 1].group !== fixture.group;

                    return (
                        <tr key={index} className={isLastInGroup ? 'last-row' : ''}>
                            {index === 0 || fixtures[index - 1].group !== fixture.group ? (
                                <td rowSpan={fixtures.filter(f => f.group === fixture.group).length}>
                                    {fixture.group}
                                </td>
                            ) : null}
                            <td>{fixture.team}</td>
                            <td>
                                <input
                                    type="number"
                                    min="0"
                                    placeholder=""
                                    value={pointsFromRedux[selectedIndex + 1]?.[fixture.team_id] || ''} // Controlled input from Redux state
                                    onChange={(e) => handlePointsChange(fixture.team_id, e.target.value)} // Update points in Redux
                                />
                                <button
                                    className={`kotchfscoreentry-roundbody-table-button ${!acceptingInput ? 'disabled' : ''}`}
                                    onClick={() => submitPointsForTeamInRound(fixture.team_id)} // Pass teamId to the submit function
                                    disabled={!acceptingInput} // Disable button based on acceptingInput state
                                >
                                    Submit
                                </button>
                            </td>
                            <td>
                            {submittedPoints[fixture.team_id] || 0}
                            </td>
                        </tr>
                    );
                })}
                {user && user.isadmin && (
                    <tr>
                        <td colSpan={4}>
                            <button
                                className="kotchfscoreentry-roundbody-table-button"
                                onClick={handleCloseRound}
                            >
                                {acceptingInput ? 'Close round' : 'Re-open round'}
                            </button>
                        </td>
                    </tr>
                )}
            </tbody>
            </table>
        </div>
        </div>
    );
}

export default KotcHFScoreEntry;