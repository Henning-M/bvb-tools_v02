import React, { useState, useEffect } from "react";
import '../styles/KotcHRanking.css';

function KotcHRanking() {
    const [teams, setTeams] = useState([]);
    const [rounds, setRounds] = useState([]);
    const [rankingData, setRankingData] = useState([]);

    useEffect(() => {
        const fetchTeams = async () => {
            try {
                const response = await fetch('http://localhost:5000/teams');
                const data = await response.json();
                setTeams(data);
            } catch (error) {
                console.error('Error fetching teams:', error);
            }
        };

        const fetchRounds = async () => {
            try {
                const response = await fetch('http://localhost:5000/fixtures/rounds');
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
                    pointsByRound: {},
                };

                for (let round = 1; round <= rounds.length; round++) {
                    try {
                        const response = await fetch(`http://localhost:5000/fixtures/round/${round}/points`);
                        const data = await response.json();
                        const teamPoints = data.find(p => p.team === team.id)?.points || 0;

                        teamData.pointsByRound[`points round ${round}`] = teamPoints;
                        teamData.totalPoints += teamPoints; // Sum total points
                    } catch (error) {
                        console.error(`Error fetching points for team ${team.id} in round ${round}:`, error);
                    }
                }

                newRankingData.push(teamData);
            }

            // Sort teams by total points in descending order
            newRankingData.sort((a, b) => b.totalPoints - a.totalPoints);
            setRankingData(newRankingData);
        };

        if (teams.length > 0 && rounds.length > 0) {
            fetchRankingData();
        }
    }, [teams, rounds]);

    return (
        <div className="kotchranking-container">
            <h1>KOTC Ranking</h1>
            <table className="ranking-table">
                <thead>
                    <tr>
                        <th>Position</th>
                        <th>Team</th>
                        <th>Total Points</th>
                        {rounds.map((round, index) => (
                            <th key={index}>Points Round {round.round}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rankingData.map((team, index) => (
                        <tr key={team.id}>
                            <td>{index + 1}</td>
                            <td>{team.name}</td>
                            <td>{team.totalPoints}</td>
                            {rounds.map((round, roundIndex) => (
                                <td key={roundIndex}>{team.pointsByRound[`points round ${round.round}`] || 0}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default KotcHRanking;