import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setTeams, selectTeam } from '../redux/slices/teamSlice';
import '../styles/KotcHMyTeam.css'


const KotcHMyTeam = () => {
    const dispatch = useDispatch();
    const teams = useSelector((state) => state.team.teams);
    const selectedTeam = useSelector((state) => state.team.selectedTeam);
    const [fixtures, setFixtures] = useState([]);

    useEffect(() => {
        const fetchTeams = async () => {
            try {
                const response = await fetch('http://backend-dev22.ap-southeast-1.elasticbeanstalk.com/teams');
                const data = await response.json();
                dispatch(setTeams(data));
            } catch (error) {
                console.error('Error fetching teams:', error);
            }
        };

        fetchTeams();
    }, [dispatch]);

    // Fetch fixtures whenever selected team changes
    useEffect(() => {
        const fetchFixtures = async () => {
            try {
                const response = await fetch('http://backend-dev22.ap-southeast-1.elasticbeanstalk.com/fixtures');
                const data = await response.json();
                setFixtures(data);
            } catch (error) {
                console.error('Error fetching fixtures:', error);
            }
        };

        fetchFixtures();
    }, []);

    // Group fixtures by round and group
    const groupedFixtures = {};

    fixtures.forEach(fixture => {
        if (!groupedFixtures[fixture.round]) {
            groupedFixtures[fixture.round] = {};
        }
        
        if (!groupedFixtures[fixture.round][fixture.group]) {
            groupedFixtures[fixture.round][fixture.group] = [];
        }

        groupedFixtures[fixture.round][fixture.group].push(fixture);
    });

    return (
        <div className="kotch-myteam-container">
            <div className='kotch-myteam-teamselect'>
                <h1>Select Your Team</h1>
                <select value={selectedTeam || ''} onChange={(e) => dispatch(selectTeam(e.target.value))}>
                    <option value="" disabled>Select a team</option>
                    {teams.map((team) => (
                        <option key={team.id} value={team.name}>
                            {team.name}
                        </option>
                    ))}
                </select>
            </div>
            <div className='kotch-myteam-aggregate'>
                <p>Fill in total points and total calibrated points for selected team + current rank.</p>
            </div>
            {selectedTeam && (
                <div className="kotch-myteam-body-fixtures-table">
                    {Object.entries(groupedFixtures).map(([round, groups]) => (
                        Object.entries(groups).map(([group, fixtures]) => {
                            // Check if the selected team is in this group
                            const isTeamInGroup = fixtures.some(fixture => {
                                const teamInGroup = teams.find(team => team.id === fixture.team);
                                return teamInGroup?.name === selectedTeam;
                            });

                            // Only show the group if the selected team is in it
                            if (isTeamInGroup) {
                                return (
                                    <div key={`${round}-${group}`}>
                                        <h3>Round {round}</h3>
                                        <h4>Group {group}</h4>
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Team Name</th>
                                                    <th>Points</th>
                                                    <th>Calibrated Points</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {/* Sort teams by points descending */}
                                                {fixtures.sort((a, b) => b.points - a.points).map((fixture, index) => {
                                                    const team = teams.find(team => team.id === fixture.team);
                                                    return (
                                                        <tr key={index} className={team?.name === selectedTeam ? 'kotch-myteam-body-fixtures-table-highlight' : ''}>
                                                            <td>{team?.name}</td>
                                                            <td>{fixture.points}</td>
                                                            <td>{fixture.pointscalibrated}</td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                );
                            }

                            return null;
                        })
                    ))}
                </div>
            )}
        </div>
    );
};

export default KotcHMyTeam;