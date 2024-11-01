import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setGroups, setRounds, setTeams, setSchedule } from "../redux/slices/kotcScConfigSlice";
import { useFeatureToggle } from "../contexts/FeatureToggleContext";
import '../styles/KotcScConfiguration.css'

function KotcScConfiguration () {

    const navigate = useNavigate();

    // Access state from Redux store
    const groups = useSelector(state => state.kotcScConfig.groups);
    const rounds = useSelector(state => state.kotcScConfig.rounds);
    const teams = useSelector(state => state.kotcScConfig.teams);
    const schedule = useSelector(state => state.kotcScConfig.schedule);
    const { isFixturesInDb, setIsFixturesInDb } = useFeatureToggle(); // Use the context
    const [ showCalibrationFactors, setShowCalibrationFactors ] = useState(true);

    // Initialize dispatch
    const dispatch = useDispatch();

    const handleGroupsChange = (e) => {
        const value = Math.max(1, e.target.value); // Ensure the value doesn't go below 1
        dispatch(setGroups(value)); // Dispatch action to update groups
    };

    const handleRoundsChange = (e) => {
        const value = Math.max(1, e.target.value); // Ensure the value doesn't go below 1
        dispatch(setRounds(value)); // Dispatch action to update rounds
    };

    // Fetch teams from the backend using async/await when the component mounts
    useEffect(() => {
        const fetchTeams = async () => {
            try {
                const response = await fetch('https://backend-service-255195242316.us-central1.run.app/teams');
                const data = await response.json();
                dispatch(setTeams(data)); // Dispatch action to update teams
            } catch (error) {
                console.error('Error fetching teams:', error);
            }
        };

        fetchTeams();
    }, [dispatch]);

    // LOGIC TO CREATE SCHEDULE - START ///////////////////////////////////////////////////////////////

    // Function to initialize pairings and group sizes map
    const initializeMaps = (teams, pairings, groupSizes) => {
        teams.forEach((team, i) => {
            teams.slice(i + 1).forEach(otherTeam => {
                pairings.set(`${team.id}-${otherTeam.id}`, 0);
            });
            groupSizes.set(team.id, { smallGroups: 0, largeGroups: 0 });
        });
    };

    // Function to create groups for a round
    const createGroups = (teams, g) => {
        let shuffledTeams = [...teams].sort(() => 0.5 - Math.random());
        let groupSizesArr = [];
    
        // Calculate the base size and remainder
        let baseSize = Math.floor(teams.length / g);
        let remainder = teams.length % g;
    
        // Distribute teams as evenly as possible
        for (let i = 0; i < g; i++) {
            groupSizesArr.push(baseSize + (i < remainder ? 1 : 0));
        }
    
        let groups = Array.from({ length: g }, () => []);
        let index = 0;
    
        shuffledTeams.forEach(team => {
            groups[index].push(team);
            if (groups[index].length === groupSizesArr[index]) index++;
        });
    
        groups = groups.map(group => group.sort((a, b) => a.id - b.id));
    
        return { groups };
    };

    // Function to check if a group was already formed in previous rounds
    const isGroupRepeated = (group, rounds) => {
        const groupKey = group.map(team => team.id).join('-');
        return rounds.some(round =>
            round.groups.some(g => g.map(team => team.id).join('-') === groupKey)
        );
    };

    // Function to update pairings and track new matchups
    const updatePairings = (groups, pairings) => {
        groups.forEach(group => {
            group.forEach((team, i) => {
                group.slice(i + 1).forEach(otherTeam => {
                    const pairKey = `${team.id}-${otherTeam.id}`;
                    if (pairings.has(pairKey)) {
                        pairings.set(pairKey, pairings.get(pairKey) + 1);
                    }
                });
            });
        });
    };

    // Function to update group sizes tracking
    const updateGroupSizes = (groups, groupSizes) => {
        groups.forEach(group => {
            group.forEach(team => {
                const size = group.length;
                if (size <= 2) {
                    groupSizes.get(team.id).smallGroups++;
                } else {
                    groupSizes.get(team.id).largeGroups++;
                }
            });
        });
    };

    // Main logic to generate rounds
    const generateRounds = (teams, g, r) => {
        let rounds = [];
        let pairings = new Map();
        let groupSizes = new Map();

        initializeMaps(teams, pairings, groupSizes);

        for (let round = 1; round <= r; round++) {
            let bestGroups = null;
            let fewestRepeats = Infinity;
            const maxAttempts = 100;

            for (let attempt = 0; attempt < maxAttempts; attempt++) {
                const { groups } = createGroups(teams, g);

                const repeats = groups.reduce((count, group) => {
                    return count + (isGroupRepeated(group, rounds) ? 1 : 0);
                }, 0);

                updateGroupSizes(groups, groupSizes);

                if (repeats < fewestRepeats) {
                    fewestRepeats = repeats;
                    bestGroups = groups;
                }

                if (repeats === 0) break;
            }

            // Determine the size of the largest group after creating groups
            const maxGroupSize = Math.max(...bestGroups.map(group => group.length));

            // Calculate calibration factors for each team in the round
            const roundWithCalibrationFactors = {
                round: `R${round}`,
                groups: bestGroups.map(group => {
                    return group.map(team => {
                        const groupSize = group.length; // Size of the current group
                        const calibrationFactor = parseFloat((groupSize / maxGroupSize).toFixed(4)); // Calculate calibration factor
                        return { ...team, calibrationfactor: calibrationFactor }; // Add calibration factor
                    });
                }),
            };

            rounds.push(roundWithCalibrationFactors);
            updatePairings(bestGroups, pairings);
        }

    return rounds;
};

    // Function to handle schedule creation when button is clicked
    const handleCreateSchedule = async () => {
        if (teams.length < 3 || groups < 2 || rounds < 1) {
            alert('Please ensure there are enough teams, groups, and rounds.');
            return;
        }

        const generatedSchedule = generateRounds(teams, groups, rounds);
        dispatch(setSchedule(generatedSchedule)); // Dispatch action to update schedule
        
        // Clear existing fixtures in the database
        try {
            const response = await fetch('https://backend-service-255195242316.us-central1.run.app/fixtures', {
                method: 'DELETE',
            });
            if(!response.ok) {
                throw new Error('Failed to clear schedule');
            } else {
                setIsFixturesInDb(false); // Since db was just cleared, set this to false
            }
        } catch (error) {
            console.error('Error removing existing fixtures from the database', error);
            alert('An error occurred while clearing old fixtures from the database. Please try again.');
          };        
    };

    // LOGIC END ////////////////////////////////////////////////////////////////////

    // Pass schedule to database (to be used for tournament)
    const handleSubmitSchedule = async () => {
        if (schedule.length === 0) {
          alert('Please create a schedule first.');
          return;
        }
      
        try {
          const response = await fetch('https://backend-service-255195242316.us-central1.run.app/fixtures', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ schedule }),
          });
      
          if (response.ok) {
            alert('Schedule submitted successfully. Navigate to KOTC Tournament to manage fixtures and scores now.');
            setIsFixturesInDb(true); // Set to true after successful submission
            // Optionally, you can redirect the user or update the UI here
          } else {
            throw new Error('Server responded with an error');
          }
        } catch (error) {
          console.error('Error submitting schedule:', error);
          alert('An error occurred while submitting the schedule. Please try again.');
        }
      };

    // const handleClearSchedule = async() => {
    // try {
    //     const response = await fetch('https://backend-service-255195242316.us-central1.run.app/fixtures', {
    //         method: 'DELETE',
    //     });

    //     if (!response.ok) {
    //         throw new Error('Failed to clear schedule');
    //     } else {
    //         alert('Schedule cleared')
    //         setIsFixturesInDb(false); // Reset this when the schedule is cleared
    //     };
    // } catch (error) {
    //     console.error('Error clearing schedule:', error);
    //     alert('There was an error clearing the schedule. Please try again.');
    // }
    // };

    // Function to determine button states
    const getButtonState = (buttonType) => {
        const isScheduleInState = schedule.length > 0;
        switch (buttonType) {
            case 'create':
                return isScheduleInState ? 'visually-inactive' : 'active';
            case 'submit':
                if (!isScheduleInState) return 'inactive';
                return isFixturesInDb ? 'visually-inactive' : 'active';
            case 'clear':
                if (!isScheduleInState && !isFixturesInDb) return 'visually-inactive';
                return isFixturesInDb ? 'active' : 'inactive';
            default:
                return 'active';
        }
    };

    return (
        <div className="kotcscconfiguration-container">
            <div className="kotcscconfiguration-input-group">
            <label htmlFor="groups">Groups (Courts):</label>
            <input
                type="number"
                id="groups"
                value={groups}
                onChange={handleGroupsChange}
                min="1"
            />
            </div>
            <div className="kotcscconfiguration-input-group">
                <label htmlFor="rounds">Rounds:</label>
                <input
                    type="number"
                    id="rounds"
                    value={rounds}
                    onChange={handleRoundsChange}
                    min="1"
                />
            </div>
            <div className="kotcscconfiguration-info">
                <p>Number of participating teams: {teams.length}</p>
            </div>
            <div className="kotcscconfiguration-buttons">
            <button 
                className={`kotcscconfiguration-createschedule-button ${getButtonState('create') === 'visually-inactive' ? 'visually-inactive' : ''}`}
                onClick={handleCreateSchedule}>
                Create a schedule
            </button>
            <button 
                className={`kotcscconfiguration-submitschedule-button ${getButtonState('submit') === 'inactive' ? 'inactive' : ''}`}
                onClick={handleSubmitSchedule}>
                Submit this schedule
            </button>
            {/* <button 
                className={`kotcscconfiguration-clearschedule-button ${getButtonState('clear') === 'visually-inactive' ? 'visually-inactive' : ''}`}
                onClick={handleClearSchedule}>
                Clear schedule
            </button> */}
            </div>
            <div className="kotcscconfiguration-schedulepreview">
            {schedule.length > 0 && (
                <ul>
                    <li>This is a schedule PREVIEW</li>
                    <li>Click "Create a schedule" again to re-shuffle</li>
                    <li>"Submit this schedule" to save the schedule to the database</li>
                    {/* <li>"Clear schedule" deletes a saved schedule from the database</li> */}
                    <li>Once a schedule was submitted, it is saved in the database and <br />
                        you can start your tournament by 'Activating' the Tournament from the <br />
                        Admin panel and navigating to 'Tournament Home'</li>
                    <li>Multiplying scored points of a team with the 'Calibration Factor' <br />
                        calibrates points for differences in group size (read more about <br />
                        calibrated points in the respective section in
                        <a href="/about" onClick={(e) => {
                                    e.preventDefault(); // Prevent default anchor behavior
                                    navigate('/about'); // Use navigate for SPA routing
                        }}> About</a>
                        </li>
                </ul>
            )}
            <div className="kotcscconfiguration-schedule-controls">
                <label>
                    <input
                        type="checkbox"
                        checked={showCalibrationFactors}
                        onChange={() => setShowCalibrationFactors(!showCalibrationFactors)} // Toggle function
                    />
                    Display Calibration Factors
                </label>
            </div>
            {schedule.length > 0 ? (
                <table className="kotcscconfiguration-schedule-table">
                    <tbody>
                        {schedule.map((roundObj, roundIndex) => (
                        <React.Fragment key={roundIndex}>
                            {/* Round Header */}
                            <tr>
                                <td colSpan={roundObj.groups.length}>{`Round ${roundIndex + 1}`}</td>
                            </tr>
                            {/* Group Headers */}
                            <tr>
                                {roundObj.groups.map((_, groupIndex) => (
                                    <th key={groupIndex}>
                                        {`Group ${groupIndex + 1}`}
                                        {showCalibrationFactors && (
                                            <React.Fragment>
                                                <br />
                                                <span className="kotcscconfiguration-schedule-calibrationfactors">{`Calibration Factor ${roundObj.groups[groupIndex][0].calibrationfactor}`}</span>
                                            </React.Fragment>
                                        )}
                                    </th>
                                ))}
                            </tr>
                            {/* Teams */}
                            {Array.from({ length: Math.max(...roundObj.groups.map(group => group.length)) }).map((_, teamIndex) => (
                                <tr key={teamIndex}>
                                    {roundObj.groups.map((group, groupIndex) => (
                                        <td key={groupIndex}>
                                            {group[teamIndex] ? group[teamIndex].name : ''}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </React.Fragment>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No schedule created yet.</p>
            )}
        </div>
    </div>
    );
};

export default KotcScConfiguration;