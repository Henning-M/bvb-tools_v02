import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setGroups, setRounds, setTeams, setSchedule } from "../redux/slices/kotcScConfigSlice";
import '../styles/KotcScConfiguration.css'

function KotcScConfiguration () {

    // Access state from Redux store
    const groups = useSelector(state => state.kotcScConfig.groups);
    const rounds = useSelector(state => state.kotcScConfig.rounds);
    const teams = useSelector(state => state.kotcScConfig.teams);
    const schedule = useSelector(state => state.kotcScConfig.schedule);

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
                const response = await fetch('http://localhost:5000/teams');
                const data = await response.json();
                dispatch(setTeams(data)); // Dispatch action to update teams
            } catch (error) {
                console.error('Error fetching teams:', error);
            }
        };

        fetchTeams();
    }, [dispatch]);

    // NEW LOGIC - START ///////////////////////////////////////////////////////////////

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

            updatePairings(bestGroups, pairings);
            rounds.push({ round: `R${round}`, groups: bestGroups });
        }

        return rounds;
    };

    // Function to handle schedule creation when button is clicked
    const handleCreateSchedule = () => {
        if (teams.length < 1 || groups < 1 || rounds < 1) {
            alert('Please ensure there are enough teams, groups, and rounds.');
            return;
        }

        const generatedSchedule = generateRounds(teams, groups, rounds);
        dispatch(setSchedule(generatedSchedule)); // Dispatch action to update schedule
    };

    // NEW LOGIC END ////////////////////////////////////////////////////////////////////

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
                className={`kotcscconfiguration-createschedule-button ${schedule.length > 0 ? 'inactive' : ''}`}
                onClick={handleCreateSchedule}>
                Create schedule
            </button>
            <button 
                className={`kotcscconfiguration-submitschedule-button ${schedule.length === 0 ? 'inactive' : ''}`}
                // onClick={handleSubmitSchedule} // Assuming you have a function to handle submit
            >
                Submit schedule
            </button>
            </div>
            <div className="kotcscconfiguration-schedulepreview">
                {schedule.length > 0 && (
                    <p>
                        This is a schedule PREVIEW. Click "Submit schedule" to save.
                    </p> // The schedule can be re-shuffled at will by clicking the "Create schedule" button again. To start playing with this schedule, use the "Submit schedule" button. That will load the schedule into the database and prepare if for entering results etc..
                )}
                {schedule.length > 0 ? (
                    schedule.map((roundObj, roundIndex) => (
                        <div key={roundIndex}>
                            <h3>{`Round ${roundIndex + 1}`}</h3>
                            {roundObj.groups.map((group, groupIndex) => (
                                <div key={groupIndex} className="group">
                                    <h4>{`Group ${groupIndex + 1}`}</h4>
                                    <ul>
                                        {group.map(team => (
                                            <li key={team.id}>{team.name}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    ))
                ) : (
                    <p>No schedule created yet.</p>
                )}
            </div>
        </div>
    );
};

export default KotcScConfiguration;