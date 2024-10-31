import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { setPointsType } from "../redux/slices/kotcHRankingSlice";
import { toggleShowRounds } from "../redux/slices/kotcHRankingSettingSlice";
import '../styles/KotcHRanking.css';

function KotcHRanking() {
    const [teams, setTeams] = useState([]);
    const [rounds, setRounds] = useState([]);
    const [rankingData, setRankingData] = useState([]);
    const dispatch = useDispatch();
    const pointsType = useSelector(state => state.kotcHRanking.pointsType); // Get points type from redux
    const showRounds = useSelector(state => state.kotcHRankingSettings.showRounds); // Get showRounds state from redux

    useEffect(() => {
        const fetchTeams = async () => {
            try {
                const response = await fetch('https://backend-service-255195242316.us-central1.run.app/teams');
                const data = await response.json();
                setTeams(data);
            } catch (error) {
                console.error('Error fetching teams:', error);
            }
        };

        const fetchRounds = async () => {
            try {
                const response = await fetch('https://backend-service-255195242316.us-central1.run.app/fixtures/rounds');
                const data = await response.json();
                setRounds(data);
            } catch (error) {
                console.error('Error fetching rounds:', error);
            }
        };

        fetchTeams();
        fetchRounds();
    }, []);

    useEffect(() => {
        const fetchRankingData = async () => {
            const newRankingData = [];

            for (const team of teams) {
                const teamData = {
                    id: team.id,
                    name: team.name,
                    totalPoints: 0,
                    calibratedPointsTotal: 0,
                    pointsByRound: {},
                    calibratedPointsByRound: {},
                };

                for (let round = 1; round <= rounds.length; round++) {
                    try {
                        const response = await fetch(`https://backend-service-255195242316.us-central1.run.app/fixtures/round/${round}/points`);
                        const data = await response.json();
                        const teamPoints = data.find(p => p.team === team.id)?.points || 0;
                        const teamCalibratedPoints = parseFloat(data.find(p => p.team === team.id)?.pointscalibrated) || 0;

                        teamData.pointsByRound[`points round ${round}`] = teamPoints;
                        teamData.calibratedPointsByRound[`points round ${round}`] = teamCalibratedPoints;
                        teamData.totalPoints += teamPoints;
                        teamData.calibratedPointsTotal += teamCalibratedPoints;
                    } catch (error) {
                        console.error(`Error fetching points for team ${team.id} in round ${round}:`, error);
                    }
                }

                newRankingData.push(teamData);
            }

            // Sort teams by total points in descending order based on points type
            newRankingData.sort((a, b) => {
                if (pointsType === 'calibrated') {
                    return b.calibratedPointsTotal - a.calibratedPointsTotal; // Sort by calibrated points total
                } else {
                    return b.totalPoints - a.totalPoints; // Sort by raw points total
                }
            });

            // Assign ranks based on sorted data
            let currentRank = 1;
            for (let i = 0; i < newRankingData.length; i++) {
                if (i > 0 && (
                    (pointsType === 'calibrated' && newRankingData[i].calibratedPointsTotal === newRankingData[i - 1].calibratedPointsTotal) ||
                    (pointsType === 'raw' && newRankingData[i].totalPoints === newRankingData[i - 1].totalPoints)
                )) {
                    // If current and previous teams have the same score, assign the same rank
                    newRankingData[i].rank = newRankingData[i - 1].rank; 
                } else {
                    newRankingData[i].rank = currentRank; // Assign current rank
                }
                currentRank++; // Increment rank for next iteration
            }

            setRankingData(newRankingData);
        };

        if (teams.length > 0 && rounds.length > 0) {
            fetchRankingData();
        }
    }, [teams, rounds, pointsType]); // Add pointsType to the dependency array

    const handlePointsTypeChange = (e) => {
        dispatch(setPointsType(e.target.value)); // Update points type in redux
    };

    const handleShowRoundsChange = () => {
        dispatch(toggleShowRounds()); // Toggle the show rounds state in redux
    };

    return (
        <div className="kotchranking-container">
            <div className="kotchranking-points-type-container">
                <label>
                    <input
                        type="radio"
                        name="pointsType"
                        value="calibrated"
                        checked={pointsType === 'calibrated'} // Check if calibrated is selected
                        onChange={handlePointsTypeChange}
                    />
                    Calibrated Points
                </label>
                <label>
                    <input
                        type="radio"
                        name="pointsType"
                        value="raw"
                        checked={pointsType === 'raw'} // Check if raw is selected
                        onChange={handlePointsTypeChange}
                    />
                    Raw Points
                </label>
                
                <label>
                    <input
                        type="checkbox"
                        checked={showRounds}
                        onChange={handleShowRoundsChange}
                    />
                    Show rounds
                </label>
            </div>
            <table className="ranking-table">
                <thead>
                    <tr>
                        <th>Rank</th> {/* Changed from Position to Rank */}
                        <th>Team</th>
                        <th>
                            {pointsType === 'calibrated'
                                ? 'Total Points (calibrated)'
                                : 'Total Points'}
                        </th>
                        {showRounds && rounds.map((round, index) => (
                            <th key={index}>
                                {pointsType === 'calibrated' 
                                    ? `Calibrated Points Round ${round.round}` 
                                    : `Raw Points Round ${round.round}`}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rankingData.map((team, index) => (
                        <tr key={team.id}>
                            <td>{team.rank}</td> {/* Display rank instead of index + 1 */}
                            <td>{team.name}</td>
                            <td>
                                {pointsType === 'calibrated'
                                    ? team.calibratedPointsTotal
                                    : team.totalPoints}
                            </td>
                            {showRounds && rounds.map((round, roundIndex) => (
                                <td key={roundIndex}>
                                    {pointsType === 'calibrated'
                                        ? team.calibratedPointsByRound[`points round ${round.round}`] || 0
                                        : team.pointsByRound[`points round ${round.round}`] || 0}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default KotcHRanking;